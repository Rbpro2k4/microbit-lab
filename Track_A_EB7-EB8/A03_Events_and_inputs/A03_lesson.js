/* Lesson content. Used by the student page and by the build scripts
   that generate the teacher plan, slides and worksheet. */
window.LESSON = {
  id: "A3", track: "A", trackLabel: "Track A · Explorers", grades: "EB7 – EB8", number: 3,
  title: "Events & inputs",
  mission: "Make your micro:bit <b>react to you</b>. Buttons, shaking and the touch logo are <b>events</b>: build an <b>emotion badge</b> that changes its face, and plays a sound, when something happens.",
  chips: ["clock:60 minutes", "users:Group work", "puzzle:MakeCode blocks", "volume-2:Sound on"],
  rotateMinutes: 12,
  objectives: [
    "explain what an {{event}} is: something that happens and makes code run.",
    "use buttons A, B and A+B, {{shake}} and the {{touch logo}} as {{inputs|input}}.",
    "explain why {{event blocks|event block}} sit on their own and don't go inside forever.",
    "play {{sound effects|sound effect}} with the micro:bit's {{speaker}}."
  ],
  needs: [
    "1 micro:bit + USB cable + battery pack",
    "A computer with <b>Chrome</b> or <b>Edge</b>",
    "The MakeCode website: <b>makecode.microbit.org</b>",
    "Your group worksheet and a pencil"
  ],
  heroDemo: [["loop", "forever", [
    ["icon", "Asleep", 1300], ["press", "A"], ["icon", "Happy", 1200], ["press", "B"], ["icon", "Sad", 1200],
    ["shake"], ["icon", "Surprised", 1200], ["press", "A"], ["press", "B", 150], ["icon", "Heart", 1300]
  ]]],
  help: [
    { q: "Pressing the button does nothing in the simulator", a: "Check that your <b>show icon</b> block is <b>inside</b> the event block (it clicks into place). A block that is not connected looks faded and never runs." },
    { q: "One of my event blocks turned grey", a: "Two blocks have the <b>same</b> event, for example two <b>on button A pressed</b>. MakeCode switches one off. Change the copy to <b>B</b> (or another event)." },
    { q: "I can't find the SHAKE or A+B button in the simulator", a: "They appear only when your program uses <b>on shake</b> or <b>on button A+B pressed</b>. On the real micro:bit, press A and B at exactly the same time." },
    { q: "I can't hear any sound", a: "The sound comes from the <b>speaker</b> on the back of the micro:bit. In MakeCode, check that the simulator is not muted (the speaker button under it)." },
    { q: "Touching the logo does nothing", a: "Touch the gold oval above the LEDs with one finger and hold it for a moment. Only the micro:bit V2 has a touch logo, and all our boards are V2." }
  ],
  sections: [
    {
      id: "humans", type: "text", nav: "Human micro:bit", title: "Warm-up: Human micro:bit", minutes: 5, kind: "Unplugged · whole class",
      html: "<p>Today the whole class is a micro:bit. Each of you is waiting for an <b>event</b>: something that happens. When it happens, you do the action. Until then, you do <b>nothing</b>!</p><ol><li><b>When</b> the teacher claps → stand up.</li><li><b>When</b> the teacher says “shake” → wave both hands.</li><li><b>When</b> the teacher touches their head → say “beep!”</li><li><b>When</b> the teacher says “A and B” → sit down.</li></ol><div class=\"tip\"><b>Think:</b> you didn't know <i>when</i> you would stand up, but you were ready all the time. You were <b>listening</b> for an event. Event blocks on the micro:bit work the same way.</div>"
    },
    {
      id: "sort", type: "sort", nav: "Event or action?", title: "Event or action?", minutes: 3,
      intro: "<p>An event block has two parts: the <b>{{event}}</b> (what happens) and the <b>action</b> (what the micro:bit does then). Sort the cards.</p>",
      buckets: [
        { id: "in", label: "Event", icon: "zap", desc: "Something that happens: an input" },
        { id: "out", label: "Action", icon: "sparkles", desc: "What the micro:bit does: an output" }
      ],
      items: [
        { label: "Button A is pressed", icon: "circle-dot", bucket: "in", why: "Pressing a button is something that happens to the micro:bit: an event." },
        { label: "Show a happy face", icon: "smile", bucket: "out", why: "The micro:bit does this on its LED display: an action." },
        { label: "The micro:bit is shaken", icon: "vibrate", bucket: "in", why: "The micro:bit feels the shake with its motion sensor: an event." },
        { label: "Play a giggle sound", icon: "volume-2", bucket: "out", why: "The speaker makes a sound: an action." },
        { label: "The logo is touched", icon: "pointer", bucket: "in", why: "Your finger on the logo is something that happens: an event." },
        { label: "Scroll your name", icon: "type", bucket: "out", why: "The LEDs show your name: an action." },
        { label: "A and B are pressed together", icon: "mouse-pointer-click", bucket: "in", why: "Pressing both buttons at once is its own event: A+B." },
        { label: "Show the number 3", icon: "hash", bucket: "out", why: "The LEDs show a number: an action." }
      ],
      success: "Events are the <b>when</b>: something happens. Actions are the <b>then</b>: what the micro:bit does. An event block joins them: <b>when</b> button A is pressed, <b>then</b> show a happy face."
    },
    {
      id: "predict", type: "predict", nav: "Predict: events", title: "Predict → Run: who goes first?", minutes: 5,
      intro: "<p>This program has <b>three</b> parts. Two of them are <b>{{event blocks|event block}}</b>. Read it carefully.</p>",
      code: "input.onButtonPressed(Button.A, function () {\n    basic.showIcon(IconNames.Happy)\n})\ninput.onGesture(Gesture.Shake, function () {\n    basic.showIcon(IconNames.Surprised)\n})\nbasic.showIcon(IconNames.Asleep)",
      question: "The micro:bit turns on. <b>Nobody touches it.</b> What do you see?",
      options: [
        "A happy face, then a surprised face, then an asleep face",
        "Only an asleep face, and it stays there",
        "Nothing: the screen stays dark",
        "The three faces again and again"
      ],
      answer: 1,
      demo: [["pause", 300], ["icon", "Asleep", 3000]],
      explain: "Only <b>on start</b> runs by itself, so the asleep face appears and stays. The other two blocks are <b>event blocks</b>: they wait. Nobody pressed A or shook the micro:bit, so their code <b>never ran</b>. In A2 you learned that blocks run from top to bottom: that is true <i>inside</i> a block, but an event block only runs when its event happens."
    },
    {
      id: "mission", type: "mission", nav: "Mission: emotion badge", title: "Mission: Emotion badge", minutes: 30,
      intro: "<p>Build a badge that shows how you feel: every {{input}} shows a different face. Do the <b style=\"color:var(--core)\">Core</b> steps first. Finished? Level up to <b style=\"color:var(--ext)\">Extension</b> and <b style=\"color:var(--chal)\">Challenge</b>.</p>",
      steps: [
        {
          title: "Try the finished badge",
          html: "<p>Here is a virtual version of what you will build. Press <b>A</b>, <b>B</b> and <b>A+B</b>, touch the gold <b>logo</b> and press <b>Shake</b>. Turn the sound on!</p>",
          tool: { type: "eventDemo", title: "Try the emotion badge", startIcon: "Asleep", map: {
            A: { icon: "Happy", sound: "giggle", label: "happy face" },
            B: { icon: "Sad", sound: "sad", label: "sad face" },
            shake: { icon: "Surprised", sound: "surprised", label: "surprised face" },
            logo: { icon: "Asleep", sound: "yawn", label: "asleep face" },
            AB: { icon: "Heart", sound: "happy", label: "heart and a sound" }
          } },
          checkLabel: "We tried it"
        },
        {
          title: "Button A: a happy face",
          html: "<ol><li>New Project → name it <b>Emotion badge</b>.</li><li>From the pink <b>Input</b> category, drag <b>on button A pressed</b> into an empty space in the workspace.</li><li>From <b>Basic</b>, put a <b>show icon</b> inside it and choose the <b>happy</b> face.</li></ol><p>In the simulator, click button <b>A</b>. Nothing happens until you press it: the block is <b>waiting</b> for its event.</p>",
          code: "input.onButtonPressed(Button.A, function () {\n    basic.showIcon(IconNames.Happy)\n})",
          tip: "Event blocks sit <b>on their own</b> in the workspace. They don't go inside forever: they are always listening.",
          hints: ["<b>on button A pressed</b> is near the top of <b>Input</b>.", "If the show icon block looks faded, it is not connected. Drag it until it clicks inside the event block."]
        },
        {
          title: "Button B: a sad face",
          html: "<p>Right-click the <b>on button A pressed</b> block → <b>Duplicate</b>. In the copy, change <b>A</b> to <b>B</b> and choose the <b>sad</b> face.</p>",
          code: "input.onButtonPressed(Button.A, function () {\n    basic.showIcon(IconNames.Happy)\n})\ninput.onButtonPressed(Button.B, function () {\n    basic.showIcon(IconNames.Sad)\n})",
          warn: "Right after you duplicate, both blocks say A, so MakeCode turns the copy <b>grey</b>: it will never run. It comes back as soon as you change it to B.",
          hints: ["Click the small arrow next to <b>A</b> to choose <b>B</b>."]
        },
        {
          title: "Shake it, touch it",
          html: "<p>Add two more events from <b>Input</b>:</p><ul><li><b>on shake</b> → a <b>surprised</b> face</li><li><b>on logo pressed</b> → an <b>asleep</b> face</li></ul><p>In the simulator, a <b>SHAKE</b> button appears, and you can click the gold logo.</p>",
          code: "input.onGesture(Gesture.Shake, function () {\n    basic.showIcon(IconNames.Surprised)\n})\ninput.onLogoEvent(TouchButtonEvent.Pressed, function () {\n    basic.showIcon(IconNames.Asleep)\n})",
          codeLabel: "add these two blocks",
          hints: ["<b>on shake</b> is in <b>Input</b>, just under the button block.", "<b>on logo pressed</b> is in <b>Input</b> too. The logo is the gold oval above the LEDs."]
        },
        {
          title: "A+B: a heart and a sound",
          html: "<p>Add one more <b>on button A pressed</b> and choose <b>A+B</b>. Inside it, put:</p><ol><li>From <b>Music</b>: <b>play sound (hello) in background</b>. Click the sound name to choose any sound you like.</li><li>From <b>Basic</b>: <b>show icon</b> → the heart.</li></ol>",
          code: "input.onButtonPressed(Button.AB, function () {\n    music.play(music.builtinPlayableSoundEffect(soundExpression.hello), music.PlaybackMode.InBackground)\n    basic.showIcon(IconNames.Heart)\n})",
          tip: "<b>in background</b> means the next block runs straight away. With the sound first, the heart appears <b>while</b> the sound plays.",
          hints: ["<b>A+B</b> is in the same dropdown as A and B.", "<b>play sound … in background</b> is in the red <b>Music</b> category."]
        },
        {
          title: "Download and test",
          html: "<p>The <b>Hardware boss</b> downloads the program. Unplug the cable, connect the battery pack and test all <b>five</b> events. Can every person in your group make every face?</p>",
          tip: "Shake works best on battery power, with no cable in the way. For A+B, press both buttons at the same moment.",
          checkLabel: "All 5 events work on the real micro:bit"
        },
        {
          level: "ext", title: "A sound for every emotion",
          html: "<p>Give every face its own sound: happy → <b>giggle</b>, sad → <b>sad</b>, surprised → <b>spring</b>, asleep → <b>yawn</b>. Put the <b>play sound</b> block at the top of each event.</p>",
          hints: ["Right-click your play sound block → <b>Duplicate</b>, then drag the copy into another event.", "Put play sound <b>above</b> show icon, so the sound and the face start together."],
          solution: "input.onButtonPressed(Button.A, function () {\n    music.play(music.builtinPlayableSoundEffect(soundExpression.giggle), music.PlaybackMode.InBackground)\n    basic.showIcon(IconNames.Happy)\n})\ninput.onButtonPressed(Button.B, function () {\n    music.play(music.builtinPlayableSoundEffect(soundExpression.sad), music.PlaybackMode.InBackground)\n    basic.showIcon(IconNames.Sad)\n})\ninput.onGesture(Gesture.Shake, function () {\n    music.play(music.builtinPlayableSoundEffect(soundExpression.spring), music.PlaybackMode.InBackground)\n    basic.showIcon(IconNames.Surprised)\n})\ninput.onLogoEvent(TouchButtonEvent.Pressed, function () {\n    music.play(music.builtinPlayableSoundEffect(soundExpression.yawn), music.PlaybackMode.InBackground)\n    basic.showIcon(IconNames.Asleep)\n})"
        },
        {
          level: "ext", title: "Tilt it!",
          html: "<p>The micro:bit can feel which way it is <b>tilted</b>. Add an <b>on shake</b> block and change <b>shake</b> to <b>tilt left</b>: show an arrow pointing left. Add another one for <b>tilt right</b>.</p>",
          tip: "In the simulator, move the mouse over the micro:bit to tilt it.",
          hints: ["Click <b>shake</b> in the block to see every gesture: logo up, logo down, screen up, screen down, tilt left, tilt right…", "<b>show arrow</b> is in <b>Basic → … more</b>."],
          solution: "input.onGesture(Gesture.TiltLeft, function () {\n    basic.showArrow(ArrowNames.West)\n})\ninput.onGesture(Gesture.TiltRight, function () {\n    basic.showArrow(ArrowNames.East)\n})"
        },
        {
          level: "chal", title: "Compose a mood melody",
          html: "<p>Swap the A+B sound for <b>your own tune</b>. From <b>Music</b>, use <b>play melody … at tempo 120 (bpm)</b>. Click the melody to open the editor, then click the squares to place notes. Make a happy tune (notes going up) or a sad one (notes going down).</p>",
          hints: ["Notes higher up in the melody editor sound higher.", "<b>until done</b> waits for the end of the tune. <b>in background</b> lets the next block run straight away."],
          solution: "input.onButtonPressed(Button.AB, function () {\n    basic.showIcon(IconNames.Heart)\n    music.play(music.stringPlayable(\"C D E F G A B C5 \", 120), music.PlaybackMode.UntilDone)\n})"
        },
        {
          level: "chal", title: "Secret face",
          html: "<p>Add a secret event: <b>on logo long pressed</b>. Hold the logo for a second and a secret face appears, one you design yourself with <b>show leds</b>. This one winks. Change it, then build it in MakeCode:</p>",
          tool: { type: "ledDesigner", title: "Design your secret face", start: [".....|##.#.|.....|#...#|.###."], wrap: "input.onLogoEvent(TouchButtonEvent.LongPressed, function () {\n%\n})" },
          hints: ["Use an <b>on logo pressed</b> block and click <b>pressed</b> to choose <b>long pressed</b>.", "<b>show leds</b> is in <b>Basic</b>. Click the squares to switch LEDs on."],
          solution: "input.onLogoEvent(TouchButtonEvent.LongPressed, function () {\n    basic.showLeds(`\n        . . . . .\n        # # . # .\n        . . . . .\n        # . . . #\n        . # # # .\n        `)\n})"
        }
      ]
    },
    {
      id: "exit", type: "quiz", nav: "Exit ticket", title: "Exit ticket", minutes: 5,
      intro: "<p>Answer together as a group. Your first answer counts, so discuss before you click!</p>",
      questions: [
        { q: "What is an <b>event</b>?", options: ["A block that repeats forever", "Something that happens, like a button press, that makes code run", "A picture on the LED display", "A mistake in a program"], answer: 1, explain: "Pressing a button, shaking or touching the logo are all events." },
        { q: "Where does an <b>on button A pressed</b> block go?", options: ["Inside forever", "Inside on start", "On its own in the workspace", "Inside show icon"], answer: 2, explain: "Event blocks sit on their own. They are always listening, so they don't need forever." },
        { q: "You press button <b>B</b>. What do you see?", code: "input.onButtonPressed(Button.A, function () {\n    basic.showIcon(IconNames.Happy)\n})\ninput.onButtonPressed(Button.B, function () {\n    basic.showIcon(IconNames.Sad)\n})\ninput.onGesture(Gesture.Shake, function () {\n    basic.showIcon(IconNames.Surprised)\n})", options: ["A happy face", "A sad face", "A surprised face", "All three faces, one after the other"], answer: 1, explain: "Only the code inside <b>on button B pressed</b> runs. The other events did not happen." },
        { q: "Which part of the micro:bit plays the sounds?", options: ["The LED display", "The touch logo", "The speaker on the back", "Button B"], answer: 2, explain: "The micro:bit V2 has a small speaker on the back of the board." },
        { q: "Your badge should show a heart when <b>A and B</b> are pressed together. Which event do you use?", options: ["on button A pressed", "on button B pressed", "on button A+B pressed", "on shake"], answer: 2, explain: "A+B is its own event. Choose it in the dropdown of the button block." }
      ]
    },
    {
      id: "reflect", type: "reflect", nav: "How did it go?", title: "How did it go?", minutes: 3,
      intro: "<p>Be honest! This helps your teacher plan the next lesson.</p>",
      prompts: ["One event we used today, and what our badge did:", "A gadget at home that reacts to an event (event → action):"]
    },
    {
      id: "glossary", type: "glossary", nav: "Key words", title: "Key words",
      terms: [
        { term: "Event", def: "Something that happens, like a button press or a shake, that makes code run." },
        { term: "Event block", def: "A block like on button A pressed. It waits, and runs the blocks inside it only when its event happens." },
        { term: "Input", def: "Information going into the micro:bit: buttons, the touch logo, the motion sensor…" },
        { term: "Output", def: "What the micro:bit does in the world: pictures on the LEDs, sounds…" },
        { term: "Action", def: "What the micro:bit does when an event happens, for example show a happy face." },
        { term: "Shake", def: "An event: the motion sensor (accelerometer) feels the micro:bit being shaken." },
        { term: "Gesture", def: "A way of moving the micro:bit that it can recognise: shake, tilt left, tilt right, logo up…" },
        { term: "Touch logo", def: "The gold oval above the LEDs. It senses your finger (micro:bit V2 only)." },
        { term: "Speaker", def: "The part on the back of the micro:bit V2 that plays sounds and music." },
        { term: "Sound effect", def: "A ready-made sound like giggle, hello or yawn, played with play sound." },
        { term: "Melody", def: "A tune made of notes, one after another." }
      ]
    },
    {
      id: "next", type: "next", nav: "Next lesson", title: "Next lesson", icon: "footprints",
      lesson: "A4 · Variables",
      teaser: "Give your micro:bit a memory! Use a variable to count every shake and build a step counter."
    }
  ]
};
