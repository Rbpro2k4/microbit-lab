/* Lesson content. Used by the student page and by the build scripts
   that generate the teacher plan, slides and worksheet. */
window.LESSON = {
  id: "A1", track: "A", trackLabel: "Track A · Explorers", grades: "EB7 – EB8", number: 1,
  title: "Meet the micro:bit",
  mission: "Meet a tiny computer and program it to become your group's <b>name badge</b>.",
  chips: ["clock:60 minutes", "users:Group work", "puzzle:MakeCode blocks"],
  rotateMinutes: 12,
  objectives: [
    "explain that a computer takes an {{input}}, {{processes|process}} it and gives an {{output}}.",
    "name the main parts of the micro:bit and say what they do.",
    "write a {{program}} in MakeCode and test it in the {{simulator}}.",
    "{{download}} my program onto a real micro:bit."
  ],
  needs: [
    "1 micro:bit + USB cable + battery pack",
    "A computer with <b>Chrome</b> or <b>Edge</b>",
    "The MakeCode website: <b>makecode.microbit.org</b>",
    "Your group worksheet and a pencil"
  ],
  heroDemo: [["loop", "forever", [["scroll", "HELLO!"], ["icon", "Happy", 1200]]]],
  help: [
    { q: "My name scrolls very slowly", a: "That's normal. Each letter takes time to scroll. Try a shorter name or a nickname." }
  ],
  sections: [
    {
      id: "warmup", type: "sort", nav: "Warm-up", title: "Warm-up: Input, Process or Output?", minutes: 6, kind: "Unplugged",
      intro: "<p>Every computer does three things: it takes information <b>in</b>, it <b>thinks</b> about it, and it gives information <b>out</b>. Sort these parts of an everyday computer.</p>",
      buckets: [
        { id: "in", label: "Input", icon: "arrow-down-to-line", desc: "Information goes IN" },
        { id: "proc", label: "Process", icon: "brain-circuit", desc: "The computer THINKS" },
        { id: "out", label: "Output", icon: "arrow-up-from-line", desc: "Information comes OUT" }
      ],
      items: [
        { label: "Keyboard", icon: "keyboard", bucket: "in", why: "You type on it to send information INTO the computer." },
        { label: "Screen", icon: "monitor", bucket: "out", why: "It shows information OUT to you." },
        { label: "Mouse", icon: "mouse", bucket: "in", why: "Moving and clicking sends information INTO the computer." },
        { label: "Processor (CPU)", icon: "cpu", bucket: "proc", why: "The processor is the brain. It follows the program and does the thinking." },
        { label: "Speaker", icon: "speaker", bucket: "out", why: "Sound comes OUT of it." },
        { label: "Microphone", icon: "mic", bucket: "in", why: "It takes sound INTO the computer." },
        { label: "Printer", icon: "printer", bucket: "out", why: "It puts information OUT onto paper." },
        { label: "Camera", icon: "camera", bucket: "in", why: "It takes pictures INTO the computer." }
      ],
      success: "A computer = <b>input → process → output</b>. The micro:bit works in exactly the same way!"
    },
    {
      id: "explore", type: "explore", nav: "Meet the micro:bit", title: "Meet the micro:bit", minutes: 8,
      intro: "<p>The micro:bit is a small computer that you can program. Hold your real micro:bit in your hand and find each part on it too!</p>",
      required: 12,
      after: "<b>Group talk:</b> point to <b>3 inputs</b> and <b>2 outputs</b> on your real micro:bit. The Reporter writes them on the worksheet."
    },
    {
      id: "editor", type: "editorTour", nav: "MakeCode", title: "Your coding tool: MakeCode", minutes: 4,
      intro: "<p>Open <b>makecode.microbit.org</b> in Chrome or Edge. Click the yellow numbers to learn the 5 important areas of the screen.</p>",
      parts: [
        { id: "sim", name: "Simulator", desc: "A pretend micro:bit on the screen. It runs your code straight away, so you can test it before downloading." },
        { id: "toolbox", name: "Toolbox", desc: "All the blocks, sorted by colour. Click a category (like <b>Basic</b>) to see its blocks." },
        { id: "workspace", name: "Workspace", desc: "Drag blocks here and snap them together to build your program. To delete a block, drag it back to the toolbox." },
        { id: "download", name: "Download button", desc: "Sends your program to the real micro:bit." },
        { id: "name", name: "Project name", desc: "Give your project a name so you can find it again. MakeCode saves your work automatically in this browser." }
      ],
      after: "<b>on start</b> runs <b>once</b>, when the micro:bit turns on. <b>forever</b> repeats its blocks <b>again and again</b>."
    },
    {
      id: "predict", type: "predict", nav: "Predict & run", title: "Predict → Run", minutes: 6,
      intro: "<p>Programmers read code and <b>predict</b> what it will do before they run it. Read this program carefully with your group.</p>",
      code: "basic.showString(\"Hi!\")\nbasic.forever(function () {\n    basic.showIcon(IconNames.Heart)\n    basic.showIcon(IconNames.SmallHeart)\n})",
      question: "What will the micro:bit do?",
      options: [
        "Show a big heart once, then stop",
        "Scroll <b>Hi!</b> once, then show a heart that beats forever",
        "Scroll <b>Hi!</b> again and again, forever",
        "Nothing, until you press a button"
      ],
      answer: 1,
      demo: [["scroll", "Hi!"], ["loop", 6, [["icon", "Heart"], ["icon", "SmallHeart"]]]],
      explain: "<b>on start</b> ran once: it scrolled <b>Hi!</b>. Then <b>forever</b> kept switching between the big heart and the small heart, so the heart looks like it is beating."
    },
    {
      id: "mission", type: "mission", nav: "Mission: name badge", title: "Mission: Name badge", minutes: 22,
      intro: "<p>Build a program that turns your micro:bit into a name badge. Do the <b style=\"color:var(--core)\">Core</b> steps first. Finished? Level up to <b style=\"color:var(--ext)\">Extension</b> and <b style=\"color:var(--chal)\">Challenge</b>.</p>",
      steps: [
        {
          title: "Start a new project",
          html: "<ol><li>Go to <b>makecode.microbit.org</b>.</li><li>Click <b>New Project</b>.</li><li>Name it <b>Name badge</b> and click <b>Create</b>.</li></ol><p>You will see two blocks already there: <b>on start</b> and <b>forever</b>.</p>",
          tip: "The <b>Driver</b> uses the mouse. The <b>Navigator</b> reads the steps out loud."
        },
        {
          title: "Scroll your name",
          html: "<p>Click the blue <b>Basic</b> category. Drag a <b>show string</b> block <b>inside</b> the <b>forever</b> block. Then click on <b>\"Hello!\"</b> and type your name.</p>",
          code: "basic.forever(function () {\n    basic.showString(\"SARA\")\n})",
          tool: { type: "nameScroller", value: "SARA", note: "Short names scroll faster. Long names take a while!" },
          hints: [
            "<b>show string</b> is in the blue <b>Basic</b> category. It has the word <b>\"Hello!\"</b> inside it.",
            "Drag the block until it <b>clicks</b> inside <b>forever</b>. If it looks faded, it is not connected."
          ]
        },
        {
          title: "Test it in the simulator",
          html: "<p>Look at the pretend micro:bit on the left of the MakeCode screen. Your name should be scrolling across it.</p><p>Not working? Check that <b>show string</b> is <b>inside</b> forever.</p>",
          checkLabel: "Our name scrolls in the simulator"
        },
        {
          title: "Add a picture after your name",
          html: "<p>From <b>Basic</b>, drag a <b>show icon</b> block and snap it <b>under</b> show string. Click the small arrow to choose a picture. Then add a <b>pause (ms)</b> block so the picture stays for 1 second.</p>",
          code: "basic.forever(function () {\n    basic.showString(\"SARA\")\n    basic.showIcon(IconNames.Heart)\n    basic.pause(1000)\n})",
          tip: "<b>ms</b> means milliseconds. 1000 ms = 1 second.",
          hints: [
            "<b>show icon</b> and <b>pause (ms)</b> are both in <b>Basic</b>.",
            "Order matters! Blocks run from <b>top to bottom</b>."
          ]
        },
        {
          title: "Download it to the real micro:bit",
          html: "<p>The <b>Hardware boss</b> plugs the micro:bit into the computer. Then choose a method:</p>",
          tool: { type: "download" },
          warn: "Every time you change your code, you must download it again.",
          checkLabel: "Our badge works on the real micro:bit!"
        },
        {
          title: "Go wireless",
          html: "<p>Unplug the USB cable and plug in the <b>battery pack</b> (switch it ON). Your program is saved on the micro:bit, so it starts again by itself! Walk around and show your badge to another group.</p>",
          tip: "The program stays on the micro:bit even when the power is off, until you download a new one.",
          checkLabel: "It works on battery power"
        },
        {
          level: "ext", title: "Draw your own picture",
          html: "<p>Instead of a ready-made icon, design your <b>own</b> picture. Use the <b>show leds</b> block from <b>Basic</b> and click the squares to switch LEDs on. Plan your picture here first:</p>",
          tool: { type: "ledDesigner", start: ["Heart"], title: "Plan your picture" },
          hints: [
            "Swap the <b>show icon</b> block for a <b>show leds</b> block.",
            "Click a square inside <b>show leds</b> to switch that LED on."
          ],
          solution: "basic.forever(function () {\n    basic.showString(\"SARA\")\n    basic.showLeds(`\n        . # . # .\n        # # # # #\n        # # # # #\n        . # # # .\n        . . # . .\n        `)\n    basic.pause(1000)\n})"
        },
        {
          level: "ext", title: "A calmer badge",
          html: "<p>Right now the badge never rests. Add a <b>pause</b> after your name, and a <b>clear screen</b> block at the end (find it in <b>Basic → … more</b>) so the badge takes a short break before it starts again.</p>",
          hints: [
            "<b>clear screen</b> is hidden in <b>Basic</b>: click <b>… more</b> under the Basic category.",
            "Try: name → pause → picture → pause → clear screen → pause."
          ],
          solution: "basic.forever(function () {\n    basic.showString(\"SARA\")\n    basic.pause(500)\n    basic.showIcon(IconNames.Heart)\n    basic.pause(1000)\n    basic.clearScreen()\n    basic.pause(500)\n})"
        },
        {
          level: "chal", title: "Group badge",
          html: "<p>Make one badge for the <b>whole group</b>: each person's name followed by their <b>own</b> picture. Which group can make the coolest one?</p>",
          hints: [
            "Use one <b>show string</b> and one picture block for each person.",
            "Put them all inside <b>forever</b>, in order: name 1, picture 1, name 2, picture 2…"
          ],
          solution: "basic.forever(function () {\n    basic.showString(\"SARA\")\n    basic.showIcon(IconNames.Happy)\n    basic.showString(\"ALI\")\n    basic.showIcon(IconNames.Diamond)\n    basic.showString(\"MAYA\")\n    basic.showIcon(IconNames.Butterfly)\n})"
        },
        {
          level: "chal", title: "Mini animation",
          html: "<p>An <b>animation</b> is several pictures shown quickly, one after another. After your name, add <b>3 show leds</b> blocks that make a tiny animation: a growing square, a blinking eye, a jumping person… Plan the frames here:</p>",
          tool: { type: "ledDesigner", frames: true, pause: 0, title: "Plan your animation", start: [".....|.....|..#..|.....|.....", ".....|.###.|.#.#.|.###.|.....", "#####|#...#|#...#|#...#|#####"] },
          hints: [
            "Each <b>show leds</b> block is one frame of your animation.",
            "Change one or two LEDs at a time between frames, so the movement looks smooth."
          ],
          solution: "basic.forever(function () {\n    basic.showString(\"SARA\")\n    basic.showLeds(`\n        . . . . .\n        . . . . .\n        . . # . .\n        . . . . .\n        . . . . .\n        `)\n    basic.showLeds(`\n        . . . . .\n        . # # # .\n        . # . # .\n        . # # # .\n        . . . . .\n        `)\n    basic.showLeds(`\n        # # # # #\n        # . . . #\n        # . . . #\n        # . . . #\n        # # # # #\n        `)\n})"
        }
      ]
    },
    {
      id: "exit", type: "quiz", nav: "Exit ticket", title: "Exit ticket", minutes: 5,
      intro: "<p>Answer together as a group. Your first answer counts, so discuss before you click!</p>",
      questions: [
        { q: "Which of these is an <b>input</b> on the micro:bit?", options: ["The LED display lights", "Button A", "The speaker", "The red power light"], answer: 1, explain: "Pressing button A sends information <b>into</b> the micro:bit." },
        { q: "What does the <b>processor</b> do?", options: ["It shows pictures", "It runs your program: it is the brain", "It plays music", "It holds the batteries"], answer: 1, explain: "The processor follows your program step by step." },
        { q: "Where can you test your code <b>before</b> downloading it?", options: ["In the simulator", "In the toolbox", "On the battery pack", "In the USB cable"], answer: 0, explain: "The simulator is the pretend micro:bit on the left of MakeCode." },
        { q: "What is the difference between <b>on start</b> and <b>forever</b>?", options: ["There is no difference", "on start runs once; forever repeats again and again", "forever runs once; on start repeats", "on start only works with batteries"], answer: 1, explain: "on start = once, when the micro:bit turns on. forever = repeat, repeat, repeat…" },
        { q: "You changed your code, but the micro:bit still shows the old program. What did you forget?", options: ["To press button A", "To download the new code", "To change the batteries", "To close MakeCode"], answer: 1, explain: "Every change needs a new download!" }
      ]
    },
    {
      id: "reflect", type: "reflect", nav: "How did it go?", title: "How did it go?", minutes: 3,
      intro: "<p>Be honest! This helps your teacher plan the next lesson.</p>",
      prompts: ["One thing our group learned today:", "One thing that was difficult, or a question for next time:"]
    },
    {
      id: "glossary", type: "glossary", nav: "Key words", title: "Key words",
      terms: [
        { term: "Computer", def: "A machine that takes input, processes it with a program and gives output." },
        { term: "Input", def: "Information that goes into a computer, like pressing a button." },
        { term: "Process", def: "What the computer does with the input, by following the program." },
        { term: "Output", def: "What comes out of a computer, like light, sound or a picture." },
        { term: "Processor", def: "The 'brain' chip that runs the program." },
        { term: "Program", def: "A list of instructions that a computer follows." },
        { term: "LED", def: "A tiny light (Light Emitting Diode). The micro:bit has 25 of them on the front." },
        { term: "Sensor", def: "A part that measures something, like light, temperature or movement." },
        { term: "Simulator", def: "A pretend micro:bit on the screen, for testing code." },
        { term: "Download", def: "Copying your program from the computer onto the micro:bit (also called 'flashing')." },
        { term: "Block", def: "A piece of code that you drag and snap together in MakeCode." },
        { term: "MakeCode", def: "The free website where we program the micro:bit with blocks." }
      ]
    },
    {
      id: "next", type: "next", nav: "Next lesson", title: "Next lesson", icon: "heart-pulse",
      lesson: "A2 · Algorithms & animation",
      teaser: "Find out what an algorithm is, then make a beating heart and your own animated emoji."
    }
  ]
};
