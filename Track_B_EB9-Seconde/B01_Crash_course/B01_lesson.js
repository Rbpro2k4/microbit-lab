/* Lesson content. Used by the student page and by the build scripts
   that generate the teacher plan, slides and worksheet. */
window.LESSON = {
  id: "B1", track: "B", trackLabel: "Track B · Engineers", grades: "EB9 – Seconde", number: 1,
  title: "Crash course: meet the micro:bit",
  mission: "Get to know the micro:bit fast, then build <b>three programs</b> in one lesson: a name badge, an animation and an emotion badge.",
  chips: ["⏱ 60 minutes", "👥 Group work", "🧩 MakeCode blocks", "⚡ Fast pace"],
  rotateMinutes: 12,
  objectives: [
    "explain {{input}}, {{process}} and {{output}} using parts of the micro:bit.",
    "test programs in the {{simulator}} and {{download}} them to the micro:bit.",
    "build an {{animation}} from a {{sequence}} of {{frames|frame}}.",
    "use {{events|event}} (buttons, shake, logo) to make a program react."
  ],
  needs: [
    "1 micro:bit + USB cable + battery pack",
    "A computer with <b>Chrome</b> or <b>Edge</b>",
    "The MakeCode website: <b>makecode.microbit.org</b>",
    "Your group worksheet"
  ],
  heroDemo: [["loop", "forever", [["scroll", "B1"], ["icon", "Happy", 700], ["icon", "Surprised", 700], ["icon", "Asleep", 700]]]],
  sections: [
    {
      id: "warmup", type: "sort", nav: "Warm-up", title: "Warm-up: Input, Output or Both?", minutes: 4, kind: "Unplugged",
      intro: "<p>Computers follow the pattern <b>input → process → output</b>. Sort these micro:bit parts. One or two of them might surprise you!</p>",
      buckets: [
        { id: "in", label: "Input", emoji: "⬇️", desc: "Senses the world" },
        { id: "out", label: "Output", emoji: "⬆️", desc: "Acts on the world" },
        { id: "both", label: "Both", emoji: "↕️", desc: "Can do both jobs" }
      ],
      items: [
        { label: "Button A", emoji: "🔘", bucket: "in", why: "Pressing it sends a signal INTO the micro:bit." },
        { label: "Speaker", emoji: "🔊", bucket: "out", why: "It produces sound: an output." },
        { label: "Accelerometer", emoji: "📳", bucket: "in", why: "It senses movement (shake, tilt): an input." },
        { label: "Radio antenna", emoji: "📡", bucket: "both", why: "It SENDS messages (output) and RECEIVES them (input)." },
        { label: "Touch logo", emoji: "👆", bucket: "in", why: "It senses your finger: an input." },
        { label: "Red power light", emoji: "🔴", bucket: "out", why: "It gives out light: an output." },
        { label: "Microphone", emoji: "🎤", bucket: "in", why: "It measures sound level: an input." },
        { label: "LED display", emoji: "💡", bucket: "both", why: "Surprise! It shows pictures (output) AND can measure light level (input)." },
        { label: "Temperature sensor", emoji: "🌡️", bucket: "in", why: "It measures temperature: an input." }
      ],
      success: "Inputs <b>sense</b>, outputs <b>act</b>. The radio and the LED display can do both!"
    },
    {
      id: "explore", type: "explore", nav: "Speed run", title: "Speed run: meet the micro:bit", minutes: 4,
      intro: "<p>Find all 16 parts as fast as you can. Flip the board over to see the back. Then find each part on your <b>real</b> micro:bit.</p>",
      speedrun: true, required: "all",
      after: "<b>Engineer's question:</b> which part would you use to build (1) a step counter, (2) an automatic night light, (3) a walkie-talkie? Agree as a group, then write your answers on the worksheet."
    },
    {
      id: "m1", type: "mission", nav: "Mission 1: badge", title: "Mission 1: Name badge (speed build)", minutes: 10,
      intro: "<p>Your first program. Go fast, but make sure everyone in the group understands each block.</p>",
      steps: [
        {
          title: "New project + scroll your name",
          html: "<ol><li>Open <b>makecode.microbit.org</b> → <b>New Project</b> → name it <b>Name badge</b>.</li><li>From <b>Basic</b>, drag <b>show string</b> into <b>forever</b> and type your name.</li><li>Add a <b>show icon</b> underneath it.</li><li>Watch it run in the simulator (the micro:bit on the left of the screen).</li></ol>",
          code: "basic.forever(function () {\n    basic.showString(\"ALI\")\n    basic.showIcon(IconNames.Heart)\n})",
          tip: "<b>on start</b> runs once when the micro:bit powers up. <b>forever</b> loops endlessly. Blocks run from top to bottom.",
          hints: ["Both blocks are in the blue <b>Basic</b> category.", "If a block looks faded, it is not connected. Drag it until it clicks inside <b>forever</b>."]
        },
        {
          title: "Download to the micro:bit",
          html: "<p>The <b>Hardware boss</b> connects the micro:bit, then:</p>",
          tool: { type: "download" },
          warn: "Change the code → download again. The micro:bit doesn't update by itself.",
          checkLabel: "It runs on the real micro:bit"
        },
        {
          title: "Go wireless 🔋",
          html: "<p>Unplug the USB cable and connect the <b>battery pack</b>. The program is stored on the micro:bit and starts again by itself.</p>",
          checkLabel: "It works on battery power"
        },
        {
          level: "ext", title: "Custom picture",
          html: "<p>Replace <b>show icon</b> with <b>show leds</b> and design your own picture or logo.</p>",
          tool: { type: "ledDesigner", start: ["Diamond"], title: "Plan your picture" },
          hints: ["<b>show leds</b> is in <b>Basic</b>. Click squares to switch LEDs on."]
        },
        {
          level: "chal", title: "Team badge",
          html: "<p>Show every group member's name, each followed by a different picture, in one loop.</p>",
          hints: ["One <b>show string</b> + one picture block per person, all inside <b>forever</b>."],
          solution: "basic.forever(function () {\n    basic.showString(\"ALI\")\n    basic.showIcon(IconNames.Happy)\n    basic.showString(\"NOUR\")\n    basic.showIcon(IconNames.Diamond)\n    basic.showString(\"KARIM\")\n    basic.showIcon(IconNames.Ghost)\n})"
        }
      ]
    },
    {
      id: "m2", type: "mission", nav: "Mission 2: animation", title: "Mission 2: Animation", minutes: 11,
      intro: "<p>An <b>{{animation}}</b> is a <b>{{sequence}}</b> of pictures ({{frames|frame}}) shown one after another. The order of your blocks is the order of the frames. Steps in the right order are an <b>{{algorithm}}</b>.</p>",
      steps: [
        {
          title: "Beating heart",
          html: "<p>Start a <b>new project</b> called <b>Animation</b>. Inside <b>forever</b>, show a big heart, then a small heart.</p>",
          code: "basic.forever(function () {\n    basic.showIcon(IconNames.Heart)\n    basic.showIcon(IconNames.SmallHeart)\n})",
          tip: "<b>show icon</b> already waits 0.6 seconds by itself. That's why you can see each frame."
        },
        {
          title: "Design your own animation (3+ frames)",
          html: "<p>Use the designer to plan an animation with at least <b>3 frames</b>: a spinning line, a bouncing ball, rain, Pac-Man… Then build it in MakeCode with one <b>show leds</b> block per frame. This example is a spinning line:</p>",
          tool: { type: "ledDesigner", frames: true, pause: 0, title: "Animation designer", start: ["..#..|..#..|..#..|..#..|..#..", "....#|...#.|..#..|.#...|#....", ".....|.....|#####|.....|.....", "#....|.#...|..#..|...#.|....#"] },
          hints: ["Each <b>show leds</b> block = one frame. Put them all inside <b>forever</b>.", "Small changes between frames make the movement look smooth."],
          solution: "basic.forever(function () {\n    basic.showLeds(`\n        . . # . .\n        . . # . .\n        . . # . .\n        . . # . .\n        . . # . .\n        `)\n    basic.showLeds(`\n        . . . . #\n        . . . # .\n        . . # . .\n        . # . . .\n        # . . . .\n        `)\n    basic.showLeds(`\n        . . . . .\n        . . . . .\n        # # # # #\n        . . . . .\n        . . . . .\n        `)\n    basic.showLeds(`\n        # . . . .\n        . # . . .\n        . . # . .\n        . . . # .\n        . . . . #\n        `)\n})",
          checkLabel: "Our animation runs on the micro:bit"
        },
        {
          level: "ext", title: "Control the speed",
          html: "<p>Add <b>pause (ms)</b> blocks between the frames. Try 100, 500 and 1000 ms. Which speed looks best for your animation, and why? Discuss and write it on the worksheet.</p>",
          hints: ["<b>pause (ms)</b> is in <b>Basic</b>. Put one after each <b>show leds</b>."]
        },
        {
          level: "chal", title: "Intro message + 5 loops",
          html: "<p>Scroll a message <b>once</b> at the start, then play your animation exactly <b>5 times</b> and stop. You'll need the <b>repeat</b> block from <b>Loops</b> instead of forever.</p>",
          hints: ["Put the message in <b>on start</b>.", "<b>repeat 4 times</b> is in the green <b>Loops</b> category. Change 4 to 5 and put your frames inside it."],
          solution: "basic.showString(\"GO!\")\nfor (let index = 0; index < 5; index++) {\n    basic.showIcon(IconNames.Heart)\n    basic.showIcon(IconNames.SmallHeart)\n}\nbasic.clearScreen()"
        }
      ]
    },
    {
      id: "predict", type: "predict", nav: "Predict: events", title: "Predict → Run: events", minutes: 4,
      intro: "<p>This program has no <b>forever</b> block. Instead it uses <b>{{event}}</b> blocks. Read it carefully.</p>",
      code: "input.onButtonPressed(Button.A, function () {\n    basic.showIcon(IconNames.Happy)\n})\ninput.onButtonPressed(Button.B, function () {\n    basic.showIcon(IconNames.Sad)\n})\nbasic.showIcon(IconNames.Asleep)",
      question: "The micro:bit turns on. Then you press <b>button B</b>. What do you see?",
      options: [
        "An asleep face, then a sad face",
        "A happy face, then a sad face",
        "Only a sad face",
        "Nothing, because there is no forever block"
      ],
      answer: 0,
      demo: [["icon", "Asleep", 1600], ["pause", 200], ["icon", "Sad", 1600]],
      explain: "<b>on start</b> shows the asleep face, then the micro:bit <b>waits</b>. The code inside <b>on button B pressed</b> runs <b>only when that event happens</b>. Event blocks don't need forever: they are always listening."
    },
    {
      id: "m3", type: "mission", nav: "Mission 3: emotions", title: "Mission 3: Emotion badge", minutes: 14,
      intro: "<p>Build a badge that shows how you feel. Each input event shows a different face.</p>",
      steps: [
        {
          title: "Try the finished project",
          html: "<p>Here is a virtual version of what you will build. Press A and B, touch the gold logo and press Shake.</p>",
          tool: { type: "eventDemo", startIcon: "Asleep", map: { A: { icon: "Happy", label: "happy face" }, B: { icon: "Sad", label: "sad face" }, logo: { icon: "Asleep", label: "asleep face" }, shake: { icon: "Surprised", label: "surprised face" } } },
          checkLabel: "We tried it"
        },
        {
          title: "Buttons A and B",
          html: "<p>New project: <b>Emotion badge</b>. From the pink <b>Input</b> category, drag <b>on button A pressed</b> into the empty workspace and put a <b>show icon</b> (happy) inside it. Right-click the block → <b>Duplicate</b>, then change it to <b>B</b> with a sad face.</p>",
          code: "input.onButtonPressed(Button.A, function () {\n    basic.showIcon(IconNames.Happy)\n})\ninput.onButtonPressed(Button.B, function () {\n    basic.showIcon(IconNames.Sad)\n})",
          tip: "Event blocks are <b>not</b> placed inside forever. They sit on their own in the workspace, waiting."
        },
        {
          title: "Shake and touch",
          html: "<p>Add <b>on shake</b> (surprised face) and <b>on logo pressed</b> (asleep face). Both are in <b>Input</b>. In the simulator, a <b>SHAKE</b> button appears and you can click the logo.</p>",
          code: "input.onGesture(Gesture.Shake, function () {\n    basic.showIcon(IconNames.Surprised)\n})\ninput.onLogoEvent(TouchButtonEvent.Pressed, function () {\n    basic.showIcon(IconNames.Asleep)\n})",
          hints: ["<b>on shake</b> is near the top of <b>Input</b>.", "<b>on logo pressed</b> is in <b>Input</b> too. It only works on the micro:bit V2."]
        },
        {
          title: "Download and test with the battery pack",
          html: "<p>Download, switch to the battery pack and test all four events. Shake works best when the micro:bit is not attached to a cable!</p>",
          checkLabel: "All 4 events work on the real micro:bit"
        },
        {
          level: "ext", title: "Add sound effects 🔊",
          html: "<p>The micro:bit V2 has a speaker. From <b>Music</b>, add a <b>play sound … in background</b> block to each event (giggle, sad, yawn, surprise…).</p>",
          code: "input.onButtonPressed(Button.A, function () {\n    basic.showIcon(IconNames.Happy)\n    music.play(music.builtinPlayableSoundEffect(soundExpression.giggle), music.PlaybackMode.InBackground)\n})",
          hints: ["Look for the block that says <b>play (giggle) in background</b> in <b>Music</b>."]
        },
        {
          level: "ext", title: "A+B = clear",
          html: "<p>When <b>A and B</b> are pressed together, clear the screen.</p>",
          hints: ["Use <b>on button A pressed</b> and change A to <b>A+B</b>.", "<b>clear screen</b> is in <b>Basic → … more</b>."],
          solution: "input.onButtonPressed(Button.AB, function () {\n    basic.clearScreen()\n})"
        },
        {
          level: "chal", title: "React to noise 🎤",
          html: "<p>Use the microphone: when there is a <b>loud sound</b> (a clap!), show a surprised face. When it becomes <b>quiet</b>, show the asleep face.</p>",
          hints: ["Look in <b>Input</b> for <b>on loud sound</b>.", "Click the dropdown in that block to change <b>loud</b> to <b>quiet</b> for the second event."],
          solution: "input.onSound(DetectedSound.Loud, function () {\n    basic.showIcon(IconNames.Surprised)\n})\ninput.onSound(DetectedSound.Quiet, function () {\n    basic.showIcon(IconNames.Asleep)\n})"
        }
      ]
    },
    {
      id: "exit", type: "quiz", nav: "Exit ticket", title: "Exit ticket", minutes: 5,
      intro: "<p>Discuss first, then click. Only your first answer counts.</p>",
      questions: [
        { q: "Which micro:bit part is <b>both</b> an input and an output?", options: ["Button B", "The speaker", "The radio antenna", "The processor"], answer: 2, explain: "The radio sends messages (output) and receives them (input)." },
        { q: "An animation is…", options: ["a single picture", "a sequence of pictures shown one after another", "a sound effect", "a type of sensor"], answer: 1, explain: "Each picture is a frame. Shown quickly in order, they look like movement." },
        { q: "What is an <b>event</b>?", options: ["A block that repeats forever", "Something that happens, like a button press, that makes code run", "A picture on the LEDs", "An error in the program"], answer: 1, explain: "Event blocks wait and run their code only when the event happens." },
        { q: "Where do you put an <b>on button A pressed</b> block?", options: ["Inside forever", "Inside on start", "On its own in the workspace", "Inside show icon"], answer: 2, explain: "Event blocks sit on their own and listen all the time." },
        { q: "Your animation is too fast. What can you add between the frames?", options: ["pause (ms)", "clear screen", "on start", "show number"], answer: 0, explain: "pause (ms) makes the micro:bit wait. 1000 ms = 1 second." }
      ]
    },
    {
      id: "reflect", type: "reflect", nav: "How did it go?", title: "How did it go?", minutes: 3,
      prompts: ["What was the most useful thing you learned today?", "What do you want to build with the micro:bit this term?"]
    },
    {
      id: "glossary", type: "glossary", nav: "Key words", title: "Key words",
      terms: [
        { term: "Input", def: "Information going into a computer, from a sensor or button." },
        { term: "Process", def: "What the processor does with the input, by following the program." },
        { term: "Output", def: "What the computer does in the world: light, sound, movement, messages." },
        { term: "Sensor", def: "An input device that measures something (light, temperature, movement, sound)." },
        { term: "Simulator", def: "A virtual micro:bit on screen for testing code before downloading." },
        { term: "Download", def: "Copying the program onto the micro:bit (also called 'flashing')." },
        { term: "Algorithm", def: "A set of steps, in the right order, to solve a problem." },
        { term: "Sequence", def: "Instructions that run one after another, in order." },
        { term: "Animation", def: "A sequence of pictures shown quickly to create movement." },
        { term: "Frame", def: "One picture in an animation." },
        { term: "Event", def: "Something that happens (a button press, a shake) which triggers code to run." },
        { term: "Loop", def: "Code that repeats: forever repeats endlessly; repeat runs a set number of times." }
      ]
    },
    {
      id: "next", type: "next", nav: "Next lesson", title: "Next lesson", emoji: "✂️",
      lesson: "B2 · Logic in blocks",
      teaser: "Variables, decisions (if/else) and random numbers: build Rock-Paper-Scissors and a step counter. Then you're ready for Python!"
    }
  ]
};
