/* micro:bit Lab: a small virtual micro:bit (5x5 LED display, buttons A/B, touch logo)
   used for previews, demos and the LED designer. No dependencies. */
(function () {
  "use strict";

  // 5-row font. '#' = LED on. Glyphs are trimmed to their used width when scrolling.
  const FONT = {
    A: [".##.", "#..#", "####", "#..#", "#..#"], B: ["###.", "#..#", "###.", "#..#", "###."],
    C: [".###", "#...", "#...", "#...", ".###"], D: ["###.", "#..#", "#..#", "#..#", "###."],
    E: ["####", "#...", "###.", "#...", "####"], F: ["####", "#...", "###.", "#...", "#..."],
    G: [".###", "#...", "#.##", "#..#", ".##."], H: ["#..#", "#..#", "####", "#..#", "#..#"],
    I: ["###", ".#.", ".#.", ".#.", "###"], J: ["####", "...#", "...#", "#..#", ".##."],
    K: ["#..#", "#.#.", "##..", "#.#.", "#..#"], L: ["#...", "#...", "#...", "#...", "####"],
    M: ["#...#", "##.##", "#.#.#", "#...#", "#...#"], N: ["#...#", "##..#", "#.#.#", "#..##", "#...#"],
    O: [".##.", "#..#", "#..#", "#..#", ".##."], P: ["###.", "#..#", "###.", "#...", "#..."],
    Q: [".##.", "#..#", "#..#", "#.##", ".###"], R: ["###.", "#..#", "###.", "#.#.", "#..#"],
    S: [".###", "#...", ".##.", "...#", "###."], T: ["#####", "..#..", "..#..", "..#..", "..#.."],
    U: ["#..#", "#..#", "#..#", "#..#", ".##."], V: ["#...#", "#...#", "#...#", ".#.#.", "..#.."],
    W: ["#...#", "#...#", "#.#.#", "##.##", "#...#"], X: ["#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
    Y: ["#...#", ".#.#.", "..#..", "..#..", "..#.."], Z: ["#####", "...#.", "..#..", ".#...", "#####"],
    "0": [".#.", "#.#", "#.#", "#.#", ".#."], "1": [".#.", "##.", ".#.", ".#.", "###"],
    "2": ["###.", "...#", ".##.", "#...", "####"], "3": ["###.", "...#", ".##.", "...#", "###."],
    "4": ["..#.", ".##.", "#.#.", "####", "..#."], "5": ["####", "#...", "###.", "...#", "###."],
    "6": [".##.", "#...", "###.", "#..#", ".##."], "7": ["####", "...#", "..#.", ".#..", ".#.."],
    "8": [".##.", "#..#", ".##.", "#..#", ".##."], "9": [".##.", "#..#", ".###", "...#", ".##."],
    "!": ["#", "#", "#", ".", "#"], "?": [".##.", "#..#", "..#.", "....", "..#."],
    ".": [".", ".", ".", ".", "#"], ",": ["..", "..", "..", ".#", "#."], "-": ["...", "...", "###", "...", "..."],
    "'": ["#", "#", ".", ".", "."], ":": [".", "#", ".", "#", "."], "+": ["...", ".#.", "###", ".#.", "..."],
    "=": ["...", "###", "...", "###", "..."], "<": ["..#", ".#.", "#..", ".#.", "..#"], ">": ["#..", ".#.", "..#", ".#.", "#.."],
    "&": [".#..", "#.#.", ".#..", "#.#.", ".#.#"], "#": [".#.#.", "#####", ".#.#.", "#####", ".#.#."]
  };
  const SPACE = ["...", "...", "...", "...", "..."];

  // A subset of MakeCode's built-in icons (IconNames.*)
  const ICONS = {
    Heart: [".#.#.", "#####", "#####", ".###.", "..#.."],
    SmallHeart: [".....", ".#.#.", ".###.", "..#..", "....."],
    Yes: [".....", "....#", "...#.", "#.#..", ".#..."],
    No: ["#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
    Happy: [".....", ".#.#.", ".....", "#...#", ".###."],
    Sad: [".....", ".#.#.", ".....", ".###.", "#...#"],
    Confused: [".....", ".#.#.", ".....", ".#.#.", "#.#.#"],
    Angry: ["#...#", ".#.#.", ".....", "#####", "#.#.#"],
    Asleep: [".....", "##.##", ".....", ".###.", "....."],
    Surprised: [".#.#.", ".....", "..#..", ".#.#.", "..#.."],
    Silly: ["#...#", ".....", "#####", "...##", "...##"],
    Fabulous: ["#####", "##.##", ".....", ".#.#.", ".###."],
    Meh: [".#.#.", ".....", "...#.", "..#..", ".#..."],
    Diamond: ["..#..", ".#.#.", "#...#", ".#.#.", "..#.."],
    SmallDiamond: [".....", "..#..", ".#.#.", "..#..", "....."],
    Square: ["#####", "#...#", "#...#", "#...#", "#####"],
    SmallSquare: [".....", ".###.", ".#.#.", ".###.", "....."],
    Butterfly: ["##.##", "#####", "..#..", "#####", "##.##"],
    Ghost: ["#####", "#.#.#", "#####", "#####", "#.#.#"],
    Skull: [".###.", "#.#.#", "#####", ".###.", ".###."],
    Duck: [".##..", "###..", ".####", ".###.", "....."],
    House: ["..#..", ".###.", "#####", ".###.", ".#.#."],
    Tortoise: [".....", ".###.", "#####", ".#.#.", "....."],
    Giraffe: ["##...", ".#...", ".#...", ".###.", ".#.#."],
    Rabbit: ["#.#..", "#.#..", "####.", "##.#.", "####."],
    Target: ["..#..", ".###.", "##.##", ".###.", "..#.."],
    Triangle: [".....", "..#..", ".#.#.", "#####", "....."],
    Chessboard: [".#.#.", "#.#.#", ".#.#.", "#.#.#", ".#.#."],
    QuarterNote: ["..#..", "..#..", "..#..", "###..", "###.."],
    EighthNote: ["..#..", "..##.", "..#.#", "###..", "###.."],
    Umbrella: [".###.", "#####", "..#..", "#.#..", "###.."],
    Snake: ["##...", "##.##", ".#.#.", ".###.", "....."],
    Sword: ["..#..", "..#..", "..#..", ".###.", "..#.."],
    TShirt: ["##.##", "#####", ".###.", ".###.", ".###."],
    StickFigure: ["..#..", "#####", "..#..", ".#.#.", "#...#"],
    Scissors: ["##..#", "##.#.", "..#..", "##.#.", "##..#"]
  };

  const BLANK = () => [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
  function toMatrix(rows) {
    if (!rows) return BLANK();
    if (typeof rows === "string") rows = rows.trim().split(/\s*\n\s*|\s*\|\s*/);
    return rows.map(r => {
      const s = String(r).replace(/\s+/g, "");
      return [0, 1, 2, 3, 4].map(i => (s[i] === "#" || s[i] === "1") ? 1 : 0);
    });
  }
  function glyphColumns(ch) {
    const g = ch === " " ? SPACE : (FONT[ch.toUpperCase()] || FONT["?"]);
    const w = Math.max(...g.map(r => r.length));
    const cols = [];
    for (let c = 0; c < w; c++) cols.push(g.map(r => (r[c] === "#" ? 1 : 0)));
    if (ch === " ") return cols;
    // trim empty columns on both sides
    while (cols.length && cols[0].every(v => !v)) cols.shift();
    while (cols.length && cols[cols.length - 1].every(v => !v)) cols.pop();
    return cols.length ? cols : [[0, 0, 0, 0, 0]];
  }
  function textColumns(text) {
    const cols = [];
    [...String(text)].forEach((ch, i) => {
      if (i > 0) cols.push([0, 0, 0, 0, 0]);
      cols.push(...glyphColumns(ch));
    });
    return cols;
  }
  function matrixToRows(m) { return m.map(r => r.map(v => (v ? "#" : ".")).join("")); }

  const NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  let uid = 0;
  class MiniBit {
    /**
     * opts: { buttons: true, logo: true, shake: false, designer: false, caption: "", size: 300 }
     */
    constructor(container, opts = {}) {
      this.opts = Object.assign({ buttons: true, logo: true, shake: false, designer: false, caption: "" }, opts);
      this.handlers = {};
      this.runId = 0;
      this.matrix = BLANK();
      this.root = document.createElement("div");
      this.root.className = "minibit" + (this.opts.designer ? " designer" : "");
      container.appendChild(this.root);
      this._build();
      if (this.opts.shake || this.opts.controls) {
        this.controls = document.createElement("div");
        this.controls.className = "controls";
        this.root.appendChild(this.controls);
      }
      if (this.opts.shake) {
        const b = document.createElement("button");
        b.className = "btn small";
        b.type = "button";
        b.innerHTML = (window.MBIcon ? window.MBIcon("vibrate") : "") + " Shake";
        b.addEventListener("click", () => { this._wobble(); this._emit("shake"); });
        this.controls.appendChild(b);
      }
      if (this.opts.caption) {
        const c = document.createElement("div");
        c.className = "caption";
        c.textContent = this.opts.caption;
        this.root.appendChild(c);
      }
    }

    _build() {
      const id = "mb" + (++uid);
      const svg = el("svg", { viewBox: "0 0 300 250", role: "img", "aria-label": "Virtual micro:bit" }, this.root);
      this.svg = svg;
      const defs = el("defs", {}, svg);
      const f = el("filter", { id: id + "glow", x: "-80%", y: "-80%", width: "260%", height: "260%" }, defs);
      el("feGaussianBlur", { stdDeviation: "2.2", result: "b" }, f);
      const m = el("feMerge", {}, f);
      el("feMergeNode", { in: "b" }, m);
      el("feMergeNode", { in: "SourceGraphic" }, m);

      this.board = el("g", {}, svg);
      // board shape: rounded top corners, square bottom
      el("path", { d: "M0 24 Q0 0 24 0 H276 Q300 0 300 24 V250 H0 Z", fill: "#1c1f26" }, this.board);
      // edge connector
      el("rect", { x: 0, y: 212, width: 300, height: 38, fill: "#d4a72c" }, this.board);
      for (let x = 6; x < 300; x += 7) el("rect", { x, y: 214, width: 3.5, height: 36, fill: "#b88a16" }, this.board);
      const pads = [{ x: 30, l: "0" }, { x: 90, l: "1" }, { x: 150, l: "2" }, { x: 210, l: "3V" }, { x: 270, l: "GND" }];
      pads.forEach(p => {
        el("rect", { x: p.x - 19, y: 196, width: 38, height: 54, rx: 14, fill: "#e2b53a" }, this.board);
        el("circle", { cx: p.x, cy: 214, r: 10, fill: "#f4f6fb" }, this.board);
        const t = el("text", { x: p.x, y: 243, "text-anchor": "middle", "font-size": p.l === "GND" ? 10 : 12, "font-weight": 700, fill: "#3b2a00", "font-family": "Segoe UI, Arial" }, this.board);
        t.textContent = p.l;
      });

      // touch logo
      if (this.opts.logo !== false) {
        const lg = el("g", { class: "mb-logo", tabindex: 0, role: "button", "aria-label": "Touch logo" }, this.board);
        el("rect", { x: 128, y: 18, width: 44, height: 24, rx: 12, fill: "none", stroke: "#e2b53a", "stroke-width": 5 }, lg);
        el("circle", { cx: 141, cy: 30, r: 3.5, fill: "#e2b53a" }, lg);
        el("circle", { cx: 159, cy: 30, r: 3.5, fill: "#e2b53a" }, lg);
        const press = () => { lg.classList.add("pressed"); setTimeout(() => lg.classList.remove("pressed"), 200); this._emit("logo"); };
        lg.addEventListener("click", press);
        lg.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); press(); } });
      }

      // LEDs
      this.leds = [];
      for (let r = 0; r < 5; r++) {
        this.leds.push([]);
        for (let c = 0; c < 5; c++) {
          const x = 98 + c * 26, y = 58 + r * 28;
          const led = el("rect", { class: "led", x: x - 5, y: y - 8, width: 10, height: 16, rx: 2, fill: "#3a3f4a" }, this.board);
          led.dataset.r = r; led.dataset.c = c;
          if (this.opts.designer) {
            led.setAttribute("tabindex", "0");
            led.setAttribute("role", "button");
            led.setAttribute("aria-label", `LED row ${r + 1} column ${c + 1}`);
            const toggle = () => { this.matrix[r][c] = this.matrix[r][c] ? 0 : 1; this._paint(); this._emit("change", this.getRows()); };
            led.addEventListener("click", toggle);
            led.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
          }
          this.leds[r].push(led);
        }
      }
      this.glowId = id + "glow";

      // buttons
      this.btn = {};
      if (this.opts.buttons !== false) {
        [["A", 38], ["B", 262]].forEach(([name, cx]) => {
          const g = el("g", { class: "mb-btn", tabindex: 0, role: "button", "aria-label": "Button " + name }, this.board);
          this.btn[name] = g;
          el("rect", { x: cx - 19, y: 96, width: 38, height: 38, rx: 4, fill: "#b8bec8" }, g);
          el("circle", { cx, cy: 115, r: 11, fill: "#14161b" }, g);
          const t = el("text", { x: cx, y: 152, "text-anchor": "middle", "font-size": 13, "font-weight": 800, fill: "#7fb4ff", "font-family": "Segoe UI, Arial" }, this.board);
          t.textContent = name;
          const press = () => { g.classList.add("pressed"); setTimeout(() => g.classList.remove("pressed"), 150); this._emit(name); };
          g.addEventListener("click", press);
          g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); press(); } });
        });
      }
    }

    _paint() {
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
        const v = this.matrix[r][c];
        const led = this.leds[r][c];
        led.setAttribute("fill", v ? "#ff3326" : "#3a3f4a");
        if (v) led.setAttribute("filter", `url(#${this.glowId})`); else led.removeAttribute("filter");
      }
    }
    _emit(name, data) { (this.handlers[name] || []).forEach(fn => fn(data)); }
    _wobble() {
      this.svg.animate([{ transform: "rotate(0)" }, { transform: "rotate(-6deg)" }, { transform: "rotate(6deg)" }, { transform: "rotate(-4deg)" }, { transform: "rotate(0)" }], { duration: 400 });
    }
    on(name, fn) { (this.handlers[name] = this.handlers[name] || []).push(fn); return this; }

    // ----- display API -----
    show(rowsOrMatrix) {
      const m = Array.isArray(rowsOrMatrix) && Array.isArray(rowsOrMatrix[0]) ? rowsOrMatrix.map(r => r.slice()) : toMatrix(rowsOrMatrix);
      this.matrix = m; this._paint();
    }
    showIcon(name) { this.show(ICONS[name] || ICONS.Heart); }
    clear() { this.show(BLANK()); }
    getRows() { return matrixToRows(this.matrix); }

    stop() { this.runId++; }
    _sleep(ms, id) {
      return new Promise((res, rej) => setTimeout(() => (id === this.runId ? res() : rej(new Error("stopped"))), ms));
    }
    /** Like MakeCode's show string / show number: one character stays still, longer text scrolls. */
    async showText(text, interval = 150, id = this.runId) {
      const s = String(text);
      if (s.length !== 1) return this.scroll(s, interval, id);
      const cols = glyphColumns(s);
      const off = Math.max(0, Math.floor((5 - cols.length) / 2));
      const m = BLANK();
      cols.slice(0, 5).forEach((col, c) => col.forEach((v, r) => { m[r][c + off] = v; }));
      this.matrix = m; this._paint();
      await this._sleep(interval * 5, id);
    }
    pressAnim(name) {
      const g = this.btn[name];
      if (!g) return;
      g.classList.add("pressed");
      setTimeout(() => g.classList.remove("pressed"), 250);
    }
    async scroll(text, interval = 150, id = this.runId) {
      const cols = [...Array(5).fill([0, 0, 0, 0, 0]), ...textColumns(text), ...Array(5).fill([0, 0, 0, 0, 0])];
      for (let off = 0; off <= cols.length - 5; off++) {
        const m = BLANK();
        for (let c = 0; c < 5; c++) for (let r = 0; r < 5; r++) m[r][c] = cols[off + c][r];
        this.matrix = m; this._paint();
        await this._sleep(interval, id);
      }
    }

    /** Run a demo script. ops: ["scroll", text] | ["text", text] | ["number", n] | ["icon", name, ms] | ["leds", rows, ms]
        | ["pause", ms] | ["clear"] | ["shake"] | ["press", "A"|"B"] | ["loop", n | "forever", ops] */
    async run(ops) {
      this.stop();
      const id = this.runId;
      const exec = async (list) => {
        for (const op of list) {
          const [k, a, b] = op;
          if (k === "scroll") await this.scroll(a, b || 150, id);
          else if (k === "text" || k === "number") await this.showText(String(a), b || 150, id);
          else if (k === "shake") { this._wobble(); await this._sleep(a || 550, id); }
          else if (k === "press") { this.pressAnim(a); await this._sleep(b || 350, id); }
          else if (k === "icon") { this.showIcon(a); await this._sleep(b == null ? 600 : b, id); }
          else if (k === "leds") { this.show(a); await this._sleep(b == null ? 400 : b, id); }
          else if (k === "pause") await this._sleep(a, id);
          else if (k === "clear") this.clear();
          else if (k === "loop") { for (let i = 0; i < (a === "forever" ? 1e9 : a); i++) await exec(b); }
        }
      };
      try { await exec(ops); return true; } catch (e) { return false; }
    }
  }

  /** Tiny static LED thumbnail (for frame lists). */
  function ledThumb(rows) {
    const m = toMatrix(rows);
    const svg = el("svg", { viewBox: "0 0 50 50" });
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++)
      el("rect", { x: 3 + c * 9.5, y: 3 + r * 9.5, width: 6, height: 7, rx: 1, fill: m[r][c] ? "#ff3326" : "#3a3f4a" }, svg);
    return svg;
  }

  window.MiniBit = MiniBit;
  window.MiniBitUtil = { ICONS, FONT, toMatrix, matrixToRows, textColumns, ledThumb, BLANK };
})();
