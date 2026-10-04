/* micro:bit Lab: lesson engine.
   Each lesson page defines window.LESSON = {...} and loads minibit.js, diagram.js, account.js and this file.
   Students log in on the home page: their progress is saved to their account (and their group's).
   The teacher login shows every answer and solution. If the server can't be reached, work is kept on this computer. */
(async function () {
  "use strict";
  const L = window.LESSON;
  if (!L) { document.body.textContent = "LESSON data missing."; return; }
  const ACC = window.MBAccount;
  const I = (name, cls) => (window.MBIcon ? window.MBIcon(name, cls) : ""); // Lucide icon as an <svg> string
  const { ICONS, toMatrix, ledThumb } = window.MiniBitUtil;
  document.body.classList.add("track-" + L.track);

  /* ---------------- who is working? ---------------- */
  const loader = document.createElement("div");
  loader.className = "page-loading";
  loader.innerHTML = '<span class="spinner"></span> Loading your lesson…';
  document.body.appendChild(loader);
  const session = ACC ? await ACC.bootLesson(L) : { mode: "offline" };
  loader.remove();
  if (session.mode === "redirect") return;
  if (session.mode === "wrong-track") {
    const other = L.track === "A" ? "Track A (EB7 – EB8)" : "Track B (EB9 – Second)";
    document.body.innerHTML = `<main class="portal"><section class="card id-card"><div class="big-ic">${I("compass")}</div><h2>This lesson is for ${other}</h2><p>Your class, ${session.user.class}, has its own lessons.</p><a class="btn primary big" href="${(L.portal || "../../index.html")}">Go to my lessons</a></section></main>`;
    return;
  }
  const TEACHER = session.mode === "teacher";
  const STUDENT = session.mode === "student" ? session.user : null;
  const KEY = "mblab:v1:" + (STUDENT ? STUDENT.id : TEACHER ? "teacher" : "local") + ":" + L.id;
  const GKEY = "mblab:v1:roles:" + (STUDENT ? STUDENT.id : "local");

  /* ---------------- helpers ---------------- */
  let onStoreChange = null; // set once the progress counters exist
  const store = {
    data: STUDENT ? (session.data || {}) : (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })(),
    get(k, d) { return Object.prototype.hasOwnProperty.call(this.data, k) ? this.data[k] : d; },
    set(k, v) { this.data[k] = v; persist(); },
    reset() { this.data = {}; persist(); }
  };
  function persist() {
    if (STUDENT) { if (onStoreChange) onStoreChange(); return; } // saved to the account
    try { localStorage.setItem(KEY, JSON.stringify(store.data)); } catch (e) { /* storage blocked */ }
  }
  function h(html) { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function rich(s) {
    if (!s) return "";
    return String(s).replace(/\{\{([^}|]+)(?:\|([^}]+))?\}\}/g, (m, shown, term) => `<button type="button" class="term" data-term="${esc(term || shown)}">${shown}</button>`);
  }
  function fmtTime(ms) { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }
  const LETTERS = "ABCDEFGH";

  /* ---------------- sound ---------------- */
  let actx = null;
  function tones(seq, type = "square") {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      let t = actx.currentTime + 0.02;
      seq.forEach(([f, ms]) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + ms / 1000 + 0.02);
        t += ms / 1000;
      });
    } catch (e) { /* audio not available */ }
  }
  const SOUNDS = {
    happy: [[523, 110], [659, 110], [784, 180]], sad: [[440, 200], [370, 200], [294, 320]],
    giggle: [[784, 70], [988, 70], [784, 70], [988, 70], [1175, 120]], yawn: [[392, 300], [330, 300], [262, 420]],
    surprised: [[330, 90], [880, 220]], chime: [[880, 120], [1175, 220]], ok: [[660, 80], [990, 140]]
  };

  /* ---------------- toasts ---------------- */
  const toastWrap = h(`<div class="toast-wrap" aria-live="polite"></div>`);
  function toast(msg, ms = 2600, icon) {
    const t = h(`<div class="toast">${icon ? I(icon) : ""}<span></span></div>`);
    t.querySelector("span").textContent = msg; toastWrap.appendChild(t);
    setTimeout(() => t.remove(), ms);
  }
  /** Gives tip and warning boxes written in lesson text their icon. */
  function decorate(root) {
    root.querySelectorAll(".tip, .warn").forEach(el => {
      if (el.querySelector(":scope > svg.ic")) return;
      el.innerHTML = I(el.classList.contains("warn") ? "triangle-alert" : "lightbulb") + "<div>" + el.innerHTML + "</div>";
    });
  }

  /* ---------------- MakeCode block renderer ---------------- */
  const MC = (() => {
    const ORIGIN = "https://makecode.microbit.org";
    let frame = null, ready = false, dead = false, n = 0;
    const queue = [], pending = new Map();
    function ensure() {
      if (frame) return;
      frame = document.createElement("iframe");
      frame.src = ORIGIN + "/--docs?render=1&lang=en";
      frame.title = "MakeCode block renderer";
      frame.setAttribute("aria-hidden", "true");
      frame.tabIndex = -1;
      frame.style.cssText = "position:absolute;left:-10000px;top:0;width:1000px;height:700px;border:0;";
      window.addEventListener("message", ev => {
        const m = ev.data;
        if (!m || m.source !== "makecode") return;
        if (m.type === "renderready") { ready = true; while (queue.length) post(queue.shift()); }
        else if (m.type === "renderblocks") { const cb = pending.get(m.id); if (cb) { pending.delete(m.id); cb(m); } }
      });
      document.body.appendChild(frame);
      setTimeout(() => {
        if (!ready) { dead = true; queue.length = 0; pending.forEach(cb => cb({ error: "offline" })); pending.clear(); }
      }, 25000);
    }
    function post(req) { frame.contentWindow.postMessage({ type: "renderblocks", id: req.id, code: req.code, options: req.options }, ORIGIN); }
    function render(code, options) {
      return new Promise(resolve => {
        ensure();
        if (dead) { resolve({ error: "offline" }); return; }
        const req = { id: "mb" + (++n), code, options: options || {} };
        pending.set(req.id, resolve);
        if (ready) post(req); else queue.push(req);
      });
    }
    return { render };
  })();

  function pre(code) { const p = document.createElement("pre"); p.className = "code"; p.textContent = code; return p; }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    ta.remove(); return Promise.resolve();
  }
  function addCopy(bar, getCode) {
    const b = h(`<button type="button" class="btn small ghost">${I("copy")} Copy</button>`);
    b.onclick = () => copyText(typeof getCode === "function" ? getCode() : getCode).then(() => toast("Copied!"));
    bar.appendChild(b);
  }

  /** Code panel. lang: "blocks" (MakeCode JS rendered as blocks) or "python". */
  function codePanel(code, opt = {}) {
    const lang = opt.lang || "blocks";
    const box = h(`<div class="code-panel"><div class="bar"><span>${lang === "python" ? I("terminal") + " Python" : I("puzzle") + " MakeCode blocks"}</span>${opt.label ? `<span>· ${esc(opt.label)}</span>` : ""}<span class="spacer"></span></div><div class="cp-body"></div></div>`);
    const bar = box.querySelector(".bar"), body = box.querySelector(".cp-body");
    let current = code;
    if (lang === "python") {
      const p = pre(code); body.appendChild(p);
      addCopy(bar, () => current);
      box.update = c => { current = c; p.textContent = c; };
      return box;
    }
    const blocks = h(`<div class="blocks"><div class="loading"><span class="spinner"></span> Loading blocks…</div></div>`);
    const js = pre(code); js.hidden = true;
    body.appendChild(blocks); body.appendChild(js);
    const tgl = h(`<button type="button" class="btn small ghost" title="Show the same code as JavaScript">${I("code")} JavaScript</button>`);
    tgl.onclick = () => { js.hidden = !js.hidden; tgl.classList.toggle("primary", !js.hidden); };
    bar.appendChild(tgl);
    if (TEACHER || opt.copy) addCopy(bar, () => current);
    let token = 0;
    function draw(c) {
      const my = ++token;
      MC.render(c, opt.options).then(m => {
        if (my !== token) return;
        if (m && (m.uri || m.svg)) {
          const img = new Image();
          img.alt = "MakeCode blocks";
          img.src = m.uri || ("data:image/svg+xml;charset=utf-8," + encodeURIComponent(m.svg));
          if (m.width) { img.style.width = Math.round(m.width * (opt.scale || 0.9)) + "px"; }
          blocks.replaceChildren(img);
        } else {
          blocks.replaceChildren(h(`<div class="loading">${I("wifi-off")} Blocks need an internet connection. Here is the same code as JavaScript: paste it into MakeCode's JavaScript tab, then switch back to Blocks.</div>`));
          js.hidden = false; tgl.classList.add("primary");
        }
      });
    }
    // Render only when the panel comes near the screen: long lessons have many code panels.
    let visible = false;
    box.update = c => { current = c; js.textContent = c; if (visible) draw(c); };
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { visible = true; io.disconnect(); draw(current); }
    }, { rootMargin: "600px 0px" });
    io.observe(box);
    return box;
  }

  /* ---------------- glossary popovers ---------------- */
  const glossSec = (L.sections || []).find(s => s.type === "glossary");
  const GLOSS = {};
  (glossSec ? glossSec.terms : []).forEach(t => { GLOSS[t.term.toLowerCase()] = t; });
  let pop = null;
  document.addEventListener("click", e => {
    const t = e.target.closest(".term");
    if (pop) { pop.remove(); pop = null; }
    if (!t) return;
    const g = GLOSS[t.dataset.term.toLowerCase()];
    if (!g) return;
    pop = h(`<div class="popover" role="tooltip"><b>${esc(g.term)}</b>${esc(g.def)}</div>`);
    document.body.appendChild(pop);
    const r = t.getBoundingClientRect();
    pop.style.left = Math.max(8, Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - 296)) + "px";
    pop.style.top = (window.scrollY + r.bottom + 8) + "px";
  });

  /* ---------------- group roles ---------------- */
  const ROLE = {
    driver: { ico: "mouse-pointer-click", name: "Driver", desc: "Uses the mouse and keyboard to build the code." },
    navigator: { ico: "compass", name: "Navigator", desc: "Reads the steps out loud and helps the driver spot mistakes." },
    hardware: { ico: "plug", name: "Hardware boss", desc: "Looks after the micro:bit, cable and battery pack. Downloads and tests on the real micro:bit." },
    reporter: { ico: "notebook-pen", name: "Reporter", desc: "Ticks off the steps, fills in the worksheet and is the only one who calls the teacher." },
    tester: { ico: "flask-conical", name: "Tester", desc: "Tries the program and looks for bugs." }
  };
  const ROTATE_MS = (L.rotateMinutes || 12) * 60000;
  function loadGroup() { try { return JSON.parse(localStorage.getItem(GKEY)) || null; } catch (e) { return null; } }
  function saveGroup() { try { localStorage.setItem(GKEY, JSON.stringify(group)); } catch (e) { /* ignore */ } }
  let group = loadGroup();
  if (STUDENT) {
    const fresh = !group || !group.savedAt || Date.now() - group.savedAt > 90 * 60000;
    group = fresh ? { rot: 0, rotateAt: Date.now() + ROTATE_MS, savedAt: Date.now(), askedGroup: false } : group;
    group.names = [STUDENT].concat(session.group || []).map(u => ACC.firstName(u.name));
    saveGroup();
  }
  function assignments() {
    const names = (group && group.names ? group.names : []).filter(Boolean);
    const n = names.length, rot = group ? group.rot || 0 : 0;
    const o = names.map((_, i) => names[(i + rot) % n]);
    const A = (role, who) => ({ role: ROLE[role], who: who || "" });
    if (n === 0) return [A("driver"), A("navigator"), A("hardware"), A("reporter")];
    if (n === 1) return [A("driver", o[0]), A("navigator", o[0]), A("hardware", o[0]), A("reporter", o[0])];
    if (n === 2) return [A("driver", o[0]), A("navigator", o[1]), A("hardware", o[0]), A("reporter", o[1])];
    if (n === 3) return [A("driver", o[0]), A("navigator", o[1]), A("hardware", o[2]), A("reporter", o[1])];
    const list = [A("driver", o[0]), A("navigator", o[1]), A("hardware", o[2]), A("reporter", o[3])];
    if (n >= 5) list.push(A("tester", o.slice(4).join(", ")));
    return list;
  }

  /* ---------------- page skeleton ---------------- */
  document.title = `${L.id} · ${L.title} | micro:bit Lab`;
  const portalHref = L.portal || "../../index.html";
  const brandSvg = `<svg viewBox="0 0 24 24" aria-hidden="true">${[0, 1, 2].map(r => [0, 1, 2].map(c => `<circle cx="${6 + c * 6}" cy="${6 + r * 6}" r="2.1" fill="#fff" opacity="${(r + c) % 2 ? 1 : .55}"/>`).join("")).join("")}</svg>`;
  const top = h(`
    <header class="topbar">
      ${TEACHER ? `<div class="teacher-banner">${I("graduation-cap")} Teacher view: answers and solutions are shown</div>` : ""}
      <div class="topbar-inner">
        <a class="brand" href="${portalHref}" title="All lessons"><span class="brand-mark">${brandSvg}</span><span>micro:bit Lab</span></a>
        <div class="lesson-id"><span class="kicker">${esc(L.trackLabel)} · Lesson ${L.number}</span><span class="title">${esc(L.title)}</span></div>
        <div class="spacer"></div>
        <div class="progress-wrap"><span class="label">Progress</span><div class="progress-bar"><span></span></div><span class="pct">0%</span></div>
        <div class="acct">${STUDENT ? `<span class="save-state" aria-live="polite" title="Saved to your account"><span class="ico">${I("cloud-check")}</span><span class="txt">Saved</span></span>` : ""}
          ${STUDENT || TEACHER ? `<button type="button" class="acct-btn" aria-haspopup="menu" aria-expanded="false" title="Your account"><span class="avatar">${STUDENT ? esc(ACC.firstName(STUDENT.name)[0] || "?") : I("graduation-cap")}</span><span class="acct-label">${STUDENT ? esc(ACC.firstName(STUDENT.name)) : "Teacher"}</span><span class="caret">${I("chevron-down")}</span></button>`
            : `<span class="save-state warn"><span class="ico">${I("wifi-off")}</span><span class="txt">Not logged in</span></span>`}</div>
      </div>
      ${STUDENT && session.offline ? `<div class="net-banner">${I("wifi-off")} The server can't be reached. Your work is kept on this computer and saved to your account when the connection comes back.</div>`
        : !STUDENT && !TEACHER ? `<div class="net-banner">${I("wifi-off")} The website's server can't be reached, so nobody is logged in: your work is saved on this computer only.</div>` : ""}
      <div class="roles"><div class="roles-inner"></div></div>
    </header>`);
  document.body.appendChild(top);

  const layout = h(`<div class="layout"><nav class="sidenav" aria-label="Lesson sections"><ol></ol></nav><main class="main"></main></div>`);
  document.body.appendChild(layout);
  const main = layout.querySelector("main"), navList = layout.querySelector(".sidenav ol");
  document.body.appendChild(toastWrap);

  /* account menu: my lessons, my group, dashboard, log out */
  const acctBtn = top.querySelector(".acct-btn");
  if (acctBtn) {
    const homeDir = portalHref.replace(/index\.html$/, "");
    const menu = h(`
      <div class="acct-menu" role="menu" hidden>
        <div class="acct-who">${STUDENT ? `<b>${esc(STUDENT.name)}</b><span>${esc(STUDENT.id)} · ${esc(STUDENT.class)}</span>` : `<b>Teacher</b><span>Answers are shown</span>`}</div>
        <a role="menuitem" href="${portalHref}">${I("house")} My lessons</a>
        ${STUDENT ? `<button type="button" role="menuitem" data-act="group">${I("users")} My group</button>` : `<a role="menuitem" href="${homeDir}teacher.html">${I("layout-dashboard")} Dashboard</a>`}
        <button type="button" role="menuitem" data-act="logout" class="danger">${I("log-out")} Log out</button>
      </div>`);
    top.querySelector(".acct").appendChild(menu);
    const setOpen = open => { menu.hidden = !open; acctBtn.setAttribute("aria-expanded", String(open)); };
    acctBtn.onclick = e => { e.stopPropagation(); setOpen(menu.hidden); };
    document.addEventListener("click", e => { if (!menu.hidden && !menu.contains(e.target)) setOpen(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") setOpen(false); });
    const g = menu.querySelector('[data-act="group"]');
    if (g) g.onclick = () => { setOpen(false); openGroupModal(); };
    menu.querySelector('[data-act="logout"]').onclick = async () => {
      const b = menu.querySelector('[data-act="logout"]');
      b.disabled = true; b.textContent = "Saving and logging out…";
      await ACC.logout(); // sends any unsaved work first
      location.href = portalHref;
    };
  }

  /* roles strip + timer */
  const rolesInner = top.querySelector(".roles-inner");
  let dueNotified = false;
  function renderRoles() {
    const a = assignments();
    top.classList.toggle("solo", TEACHER || (!!STUDENT && (group.names || []).length <= 1));
    rolesInner.innerHTML = a.map(x => `<span class="role" title="${esc(x.role.desc)}"><span class="ico">${I(x.role.ico)}</span><b>${x.role.name}</b>${x.who ? `<span class="who">${esc(x.who)}</span>` : ""}</span>`).join("") +
      `<span class="role-timer"><span class="swap-label">Swap roles in</span><span class="clock">--:--</span><button type="button" class="btn small" data-act="rotate" title="Swap roles">${I("rotate-cw")}<span class="btn-txt">Swap</span></button><button type="button" class="btn small ghost" data-act="group" title="Group">${I("users")}<span class="btn-txt">Group</span></button></span>`;
    rolesInner.querySelector('[data-act="rotate"]').onclick = rotate;
    rolesInner.querySelector('[data-act="group"]').onclick = openGroupModal;
    tick();
  }
  function rotate() {
    group = group || { names: [], rot: 0 };
    group.rot = (group.rot || 0) + 1;
    group.rotateAt = Date.now() + ROTATE_MS;
    saveGroup(); dueNotified = false; renderRoles();
    const d = assignments()[0];
    toast(d.who ? `New roles! ${d.who} is now the Driver.` : "Swap roles now!", 2600, "rotate-cw");
  }
  function tick() {
    const timer = rolesInner.querySelector(".role-timer"); if (!timer) return;
    const clock = timer.querySelector(".clock");
    if (!group || !group.rotateAt) { clock.textContent = fmtTime(ROTATE_MS); return; }
    const left = group.rotateAt - Date.now();
    if (left <= 0) {
      clock.textContent = "NOW!"; timer.classList.add("due");
      if (!dueNotified) { dueNotified = true; tones(SOUNDS.chime, "sine"); toast("Time to swap roles! Press Swap.", 5000, "alarm-clock"); }
    } else { clock.textContent = fmtTime(left); timer.classList.remove("due"); }
  }
  setInterval(tick, 1000);

  function openGroupModal() {
    if (STUDENT && ACC) {
      ACC.openGroupManager(team => {
        group.names = [STUDENT].concat(team).map(u => ACC.firstName(u.name));
        group.askedGroup = true;
        saveGroup(); renderRoles();
        if (team.length) toast(`Saving for ${team.length + 1} students: ${group.names.join(", ")}`, 2600, "users");
      });
      return;
    }
    const names = (group && group.names) || [];
    const m = h(`
      <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="gm-title">
        <div class="modal">
          <h2 id="gm-title">${I("users")} Who is in your group?</h2>
          <p class="lead">Type your first names. The page gives everyone a job and reminds you to swap jobs every ${L.rotateMinutes || 12} minutes.</p>
          <div class="role-legend">${["driver", "navigator", "hardware", "reporter"].map(r => `<div>${I(ROLE[r].ico)} <b>${ROLE[r].name}</b>${ROLE[r].desc}</div>`).join("")}</div>
          <div class="names">${[0, 1, 2, 3, 4].map(i => `<label class="field">Name ${i + 1}${i >= 2 ? " (optional)" : ""}<input data-i="${i}" maxlength="20" value="${esc(names[i] || "")}" autocomplete="off"></label>`).join("")}</div>
          <div class="row"><button type="button" class="btn primary" data-act="go">Start the lesson</button><button type="button" class="btn ghost" data-act="skip">Skip</button></div>
        </div>
      </div>`);
    document.body.appendChild(m);
    const first = m.querySelector("input"); setTimeout(() => first.focus(), 50);
    const close = () => m.remove();
    m.querySelector('[data-act="go"]').onclick = () => {
      const list = [...m.querySelectorAll("input")].map(i => i.value.trim()).filter(Boolean);
      group = { names: list, rot: 0, rotateAt: Date.now() + ROTATE_MS, savedAt: Date.now() };
      saveGroup(); dueNotified = false; renderRoles(); close();
      if (list.length) toast(`Welcome, ${list.join(", ")}!`, 2600, "hand");
    };
    m.querySelector('[data-act="skip"]').onclick = () => {
      group = group || { names: [], rot: 0 };
      group.rotateAt = group.rotateAt || Date.now() + ROTATE_MS; group.savedAt = Date.now();
      saveGroup(); renderRoles(); close();
    };
    m.addEventListener("keydown", e => { if (e.key === "Escape") m.querySelector('[data-act="skip"]').click(); });
  }

  /* ---------------- progress ---------------- */
  const done = new Set(store.get("done", []));
  const numbered = L.sections.filter(s => !["glossary", "next", "text"].includes(s.type));
  const countable = numbered.filter(s => !s.optional); // optional sections don't count towards progress
  function markDone(id, silent) {
    if (done.has(id)) return;
    done.add(id); store.set("done", [...done]);
    updateProgress();
    if (!silent) { tones(SOUNDS.ok, "sine"); toast("Section complete!", 2600, "circle-check"); }
  }
  /** What the dashboard and the home page show: % done and quiz scores. */
  function summary() {
    const n = countable.filter(x => done.has(x.id)).length;
    const out = { percent: Math.round(100 * n / countable.length), done: n, total: countable.length };
    const score = q => {
      const ans = q.questions.map((qq, i) => store.get(`quiz:${q.id}:${i}`, null));
      return { right: ans.filter((a, i) => a === q.questions[i].answer).length, answered: ans.filter(a => a != null).length, total: q.questions.length };
    };
    const quizzes = L.sections.filter(x => x.type === "quiz");
    const exit = quizzes.filter(q => !q.diagnostic).pop();
    if (exit) out.quiz = score(exit);
    const diag = quizzes.find(q => q.diagnostic);
    if (diag) {
      out.diag = score(diag);
      const band = (diag.bands || []).slice().sort((a, b) => b.min - a.min).find(b => out.diag.right >= b.min);
      if (band && out.diag.answered === out.diag.total) out.diag.route = band.label;
    }
    return out;
  }
  if (STUDENT) {
    onStoreChange = () => ACC.queueSave(L.id, store.data, summary());
    const labels = { saved: ["cloud-check", "Saved"], saving: ["loader-circle", "Saving"], pending: ["loader-circle", "Saving"], error: ["triangle-alert", "Not saved yet, retrying…"], loggedout: ["log-out", "Logged out: log in again to save"] };
    ACC.onSaveState(state => {
      const el = top.querySelector(".save-state");
      if (!el) return;
      const [ico, txt] = labels[state] || ["", ""];
      el.querySelector(".ico").innerHTML = I(ico, ico === "loader-circle" ? "spin" : "");
      el.querySelector(".txt").textContent = txt;
      el.title = txt;
      el.className = "save-state" + (state === "error" || state === "loggedout" ? " warn" : state === "saved" ? "" : " busy");
    });
  }
  function updateProgress() {
    const pct = Math.round(100 * countable.filter(s => done.has(s.id)).length / countable.length);
    top.querySelector(".progress-bar span").style.width = pct + "%";
    top.querySelector(".pct").textContent = pct + "%";
    numbered.forEach(s => {
      const a = navList.querySelector(`a[href="#${s.id}"]`); if (a) a.classList.toggle("done", done.has(s.id));
      const c = document.getElementById(s.id); if (c) c.classList.toggle("done", done.has(s.id));
    });
  }

  /* ---------------- hero + objectives ---------------- */
  const hero = h(`
    <section class="card hero" id="top">
      <div class="hero-grid">
        <div>
          <div class="kicker">${esc(L.trackLabel)} · ${esc(L.grades)} · Lesson ${L.number}</div>
          <h1>${esc(L.title)}</h1>
          <p class="mission">${I("target")}<span>${rich(L.mission)}</span></p>
          <div class="chips">${(L.chips || []).map(c => { const m = /^([a-z0-9-]+):(.*)$/.exec(c); return `<span class="chip-static">${m ? I(m[1]) + esc(m[2]) : esc(c)}</span>`; }).join("")}</div>
        </div>
        <div class="hero-mb"></div>
      </div>
    </section>`);
  main.appendChild(hero);
  const heroMb = new MiniBit(hero.querySelector(".hero-mb"), { buttons: true, logo: true });
  heroMb.run(L.heroDemo || [["loop", "forever", [["scroll", L.id], ["icon", "Heart", 900], ["icon", "SmallHeart", 500]]]]);

  const obj = h(`
    <section class="card">
      <div class="objectives">
        <div><h3>By the end of this lesson, I can…</h3><ul>${L.objectives.map(o => `<li><span>${rich(o)}</span></li>`).join("")}</ul></div>
        <div class="needs"><h3>What your group needs</h3><ul>${L.needs.map(o => `<li><span>${rich(o)}</span></li>`).join("")}</ul></div>
      </div>
    </section>`);
  main.appendChild(obj);

  /* ---------------- section renderers ---------------- */
  let secNum = 0;
  function card(sec) {
    const counted = !["glossary", "next", "text"].includes(sec.type);
    const num = counted ? ++secNum : "";
    const c = h(`
      <section class="card" id="${sec.id}">
        <div class="card-head">
          <div class="num">${num || (sec.type === "glossary" ? I("book-open") : I("arrow-right"))}</div>
          <div><h2>${esc(sec.title)}</h2><div class="meta">${sec.minutes ? `${I("clock")} about ${sec.minutes} min` : ""}${sec.kind ? ` · ${esc(sec.kind)}` : ""}</div></div>
          <span class="badge-done">${I("check")} Done</span>
        </div>
      </section>`);
    if (sec.intro) c.appendChild(h(`<div class="lead">${rich(sec.intro)}</div>`));
    navList.appendChild(h(`<li><a href="#${sec.id}"><span class="dot">${num || "·"}</span><span>${esc(sec.nav || sec.title)}</span>${sec.minutes ? `<span class="mins">${sec.minutes}′</span>` : ""}</a></li>`));
    return c;
  }

  const R = {};

  R.text = (sec, c) => { c.appendChild(h(`<div>${rich(sec.html)}</div>`)); };

  R.sort = (sec, c) => {
    const st = store.get("sort:" + sec.id, { place: {} });
    let selected = null;
    const pool = h(`<div class="sort-pool" aria-label="Items to sort"></div>`);
    const bw = h(`<div class="buckets" style="--cols:${sec.buckets.length}"></div>`);
    const fb = h(`<div class="feedback" aria-live="polite"></div>`);
    const btns = h(`<div class="row" style="margin-top:12px"><button type="button" class="btn primary" data-act="check">${I("check")} Check</button><button type="button" class="btn ghost" data-act="reset">${I("rotate-ccw")} Start again</button></div>`);
    c.append(h(`<p class="q" style="margin-top:6px">${rich(sec.how || "Click an item, then click the box where it belongs. (You can also drag.)")}</p>`), pool, bw, btns, fb);
    const bucketEls = {};
    sec.buckets.forEach(b => {
      const e = h(`<div class="bucket" data-b="${b.id}" tabindex="0" role="button" aria-label="${esc(b.label)}"><div class="bucket-head"><span class="emo">${I(b.icon)}</span>${esc(b.label)}</div><div class="bucket-desc">${rich(b.desc || "")}</div><div class="bucket-items"></div></div>`);
      const drop = () => { if (selected != null) { st.place[selected] = b.id; selected = null; save(); draw(); } };
      e.addEventListener("click", ev => { if (!ev.target.closest(".chip")) drop(); });
      e.addEventListener("keydown", ev => { if ((ev.key === "Enter" || ev.key === " ") && !ev.target.closest(".chip")) { ev.preventDefault(); drop(); } });
      e.addEventListener("dragover", ev => { ev.preventDefault(); e.classList.add("target"); });
      e.addEventListener("dragleave", () => e.classList.remove("target"));
      e.addEventListener("drop", ev => { ev.preventDefault(); e.classList.remove("target"); const i = ev.dataTransfer.getData("text/plain"); if (i !== "") { st.place[i] = b.id; selected = null; save(); draw(); } });
      bucketEls[b.id] = e; bw.appendChild(e);
    });
    pool.addEventListener("click", ev => { if (!ev.target.closest(".chip") && selected != null) { delete st.place[selected]; selected = null; save(); draw(); } });
    pool.addEventListener("dragover", ev => ev.preventDefault());
    pool.addEventListener("drop", ev => { ev.preventDefault(); const i = ev.dataTransfer.getData("text/plain"); delete st.place[i]; save(); draw(); });
    function save() { store.set("sort:" + sec.id, st); }
    function draw(marks) {
      pool.innerHTML = ""; Object.values(bucketEls).forEach(e => (e.querySelector(".bucket-items").innerHTML = ""));
      sec.items.forEach((it, i) => {
        const chip = h(`<button type="button" class="chip" draggable="true"><span class="emo">${I(it.icon)}</span>${esc(it.label)}</button>`);
        if (selected === i) chip.classList.add("selected");
        if (marks && marks[i] != null) chip.classList.add(marks[i] ? "right" : "wrong");
        if (TEACHER && !marks) chip.title = "Answer: " + sec.buckets.find(b => b.id === it.bucket).label;
        chip.addEventListener("click", () => { selected = selected === i ? null : i; draw(); });
        chip.addEventListener("dragstart", ev => { ev.dataTransfer.setData("text/plain", String(i)); });
        const where = st.place[i];
        (where && bucketEls[where] ? bucketEls[where].querySelector(".bucket-items") : pool).appendChild(chip);
      });
    }
    btns.querySelector('[data-act="check"]').onclick = () => {
      const unplaced = sec.items.filter((_, i) => !st.place[i]).length;
      if (unplaced) { fb.className = "feedback show info"; fb.textContent = `Sort all the items first (${unplaced} left).`; return; }
      const marks = sec.items.map((it, i) => st.place[i] === it.bucket);
      const wrong = sec.items.filter((it, i) => !marks[i]);
      draw(marks);
      if (!wrong.length) {
        fb.className = "feedback show ok"; fb.innerHTML = `${I("party-popper")} <b>All correct!</b> ${rich(sec.success || "")}`; markDone(sec.id);
      } else {
        st.tries = (st.tries || 0) + 1; save();
        fb.className = "feedback show bad";
        fb.innerHTML = `<b>${wrong.length} in the wrong place</b> (shown in red). Move them and check again.` +
          (st.tries >= 2 ? `<ul style="margin:8px 0 0">${wrong.map(w => `<li><b>${esc(w.label)}:</b> ${rich(w.why || "")}</li>`).join("")}</ul>` : "");
      }
    };
    btns.querySelector('[data-act="reset"]').onclick = () => { st.place = {}; st.tries = 0; selected = null; save(); fb.className = "feedback"; draw(); };
    draw();
  };

  R.explore = (sec, c) => {
    const holder = document.createElement("div"); c.appendChild(holder);
    MicrobitExplorer(holder, {
      required: sec.required, speedrun: sec.speedrun, saved: store.get("explore:" + sec.id, []), best: store.get("best:" + sec.id, null),
      onProgress(found, total, complete, time) {
        store.set("explore:" + sec.id, found);
        if (complete) markDone(sec.id);
        if (time) {
          const best = store.get("best:" + sec.id, null);
          if (!best || time < best) store.set("best:" + sec.id, time);
          toast(`All ${total} parts found in ${fmtTime(time)}!`, 4000, "flag");
        }
      }
    });
    if (sec.after) c.appendChild(h(`<div class="tip" style="margin-top:16px">${rich(sec.after)}</div>`));
  };

  R.editorTour = (sec, c) => {
    const seen = new Set(store.get("tour:" + sec.id, []));
    const mock = h(`
      <div class="mc-mock" aria-label="Picture of the MakeCode editor">
        <div class="mc-top"><span>${I("house")}</span><b>MakeCode</b><div class="seg"><span class="on">Blocks</span><span>JavaScript</span><span>Python</span></div><span>${I("settings")}</span></div>
        <div class="mc-body">
          <div class="mc-sim"></div>
          <div class="mc-tool">
            ${[["Basic", "#1e90ff"], ["Input", "#d400d4"], ["Music", "#e63022"], ["Led", "#5c2d91"], ["Radio", "#e3008c"], ["Loops", "#00aa00"], ["Logic", "#00a4a6"], ["Variables", "#dc143c"], ["Math", "#9400d3"]].map(([n, col]) => `<span><i style="background:${col}"></i>${n}</span>`).join("")}
          </div>
          <div class="mc-ws"><div class="mc-block">on start</div><br><div class="mc-block">forever</div></div>
        </div>
        <div class="mc-bottom"><span class="mc-dl">${I("download")} Download</span><span>⋯</span><span class="mc-name">Name badge</span><span>${I("save")}</span></div>
      </div>`);
    c.appendChild(mock);
    new MiniBit(mock.querySelector(".mc-sim"), {}).showIcon("Happy");
    // corner pins sit inside an area; inline pins sit right after an element
    const corner = { sim: [".mc-sim", "top:8px;left:8px"], toolbox: [".mc-tool", "top:8px;right:8px"], workspace: [".mc-ws", "top:8px;right:8px"] };
    const inline = { download: ".mc-dl", name: ".mc-name", switch: ".seg" };
    const legend = h(`<div class="mc-legend"></div>`);
    sec.parts.forEach((p, i) => {
      const pin = h(`<button type="button" class="mc-pin" aria-label="${esc(p.name)}">${i + 1}</button>`);
      if (corner[p.id]) {
        const host = mock.querySelector(corner[p.id][0]);
        host.style.position = "relative"; pin.style.cssText = corner[p.id][1]; host.appendChild(pin);
      } else {
        const target = mock.querySelector(inline[p.id] || ".mc-top");
        pin.style.position = "static"; target.insertAdjacentElement("afterend", pin);
      }
      const item = h(`<div tabindex="0"><b><span>${i + 1}</span>${esc(p.name)}</b>${rich(p.desc)}</div>`);
      legend.appendChild(item);
      const choose = () => {
        legend.querySelectorAll("div").forEach(d => d.classList.remove("on")); mock.querySelectorAll(".mc-pin").forEach(x => x.classList.remove("on"));
        item.classList.add("on"); pin.classList.add("on"); seen.add(p.id); store.set("tour:" + sec.id, [...seen]);
        if (seen.size >= sec.parts.length) markDone(sec.id);
      };
      pin.onclick = choose; item.onclick = choose; item.onkeydown = e => { if (e.key === "Enter") choose(); };
      if (seen.has(p.id)) item.classList.add("seen");
    });
    c.appendChild(legend);
    if (sec.after) c.appendChild(h(`<div class="tip" style="margin-top:14px">${rich(sec.after)}</div>`));
  };

  function mcq(q, saveKey, onAnswer) {
    const st = store.get(saveKey, null);
    const wrap = h(`<div><p class="q">${rich(q.q)}</p><div class="opts"></div><div class="feedback" aria-live="polite"></div></div>`);
    const opts = wrap.querySelector(".opts"), fb = wrap.querySelector(".feedback");
    if (q.code) wrap.insertBefore(codePanel(q.code, { label: "read the code", lang: q.lang }), opts);
    const buttons = q.options.map((o, i) => {
      const b = h(`<button type="button" class="opt"><span class="letter">${LETTERS[i]}</span><span>${rich(o)}</span></button>`);
      if (TEACHER && i === q.answer) b.style.outline = "2px dashed var(--ok)";
      b.onclick = () => choose(i, true);
      opts.appendChild(b); return b;
    });
    function choose(i, fresh) {
      buttons.forEach(b => (b.disabled = true));
      buttons[i].classList.add(i === q.answer ? "right" : "wrong");
      if (i !== q.answer) buttons[q.answer].classList.add("right");
      fb.className = "feedback show " + (i === q.answer ? "ok" : "bad");
      fb.innerHTML = (i === q.answer ? I("circle-check") + " <b>Correct!</b> " : I("circle-x") + " <b>Not quite.</b> ") + rich(q.explain || "");
      if (fresh) { store.set(saveKey, i); onAnswer && onAnswer(i === q.answer, true); }
    }
    if (st != null) { choose(st, false); onAnswer && onAnswer(st === q.answer, false); }
    return wrap;
  }

  R.predict = (sec, c) => {
    const grid = h(`<div class="predict-grid"><div class="left"></div><div class="right"></div></div>`);
    c.appendChild(grid);
    const left = grid.querySelector(".left"), right = grid.querySelector(".right");
    left.appendChild(codePanel(sec.code, { label: sec.codeLabel }));
    const mb = new MiniBit(right, { caption: "Virtual micro:bit", buttons: true, logo: true });
    const ctr = h(`<div class="row" style="justify-content:center;margin-top:8px"><button type="button" class="btn primary" data-act="run" ${TEACHER ? "" : "disabled"}>${I("play")} Run it</button><button type="button" class="btn ghost" data-act="stop">${I("square")} Stop</button></div>`);
    right.appendChild(ctr);
    const runBtn = ctr.querySelector('[data-act="run"]');
    const lock = h(`<p class="caption" style="text-align:center;font-size:.82rem;color:var(--muted)">${TEACHER ? "" : I("lock") + " Make your prediction first!"}</p>`);
    right.appendChild(lock);
    const explain = h(`<div class="feedback info" style="margin-top:14px"></div>`);
    left.appendChild(mcq({ q: sec.question, options: sec.options, answer: sec.answer, explain: sec.afterAnswer || "Now press <b>Run it</b> and check." }, "predict:" + sec.id, () => { runBtn.disabled = false; lock.textContent = "Press Run it to test your prediction."; }));
    left.appendChild(explain);
    runBtn.onclick = async () => {
      runBtn.disabled = true;
      const ok = await mb.run(sec.demo);
      runBtn.disabled = false;
      if (ok) { explain.innerHTML = rich(sec.explain); explain.classList.add("show"); markDone(sec.id); }
    };
    ctr.querySelector('[data-act="stop"]').onclick = () => { mb.stop(); runBtn.disabled = false; };
  };

  /* ---- tools ---- */
  const TOOLS = {};
  TOOLS.nameScroller = (tool) => {
    const t = h(`<div class="tool"><div class="tool-title">${I("eye")} ${esc(tool.title || "Preview: how will it look on the micro:bit?")}</div><div class="tool-grid"><div class="mb"></div><div><label class="field">${esc(tool.label || "Type your name (English letters)")}<input maxlength="30" value="${esc(tool.value || "SARA")}"></label><div class="row" style="margin-top:10px"><button type="button" class="btn primary">${I("play")} Play</button><span class="speed" style="font-size:.85rem;color:var(--muted)"></span></div><p class="warnmsg" style="font-size:.85rem;color:var(--bad);margin-top:8px"></p>${tool.note ? `<p style="font-size:.88rem;color:var(--muted)">${rich(tool.note)}</p>` : ""}</div></div></div>`);
    const mb = new MiniBit(t.querySelector(".mb"), { buttons: false });
    const input = t.querySelector("input"), warn = t.querySelector(".warnmsg");
    const play = () => {
      const txt = input.value || " ";
      const bad = [...txt].filter(ch => ch !== " " && !window.MiniBitUtil.FONT[ch.toUpperCase()]);
      warn.textContent = bad.length ? `The micro:bit can't show: ${[...new Set(bad)].join(" ")}. Use English letters A–Z and numbers.` : "";
      const secs = ((window.MiniBitUtil.textColumns(txt).length + 5) * 0.15).toFixed(1);
      t.querySelector(".speed").textContent = `Takes about ${secs} seconds to scroll.`;
      mb.run([["scroll", txt]]);
    };
    let deb; input.addEventListener("input", () => { clearTimeout(deb); deb = setTimeout(play, 700); });
    t.querySelector("button").onclick = play;
    setTimeout(play, 400);
    return t;
  };

  TOOLS.download = () => {
    const t = h(`
      <div class="tabs">
        <div class="tabs-head" role="tablist"><button type="button" class="on" data-t="0">${I("zap")} Method 1: Connect &amp; Download</button><button type="button" data-t="1">${I("folder")} Method 2: Drag &amp; drop</button></div>
        <div class="tabs-body">
          <div data-p="0"><ol>
            <li>Plug the micro:bit into the computer with the USB cable. The yellow light on the back turns on.</li>
            <li>In MakeCode, click the <b>three dots ⋯</b> next to <b>Download</b> and choose <b>Connect device</b>. (MakeCode may also ask you this the first time you press Download.)</li>
            <li>Follow the steps, choose <b>BBC micro:bit CMSIS-DAP</b> in the pop-up and click <b>Connect</b>.</li>
            <li>Click <b>Download</b>. The yellow light flashes, and your program starts on the micro:bit.</li>
            <li>Next time, just click <b>Download</b>. It goes straight to the micro:bit.</li>
          </ol><p style="font-size:.85rem;color:var(--muted);margin-top:8px">Works in <b>Chrome</b> and <b>Edge</b>.</p></div>
          <div data-p="1" hidden><ol>
            <li>Plug in the micro:bit. A drive called <b>MICROBIT</b> appears on the computer.</li>
            <li>In MakeCode, click <b>Download</b>. A file ending in <b>.hex</b> is saved (usually in <b>Downloads</b>).</li>
            <li>Open <b>File Explorer</b>, find the .hex file and <b>drag it onto the MICROBIT drive</b>.</li>
            <li>The yellow light flashes while it copies. When it stops, your program runs.</li>
          </ol><p style="font-size:.85rem;color:var(--muted);margin-top:8px">The MICROBIT drive disappears and comes back after copying. That's normal!</p></div>
        </div>
      </div>`);
    t.querySelectorAll(".tabs-head button").forEach(b => b.onclick = () => {
      t.querySelectorAll(".tabs-head button").forEach(x => x.classList.toggle("on", x === b));
      t.querySelectorAll("[data-p]").forEach(p => (p.hidden = p.dataset.p !== b.dataset.t));
    });
    return t;
  };

  TOOLS.ledDesigner = (tool) => {
    const multi = !!tool.frames;
    const start = (tool.start || ["Heart"]).map(s => (ICONS[s] ? ICONS[s].slice() : window.MiniBitUtil.matrixToRows(toMatrix(s))));
    const frames = start.map(r => r.slice());
    let cur = 0, pauseMs = tool.pause != null ? tool.pause : 200;
    const t = h(`
      <div class="tool">
        <div class="tool-title">${I("palette")} ${esc(tool.title || (multi ? "Animation designer" : "LED designer"))}</div>
        <div class="tool-grid">
          <div class="mb"></div>
          <div class="right">
            <div class="row">
              <label class="field" style="flex:1;min-width:150px">Start from an icon<select><option value="">Choose…</option>${Object.keys(ICONS).map(k => `<option>${k}</option>`).join("")}</select></label>
              <button type="button" class="btn small" data-act="clear">Clear</button>
              <button type="button" class="btn small" data-act="invert">Invert</button>
            </div>
            ${multi ? `<div class="frames"></div><div class="row"><button type="button" class="btn small" data-act="add">${I("plus")} New frame</button><button type="button" class="btn small" data-act="dup">${I("copy")} Copy frame</button><button type="button" class="btn small" data-act="del">${I("trash-2")} Delete frame</button><button type="button" class="btn small primary" data-act="play">${I("play")} Play</button><label class="field" style="flex-direction:row;align-items:center;gap:6px">pause <select data-act="pause">${[0, 100, 200, 400, 800].map(v => `<option value="${v}" ${v === pauseMs ? "selected" : ""}>${v} ms</option>`).join("")}</select></label></div>` : ""}
            <div class="code" style="margin-top:12px"></div>
          </div>
        </div>
        <p style="font-size:.85rem;color:var(--muted);margin:10px 0 0">Click the LEDs on the virtual micro:bit to switch them on and off.</p>
      </div>`);
    const mb = new MiniBit(t.querySelector(".mb"), { designer: true, buttons: false, logo: false });
    const python = tool.lang === "python";
    const cp = codePanel(gen(), { lang: python ? "python" : "blocks", copy: true, label: multi ? "your animation" : "your picture" });
    t.querySelector(".code").appendChild(cp);
    function ledsJS(rows) { return "basic.showLeds(`\n" + rows.map(r => "    " + r.split("").join(" ")).join("\n") + "\n    `)"; }
    function imgPy(rows) { return 'Image("' + rows.map(r => r.replace(/#/g, "9").replace(/\./g, "0")).join(":") + '")'; }
    function gen() {
      if (python) {
        if (!multi) return "from microbit import *\n\ndisplay.show(" + imgPy(frames[0]) + ")";
        return "from microbit import *\n\nframes = [\n" + frames.map(f => "    " + imgPy(f)).join(",\n") + "\n]\n\nwhile True:\n    display.show(frames, delay=" + Math.max(100, pauseMs + 400) + ")";
      }
      if (!multi) return "basic.forever(function () {\n" + ledsJS(frames[0]).split("\n").map(l => "    " + l).join("\n") + "\n})";
      const body = frames.map(f => ledsJS(f).split("\n").map(l => "    " + l).join("\n") + (pauseMs ? `\n    basic.pause(${pauseMs})` : "")).join("\n");
      return "basic.forever(function () {\n" + body + "\n})";
    }
    let deb;
    function refresh() { clearTimeout(deb); deb = setTimeout(() => cp.update(gen()), 450); drawFrames(); }
    function drawFrames() {
      if (!multi) return;
      const fw = t.querySelector(".frames"); fw.innerHTML = "";
      frames.forEach((f, i) => {
        const b = h(`<button type="button" class="frame-thumb ${i === cur ? "on" : ""}" aria-label="Frame ${i + 1}"></button>`);
        b.appendChild(ledThumb(f)); b.appendChild(h(`<span>Frame ${i + 1}</span>`));
        b.onclick = () => { mb.stop(); cur = i; mb.show(frames[cur]); drawFrames(); };
        fw.appendChild(b);
      });
    }
    mb.show(frames[cur]);
    mb.on("change", rows => { frames[cur] = rows; refresh(); });
    t.querySelector("select").onchange = e => { if (!e.target.value) return; frames[cur] = ICONS[e.target.value].slice(); mb.show(frames[cur]); e.target.value = ""; refresh(); };
    t.querySelector('[data-act="clear"]').onclick = () => { frames[cur] = [".....", ".....", ".....", ".....", "....."]; mb.show(frames[cur]); refresh(); };
    t.querySelector('[data-act="invert"]').onclick = () => { frames[cur] = frames[cur].map(r => r.replace(/[#.]/g, ch => (ch === "#" ? "." : "#"))); mb.show(frames[cur]); refresh(); };
    if (multi) {
      t.querySelector('[data-act="add"]').onclick = () => { frames.splice(cur + 1, 0, [".....", ".....", ".....", ".....", "....."]); cur++; mb.show(frames[cur]); refresh(); };
      t.querySelector('[data-act="dup"]').onclick = () => { frames.splice(cur + 1, 0, frames[cur].slice()); cur++; mb.show(frames[cur]); refresh(); };
      t.querySelector('[data-act="del"]').onclick = () => { if (frames.length < 2) return toast("You need at least one frame."); frames.splice(cur, 1); cur = Math.max(0, cur - 1); mb.show(frames[cur]); refresh(); };
      t.querySelector('[data-act="play"]').onclick = () => { mb.run([["loop", 4, frames.map(f => ["leds", f, 400 + pauseMs])]]).then(() => mb.show(frames[cur])); };
      t.querySelector('select[data-act="pause"]').onchange = e => { pauseMs = +e.target.value; refresh(); };
    }
    drawFrames();
    return t;
  };

  TOOLS.eventDemo = (tool) => {
    const t = h(`<div class="tool"><div class="tool-title">${I("gamepad-2")} ${esc(tool.title || "Try the finished project")}</div><div class="tool-grid"><div class="mb"></div><div class="info"></div></div></div>`);
    const mb = new MiniBit(t.querySelector(".mb"), { shake: !!tool.map.shake, buttons: true, logo: true });
    const info = t.querySelector(".info");
    const labels = { A: "Press button A", B: "Press button B", logo: "Touch the logo", shake: "Shake it", AB: "Press A+B" };
    // Variables shown as labelled boxes next to the micro:bit, so students can watch them change.
    const vars = Object.assign({}, tool.vars || {});
    const watch = tool.watch || [];
    info.innerHTML = `<p>${rich(tool.text || "This is what your finished program should do. Try it!")}</p><ul style="margin:0;padding-left:1.2em">${Object.keys(tool.map).map(k => `<li><b>${labels[k] || k}</b> → ${esc(tool.map[k].label || tool.map[k].icon)}</li>`).join("")}</ul>` +
      (watch.length ? `<div class="var-watch">${watch.map(v => `<div class="var-box" data-v="${esc(v)}"><div class="vname">${esc(v)}</div><div class="vval">${vars[v] != null ? vars[v] : 0}</div></div>`).join("")}</div>` : "");
    const showVars = changed => watch.forEach(v => {
      const box = info.querySelector(`.var-box[data-v="${v}"]`);
      box.querySelector(".vval").textContent = vars[v];
      if (changed.includes(v)) { box.classList.remove("bump"); void box.offsetWidth; box.classList.add("bump"); }
    });
    /* Actions: pre (demo ops played first), inc, set {name: value}, randomVar [name, lo, hi],
       iconFor {value: icon}, icon, showVar, text, sound */
    Object.entries(tool.map).forEach(([ev, act]) => {
      mb.on(ev, async () => {
        if (act.pre && !(await mb.run(act.pre))) return; // interrupted by another press
        const changed = [];
        if (act.inc) { vars[act.inc] = (vars[act.inc] || 0) + 1; changed.push(act.inc); }
        if (act.set) Object.entries(act.set).forEach(([k, v]) => { vars[k] = v; changed.push(k); });
        if (act.randomVar) { const [k, lo, hi] = act.randomVar; vars[k] = lo + Math.floor(Math.random() * (hi - lo + 1)); changed.push(k); }
        showVars(changed);
        if (act.sound && SOUNDS[act.sound]) tones(SOUNDS[act.sound]);
        if (act.iconFor) { mb.stop(); mb.showIcon(act.iconFor[vars[act.randomVar ? act.randomVar[0] : act.iconVar]]); }
        else if (act.icon) { mb.stop(); mb.showIcon(act.icon); }
        if (act.showVar) mb.run([["text", String(vars[act.showVar])]]);
        else if (act.text) mb.run([["text", act.text]]);
      });
    });
    if (tool.startIcon) mb.showIcon(tool.startIcon);
    return t;
  };

  TOOLS.speedDemo = (tool) => {
    const frames = tool.frames || ["Heart", "SmallHeart"];
    const max = tool.max || 1000;
    let pause = tool.start != null ? tool.start : 500;
    const t = h(`
      <div class="tool">
        <div class="tool-title">${I("sliders-horizontal")} ${esc(tool.title || "Speed lab")}</div>
        <div class="tool-grid">
          <div class="mb"></div>
          <div class="right">
            <div class="speed-row"><span class="speed-label">pause (ms)</span><input type="range" min="0" max="${max}" step="50" value="${pause}" aria-label="Pause in milliseconds"><span class="speed-val"></span></div>
            <p class="speed-note"></p>
            <div class="code"></div>
          </div>
        </div>
      </div>`);
    const mb = new MiniBit(t.querySelector(".mb"), { buttons: false });
    const range = t.querySelector("input"), val = t.querySelector(".speed-val"), note = t.querySelector(".speed-note");
    const gen = () => "basic.forever(function () {\n" + frames.map(f => `    basic.showIcon(IconNames.${f})\n    basic.pause(${pause})`).join("\n") + "\n})";
    const cp = codePanel(gen(), { label: "your code", copy: true });
    t.querySelector(".code").appendChild(cp);
    // show icon already keeps each picture for 600 ms; the pause comes on top of that
    const describe = ms => ms === 0
      ? "No pause: each picture still stays about 0.6 s, because show icon waits a little by itself."
      : `Each picture stays about ${((600 + ms) / 1000).toFixed(1)} s: 0.6 s from show icon + ${ms} ms of pause.`;
    const play = () => mb.run([["loop", "forever", frames.flatMap(f => [["icon", f, 600], ["pause", pause]])]]);
    const label = () => { val.textContent = `${pause} ms`; note.textContent = describe(pause); };
    let deb;
    range.addEventListener("input", () => {
      pause = +range.value; label();
      clearTimeout(deb); deb = setTimeout(() => { cp.update(gen()); play(); }, 350);
    });
    label(); play();
    return t;
  };

  R.mission = (sec, c) => {
    const st = store.get("mission:" + sec.id, { checked: [], hints: {} });
    const wrap = h(`<div class="steps"></div>`); c.appendChild(wrap);
    let lastLevel = "core", n = 0;
    const coreIdx = [];
    sec.steps.forEach((s, i) => {
      const lvl = s.level || "core";
      if (lvl !== lastLevel) {
        wrap.appendChild(h(`<div class="level-divider">${lvl === "ext" ? '<span class="lv-dot ext"></span>Finished? Level up: Extension' : '<span class="lv-dot chal"></span>Ready for a challenge?'}</div>`));
        lastLevel = lvl;
      }
      if (lvl === "core") coreIdx.push(i);
      n++;
      const el = h(`
        <div class="step ${lvl}" id="${sec.id}-s${i + 1}">
          <div class="step-head"><div class="step-num">${n}</div><h3>${esc(s.title)}</h3><span class="level ${lvl}">${lvl === "core" ? "Core" : lvl === "ext" ? "Extension" : "Challenge"}</span></div>
          <div class="step-body"></div>
          <div class="step-foot"><label class="check"><input type="checkbox"> ${esc(s.checkLabel || "We did it!")}</label><span class="spacer" style="flex:1"></span></div>
          <div class="step-extra" style="display:flex;flex-direction:column;gap:8px;margin-top:8px"></div>
        </div>`);
      const body = el.querySelector(".step-body"), foot = el.querySelector(".step-foot"), extra = el.querySelector(".step-extra");
      if (s.html) body.appendChild(h(`<div>${rich(s.html)}</div>`));
      // pageCode: false keeps a snippet for the slides and teacher plan only (e.g. when a tool already shows live code)
      if (s.code && s.pageCode !== false) body.appendChild(codePanel(s.code, { label: s.codeLabel, lang: s.lang }));
      if (s.tool) body.appendChild(TOOLS[s.tool.type](s.tool));
      if (s.tip) body.appendChild(h(`<div class="tip">${I("lightbulb")}<div><b>Tip:</b> ${rich(s.tip)}</div></div>`));
      if (s.warn) body.appendChild(h(`<div class="warn">${I("triangle-alert")}<div><b>Watch out:</b> ${rich(s.warn)}</div></div>`));
      // hints & solution
      const hints = s.hints || [];
      let shown = st.hints[i] || 0;
      const hintBtn = hints.length ? h(`<button type="button" class="btn small">${I("lightbulb")} Hint (${hints.length})</button>`) : null;
      const solBtn = s.solution ? h(`<button type="button" class="btn small ghost">${I("eye")} Show solution</button>`) : null;
      let solShown = false;
      function renderExtra() {
        extra.querySelectorAll(".hint").forEach(x => x.remove());
        for (let k = 0; k < shown; k++) extra.insertBefore(h(`<div class="hint">${I("lightbulb")}<div><b>Hint ${k + 1}:</b> ${rich(hints[k])}</div></div>`), extra.querySelector(".code-panel"));
        if (hintBtn) { hintBtn.innerHTML = I("lightbulb") + (shown < hints.length ? ` Hint ${shown + 1} of ${hints.length}` : " No more hints"); hintBtn.disabled = shown >= hints.length; }
        if (solBtn) solBtn.hidden = !TEACHER && shown < hints.length;
      }
      if (hintBtn) { hintBtn.onclick = () => { shown = Math.min(hints.length, shown + 1); st.hints[i] = shown; store.set("mission:" + sec.id, st); renderExtra(); }; foot.appendChild(hintBtn); }
      if (solBtn) {
        solBtn.onclick = () => {
          if (solShown) return;
          if (!TEACHER && !confirm("Did your group really try first? Looking at the solution is OK, but trying is how you learn!")) return;
          solShown = true; solBtn.disabled = true;
          extra.appendChild(codePanel(s.solution, { label: "solution", lang: s.lang }));
        };
        foot.appendChild(solBtn);
      }
      renderExtra();
      if (TEACHER && s.solution) solBtn.click();
      const cb = el.querySelector("input[type=checkbox]");
      cb.checked = st.checked.includes(i);
      el.classList.toggle("checked", cb.checked);
      cb.onchange = () => {
        st.checked = st.checked.filter(x => x !== i); if (cb.checked) st.checked.push(i);
        store.set("mission:" + sec.id, st);
        el.classList.toggle("checked", cb.checked);
        if (cb.checked) { tones(SOUNDS.ok, "sine"); toast(lvl === "core" ? "Nice work!" : lvl === "ext" ? "Extension done!" : "Challenge complete!", 2600, lvl === "chal" ? "trophy" : "circle-check"); }
        if (req.every(k => st.checked.includes(k))) markDone(sec.id, true);
      };
      wrap.appendChild(el);
    });
    // A mission with only Extension/Challenge steps is done when all its steps are ticked.
    const req = coreIdx.length ? coreIdx : sec.steps.map((_, k) => k);
    if (req.every(k => st.checked.includes(k))) done.add(sec.id);
  };

  /* Put steps in order. Items are listed in their starting (mixed-up) order; n = correct position. */
  R.order = (sec, c) => {
    const st = store.get("order:" + sec.id, null) || { seq: sec.items.map((_, i) => i), tries: 0 };
    const list = h(`<ol class="order-list" aria-label="Steps to put in order"></ol>`);
    const fb = h(`<div class="feedback" aria-live="polite"></div>`);
    const btns = h(`<div class="row" style="margin-top:12px"><button type="button" class="btn primary" data-act="check">${I("check")} Check</button><button type="button" class="btn ghost" data-act="reset">${I("rotate-ccw")} Start again</button></div>`);
    c.append(h(`<p class="q" style="margin-top:6px">${rich(sec.how || "Use the up and down arrows (or drag the cards) to put the steps in the right order.")}</p>`), list, btns, fb);
    let dragFrom = null;
    const save = () => store.set("order:" + sec.id, st);
    function move(from, to) {
      if (to < 0 || to >= st.seq.length || from === to) return;
      const [x] = st.seq.splice(from, 1); st.seq.splice(to, 0, x);
      save(); fb.className = "feedback"; draw();
    }
    function draw(marks) {
      list.innerHTML = "";
      st.seq.forEach((idx, pos) => {
        const it = sec.items[idx];
        const li = h(`<li class="order-item" draggable="true"><span class="grip" aria-hidden="true">${I("grip-vertical")}</span><span class="pos">${pos + 1}</span><span class="txt">${it.icon ? `<span class="emo">${I(it.icon)}</span> ` : ""}${rich(it.label)}</span><span class="spacer"></span><button type="button" class="btn small ghost" aria-label="Move up" ${pos === 0 ? "disabled" : ""}>${I("arrow-up")}</button><button type="button" class="btn small ghost" aria-label="Move down" ${pos === st.seq.length - 1 ? "disabled" : ""}>${I("arrow-down")}</button></li>`);
        if (marks) li.classList.add(marks[pos] ? "right" : "wrong");
        if (TEACHER && !marks) li.title = "Correct position: " + it.n;
        const [up, down] = li.querySelectorAll("button");
        up.onclick = () => move(pos, pos - 1);
        down.onclick = () => move(pos, pos + 1);
        li.addEventListener("dragstart", e => { dragFrom = pos; e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", String(pos)); li.classList.add("dragging"); });
        li.addEventListener("dragend", () => li.classList.remove("dragging"));
        li.addEventListener("dragover", e => { e.preventDefault(); li.classList.add("over"); });
        li.addEventListener("dragleave", () => li.classList.remove("over"));
        li.addEventListener("drop", e => { e.preventDefault(); li.classList.remove("over"); if (dragFrom != null) move(dragFrom, pos); dragFrom = null; });
        list.appendChild(li);
      });
    }
    btns.querySelector('[data-act="check"]').onclick = () => {
      const marks = st.seq.map((idx, pos) => sec.items[idx].n === pos + 1);
      draw(marks);
      if (marks.every(Boolean)) {
        fb.className = "feedback show ok"; fb.innerHTML = `${I("party-popper")} <b>Perfect order!</b> ${rich(sec.success || "")}`; markDone(sec.id);
        return;
      }
      st.tries = (st.tries || 0) + 1; save();
      const wrong = marks.filter(m => !m).length;
      let msg = `<b>${wrong} step${wrong > 1 ? "s are" : " is"} in the wrong place</b> (shown in red). Move ${wrong > 1 ? "them" : "it"} and check again.`;
      if (st.tries >= 2) {
        const pos = marks.findIndex(m => !m);
        const should = sec.items.find(it => it.n === pos + 1);
        msg += `<br>${I("lightbulb")} Hint: step ${pos + 1} should be “${esc(should.label.replace(/<[^>]+>/g, ""))}”.`;
      }
      fb.className = "feedback show bad"; fb.innerHTML = msg;
    };
    btns.querySelector('[data-act="reset"]').onclick = () => { st.seq = sec.items.map((_, i) => i); st.tries = 0; save(); fb.className = "feedback"; draw(); };
    draw();
  };

  /* Robot dot: build a sequence of arrow commands that moves an LED dot to the goal on a 5x5 grid. */
  const ROBOT = { ARROW: { U: "arrow-up", D: "arrow-down", L: "arrow-left", R: "arrow-right" }, NAME: { U: "Up", D: "Down", L: "Left", R: "Right" }, DELTA: { U: [-1, 0], D: [1, 0], L: [0, -1], R: [0, 1] } };
  function robotShortest(lv) {
    const walls = new Set((lv.walls || []).map(([r, c]) => r * 5 + c));
    const prev = new Map([[lv.start[0] * 5 + lv.start[1], null]]);
    const queue = [lv.start];
    while (queue.length) {
      const [r, c] = queue.shift();
      if (r === lv.goal[0] && c === lv.goal[1]) break;
      for (const k of "URDL") {
        const [dr, dc] = ROBOT.DELTA[k], nr = r + dr, nc = c + dc, key = nr * 5 + nc;
        if (nr < 0 || nr > 4 || nc < 0 || nc > 4 || walls.has(key) || prev.has(key)) continue;
        prev.set(key, [r * 5 + c, k]); queue.push([nr, nc]);
      }
    }
    const path = [];
    let key = lv.goal[0] * 5 + lv.goal[1];
    while (prev.get(key)) { const [p, k] = prev.get(key); path.unshift(k); key = p; }
    return path;
  }
  R.robot = (sec, c) => {
    const { ARROW, NAME, DELTA } = ROBOT;
    const st = store.get("robot:" + sec.id, { done: [], progs: {}, cur: 0 });
    const MAX = sec.max || 16;
    const required = sec.required || sec.levels.length;
    const wrap = h(`
      <div class="robot">
        <div class="robot-levels" role="tablist" aria-label="Levels"></div>
        <div class="robot-main">
          <div class="robot-board" aria-label="LED grid"></div>
          <div class="robot-side">
            <p class="robot-task"></p>
            <div class="robot-cmds">${"UDLR".split("").map(k => `<button type="button" class="btn" data-cmd="${k}">${I(ARROW[k])} ${NAME[k]}</button>`).join("")}</div>
            <div class="robot-prog-head"><b>Your algorithm</b><span class="robot-count"></span></div>
            <ol class="robot-prog" aria-label="Your algorithm"></ol>
            <p class="robot-help">Click a step to delete it. You can also use the arrow keys on your keyboard.</p>
            <div class="row">
              <button type="button" class="btn primary" data-act="run">${I("play")} Run</button>
              <button type="button" class="btn ghost" data-act="clear">${I("trash-2")} Clear</button>
              <button type="button" class="btn ghost" data-act="restore" hidden>${I("rotate-ccw")} Get the buggy program back</button>
              <button type="button" class="btn ghost" data-act="answer" hidden>${I("eye")} Show an answer</button>
              <button type="button" class="btn" data-act="next" hidden>Next level ${I("arrow-right")}</button>
            </div>
            <div class="feedback" aria-live="polite"></div>
          </div>
        </div>
      </div>`);
    c.appendChild(wrap);
    const tabs = wrap.querySelector(".robot-levels"), board = wrap.querySelector(".robot-board"), task = wrap.querySelector(".robot-task");
    const progEl = wrap.querySelector(".robot-prog"), count = wrap.querySelector(".robot-count"), fb = wrap.querySelector(".feedback");
    const act = name => wrap.querySelector(`[data-act="${name}"]`);
    const cells = [];
    for (let r = 0; r < 5; r++) { cells.push([]); for (let col = 0; col < 5; col++) { const d = document.createElement("div"); d.className = "rcell"; board.appendChild(d); cells[r].push(d); } }
    let running = false;
    const lv = () => sec.levels[st.cur];
    const prog = () => (st.progs[st.cur] = st.progs[st.cur] || (lv().prefill ? lv().prefill.slice() : []));
    const save = () => store.set("robot:" + sec.id, st);
    const isWall = (r, col) => (lv().walls || []).some(([a, b]) => a === r && b === col);
    const sleep = ms => new Promise(res => setTimeout(res, ms));
    function drawBoard(dot, trail = []) {
      const g = lv().goal;
      cells.forEach((row, r) => row.forEach((cell, col) => {
        cell.className = "rcell" + (isWall(r, col) ? " wall" : "") + (g[0] === r && g[1] === col ? " goal" : "") +
          (trail.some(([a, b]) => a === r && b === col) ? " trail" : "") + (dot && dot[0] === r && dot[1] === col ? " dot" : "");
      }));
    }
    function drawTabs() {
      tabs.innerHTML = sec.levels.map((l, i) => `<button type="button" role="tab" aria-selected="${i === st.cur}" class="${i === st.cur ? "on" : ""} ${st.done.includes(i) ? "done" : ""}">${st.done.includes(i) ? I("check") + " " : ""}Level ${i + 1}</button>`).join("");
      tabs.querySelectorAll("button").forEach((b, i) => { b.onclick = () => { if (running) return; st.cur = i; save(); drawAll(); }; });
    }
    function drawProg(activeIdx = -1, badIdx = -1) {
      const p = prog();
      progEl.innerHTML = "";
      if (!p.length) progEl.appendChild(h(`<li class="empty">Click the arrows to add steps…</li>`));
      p.forEach((cmd, i) => {
        const li = h(`<li><button type="button" class="rstep${i === activeIdx ? " active" : ""}${i === badIdx ? " bad" : ""}" aria-label="Step ${i + 1}: ${NAME[cmd]}. Click to delete."><span class="n">${i + 1}</span>${I(ARROW[cmd])}</button></li>`);
        li.querySelector("button").onclick = () => { if (running) return; p.splice(i, 1); save(); fb.className = "feedback"; drawProg(); drawBoard(lv().start); };
        progEl.appendChild(li);
      });
      count.textContent = `${p.length} / ${MAX} steps`;
      wrap.querySelectorAll("[data-cmd]").forEach(b => { b.disabled = running || p.length >= MAX; });
    }
    function drawAll() {
      const l = lv();
      task.innerHTML = `<b>Level ${st.cur + 1}: ${esc(l.name)}.</b> ${rich(l.task)}` + (l.best ? ` <span class="best">Shortest: ${l.best} steps</span>` : "");
      fb.className = "feedback";
      act("restore").hidden = !l.prefill;
      act("answer").hidden = !TEACHER;
      act("next").hidden = true;
      drawTabs(); drawProg(); drawBoard(l.start);
    }
    function add(cmd) {
      if (running) return;
      const p = prog();
      if (p.length >= MAX) return;
      p.push(cmd); save(); fb.className = "feedback"; drawProg();
    }
    function lock(on) {
      running = on;
      ["run", "clear", "restore", "answer"].forEach(n => { act(n).disabled = on; });
      drawProg();
    }
    wrap.querySelectorAll("[data-cmd]").forEach(b => { b.onclick = () => add(b.dataset.cmd); });
    wrap.addEventListener("keydown", e => {
      const k = { ArrowUp: "U", ArrowDown: "D", ArrowLeft: "L", ArrowRight: "R" }[e.key];
      if (k && !e.target.closest("input, textarea, select")) { e.preventDefault(); add(k); }
    });
    act("clear").onclick = () => { prog().length = 0; save(); fb.className = "feedback"; drawProg(); drawBoard(lv().start); };
    act("restore").onclick = () => { st.progs[st.cur] = lv().prefill.slice(); save(); fb.className = "feedback"; drawProg(); drawBoard(lv().start); };
    act("answer").onclick = () => { st.progs[st.cur] = robotShortest(lv()); save(); drawProg(); };
    act("next").onclick = () => { st.cur = Math.min(st.cur + 1, sec.levels.length - 1); save(); drawAll(); };
    act("run").onclick = async () => {
      const p = prog(), l = lv();
      if (!p.length) { fb.className = "feedback show info"; fb.textContent = "Add some steps first: click the arrows."; return; }
      lock(true); fb.className = "feedback";
      let pos = l.start.slice();
      const trail = [];
      drawBoard(pos, trail);
      await sleep(300);
      for (let i = 0; i < p.length; i++) {
        drawProg(i);
        const [dr, dc] = DELTA[p[i]], nr = pos[0] + dr, nc = pos[1] + dc;
        const edge = nr < 0 || nr > 4 || nc < 0 || nc > 4;
        if (edge || isWall(nr, nc)) {
          lock(false); drawProg(-1, i);
          board.classList.remove("bump"); void board.offsetWidth; board.classList.add("bump");
          tones([[220, 120], [160, 220]], "sawtooth");
          fb.className = "feedback show bad";
          fb.innerHTML = `${I("circle-alert")} <b>Bump!</b> Step ${i + 1} (${NAME[p[i]]}) hits ${edge ? "the edge of the grid" : "a wall"}. That step is the <b>bug</b>: click it to delete it, then fix your algorithm and run it again.`;
          return;
        }
        trail.push(pos); pos = [nr, nc]; drawBoard(pos, trail);
        tones([[520 + i * 25, 50]], "sine");
        await sleep(420);
      }
      lock(false);
      if (pos[0] === l.goal[0] && pos[1] === l.goal[1]) {
        tones(SOUNDS.happy);
        if (!st.done.includes(st.cur)) st.done.push(st.cur);
        save(); drawTabs();
        const shortest = l.best && p.length === l.best;
        fb.className = "feedback show ok";
        fb.innerHTML = `${I("party-popper")} <b>You reached the heart in ${p.length} steps!</b> ` + (shortest ? I("trophy") + " That's the shortest possible algorithm." : l.best ? `The shortest algorithm has ${l.best} steps. Can you find it?` : "");
        if (st.done.length >= required) markDone(sec.id);
        act("next").hidden = st.cur >= sec.levels.length - 1;
      } else {
        fb.className = "feedback show bad";
        fb.innerHTML = "The dot stopped, but not on the heart. Add or change some steps, then run it again.";
      }
    };
    drawAll();
  };

  R.quiz = (sec, c) => {
    const quiz = h(`<div class="quiz"></div>`); c.appendChild(quiz);
    const res = {};
    const score = h(`<div class="score-card" aria-live="polite"></div>`);
    sec.questions.forEach((q, i) => {
      const box = h(`<div class="quiz-q"></div>`);
      box.appendChild(mcq(Object.assign({}, q, { q: `<span style="color:var(--muted)">${i + 1}.</span> ${q.q}` }), `quiz:${sec.id}:${i}`, (ok) => { res[i] = ok; update(); }));
      quiz.appendChild(box);
    });
    quiz.appendChild(score);
    function update() {
      const answered = Object.keys(res).length;
      if (answered < sec.questions.length) return;
      const right = Object.values(res).filter(Boolean).length;
      let msg;
      if (sec.bands) {
        const band = sec.bands.slice().sort((a, b) => b.min - a.min).find(b => right >= b.min);
        msg = band ? `<b><span class="lv-dot ${band.level || ""}"></span>${esc(band.label)}</b><br>${rich(band.text)}` : "";
      } else {
        msg = right === sec.questions.length ? "Perfect!" : right >= sec.questions.length - 1 ? "Great job!" : right >= sec.questions.length / 2 ? "Good effort. Read the explanations again." : "Keep practising. Ask your teacher about the tricky ones.";
      }
      score.innerHTML = `<div>${sec.diagnostic ? "Your group's starting point" : "Your group's score"}</div><div class="big">${right} / ${sec.questions.length}</div><p>${msg}</p><p style="font-size:.85rem;color:var(--muted)">${I("notebook-pen")} Reporter: ${sec.diagnostic ? "write this score and your route on the worksheet." : "write this score on your worksheet and show this screen to your teacher."}</p>`;
      score.classList.add("show");
      markDone(sec.id);
    }
  };

  R.reflect = (sec, c) => {
    const st = store.get("reflect", { r: {}, text: {} });
    const list = h(`<div></div>`); c.appendChild(list);
    const items = sec.items || L.objectives;
    items.forEach((o, i) => {
      const row = h(`<div class="reflect-row"><div>${rich(o)}</div><div class="traffic"><button type="button" data-v="1"><span class="lv-dot chal"></span>Not yet</button><button type="button" data-v="2"><span class="lv-dot ext"></span>Getting there</button><button type="button" data-v="3"><span class="lv-dot core"></span>Got it!</button></div></div>`);
      row.querySelectorAll("button").forEach(b => {
        if (String(st.r[i]) === b.dataset.v) b.classList.add("on");
        b.onclick = () => {
          st.r[i] = +b.dataset.v; store.set("reflect", st);
          row.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
          if (items.every((_, k) => st.r[k])) markDone(sec.id);
        };
      });
      list.appendChild(row);
    });
    (sec.prompts || []).forEach((p, i) => {
      const f = h(`<label class="field" style="margin-top:14px">${esc(p)}<textarea></textarea></label>`);
      const ta = f.querySelector("textarea"); ta.value = st.text[i] || "";
      ta.oninput = () => { st.text[i] = ta.value; store.set("reflect", st); };
      c.appendChild(f);
    });
  };

  R.glossary = (sec, c) => {
    c.appendChild(h(`<div class="glossary">${sec.terms.map(t => `<div><b>${esc(t.term)}</b><br>${esc(t.def)}</div>`).join("")}</div>`));
  };

  R.next = (sec, c) => {
    c.appendChild(h(`<div class="next-card"><div class="big-ic">${I(sec.icon || "rocket")}</div><div><h3 style="margin:0">${esc(sec.lesson)}</h3><p style="margin:0;color:var(--muted)">${rich(sec.teaser)}</p></div></div>`));
  };

  L.sections.forEach(sec => {
    const c = card(sec);
    (R[sec.type] || R.text)(sec, c);
    decorate(c);
    main.appendChild(c);
  });

  /* footer */
  const foot = h(`<footer class="page-foot">micro:bit Lab · ${esc(L.trackLabel)} · ${esc(L.id)} &nbsp;·&nbsp; <button type="button" class="btn small ghost" data-act="reset">${I("rotate-ccw")} Reset this page</button></footer>`);
  foot.querySelector("button").onclick = async () => {
    if (!confirm(STUDENT ? "Clear all your progress in this lesson? (Your teammates' copies don't change.)" : "Clear all progress on this page for this computer?")) return;
    store.reset();
    if (STUDENT) await ACC.flush();
    location.reload();
  };
  document.body.appendChild(foot);

  /* help drawer */
  const HELP = (L.help || []).concat([
    { q: "It says “Not saved yet” at the top", a: "The internet connection dropped. Keep working: the page keeps trying and saves everything when the connection comes back. Wait for <b>Saved</b> before you close the page." },
    { q: "I forgot my ID or password", a: "Ask your teacher: they can find your ID and give you a new password." },
    { q: "The Download button doesn't send my program to the micro:bit", a: "Use <b>Chrome</b> or <b>Edge</b>. Click the three dots <b>⋯</b> next to Download, choose <b>Connect device</b> and follow the steps. Still stuck? Use drag &amp; drop: download the .hex file and drag it onto the <b>MICROBIT</b> drive." },
    { q: "The computer can't find my micro:bit", a: "Unplug the cable and plug it back in. Try another USB port. Some cables can only charge and can't send programs: ask your teacher for another cable." },
    { q: "It works in the simulator but not on the micro:bit", a: "You probably forgot to <b>download again</b> after your last change. Every time you change the code, download it again." },
    { q: "The micro:bit shows a sad face and a number", a: "Something went wrong in the program. Download it again. If it keeps happening, tell your teacher the number." },
    { q: "Nothing happens on the micro:bit", a: "Is the red light on the back on? Press the <b>reset button</b> on the back. Check that your blocks are inside <b>on start</b> or <b>forever</b>." },
    { q: "Some of my blocks are grey / faded", a: "A faded block is not connected, so it will never run. Drag it until it <b>clicks</b> inside another block." },
    { q: "I deleted something by mistake", a: "Press <kbd>Ctrl</kbd> + <kbd>Z</kbd> to undo." },
    { q: "The battery pack doesn't work", a: "Check the switch on the battery pack is <b>ON</b> and the plug is pushed all the way into the battery socket. At the end of the lesson, switch it <b>OFF</b> to save the batteries." }
  ]);
  const fab = h(`<button type="button" class="btn primary help-fab">${I("life-buoy")} Stuck?</button>`);
  const back = h(`<div class="drawer-backdrop"></div>`);
  const drawer = h(`<aside class="drawer" aria-label="Help"><div class="drawer-head"><h2>${I("life-buoy")} Help</h2><button type="button" class="btn small ghost" data-act="close">${I("x")} Close</button></div><div class="drawer-body">
      <div class="ask3"><b>${I("hand")} Ask 3 before me</b><ol><li>Read the step again, slowly.</li><li>Try the <b>Hint</b> button.</li><li>Ask your group.</li></ol><div style="margin-top:6px">Still stuck? The <b>Reporter</b> raises a hand.</div></div>
      ${HELP.map(x => `<details class="faq"><summary>${x.q}</summary><div>${x.a}</div></details>`).join("")}
    </div></aside>`);
  const openD = o => { drawer.classList.toggle("show", o); back.classList.toggle("show", o); };
  fab.onclick = () => openD(true); back.onclick = () => openD(false); drawer.querySelector('[data-act="close"]').onclick = () => openD(false);
  document.addEventListener("keydown", e => { if (e.key === "Escape") openD(false); });
  document.body.append(fab, back, drawer);

  /* active section in nav */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { navList.querySelectorAll("a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id)); } });
  }, { rootMargin: "-40% 0px -55% 0px" });
  main.querySelectorAll("section.card[id]").forEach(s => io.observe(s));

  renderRoles();
  updateProgress();
  if (STUDENT) {
    if (session.recovered && onStoreChange) onStoreChange(); // send work kept on this computer
    if (!group.askedGroup && !(session.group || []).length && L.roles !== false) openGroupModal();
  } else {
    const stale = !group || !group.savedAt || Date.now() - group.savedAt > 90 * 60000;
    if (stale && !TEACHER && L.roles !== false) openGroupModal();
  }
})();
