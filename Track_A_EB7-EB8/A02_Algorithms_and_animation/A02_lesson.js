/* Lesson content. Used by the student page and by the build scripts
   that generate the teacher plan, slides and worksheet. */
window.LESSON = {
  id: "A2", track: "A", trackLabel: "Track A · Explorers", grades: "EB7 – EB8", number: 2,
  title: "Algorithms & animation",
  mission: "Find out what an <b>algorithm</b> is, hunt down <b>bugs</b>, and bring your micro:bit to life with an <b>animated emoji</b>.",
  chips: ["⏱ 60 minutes", "👥 Group work", "🧩 MakeCode blocks"],
  rotateMinutes: 12,
  objectives: [
    "explain what an {{algorithm}} is and why the order of the steps matters.",
    "find and fix a {{bug}} in a program ({{debugging}}).",
    "make an {{animation}} from a {{sequence}} of {{frames|frame}}.",
    "use {{pause}} to control the speed of an animation."
  ],
  needs: [
    "1 micro:bit + USB cable + battery pack",
    "A computer with <b>Chrome</b> or <b>Edge</b>",
    "The MakeCode website: <b>makecode.microbit.org</b>",
    "Your group worksheet and a pencil"
  ],
  heroDemo: [["loop", "forever", [
    ["leds", ".....|.#.#.|.....|#...#|.###.", 1400], ["leds", ".....|##.##|.....|#...#|.###.", 220], ["leds", ".....|.#.#.|.....|#...#|.###.", 900],
    ["number", 3], ["number", 2], ["number", 1], ["icon", "Heart", 700], ["icon", "SmallHeart", 400], ["icon", "Heart", 700]
  ]]],
  help: [
    { q: "The robot dot says “Bump!”", a: "Your dot hit a wall or the edge of the grid. The red step is the bug: click it to delete it, then add the right arrow." },
    { q: "My animation is too fast (or too slow)", a: "Change the numbers in your <b>pause (ms)</b> blocks. 1000 ms = 1 second. A smaller number = faster." }
  ],
  sections: [
    {
      id: "teacher", type: "text", nav: "Program your teacher", title: "Warm-up: Program your teacher", minutes: 4, kind: "Unplugged · whole class",
      html: "<p>Today your teacher is a <b>robot</b> 🤖. A robot does <b>exactly</b> what you say: nothing more, nothing less.</p><ol><li>The robot starts at the door. Your class must get it to <b>sit on the teacher's chair</b>.</li><li>Give <b>one instruction at a time</b>, for example “take 2 steps forward” or “turn left”.</li><li>Watch carefully: if an instruction is not clear, the robot gets it wrong!</li></ol><div class=\"tip\"><b>💡 Think:</b> which instructions went wrong, and why? What makes a good instruction?</div>"
    },
    {
      id: "order", type: "order", nav: "Order the steps", title: "Put the algorithm in order", minutes: 3,
      intro: "<p>An <b>{{algorithm}}</b> is a list of steps in the right order. Here is the algorithm for last week's name badge, but the steps are mixed up. Put them back in order!</p>",
      items: [
        { label: "Click Download", emoji: "⬇️", n: 5 },
        { label: "Open MakeCode and click New Project", emoji: "🌐", n: 1 },
        { label: "Watch your name scroll on the micro:bit", emoji: "👀", n: 6 },
        { label: "Type your name in the block", emoji: "⌨️", n: 3 },
        { label: "Test it in the simulator", emoji: "🖥️", n: 4 },
        { label: "Drag a show string block into forever", emoji: "🧩", n: 2 }
      ],
      success: "The order matters: you can't type your name before the block is there, and there is nothing to watch until you download!"
    },
    {
      id: "robot", type: "robot", nav: "Robot dot", title: "Robot dot: program the LED", minutes: 7,
      intro: "<p>Program the red LED dot to reach the ♥. Click the arrows to build your <b>algorithm</b>, then press <b>▶ Run</b>. If the dot bumps into something, the step that went wrong turns red: that step is a <b>{{bug}}</b>.</p>",
      max: 16,
      levels: [
        { name: "First steps", task: "Get the dot to the heart.", start: [4, 0], goal: [4, 4], best: 4 },
        { name: "Many ways", task: "The heart is in the top corner. There is more than one right algorithm!", start: [4, 0], goal: [0, 4], best: 8 },
        { name: "The wall", task: "A wall is in the way. Find a way around it.", start: [4, 0], goal: [0, 0], walls: [[2, 0], [2, 1], [2, 2], [2, 3]], best: 12 },
        { name: "Bug hunt", task: "This algorithm was written for you, but it has a bug. Run it, find the step that turns red, then fix it.", start: [4, 0], goal: [0, 4], best: 8,
          prefill: ["U", "U", "U", "U", "L", "R", "R", "R"],
          teacherNote: "Step 5 (⬅ Left) hits the edge of the grid. Fix: delete it, then add one more ➡ Right at the end." }
      ]
    },
    {
      id: "predict", type: "predict", nav: "Bug hunt", title: "Predict → Run: bug hunt", minutes: 5,
      intro: "<p>This program should count down <b>3, 2, 1</b> and then show a tick ✓. Read it carefully: is something wrong?</p>",
      code: "basic.forever(function () {\n    basic.showNumber(3)\n    basic.showNumber(1)\n    basic.showNumber(2)\n    basic.showIcon(IconNames.Yes)\n})",
      question: "What will the micro:bit really show?",
      options: [
        "3, 2, 1, ✓ and then stop",
        "3, 1, 2, ✓ again and again",
        "3, 1, 2, ✓ and then stop",
        "1, 2, 3, ✓ again and again"
      ],
      answer: 1,
      demo: [["loop", 2, [["number", 3], ["number", 1], ["number", 2], ["icon", "Yes", 900]]]],
      explain: "The micro:bit follows the blocks <b>exactly</b>, from top to bottom: 3, then 1, then 2, then ✓. Because the blocks are inside <b>forever</b>, it starts again. The blocks are in the wrong order: that's a <b>bug</b>. You will fix it in the mission."
    },
    {
      id: "mission", type: "mission", nav: "Mission: animation", title: "Mission: Animated emoji", minutes: 26,
      intro: "<p>Make the micro:bit come alive! Do the <b style=\"color:var(--core)\">Core</b> steps first. Finished? Level up to <b style=\"color:var(--ext)\">Extension</b> and <b style=\"color:var(--chal)\">Challenge</b>.</p>",
      steps: [
        {
          title: "Beating heart",
          html: "<ol><li>Open <b>makecode.microbit.org</b> → <b>New Project</b> → name it <b>Animation</b>.</li><li>From <b>Basic</b>, put a <b>show icon</b> (heart) inside <b>forever</b>.</li><li>Add a second <b>show icon</b> underneath and choose the <b>small heart</b>.</li></ol><p>Watch the simulator: the heart beats! Each picture is a <b>{{frame}}</b>. Frames shown one after another make an <b>{{animation}}</b>.</p>",
          code: "basic.forever(function () {\n    basic.showIcon(IconNames.Heart)\n    basic.showIcon(IconNames.SmallHeart)\n})",
          hints: ["Click the small arrow on the <b>show icon</b> block to choose a different picture."]
        },
        {
          title: "Control the speed",
          html: "<p>From <b>Basic</b>, add a <b>pause (ms)</b> block after each <b>show icon</b>. Try <b>100</b>, <b>500</b> and <b>1000</b>. Use the speed lab to see the difference first:</p>",
          tool: { type: "speedDemo", frames: ["Heart", "SmallHeart"], start: 500, title: "Speed lab: drag the slider" },
          code: "basic.forever(function () {\n    basic.showIcon(IconNames.Heart)\n    basic.pause(500)\n    basic.showIcon(IconNames.SmallHeart)\n    basic.pause(500)\n})",
          pageCode: false,
          tip: "<b>ms</b> means milliseconds. <b>1000 ms = 1 second</b>. A smaller number makes the animation faster.",
          checkLabel: "We chose our favourite speed",
          hints: ["<b>pause (ms)</b> is in the blue <b>Basic</b> category.", "Click the number in the pause block to type a new one, or choose one from the list."]
        },
        {
          title: "Fix the countdown bug",
          html: "<p>Remember the bug hunt? Build that buggy program, run it in the simulator, then <b>fix it</b> so it shows <b>3, 2, 1, ✓</b>.</p>",
          code: "basic.forever(function () {\n    basic.showNumber(3)\n    basic.showNumber(1)\n    basic.showNumber(2)\n    basic.showIcon(IconNames.Yes)\n})",
          codeLabel: "the buggy program",
          tip: "<b>Debugging:</b> 1. Run it. 2. Find the step that is wrong. 3. Fix it. 4. Run it again to check.",
          hints: ["<b>show number</b> is in <b>Basic</b>.", "Drag a block out and drop it in a new place. Careful: the blocks under it move too!", "The numbers 1 and 2 are in the wrong order."],
          solution: "basic.forever(function () {\n    basic.showNumber(3)\n    basic.showNumber(2)\n    basic.showNumber(1)\n    basic.showIcon(IconNames.Yes)\n})",
          checkLabel: "Our countdown shows 3, 2, 1, ✓"
        },
        {
          title: "Design your animated emoji",
          html: "<p>Make your own <b>animated emoji</b> with <b>show leds</b> blocks: one block for each frame. Try a face that <b>blinks</b>: eyes open, then eyes closed. Plan your frames here first, then build them in MakeCode:</p>",
          tool: { type: "ledDesigner", frames: true, pause: 0, title: "Animation designer", start: [".....|.#.#.|.....|#...#|.###.", ".....|##.##|.....|#...#|.###."] },
          tip: "A real blink is <b>quick</b>: put a long <b>pause</b> after the open eyes (like 1500 ms) and no pause after the closed eyes.",
          hints: ["<b>show leds</b> is in <b>Basic</b>. Click the squares to switch LEDs on.", "Put one <b>show leds</b> block for each frame inside <b>forever</b>."],
          solution: "basic.forever(function () {\n    basic.showLeds(`\n        . . . . .\n        . # . # .\n        . . . . .\n        # . . . #\n        . # # # .\n        `)\n    basic.pause(1500)\n    basic.showLeds(`\n        . . . . .\n        # # . # #\n        . . . . .\n        # . . . #\n        . # # # .\n        `)\n})",
          checkLabel: "Our animated emoji works in the simulator"
        },
        {
          title: "Download and show it off",
          html: "<p>The <b>Hardware boss</b> downloads the program to the micro:bit. Unplug the cable, connect the battery pack and show your animated emoji to another group. Can they guess what it is?</p>",
          tip: "Forgot how to download? Click ⋯ next to Download → Connect device, then Download. Or drag the .hex file onto the MICROBIT drive.",
          checkLabel: "It works on the real micro:bit"
        },
        {
          level: "ext", title: "Faster and faster",
          html: "<p>Make a heart that beats <b>slowly</b>, then <b>faster</b>, then <b>very fast</b>, like after running. Use pauses of 1000, 500 and 100.</p>",
          hints: ["You need 6 <b>show icon</b> blocks: big, small, big, small, big, small.", "Put a <b>pause</b> after each one: 1000, 1000, 500, 500, 100, 100."],
          solution: "basic.forever(function () {\n    basic.showIcon(IconNames.Heart)\n    basic.pause(1000)\n    basic.showIcon(IconNames.SmallHeart)\n    basic.pause(1000)\n    basic.showIcon(IconNames.Heart)\n    basic.pause(500)\n    basic.showIcon(IconNames.SmallHeart)\n    basic.pause(500)\n    basic.showIcon(IconNames.Heart)\n    basic.pause(100)\n    basic.showIcon(IconNames.SmallHeart)\n    basic.pause(100)\n})"
        },
        {
          level: "ext", title: "Countdown once, then beat forever",
          html: "<p>Right now your countdown repeats forever. Move it into <b>on start</b> so it runs only <b>once</b>. Then make the heart beat in <b>forever</b>.</p>",
          hints: ["Blocks in <b>on start</b> run once. Blocks in <b>forever</b> repeat.", "Drag the countdown blocks from forever into on start."],
          solution: "basic.showNumber(3)\nbasic.showNumber(2)\nbasic.showNumber(1)\nbasic.showIcon(IconNames.Yes)\nbasic.forever(function () {\n    basic.showIcon(IconNames.Heart)\n    basic.showIcon(IconNames.SmallHeart)\n})"
        },
        {
          level: "chal", title: "Repeat it!",
          html: "<p>Make the face <b>blink 3 times</b>, then show a heart for 1 second. Use the <b>repeat</b> block from <b>Loops</b>, so you don't have to copy the blink 3 times.</p>",
          hints: ["<b>repeat 4 times</b> is in the green <b>Loops</b> category. Change 4 to 3.", "Put your blink frames inside <b>repeat</b>, and the heart after it."],
          solution: "basic.forever(function () {\n    for (let index = 0; index < 3; index++) {\n        basic.showLeds(`\n            . . . . .\n            . # . # .\n            . . . . .\n            # . . . #\n            . # # # .\n            `)\n        basic.showLeds(`\n            . . . . .\n            # # . # #\n            . . . . .\n            # . . . #\n            . # # # .\n            `)\n    }\n    basic.showIcon(IconNames.Heart)\n    basic.pause(1000)\n})"
        },
        {
          level: "chal", title: "Rocket launch 🚀",
          html: "<p>Count down 3, 2, 1, then make a rocket fly up and off the screen. Plan the frames here: the rocket moves up one row in each frame.</p>",
          tool: { type: "ledDesigner", frames: true, pause: 0, title: "Plan your rocket", start: [".....|.....|..#..|.###.|.#.#.", ".....|..#..|.###.|.#.#.|.....", "..#..|.###.|.#.#.|.....|.....", ".###.|.#.#.|.....|.....|.....", ".#.#.|.....|.....|.....|....."] },
          hints: ["Start with the countdown: show number 3, 2, 1.", "Each frame is one show leds block. Move the rocket up one row each time, until it disappears."],
          solution: "basic.forever(function () {\n    basic.showNumber(3)\n    basic.showNumber(2)\n    basic.showNumber(1)\n    basic.showLeds(`\n        . . . . .\n        . . . . .\n        . . # . .\n        . # # # .\n        . # . # .\n        `)\n    basic.showLeds(`\n        . . . . .\n        . . # . .\n        . # # # .\n        . # . # .\n        . . . . .\n        `)\n    basic.showLeds(`\n        . . # . .\n        . # # # .\n        . # . # .\n        . . . . .\n        . . . . .\n        `)\n    basic.showLeds(`\n        . # # # .\n        . # . # .\n        . . . . .\n        . . . . .\n        . . . . .\n        `)\n    basic.showLeds(`\n        . # . # .\n        . . . . .\n        . . . . .\n        . . . . .\n        . . . . .\n        `)\n    basic.clearScreen()\n    basic.pause(1000)\n})"
        }
      ]
    },
    {
      id: "exit", type: "quiz", nav: "Exit ticket", title: "Exit ticket", minutes: 5,
      intro: "<p>Answer together as a group. Your first answer counts, so discuss before you click!</p>",
      questions: [
        { q: "What is an <b>algorithm</b>?", options: ["A type of computer", "A set of step-by-step instructions to do a task", "A picture on the LED display", "A mistake in a program"], answer: 1, explain: "Recipes, directions and programs are all algorithms." },
        { q: "Why does the <b>order</b> of the blocks matter?", options: ["It doesn't matter", "The micro:bit runs the blocks one by one, from top to bottom", "The micro:bit runs the biggest block first", "The micro:bit runs the blocks in a random order"], answer: 1, explain: "That's why the countdown showed 3, 1, 2: the blocks were in the wrong order." },
        { q: "What is <b>debugging</b>?", options: ["Cleaning the micro:bit", "Deleting the whole program", "Finding and fixing mistakes in a program", "Making the program run faster"], answer: 2, explain: "Run it, find the step that is wrong, fix it, run it again." },
        { q: "<b>pause (ms) 1000</b> makes the micro:bit wait for…", options: ["1000 seconds", "1 minute", "1 second", "10 seconds"], answer: 2, explain: "ms = milliseconds. 1000 ms = 1 second." },
        { q: "Your animation is too fast. What can you do?", options: ["Add pause blocks, or make the pauses longer", "Remove all the frames", "Press the reset button", "Add more show string blocks"], answer: 0, explain: "A longer pause keeps each frame on the screen for longer." }
      ]
    },
    {
      id: "reflect", type: "reflect", nav: "How did it go?", title: "How did it go?", minutes: 4,
      intro: "<p>Be honest! This helps your teacher plan the next lesson.</p>",
      prompts: ["One thing our group learned today:", "A bug we found today, and how we fixed it:"]
    },
    {
      id: "glossary", type: "glossary", nav: "Key words", title: "Key words",
      terms: [
        { term: "Algorithm", def: "A set of step-by-step instructions to do a task. The order of the steps matters." },
        { term: "Sequence", def: "Instructions that run one after another, in order." },
        { term: "Instruction", def: "One step that tells the computer what to do." },
        { term: "Bug", def: "A mistake in a program that makes it do the wrong thing." },
        { term: "Debugging", def: "Finding and fixing bugs: run it, find the problem, fix it, test again." },
        { term: "Animation", def: "Pictures shown quickly one after another, so they seem to move." },
        { term: "Frame", def: "One picture in an animation." },
        { term: "Pause", def: "A block that makes the micro:bit wait before the next step." },
        { term: "Millisecond", def: "A thousandth of a second (ms). 1000 ms = 1 second." },
        { term: "Loop", def: "Blocks that repeat. forever repeats again and again; repeat runs a set number of times." }
      ]
    },
    {
      id: "next", type: "next", nav: "Next lesson", title: "Next lesson", emoji: "😮",
      lesson: "A3 · Events & inputs",
      teaser: "Make your micro:bit react to you: buttons, shaking and the touch logo. You'll build an emotion badge!"
    }
  ]
};
