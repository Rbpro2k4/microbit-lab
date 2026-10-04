/* Lesson content. Used by the student page and by the build scripts
   that generate the teacher plan, slides and worksheet. */
window.LESSON = {
  id: "B2", track: "B", trackLabel: "Track B · Engineers", grades: "EB9 – Seconde", number: 2,
  title: "Logic in blocks",
  mission: "Give your micro:bit a <b>memory</b> and a <b>brain</b>: a step counter that remembers with a variable, and a Rock-Paper-Scissors game that makes decisions.",
  chips: ["clock:60 minutes", "users:Group work", "puzzle:MakeCode blocks", "brain:Logic"],
  rotateMinutes: 12,
  objectives: [
    "use a {{variable}} to store a value and change it.",
    "use {{random}} numbers to make a program unpredictable.",
    "make decisions in code with {{if / else}}.",
    "use a {{repeat}} {{loop}} to run blocks a set number of times."
  ],
  needs: [
    "1 micro:bit + USB cable + battery pack",
    "A computer with <b>Chrome</b> or <b>Edge</b>",
    "The MakeCode website: <b>makecode.microbit.org</b>",
    "Your group worksheet"
  ],
  heroDemo: [["loop", "forever", [
    ["icon", "SmallDiamond", 220], ["icon", "Diamond", 220], ["icon", "SmallDiamond", 220], ["icon", "Diamond", 220], ["icon", "Scissors", 1300],
    ["icon", "SmallDiamond", 220], ["icon", "Diamond", 220], ["icon", "SmallDiamond", 220], ["icon", "Diamond", 220], ["icon", "Square", 1300]
  ]]],
  help: [
    { q: "I can't find my variable's blocks", a: "Click <b>Variables</b> → <b>Make a Variable…</b>, type the name and click OK. The <b>set</b>, <b>change</b> and round value blocks for it then appear in Variables." },
    { q: "My if block only has one part", a: "Click the <b>+</b> at the bottom of the if block to add <b>else</b>. Click it again to add <b>else if</b>." },
    { q: "The step counter counts too many (or too few) steps", a: "It counts shakes, not real steps. Hold the micro:bit firmly and walk normally. Write what you notice on the worksheet: that's real engineering testing!" }
  ],
  sections: [
    {
      id: "diagnostic", type: "quiz", diagnostic: true, nav: "Quick check", title: "Quick check: what do you already know?", minutes: 5, kind: "Diagnostic · it doesn't count",
      intro: "<p>Read each program and answer as a group. <b>It doesn't count</b>: it shows you (and your teacher) where to start today. Don't worry if it's all new!</p>",
      questions: [
        { q: "What number does the micro:bit show?", code: "let score = 0\nscore = 0\nscore += 2\nscore += 3\nbasic.showNumber(score)", options: ["0", "3", "5", "The word “score”"], answer: 2, explain: "score starts at 0, then changes by 2 (it becomes 2), then by 3 (it becomes 5)." },
        { q: "Which face appears?", code: "let temp = 25\nif (temp > 30) {\n    basic.showIcon(IconNames.Happy)\n} else {\n    basic.showIcon(IconNames.Sad)\n}", options: ["Happy", "Sad", "Both, one after the other", "None"], answer: 1, explain: "25 is not more than 30, so the condition is false and the <b>else</b> part runs." },
        { q: "How many times does the heart appear?", code: "for (let index = 0; index < 4; index++) {\n    basic.showIcon(IconNames.Heart)\n    basic.clearScreen()\n}", options: ["1", "3", "4", "Forever"], answer: 2, explain: "<b>repeat 4 times</b> runs the blocks inside it 4 times, then stops." },
        { q: "What does this program show?", code: "basic.showNumber(randint(1, 6))", options: ["Always 1", "A random number from 1 to 6", "A random number from 0 to 6", "1, 2, 3, 4, 5, 6 in order"], answer: 1, explain: "<b>pick random 1 to 6</b> can give any whole number from 1 to 6, like a dice." },
        { q: "What is shown?", code: "let lives = 3\nlives += -1\nif (lives == 0) {\n    basic.showString(\"GAME OVER\")\n} else {\n    basic.showNumber(lives)\n}", options: ["3", "2", "GAME OVER", "0"], answer: 1, explain: "lives goes from 3 to 2. 2 is not 0, so the <b>else</b> part shows the number 2." }
      ],
      bands: [
        { min: 0, level: "core", label: "Route: step by step", text: "Most of this is new, and that's fine: today's lesson is made for you. Follow every Core step and use the hints." },
        { min: 2, level: "ext", label: "Route: Core + Extensions", text: "You already know some of this. Do the Core steps quickly, then try the Extensions." },
        { min: 4, level: "chal", label: "Route: fast lane", text: "You read code well! Do the Core steps fast, then go for the Challenges and Mission 3 (reaction game)." }
      ]
    },
    {
      id: "predict", type: "predict", nav: "Predict: variables", title: "Predict → Run: a variable", minutes: 4,
      intro: "<p>A <b>{{variable}}</b> is a named box that stores a value, like a number. This program has a variable called <b>steps</b>. Read it carefully.</p>",
      code: "let steps = 0\ninput.onButtonPressed(Button.A, function () {\n    basic.showNumber(steps)\n})\ninput.onGesture(Gesture.Shake, function () {\n    steps += 1\n})\nsteps = 0",
      question: "The micro:bit turns on. You shake it <b>3 times</b>, then press <b>A</b>. What does it show?",
      options: ["0", "3", "1", "The word “steps”"],
      answer: 1,
      demo: [["pause", 300], ["shake"], ["shake"], ["shake"], ["press", "A"], ["number", 3]],
      explain: "<b>on start</b> sets steps to 0. Each shake <b>changes steps by 1</b>: 1, 2, 3. When you press A, the micro:bit shows the value stored in the box: <b>3</b>."
    },
    {
      id: "m1", type: "mission", nav: "Mission 1: steps", title: "Mission 1: Step counter", minutes: 13,
      intro: "<p>Turn your micro:bit into a step counter, like a fitness watch. The <b>steps</b> variable is its memory.</p>",
      steps: [
        {
          title: "Try the finished project",
          html: "<p>Shake the virtual micro:bit a few times, then press A. Watch the <b>steps</b> box: that's the variable. Press B to reset it.</p>",
          tool: { type: "eventDemo", title: "Try the step counter", watch: ["steps"], vars: { steps: 0 }, map: { shake: { inc: "steps", label: "change steps by 1" }, A: { showVar: "steps", label: "show the value of steps" }, B: { set: { steps: 0 }, icon: "Yes", label: "set steps to 0" } } },
          checkLabel: "We tried it"
        },
        {
          title: "Make the variable",
          html: "<ol><li>New Project: <b>Step counter</b>.</li><li>Click <b>Variables</b> → <b>Make a Variable…</b> → type <b>steps</b> → OK.</li><li>Drag <b>set steps to 0</b> into <b>on start</b>.</li></ol>",
          code: "let steps = 0",
          tip: "Give variables clear names. <b>steps</b> is better than <b>x</b>: anyone reading the code knows what it stores."
        },
        {
          title: "Count every shake",
          html: "<p>From <b>Input</b>, drag <b>on shake</b> into the workspace. Inside it, put <b>change steps by 1</b> (from <b>Variables</b>).</p>",
          code: "let steps = 0\ninput.onGesture(Gesture.Shake, function () {\n    steps += 1\n})\nsteps = 0",
          hints: ["<b>change … by 1</b> is in <b>Variables</b>. Check that its dropdown says <b>steps</b>."]
        },
        {
          title: "Show and reset",
          html: "<p>Add <b>on button A pressed</b> → <b>show number</b> with the round <b>steps</b> block inside. Add <b>on button B pressed</b> → <b>set steps to 0</b> and a tick icon.</p>",
          code: "let steps = 0\ninput.onButtonPressed(Button.A, function () {\n    basic.showNumber(steps)\n})\ninput.onButtonPressed(Button.B, function () {\n    steps = 0\n    basic.showIcon(IconNames.Yes)\n})\ninput.onGesture(Gesture.Shake, function () {\n    steps += 1\n})\nsteps = 0",
          hints: ["Drag the round <b>steps</b> block from <b>Variables</b> into the hole in <b>show number</b>.", "Right-click a block → <b>Duplicate</b> saves time."]
        },
        {
          title: "Walk test",
          html: "<p>Download, connect the battery pack and walk <b>20 real steps</b> holding the micro:bit. Press A. Did it count 20? Do it twice and write the results on the worksheet.</p>",
          checkLabel: "We did the walk test"
        },
        {
          level: "ext", title: "Progress bar",
          html: "<p>Show your progress towards 20 steps while you walk: inside <b>on shake</b>, after <b>change steps by 1</b>, add <b>plot bar graph of steps up to 20</b> (from <b>Led</b>).</p>",
          hints: ["<b>plot bar graph</b> is in the <b>Led</b> category."],
          solution: "input.onGesture(Gesture.Shake, function () {\n    steps += 1\n    led.plotBarGraph(steps, 20)\n})\nlet steps = 0"
        },
        {
          level: "chal", title: "Goal reached!",
          html: "<p>When <b>steps</b> reaches <b>20</b>, show a tick and play a happy sound. You'll need an <b>if</b> block from <b>Logic</b>.</p>",
          hints: ["Put <b>if … then</b> inside <b>on shake</b>, after the change block.", "Use the <b>0 = 0</b> comparison block from <b>Logic</b>: steps = 20."],
          solution: "input.onGesture(Gesture.Shake, function () {\n    steps += 1\n    if (steps == 20) {\n        basic.showIcon(IconNames.Yes)\n        music.play(music.builtinPlayableSoundEffect(soundExpression.happy), music.PlaybackMode.InBackground)\n    }\n})\nlet steps = 0"
        }
      ]
    },
    {
      id: "m2", type: "mission", nav: "Mission 2: RPS", title: "Mission 2: Rock-Paper-Scissors", minutes: 18,
      intro: "<p>Shake to play! The micro:bit picks a <b>{{random}}</b> number, then makes a <b>decision</b> with <b>{{if / else}}</b>: 1 = rock, 2 = paper, 3 = scissors.</p>",
      steps: [
        {
          title: "Try the finished game",
          html: "<p>Shake the virtual micro:bit. Watch the <b>hand</b> variable: the micro:bit picks 1, 2 or 3, then shows the matching picture.</p>",
          tool: { type: "eventDemo", title: "Try Rock-Paper-Scissors", watch: ["hand"], vars: { hand: 0 }, startIcon: "Happy", map: { shake: { pre: [["loop", 3, [["icon", "SmallDiamond", 160], ["icon", "Diamond", 160]]]], randomVar: ["hand", 1, 3], iconFor: { 1: "SmallSquare", 2: "Square", 3: "Scissors" }, label: "drum roll, then rock (1), paper (2) or scissors (3)" } } },
          checkLabel: "We tried it"
        },
        {
          title: "Pick a random number",
          html: "<ol><li>New Project: <b>Rock Paper Scissors</b>. Make a variable called <b>hand</b>.</li><li>In <b>on shake</b>: <b>set hand to pick random 1 to 3</b> (pick random is in <b>Math</b>).</li><li>Add <b>show number hand</b> to check it works.</li></ol><p>Shake the simulator many times: do you see 1, 2 and 3?</p>",
          code: "input.onGesture(Gesture.Shake, function () {\n    hand = randint(1, 3)\n    basic.showNumber(hand)\n})\nlet hand = 0",
          tip: "Showing a variable's value on the screen is a great debugging trick: you can see what the program is “thinking”."
        },
        {
          title: "Decide with if / else",
          html: "<p>Replace <b>show number</b> with an <b>if</b> block from <b>Logic</b>. Click its <b>+</b> twice to get <b>else if</b> and <b>else</b>:</p><ul><li>if <b>hand = 1</b> → rock (small square)</li><li>else if <b>hand = 2</b> → paper (big square)</li><li>else → scissors</li></ul>",
          code: "input.onGesture(Gesture.Shake, function () {\n    hand = randint(1, 3)\n    if (hand == 1) {\n        basic.showIcon(IconNames.SmallSquare)\n    } else if (hand == 2) {\n        basic.showIcon(IconNames.Square)\n    } else {\n        basic.showIcon(IconNames.Scissors)\n    }\n})\nlet hand = 0",
          hints: ["The comparison block <b>0 = 0</b> is in <b>Logic</b>. Drop the round <b>hand</b> block into its left side.", "Why is the last part just <b>else</b>? If hand isn't 1 or 2, it must be 3!"]
        },
        {
          title: "Drum roll with repeat",
          html: "<p>Build suspense! At the start of <b>on shake</b>, add <b>repeat 3 times</b> (from <b>Loops</b>) with a small diamond and a big diamond inside. Then the hand appears.</p>",
          code: "input.onGesture(Gesture.Shake, function () {\n    for (let index = 0; index < 3; index++) {\n        basic.showIcon(IconNames.SmallDiamond)\n        basic.showIcon(IconNames.Diamond)\n    }\n    hand = randint(1, 3)\n    if (hand == 1) {\n        basic.showIcon(IconNames.SmallSquare)\n    } else if (hand == 2) {\n        basic.showIcon(IconNames.Square)\n    } else {\n        basic.showIcon(IconNames.Scissors)\n    }\n})\nlet hand = 0",
          tip: "<b>forever</b> repeats until the power is off. <b>repeat</b> runs a set number of times, then the program moves on."
        },
        {
          title: "Play!",
          html: "<p>Download, connect the battery pack and play <b>best of 5</b> against a neighbour group: both groups shake at the same time.</p>",
          checkLabel: "We played a match"
        },
        {
          level: "ext", title: "Is it fair?",
          html: "<p>Shake <b>30 times</b> and make a tally mark on the worksheet for each result. Did rock, paper and scissors come up about the same number of times? Why might they not be exactly equal?</p>",
          checkLabel: "We tested it 30 times"
        },
        {
          level: "chal", title: "Score keeper",
          html: "<p>Add a <b>score</b> variable: press <b>A</b> when you win a round (+1, then show the score), press <b>B</b> to reset it to 0.</p>",
          hints: ["Make a new variable called <b>score</b>.", "on button A pressed: change score by 1, then show number score."],
          solution: "input.onButtonPressed(Button.A, function () {\n    score += 1\n    basic.showNumber(score)\n})\ninput.onButtonPressed(Button.B, function () {\n    score = 0\n    basic.showNumber(score)\n})\nlet score = 0"
        }
      ]
    },
    {
      id: "m3", type: "mission", optional: true, nav: "Mission 3: fast lane", title: "Mission 3 (fast lane): Reaction game", minutes: 10,
      intro: "<p>For fast-lane groups, or anyone who finishes Mission 2. Press A, wait for the heart, then press B as fast as you can. The micro:bit measures your reaction time in milliseconds.</p>",
      steps: [
        {
          level: "chal", title: "Random wait, then GO",
          html: "<p>New Project: <b>Reaction game</b>. In <b>on button A pressed</b>: clear the screen, <b>pause</b> for a <b>random</b> time between 1000 and 4000 ms, then show a heart. Nobody knows when it will appear!</p>",
          code: "input.onButtonPressed(Button.A, function () {\n    basic.clearScreen()\n    basic.pause(randint(1000, 4000))\n    basic.showIcon(IconNames.Heart)\n})",
          hints: ["Drop a <b>pick random</b> block (from <b>Math</b>) into the pause block."]
        },
        {
          level: "chal", title: "Measure the time",
          html: "<p>Make a variable <b>start</b>. Right after the heart appears, <b>set start to running time (ms)</b>. In <b>on button B pressed</b>, show <b>running time (ms) − start</b>: that's your reaction time!</p>",
          code: "input.onButtonPressed(Button.A, function () {\n    basic.clearScreen()\n    basic.pause(randint(1000, 4000))\n    basic.showIcon(IconNames.Heart)\n    start = input.runningTime()\n})\ninput.onButtonPressed(Button.B, function () {\n    basic.showNumber(input.runningTime() - start)\n})\nlet start = 0",
          hints: ["<b>running time (ms)</b> is in <b>Input</b> → <b>… more</b>.", "The minus block is in <b>Math</b>."]
        },
        {
          level: "chal", title: "No cheating!",
          html: "<p>Pressing B before the heart appears is cheating! Add a variable <b>waiting</b> that is <b>true</b> or <b>false</b>. Set it to true when the heart appears. In <b>on button B pressed</b>: <b>if waiting</b> → show the time and set waiting to false, <b>else</b> → show a cross.</p>",
          hints: ["<b>true</b> and <b>false</b> are in <b>Logic</b>.", "A value that can only be true or false is called a <b>{{Boolean}}</b>."],
          solution: "input.onButtonPressed(Button.A, function () {\n    waiting = false\n    basic.clearScreen()\n    basic.pause(randint(1000, 4000))\n    basic.showIcon(IconNames.Heart)\n    start = input.runningTime()\n    waiting = true\n})\ninput.onButtonPressed(Button.B, function () {\n    if (waiting) {\n        waiting = false\n        basic.showNumber(input.runningTime() - start)\n    } else {\n        basic.showIcon(IconNames.No)\n    }\n})\nlet waiting = false\nlet start = 0"
        }
      ]
    },
    {
      id: "exit", type: "quiz", nav: "Exit ticket", title: "Exit ticket", minutes: 5,
      intro: "<p>Discuss first, then click. Only your first answer counts.</p>",
      questions: [
        { q: "What is a <b>variable</b>?", options: ["A block that repeats forever", "A named box that stores a value, which can change", "A random number", "A type of sensor"], answer: 1, explain: "steps, hand and score were all variables today." },
        { q: "<b>steps</b> is 4. Then <b>change steps by 1</b> runs. What is steps now?", options: ["1", "4", "5", "41"], answer: 2, explain: "change by 1 adds 1 to the value already in the box: 4 + 1 = 5." },
        { q: "<b>pick random 1 to 3</b> can give…", options: ["only 1 or 3", "1, 2 or 3", "0, 1, 2 or 3", "any number"], answer: 1, explain: "Both ends are included: 1, 2 or 3." },
        { q: "In an <b>if / else</b> block, when does the <b>else</b> part run?", options: ["Always", "When the condition is true", "When the condition is false", "Never"], answer: 2, explain: "If the condition is true, the first part runs. Otherwise, the else part runs." },
        { q: "Which block runs its blocks a <b>set number of times</b>?", options: ["forever", "repeat 3 times", "on start", "if then"], answer: 1, explain: "repeat runs a set number of times, then the program moves on. forever never stops." }
      ]
    },
    {
      id: "reflect", type: "reflect", nav: "How did it go?", title: "How did it go?", minutes: 3,
      prompts: ["Which was hardest today: variables, random, if / else or loops? Why?", "Another game you could make with these blocks:"]
    },
    {
      id: "glossary", type: "glossary", nav: "Key words", title: "Key words",
      terms: [
        { term: "Variable", def: "A named box in the computer's memory that stores a value. The value can change." },
        { term: "Value", def: "What is stored in a variable, for example the number 3." },
        { term: "Set", def: "set steps to 0 puts a new value in the variable." },
        { term: "Change", def: "change steps by 1 adds 1 to the value already there." },
        { term: "Random", def: "Chosen by chance, so you can't predict it. pick random 1 to 3 gives 1, 2 or 3." },
        { term: "Condition", def: "A question that is either true or false, like hand = 1." },
        { term: "If / else", def: "Runs some blocks if a condition is true, and other blocks (else) if it is false." },
        { term: "Comparison", def: "Compares two values: = (equal to), < (less than), > (greater than)." },
        { term: "Loop", def: "Blocks that repeat." },
        { term: "Repeat", def: "A loop that runs a set number of times, then stops." },
        { term: "Forever", def: "A loop that never stops (until the power is switched off)." },
        { term: "Boolean", def: "A value that can only be true or false." }
      ]
    },
    {
      id: "next", type: "next", nav: "Next lesson", title: "Next lesson", icon: "terminal",
      lesson: "B3 · Hello Python",
      teaser: "Time to type! Write your first programs in Python with the micro:bit Python Editor, and compare them with the blocks you know."
    }
  ]
};
