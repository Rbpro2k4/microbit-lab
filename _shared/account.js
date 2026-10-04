/* micro:bit Lab: accounts. Talks to the server (/api), remembers who is logged in on this computer,
   saves lesson progress, and provides the Group window. Used by the home page, the lessons and the dashboard. */
(function () {
  "use strict";
  const KEY = "mblab:auth";
  const API = "/api";
  const SAVE_DELAY = 1200;

  /* ---------------- helpers ---------------- */
  function h(html) { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  const firstName = name => String(name || "").split(" ")[0];
  const ic = (name, cls) => (window.MBIcon ? window.MBIcon(name, cls) : "");
  /** "eb7 14", "EB7014", "eb7-014" -> "EB7-014" */
  function normalizeId(raw) {
    const s = String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const m = s.match(/^(EB7|EB8|EB9|SEC)(\d{1,4})$/);
    return m ? `${m[1]}-${m[2].padStart(3, "0")}` : "";
  }

  /* ---------------- who is logged in (this computer) ---------------- */
  function loadAuth() {
    try {
      const a = JSON.parse(localStorage.getItem(KEY));
      if (a && a.token && new Date(a.expiresAt) > new Date()) return a;
    } catch (e) { /* storage blocked */ }
    return null;
  }
  let auth = loadAuth();
  function setAuth(a) {
    auth = a;
    try { a ? localStorage.setItem(KEY, JSON.stringify(a)) : localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  }

  /* ---------------- server calls ---------------- */
  class ApiError extends Error {}
  async function call(path, { method = "GET", body, timeout = 15000, keepalive = false } = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    let res;
    try {
      const headers = {};
      if (body !== undefined) headers["content-type"] = "application/json";
      if (auth) headers.authorization = "Bearer " + auth.token;
      res = await fetch(API + path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined, signal: ctrl.signal, keepalive, cache: "no-store" });
    } catch (e) {
      const err = new ApiError("Can't reach the server. Check the internet connection, then try again.");
      err.offline = true;
      throw err;
    } finally { clearTimeout(timer); }
    let data = {};
    try { data = await res.json(); } catch (e) { /* not JSON */ }
    if (!res.ok) {
      if (res.status === 401 && auth && !path.endsWith("/login")) setAuth(null); // session expired
      const err = new ApiError(data.error || `Something went wrong (error ${res.status}).`);
      err.status = res.status;
      err.offline = res.status === 404 && !data.error; // no server behind /api (e.g. opened from a folder)
      throw err;
    }
    return data;
  }
  function remember(data) {
    setAuth({ token: data.token, expiresAt: data.expiresAt, role: data.role, user: data.user });
    return data;
  }

  /* ---------------- progress saving ---------------- */
  const saver = { lesson: null, data: null, summary: null, timer: null, inflight: false, dirty: false, state: "saved", listeners: [] };
  function setSaveState(s, detail) { saver.state = s; saver.listeners.forEach(fn => fn(s, detail)); }
  function queueSave(lesson, data, summary) {
    saver.lesson = lesson; saver.data = data; saver.summary = summary; saver.dirty = true;
    try { localStorage.setItem(pendingKey(lesson), JSON.stringify({ data, summary, at: Date.now() })); } catch (e) { /* ignore */ }
    setSaveState("pending");
    clearTimeout(saver.timer);
    saver.timer = setTimeout(flush, SAVE_DELAY);
  }
  const pendingKey = lesson => `mblab:pending:${auth && auth.user ? auth.user.id : "?"}:${lesson}`;
  async function flush(keepalive = false) {
    clearTimeout(saver.timer);
    if (!saver.dirty || !auth || auth.role !== "student") return;
    if (saver.inflight && !keepalive) { saver.timer = setTimeout(flush, 800); return; }
    saver.inflight = true; saver.dirty = false;
    const lesson = saver.lesson;
    setSaveState("saving");
    try {
      const r = await call("/progress", { method: "PUT", body: { lesson, data: saver.data, summary: saver.summary }, keepalive });
      if (!saver.dirty) { try { localStorage.removeItem(pendingKey(lesson)); } catch (e) { /* ignore */ } }
      setSaveState(saver.dirty ? "pending" : "saved", r);
    } catch (e) {
      saver.dirty = true;
      setSaveState(e.status === 401 ? "loggedout" : "error", e);
      if (e.status !== 401) saver.timer = setTimeout(flush, 8000); // try again
    } finally { saver.inflight = false; }
  }
  window.addEventListener("pagehide", () => { if (saver.dirty) flush(true); });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && saver.dirty) flush(true); });

  /** Progress saved on this computer that never reached the server (e.g. the internet dropped). */
  function pendingProgress(lesson) {
    try { return JSON.parse(localStorage.getItem(pendingKey(lesson))); } catch (e) { return null; }
  }

  /* ---------------- lesson start ---------------- */
  /** Decides how a lesson page runs. Returns { mode: "student" | "teacher" | "offline" | "redirect" | "wrong-track", ... } */
  async function bootLesson(L) {
    const home = lessonHome();
    if (!auth) {
      try { await call("/status", { timeout: 8000 }); }
      catch (e) { return { mode: "offline", reason: e.message }; }
      location.replace(home + "?next=" + encodeURIComponent(location.pathname));
      return { mode: "redirect" };
    }
    if (auth.role === "teacher") {
      try { await call("/me", { timeout: 8000 }); return { mode: "teacher" }; }
      catch (e) {
        if (e.offline || e.status >= 500) return { mode: "teacher" };
        location.replace(home + "?next=" + encodeURIComponent(location.pathname));
        return { mode: "redirect" };
      }
    }
    try {
      const [me, p] = await Promise.all([call("/me"), call("/progress?lesson=" + encodeURIComponent(L.id))]);
      setAuth(Object.assign({}, auth, { user: me.user }));
      if (me.user.track !== L.track) return { mode: "wrong-track", user: me.user };
      let data = p.data, recovered = false;
      const pend = pendingProgress(L.id);
      if (pend && pend.data && (!p.updatedAt || pend.at > new Date(p.updatedAt).getTime())) { data = pend.data; recovered = true; }
      return { mode: "student", user: me.user, group: me.group, data: data || {}, recovered, pendingSummary: recovered ? pend.summary : null };
    } catch (e) {
      if (e.offline || e.status >= 500) {
        const pend = pendingProgress(L.id);
        return { mode: "student", offline: true, user: auth.user, group: [], data: (pend && pend.data) || {}, recovered: !!pend };
      }
      location.replace(home + "?next=" + encodeURIComponent(location.pathname));
      return { mode: "redirect" };
    }
  }
  function lessonHome() {
    const s = document.querySelector('script[src$="account.js"]');
    return s ? new URL("../index.html", s.src).pathname.replace(/index\.html$/, "") : "/";
  }

  /* ---------------- Group window ---------------- */
  /** Opens the Group window. onDone(group) is called with the new list of teammates. */
  function openGroupManager(onDone) {
    if (!auth || auth.role !== "student") return;
    const me = auth.user;
    let team = [];
    const m = h(`
      <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="grp-title">
        <div class="modal">
          <h2 id="grp-title">${ic("users")} Your group</h2>
          <p class="lead">Working together on this computer? Add your teammates' IDs. Everything your group does is saved to <b>everyone's</b> account.</p>
          <div class="grp-list"></div>
          <form class="grp-add row" autocomplete="off">
            <label class="field" style="flex:1;min-width:160px">Teammate's ID<input name="mate" placeholder="e.g. ${esc(me.id.slice(0, 4))}014" maxlength="12"></label>
            <button type="submit" class="btn primary" style="align-self:flex-end">${ic("plus")} Add</button>
          </form>
          <p class="grp-msg feedback"></p>
          <div class="row" style="margin-top:14px"><button type="button" class="btn primary" data-act="done">Done</button></div>
        </div>
      </div>`);
    document.body.appendChild(m);
    const list = m.querySelector(".grp-list"), msg = m.querySelector(".grp-msg"), input = m.querySelector("input");
    const show = (text, kind) => { msg.className = "grp-msg feedback show " + kind; msg.textContent = text; };
    function draw() {
      list.innerHTML = [`<div class="grp-row me"><span class="avatar">${esc(firstName(me.name)[0] || "?")}</span><b>${esc(me.name)}</b><span class="id">${esc(me.id)}</span><span class="tag-you">you</span></div>`]
        .concat(team.map(t => `<div class="grp-row"><span class="avatar">${esc(firstName(t.name)[0] || "?")}</span><b>${esc(t.name)}</b><span class="id">${esc(t.id)}</span><button type="button" class="btn small ghost" data-rm="${esc(t.id)}" aria-label="Remove ${esc(t.name)}">${ic("x")}</button></div>`)).join("");
      list.querySelectorAll("[data-rm]").forEach(b => b.onclick = () => save(team.filter(t => t.id !== b.dataset.rm).map(t => t.id)));
    }
    async function save(ids) {
      try { const r = await call("/group", { method: "POST", body: { ids } }); team = r.group; draw(); msg.className = "grp-msg feedback"; return true; }
      catch (e) { show(e.message, "bad"); return false; }
    }
    m.querySelector("form").onsubmit = async e => {
      e.preventDefault();
      const id = normalizeId(input.value);
      if (!id) return show("IDs look like EB7-014. Check the ID on your teammate's worksheet.", "bad");
      if (id === me.id) return show("That's your own ID!", "bad");
      if (team.some(t => t.id === id)) return show("Already in your group.", "info");
      if (await save(team.map(t => t.id).concat(id))) { input.value = ""; show(`Added ${team[team.length - 1].name}.`, "ok"); }
      input.focus();
    };
    const close = () => { m.remove(); if (onDone) onDone(team); };
    m.querySelector('[data-act="done"]').onclick = close;
    m.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    call("/group").then(r => { team = r.group; draw(); }).catch(e => show(e.message, "bad"));
    draw();
    setTimeout(() => input.focus(), 50);
  }

  /* ---------------- public API ---------------- */
  window.MBAccount = {
    get auth() { return auth; },
    get user() { return auth && auth.user; },
    get role() { return auth && auth.role; },
    normalizeId, firstName, esc,
    status: () => call("/status", { timeout: 10000 }),
    login: (id, password) => call("/login", { method: "POST", body: { id: normalizeId(id) || id, password } }).then(remember),
    signup: (name, cls, password) => call("/signup", { method: "POST", body: { name, class: cls, password } }).then(remember),
    teacherLogin: password => call("/teacher/login", { method: "POST", body: { password } }).then(remember),
    async logout() { await flush(); try { await call("/logout", { method: "POST" }); } catch (e) { /* ignore */ } setAuth(null); },
    me: () => call("/me"),
    progressList: () => call("/progress"),
    queueSave, flush, onSaveState(fn) { saver.listeners.push(fn); },
    bootLesson, openGroupManager,
    teacher: {
      overview: cls => call("/teacher/overview" + (cls ? "?class=" + encodeURIComponent(cls) : "")),
      progress: (id, lesson) => call(`/teacher/progress?student=${encodeURIComponent(id)}&lesson=${encodeURIComponent(lesson)}`),
      signup: minutes => call("/teacher/signup", { method: "POST", body: { minutes } }),
      addStudent: (name, cls, password) => call("/teacher/students/add", { method: "POST", body: { name, class: cls, password } }),
      updateStudent: (id, name, cls) => call("/teacher/students/update", { method: "POST", body: { id, name, class: cls } }),
      setPassword: (id, password) => call("/teacher/students/password", { method: "POST", body: { id, password } }),
      deleteStudent: id => call("/teacher/students/delete", { method: "POST", body: { id } }),
      clearLesson: (id, lesson) => call("/teacher/students/clear", { method: "POST", body: { id, lesson } }),
      logoutStudents: () => call("/teacher/logout-students", { method: "POST" })
    }
  };
})();
