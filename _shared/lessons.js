/* micro:bit Lab: lesson list used by the home page and the teacher dashboard.
   page: null = not published yet ("Coming soon"). Classes decide which track a student follows. */
window.MB_CLASSES = { EB7: "A", EB8: "A", EB9: "B", Second: "B" };
window.MB_TRACKS = {
  A: {
    name: "Track A · Explorers", grades: "EB7 – EB8", sub: "MakeCode blocks", icon: "compass",
    lessons: [
      { id: "A1", title: "Meet the micro:bit", week: 1, folder: "Track_A_EB7-EB8/A01_Meet_the_microbit", file: "A01" },
      { id: "A2", title: "Algorithms & animation", week: 2, folder: "Track_A_EB7-EB8/A02_Algorithms_and_animation", file: "A02" },
      { id: "A3", title: "Events & inputs", week: 3, folder: "Track_A_EB7-EB8/A03_Events_and_inputs", file: "A03" },
      { id: "A4", title: "Variables", week: 4 },
      { id: "A5", title: "Random & decisions", week: 5 },
      { id: "A6", title: "Loops & reaction game", week: 6 },
      { id: "A7", title: "Sensors 1: light & temperature", week: 7 },
      { id: "A8", title: "Sensors 2: motion & sound", week: 8 },
      { id: "A9", title: "Radio", week: 9 },
      { id: "A10", title: "Term project: Winter gadget", week: 10 }
    ]
  },
  B: {
    name: "Track B · Engineers", grades: "EB9 – Second", sub: "Blocks, then Python", icon: "wrench",
    lessons: [
      { id: "B1", title: "Crash course: meet the micro:bit", week: 1, folder: "Track_B_EB9-Seconde/B01_Crash_course", file: "B01" },
      { id: "B2", title: "Logic in blocks", week: 2, folder: "Track_B_EB9-Seconde/B02_Logic_in_blocks", file: "B02" },
      { id: "B3", title: "Hello Python", week: 3, folder: "Track_B_EB9-Seconde/B03_Hello_Python", file: "B03" },
      { id: "B4", title: "Variables & decisions (Python)", week: 4 },
      { id: "B5", title: "Lists & random", week: 5 },
      { id: "B6", title: "Functions & debugging", week: 6 },
      { id: "B7", title: "Sensors in Python", week: 7 },
      { id: "B8", title: "Data logging & analysis", week: 8 },
      { id: "B9", title: "Radio networks", week: 9 },
      { id: "B10", title: "Term project & demo", week: 10 }
    ]
  }
};
(function () {
  for (const t of Object.values(window.MB_TRACKS)) for (const l of t.lessons) {
    l.page = l.folder ? `${l.folder}/${l.file}_student.html` : null;
    l.data = l.folder ? `${l.folder}/${l.file}_lesson.js` : null;
  }
})();
