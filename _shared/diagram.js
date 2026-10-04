/* micro:bit Lab: interactive "Meet the micro:bit" explorer (front + back of a V2 board).
   Layout follows the official V2 feature diagrams on microbit.org. */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  // tag codes: in, out, both, proc, power, conn
  const PARTS = [
    { id: "buttons", side: "front", x: 95, y: 178, name: "Buttons A and B", tags: ["in"],
      desc: "Press them to give the micro:bit instructions, like \"show my name\" or \"start the game\". You can also press both at the same time (A+B)." },
    { id: "leds", side: "front", x: 455, y: 336, name: "LED display", tags: ["out", "in"],
      desc: "25 tiny lights (LEDs) in a 5 × 5 grid. They show words, numbers and pictures. Surprise: the LEDs can also measure how bright the room is, so they are a light sensor too!" },
    { id: "logo", side: "front", x: 222, y: 87, name: "Touch logo", tags: ["in"], v2: true,
      desc: "Touch the gold logo with your finger and the micro:bit can react, just like a button." },
    { id: "micled", side: "front", x: 448, y: 100, name: "Microphone light", tags: ["out"], v2: true,
      desc: "This small light turns on when the microphone is listening." },
    { id: "pins", side: "front", x: 190, y: 362, name: "Pins 0, 1 and 2", tags: ["in", "out"],
      desc: "Connect crocodile clips or wires here to add lights, buzzers or homemade buttons. These pins are also touch-sensitive." },
    { id: "power", side: "front", x: 490, y: 362, name: "3V and GND pins", tags: ["power"],
      desc: "3V gives out a small amount of electricity (3 volts) for circuits. GND (ground) completes the circuit. Never connect 3V and GND directly together!" },

    { id: "processor", side: "back", x: 150, y: 255, name: "Processor", tags: ["proc"],
      desc: "The brain of the micro:bit. It runs your program step by step, millions of times per second. It also has a temperature sensor inside it." },
    { id: "speaker", side: "back", x: 310, y: 285, name: "Speaker", tags: ["out"], v2: true,
      desc: "Plays sounds, music and sound effects." },
    { id: "mic", side: "back", x: 232, y: 190, name: "Microphone", tags: ["in"], v2: true,
      desc: "Hears how loud it is, so you can make projects that react to claps or noise." },
    { id: "motion", side: "back", x: 152, y: 372, name: "Accelerometer & compass", tags: ["in"],
      desc: "The accelerometer feels movement: shake, tilt and falling. The compass senses the Earth's magnetic field to find north." },
    { id: "antenna", side: "back", x: 92, y: 108, name: "Radio & Bluetooth antenna", tags: ["in", "out"],
      desc: "Lets micro:bits send messages to each other without wires. It can also connect to phones and tablets with Bluetooth." },
    { id: "usb", side: "back", x: 310, y: 80, name: "Micro USB socket", tags: ["conn"],
      desc: "Plug the cable in here to power the micro:bit and to download your programs from the computer." },
    { id: "battery", side: "back", x: 540, y: 112, name: "Battery socket", tags: ["power"],
      desc: "Connect the battery pack here so your micro:bit works without a computer." },
    { id: "reset", side: "back", x: 437, y: 110, name: "Reset & power button", tags: ["in"],
      desc: "Press it once to restart your program from the beginning. Hold it down to switch the micro:bit off (press again to wake it)." },
    { id: "usbchip", side: "back", x: 480, y: 255, name: "USB interface chip", tags: ["conn"],
      desc: "A helper chip that talks to the computer and copies your program onto the processor." },
    { id: "status", side: "back", x: 228, y: 78, name: "Power & USB lights", tags: ["out"],
      desc: "The red light means the micro:bit has power. The yellow light flashes while a program is being downloaded." }
  ];
  const TAG_LABEL = { in: ["in", "INPUT"], out: ["out", "OUTPUT"], both: ["both", "INPUT + OUTPUT"], proc: ["proc", "PROCESS"], power: ["power", "POWER"], conn: ["conn", "CONNECTION"] };

  function boardBase(svg, side) {
    el("path", { d: "M10 50 Q10 10 50 10 H570 Q610 10 610 50 V490 H10 Z", fill: "#1c1f26" }, svg);
    el("circle", { cx: 26, cy: 250, r: 7, fill: "#0e1118" }, svg);
    el("circle", { cx: 594, cy: 250, r: 7, fill: "#0e1118" }, svg);
    el("rect", { x: 10, y: 428, width: 600, height: 62, fill: "#d4a72c" }, svg);
    for (let x = 16; x < 606; x += 13) el("rect", { x, y: 432, width: 6, height: 58, fill: "#b88a16" }, svg);
    const xs = [70, 190, 310, 430, 550];
    const labels = side === "front" ? ["0", "1", "2", "3V", "GND"] : null;
    xs.forEach((x, i) => {
      el("rect", { x: x - 38, y: 396, width: 76, height: 94, rx: 28, fill: "#e2b53a" }, svg);
      el("circle", { cx: x, cy: 430, r: 21, fill: "#0e1118" }, svg);
      if (labels) {
        const t = el("text", { x, y: 478, "text-anchor": "middle", "font-size": labels[i] === "GND" ? 19 : 22, "font-weight": 800, fill: "#3b2a00", "font-family": "Segoe UI, Arial" }, svg);
        t.textContent = labels[i];
      }
    });
  }

  function drawFront(svg) {
    boardBase(svg, "front");
    // touch logo
    el("rect", { x: 262, y: 62, width: 96, height: 50, rx: 25, fill: "none", stroke: "#e2b53a", "stroke-width": 9 }, svg);
    el("circle", { cx: 289, cy: 87, r: 7, fill: "#e2b53a" }, svg);
    el("circle", { cx: 331, cy: 87, r: 7, fill: "#e2b53a" }, svg);
    // microphone LED + icon
    el("circle", { cx: 398, cy: 100, r: 5, fill: "none", stroke: "#e2b53a", "stroke-width": 2 }, svg);
    el("rect", { x: 410, y: 88, width: 9, height: 15, rx: 4.5, fill: "#ff4b3e" }, svg);
    el("path", { d: "M406 98 a8.5 8.5 0 0 0 17 0 M414.5 107 v5", stroke: "#ff4b3e", "stroke-width": 2, fill: "none" }, svg);
    // LED matrix showing a heart
    const heart = [".#.#.", "#####", "#####", ".###.", "..#.."];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
      const on = heart[r][c] === "#";
      el("rect", { x: 218 + c * 46 - 7, y: 158 + r * 46 - 13, width: 14, height: 26, rx: 3, fill: on ? "#ff3326" : "#4a4f5a" }, svg);
    }
    // buttons
    [["A", 95], ["B", 525]].forEach(([n, cx]) => {
      el("rect", { x: cx - 35, y: 215, width: 70, height: 70, rx: 6, fill: "#b8bec8" }, svg);
      el("circle", { cx, cy: 250, r: 20, fill: "#14161b" }, svg);
      const t = el("text", { x: cx, y: 322, "text-anchor": "middle", "font-size": 28, "font-weight": 800, fill: "#7fb4ff", "font-family": "Segoe UI, Arial" }, svg);
      t.textContent = n;
    });
  }

  function drawBack(svg) {
    boardBase(svg, "back");
    // antenna
    el("path", { d: "M34 160 V128 H64 V160 H96 V100 H128 V134 H160 V74", stroke: "#d4a72c", "stroke-width": 9, fill: "none", "stroke-linejoin": "round" }, svg);
    // USB socket
    el("rect", { x: 268, y: 0, width: 84, height: 46, rx: 4, fill: "#c9ced6", stroke: "#8a9099", "stroke-width": 2 }, svg);
    el("rect", { x: 282, y: 10, width: 56, height: 14, rx: 3, fill: "#5c636e" }, svg);
    // status LEDs
    el("rect", { x: 236, y: 30, width: 14, height: 24, rx: 2, fill: "#ff3b30" }, svg);
    el("rect", { x: 370, y: 30, width: 14, height: 24, rx: 2, fill: "#f5b800" }, svg);
    // reset button
    el("rect", { x: 405, y: 20, width: 64, height: 64, rx: 4, fill: "#b8bec8" }, svg);
    el("circle", { cx: 437, cy: 52, r: 18, fill: "#14161b" }, svg);
    // battery socket
    el("rect", { x: 500, y: 16, width: 84, height: 74, rx: 4, fill: "#f1ead6", stroke: "#c8bfa5", "stroke-width": 2 }, svg);
    el("rect", { x: 514, y: 30, width: 18, height: 46, fill: "#e0d6bb" }, svg);
    el("rect", { x: 552, y: 30, width: 18, height: 46, fill: "#e0d6bb" }, svg);
    // microphone
    el("rect", { x: 220, y: 140, width: 24, height: 24, rx: 3, fill: "#e2b53a", transform: "rotate(-20 232 152)" }, svg);
    // processor
    el("rect", { x: 110, y: 215, width: 80, height: 80, rx: 4, fill: "#3d424d", stroke: "#6b717c", "stroke-width": 2, transform: "rotate(45 150 255)" }, svg);
    // speaker
    el("rect", { x: 250, y: 225, width: 120, height: 120, rx: 6, fill: "#4a4f5a", stroke: "#6b717c", "stroke-width": 2, transform: "rotate(45 310 285)" }, svg);
    el("rect", { x: 275, y: 250, width: 70, height: 70, rx: 4, fill: "#5a606b", transform: "rotate(45 310 285)" }, svg);
    // USB interface chip
    el("rect", { x: 448, y: 223, width: 64, height: 64, rx: 4, fill: "#3d424d", stroke: "#6b717c", "stroke-width": 2, transform: "rotate(45 480 255)" }, svg);
    // accelerometer / compass
    el("rect", { x: 102, y: 358, width: 18, height: 28, rx: 2, fill: "#2a2e36", stroke: "#777", "stroke-width": 1.5 }, svg);
    const v = el("text", { x: 575, y: 380, "text-anchor": "middle", "font-size": 22, "font-weight": 800, fill: "#fff", "font-family": "Segoe UI, Arial" }, svg);
    v.textContent = "V2";
  }

  /**
   * opts: { required: number|"all", speedrun: boolean, onProgress(found, total, complete), saved: [ids] , teacher }
   */
  const ic = (name, cls) => (window.MBIcon ? window.MBIcon(name, cls) : "");

  function MicrobitExplorer(container, opts = {}) {
    const parts = PARTS;
    const found = new Set(opts.saved || []);
    const required = opts.required === "all" || !opts.required ? parts.length : opts.required;
    let side = "front", active = null, t0 = null, timer = null, finished = found.size >= parts.length;

    container.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "explore";
    container.appendChild(wrap);

    const stage = document.createElement("div");
    stage.className = "explore-stage";
    wrap.appendChild(stage);
    const tabs = document.createElement("div");
    tabs.className = "explore-tabs";
    tabs.innerHTML = `<button type="button" data-side="front" class="on">Front</button><button type="button" data-side="back">Back</button><span class="count"></span>`;
    stage.appendChild(tabs);
    const svgHolder = document.createElement("div");
    stage.appendChild(svgHolder);

    const info = document.createElement("div");
    info.className = "part-info";
    wrap.appendChild(info);

    const countEl = tabs.querySelector(".count");

    function renderInfo() {
      const p = parts.find(x => x.id === active);
      let html = "";
      if (!p) {
        html = `<h3>${ic("search")} Explore!</h3><p>Click the <b style="color:#b38600">yellow dots</b> to discover each part of the micro:bit. Don't forget to flip it over and look at the <b>back</b>.</p>`;
        if (opts.speedrun) html += `<div class="tip">${ic("timer")}<div><b>Speed run:</b> the stopwatch starts when you click your first dot. Can your group find all ${parts.length} parts in under 3 minutes?</div></div>`;
      } else {
        const tags = p.tags.map(t => `<span class="tag ${TAG_LABEL[t][0]}">${TAG_LABEL[t][1]}</span>`).join("") + (p.v2 ? `<span class="tag v2">NEW IN V2</span>` : "");
        html = `<div>${tags}</div><h3>${p.name}</h3><p>${p.desc}</p>`;
      }
      const list = parts.map(x => `<button type="button" data-id="${x.id}" class="${found.has(x.id) ? "found" : ""}">${found.has(x.id) ? ic("check") + " " + x.name : "?"}</button>`).join("");
      html += `<div class="part-list" aria-label="Parts found">${list}</div>`;
      if (opts.speedrun) html += `<p style="margin-top:12px;font-weight:600">${ic("timer")} Time: <span class="stopwatch">${fmt(elapsed())}</span>${opts.best ? ` &nbsp;·&nbsp; Best: <span class="stopwatch">${fmt(opts.best)}</span>` : ""}</p>`;
      info.innerHTML = html;
      info.querySelectorAll(".part-list button.found").forEach(b => b.addEventListener("click", () => {
        const pp = parts.find(x => x.id === b.dataset.id); if (pp.side !== side) { side = pp.side; drawSide(); } select(pp.id);
      }));
      countEl.textContent = `Found ${found.size} / ${parts.length}`;
    }
    function elapsed() { return t0 ? ((finished && opts._stopAt) || Date.now()) - t0 : 0; }
    function fmt(ms) { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }

    function drawSide() {
      svgHolder.innerHTML = "";
      tabs.querySelectorAll("button[data-side]").forEach(b => b.classList.toggle("on", b.dataset.side === side));
      const svg = el("svg", { viewBox: "0 -6 620 500", role: "img", "aria-label": `micro:bit ${side}` });
      svgHolder.appendChild(svg);
      side === "front" ? drawFront(svg) : drawBack(svg);
      parts.forEach((p, i) => {
        if (p.side !== side) return;
        const g = el("g", { class: "hotspot" + (found.has(p.id) ? " found" : "") + (active === p.id ? " active" : ""), tabindex: 0, role: "button", "aria-label": found.has(p.id) ? p.name : `Hidden part ${i + 1}` }, svg);
        el("circle", { class: "ring", cx: p.x, cy: p.y, r: 21 }, g);
        el("circle", { class: "core", cx: p.x, cy: p.y, r: 14 }, g);
        const t = el("text", { x: p.x, y: p.y + 1 }, g);
        t.textContent = found.has(p.id) ? "✓" : String(i + 1);
        const go = () => select(p.id);
        g.addEventListener("click", go);
        g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
      });
    }

    function select(id) {
      active = id;
      if (opts.speedrun && !t0) { t0 = Date.now(); timer = setInterval(() => { const sw = info.querySelector(".stopwatch"); if (sw) sw.textContent = fmt(elapsed()); }, 500); }
      const wasNew = !found.has(id);
      found.add(id);
      if (found.size >= parts.length && !finished) {
        finished = true; opts._stopAt = Date.now();
        if (timer) clearInterval(timer);
      }
      drawSide(); renderInfo();
      if (wasNew && opts.onProgress) opts.onProgress([...found], parts.length, found.size >= required, opts.speedrun && finished ? elapsed() : null);
    }

    tabs.querySelectorAll("button[data-side]").forEach(b => b.addEventListener("click", () => { side = b.dataset.side; drawSide(); }));
    drawSide(); renderInfo();
    return { found: () => [...found], total: parts.length };
  }

  window.MicrobitExplorer = MicrobitExplorer;
  window.MICROBIT_PARTS = PARTS;
  window.MicrobitDiagram = { drawFront, drawBack, PARTS, el };
})();
