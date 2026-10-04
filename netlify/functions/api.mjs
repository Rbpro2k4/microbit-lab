// micro:bit Lab API: a Netlify Function that answers every /api/* request.
// Data lives in MongoDB Atlas (environment variable MONGODB_URI). The teacher logs in with TEACHER_PASSWORD.
// The live site uses the "microbit" database; test deploys (dev branch, previews, local) use "microbit_dev".
import crypto from "node:crypto";

const CLASSES = { EB7: "A", EB8: "A", EB9: "B", Second: "B" };
const ID_PREFIX = { EB7: "EB7", EB8: "EB8", EB9: "EB9", Second: "SEC" };
const SESSION_HOURS = 10;            // students log in again each school day
const SIGNUP_MAX_MINUTES = 30;
const MAX_FAILS = 8;                 // wrong passwords before a short lock
const LOCK_MINUTES = 5;
const MAX_TEAMMATES = 4;
const MAX_PROGRESS_CHARS = 60000;    // one lesson's saved data
const LESSON_ID = /^[AB]\d{1,2}$/;

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const env = name => (globalThis.Netlify?.env?.get?.(name)) ?? process.env[name];
const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});

/* ---------------- database ---------------- */
let clientPromise = null;
const indexed = new Set();
function dbName(context, req) {
  if (env("DB_NAME")) return env("DB_NAME");
  const deployContext = context?.deploy?.context;
  if (deployContext) return deployContext === "production" ? "microbit" : "microbit_dev";
  const host = new URL(req.url).hostname;
  return host.includes("--") || host === "localhost" || host === "127.0.0.1" ? "microbit_dev" : "microbit";
}
async function getDb(context, req) {
  if (globalThis.__MBLAB_TEST_DB__) return globalThis.__MBLAB_TEST_DB__; // local tests
  const uri = env("MONGODB_URI");
  if (!uri) throw new HttpError(500, "The database is not set up yet (MONGODB_URI is missing in Netlify).");
  if (!clientPromise) {
    const { MongoClient } = await import("mongodb");
    clientPromise = new MongoClient(uri, { serverSelectionTimeoutMS: 7000, maxPoolSize: 5 }).connect()
      .catch(e => { clientPromise = null; throw e; });
  }
  const name = dbName(context, req);
  const db = (await clientPromise).db(name);
  if (!indexed.has(name)) {
    await Promise.all([
      db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db.collection("students").createIndex({ class: 1 }),
      db.collection("progress").createIndex({ studentId: 1 })
    ]);
    indexed.add(name);
  }
  return db;
}

/* ---------------- passwords and sessions ---------------- */
function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  return `scrypt$${salt.toString("base64")}$${crypto.scryptSync(pw, salt, 64).toString("base64")}`;
}
function checkPassword(pw, stored) {
  const [alg, salt, hash] = String(stored || "").split("$");
  if (alg !== "scrypt" || !salt || !hash) return false;
  const got = crypto.scryptSync(pw, Buffer.from(salt, "base64"), 64), want = Buffer.from(hash, "base64");
  return got.length === want.length && crypto.timingSafeEqual(got, want);
}
function sameSecret(a, b) {
  const x = crypto.createHash("sha256").update(String(a)).digest(), y = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}
async function createSession(db, fields) {
  const token = crypto.randomBytes(32).toString("base64url");
  const now = new Date(), expiresAt = new Date(now.getTime() + SESSION_HOURS * 3600e3);
  await db.collection("sessions").insertOne({ _id: token, ...fields, group: [], createdAt: now, expiresAt });
  return { token, expiresAt };
}
async function readSession(db, req) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token || token.length > 100) return null;
  const s = await db.collection("sessions").findOne({ _id: token });
  return s && s.expiresAt > new Date() ? s : null;
}

/* ---------------- students ---------------- */
const cleanName = s => String(s || "").replace(/\s+/g, " ").trim();
const nameKey = s => cleanName(s).toLowerCase();
/** "eb7 14", "EB7014", "eb7-014" -> "EB7-014"; "sec 3" -> "SEC-003". */
function normalizeId(raw) {
  const s = String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const m = s.match(/^(EB7|EB8|EB9|SEC)(\d{1,4})$/);
  return m ? `${m[1]}-${m[2].padStart(3, "0")}` : "";
}
const publicStudent = st => ({ id: st._id, name: st.name, class: st.class, track: st.track });
function validateNewStudent({ name, cls, password }) {
  name = cleanName(name);
  if (name.length < 3 || name.length > 60) throw new HttpError(400, "Please type your full name.");
  if (name.split(" ").length < 2) throw new HttpError(400, "Please type your first name and your last name.");
  if (!CLASSES[cls]) throw new HttpError(400, "Please choose your class.");
  validatePassword(password);
  return name;
}
function validatePassword(password) {
  if (typeof password !== "string" || password.length < 4) throw new HttpError(400, "The password needs at least 4 characters.");
  if (password.length > 60) throw new HttpError(400, "The password is too long (60 characters maximum).");
}
async function nextId(db, cls) {
  const c = await db.collection("counters").findOneAndUpdate({ _id: cls }, { $inc: { n: 1 } }, { upsert: true, returnDocument: "after" });
  const doc = c && c.value !== undefined && c._id === undefined ? c.value : c; // driver v6 returns the document; older versions wrap it
  return `${ID_PREFIX[cls]}-${String(doc.n).padStart(3, "0")}`;
}
async function createStudent(db, { name, cls, password }) {
  name = validateNewStudent({ name, cls, password });
  const twin = await db.collection("students").findOne({ class: cls, nameKey: nameKey(name) });
  if (twin) throw new HttpError(409, `${name} already has an account in ${cls} (ID ${twin._id}). Log in with that ID, or ask your teacher.`);
  const now = new Date();
  const st = { _id: await nextId(db, cls), name, nameKey: nameKey(name), class: cls, track: CLASSES[cls], pass: hashPassword(password), createdAt: now, lastLogin: null, fails: 0 };
  await db.collection("students").insertOne(st);
  return st;
}
async function members(db, ids) {
  if (!ids || !ids.length) return [];
  const list = await db.collection("students").find({ _id: { $in: ids } }).toArray();
  return ids.map(id => list.find(s => s._id === id)).filter(Boolean).map(publicStudent);
}

/* ---------------- sign-up mode ---------------- */
async function signupState(db) {
  const doc = await db.collection("config").findOne({ _id: "signup" });
  const open = !!(doc && doc.openUntil && doc.openUntil > new Date());
  return { open, endsAt: open ? doc.openUntil : null };
}

/* ---------------- progress ---------------- */
/** Group save: the group's work fills in a teammate's lesson, without losing sections they finished themselves. */
function mergeProgress(base, incoming) {
  const out = Object.assign({}, base || {}, incoming);
  const done = new Set([...((base && base.done) || []), ...(incoming.done || [])]);
  if (done.size) out.done = [...done];
  return out;
}

/* ---------------- request helpers ---------------- */
function needStudent(session) {
  if (!session || session.role !== "student") throw new HttpError(401, "Please log in again.");
  return session;
}
function needTeacher(session) {
  if (!session || session.role !== "teacher") throw new HttpError(401, "Please log in as the teacher.");
  return session;
}
async function readBody(req) {
  if (!["POST", "PUT"].includes(req.method)) return {};
  const text = await req.text();
  if (text.length > MAX_PROGRESS_CHARS + 5000) throw new HttpError(413, "This is too much data to save.");
  if (!text) return {};
  try { const b = JSON.parse(text); return b && typeof b === "object" ? b : {}; }
  catch (e) { throw new HttpError(400, "Bad request."); }
}
const str = v => (typeof v === "string" ? v : "");

/* ---------------- routes ---------------- */
const ROUTES = {
  "GET /status": async ({ db, context, req }) => ({
    ok: true, database: dbName(context, req) === "microbit" ? "live" : "test",
    signup: await signupState(db), classes: Object.keys(CLASSES)
  }),

  "POST /signup": async ({ db, body }) => {
    if (!(await signupState(db)).open) throw new HttpError(403, "Sign-up is closed. Ask your teacher to open it.");
    const st = await createStudent(db, { name: body.name, cls: str(body.class), password: body.password });
    await db.collection("students").updateOne({ _id: st._id }, { $set: { lastLogin: new Date() } });
    const s = await createSession(db, { role: "student", studentId: st._id });
    return { ...s, role: "student", user: publicStudent(st), group: [] };
  },

  "POST /login": async ({ db, body }) => {
    const id = normalizeId(body.id), password = str(body.password);
    const st = id && await db.collection("students").findOne({ _id: id });
    if (!st) throw new HttpError(401, "Wrong ID or password.");
    const now = new Date();
    if (st.lockedUntil && st.lockedUntil > now) {
      const min = Math.ceil((st.lockedUntil - now) / 60000);
      throw new HttpError(429, `Too many wrong tries. Wait ${min} minute${min > 1 ? "s" : ""}, or ask your teacher.`);
    }
    if (!checkPassword(password, st.pass)) {
      const fails = (st.fails || 0) + 1;
      const $set = fails >= MAX_FAILS ? { fails: 0, lockedUntil: new Date(now.getTime() + LOCK_MINUTES * 60000) } : { fails };
      await db.collection("students").updateOne({ _id: id }, { $set });
      throw new HttpError(401, "Wrong ID or password.");
    }
    await db.collection("students").updateOne({ _id: id }, { $set: { fails: 0, lockedUntil: null, lastLogin: now } });
    const s = await createSession(db, { role: "student", studentId: id });
    return { ...s, role: "student", user: publicStudent(st), group: [] };
  },

  "POST /teacher/login": async ({ db, body }) => {
    const secret = env("TEACHER_PASSWORD");
    if (!secret) throw new HttpError(500, "The teacher password is not set yet (TEACHER_PASSWORD in Netlify).");
    const lock = await db.collection("config").findOne({ _id: "teacherLock" });
    const now = new Date();
    if (lock && lock.lockedUntil && lock.lockedUntil > now) throw new HttpError(429, "Too many wrong tries. Wait a few minutes.");
    if (!sameSecret(str(body.password), secret)) {
      const fails = ((lock && lock.fails) || 0) + 1;
      const $set = fails >= MAX_FAILS ? { fails: 0, lockedUntil: new Date(now.getTime() + LOCK_MINUTES * 60000) } : { fails };
      await db.collection("config").updateOne({ _id: "teacherLock" }, { $set }, { upsert: true });
      throw new HttpError(401, "Wrong teacher password.");
    }
    await db.collection("config").updateOne({ _id: "teacherLock" }, { $set: { fails: 0, lockedUntil: null } }, { upsert: true });
    const s = await createSession(db, { role: "teacher" });
    return { ...s, role: "teacher", user: { name: "Teacher" } };
  },

  "POST /logout": async ({ db, session }) => {
    if (session) await db.collection("sessions").deleteOne({ _id: session._id });
    return { ok: true };
  },

  "GET /me": async ({ db, session }) => {
    if (!session) throw new HttpError(401, "Please log in.");
    if (session.role === "teacher") return { role: "teacher", user: { name: "Teacher" }, signup: await signupState(db) };
    const st = await db.collection("students").findOne({ _id: session.studentId });
    if (!st) { await db.collection("sessions").deleteOne({ _id: session._id }); throw new HttpError(401, "This account no longer exists."); }
    return { role: "student", user: publicStudent(st), group: await members(db, session.group) };
  },

  "GET /progress": async ({ db, session, url }) => {
    const s = needStudent(session);
    const lesson = url.searchParams.get("lesson");
    if (lesson) {
      if (!LESSON_ID.test(lesson)) throw new HttpError(400, "Unknown lesson.");
      const doc = await db.collection("progress").findOne({ _id: `${s.studentId}:${lesson}` });
      return { lesson, data: doc ? doc.data : null, updatedAt: doc ? doc.updatedAt : null };
    }
    const docs = await db.collection("progress").find({ studentId: s.studentId }).toArray();
    return { lessons: docs.map(d => ({ lesson: d.lesson, summary: d.summary || null, updatedAt: d.updatedAt })) };
  },

  "PUT /progress": async ({ db, session, body }) => {
    const s = needStudent(session);
    const lesson = str(body.lesson);
    if (!LESSON_ID.test(lesson)) throw new HttpError(400, "Unknown lesson.");
    const data = body.data && typeof body.data === "object" && !Array.isArray(body.data) ? body.data : null;
    if (!data) throw new HttpError(400, "Nothing to save.");
    if (JSON.stringify(data).length > MAX_PROGRESS_CHARS) throw new HttpError(413, "This is too much data to save.");
    const summary = body.summary && typeof body.summary === "object" && JSON.stringify(body.summary).length < 3000 ? body.summary : null;
    const now = new Date(), col = db.collection("progress");
    await col.updateOne({ _id: `${s.studentId}:${lesson}` },
      { $set: { studentId: s.studentId, lesson, data, summary, updatedAt: now, updatedBy: s.studentId } }, { upsert: true });
    const team = (s.group || []).filter(id => id !== s.studentId);
    for (const id of team) {
      const doc = await col.findOne({ _id: `${id}:${lesson}` });
      await col.updateOne({ _id: `${id}:${lesson}` },
        { $set: { studentId: id, lesson, data: mergeProgress(doc && doc.data, data), summary, updatedAt: now, updatedBy: s.studentId } }, { upsert: true });
    }
    return { ok: true, savedFor: [s.studentId, ...team], updatedAt: now };
  },

  "GET /group": async ({ db, session }) => ({ group: await members(db, needStudent(session).group) }),

  "POST /group": async ({ db, session, body }) => {
    const s = needStudent(session);
    const raw = Array.isArray(body.ids) ? body.ids : [];
    const ids = [...new Set(raw.map(normalizeId).filter(Boolean))].filter(id => id !== s.studentId);
    if (raw.some(r => !normalizeId(r))) throw new HttpError(400, "An ID looks wrong. IDs look like EB7-014.");
    if (ids.length > MAX_TEAMMATES) throw new HttpError(400, `A group can have at most ${MAX_TEAMMATES + 1} students.`);
    const me = await db.collection("students").findOne({ _id: s.studentId });
    const found = await db.collection("students").find({ _id: { $in: ids } }).toArray();
    for (const id of ids) {
      const st = found.find(x => x._id === id);
      if (!st) throw new HttpError(404, `There is no student with the ID ${id}.`);
      if (me && st.track !== me.track) throw new HttpError(400, `${st.name} (${id}) is in ${st.class}, which does not follow the same lessons as your class.`);
    }
    await db.collection("sessions").updateOne({ _id: s._id }, { $set: { group: ids } });
    return { group: await members(db, ids) };
  },

  /* ---------- teacher ---------- */
  "GET /teacher/overview": async ({ db, session, url }) => {
    needTeacher(session);
    const cls = url.searchParams.get("class");
    const filter = cls && CLASSES[cls] ? { class: cls } : {};
    const students = await db.collection("students").find(filter).toArray();
    const ids = students.map(s => s._id);
    const progress = ids.length ? await db.collection("progress").find({ studentId: { $in: ids } }).toArray() : [];
    const now = new Date();
    return {
      signup: await signupState(db), classes: CLASSES,
      students: students.sort((a, b) => a._id.localeCompare(b._id)).map(s => ({
        ...publicStudent(s), createdAt: s.createdAt, lastLogin: s.lastLogin, locked: !!(s.lockedUntil && s.lockedUntil > now)
      })),
      progress: progress.map(p => ({ studentId: p.studentId, lesson: p.lesson, summary: p.summary || null, updatedAt: p.updatedAt, updatedBy: p.updatedBy }))
    };
  },

  "GET /teacher/progress": async ({ db, session, url }) => {
    needTeacher(session);
    const id = normalizeId(url.searchParams.get("student")), lesson = url.searchParams.get("lesson") || "";
    if (!id || !LESSON_ID.test(lesson)) throw new HttpError(400, "Bad request.");
    const doc = await db.collection("progress").findOne({ _id: `${id}:${lesson}` });
    return { data: doc ? doc.data : null, summary: doc ? doc.summary : null, updatedAt: doc ? doc.updatedAt : null, updatedBy: doc ? doc.updatedBy : null };
  },

  "POST /teacher/signup": async ({ db, session, body }) => {
    needTeacher(session);
    const minutes = Math.max(0, Math.min(SIGNUP_MAX_MINUTES, Number(body.minutes) || 0));
    const openUntil = minutes ? new Date(Date.now() + minutes * 60000) : null;
    await db.collection("config").updateOne({ _id: "signup" }, { $set: { openUntil } }, { upsert: true });
    return { signup: await signupState(db) };
  },

  "POST /teacher/students/add": async ({ db, session, body }) => {
    needTeacher(session);
    const st = await createStudent(db, { name: body.name, cls: str(body.class), password: body.password });
    return { student: publicStudent(st) };
  },

  "POST /teacher/students/update": async ({ db, session, body }) => {
    needTeacher(session);
    const id = normalizeId(body.id), cls = str(body.class), name = cleanName(body.name);
    if (!id) throw new HttpError(400, "Bad ID.");
    if (!CLASSES[cls]) throw new HttpError(400, "Please choose a class.");
    if (name.length < 3 || name.length > 60) throw new HttpError(400, "Please type the full name.");
    const r = await db.collection("students").updateOne({ _id: id }, { $set: { name, nameKey: nameKey(name), class: cls, track: CLASSES[cls] } });
    if (!r.matchedCount) throw new HttpError(404, "Student not found.");
    return { ok: true };
  },

  "POST /teacher/students/password": async ({ db, session, body }) => {
    needTeacher(session);
    const id = normalizeId(body.id);
    validatePassword(body.password);
    const r = await db.collection("students").updateOne({ _id: id }, { $set: { pass: hashPassword(body.password), fails: 0, lockedUntil: null } });
    if (!r.matchedCount) throw new HttpError(404, "Student not found.");
    await db.collection("sessions").deleteMany({ studentId: id });
    return { ok: true };
  },

  "POST /teacher/students/delete": async ({ db, session, body }) => {
    needTeacher(session);
    const id = normalizeId(body.id);
    if (!id) throw new HttpError(400, "Bad ID.");
    await db.collection("students").deleteOne({ _id: id });
    await db.collection("progress").deleteMany({ studentId: id });
    await db.collection("sessions").deleteMany({ studentId: id });
    return { ok: true };
  },

  "POST /teacher/students/clear": async ({ db, session, body }) => {
    needTeacher(session);
    const id = normalizeId(body.id), lesson = str(body.lesson);
    if (!id || !LESSON_ID.test(lesson)) throw new HttpError(400, "Bad request.");
    await db.collection("progress").deleteOne({ _id: `${id}:${lesson}` });
    return { ok: true };
  },

  "POST /teacher/logout-students": async ({ db, session }) => {
    needTeacher(session);
    const r = await db.collection("sessions").deleteMany({ role: "student" });
    return { ok: true, count: r.deletedCount || 0 };
  }
};

export default async (req, context) => {
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/api/, "").replace(/\/+$/, "") || "/";
    const route = ROUTES[`${req.method} ${path}`];
    if (!route) return json({ error: "Not found." }, 404);
    const db = await getDb(context, req);
    const body = await readBody(req);
    const session = await readSession(db, req);
    return json(await route({ db, req, url, body, session, context }));
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error(e);
    const offline = /ECONN|ENOTFOUND|timed out|Server selection|MongoNetwork/i.test(String(e && (e.message || e.name)));
    return json({ error: offline ? "The database can't be reached right now. Try again in a minute." : "Server error. Please try again." }, offline ? 503 : 500);
  }
};

export const config = { path: "/api/*" };

// for local tests
export const _internal = { normalizeId, mergeProgress, hashPassword, checkPassword };
