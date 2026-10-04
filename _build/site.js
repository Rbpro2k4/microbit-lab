// Builds the public student website into dist/ (run by Netlify on every update).
// Only student files are copied: index.html, _shared/, and each lesson's *_student.html + *_lesson.js.
// Teacher plans, slides, worksheets, solution code and the build folder never reach the website.
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "dist");
const STUDENT_FILE = /_student\.html$|_lesson\.js$/;

fs.rmSync(OUT, { recursive: true, force: true });
const copied = [];
function copy(rel) {
  const dst = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(path.join(ROOT, rel), dst);
  copied.push(rel);
}

copy("index.html");
for (const f of fs.readdirSync(path.join(ROOT, "_shared"))) copy(path.posix.join("_shared", f));
for (const track of fs.readdirSync(ROOT).filter(d => d.startsWith("Track_"))) {
  for (const lesson of fs.readdirSync(path.join(ROOT, track))) {
    const dir = path.join(ROOT, track, lesson);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) if (STUDENT_FILE.test(f)) copy(path.posix.join(track, lesson, f));
  }
}
// Keep the site out of search engines.
fs.writeFileSync(path.join(OUT, "robots.txt"), "User-agent: *\nDisallow: /\n");

// Every lesson linked from the home page must exist in the site.
const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const missing = [...index.matchAll(/"(Track_[^"]+_student\.html)"/g)].map(m => m[1]).filter(p => !copied.includes(p));
if (missing.length) { console.error("Missing lesson pages:\n  " + missing.join("\n  ")); process.exit(1); }

console.log(`Student site built in dist/ (${copied.length} files):\n  ` + copied.join("\n  "));
