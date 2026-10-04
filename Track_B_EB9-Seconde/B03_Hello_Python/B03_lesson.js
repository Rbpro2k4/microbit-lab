/* Lesson content. Used by the student page and by the build scripts
   that generate the teacher plan, slides and worksheet. */
window.LESSON = {
  id: "B3", track: "B", trackLabel: "Track B · Engineers", grades: "EB9 – Seconde", number: 3,
  title: "Hello Python",
  editor: "python",
  mission: "Time to <b>type</b>! Write your first <b>Python</b> programs in the micro:bit Python Editor: a name badge and a beating heart. Learn Python's rules, and how to fix the mistakes everyone makes.",
  chips: ["clock:60 minutes", "users:Group work", "terminal:Python", "keyboard:Typing"],
  rotateMinutes: 12,
  objectives: [
    "write and run a {{Python}} program in the micro:bit {{Python Editor}}.",
    "use <code>display.scroll</code>, <code>display.show</code> and {{sleep}} to show text and pictures.",
    "explain why {{indentation}} matters in a <code>while True:</code> {{loop}}.",
    "read the editor's {{error messages|error message}} and fix {{syntax}} mistakes."
  ],
  needs: [
    "1 micro:bit + USB cable + battery pack",
    "A computer with <b>Chrome</b> or <b>Edge</b>",
    "The micro:bit Python Editor: <b>python.microbit.org</b>",
    "Your group worksheet"
  ],
  heroDemo: [["loop", "forever", [
    ["scroll", "HELLO PYTHON"], ["icon", "Heart", 500], ["icon", "SmallHeart", 500], ["icon", "Heart", 500], ["icon", "SmallHeart", 500]
  ]]],
  help: [
    { q: "There is someone else's code in the editor", a: "The editor remembers the last program on this computer. Open the <b>Project</b> tab on the left and click <b>Reset project</b>." },
    { q: "A red dot appeared next to a line", a: "Python found a mistake on that line, or on the line just above it. Click the red dot to read the message, for example <b>Missing colon</b> or <b>Indent missing</b>." },
    { q: "How do I indent a line?", a: "Press the <kbd>Tab</kbd> key: the editor puts 4 spaces. After a line that ends with a colon <b>:</b>, the editor indents the next line for you when you press <kbd>Enter</kbd>." },
    { q: "The simulator doesn't show anything", a: "Click the big <b>play</b> button on the virtual micro:bit. After you change the code, click play again (or the reset button under it)." },
    { q: "Send to micro:bit doesn't work", a: "Use <b>Chrome</b> or <b>Edge</b>. The first time, follow the steps and choose <b>BBC micro:bit CMSIS-DAP</b>. Plan B: click <b>Save</b>, then drag the .hex file onto the <b>MICROBIT</b> drive." }
  ],
  sections: [
    {
      id: "warmup", type: "quiz", nav: "You can read Python", title: "Warm-up: You can already read Python", minutes: 4, kind: "Guess · learn from the answers",
      intro: "<p>You know these blocks from B1 and B2. Each one has a twin in <b>{{Python}}</b>. Read the block, then guess the matching line of Python. Look for words you recognise!</p>",
      questions: [
        { q: "Which line of Python does the same as this block?", code: "basic.showString(\"HELLO\")", options: ["<code>display.scroll(\"HELLO\")</code>", "<code>show.string(HELLO)</code>", "<code>print HELLO</code>", "<code>HELLO.display()</code>"], answer: 0, explain: "In Python, text <b>scrolls</b> across the <b>display</b>. The text goes inside quote marks." },
        { q: "And this one?", code: "basic.showIcon(IconNames.Heart)", options: ["<code>display.scroll(heart)</code>", "<code>display.show(Image.HEART)</code>", "<code>icon = heart</code>", "<code>show icon heart</code>"], answer: 1, explain: "Pictures are called <b>images</b> in Python. <code>Image.HEART</code> is the built-in heart." },
        { q: "And this one?", code: "basic.pause(1000)", options: ["<code>wait 1 second</code>", "<code>pause = 1000</code>", "<code>sleep(1000)</code>", "<code>stop(1)</code>"], answer: 2, explain: "<code>sleep(1000)</code> waits 1000 ms (1 second), exactly like the pause block." },
        { q: "Which Python words do the same job as the <b>forever</b> block?", code: "basic.forever(function () {\n    basic.showIcon(IconNames.Happy)\n})", options: ["<code>repeat:</code>", "<code>forever()</code>", "<code>while True:</code>", "<code>loop.start</code>"], answer: 2, explain: "<code>while True:</code> repeats the lines under it again and again, like forever. Those lines are moved to the right: they are <b>indented</b>." }
      ]
    },
    {
      id: "editor", type: "editorTour", variant: "python", nav: "The Python Editor", title: "The Python Editor in 1 minute", minutes: 3,
      intro: "<p>Python programs are written in the <b>micro:bit {{Python Editor}}</b>. Click each yellow number to find out what that part does.</p>",
      parts: [
        { id: "code", name: "Code area", desc: "Type your Python here. The numbers on the left are <b>line numbers</b>: error messages tell you which line to check." },
        { id: "sim", name: "Simulator", desc: "A virtual micro:bit. Click <b>play</b> to run your code. Buttons, the logo and the sensors are under it." },
        { id: "send", name: "Send to micro:bit", desc: "Sends your program to the real micro:bit (in Chrome or Edge)." },
        { id: "save", name: "Save", desc: "Saves your program as a <b>.hex</b> file: for drag and drop, or to keep your work." },
        { id: "reference", name: "Reference", desc: "Examples of every command. You can drag code from here into your program." },
        { id: "project", name: "Project", desc: "Rename your project, or <b>Reset project</b> to start again from the starter code." }
      ],
      after: "<b>Shared computers:</b> the editor remembers the last program. If you see another group's code, open <b>Project</b> → <b>Reset project</b>."
    },
    {
      id: "m1", type: "mission", nav: "Mission 1: Hello", title: "Mission 1: Hello, Python", minutes: 13,
      intro: "<p>Your first Python program: a name badge. <b>Type</b> every line yourself, don't copy it: typing is how you learn Python's rules.</p>",
      steps: [
        {
          title: "Read the starter program",
          html: "<ol><li>Open <b>python.microbit.org</b>. If you see another group's code: <b>Project</b> → <b>Reset project</b>.</li><li>Read the starter program. Lines that start with <code>#</code> are <b>{{comments|comment}}</b>: notes for humans that the micro:bit ignores.</li><li>Guess what it does, then click <b>play</b> on the simulator to check.</li></ol>",
          code: "# Imports go at the top\nfrom microbit import *\n\n# Code in a 'while True:' loop repeats forever\nwhile True:\n    display.show(Image.HEART)\n    sleep(1000)\n    display.scroll('Hello')",
          lang: "python", codeLabel: "the starter program", noCopy: true,
          checkLabel: "We ran the starter program"
        },
        {
          title: "Scroll your name",
          html: "<p>Select all the code (<kbd>Ctrl</kbd> + <kbd>A</kbd>) and delete it. Type this program with your own name, then run it in the simulator.</p>",
          code: "from microbit import *\n\ndisplay.scroll(\"ALI\")",
          lang: "python", noCopy: true,
          tip: "<code>from microbit import *</code> goes at the top of <b>every</b> micro:bit program. It gives Python the micro:bit's commands, like <code>display</code> and <code>sleep</code>.",
          hints: ["Text needs quote marks on <b>both</b> sides: <code>\"ALI\"</code>.", "Python cares about capital letters: <code>display</code>, not <code>Display</code>."]
        },
        {
          title: "Forever: while True",
          html: "<p>Your name scrolled only once. To repeat it, put it in a <b>{{loop}}</b>:</p>",
          code: "from microbit import *\n\nwhile True:\n    display.scroll(\"ALI\")\n    display.show(Image.HEART)\n    sleep(1000)",
          lang: "python", noCopy: true,
          tip: "The <b>colon</b> <code>:</code> starts the loop. The lines under it are moved 4 spaces to the right: that is <b>{{indentation}}</b>. Every indented line is <i>inside</i> the loop and repeats.",
          hints: ["After the colon, press <kbd>Enter</kbd>: the editor indents the next line for you. Or press <kbd>Tab</kbd>.", "<code>True</code> needs a capital T."]
        },
        {
          title: "Break it on purpose",
          html: "<p>Every programmer makes mistakes, so learn what they look like! Make each mistake below, click the <b>red dot</b> next to the line to read the message, write it on the worksheet, then fix it:</p><ol><li>Delete the <b>colon</b> after <code>while True</code>.</li><li>Delete the <b>closing quote mark</b> after your name.</li><li>Delete the spaces in front of <code>display.scroll</code>.</li><li>Change <code>display</code> to <code>Display</code>.</li></ol>",
          tip: "The red dot shows where Python noticed the problem. Sometimes the real mistake is on the line <b>just above</b>.",
          checkLabel: "We made 4 mistakes and fixed them all"
        },
        {
          title: "Send it to the micro:bit",
          html: "<p>The <b>Hardware boss</b> connects the micro:bit, then:</p>",
          tool: { type: "download", editor: "python" },
          warn: "The first time takes a little longer: the editor also copies Python itself onto the micro:bit.",
          checkLabel: "Our name scrolls on the real micro:bit"
        },
        {
          level: "ext", title: "Team badge",
          html: "<p>Scroll every name in your group, each followed by a different picture. Type <code>Image.</code> (with the dot) and wait: the editor shows a list of all the pictures!</p>",
          lang: "python",
          hints: ["Each person needs a <code>display.scroll(...)</code>, a <code>display.show(Image....)</code> and a <code>sleep(...)</code>.", "Try <code>Image.HAPPY</code>, <code>Image.DUCK</code>, <code>Image.GHOST</code> or <code>Image.SKULL</code>."],
          solution: "from microbit import *\n\nwhile True:\n    display.scroll(\"ALI\")\n    display.show(Image.HAPPY)\n    sleep(1000)\n    display.scroll(\"NOUR\")\n    display.show(Image.DUCK)\n    sleep(1000)\n    display.scroll(\"KARIM\")\n    display.show(Image.GHOST)\n    sleep(1000)"
        },
        {
          level: "chal", title: "Speed control",
          html: "<p>Commands can take extra settings. Make your name scroll faster: <code>display.scroll(\"ALI\", delay=60)</code>. The normal delay is 150 ms. Try 40 and 300: which speed is easiest to read?</p>",
          lang: "python",
          hints: ["<code>delay</code> is the time in ms for each step of the scroll. Smaller = faster.", "Put a comma after the text, then <code>delay=60</code>, inside the brackets."],
          solution: "from microbit import *\n\nwhile True:\n    display.scroll(\"ALI\", delay=60)\n    display.show(Image.HEART)\n    sleep(500)"
        }
      ]
    },
    {
      id: "predict", type: "predict", lang: "python", nav: "Predict: indentation", title: "Predict → Run: inside or outside?", minutes: 4,
      intro: "<p>In Python, the spaces at the start of a line are <b>not</b> decoration. Read this program carefully: which lines are indented?</p>",
      code: "from microbit import *\n\ndisplay.scroll(\"HI\")\nwhile True:\n    display.show(Image.HEART)\n    sleep(500)\ndisplay.show(Image.SAD)",
      question: "What does the micro:bit show?",
      options: [
        "HI, then a heart, then a sad face, again and again",
        "HI once, then a heart that stays on. The sad face never appears",
        "HI, then the heart and the sad face take turns forever",
        "Nothing: the program has an error"
      ],
      answer: 1,
      demo: [["scroll", "HI"], ["icon", "Heart", 3200]],
      explain: "<code>display.scroll(\"HI\")</code> is before the loop, so it runs <b>once</b>. The indented lines are <i>inside</i> <code>while True:</code>, so the heart is shown again and again. The last line is <b>not</b> indented: it comes after the loop, and a <code>while True</code> loop never ends, so the sad face <b>never</b> appears. There is no error: Python does exactly what the indentation says."
    },
    {
      id: "errors", type: "quiz", nav: "Error detective", title: "Error detective", minutes: 6,
      intro: "<p>Each program has <b>one</b> bug. Find it! These are the mistakes everyone makes when they start Python: learn to spot them fast.</p>",
      questions: [
        { q: "What is wrong?", code: "from microbit import *\n\ndisplay.scroll(\"HELLO)", lang: "python", options: ["The text needs a closing quote mark", "HELLO must be in small letters", "scroll should be show", "Nothing is wrong"], answer: 0, explain: "The editor says <b>String is not closed — missing quotation mark</b>. Text needs a quote mark at the start <b>and</b> at the end." },
        { q: "What is wrong?", code: "from microbit import *\n\nwhile True\n    display.show(Image.HEART)\n    sleep(500)", lang: "python", options: ["sleep must come first", "Line 3 needs a colon at the end: <code>while True:</code>", "<code>Image.HEART</code> needs quote marks", "The lines should not be indented"], answer: 1, explain: "The editor says <b>Missing colon \":\"</b>. A line that starts a loop always ends with a colon." },
        { q: "What is wrong?", code: "from microbit import *\n\nwhile True:\ndisplay.show(Image.HEART)\nsleep(500)", lang: "python", options: ["<code>while</code> needs a capital W", "The lines inside the loop must be indented", "There should be no colon", "500 is too short"], answer: 1, explain: "The editor says <b>Indent missing</b>. Lines inside a loop are moved 4 spaces to the right (press Tab)." },
        { q: "What is wrong?", code: "from microbit import *\n\nDisplay.scroll(\"HI\")", lang: "python", options: ["<code>Display</code> should be <code>display</code>: capital letters matter", "HI should not be in quote marks", "The first line is not needed", "scroll is not a real command"], answer: 0, explain: "The editor says <b>\"Display\" is not defined</b>. To Python, <code>Display</code> and <code>display</code> are two different words." },
        { q: "Which line is missing?", code: "display.show(Image.HAPPY)\nsleep(1000)\ndisplay.show(Image.SAD)", lang: "python", options: ["<code>while True:</code>", "<code>from microbit import *</code>", "<code>display.scroll(\"HI\")</code>", "No line is missing"], answer: 1, explain: "Without <code>from microbit import *</code>, Python doesn't know the micro:bit's commands, so the editor says that <code>display</code> is not defined." }
      ]
    },
    {
      id: "m2", type: "mission", nav: "Mission 2: heart", title: "Mission 2: Beating heart", minutes: 17,
      intro: "<p>Rebuild the beating heart from B1, now in Python. Then design your <b>own pictures</b> with numbers.</p>",
      steps: [
        {
          title: "From blocks to Python",
          html: "<p>You built this in B1 with blocks. Here is the same program in Python. Find each block's twin, then type the Python version (new project, or replace your badge) and run it.</p>",
          blocks: "basic.forever(function () {\n    basic.showIcon(IconNames.Heart)\n    basic.pause(500)\n    basic.showIcon(IconNames.SmallHeart)\n    basic.pause(500)\n})",
          code: "from microbit import *\n\nwhile True:\n    display.show(Image.HEART)\n    sleep(500)\n    display.show(Image.HEART_SMALL)\n    sleep(500)",
          lang: "python", noCopy: true,
          tip: "<code>Image.HEART_SMALL</code> has an underscore <code>_</code> instead of a space: names in Python can't contain spaces.",
          hints: ["Start with <code>from microbit import *</code>, like every program.", "<code>HEART_SMALL</code> is all capitals, with an underscore."]
        },
        {
          title: "What if there's no sleep?",
          html: "<p>Experiment: delete both <code>sleep(500)</code> lines and run the program. What do you see? Put them back afterwards.</p>",
          tip: "In blocks, <b>show icon</b> waits a little by itself. In Python, <code>display.show</code> doesn't wait at all: without <code>sleep</code>, the two pictures swap so fast that they blur together.",
          checkLabel: "We saw what happens without sleep"
        },
        {
          title: "Your own image",
          html: "<p>Design a picture and copy its Python code. Each row is 5 numbers: <b>0</b> = off, <b>9</b> = full brightness. The rows are separated by colons <code>:</code>. Then use your image in the loop instead of the small heart.</p>",
          tool: { type: "ledDesigner", lang: "python", title: "Image designer", start: ["Butterfly"] },
          lang: "python",
          hints: ["The code looks like <code>Image(\"09090:99999:99999:09990:00900\")</code>: 5 rows of 5 numbers.", "Use it like a built-in picture: <code>display.show(Image(\"...\"))</code>."],
          solution: "from microbit import *\n\nwhile True:\n    display.show(Image.HEART)\n    sleep(500)\n    display.show(Image(\"99099:99999:00900:99999:99099\"))\n    sleep(500)",
          checkLabel: "Our own image works in the simulator"
        },
        {
          title: "Send it and show it off",
          html: "<p>Send your program to the micro:bit, switch to the battery pack and show your heart and your picture to another group. Can they read your Python and explain it?</p>",
          checkLabel: "It runs on the real micro:bit"
        },
        {
          level: "ext", title: "Dim and bright",
          html: "<p>Python lets you choose the brightness of each LED, from <b>0</b> to <b>9</b>. Change some of the 9s in your image to <b>3</b> or <b>5</b>: make a shaded picture, like a heart with a dim outline and a bright middle.</p>",
          lang: "python",
          hints: ["You can give an image a name: <code>glow = Image(\"...\")</code>, then use <code>display.show(glow)</code>.", "Dim LEDs are easier to see in a dark corner of the room."],
          solution: "from microbit import *\n\nglow = Image(\"03030:39993:39993:03930:00300\")\n\nwhile True:\n    display.show(Image.HEART)\n    sleep(500)\n    display.show(glow)\n    sleep(500)"
        },
        {
          level: "chal", title: "Animation with a list",
          html: "<p>Python can play a whole animation in one line. Put your frames in a <b>list</b> (square brackets <code>[ ]</code>, with commas between the frames), then show the list. Design 3 or more frames here:</p>",
          tool: { type: "ledDesigner", lang: "python", frames: true, pause: 0, title: "Animation designer", start: ["..#..|..#..|..#..|..#..|..#..", "....#|...#.|..#..|.#...|#....", ".....|.....|#####|.....|.....", "#....|.#...|..#..|...#.|....#"] },
          lang: "python",
          hints: ["<code>delay=200</code> shows each frame for 200 ms. Smaller = faster.", "A list goes in square brackets, with a comma after every item except the last."],
          solution: "from microbit import *\n\nframes = [\n    Image(\"00900:00900:00900:00900:00900\"),\n    Image(\"00009:00090:00900:09000:90000\"),\n    Image(\"00000:00000:99999:00000:00000\"),\n    Image(\"90000:09000:00900:00090:00009\")\n]\n\nwhile True:\n    display.show(frames, delay=200)"
        },
        {
          level: "chal", title: "Beat 3 times, then stop",
          html: "<p>In blocks you used <b>repeat 3 times</b>. In Python, it is <code>for i in range(3):</code>. Make the heart beat exactly 3 times, then scroll <b>DONE</b>. Watch the indentation: which lines are inside the loop?</p>",
          lang: "python",
          hints: ["<code>for i in range(3):</code> needs a colon too, and the lines inside it are indented.", "<code>display.scroll(\"DONE\")</code> is <b>not</b> indented: it runs once, after the loop."],
          solution: "from microbit import *\n\nfor i in range(3):\n    display.show(Image.HEART)\n    sleep(400)\n    display.show(Image.HEART_SMALL)\n    sleep(400)\ndisplay.scroll(\"DONE\")"
        }
      ]
    },
    {
      id: "exit", type: "quiz", nav: "Exit ticket", title: "Exit ticket", minutes: 5,
      intro: "<p>Discuss first, then click. Only your first answer counts.</p>",
      questions: [
        { q: "Which line scrolls <b>HELLO</b> across the micro:bit?", options: ["<code>Display.Scroll(\"HELLO\")</code>", "<code>display.scroll(\"HELLO\")</code>", "<code>display.scroll(HELLO)</code>", "<code>scroll(\"HELLO\")</code>"], answer: 1, explain: "Small letters, a dot, and quote marks around the text." },
        { q: "What does <code>sleep(500)</code> do?", options: ["Turns the micro:bit off", "Waits half a second", "Waits 500 seconds", "Shows the number 500"], answer: 1, explain: "sleep counts in milliseconds: 500 ms = half a second." },
        { q: "Why are some lines indented under <code>while True:</code>?", options: ["To make the code look nice", "They are inside the loop, so they repeat", "They run only once", "They are comments"], answer: 1, explain: "Indentation shows which lines belong to the loop." },
        { q: "Why does every program start with <code>from microbit import *</code>?", options: ["It turns on the battery", "It gives Python the micro:bit's commands, like display and sleep", "It deletes the old program", "It is a note for humans"], answer: 1, explain: "Without it, Python doesn't know what display or sleep mean." },
        { q: "A red dot appears next to line 4. What should you do first?", options: ["Delete the whole program", "Click the dot, read the message, then check line 4 and the line above it", "Send the program to the micro:bit anyway", "Restart the computer"], answer: 1, explain: "The message tells you what is wrong. The mistake is often on that line or the one just above." }
      ]
    },
    {
      id: "reflect", type: "reflect", nav: "How did it go?", title: "How did it go?", minutes: 3,
      prompts: ["Blocks or Python: which do you prefer so far, and why?", "The mistake we made most today, and how we fixed it:"]
    },
    {
      id: "glossary", type: "glossary", nav: "Key words", title: "Key words",
      terms: [
        { term: "Python", def: "A text programming language: you type the code instead of dragging blocks. Scientists, engineers and game makers use it." },
        { term: "Python Editor", def: "The website python.microbit.org, where you write, test and send Python programs to the micro:bit." },
        { term: "Syntax", def: "The rules for writing a language: quote marks, colons, brackets, capital letters and indentation." },
        { term: "Indentation", def: "Spaces at the start of a line. The indented lines under while True: are inside the loop." },
        { term: "Loop", def: "Code that repeats. while True: repeats forever, like the forever block." },
        { term: "Import", def: "from microbit import * gives your program the micro:bit's commands." },
        { term: "Sleep", def: "sleep(1000) makes the micro:bit wait 1000 milliseconds (1 second), like the pause block." },
        { term: "String", def: "Text in quote marks, like \"HELLO\"." },
        { term: "Image", def: "A picture for the LED display: a built-in one like Image.HEART, or your own like Image(\"09090:...\")." },
        { term: "Comment", def: "A line that starts with #. It is a note for humans: the micro:bit ignores it." },
        { term: "Error message", def: "What the editor says when it finds a mistake, like Missing colon. Click the red dot to read it." },
        { term: "Bug", def: "A mistake in a program." },
        { term: "Case-sensitive", def: "Capital letters matter: display and Display are different words in Python." }
      ]
    },
    {
      id: "next", type: "next", nav: "Next lesson", title: "Next lesson", icon: "git-branch",
      lesson: "B4 · Variables & decisions (Python)",
      teaser: "Buttons, gestures and decisions with if, elif and else: rebuild the emotion badge and the step counter in Python."
    }
  ]
};
