// GPF-Aligned Educational Game Hub
// Targets: UNICEF/USAID Global Proficiency Framework -- Literacy & Numeracy, Grades 1-3
// Built for Imagine Worldwide tablet deployment context
// Five games: Letter Launch, Sound Safari, Word River, Story Sparks, Number Jungle

import { useState, useEffect, useRef, useCallback, useReducer, useMemo } from 'react';

// ============================================================================
// 1. THEME CONSTANTS
// ============================================================================

const CSS_VARIABLES = `
  /* Background colors */
  --bg-primary: #FFF8F0;       /* warm cream */
  --bg-secondary: #F0E6D6;     /* parchment */

  /* Text colors */
  --text-primary: #2D1B14;     /* dark brown */
  --text-secondary: #5C4033;   /* medium brown */

  /* Accent colors */
  --accent-primary: #E8734A;   /* warm coral/orange */
  --accent-secondary: #4A90D9; /* friendly blue */
  --accent-tertiary: #6BC06B;  /* nature green */

  /* Semantic colors */
  --success: #4CAF50;          /* green */
  --warning: #FF9800;          /* orange */
  --error: #E57373;            /* soft red */

  /* Special colors */
  --star-gold: #FFD700;

  /* Interactive element colors */
  --interactive-bg: #FFFFFF;
  --interactive-hover: #FFF0E0;

  /* Shadows */
  --shadow-soft: 0 2px 8px rgba(45, 27, 20, 0.1);
  --shadow-medium: 0 4px 16px rgba(45, 27, 20, 0.15);

  /* Border radii */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-round: 50%;

  /* Typography */
  --font-display: 'Andika', sans-serif;
  --font-body: 'Nunito', sans-serif;
`;

const FONT_LINK_ID = 'gpf-game-hub-google-fonts';

function FONT_LOADER() {
  if (document.getElementById(FONT_LINK_ID)) {
    return;
  }

  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?' +
    'family=Andika:wght@400;700&' +
    'family=Nunito:wght@400;600;700;800&' +
    'display=swap';

  document.head.appendChild(link);
}

const GLOBAL_STYLES = `
  /* ===== Base Reset ===== */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* ===== Body Defaults ===== */
  body {
    background: var(--bg-primary);
    font-family: var(--font-body);
    color: var(--text-primary);
    overflow-x: hidden;
  }

  /* ===== Keyframe Animations ===== */

  @keyframes confetti-burst {
    0% {
      transform: scale(0) rotate(0deg);
      opacity: 1;
    }
    50% {
      transform: scale(1) rotate(720deg);
      opacity: 1;
    }
    100% {
      transform: scale(0) translate(var(--confetti-x, 60px), var(--confetti-y, -80px));
      opacity: 0;
    }
  }

  @keyframes gentle-shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    50% { transform: translateX(6px); }
    75% { transform: translateX(-3px); }
    100% { transform: translateX(0); }
  }

  @keyframes pulse-glow {
    0% {
      box-shadow: 0 0 0 0 rgba(232, 115, 74, 0.3);
    }
    50% {
      box-shadow: 0 0 16px 8px rgba(232, 115, 74, 0.3);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(232, 115, 74, 0.3);
    }
  }

  @keyframes fade-slide-in {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes celebrate-bounce {
    0% { transform: translateY(0); }
    25% { transform: translateY(-20px); }
    50% { transform: translateY(0); }
    75% { transform: translateY(-10px); }
    100% { transform: translateY(0); }
  }

  @keyframes float-up {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    100% {
      transform: translateY(-100px);
      opacity: 0;
    }
  }

  @keyframes rocket-launch {
    0% {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
    100% {
      transform: translateY(-300px) scale(0.5);
      opacity: 0;
    }
  }

  @keyframes happy-bounce {
    0% { transform: translateY(0); }
    25% { transform: translateY(-15px); }
    50% { transform: translateY(0); }
    75% { transform: translateY(-8px); }
    100% { transform: translateY(0); }
  }

  @keyframes wave-motion {
    0% { transform: translateY(0); }
    25% { transform: translateY(-5px); }
    50% { transform: translateY(0); }
    75% { transform: translateY(5px); }
    100% { transform: translateY(0); }
  }

  @keyframes spin-in {
    0% {
      transform: rotate(0deg) scale(0);
    }
    100% {
      transform: rotate(360deg) scale(1);
    }
  }

  /* ===== Reduced Motion ===== */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* ===== Utility Classes ===== */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

// Call FONT_LOADER at module level
FONT_LOADER();

// ============================================================================
// 2. WORDBANK DATA
// ============================================================================

const CVC_WORDS = {
  short_a: [
    { word: 'cat', emoji: '\u{1F431}', phonemes: ['k', '\u00E6', 't'] },
    { word: 'bat', emoji: '\u{1F987}', phonemes: ['b', '\u00E6', 't'] },
    { word: 'hat', emoji: '\u{1F3A9}', phonemes: ['h', '\u00E6', 't'] },
    { word: 'mat', emoji: '\u{1F9F9}', phonemes: ['m', '\u00E6', 't'] },
    { word: 'van', emoji: '\u{1F690}', phonemes: ['v', '\u00E6', 'n'] },
    { word: 'pan', emoji: '\u{1F373}', phonemes: ['p', '\u00E6', 'n'] },
    { word: 'fan', emoji: '\u{1F300}', phonemes: ['f', '\u00E6', 'n'] },
    { word: 'map', emoji: '\u{1F5FA}\uFE0F', phonemes: ['m', '\u00E6', 'p'] },
    { word: 'cap', emoji: '\u{1F9E2}', phonemes: ['k', '\u00E6', 'p'] },
    { word: 'nap', emoji: '\u{1F634}', phonemes: ['n', '\u00E6', 'p'] },
  ],
  short_e: [
    { word: 'bed', emoji: '\u{1F6CF}\uFE0F', phonemes: ['b', '\u025B', 'd'] },
    { word: 'red', emoji: '\u{1F534}', phonemes: ['r', '\u025B', 'd'] },
    { word: 'hen', emoji: '\u{1F414}', phonemes: ['h', '\u025B', 'n'] },
    { word: 'pen', emoji: '\u{1F58A}\uFE0F', phonemes: ['p', '\u025B', 'n'] },
    { word: 'ten', emoji: '\u{1F51F}', phonemes: ['t', '\u025B', 'n'] },
    { word: 'net', emoji: '\u{1F3D0}', phonemes: ['n', '\u025B', 't'] },
    { word: 'pet', emoji: '\u{1F436}', phonemes: ['p', '\u025B', 't'] },
    { word: 'wet', emoji: '\u{1F4A7}', phonemes: ['w', '\u025B', 't'] },
    { word: 'leg', emoji: '\u{1F9B5}', phonemes: ['l', '\u025B', 'g'] },
    { word: 'beg', emoji: '\u{1F64F}', phonemes: ['b', '\u025B', 'g'] },
  ],
  short_i: [
    { word: 'pig', emoji: '\u{1F437}', phonemes: ['p', '\u026A', 'g'] },
    { word: 'big', emoji: '\u{1F4AA}', phonemes: ['b', '\u026A', 'g'] },
    { word: 'dig', emoji: '\u{26CF}\uFE0F', phonemes: ['d', '\u026A', 'g'] },
    { word: 'fin', emoji: '\u{1F420}', phonemes: ['f', '\u026A', 'n'] },
    { word: 'pin', emoji: '\u{1F4CC}', phonemes: ['p', '\u026A', 'n'] },
    { word: 'bin', emoji: '\u{1F5D1}\uFE0F', phonemes: ['b', '\u026A', 'n'] },
    { word: 'sit', emoji: '\u{1FA91}', phonemes: ['s', '\u026A', 't'] },
    { word: 'hit', emoji: '\u{1F94A}', phonemes: ['h', '\u026A', 't'] },
    { word: 'bit', emoji: '\u{1F4A5}', phonemes: ['b', '\u026A', 't'] },
    { word: 'lip', emoji: '\u{1F444}', phonemes: ['l', '\u026A', 'p'] },
  ],
  short_o: [
    { word: 'dog', emoji: '\u{1F436}', phonemes: ['d', '\u0252', 'g'] },
    { word: 'log', emoji: '\u{1FAB5}', phonemes: ['l', '\u0252', 'g'] },
    { word: 'fog', emoji: '\u{1F32B}\uFE0F', phonemes: ['f', '\u0252', 'g'] },
    { word: 'hot', emoji: '\u{1F525}', phonemes: ['h', '\u0252', 't'] },
    { word: 'pot', emoji: '\u{1FAD5}', phonemes: ['p', '\u0252', 't'] },
    { word: 'dot', emoji: '\u{26AB}', phonemes: ['d', '\u0252', 't'] },
    { word: 'mop', emoji: '\u{1F9F9}', phonemes: ['m', '\u0252', 'p'] },
    { word: 'top', emoji: '\u{1F51D}', phonemes: ['t', '\u0252', 'p'] },
    { word: 'hop', emoji: '\u{1F407}', phonemes: ['h', '\u0252', 'p'] },
    { word: 'box', emoji: '\u{1F4E6}', phonemes: ['b', '\u0252', 'ks'] },
  ],
  short_u: [
    { word: 'bug', emoji: '\u{1F41B}', phonemes: ['b', '\u028C', 'g'] },
    { word: 'mug', emoji: '\u{2615}', phonemes: ['m', '\u028C', 'g'] },
    { word: 'hug', emoji: '\u{1FAC2}', phonemes: ['h', '\u028C', 'g'] },
    { word: 'sun', emoji: '\u{2600}\uFE0F', phonemes: ['s', '\u028C', 'n'] },
    { word: 'run', emoji: '\u{1F3C3}', phonemes: ['r', '\u028C', 'n'] },
    { word: 'fun', emoji: '\u{1F389}', phonemes: ['f', '\u028C', 'n'] },
    { word: 'cup', emoji: '\u{2615}', phonemes: ['k', '\u028C', 'p'] },
    { word: 'pup', emoji: '\u{1F436}', phonemes: ['p', '\u028C', 'p'] },
    { word: 'bus', emoji: '\u{1F68C}', phonemes: ['b', '\u028C', 's'] },
    { word: 'tub', emoji: '\u{1F6C1}', phonemes: ['t', '\u028C', 'b'] },
  ],
};

const SIGHT_WORDS = [
  { word: 'the', level: 1 }, { word: 'and', level: 1 }, { word: 'is', level: 1 },
  { word: 'a', level: 1 }, { word: 'to', level: 1 }, { word: 'I', level: 1 },
  { word: 'in', level: 1 }, { word: 'it', level: 1 }, { word: 'of', level: 1 },
  { word: 'my', level: 1 },
  { word: 'he', level: 2 }, { word: 'she', level: 2 }, { word: 'we', level: 2 },
  { word: 'was', level: 2 }, { word: 'for', level: 2 }, { word: 'on', level: 2 },
  { word: 'are', level: 2 }, { word: 'you', level: 2 }, { word: 'they', level: 2 },
  { word: 'his', level: 2 },
  { word: 'said', level: 3 }, { word: 'have', level: 3 }, { word: 'with', level: 3 },
  { word: 'this', level: 3 }, { word: 'from', level: 3 }, { word: 'that', level: 3 },
  { word: 'will', level: 3 }, { word: 'one', level: 3 }, { word: 'her', level: 3 },
  { word: 'all', level: 3 },
  { word: 'were', level: 4 }, { word: 'when', level: 4 }, { word: 'your', level: 4 },
  { word: 'there', level: 4 }, { word: 'their', level: 4 }, { word: 'what', level: 4 },
  { word: 'about', level: 4 }, { word: 'would', level: 4 }, { word: 'been', level: 4 },
  { word: 'could', level: 4 },
];

const PHONEME_MAP = {
  a: '/\u00E6/', b: '/b/', c: '/k/', d: '/d/', e: '/\u025B/', f: '/f/',
  g: '/g/', h: '/h/', i: '/\u026A/', j: '/d\u0292/', k: '/k/', l: '/l/',
  m: '/m/', n: '/n/', o: '/\u0252/', p: '/p/', q: '/kw/', r: '/r/',
  s: '/s/', t: '/t/', u: '/\u028C/', v: '/v/', w: '/w/', x: '/ks/',
  y: '/j/', z: '/z/',
};

const DIGRAPHS = [
  { letters: 'sh', sound: '/\u0283/', examples: ['ship', 'fish', 'shell'] },
  { letters: 'ch', sound: '/t\u0283/', examples: ['chip', 'much', 'chat'] },
  { letters: 'th', sound: '/\u03B8/', examples: ['thin', 'bath', 'three'] },
  { letters: 'wh', sound: '/w/', examples: ['when', 'whale', 'white'] },
  { letters: 'ck', sound: '/k/', examples: ['back', 'duck', 'kick'] },
];

const SENTENCES = {
  level1: [
    'The cat sat on a mat.',
    'The dog can run and hop.',
    'I see a big red bus.',
    'The sun is hot and fun.',
    'A fat hen sat on ten eggs.',
  ],
  level2: [
    'The ship went on the sea.',
    'She had a chat with the fish.',
    'He hit the ball back to his dad.',
    'They ran in the mud and got wet.',
    'We fed the duck on the big pond.',
  ],
  level3: [
    'When the bell rang, all the kids ran from the shed.',
    'She said that her pet frog will hop on the log.',
    'One white whale came up from the deep blue sea.',
    'Have you ever been to a pond with fish and ducks?',
    'They were so happy when the lost pup came back home.',
  ],
};

const MATH_FACTS = {
  addition: [
    { a: 1, b: 1, level: 1 }, { a: 2, b: 1, level: 1 }, { a: 1, b: 2, level: 1 },
    { a: 2, b: 2, level: 1 }, { a: 3, b: 1, level: 1 }, { a: 1, b: 3, level: 1 },
    { a: 3, b: 2, level: 1 }, { a: 2, b: 3, level: 1 }, { a: 4, b: 1, level: 1 },
    { a: 1, b: 4, level: 1 },
    { a: 3, b: 3, level: 2 }, { a: 4, b: 2, level: 2 }, { a: 5, b: 1, level: 2 },
    { a: 2, b: 5, level: 2 }, { a: 4, b: 3, level: 2 }, { a: 5, b: 3, level: 2 },
    { a: 4, b: 4, level: 2 }, { a: 6, b: 2, level: 2 }, { a: 5, b: 5, level: 2 },
    { a: 3, b: 7, level: 2 },
    { a: 6, b: 5, level: 3 }, { a: 7, b: 4, level: 3 }, { a: 8, b: 3, level: 3 },
    { a: 5, b: 6, level: 3 }, { a: 9, b: 2, level: 3 }, { a: 7, b: 5, level: 3 },
    { a: 6, b: 6, level: 3 }, { a: 8, b: 4, level: 3 }, { a: 7, b: 7, level: 3 },
    { a: 5, b: 8, level: 3 },
    { a: 8, b: 7, level: 4 }, { a: 9, b: 6, level: 4 }, { a: 7, b: 8, level: 4 },
    { a: 9, b: 7, level: 4 }, { a: 8, b: 8, level: 4 }, { a: 6, b: 9, level: 4 },
    { a: 10, b: 5, level: 4 }, { a: 9, b: 8, level: 4 }, { a: 10, b: 7, level: 4 },
    { a: 10, b: 8, level: 4 },
    { a: 10, b: 9, level: 5 }, { a: 9, b: 10, level: 5 }, { a: 10, b: 10, level: 5 },
    { a: 11, b: 9, level: 5 }, { a: 12, b: 8, level: 5 }, { a: 11, b: 8, level: 5 },
    { a: 13, b: 7, level: 5 }, { a: 14, b: 6, level: 5 },
  ],
  subtraction: [
    { a: 3, b: 1, level: 1 }, { a: 4, b: 2, level: 1 }, { a: 2, b: 1, level: 1 },
    { a: 5, b: 3, level: 1 }, { a: 5, b: 1, level: 1 }, { a: 4, b: 1, level: 1 },
    { a: 3, b: 2, level: 1 }, { a: 5, b: 2, level: 1 }, { a: 5, b: 4, level: 1 },
    { a: 4, b: 3, level: 1 },
    { a: 6, b: 2, level: 2 }, { a: 7, b: 3, level: 2 }, { a: 8, b: 4, level: 2 },
    { a: 9, b: 5, level: 2 }, { a: 10, b: 6, level: 2 }, { a: 7, b: 1, level: 2 },
    { a: 8, b: 2, level: 2 }, { a: 6, b: 3, level: 2 }, { a: 10, b: 4, level: 2 },
    { a: 9, b: 3, level: 2 },
    { a: 11, b: 5, level: 3 }, { a: 12, b: 6, level: 3 }, { a: 13, b: 4, level: 3 },
    { a: 14, b: 7, level: 3 }, { a: 11, b: 3, level: 3 }, { a: 12, b: 8, level: 3 },
    { a: 13, b: 9, level: 3 }, { a: 14, b: 5, level: 3 }, { a: 11, b: 7, level: 3 },
    { a: 12, b: 3, level: 3 },
    { a: 15, b: 6, level: 4 }, { a: 16, b: 8, level: 4 }, { a: 17, b: 9, level: 4 },
    { a: 18, b: 7, level: 4 }, { a: 15, b: 9, level: 4 }, { a: 16, b: 5, level: 4 },
    { a: 17, b: 8, level: 4 }, { a: 18, b: 6, level: 4 }, { a: 15, b: 7, level: 4 },
    { a: 16, b: 9, level: 4 },
    { a: 19, b: 8, level: 5 }, { a: 20, b: 9, level: 5 }, { a: 19, b: 10, level: 5 },
    { a: 20, b: 7, level: 5 }, { a: 20, b: 11, level: 5 }, { a: 19, b: 6, level: 5 },
    { a: 20, b: 12, level: 5 }, { a: 19, b: 5, level: 5 },
  ],
  counting: [
    { count: 1, emoji: '\u{1F34E}', level: 1 }, { count: 2, emoji: '\u{2B50}', level: 1 },
    { count: 3, emoji: '\u{1F412}', level: 1 }, { count: 4, emoji: '\u{1F431}', level: 1 },
    { count: 5, emoji: '\u{1F981}', level: 1 }, { count: 2, emoji: '\u{1F436}', level: 1 },
    { count: 3, emoji: '\u{1F41F}', level: 1 }, { count: 4, emoji: '\u{1F338}', level: 1 },
    { count: 6, emoji: '\u{1F985}', level: 2 }, { count: 7, emoji: '\u{1F34C}', level: 2 },
    { count: 8, emoji: '\u{1F353}', level: 2 }, { count: 9, emoji: '\u{1F41D}', level: 2 },
    { count: 6, emoji: '\u{1F308}', level: 2 }, { count: 7, emoji: '\u{1F30D}', level: 2 },
    { count: 8, emoji: '\u{1F680}', level: 2 }, { count: 9, emoji: '\u{1F40E}', level: 2 },
    { count: 10, emoji: '\u{1F98B}', level: 3 }, { count: 11, emoji: '\u{1F41A}', level: 3 },
    { count: 12, emoji: '\u{1F33B}', level: 3 }, { count: 13, emoji: '\u{1F347}', level: 3 },
    { count: 10, emoji: '\u{1F40C}', level: 3 }, { count: 11, emoji: '\u{1F419}', level: 3 },
    { count: 12, emoji: '\u{1F33D}', level: 3 }, { count: 13, emoji: '\u{1F99C}', level: 3 },
    { count: 14, emoji: '\u{1F41E}', level: 4 }, { count: 15, emoji: '\u{1F33A}', level: 4 },
    { count: 16, emoji: '\u{1F98E}', level: 4 }, { count: 17, emoji: '\u{1F99E}', level: 4 },
    { count: 14, emoji: '\u{1F40B}', level: 4 }, { count: 15, emoji: '\u{1F422}', level: 4 },
    { count: 16, emoji: '\u{1F427}', level: 4 }, { count: 17, emoji: '\u{1F433}', level: 4 },
    { count: 18, emoji: '\u{1F989}', level: 5 }, { count: 19, emoji: '\u{1F99A}', level: 5 },
    { count: 20, emoji: '\u{1F40A}', level: 5 }, { count: 18, emoji: '\u{1F341}', level: 5 },
    { count: 19, emoji: '\u{1F337}', level: 5 }, { count: 20, emoji: '\u{1F340}', level: 5 },
    { count: 18, emoji: '\u{1F98D}', level: 5 }, { count: 20, emoji: '\u{1F40D}', level: 5 },
  ],
};

const STORIES = [
  {
    title: 'The Red Hen',
    paragraphs: [
      'A red hen sat on a nest. The nest had ten eggs in it. The hen sat and sat. She did not get up. She was a very good hen.',
      'One hot day, the eggs began to crack. One, two, three \u2014 ten little chicks came out! They were wet and small, but the hen was so happy.',
      'The hen led her chicks to the pond. They ran and hopped in the mud. The red hen clucked and watched them all day long.',
    ],
    questions: [
      { q: 'What color was the hen?', options: ['Red', 'Blue', 'Green'], correct: 0 },
      { q: 'How many eggs did the hen have?', options: ['Five', 'Ten', 'Three'], correct: 1 },
      {
        q: 'Why do you think the hen did not get up from the nest?',
        options: [
          'She was keeping the eggs warm so they could hatch.',
          'She was too tired to move.',
          'She was hiding from the dog.',
        ],
        correct: 0,
      },
    ],
  },
  {
    title: 'A Day at the Pond',
    paragraphs: [
      'Tom and his dog, Max, went to the pond. The sun was big and hot. Tom had a hat and a bag with a snack in it.',
      'Max ran to the pond and jumped in with a big splash! Tom sat on a log and watched. A duck and six little ducklings swam past them.',
      'When the sun went down, Tom and Max set off for home. Tom was glad they had such a fun day at the pond.',
    ],
    questions: [
      { q: 'What is the name of Tom\'s dog?', options: ['Rex', 'Max', 'Bud'], correct: 1 },
      {
        q: 'What does the word "splash" tell you about how Max jumped in?',
        options: [
          'He jumped in quietly.',
          'He jumped in and made a big sound with the water.',
          'He did not jump in at all.',
        ],
        correct: 1,
      },
      { q: 'How do you think Tom felt at the end of the day?', options: ['Sad', 'Happy', 'Mad'], correct: 1 },
    ],
  },
  {
    title: 'The Lost Puppy',
    paragraphs: [
      'A little tan pup got lost in the fog. He could not see the path back home. He sat on the wet grass and let out a sad whimper.',
      'A kind girl named Jess was on her way to the shop when she spotted the pup. She picked him up, and he licked her chin. Jess checked the tag on his neck. It said "Chip."',
      'Jess took Chip to the address on the tag. A boy ran out and hugged his pup. "Thank you!" he said with a big grin. Jess felt warm and happy that she could help.',
    ],
    questions: [
      {
        q: 'Why was the puppy lost?',
        options: ['He ran away from home.', 'He could not see in the fog.', 'A boy took him.'],
        correct: 1,
      },
      { q: 'What was the puppy\'s name?', options: ['Max', 'Bud', 'Chip'], correct: 2 },
      {
        q: 'What does the word "whimper" most likely mean?',
        options: ['A loud bark.', 'A soft, sad cry.', 'A happy jump.'],
        correct: 1,
      },
    ],
  },
];

// ============================================================================
// 3. SHARED UTILITY: shuffle (used by multiple games)
// ============================================================================

/** Fisher-Yates shuffle. Returns a new array. */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============================================================================
// 4. CUSTOM HOOKS
// ============================================================================

function useSpeechRecognition({ onResult, language = 'en-US' }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const SpeechRecognitionAPI =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const isSupported = Boolean(SpeechRecognitionAPI);

  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResultRef.current(transcript);
    };

    recognition.onend = () => { setIsListening(false); };
    recognition.onerror = () => { setIsListening(false); };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      try { recognition.abort(); } catch { /* ignore */ }
    };
  }, [SpeechRecognitionAPI, language]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.start(); setIsListening(true); } catch { /* already started */ }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch { /* not active */ }
    setIsListening(false);
  }, []);

  return { isListening, startListening, stopListening, isSupported };
}

function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text, opts = {}) => {
      return new Promise((resolve) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
          resolve();
          return;
        }
        window.speechSynthesis.cancel();

        const { rate = 0.85, pitch = 1.1, lang = 'en-US' } = opts;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.lang = lang;

        utterance.onend = () => { setIsSpeaking(false); resolve(); };
        utterance.onerror = () => { setIsSpeaking(false); resolve(); };

        utteranceRef.current = utterance;
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      });
    },
    []
  );

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { speak, stop, isSpeaking };
}

function useAdaptiveDifficulty({ onLevelChange, initialLevel = 1 }) {
  const [difficulty, setDifficulty] = useState(Math.min(5, Math.max(1, initialLevel)));
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);

  const onLevelChangeRef = useRef(onLevelChange);
  useEffect(() => { onLevelChangeRef.current = onLevelChange; }, [onLevelChange]);

  const recordAnswer = useCallback((isCorrect) => {
    if (isCorrect) {
      setConsecutiveWrong(0);
      setConsecutiveCorrect((prev) => {
        const next = prev + 1;
        if (next >= 3) {
          setDifficulty((d) => {
            const newLevel = Math.min(5, d + 1);
            if (newLevel !== d && onLevelChangeRef.current) onLevelChangeRef.current(newLevel);
            return newLevel;
          });
          return 0;
        }
        return next;
      });
    } else {
      setConsecutiveCorrect(0);
      setConsecutiveWrong((prev) => {
        const next = prev + 1;
        if (next >= 2) {
          setDifficulty((d) => {
            const newLevel = Math.max(1, d - 1);
            if (newLevel !== d && onLevelChangeRef.current) onLevelChangeRef.current(newLevel);
            return newLevel;
          });
          return 0;
        }
        return next;
      });
    }
  }, []);

  const resetStreak = useCallback(() => {
    setConsecutiveCorrect(0);
    setConsecutiveWrong(0);
  }, []);

  return { difficulty, recordAnswer, resetStreak };
}

function calculateStars(wrong) {
  if (wrong <= 2) return 3;
  if (wrong <= 4) return 2;
  return 1;
}

function createInitialState(_activityId) {
  return {
    phase: 'intro',
    score: { correct: 0, total: 0, wrong: 0 },
    stars: 0,
    currentItem: 0,
    totalItems: 10,
  };
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'START_DEMO':
      return { ...state, phase: 'demonstrate' };
    case 'START_GUIDED':
      return { ...state, phase: 'guided' };
    case 'START_INDEPENDENT':
      return { ...state, phase: 'independent' };
    case 'RECORD_ANSWER': {
      const correct = state.score.correct + (action.correct ? 1 : 0);
      const wrong = state.score.wrong + (action.correct ? 0 : 1);
      const total = state.score.total + 1;
      return { ...state, score: { correct, wrong, total } };
    }
    case 'NEXT_ITEM':
      return { ...state, currentItem: state.currentItem + 1 };
    case 'COMPLETE':
      return { ...state, phase: 'celebrate', stars: calculateStars(state.score.wrong) };
    case 'SET_TOTAL_ITEMS':
      return { ...state, totalItems: action.totalItems };
    case 'RESET':
      return createInitialState(null);
    default:
      return state;
  }
}

function useGameState(activityId) {
  const [state, dispatch] = useReducer(gameReducer, activityId, createInitialState);
  const isComplete = state.phase === 'celebrate';
  const getStarRating = useCallback(() => calculateStars(state.score.wrong), [state.score.wrong]);
  return { state, dispatch, isComplete, getStarRating };
}

// ============================================================================
// 4b. SOUND EFFECTS (Web Audio API — no external files)
// ============================================================================

const SFX = (() => {
  let ctx = null;
  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };

  const playTone = (freq, type, duration, gainVal = 0.2, onNode) => {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(gainVal, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain).connect(c.destination);
    if (onNode) onNode(osc, gain, c);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration + 0.05);
  };

  return {
    tap() {
      playTone(800, 'sine', 0.03, 0.18);
    },

    correct() {
      const c = getCtx();
      [523, 659, 784].forEach((freq, i) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, c.currentTime);
        gain.gain.setValueAtTime(0.2, c.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.1 + 0.15);
        osc.connect(gain).connect(c.destination);
        osc.start(c.currentTime + i * 0.1);
        osc.stop(c.currentTime + i * 0.1 + 0.2);
      });
    },

    wrong() {
      playTone(200, 'sawtooth', 0.2, 0.15);
    },

    celebrate() {
      const c = getCtx();
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, c.currentTime);
        const start = c.currentTime + i * 0.1;
        const dur = i === 3 ? 0.4 : 0.12;
        gain.gain.setValueAtTime(0.22, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.connect(gain).connect(c.destination);
        osc.start(start);
        osc.stop(start + dur + 0.05);
      });
    },

    whoosh() {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2000, c.currentTime + 0.5);
      gain.gain.setValueAtTime(0.15, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
      osc.connect(gain).connect(c.destination);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + 0.55);
      // white noise layer
      const buf = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
      const noise = c.createBufferSource();
      noise.buffer = buf;
      const ng = c.createGain();
      ng.gain.setValueAtTime(0.08, c.currentTime);
      ng.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
      noise.connect(ng).connect(c.destination);
      noise.start(c.currentTime);
      noise.stop(c.currentTime + 0.55);
    },

    splash() {
      const c = getCtx();
      const buf = c.createBuffer(1, c.sampleRate * 0.3, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const noise = c.createBufferSource();
      noise.buffer = buf;
      const filter = c.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, c.currentTime);
      filter.Q.setValueAtTime(1.5, c.currentTime);
      const gain = c.createGain();
      gain.gain.setValueAtTime(0.25, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
      noise.connect(filter).connect(gain).connect(c.destination);
      noise.start(c.currentTime);
      noise.stop(c.currentTime + 0.35);
    },

    pop() {
      playTone(600, 'sine', 0.08, 0.2, (osc) => {
        const c = getCtx();
        osc.frequency.exponentialRampToValueAtTime(200, c.currentTime + 0.08);
      });
    },

    drum() {
      playTone(80, 'sine', 0.15, 0.25, (_osc, gain) => {
        const c = getCtx();
        gain.gain.setValueAtTime(0.25, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
      });
    },
  };
})();

// ============================================================================
// 5. SHARED UI COMPONENTS
// ============================================================================

function StarRating({ stars = 0 }) {
  const clampedStars = Math.max(0, Math.min(3, Math.round(stars)));
  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }} role="img" aria-label={`${clampedStars} out of 3 stars`}>
      {[0, 1, 2].map((index) => {
        const earned = index < clampedStars;
        return (
          <span key={index} style={{
            fontSize: 'clamp(32px, 6vw, 48px)', color: earned ? 'var(--star-gold)' : '#D1D5DB',
            display: 'inline-block', animation: earned ? `celebrate-bounce 0.6s ease ${index * 0.15}s both` : 'none',
            lineHeight: 1, userSelect: 'none',
          }} aria-hidden="true">{earned ? '\u2605' : '\u2606'}</span>
        );
      })}
    </div>
  );
}

const CONFETTI_COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6FC8', '#A66CFF', '#FF9F45', '#00D2FF'];

function randomRange(min, max) { return Math.random() * (max - min) + min; }

function createConfettiPiece(id) {
  return {
    id, color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    left: randomRange(10, 90), size: randomRange(6, 12), rotation: randomRange(0, 360),
    translateX: randomRange(-120, 120), translateY: randomRange(-200, -60),
    endRotation: randomRange(-360, 360), delay: randomRange(0, 0.3),
  };
}

function ConfettiBlast({ trigger }) {
  const [pieces, setPieces] = useState([]);
  const prevTriggerRef = useRef(false);
  const idCounterRef = useRef(0);

  useEffect(() => {
    if (trigger && !prevTriggerRef.current) {
      const batch = Array.from({ length: 30 }, () => {
        idCounterRef.current += 1;
        return createConfettiPiece(idCounterRef.current);
      });
      setPieces((prev) => [...prev, ...batch]);
    }
    prevTriggerRef.current = trigger;
  }, [trigger]);

  const handleAnimationEnd = useCallback((id) => {
    setPieces((prev) => prev.filter((p) => p.id !== id));
  }, []);

  if (pieces.length === 0) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 9999 }} aria-hidden="true">
      {pieces.map((piece) => {
        const animName = `confetti-${piece.id}`;
        const keyframes = `
          @keyframes ${animName} {
            0% { transform: translate(0, 0) rotate(${piece.rotation}deg) scale(1); opacity: 1; }
            100% { transform: translate(${piece.translateX}px, ${piece.translateY}px) rotate(${piece.endRotation}deg) scale(0.5); opacity: 0; }
          }
        `;
        return (
          <div key={piece.id}>
            <style>{keyframes}</style>
            <div onAnimationEnd={() => handleAnimationEnd(piece.id)} style={{
              position: 'absolute', left: `${piece.left}%`, top: '50%',
              width: `${piece.size}px`, height: `${piece.size}px`,
              backgroundColor: piece.color, borderRadius: piece.size < 9 ? '50%' : '2px',
              animation: `${animName} 1.5s ease-out ${piece.delay}s forwards`,
            }} />
          </div>
        );
      })}
    </div>
  );
}

function MascotGuide({ message = '', speaking = false }) {
  const showBubble = message.length > 0;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '8px', maxWidth: '360px' }} role="status" aria-live="polite" aria-label={message ? `Owl guide says: ${message}` : 'Owl guide'}>
      <div style={{ flexShrink: 0, animation: speaking ? 'celebrate-bounce 0.8s ease-in-out infinite' : 'none' }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <ellipse cx="40" cy="52" rx="26" ry="24" fill="#8B6914" />
          <ellipse cx="40" cy="56" rx="16" ry="15" fill="#F5DEB3" />
          <circle cx="40" cy="30" r="20" fill="#A0782C" />
          <polygon points="24,16 20,4 30,14" fill="#8B6914" />
          <polygon points="56,16 60,4 50,14" fill="#8B6914" />
          <circle cx="32" cy="28" r="9" fill="white" />
          <circle cx="48" cy="28" r="9" fill="white" />
          <circle cx="33" cy="28" r="5" fill="#2D1B00" />
          <circle cx="47" cy="28" r="5" fill="#2D1B00" />
          <circle cx="35" cy="26" r="2" fill="white" />
          <circle cx="49" cy="26" r="2" fill="white" />
          <polygon points="37,34 43,34 40,40" fill="#FF9800" />
          <ellipse cx="32" cy="75" rx="8" ry="4" fill="#FF9800" />
          <ellipse cx="48" cy="75" rx="8" ry="4" fill="#FF9800" />
          <ellipse cx="16" cy="50" rx="8" ry="14" fill="#A0782C" transform="rotate(-10 16 50)" />
          <ellipse cx="64" cy="50" rx="8" ry="14" fill="#A0782C" transform="rotate(10 64 50)" />
        </svg>
      </div>
      {showBubble && (
        <div style={{
          position: 'relative', backgroundColor: '#FFFFFF', borderRadius: '16px',
          padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          fontSize: 'clamp(16px, 3vw, 20px)', fontFamily: 'var(--font-body, "Nunito", sans-serif)',
          color: 'var(--text-primary, #1F2937)', lineHeight: 1.4, maxWidth: '240px', wordWrap: 'break-word',
        }}>
          <div style={{
            position: 'absolute', left: '-10px', bottom: '14px', width: 0, height: 0,
            borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: '10px solid #FFFFFF',
          }} aria-hidden="true" />
          {message}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ current, total }) {
  const safeCurrent = Math.max(0, Math.min(current, total));
  const safeTotal = Math.max(1, total);
  const percentage = (safeCurrent / safeTotal) * 100;
  const displayPercentage = safeCurrent > 0 ? Math.max(4, percentage) : 0;

  return (
    <div style={{ width: '100%' }} role="progressbar" aria-valuenow={safeCurrent} aria-valuemin={0} aria-valuemax={safeTotal} aria-label={`Progress: ${safeCurrent} of ${safeTotal}`}>
      <div style={{ textAlign: 'center', fontSize: 'clamp(14px, 2.5vw, 18px)', fontFamily: 'var(--font-body, "Nunito", sans-serif)', fontWeight: 700, color: 'var(--text-primary, #1F2937)', marginBottom: '4px' }}>
        {safeCurrent} / {safeTotal}
      </div>
      <div style={{ width: '100%', height: '16px', backgroundColor: 'var(--bg-secondary, #E5E7EB)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ width: `${displayPercentage}%`, height: '100%', backgroundColor: 'var(--accent-tertiary, #34D399)', borderRadius: '8px', transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

const SIZE_CONFIG = {
  lg: { padding: '16px 32px', fontSize: '24px' },
  md: { padding: '12px 24px', fontSize: '20px' },
};

function BigButton({ onClick, label, icon, size = 'lg', variant = 'primary', disabled = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const sizeStyle = SIZE_CONFIG[size] || SIZE_CONFIG.lg;
  const isPrimary = variant === 'primary';

  const baseStyle = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: sizeStyle.padding, fontSize: sizeStyle.fontSize,
    fontFamily: 'var(--font-body, "Nunito", sans-serif)', fontWeight: 700, lineHeight: 1.2,
    minHeight: '48px', minWidth: '48px',
    border: isPrimary ? 'none' : '2px solid var(--text-primary, #1F2937)',
    borderRadius: 'var(--radius-md, 12px)',
    boxShadow: 'var(--shadow-soft, 0 2px 8px rgba(0,0,0,0.10))',
    backgroundColor: isPrimary ? 'var(--accent-primary, #4F46E5)' : 'var(--interactive-bg, #F3F4F6)',
    color: isPrimary ? '#FFFFFF' : 'var(--text-primary, #1F2937)',
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    transition: 'transform 0.12s ease, box-shadow 0.15s ease, background-color 0.15s ease',
    transform: isActive && !disabled ? 'scale(0.95)' : isHovered && !disabled ? 'scale(1.03)' : 'scale(1)',
    userSelect: 'none', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
  };

  return (
    <button type="button" onClick={disabled ? undefined : (...args) => { SFX.tap(); onClick(...args); }} disabled={disabled}
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
      onMouseDown={() => setIsActive(true)} onMouseUp={() => setIsActive(false)}
      onTouchStart={() => setIsActive(true)} onTouchEnd={() => setIsActive(false)}
      style={baseStyle} aria-disabled={disabled}>
      {icon && <span style={{ fontSize: sizeStyle.fontSize, lineHeight: 1 }} aria-hidden="true">{icon}</span>}
      {label}
    </button>
  );
}

function MicIndicator({ isListening = false }) {
  return (
    <div style={{
      width: '60px', height: '60px', borderRadius: '50%',
      border: `3px solid ${isListening ? '#EF4444' : '#9CA3AF'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '28px', lineHeight: 1,
      backgroundColor: isListening ? 'rgba(239, 68, 68, 0.08)' : 'rgba(0,0,0,0.02)',
      animation: isListening ? 'pulse-glow 1.5s ease-in-out infinite' : 'none',
      transition: 'border-color 0.3s ease, background-color 0.3s ease',
      cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent',
    }} role="status" aria-label={isListening ? 'Microphone is listening' : 'Microphone is off'}>
      <span aria-hidden="true">{'\uD83C\uDFA4'}</span>
    </div>
  );
}

function GameShell({ title, onBack, children }) {
  const [backHovered, setBackHovered] = useState(false);
  const [backActive, setBackActive] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary, #FFFBF0)' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#FFFEF9', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', flexShrink: 0, zIndex: 10 }}>
        <button type="button" onClick={onBack}
          onMouseEnter={() => setBackHovered(true)} onMouseLeave={() => { setBackHovered(false); setBackActive(false); }}
          onMouseDown={() => setBackActive(true)} onMouseUp={() => setBackActive(false)}
          onTouchStart={() => setBackActive(true)} onTouchEnd={() => setBackActive(false)}
          style={{
            width: '48px', height: '48px', minWidth: '48px', minHeight: '48px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', borderRadius: 'var(--radius-md, 12px)',
            backgroundColor: backHovered ? 'rgba(0,0,0,0.06)' : 'transparent',
            cursor: 'pointer', fontSize: '24px', lineHeight: 1,
            color: 'var(--text-primary, #1F2937)',
            transition: 'background-color 0.15s ease, transform 0.12s ease',
            transform: backActive ? 'scale(0.92)' : 'scale(1)',
            userSelect: 'none', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation', padding: 0,
          }} aria-label="Go back">{'\u2190'}</button>
        <h1 style={{
          margin: 0, fontSize: 'clamp(20px, 4vw, 28px)',
          fontFamily: 'var(--font-display, "Andika", sans-serif)', fontWeight: 700,
          color: 'var(--text-primary, #1F2937)', lineHeight: 1.2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{title}</h1>
      </header>
      <main style={{ flex: 1, padding: '16px', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {children}
      </main>
    </div>
  );
}

// ============================================================================
// 6. GAME: LetterLaunch
// ============================================================================

const LL_SPOKEN_SOUNDS = {
  b: 'buh', c: 'kuh', d: 'duh', f: 'fff', g: 'guh', h: 'huh',
  j: 'juh', k: 'kuh', l: 'lll', m: 'mmm', n: 'nnn', p: 'puh',
  r: 'rrr', s: 'sss', t: 'tuh', v: 'vvv', w: 'wuh', x: 'ks',
  y: 'yuh', z: 'zzz', sh: 'shh', ch: 'chuh', th: 'thh', wh: 'wuh',
};

function llGetStartingSound(word) {
  const lower = word.toLowerCase();
  const digraphs = ['sh', 'ch', 'th', 'wh'];
  for (const dg of digraphs) {
    if (lower.startsWith(dg)) return dg;
  }
  return lower[0];
}

function llGetWordPoolForLevel(level) {
  const groups = ['short_a', 'short_e', 'short_i', 'short_o', 'short_u'];
  const activeLevels = groups.slice(0, Math.min(level, 5));
  const pool = [];
  for (const key of activeLevels) { pool.push(...CVC_WORDS[key]); }
  return pool;
}

function llGetOptionCount(level) {
  if (level <= 2) return 2;
  if (level <= 4) return 3;
  return 4;
}

const LL_ALL_STARTING_LETTERS = ['b', 'c', 'd', 'f', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w'];

function llGenerateOptions(word, count) {
  const correct = llGetStartingSound(word);
  const distractors = LL_ALL_STARTING_LETTERS.filter((l) => l !== correct);
  const shuffledDistractors = shuffle(distractors).slice(0, count - 1);
  return shuffle([correct, ...shuffledDistractors]);
}

function llSelectGameItems(difficulty) {
  const pool = llGetWordPoolForLevel(difficulty);
  return shuffle(pool).slice(0, 10);
}

const LL_GAME_STYLES = `
  @keyframes letter-rocket-launch {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    30% { transform: translateY(-40px) scale(1.15); opacity: 1; }
    100% { transform: translateY(-320px) scale(0.4); opacity: 0; }
  }
  @keyframes rocket-trail-particle {
    0% { transform: translateY(0) scale(1); opacity: 0.9; }
    100% { transform: translateY(60px) scale(0.2); opacity: 0; }
  }
  @keyframes letter-wobble {
    0% { transform: translateX(0) rotate(0deg); }
    20% { transform: translateX(-8px) rotate(-3deg); }
    40% { transform: translateX(8px) rotate(3deg); }
    60% { transform: translateX(-5px) rotate(-2deg); }
    80% { transform: translateX(5px) rotate(2deg); }
    100% { transform: translateX(0) rotate(0deg); }
  }
  @keyframes emoji-bounce-in {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.15); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes fade-in-up {
    0% { opacity: 0; transform: translateY(24px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes trail-glow {
    0% { opacity: 0; }
    20% { opacity: 1; }
    100% { opacity: 0; transform: translateY(80px) scaleX(0.3); }
  }
`;

function RocketTrail() {
  const particles = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i, left: 50 + (Math.random() - 0.5) * 30, delay: Math.random() * 0.3,
      size: 6 + Math.random() * 8,
      color: ['#FF9800', '#FF5722', '#FFC107', '#FF6F00', '#FFAB40', '#FFD54F'][i],
    }));
  }, []);

  return (
    <div style={{ position: 'absolute', bottom: '-10px', left: '0', right: '0', height: '80px', pointerEvents: 'none' }} aria-hidden="true">
      {particles.map((p) => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.left}%`, top: '0', width: `${p.size}px`, height: `${p.size}px`,
          borderRadius: '50%', backgroundColor: p.color,
          animation: `rocket-trail-particle 0.8s ease-out ${p.delay}s forwards`, opacity: 0,
        }} />
      ))}
      <div style={{
        position: 'absolute', left: '50%', top: '0', transform: 'translateX(-50%)',
        width: '16px', height: '50px', background: 'linear-gradient(to bottom, #FF9800, #FF5722, transparent)',
        borderRadius: '0 0 8px 8px', animation: 'trail-glow 1s ease-out forwards', opacity: 0,
      }} />
    </div>
  );
}

function LetterButton({ letter, onClick, disabled, state: btnState }) {
  const [hovered, setHovered] = useState(false);
  const isLaunching = btnState === 'launched';
  const isWrong = btnState === 'wrong';
  const isCorrect = btnState === 'correct';

  const bgColor = isCorrect ? 'var(--success, #4CAF50)' : isWrong ? 'var(--error, #E57373)' : hovered ? 'var(--interactive-hover, #FFF0E0)' : 'var(--interactive-bg, #FFFFFF)';
  const textColor = isCorrect || isWrong ? '#FFFFFF' : 'var(--text-primary, #2D1B14)';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" onClick={disabled ? undefined : () => onClick(letter)} disabled={disabled}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{
          width: 'clamp(64px, 14vw, 100px)', height: 'clamp(64px, 14vw, 100px)',
          borderRadius: 'var(--radius-md, 16px)',
          border: `3px solid ${isCorrect ? 'var(--success)' : isWrong ? 'var(--error)' : 'var(--bg-secondary, #F0E6D6)'}`,
          backgroundColor: bgColor, color: textColor,
          fontSize: 'clamp(32px, 8vw, 56px)', fontFamily: 'var(--font-display, "Andika", sans-serif)', fontWeight: 700,
          cursor: disabled ? 'default' : 'pointer', boxShadow: 'var(--shadow-medium, 0 4px 16px rgba(45, 27, 20, 0.15))',
          transition: 'background-color 0.15s ease, transform 0.12s ease, border-color 0.15s ease',
          transform: hovered && !disabled ? 'scale(1.05)' : 'scale(1)',
          animation: isLaunching ? 'letter-rocket-launch 1s ease-in forwards' : isWrong ? 'letter-wobble 0.5s ease' : 'none',
          userSelect: 'none', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1, textTransform: 'lowercase',
        }} aria-label={`Letter ${letter.toUpperCase()}`}>{letter.toUpperCase()}</button>
      {isLaunching && <RocketTrail />}
    </div>
  );
}

function LetterLaunch({ onComplete, onBack }) {
  const { state: gameState, dispatch } = useGameState('letter-launch');
  const { speak, isSpeaking } = useTextToSpeech();
  const { difficulty, recordAnswer } = useAdaptiveDifficulty({ initialLevel: 1 });

  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [buttonStates, setButtonStates] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [mascotMessage, setMascotMessage] = useState('');
  const [mascotSpeaking, setMascotSpeaking] = useState(false);
  const [inputLocked, setInputLocked] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  const guidedCount = 2;
  const independentCount = 8;
  const totalPlayItems = guidedCount + independentCount;

  const initRef = useRef(false);
  useEffect(() => {
    if (!initRef.current) {
      const selected = llSelectGameItems(difficulty);
      setItems(selected);
      dispatch({ type: 'SET_TOTAL_ITEMS', totalItems: totalPlayItems });
      initRef.current = true;
    }
  }, [difficulty, dispatch, totalPlayItems]);

  useEffect(() => {
    if (items.length === 0) return;
    const phase = gameState.phase;
    if (phase === 'guided' || phase === 'independent') {
      const item = items[currentIndex];
      if (!item) return;
      const count = llGetOptionCount(difficulty);
      const opts = llGenerateOptions(item.word, count);
      setOptions(opts);
      setButtonStates({});
    }
  }, [currentIndex, items, difficulty, gameState.phase]);

  const hasSpokenRef = useRef(-1);
  useEffect(() => {
    if (items.length === 0) return;
    const phase = gameState.phase;
    if ((phase === 'guided' || phase === 'independent') && currentIndex !== hasSpokenRef.current) {
      hasSpokenRef.current = currentIndex;
      const item = items[currentIndex];
      if (!item) return;
      const timer = setTimeout(() => { speak(`What sound does ${item.word} start with?`); }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, items, gameState.phase, speak]);

  const handleSpeechResult = useCallback(
    (transcript) => {
      if (inputLocked || items.length === 0) return;
      const item = items[currentIndex];
      if (!item) return;
      const correctSound = llGetStartingSound(item.word);
      const heard = transcript.toLowerCase().trim();
      const matchPatterns = [correctSound, LL_SPOKEN_SOUNDS[correctSound], item.word[0]];
      if (correctSound === 'c') matchPatterns.push('k', 'kuh');
      if (correctSound === 'k') matchPatterns.push('c', 'kuh');
      const isCorrect = matchPatterns.some((pattern) => heard.includes(pattern));
      if (isCorrect) { handleCorrectAnswer(correctSound); } else { handleWrongAnswer(correctSound, item.word); }
    },
    [inputLocked, items, currentIndex, handleCorrectAnswer, handleWrongAnswer]
  );

  const { isListening, startListening, stopListening, isSupported } = useSpeechRecognition({ onResult: handleSpeechResult });

  const handleCorrectAnswer = useCallback(
    (correctLetter) => {
      SFX.correct(); SFX.whoosh();
      setInputLocked(true); stopListening();
      setButtonStates((prev) => ({ ...prev, [correctLetter]: 'launched' }));
      setShowConfetti(true);
      dispatch({ type: 'RECORD_ANSWER', correct: true }); recordAnswer(true);
      const isGuided = gameState.phase === 'guided';
      speak(isGuided ? `Great job! ${correctLetter} is correct!` : 'Awesome!', { rate: 1.0 });
      setTimeout(() => { setShowConfetti(false); advanceToNext(); }, 1800);
    },
    [stopListening, dispatch, recordAnswer, gameState.phase, speak, advanceToNext]
  );

  const handleWrongAnswer = useCallback(
    (correctLetter, word) => {
      SFX.wrong();
      setInputLocked(true); stopListening();
      dispatch({ type: 'RECORD_ANSWER', correct: false }); recordAnswer(false);
      const spokenSound = LL_SPOKEN_SOUNDS[correctLetter] || correctLetter;
      setMascotMessage(`Try again! Listen... ${spokenSound}... ${word}`);
      setMascotSpeaking(true);
      speak(`Try again! Listen... ${spokenSound}... ${word}`, { rate: 0.8 }).then(() => {
        setMascotSpeaking(false); setMascotMessage(''); setInputLocked(false); setButtonStates({});
      });
    },
    [stopListening, dispatch, recordAnswer, speak]
  );

  const handleLetterTap = useCallback(
    (letter) => {
      if (inputLocked || items.length === 0) return;
      const item = items[currentIndex]; if (!item) return;
      const correctSound = llGetStartingSound(item.word);
      if (letter === correctSound) { handleCorrectAnswer(correctSound); }
      else { setButtonStates((prev) => ({ ...prev, [letter]: 'wrong' })); handleWrongAnswer(correctSound, item.word); }
    },
    [inputLocked, items, currentIndex, handleCorrectAnswer, handleWrongAnswer]
  );

  const advanceToNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (gameState.phase === 'guided') {
      if (nextIndex >= guidedCount) { dispatch({ type: 'START_INDEPENDENT' }); setCurrentIndex(guidedCount); setInputLocked(false); return; }
    } else if (gameState.phase === 'independent') {
      if (nextIndex >= totalPlayItems) { dispatch({ type: 'COMPLETE' }); setInputLocked(false); return; }
    }
    dispatch({ type: 'NEXT_ITEM' }); setCurrentIndex(nextIndex); setInputLocked(false);
  }, [currentIndex, gameState.phase, guidedCount, totalPlayItems, dispatch]);

  const handleMicTap = useCallback(() => {
    if (inputLocked) return;
    if (isListening) { stopListening(); } else { startListening(); }
  }, [inputLocked, isListening, startListening, stopListening]);

  const handleStartGame = useCallback(() => { dispatch({ type: 'START_DEMO' }); }, [dispatch]);

  const demoItemRef = useRef(null);
  useEffect(() => {
    if (gameState.phase === 'demonstrate' && items.length > 0 && demoStep === 0) {
      demoItemRef.current = items[0]; setDemoStep(1);
    }
  }, [gameState.phase, items, demoStep]);

  useEffect(() => {
    if (gameState.phase !== 'demonstrate' || !demoItemRef.current) return;
    const demoItem = demoItemRef.current;
    const correctLetter = llGetStartingSound(demoItem.word);
    const spokenSound = LL_SPOKEN_SOUNDS[correctLetter] || correctLetter;

    if (demoStep === 1) {
      const timer = setTimeout(() => {
        speak(`Look! Here is the word ${demoItem.word}. What sound does it start with?`, { rate: 0.85 }).then(() => setDemoStep(2));
      }, 800);
      return () => clearTimeout(timer);
    }
    if (demoStep === 2) {
      const timer = setTimeout(() => {
        speak(`It starts with ${spokenSound}! The letter ${correctLetter}! Watch it launch!`, { rate: 0.85 }).then(() => setDemoStep(3));
      }, 500);
      return () => clearTimeout(timer);
    }
    if (demoStep === 3) {
      setShowConfetti(true);
      const timer = setTimeout(() => { setShowConfetti(false); setDemoStep(4); }, 2000);
      return () => clearTimeout(timer);
    }
    if (demoStep === 4) {
      const timer = setTimeout(() => { dispatch({ type: 'START_GUIDED' }); setCurrentIndex(0); setDemoStep(0); }, 500);
      return () => clearTimeout(timer);
    }
  }, [demoStep, gameState.phase, speak, dispatch]);

  const [celebrateConfetti, setCelebrateConfetti] = useState(false);
  useEffect(() => {
    if (gameState.phase === 'celebrate') {
      SFX.celebrate();
      setCelebrateConfetti(true);
      speak('Amazing work! You are a letter launching star!', { rate: 0.9 });
      const timer = setTimeout(() => setCelebrateConfetti(false), 100);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, speak]);

  const handleComplete = useCallback(() => {
    if (onComplete) { onComplete({ stars: gameState.stars, correct: gameState.score.correct, total: totalPlayItems }); }
  }, [onComplete, gameState.stars, gameState.score.correct, totalPlayItems]);

  const currentItem = items[currentIndex] || null;
  const demoItem = demoItemRef.current;
  const progressCurrent = gameState.phase === 'guided' ? currentIndex : gameState.phase === 'independent' ? currentIndex : 0;

  return (
    <GameShell title="Letter Launch" onBack={onBack}>
      <style>{LL_GAME_STYLES}</style>
      <ConfettiBlast trigger={showConfetti || celebrateConfetti} />

      {gameState.phase === 'intro' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '24px', animation: 'fade-slide-in 0.6s ease both', textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: 'clamp(64px, 15vw, 120px)', lineHeight: 1 }} aria-hidden="true">{'\uD83D\uDE80'}</div>
          <h2 style={{ fontFamily: 'var(--font-display, "Andika", sans-serif)', fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Letter Launch!</h2>
          <MascotGuide message="Hi there! I'll show you a word, and you tell me what sound it starts with. You can tap the letter or use the microphone. Ready?" speaking={true} />
          <div style={{ marginTop: '16px' }}><BigButton onClick={handleStartGame} label="Let's Go!" icon={'\uD83D\uDE80'} size="lg" variant="primary" /></div>
        </div>
      )}

      {gameState.phase === 'demonstrate' && demoItem && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '24px', animation: 'fade-slide-in 0.5s ease both', textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: 'clamp(14px, 2.5vw, 18px)', fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--accent-secondary, #4A90D9)', textTransform: 'uppercase', letterSpacing: '2px' }}>Watch and learn!</div>
          <div style={{ fontSize: 'clamp(80px, 20vw, 140px)', lineHeight: 1, animation: 'emoji-bounce-in 0.6s ease both' }} aria-hidden="true">{demoItem.emoji}</div>
          <div style={{ fontFamily: 'var(--font-display, "Andika", sans-serif)', fontSize: 'clamp(36px, 8vw, 60px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '2px' }}>{demoItem.word}</div>
          {demoStep >= 3 && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{
                width: 'clamp(64px, 14vw, 100px)', height: 'clamp(64px, 14vw, 100px)', borderRadius: 'var(--radius-md, 16px)',
                backgroundColor: 'var(--success, #4CAF50)', color: '#FFFFFF', fontSize: 'clamp(32px, 8vw, 56px)',
                fontFamily: 'var(--font-display, "Andika", sans-serif)', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-medium)',
                animation: demoStep === 3 ? 'letter-rocket-launch 1s ease-in forwards' : 'none', textTransform: 'uppercase',
              }}>{llGetStartingSound(demoItem.word).toUpperCase()}</div>
              {demoStep === 3 && <RocketTrail />}
            </div>
          )}
          <MascotGuide message={demoStep === 1 ? `Let's try "${demoItem.word}"!` : demoStep === 2 ? `It starts with "${llGetStartingSound(demoItem.word)}"!` : 'Blast off!'} speaking={isSpeaking} />
        </div>
      )}

      {(gameState.phase === 'guided' || gameState.phase === 'independent') && currentItem && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(16px, 3vw, 28px)', padding: '8px 16px 24px', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ width: '100%', maxWidth: '400px' }}><ProgressBar current={progressCurrent} total={totalPlayItems} /></div>
          {gameState.phase === 'guided' && (
            <div style={{ fontSize: 'clamp(12px, 2vw, 16px)', fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--accent-secondary, #4A90D9)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Guided Practice</div>
          )}
          <div key={`emoji-${currentIndex}`} style={{ fontSize: 'clamp(80px, 20vw, 140px)', lineHeight: 1, animation: 'emoji-bounce-in 0.5s ease both' }} aria-hidden="true">{currentItem.emoji}</div>
          <div key={`word-${currentIndex}`} style={{ fontFamily: 'var(--font-display, "Andika", sans-serif)', fontSize: 'clamp(36px, 8vw, 60px)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '3px', animation: 'fade-in-up 0.4s ease 0.2s both' }}>{currentItem.word}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(16px, 3vw, 22px)', color: 'var(--text-secondary, #5C4033)', fontWeight: 600, textAlign: 'center' }}>What sound does <strong>{currentItem.word}</strong> start with?</div>
          <div key={`options-${currentIndex}`} style={{ display: 'flex', gap: 'clamp(12px, 3vw, 24px)', justifyContent: 'center', flexWrap: 'wrap', animation: 'fade-in-up 0.4s ease 0.3s both' }}>
            {options.map((letter) => (
              <LetterButton key={`${currentIndex}-${letter}`} letter={letter} onClick={handleLetterTap} disabled={inputLocked} state={buttonStates[letter] || 'idle'} />
            ))}
          </div>
          {isSupported && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <div style={{ fontSize: 'clamp(13px, 2.2vw, 16px)', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>or say the sound:</div>
              <div onClick={handleMicTap} style={{ cursor: inputLocked ? 'default' : 'pointer' }}><MicIndicator isListening={isListening} /></div>
            </div>
          )}
          {mascotMessage && (<div style={{ animation: 'fade-in-up 0.3s ease both' }}><MascotGuide message={mascotMessage} speaking={mascotSpeaking} /></div>)}
          {gameState.phase === 'guided' && !mascotMessage && !inputLocked && (
            <div style={{ animation: 'fade-in-up 0.4s ease 0.5s both' }}><MascotGuide message={`Listen carefully and pick the letter that makes the first sound in "${currentItem.word}".`} speaking={false} /></div>
          )}
        </div>
      )}

      {gameState.phase === 'celebrate' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '24px', animation: 'fade-slide-in 0.6s ease both', textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: 'clamp(64px, 15vw, 120px)', lineHeight: 1, animation: 'celebrate-bounce 0.8s ease both' }} aria-hidden="true">{'\uD83C\uDF1F'}</div>
          <h2 style={{ fontFamily: 'var(--font-display, "Andika", sans-serif)', fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Amazing Work!</h2>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(16px, 3vw, 22px)', color: 'var(--text-secondary)', fontWeight: 600 }}>You got {gameState.score.correct} out of {totalPlayItems} correct!</div>
          <StarRating stars={gameState.stars} />
          <MascotGuide message={gameState.stars === 3 ? 'Perfect! You are a letter launching superstar!' : gameState.stars === 2 ? 'Great job! Keep practicing and you will get even better!' : 'Good try! Every time you practice, you get stronger!'} speaking={isSpeaking} />
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '16px' }}>
            <BigButton onClick={handleComplete} label="Back to Hub" icon={'\uD83C\uDFE0'} size="lg" variant="primary" />
          </div>
        </div>
      )}
    </GameShell>
  );
}

// ============================================================================
// 7. GAME: SoundSafari
// ============================================================================

const SAFARI_ITEMS = [
  { emoji: '\uD83D\uDC0D', label: 'snake', first: 's', last: 'e' },
  { emoji: '\uD83D\uDC31', label: 'cat', first: 'c', last: 't' },
  { emoji: '\uD83D\uDC15', label: 'dog', first: 'd', last: 'g' },
  { emoji: '\uD83C\uDF3B', label: 'sunflower', first: 's', last: 'r' },
  { emoji: '\uD83E\uDD81', label: 'lion', first: 'l', last: 'n' },
  { emoji: '\uD83D\uDC18', label: 'elephant', first: 'e', last: 't' },
  { emoji: '\uD83E\uDD92', label: 'giraffe', first: 'g', last: 'e' },
  { emoji: '\uD83D\uDC12', label: 'monkey', first: 'm', last: 'y' },
  { emoji: '\uD83E\uDD9B', label: 'hippo', first: 'h', last: 'o' },
  { emoji: '\uD83D\uDC2F', label: 'tiger', first: 't', last: 'r' },
  { emoji: '\uD83E\uDD8D', label: 'gorilla', first: 'g', last: 'a' },
  { emoji: '\uD83D\uDC3A', label: 'wolf', first: 'w', last: 'f' },
  { emoji: '\uD83E\uDD85', label: 'eagle', first: 'e', last: 'e' },
  { emoji: '\uD83D\uDC3B', label: 'bear', first: 'b', last: 'r' },
  { emoji: '\uD83E\uDD8A', label: 'fox', first: 'f', last: 'x' },
  { emoji: '\uD83D\uDC22', label: 'turtle', first: 't', last: 'e' },
  { emoji: '\uD83D\uDC0A', label: 'crocodile', first: 'c', last: 'e' },
  { emoji: '\uD83E\uDD9C', label: 'parrot', first: 'p', last: 't' },
  { emoji: '\uD83E\uDD93', label: 'zebra', first: 'z', last: 'a' },
  { emoji: '\uD83D\uDC3F\uFE0F', label: 'chipmunk', first: 'c', last: 'k' },
  { emoji: '\uD83D\uDC30', label: 'rabbit', first: 'r', last: 't' },
  { emoji: '\uD83D\uDC38', label: 'frog', first: 'f', last: 'g' },
  { emoji: '\uD83E\uDD86', label: 'duck', first: 'd', last: 'k' },
  { emoji: '\uD83D\uDC1D', label: 'bee', first: 'b', last: 'e' },
  { emoji: '\uD83E\uDD8B', label: 'butterfly', first: 'b', last: 'y' },
  { emoji: '\uD83D\uDC0C', label: 'snail', first: 's', last: 'l' },
  { emoji: '\uD83E\uDD89', label: 'owl', first: 'o', last: 'l' },
  { emoji: '\uD83D\uDC1F', label: 'fish', first: 'f', last: 'h' },
  { emoji: '\u2B50', label: 'star', first: 's', last: 'r' },
  { emoji: '\uD83C\uDF1E', label: 'sun', first: 's', last: 'n' },
  { emoji: '\uD83C\uDF34', label: 'palm tree', first: 'p', last: 'e' },
  { emoji: '\uD83C\uDF3A', label: 'hibiscus', first: 'h', last: 's' },
  { emoji: '\uD83E\uDD95', label: 'dinosaur', first: 'd', last: 'r' },
  { emoji: '\uD83D\uDC1C', label: 'ant', first: 'a', last: 't' },
  { emoji: '\uD83E\uDDA2', label: 'swan', first: 's', last: 'n' },
  { emoji: '\uD83D\uDC27', label: 'penguin', first: 'p', last: 'n' },
  { emoji: '\uD83D\uDC0E', label: 'horse', first: 'h', last: 'e' },
  { emoji: '\uD83E\uDD8E', label: 'lizard', first: 'l', last: 'd' },
  { emoji: '\uD83D\uDC3E', label: 'paw', first: 'p', last: 'w' },
  { emoji: '\uD83C\uDF44', label: 'mushroom', first: 'm', last: 'm' },
  { emoji: '\uD83C\uDF3F', label: 'herb', first: 'h', last: 'b' },
  { emoji: '\uD83E\uDDA9', label: 'flamingo', first: 'f', last: 'o' },
  { emoji: '\uD83D\uDC33', label: 'whale', first: 'w', last: 'e' },
  { emoji: '\uD83E\uDD9E', label: 'lobster', first: 'l', last: 'r' },
  { emoji: '\uD83D\uDC19', label: 'octopus', first: 'o', last: 's' },
  { emoji: '\uD83E\uDD80', label: 'crab', first: 'c', last: 'b' },
  { emoji: '\uD83D\uDC1A', label: 'shell', first: 's', last: 'l' },
  { emoji: '\uD83C\uDF32', label: 'evergreen', first: 'e', last: 'n' },
  { emoji: '\uD83C\uDF35', label: 'cactus', first: 'c', last: 's' },
  { emoji: '\uD83E\uDD94', label: 'hedgehog', first: 'h', last: 'g' },
];

function safariPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function safariGenerateRound(difficulty, usedLetters) {
  const testEnding = difficulty >= 4;
  const key = testEnding ? 'last' : 'first';
  const numCards = difficulty >= 3 ? 4 : 3;
  const numCorrect = difficulty >= 5 ? 2 : 1;

  const letterCounts = {};
  SAFARI_ITEMS.forEach((item) => { const letter = item[key]; letterCounts[letter] = (letterCounts[letter] || 0) + 1; });

  const candidateLetters = Object.keys(letterCounts).filter((l) => letterCounts[l] >= numCorrect);
  const fresh = candidateLetters.filter((l) => !usedLetters.has(l));
  const pool = fresh.length > 0 ? fresh : candidateLetters;
  const targetLetter = safariPick(pool);

  const matchingItems = shuffle(SAFARI_ITEMS.filter((item) => item[key] === targetLetter));
  const correctItems = matchingItems.slice(0, numCorrect);
  const distractorPool = shuffle(SAFARI_ITEMS.filter((item) => item[key] !== targetLetter));
  const distractors = distractorPool.slice(0, numCards - numCorrect);

  const cards = shuffle([...correctItems, ...distractors]).map((item, idx) => ({
    ...item, id: idx, isCorrect: item[key] === targetLetter,
  }));

  const phoneme = PHONEME_MAP[targetLetter] || `/${targetLetter}/`;
  const position = testEnding ? 'ends' : 'starts';
  const prompt = `Find something that ${position} with ${phoneme.replace(/\//g, '')}!`;

  return { cards, targetLetter, phoneme, prompt, testEnding, numCorrect };
}

const SAFARI_GUIDED_ROUNDS = 2;
const SAFARI_INDEPENDENT_ROUNDS = 10;
const SAFARI_TOTAL_ROUNDS = SAFARI_GUIDED_ROUNDS + SAFARI_INDEPENDENT_ROUNDS;

const JEEP_KEYFRAMES = `
@keyframes safari-jeep-drive {
  0%   { transform: translateX(-120px); }
  100% { transform: translateX(calc(100vw + 120px)); }
}
`;

const SAFARI_CARD_IDLE = 'idle';
const SAFARI_CARD_CORRECT = 'correct';
const SAFARI_CARD_WRONG = 'wrong';
const SAFARI_CARD_REVEALED = 'revealed';

function SoundSafari({ onComplete, onBack }) {
  const { state, dispatch, isComplete } = useGameState('sound-safari');
  const { speak, isSpeaking } = useTextToSpeech();
  const { difficulty, recordAnswer } = useAdaptiveDifficulty({ initialLevel: 1 });

  const [round, setRound] = useState(null);
  const [cardStatuses, setCardStatuses] = useState({});
  const [selectedCorrect, setSelectedCorrect] = useState(0);
  const [mascotMsg, setMascotMsg] = useState('');
  const [mascotSpeaking, setMascotSpeaking] = useState(false);
  const [showJeep, setShowJeep] = useState(false);
  const [roundLocked, setRoundLocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [guidedRound, setGuidedRound] = useState(0);
  const [independentRound, setIndependentRound] = useState(0);
  const usedLettersRef = useRef(new Set());
  const roundTimeoutRef = useRef(null);

  const totalRoundIndex = state.phase === 'guided' ? guidedRound : state.phase === 'independent' ? SAFARI_GUIDED_ROUNDS + independentRound : state.phase === 'celebrate' ? SAFARI_TOTAL_ROUNDS : 0;

  useEffect(() => { return () => { if (roundTimeoutRef.current) clearTimeout(roundTimeoutRef.current); }; }, []);
  useEffect(() => { dispatch({ type: 'SET_TOTAL_ITEMS', totalItems: SAFARI_TOTAL_ROUNDS }); }, [dispatch]);

  const startNewRound = useCallback((diff) => {
    const r = safariGenerateRound(diff, usedLettersRef.current);
    usedLettersRef.current.add(r.targetLetter);
    if (usedLettersRef.current.size > 10) usedLettersRef.current = new Set();
    setRound(r); setCardStatuses({}); setSelectedCorrect(0); setRoundLocked(false); setMascotMsg(''); setMascotSpeaking(false);
    setTimeout(() => { speak(r.prompt, { rate: 0.8, pitch: 1.15 }); }, 400);
  }, [speak]);

  const transitionToNextRound = useCallback((nextDifficulty) => {
    setShowJeep(true);
    roundTimeoutRef.current = setTimeout(() => { setShowJeep(false); startNewRound(nextDifficulty); }, 2200);
  }, [startNewRound]);

  const handleStartGame = useCallback(() => { dispatch({ type: 'START_DEMO' }); }, [dispatch]);

  useEffect(() => {
    if (state.phase === 'demonstrate' && !round) {
      setTimeout(() => {
        const demoRound = safariGenerateRound(1, usedLettersRef.current);
        usedLettersRef.current.add(demoRound.targetLetter);
        setRound(demoRound); setCardStatuses({}); setSelectedCorrect(0); setRoundLocked(false);
        const msg = `Listen for the sound! I'll show you how to play.`;
        setMascotMsg(msg); setMascotSpeaking(true);
        speak(msg, { rate: 0.8, pitch: 1.15 }).then(() => { setMascotSpeaking(false); speak(demoRound.prompt, { rate: 0.8, pitch: 1.15 }); });
      }, 300);
    }
  }, [state.phase, round, speak]);

  const handleDemoTap = useCallback(() => {
    if (state.phase !== 'demonstrate' || !round || roundLocked) return;
    setRoundLocked(true);
    const correctCards = round.cards.filter((c) => c.isCorrect);
    const newStatuses = {};
    round.cards.forEach((c) => { newStatuses[c.id] = c.isCorrect ? SAFARI_CARD_CORRECT : SAFARI_CARD_IDLE; });
    setCardStatuses(newStatuses);
    const firstName = correctCards[0]?.label || '';
    const msg = `${firstName} starts with the right sound! Now you try!`;
    setMascotMsg(msg); setMascotSpeaking(true);
    speak(msg, { rate: 0.85, pitch: 1.1 }).then(() => {
      setMascotSpeaking(false);
      setTimeout(() => { dispatch({ type: 'START_GUIDED' }); setRound(null); setGuidedRound(0); }, 600);
    });
  }, [state.phase, round, roundLocked, speak, dispatch]);

  useEffect(() => {
    if (state.phase === 'guided' && !round && !showJeep) {
      if (guidedRound < SAFARI_GUIDED_ROUNDS) {
        startNewRound(difficulty);
        const msg = guidedRound === 0 ? "Your turn! Tap the card that matches the sound!" : "Great job! One more practice round!";
        setMascotMsg(msg); setMascotSpeaking(true);
        speak(msg, { rate: 0.85, pitch: 1.1 }).then(() => { setMascotSpeaking(false); });
      } else {
        dispatch({ type: 'START_INDEPENDENT' }); setRound(null); setIndependentRound(0);
      }
    }
  }, [state.phase, round, guidedRound, difficulty, startNewRound, speak, dispatch, showJeep]);

  useEffect(() => {
    if (state.phase === 'independent' && !round && !showJeep) {
      if (independentRound < SAFARI_INDEPENDENT_ROUNDS) { startNewRound(difficulty); }
      else { dispatch({ type: 'COMPLETE' }); }
    }
  }, [state.phase, round, independentRound, difficulty, startNewRound, dispatch, showJeep]);

  // Celebrate screen handles onComplete via the "Back to Hub" button
  useEffect(() => { if (state.phase === 'celebrate') SFX.celebrate(); }, [state.phase]);

  const handleCardTap = useCallback((card) => {
    if (roundLocked) return;
    if (cardStatuses[card.id] === SAFARI_CARD_CORRECT || cardStatuses[card.id] === SAFARI_CARD_WRONG) return;
    if (state.phase === 'demonstrate') return;

    if (card.isCorrect) {
      SFX.correct();
      setCardStatuses((prev) => ({ ...prev, [card.id]: SAFARI_CARD_CORRECT }));
      const newCorrectCount = selectedCorrect + 1;
      setSelectedCorrect(newCorrectCount);
      const cheers = [`Yes! ${card.label}!`, `Great job! ${card.label}!`, `${card.label}, awesome!`, `You found ${card.label}!`];
      speak(safariPick(cheers), { rate: 0.9, pitch: 1.2 });

      if (newCorrectCount >= round.numCorrect) {
        setRoundLocked(true);
        setCardStatuses((prev) => {
          const updated = { ...prev };
          round.cards.forEach((c) => { if (c.isCorrect && updated[c.id] !== SAFARI_CARD_CORRECT) updated[c.id] = SAFARI_CARD_REVEALED; });
          return updated;
        });
        dispatch({ type: 'RECORD_ANSWER', correct: true }); recordAnswer(true); dispatch({ type: 'NEXT_ITEM' });
        roundTimeoutRef.current = setTimeout(() => {
          if (state.phase === 'guided') { setGuidedRound((prev) => prev + 1); setRound(null); transitionToNextRound(difficulty); }
          else if (state.phase === 'independent') { setIndependentRound((prev) => prev + 1); setRound(null); transitionToNextRound(difficulty); }
        }, 1500);
      }
    } else {
      SFX.wrong();
      setCardStatuses((prev) => ({ ...prev, [card.id]: SAFARI_CARD_WRONG }));
      dispatch({ type: 'RECORD_ANSWER', correct: false }); recordAnswer(false);
      const positionWord = round.testEnding ? 'ends' : 'starts';
      const hints = [`Not quite! Try another card that ${positionWord} with ${round.phoneme}.`, `Hmm, that's not it. Listen again: ${round.phoneme}!`, `Almost! Look for the one that ${positionWord} with ${round.phoneme}.`];
      const hint = safariPick(hints);
      setMascotMsg(hint); setMascotSpeaking(true);
      speak(hint, { rate: 0.85, pitch: 1.1 }).then(() => { setMascotSpeaking(false); });
      setTimeout(() => { setCardStatuses((prev) => { const updated = { ...prev }; if (updated[card.id] === SAFARI_CARD_WRONG) updated[card.id] = SAFARI_CARD_IDLE; return updated; }); }, 600);
    }
  }, [roundLocked, cardStatuses, selectedCorrect, round, state.phase, difficulty, speak, dispatch, recordAnswer, transitionToNextRound]);

  const handleRepeatSound = useCallback(() => {
    if (round && !isSpeaking) speak(round.prompt, { rate: 0.8, pitch: 1.15 });
  }, [round, isSpeaking, speak]);

  const safariColors = { jungleGreen: '#2D6A4F', leafGreen: '#52B788', warmSand: '#F4E8C1', earthBrown: '#8B5E3C', sunOrange: '#E8734A', skyBlue: '#87CEEB', darkBrown: '#3D2B1F' };

  const containerStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '600px', margin: '0 auto', position: 'relative', paddingBottom: '80px' };
  const cardGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', width: '100%', justifyItems: 'center', padding: '8px' };

  const getCardStyle = (status) => {
    let borderColor = safariColors.earthBrown;
    let bgColor = '#FFFFF5';
    let animName = 'none';
    if (status === SAFARI_CARD_CORRECT || status === SAFARI_CARD_REVEALED) { borderColor = '#4CAF50'; bgColor = '#E8F5E9'; animName = 'happy-bounce 0.6s ease'; }
    else if (status === SAFARI_CARD_WRONG) { borderColor = '#E57373'; bgColor = '#FFF0F0'; animName = 'gentle-shake 0.4s ease'; }
    return {
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
      width: '100%', minWidth: '100px', minHeight: '130px', padding: '16px 8px',
      border: `4px solid ${borderColor}`, borderRadius: '16px', backgroundColor: bgColor,
      backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(244,232,193,0.3) 50%, rgba(255,255,255,0.4) 100%)',
      boxShadow: '0 4px 12px rgba(61,43,31,0.12), inset 0 1px 2px rgba(255,255,255,0.6)',
      cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
      transition: 'border-color 0.3s ease, background-color 0.3s ease, transform 0.15s ease',
      animation: animName, fontFamily: 'var(--font-body, "Nunito", sans-serif)',
    };
  };

  const cardEmojiStyle = { fontSize: 'clamp(40px, 10vw, 60px)', lineHeight: 1 };
  const cardLabelStyle = { fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 700, color: safariColors.darkBrown, textTransform: 'capitalize', textAlign: 'center' };
  const promptBannerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%', padding: '12px 20px', backgroundColor: safariColors.warmSand, borderRadius: '16px', border: `3px solid ${safariColors.earthBrown}`, boxShadow: '0 3px 8px rgba(61,43,31,0.1)' };
  const promptTextStyle = { fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 800, fontFamily: 'var(--font-display, "Andika", sans-serif)', color: safariColors.darkBrown, textAlign: 'center' };
  const phonemeBadgeStyle = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: safariColors.sunOrange, color: '#FFFFFF', fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display, "Andika", sans-serif)', flexShrink: 0 };
  const repeatBtnStyle = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 16px', border: `2px solid ${safariColors.earthBrown}`, borderRadius: '12px', backgroundColor: '#FFFFFF', color: safariColors.darkBrown, fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-body, "Nunito", sans-serif)', cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' };
  const safariHatEmoji = '\uD83E\uDDE2';

  return (
    <GameShell title={`${safariHatEmoji} Sound Safari`} onBack={onBack}>
      <style>{JEEP_KEYFRAMES}</style>

      {state.phase === 'intro' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', textAlign: 'center', minHeight: '60vh', padding: '24px' }}>
          <div style={{ fontSize: 'clamp(48px, 12vw, 80px)', lineHeight: 1, userSelect: 'none' }} aria-hidden="true">{'\uD83E\uDD81\uD83C\uDF34\uD83D\uDC18'}</div>
          <div style={{ fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: 800, fontFamily: 'var(--font-display, "Andika", sans-serif)', color: safariColors.jungleGreen, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Sound Safari!</div>
          <div style={{ fontSize: 'clamp(16px, 3.5vw, 20px)', fontFamily: 'var(--font-body, "Nunito", sans-serif)', color: safariColors.darkBrown, maxWidth: '400px', lineHeight: 1.5 }}>Listen for a sound, then tap the card that matches. Ready for an adventure?</div>
          <MascotGuide message="Put on your safari hat! I'll help you find animal sounds in the wild!" speaking={true} />
          <BigButton onClick={handleStartGame} label="Let's Explore!" icon={'\uD83D\uDE99'} size="lg" variant="primary" />
        </div>
      )}

      {state.phase === 'demonstrate' && round && (
        <div style={containerStyle}>
          <MascotGuide message={mascotMsg} speaking={mascotSpeaking} />
          <div style={promptBannerStyle}><div style={phonemeBadgeStyle}>{round.phoneme}</div><div style={promptTextStyle}>{round.prompt}</div></div>
          <div style={cardGridStyle}>
            {round.cards.map((card) => (
              <div key={card.id} style={getCardStyle(cardStatuses[card.id] || SAFARI_CARD_IDLE)} onClick={handleDemoTap} role="button" tabIndex={0} aria-label={`${card.label}${card.isCorrect ? ' (correct answer)' : ''}`} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleDemoTap(); }}>
                <span style={cardEmojiStyle} aria-hidden="true">{card.emoji}</span>
                <span style={cardLabelStyle}>{card.label}</span>
              </div>
            ))}
          </div>
          <BigButton onClick={handleDemoTap} label="Show Me!" icon={'\uD83D\uDC40'} size="md" variant="primary" />
        </div>
      )}

      {(state.phase === 'guided' || state.phase === 'independent') && (
        <div style={containerStyle}>
          <div style={{ width: '100%', maxWidth: '400px' }}><ProgressBar current={totalRoundIndex} total={SAFARI_TOTAL_ROUNDS} /></div>
          <div style={{ fontSize: '14px', fontFamily: 'var(--font-body, "Nunito", sans-serif)', color: safariColors.earthBrown, fontWeight: 600 }}>Level {difficulty} {state.phase === 'guided' ? '(Practice)' : ''}</div>
          {mascotMsg && <MascotGuide message={mascotMsg} speaking={mascotSpeaking} />}
          {round && (
            <>
              <div style={promptBannerStyle}><div style={phonemeBadgeStyle}>{round.phoneme}</div><div style={promptTextStyle}>{round.prompt}</div></div>
              <button style={repeatBtnStyle} onClick={handleRepeatSound} disabled={isSpeaking} aria-label="Hear the sound again" type="button">{'\uD83D\uDD0A'} Hear Again</button>
              <div style={cardGridStyle}>
                {round.cards.map((card) => {
                  const status = cardStatuses[card.id] || SAFARI_CARD_IDLE;
                  return (
                    <div key={card.id} style={getCardStyle(status)} onClick={() => handleCardTap(card)} role="button" tabIndex={0} aria-label={`${card.label}`} aria-pressed={status === SAFARI_CARD_CORRECT || status === SAFARI_CARD_REVEALED ? 'true' : 'false'} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardTap(card); } }}>
                      <span style={cardEmojiStyle} aria-hidden="true">{card.emoji}</span>
                      <span style={cardLabelStyle}>{card.label}</span>
                      {(status === SAFARI_CARD_CORRECT || status === SAFARI_CARD_REVEALED) && (<span style={{ fontSize: '20px', color: '#4CAF50', lineHeight: 1 }} aria-hidden="true">{'\u2705'}</span>)}
                    </div>
                  );
                })}
              </div>
              {round.numCorrect > 1 && (<div style={{ fontSize: 'clamp(14px, 2.5vw, 16px)', fontFamily: 'var(--font-body, "Nunito", sans-serif)', color: safariColors.earthBrown, fontWeight: 600, textAlign: 'center', fontStyle: 'italic' }}>Find {round.numCorrect} matching cards!</div>)}
            </>
          )}
        </div>
      )}

      {state.phase === 'celebrate' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', textAlign: 'center', minHeight: '60vh', padding: '24px', animation: 'fade-slide-in 0.6s ease both' }}>
          <ConfettiBlast trigger={true} />
          <div style={{ fontSize: 'clamp(48px, 12vw, 80px)', lineHeight: 1, userSelect: 'none' }} aria-hidden="true">{'\uD83C\uDF1F\uD83E\uDD81\uD83C\uDF1F'}</div>
          <div style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, fontFamily: 'var(--font-display, "Andika", sans-serif)', color: safariColors.jungleGreen }}>Safari Complete!</div>
          <StarRating stars={state.stars} />
          <div style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontFamily: 'var(--font-body, "Nunito", sans-serif)', color: safariColors.darkBrown, lineHeight: 1.6 }}>You found <strong>{state.score.correct} out of {state.score.total}</strong> sounds!<br />What an amazing explorer you are!</div>
          <MascotGuide message={state.stars === 3 ? 'Incredible safari! You have eagle ears!' : state.stars === 2 ? 'Great safari adventure! Keep exploring!' : 'Good effort, explorer! Try again to find more sounds!'} speaking={true} />
          <BigButton onClick={() => { if (onComplete) onComplete({ stars: state.stars, correct: state.score.correct, total: state.score.total }); else if (onBack) onBack(); }} label="Back to Hub" icon={'\uD83C\uDFE0'} size="lg" variant="primary" />
        </div>
      )}

      {showJeep && (<div style={{ position: 'fixed', bottom: '20px', left: 0, width: '100%', height: '60px', pointerEvents: 'none', zIndex: 100, overflow: 'hidden' }} aria-hidden="true"><div style={{ fontSize: '50px', lineHeight: 1, animation: 'safari-jeep-drive 2s ease-in-out forwards', position: 'absolute', bottom: 0 }}>{'\uD83D\uDE99'}</div></div>)}
    </GameShell>
  );
}

// ============================================================================
// 8. GAME: WordRiver
// ============================================================================

const WR_GUIDED_COUNT = 2;
const WR_INDEPENDENT_COUNT = 8;
const WR_TOTAL_WORDS = WR_GUIDED_COUNT + WR_INDEPENDENT_COUNT;
const WR_ALL_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

const WR_ADVANCED_WORDS = [
  { word: 'frog', emoji: '\u{1F438}', letters: ['f', 'r', 'o', 'g'] },
  { word: 'drum', emoji: '\u{1FA98}', letters: ['d', 'r', 'u', 'm'] },
  { word: 'crab', emoji: '\u{1F980}', letters: ['c', 'r', 'a', 'b'] },
  { word: 'flag', emoji: '\u{1F6A9}', letters: ['f', 'l', 'a', 'g'] },
  { word: 'clap', emoji: '\u{1F44F}', letters: ['c', 'l', 'a', 'p'] },
  { word: 'grin', emoji: '\u{1F600}', letters: ['g', 'r', 'i', 'n'] },
  { word: 'snip', emoji: '\u2702\uFE0F', letters: ['s', 'n', 'i', 'p'] },
  { word: 'stop', emoji: '\u{1F6D1}', letters: ['s', 't', 'o', 'p'] },
  { word: 'jump', emoji: '\u{1F3C3}', letters: ['j', 'u', 'm', 'p'] },
  { word: 'lamp', emoji: '\u{1F4A1}', letters: ['l', 'a', 'm', 'p'] },
  { word: 'raft', emoji: '\u{1F6F6}', letters: ['r', 'a', 'f', 't'] },
  { word: 'nest', emoji: '\u{1FAB9}', letters: ['n', 'e', 's', 't'] },
];

function wrPickRandom(arr, n) { return shuffle(arr).slice(0, n); }

function wrDistractorCount(level) { if (level <= 2) return 2; if (level <= 4) return 3; return 4; }

function wrPickWord(level, usedWords) {
  let pool;
  if (level <= 2) { pool = CVC_WORDS.short_a; }
  else if (level <= 4) { pool = Object.values(CVC_WORDS).flat(); }
  else { pool = WR_ADVANCED_WORDS; }
  const unused = pool.filter((w) => !usedWords.has(w.word));
  const source = unused.length > 0 ? unused : pool;
  const entry = source[Math.floor(Math.random() * source.length)];
  return { word: entry.word, emoji: entry.emoji, letters: entry.letters || entry.word.split('') };
}

function wrBuildTiles(wordLetters, numDistractors) {
  const needed = new Set(wordLetters);
  const distractors = [];
  const candidates = shuffle(WR_ALL_LETTERS.filter((l) => !needed.has(l)));
  for (let i = 0; i < numDistractors && i < candidates.length; i++) distractors.push(candidates[i]);
  const tiles = [...wordLetters, ...distractors].map((letter, i) => ({
    id: `${letter}-${i}-${Math.random().toString(36).slice(2, 6)}`, letter, used: false,
  }));
  return shuffle(tiles);
}

const RIVER_KEYFRAMES = `
@keyframes wr-wave { 0% { transform: translateX(0) translateY(0); } 25% { transform: translateX(-15px) translateY(-4px); } 50% { transform: translateX(0) translateY(0); } 75% { transform: translateX(15px) translateY(-4px); } 100% { transform: translateX(0) translateY(0); } }
@keyframes wr-float { 0% { transform: translateY(0); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0); } }
@keyframes wr-snap { 0% { transform: scale(0.4); opacity: 0.3; } 60% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
@keyframes wr-splash { 0% { transform: translateX(0) rotate(0deg); } 20% { transform: translateX(-8px) rotate(-5deg); } 40% { transform: translateX(8px) rotate(5deg); } 60% { transform: translateX(-4px) rotate(-2deg); } 80% { transform: translateX(4px) rotate(2deg); } 100% { transform: translateX(0) rotate(0deg); } }
@keyframes wr-shimmer { 0% { filter: hue-rotate(0deg) brightness(1); } 25% { filter: hue-rotate(90deg) brightness(1.2); } 50% { filter: hue-rotate(180deg) brightness(1.1); } 75% { filter: hue-rotate(270deg) brightness(1.2); } 100% { filter: hue-rotate(360deg) brightness(1); } }
@keyframes wr-flow { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(-120%); opacity: 0; } }
@keyframes wr-flow-in { 0% { transform: translateX(120%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
@keyframes wr-tile-fade { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.5); } }
`;

function RiverWaves() {
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '90px', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }} aria-hidden="true">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, width: '200%', height: '100%', animation: 'wr-wave 6s ease-in-out infinite' }}>
        <path d="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 C1680,100 1920,20 2160,60 L2160,120 L0,120 Z" fill="rgba(100,180,255,0.25)" />
        <path d="M0,75 C200,105 440,45 720,75 C1000,105 1240,45 1440,75 C1640,105 1880,45 2160,75 L2160,120 L0,120 Z" fill="rgba(70,150,230,0.30)" />
        <path d="M0,90 C180,110 400,70 720,90 C1040,110 1260,70 1440,90 C1620,110 1840,70 2160,90 L2160,120 L0,120 Z" fill="rgba(50,130,210,0.35)" />
      </svg>
    </div>
  );
}

function WRLetterSlot({ letter, filled, shimmer }) {
  return (
    <div style={{
      width: 'clamp(48px, 12vw, 72px)', height: 'clamp(54px, 13vw, 80px)',
      border: filled ? '3px solid #4A90D9' : '3px dashed #90C0E8', borderRadius: '12px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: filled ? '#E8F4FD' : 'rgba(255,255,255,0.6)',
      fontSize: 'clamp(32px, 7vw, 52px)', fontFamily: 'var(--font-display, "Andika", sans-serif)', fontWeight: 700, color: '#2D1B14',
      animation: filled ? (shimmer ? 'wr-shimmer 1.2s ease-in-out, wr-snap 0.3s ease-out' : 'wr-snap 0.3s ease-out') : 'none',
      transition: 'background-color 0.2s ease', textTransform: 'uppercase', userSelect: 'none',
    }} aria-label={filled ? `Letter ${letter}` : 'Empty slot'}>{filled ? letter : '_'}</div>
  );
}

function WRLetterTile({ tile, onTap, animState, delay }) {
  const isIdle = animState === 'idle';
  const isSplash = animState === 'splash';
  const isFading = animState === 'fading';
  if (tile.used && animState !== 'fading') return null;
  return (
    <button type="button" onClick={() => onTap(tile)} disabled={tile.used} style={{
      width: 'clamp(48px, 11vw, 68px)', height: 'clamp(54px, 12vw, 74px)', borderRadius: '14px', border: 'none',
      backgroundColor: '#FFF8EE', color: '#2D1B14', fontSize: 'clamp(36px, 7vw, 56px)',
      fontFamily: 'var(--font-display, "Andika", sans-serif)', fontWeight: 700,
      cursor: tile.used ? 'default' : 'pointer', boxShadow: '0 3px 10px rgba(30,80,140,0.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase',
      userSelect: 'none', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
      transition: 'transform 0.15s ease, opacity 0.3s ease',
      animation: isFading ? 'wr-tile-fade 0.35s ease-out forwards' : isSplash ? 'wr-splash 0.4s ease-out' : `wr-float ${2.5 + delay * 0.4}s ease-in-out ${delay * 0.3}s infinite`,
      opacity: tile.used ? 0 : 1, pointerEvents: tile.used ? 'none' : 'auto',
    }} aria-label={`Letter ${tile.letter}`}>{tile.letter}</button>
  );
}

function WordRiver({ onComplete, onBack }) {
  const { speak, isSpeaking } = useTextToSpeech();
  const { state, dispatch } = useGameState('word-river');
  const { difficulty, recordAnswer } = useAdaptiveDifficulty({ initialLevel: 1 });

  const [wordIndex, setWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState(null);
  const [tiles, setTiles] = useState([]);
  const [filledSlots, setFilledSlots] = useState([]);
  const [wordComplete, setWordComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [tileAnims, setTileAnims] = useState({});
  const [transitioning, setTransitioning] = useState(false);
  const [flowOut, setFlowOut] = useState(false);
  const [mascotMsg, setMascotMsg] = useState('');
  const [wrongCount, setWrongCount] = useState(0);

  const usedWordsRef = useRef(new Set());
  const initedRef = useRef(false);
  const autoPlayRef = useRef(false);

  useEffect(() => { dispatch({ type: 'SET_TOTAL_ITEMS', totalItems: WR_TOTAL_WORDS }); }, [dispatch]);

  const loadWord = useCallback((lvl) => {
    const entry = wrPickWord(lvl, usedWordsRef.current);
    usedWordsRef.current.add(entry.word);
    const numDist = wrDistractorCount(lvl);
    const newTiles = wrBuildTiles(entry.letters, numDist);
    setCurrentWord(entry); setTiles(newTiles); setFilledSlots([]); setWordComplete(false);
    setShowConfetti(false); setTileAnims({}); setWrongCount(0); setFlowOut(false); setTransitioning(false);
    return entry;
  }, []);

  useEffect(() => {
    if (state.phase === 'intro' && !initedRef.current) {
      initedRef.current = true;
      setMascotMsg("Welcome to Word River! Tap letters to spell words. Let's dive in!");
      speak("Welcome to Word River! Tap letters to spell words. Let's dive in!");
    }
  }, [state.phase, speak]);

  useEffect(() => {
    if (state.phase !== 'demonstrate') return;
    if (autoPlayRef.current) return;
    autoPlayRef.current = true;
    const entry = loadWord(difficulty);
    setMascotMsg(`Watch me spell ${entry.word}!`);
    const runDemo = async () => {
      await speak(`Watch me spell ${entry.word}!`);
      for (let i = 0; i < entry.letters.length; i++) {
        await new Promise((r) => setTimeout(r, 800));
        await speak(entry.letters[i]);
        setFilledSlots((prev) => [...prev, entry.letters[i]]);
        setTiles((prev) => { const idx = prev.findIndex((t) => t.letter === entry.letters[i] && !t.used); if (idx >= 0) { const next = [...prev]; next[idx] = { ...next[idx], used: true }; return next; } return prev; });
      }
      await new Promise((r) => setTimeout(r, 400));
      await speak(entry.word);
      setWordComplete(true); setShowConfetti(true);
      setMascotMsg(`${entry.word}! Great job! Now it's your turn.`);
      await speak("Now it's your turn!");
      await new Promise((r) => setTimeout(r, 800));
      dispatch({ type: 'START_GUIDED' }); autoPlayRef.current = false;
    };
    runDemo();
  }, [state.phase, difficulty, dispatch, loadWord, speak]);

  const prevPhaseRef = useRef(state.phase);
  useEffect(() => {
    const phaseChanged = prevPhaseRef.current !== state.phase;
    prevPhaseRef.current = state.phase;
    if (phaseChanged && (state.phase === 'guided' || state.phase === 'independent')) {
      const entry = loadWord(difficulty);
      const prompt = state.phase === 'guided' ? `Can you spell ${entry.word}? I'll help you!` : `Can you spell ${entry.word}?`;
      setMascotMsg(prompt); speak(prompt);
    }
  }, [state.phase, difficulty, loadWord, speak]);

  const handleTileTap = useCallback(async (tile) => {
    if (!currentWord || wordComplete || transitioning || isSpeaking) return;
    const nextSlotIndex = filledSlots.length;
    const expectedLetter = currentWord.letters[nextSlotIndex];
    if (tile.letter === expectedLetter) {
      SFX.pop();
      speak(tile.letter, { rate: 1.0 });
      setTileAnims((prev) => ({ ...prev, [tile.id]: 'fading' }));
      setTimeout(() => {
        setTiles((prev) => prev.map((t) => (t.id === tile.id ? { ...t, used: true } : t)));
        setTileAnims((prev) => { const n = { ...prev }; delete n[tile.id]; return n; });
      }, 350);
      const newFilled = [...filledSlots, tile.letter];
      setFilledSlots(newFilled);
      if (newFilled.length === currentWord.letters.length) {
        SFX.celebrate();
        setWordComplete(true); setShowConfetti(true);
        await new Promise((r) => setTimeout(r, 500));
        await speak(currentWord.word, { rate: 0.8, pitch: 1.2 });
        const isGuided = state.phase === 'guided';
        const wordIdx = wordIndex;
        const wasFlawless = wrongCount === 0;
        dispatch({ type: 'RECORD_ANSWER', correct: wasFlawless }); recordAnswer(wasFlawless);
        setMascotMsg(`${currentWord.word}! Wonderful!`);
        await new Promise((r) => setTimeout(r, 1200));
        const nextIdx = wordIdx + 1;
        if (nextIdx >= WR_TOTAL_WORDS) { dispatch({ type: 'COMPLETE' }); }
        else {
          setFlowOut(true); setTransitioning(true);
          await new Promise((r) => setTimeout(r, 600));
          setWordIndex(nextIdx); dispatch({ type: 'NEXT_ITEM' });
          if (isGuided && nextIdx >= WR_GUIDED_COUNT) { dispatch({ type: 'START_INDEPENDENT' }); }
          else {
            const entry = loadWord(difficulty);
            const msg = isGuided ? `Can you spell ${entry.word}? I'll help you!` : `Can you spell ${entry.word}?`;
            setMascotMsg(msg); speak(msg);
          }
        }
      }
    } else {
      SFX.splash();
      setWrongCount((p) => p + 1);
      setTileAnims((prev) => ({ ...prev, [tile.id]: 'splash' }));
      setTimeout(() => { setTileAnims((prev) => ({ ...prev, [tile.id]: 'idle' })); }, 450);
      if (state.phase === 'guided') { setMascotMsg(`Oops! Try the letter "${expectedLetter}".`); speak(`Try ${expectedLetter}`); }
      else { setMascotMsg('Not quite, try again!'); }
    }
  }, [currentWord, wordComplete, transitioning, isSpeaking, filledSlots, state.phase, wordIndex, wrongCount, difficulty, dispatch, recordAnswer, loadWord, speak]);

  const celebrateTriggered = useRef(false);
  useEffect(() => {
    if (state.phase === 'celebrate' && !celebrateTriggered.current) {
      SFX.celebrate();
      celebrateTriggered.current = true; setShowConfetti(true);
      const stars = state.stars || 1;
      const msg = stars === 3 ? 'Amazing! You are a Word River superstar!' : stars === 2 ? 'Great job! You built lots of words!' : 'Good effort! Keep practicing!';
      setMascotMsg(msg); speak(msg);
    }
  }, [state.phase, state.stars, speak]);

  const shimmerWord = wordComplete && !transitioning;
  const riverBg = { background: 'linear-gradient(180deg, #D6EEFF 0%, #A8D8F0 40%, #7EC8E3 100%)', minHeight: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' };

  if (state.phase === 'intro') {
    return (
      <GameShell title="Word River" onBack={onBack}>
        <style>{RIVER_KEYFRAMES}</style>
        <div style={riverBg}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '24px 16px', zIndex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(48px, 10vw, 80px)', lineHeight: 1 }}>{'\u{1F30A}'}</div>
            <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontFamily: 'var(--font-display, "Andika", sans-serif)', fontWeight: 700, color: '#1a4e6e', margin: 0 }}>Word River</h2>
            <MascotGuide message={mascotMsg} speaking={isSpeaking} />
            <BigButton label="Dive In!" icon={'\u{1F3CA}'} onClick={() => dispatch({ type: 'START_DEMO' })} />
          </div>
          <RiverWaves />
        </div>
      </GameShell>
    );
  }

  if (state.phase === 'celebrate') {
    const finalStars = state.stars || 1;
    return (
      <GameShell title="Word River" onBack={onBack}>
        <style>{RIVER_KEYFRAMES}</style>
        <ConfettiBlast trigger={showConfetti} />
        <div style={riverBg}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '24px 16px', zIndex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(48px, 10vw, 72px)', lineHeight: 1 }}>{'\u{1F389}'}</div>
            <h2 style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontFamily: 'var(--font-display, "Andika", sans-serif)', fontWeight: 700, color: '#1a4e6e', margin: 0 }}>River Complete!</h2>
            <StarRating stars={finalStars} />
            <p style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontFamily: 'var(--font-body, "Nunito", sans-serif)', fontWeight: 600, color: '#2D1B14', margin: 0 }}>You built <strong style={{ color: '#4A90D9' }}>{state.score.correct}</strong> / {WR_TOTAL_WORDS} words perfectly!</p>
            <MascotGuide message={mascotMsg} speaking={isSpeaking} />
            <BigButton label="Back to Hub" icon={'\u{1F3E0}'} onClick={() => onComplete ? onComplete({ stars: finalStars, correct: state.score.correct, total: WR_TOTAL_WORDS }) : onBack && onBack()} />
          </div>
          <RiverWaves />
        </div>
      </GameShell>
    );
  }

  const isDemo = state.phase === 'demonstrate';
  return (
    <GameShell title="Word River" onBack={onBack}>
      <style>{RIVER_KEYFRAMES}</style>
      <ConfettiBlast trigger={showConfetti} />
      <div style={riverBg}>
        {!isDemo && (<div style={{ width: '100%', maxWidth: '400px', padding: '12px 16px 0', zIndex: 1 }}><ProgressBar current={wordIndex} total={WR_TOTAL_WORDS} /></div>)}
        <div style={{ fontSize: 'clamp(12px, 2.5vw, 15px)', fontFamily: 'var(--font-body, "Nunito", sans-serif)', fontWeight: 600, color: '#3a7ca5', padding: '6px 14px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '20px', marginTop: '8px', zIndex: 1 }}>
          {isDemo ? 'Watch & Learn' : state.phase === 'guided' ? 'Guided Practice' : 'Your Turn!'}
        </div>
        {currentWord && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '16px', zIndex: 1, animation: flowOut ? 'wr-flow 0.5s ease-in forwards' : transitioning ? 'none' : 'wr-flow-in 0.4s ease-out' }}>
            <div style={{ fontSize: 'clamp(56px, 14vw, 96px)', lineHeight: 1, animation: shimmerWord ? 'wr-shimmer 1.2s ease-in-out' : 'none', userSelect: 'none' }} aria-label={currentWord.word}>{currentWord.emoji}</div>
            <div style={{ display: 'flex', gap: 'clamp(6px, 1.5vw, 12px)', justifyContent: 'center', flexWrap: 'wrap' }}>
              {currentWord.letters.map((letter, i) => (<WRLetterSlot key={`${currentWord.word}-slot-${i}`} letter={filledSlots[i] || ''} filled={i < filledSlots.length} shimmer={shimmerWord} />))}
            </div>
          </div>
        )}
        <div style={{ zIndex: 1, padding: '0 8px' }}><MascotGuide message={mascotMsg} speaking={isSpeaking} /></div>
        {currentWord && !isDemo && (
          <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 14px)', justifyContent: 'center', flexWrap: 'wrap', padding: '12px 16px 100px', zIndex: 1, maxWidth: '600px' }}>
            {tiles.map((tile, i) => (<WRLetterTile key={tile.id} tile={tile} onTap={handleTileTap} animState={tileAnims[tile.id] || 'idle'} delay={i} />))}
          </div>
        )}
        {currentWord && !isDemo && !wordComplete && (
          <div style={{ zIndex: 1, paddingBottom: '100px' }}>
            <BigButton label="Hear Again" icon={'\u{1F50A}'} size="md" variant="secondary" onClick={() => speak(`Can you spell ${currentWord.word}?`)} disabled={isSpeaking} />
          </div>
        )}
        <RiverWaves />
      </div>
    </GameShell>
  );
}

// ============================================================================
// 9. GAME: StorySparks
// ============================================================================

const SS_PARCHMENT = '#F0E6D6';
const SS_SPINE_SHADOW = 'inset 4px 0 12px -4px rgba(80,50,20,0.18), inset -4px 0 12px -4px rgba(80,50,20,0.18)';
const SS_WORD_STAGGER_MS = 200;

const SS_PARAGRAPH_EMOJIS = [
  ['\uD83D\uDC14', '\uD83D\uDC23', '\uD83C\uDFDE\uFE0F'],
  ['\u2600\uFE0F', '\uD83D\uDC36', '\uD83C\uDF05'],
  ['\uD83C\uDF2B\uFE0F', '\uD83D\uDC69', '\uD83C\uDFE0'],
];

function ssGetStoryConfig(difficulty) {
  if (difficulty <= 2) return { storyIndex: 0, questionType: 'literal' };
  if (difficulty <= 4) return { storyIndex: 1, questionType: 'inferential' };
  return { storyIndex: 2, questionType: 'vocabulary' };
}

function SSSparkleTransition({ active, onDone }) {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    if (!active) { setParticles([]); return; }
    const ps = Array.from({ length: 24 }, (_, i) => ({ id: i, x: Math.random() * 100, y: Math.random() * 100, size: 10 + Math.random() * 18, delay: Math.random() * 0.4 }));
    setParticles(ps);
    const t = setTimeout(() => onDone(), 1200);
    return () => clearTimeout(t);
  }, [active, onDone]);
  if (!active || particles.length === 0) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, pointerEvents: 'none', background: 'rgba(255,248,240,0.7)' }} aria-hidden="true">
      {particles.map((p) => (<span key={p.id} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, fontSize: `${p.size}px`, animation: `spin-in 0.8s ease ${p.delay}s both` }}>{'\u2728'}</span>))}
    </div>
  );
}

function SSStoryWord({ word, index, visibleCount, isCurrentWord, onTap }) {
  const isVisible = index < visibleCount;
  return (
    <span onClick={() => isVisible && onTap(word)} style={{
      display: 'inline-block', opacity: isVisible ? 1 : 0, transition: 'opacity 0.3s ease',
      cursor: isVisible ? 'pointer' : 'default', padding: '2px 3px',
      borderBottom: isCurrentWord ? '3px solid #4A90D9' : '3px solid transparent',
      fontFamily: 'var(--font-body, "Nunito", sans-serif)', fontSize: 'clamp(18px, 3.8vw, 26px)',
      lineHeight: 1.8, color: 'var(--text-primary, #2D1B14)', userSelect: 'none', WebkitTapHighlightColor: 'transparent',
    }} role="button" tabIndex={isVisible ? 0 : -1} aria-hidden={!isVisible}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (isVisible) onTap(word); } }}>
      {word}
    </span>
  );
}

function SSAnswerButton({ text, index, onSelect, state: btnState, disabled }) {
  const [hovered, setHovered] = useState(false);
  const bg = btnState === 'correct' ? '#C8E6C9' : btnState === 'wrong' ? '#FFCDD2' : hovered ? 'var(--interactive-hover, #FFF0E0)' : 'var(--interactive-bg, #FFFFFF)';
  const border = btnState === 'correct' ? '3px solid #4CAF50' : btnState === 'wrong' ? '3px solid #E57373' : '3px solid #D7CFC4';
  const anim = btnState === 'wrong' ? 'gentle-shake 0.5s ease' : 'none';
  return (
    <button type="button" onClick={() => !disabled && onSelect(index)} disabled={disabled}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '16px 20px',
        fontFamily: 'var(--font-body, "Nunito", sans-serif)', fontSize: 'clamp(16px, 3vw, 22px)',
        fontWeight: 600, color: 'var(--text-primary, #2D1B14)', backgroundColor: bg, border, borderRadius: 'var(--radius-md, 16px)',
        cursor: disabled ? 'default' : 'pointer', animation: anim,
        transition: 'background-color 0.2s ease, border-color 0.2s ease', textAlign: 'left', lineHeight: 1.4,
        minHeight: '56px', userSelect: 'none', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
        position: 'relative', overflow: 'visible',
      }} aria-label={`Answer option: ${text}`}>
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: btnState === 'correct' ? '#4CAF50' : btnState === 'wrong' ? '#E57373' : '#E8E0D6', color: btnState ? '#FFF' : 'var(--text-secondary, #5C4033)', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>{String.fromCharCode(65 + index)}</span>
      <span style={{ flex: 1 }}>{text}</span>
      {btnState === 'correct' && (<span style={{ fontSize: '28px', animation: 'spin-in 0.5s ease both' }} aria-hidden="true">{'\u2B50'}</span>)}
    </button>
  );
}

function StorySparks({ onComplete, onBack }) {
  const { speak, stop: stopSpeech, isSpeaking } = useTextToSpeech();
  const { difficulty, recordAnswer } = useAdaptiveDifficulty({ initialLevel: 1 });
  const { state: gameState, dispatch } = useGameState('story-sparks');

  const [phase, setPhase] = useState('intro');
  const [storyIndex, setStoryIndex] = useState(0);
  const [visibleWordCount, setVisibleWordCount] = useState(0);
  const [currentWordIdx, setCurrentWordIdx] = useState(-1);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answerStates, setAnswerStates] = useState([null, null, null]);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [wordsRead, setWordsRead] = useState(0);
  const [mascotMsg, setMascotMsg] = useState("Hi! Let's read a story together!");
  const [mascotSpeaking, setMascotSpeaking] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [highlightSentence, setHighlightSentence] = useState(null);
  const [showScrollBack, setShowScrollBack] = useState(false);

  const storyAreaRef = useRef(null);
  const wordTimerRef = useRef(null);
  const ttsQueueRef = useRef(null);

  const story = STORIES[storyIndex];
  const allWords = useMemo(() => {
    if (!story) return [];
    return story.paragraphs.flatMap((para, pi) => {
      const words = para.split(/\s+/).filter(Boolean);
      return words.map((w, wi) => ({ word: w, paraIndex: pi, wordIndex: wi }));
    });
  }, [storyIndex, story]);

  const totalWordCount = allWords.length;
  const currentQuestion = story ? story.questions[questionIdx] : null;

  useEffect(() => {
    return () => { if (wordTimerRef.current) clearInterval(wordTimerRef.current); if (ttsQueueRef.current) clearTimeout(ttsQueueRef.current); stopSpeech(); };
  }, [stopSpeech]);

  const startStory = useCallback(() => {
    const config = ssGetStoryConfig(difficulty);
    setStoryIndex(config.storyIndex); setPhase('story'); setVisibleWordCount(0); setCurrentWordIdx(-1);
    setMascotMsg("Let's read together! Tap any word to hear it."); setMascotSpeaking(true);
    setHighlightSentence(null); setShowScrollBack(false);
  }, [difficulty]);

  useEffect(() => {
    if (phase !== 'story') return;
    const words = story.paragraphs.flatMap((p) => p.split(/\s+/).filter(Boolean));
    let idx = 0;
    const timer = setInterval(() => {
      if (idx >= words.length) {
        clearInterval(timer); setCurrentWordIdx(-1);
        setMascotMsg('Great reading! Ready for some questions?'); setMascotSpeaking(true);
        setTimeout(() => { setPhase('sparkle'); }, 1200);
        return;
      }
      setVisibleWordCount(idx + 1); setCurrentWordIdx(idx);
      speak(words[idx], { rate: 0.85 }); idx++;
    }, SS_WORD_STAGGER_MS);
    wordTimerRef.current = timer;
    return () => clearInterval(timer);
  }, [phase, storyIndex, story, speak]);

  useEffect(() => { if (phase === 'story') setWordsRead((prev) => Math.max(prev, visibleWordCount)); }, [visibleWordCount, phase]);

  const handleSparkleDone = useCallback(() => {
    setPhase('questions'); setQuestionIdx(0); setAnswerStates([null, null, null]); setAnswered(false);
    setMascotMsg('Answer the questions about the story!'); setMascotSpeaking(true);
  }, []);

  const handleWordTap = useCallback((word) => {
    const clean = word.replace(/[^a-zA-Z'-]/g, '');
    if (clean) speak(clean, { rate: 0.75 });
  }, [speak]);

  const handleAnswer = useCallback((optionIdx) => {
    if (answered || !currentQuestion) return;
    const isCorrect = optionIdx === currentQuestion.correct;
    const newStates = [null, null, null];
    newStates[optionIdx] = isCorrect ? 'correct' : 'wrong';
    if (!isCorrect) newStates[currentQuestion.correct] = 'correct';
    setAnswerStates(newStates); setAnswered(true);
    dispatch({ type: 'RECORD_ANSWER', correct: isCorrect }); recordAnswer(isCorrect);
    if (isCorrect) {
      SFX.correct();
      setCorrectCount((c) => c + 1); setMascotMsg('Fantastic! That\'s correct!'); setMascotSpeaking(true);
      setShowConfetti(true); setTimeout(() => setShowConfetti(false), 200);
    } else {
      SFX.wrong();
      setMascotMsg('Not quite. Look at the story for a hint!'); setMascotSpeaking(true);
      setShowScrollBack(true);
      const hintParaIdx = Math.min(questionIdx, story.paragraphs.length - 1);
      setHighlightSentence(hintParaIdx);
      if (storyAreaRef.current) storyAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTotalQuestions((t) => t + 1);
    setTimeout(() => {
      setHighlightSentence(null); setShowScrollBack(false);
      if (questionIdx < 2) { setQuestionIdx((qi) => qi + 1); setAnswerStates([null, null, null]); setAnswered(false); setMascotMsg('Here comes the next question!'); }
      else { dispatch({ type: 'COMPLETE' }); setPhase('celebrate'); SFX.celebrate(); setMascotMsg('You did it! Amazing reading!'); setMascotSpeaking(true); }
    }, isCorrect ? 1500 : 2500);
  }, [answered, currentQuestion, questionIdx, dispatch, recordAnswer, story, speak]);

  const ssStars = useMemo(() => { if (correctCount === 3) return 3; if (correctCount === 2) return 2; return 1; }, [correctCount]);

  const handleBackToHub = useCallback(() => {
    if (onComplete) onComplete({ stars: ssStars, correct: correctCount, total: 3 });
    else if (onBack) onBack();
  }, [onComplete, onBack, ssStars, correctCount]);

  const bookSpreadStyle = {
    background: SS_PARCHMENT, borderRadius: '8px',
    boxShadow: `${SS_SPINE_SHADOW}, var(--shadow-medium, 0 4px 16px rgba(45,27,20,0.15))`,
    padding: '24px 20px', maxWidth: '800px', margin: '0 auto', minHeight: '400px', position: 'relative',
    backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), linear-gradient(90deg, rgba(120,80,40,0.06) 0%, transparent 4%, transparent 49%, rgba(120,80,40,0.1) 50%, transparent 51%, transparent 96%, rgba(120,80,40,0.06) 100%)`,
    backgroundColor: SS_PARCHMENT,
  };
  const spineStyle = { position: 'absolute', top: 0, bottom: 0, left: '50%', width: '2px', background: 'linear-gradient(to bottom, transparent, rgba(120,80,40,0.15) 10%, rgba(120,80,40,0.15) 90%, transparent)', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 1 };

  if (phase === 'intro') {
    return (
      <GameShell title="Story Sparks" onBack={onBack}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: '24px', textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '80px', lineHeight: 1, animation: 'wave-motion 3s ease-in-out infinite' }} aria-hidden="true">{'\uD83D\uDCD6'}</div>
          <h2 style={{ fontFamily: 'var(--font-display, "Andika", sans-serif)', fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, color: 'var(--text-primary, #2D1B14)', margin: '0 0 8px 0' }}>Story Sparks</h2>
          <MascotGuide message={mascotMsg} speaking={mascotSpeaking} />
          <BigButton onClick={startStory} label="Open the Book!" icon={'\uD83D\uDCD6'} size="lg" />
        </div>
      </GameShell>
    );
  }

  if (phase === 'story') {
    const paragraphGroups = [];
    let wordOffset = 0;
    story.paragraphs.forEach((para, pi) => { const paraWords = para.split(/\s+/).filter(Boolean); paragraphGroups.push({ paraIndex: pi, words: paraWords, startOffset: wordOffset, emoji: SS_PARAGRAPH_EMOJIS[storyIndex]?.[pi] || '\uD83D\uDCD6' }); wordOffset += paraWords.length; });
    return (
      <GameShell title={story.title} onBack={onBack}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', fontFamily: 'var(--font-body, "Nunito", sans-serif)', fontSize: 'clamp(14px, 2.5vw, 18px)', color: 'var(--text-secondary, #5C4033)', marginBottom: '12px' }}>{'\uD83D\uDCDA'} You read {wordsRead} words!</div>
          <ProgressBar current={visibleWordCount} total={totalWordCount} />
          <div style={{ height: '16px' }} />
          <div style={bookSpreadStyle} ref={storyAreaRef}>
            <div style={spineStyle} />
            {paragraphGroups.map((pg) => (
              <div key={pg.paraIndex} style={{ marginBottom: '24px', position: 'relative', backgroundColor: highlightSentence === pg.paraIndex ? 'rgba(74,144,217,0.12)' : 'transparent', borderRadius: '8px', padding: highlightSentence === pg.paraIndex ? '8px' : '0', transition: 'background-color 0.3s ease, padding 0.3s ease' }}>
                <div style={{ textAlign: 'center', fontSize: 'clamp(40px, 8vw, 64px)', lineHeight: 1, marginBottom: '12px', opacity: visibleWordCount > pg.startOffset ? 1 : 0.2, transition: 'opacity 0.5s ease' }} aria-hidden="true">{pg.emoji}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 6px', justifyContent: 'flex-start' }}>
                  {pg.words.map((w, wi) => { const globalIdx = pg.startOffset + wi; return (<SSStoryWord key={`${pg.paraIndex}-${wi}`} word={w} index={globalIdx} visibleCount={visibleWordCount} isCurrentWord={globalIdx === currentWordIdx} onTap={handleWordTap} />); })}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px' }}><MascotGuide message={mascotMsg} speaking={mascotSpeaking} /></div>
        </div>
      </GameShell>
    );
  }

  if (phase === 'sparkle') {
    return (
      <GameShell title={story.title} onBack={onBack}>
        <SSSparkleTransition active={true} onDone={handleSparkleDone} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontFamily: 'var(--font-display, "Andika", sans-serif)', fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, color: 'var(--text-primary, #2D1B14)' }}>Question Time!</div>
      </GameShell>
    );
  }

  if (phase === 'questions') {
    const paragraphGroups = [];
    let wordOffset = 0;
    story.paragraphs.forEach((para, pi) => { const paraWords = para.split(/\s+/).filter(Boolean); paragraphGroups.push({ paraIndex: pi, words: paraWords, startOffset: wordOffset, emoji: SS_PARAGRAPH_EMOJIS[storyIndex]?.[pi] || '\uD83D\uDCD6' }); wordOffset += paraWords.length; });
    return (
      <GameShell title={story.title} onBack={onBack}>
        <ConfettiBlast trigger={showConfetti} />
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <ProgressBar current={questionIdx + (answered ? 1 : 0)} total={3} />
          <div style={{ height: '20px' }} />
          {showScrollBack && (
            <div ref={storyAreaRef} style={{ ...bookSpreadStyle, maxHeight: '250px', overflowY: 'auto', marginBottom: '16px', fontSize: 'clamp(14px, 2.5vw, 18px)' }}>
              <div style={spineStyle} />
              {paragraphGroups.map((pg) => (
                <div key={pg.paraIndex} style={{ marginBottom: '12px', backgroundColor: highlightSentence === pg.paraIndex ? 'rgba(74,144,217,0.15)' : 'transparent', borderRadius: '8px', padding: highlightSentence === pg.paraIndex ? '8px' : '4px 0', transition: 'background-color 0.3s ease' }}>
                  <span style={{ marginRight: '8px', fontSize: '24px' }} aria-hidden="true">{pg.emoji}</span>
                  <span style={{ fontFamily: 'var(--font-body, "Nunito", sans-serif)', color: 'var(--text-primary, #2D1B14)', lineHeight: 1.6 }}>{pg.words.join(' ')}</span>
                </div>
              ))}
            </div>
          )}
          {currentQuestion && (
            <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg, 24px)', padding: '24px', boxShadow: 'var(--shadow-medium, 0 4px 16px rgba(45,27,20,0.15))', animation: 'fade-slide-in 0.4s ease both' }} key={questionIdx}>
              <div style={{ display: 'inline-block', backgroundColor: 'var(--accent-secondary, #4A90D9)', color: '#FFF', borderRadius: '12px', padding: '4px 14px', fontFamily: 'var(--font-body, "Nunito", sans-serif)', fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>Question {questionIdx + 1} of 3</div>
              <h3 style={{ fontFamily: 'var(--font-display, "Andika", sans-serif)', fontSize: 'clamp(18px, 3.5vw, 26px)', fontWeight: 700, color: 'var(--text-primary, #2D1B14)', margin: '0 0 20px 0', lineHeight: 1.4 }}>{currentQuestion.q}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentQuestion.options.map((opt, oi) => (<SSAnswerButton key={`${questionIdx}-${oi}`} text={opt} index={oi} onSelect={handleAnswer} state={answerStates[oi]} disabled={answered} />))}
              </div>
            </div>
          )}
          <div style={{ marginTop: '20px' }}><MascotGuide message={mascotMsg} speaking={mascotSpeaking} /></div>
        </div>
      </GameShell>
    );
  }

  if (phase === 'celebrate') {
    return (
      <GameShell title="Story Sparks" onBack={onBack}>
        <ConfettiBlast trigger={true} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: '20px', textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '72px', lineHeight: 1, animation: 'celebrate-bounce 0.8s ease both' }} aria-hidden="true">{'\uD83C\uDF1F'}</div>
          <h2 style={{ fontFamily: 'var(--font-display, "Andika", sans-serif)', fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, color: 'var(--text-primary, #2D1B14)', margin: 0 }}>Amazing Reading!</h2>
          <StarRating stars={ssStars} />
          <p style={{ fontFamily: 'var(--font-body, "Nunito", sans-serif)', fontSize: 'clamp(16px, 3vw, 22px)', color: 'var(--text-secondary, #5C4033)', margin: 0 }}>You answered {correctCount} out of 3 questions correctly!</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(74,144,217,0.1)', borderRadius: 'var(--radius-md, 16px)', padding: '12px 24px' }}>
            <span style={{ fontSize: '28px' }} aria-hidden="true">{'\uD83D\uDCDA'}</span>
            <span style={{ fontFamily: 'var(--font-body, "Nunito", sans-serif)', fontSize: 'clamp(16px, 3vw, 22px)', fontWeight: 700, color: 'var(--accent-secondary, #4A90D9)' }}>You read {wordsRead} words!</span>
          </div>
          <MascotGuide message={mascotMsg} speaking={mascotSpeaking} />
          <div style={{ marginTop: '12px' }}><BigButton onClick={handleBackToHub} label="Back to Hub" icon={'\uD83C\uDFE0'} size="lg" /></div>
        </div>
      </GameShell>
    );
  }

  return null;
}

// ============================================================================
// 10. GAME: NumberJungle
// ============================================================================

const NJ_JUNGLE_ANIMALS = ['\u{1F412}', '\u{1F985}', '\u{1F98E}', '\u{1F99C}', '\u{1F40D}', '\u{1F438}', '\u{1F98B}', '\u{1F422}'];
const NJ_JUNGLE_FRUITS = ['\u{1F34C}', '\u{1F34E}', '\u{1F347}', '\u{1F34A}', '\u{1F353}'];

function njPickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function njGetModeForLevel(level) { if (level <= 2) return 'COUNTING'; if (level <= 4) return 'ADDITION'; return 'SUBTRACTION'; }

function njGetMathFactLevel(difficulty) {
  if (difficulty <= 2) return difficulty;
  if (difficulty === 3) return 1;
  if (difficulty === 4) return 2;
  return 2;
}

function njGenerateOptions(correct, mode, difficulty) {
  const opts = new Set();
  opts.add(correct);
  const maxVal = mode === 'COUNTING' ? (difficulty <= 1 ? 5 : 10) : 20;
  while (opts.size < 3) {
    const offset = Math.random() < 0.5 ? 1 : 2;
    const dir = Math.random() < 0.5 ? 1 : -1;
    let distractor = correct + offset * dir;
    if (distractor < 0) distractor = correct + offset;
    if (distractor > maxVal) distractor = correct - offset;
    if (distractor < 0) distractor = 0;
    opts.add(distractor);
  }
  return shuffle([...opts]);
}

function njGenerateProblem(difficulty) {
  const mode = njGetModeForLevel(difficulty);
  const factLevel = njGetMathFactLevel(difficulty);
  if (mode === 'COUNTING') {
    const pool = MATH_FACTS.counting.filter((f) => f.level === factLevel);
    const fact = njPickRandom(pool);
    const emoji = njPickRandom(NJ_JUNGLE_ANIMALS);
    const answer = fact.count;
    const options = njGenerateOptions(answer, mode, difficulty);
    return { mode, emoji, count: answer, answer, options, a: 0, b: 0 };
  }
  if (mode === 'ADDITION') {
    const pool = MATH_FACTS.addition.filter((f) => f.level === factLevel);
    const fact = njPickRandom(pool);
    const emoji = njPickRandom(NJ_JUNGLE_FRUITS);
    const answer = fact.a + fact.b;
    const options = njGenerateOptions(answer, mode, difficulty);
    return { mode, emoji, a: fact.a, b: fact.b, answer, options, count: 0 };
  }
  const pool = MATH_FACTS.subtraction.filter((f) => f.level === factLevel);
  const fact = njPickRandom(pool);
  const emoji = njPickRandom(NJ_JUNGLE_ANIMALS);
  const answer = fact.a - fact.b;
  const options = njGenerateOptions(answer, mode, difficulty);
  return { mode, emoji, a: fact.a, b: fact.b, answer, options, count: 0 };
}

const NJ_JUNGLE_STYLE_ID = 'number-jungle-styles';
function njInjectStyles() {
  if (document.getElementById(NJ_JUNGLE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = NJ_JUNGLE_STYLE_ID;
  style.textContent = `
    @keyframes nj-wiggle { 0% { transform: rotate(0deg); } 20% { transform: rotate(-12deg); } 40% { transform: rotate(12deg); } 60% { transform: rotate(-8deg); } 80% { transform: rotate(8deg); } 100% { transform: rotate(0deg); } }
    @keyframes nj-bounce-in { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
    @keyframes nj-grow { 0% { transform: scale(1); } 50% { transform: scale(1.6); } 100% { transform: scale(1); } }
    @keyframes nj-swing-away { 0% { transform: translateX(0) translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateX(120px) translateY(-80px) rotate(45deg); opacity: 0; } }
    @keyframes nj-merge { 0% { transform: translateX(var(--merge-from)); } 100% { transform: translateX(0); } }
    @keyframes nj-monkey-climb { 0% { transform: translateY(0); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0); } }
    @keyframes nj-vine-sway { 0% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } 100% { transform: rotate(-2deg); } }
    @keyframes nj-leaf-float { 0% { transform: translateY(0) rotate(0deg); opacity: 0.7; } 50% { transform: translateY(-10px) rotate(5deg); opacity: 1; } 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; } }
    @keyframes nj-btn-bounce { 0% { transform: scale(1); } 30% { transform: scale(0.9); } 60% { transform: scale(1.05); } 100% { transform: scale(1); } }
  `;
  document.head.appendChild(style);
}

function NJEmojiGrid({ emoji, count, animationClass, swingAwayCount }) {
  const swingAway = swingAwayCount || 0;
  const remaining = count;
  const total = remaining + swingAway;
  const items = [];
  for (let i = 0; i < total; i++) {
    const isSwinging = i >= remaining;
    items.push(
      <span key={i} style={{
        fontSize: 'clamp(28px, 6vw, 44px)', display: 'inline-block', margin: '4px',
        animation: isSwinging ? 'nj-swing-away 0.8s ease forwards' : animationClass === 'wiggle' ? `nj-wiggle 0.6s ease ${i * 0.05}s` : animationClass === 'bounce-in' ? `nj-bounce-in 0.4s ease ${i * 0.07}s both` : 'none',
        transition: 'transform 0.3s ease',
      }}>{emoji}</span>
    );
  }
  if (total <= 5) return <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2px' }}>{items}</div>;
  const rows = [];
  for (let r = 0; r < Math.ceil(total / 5); r++) rows.push(<div key={r} style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>{items.slice(r * 5, r * 5 + 5)}</div>);
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>{rows}</div>;
}

function NJVineTracker({ current, total }) {
  const progress = total > 0 ? current / total : 0;
  const monkeyBottom = `${progress * 100}%`;
  return (
    <div style={{ position: 'relative', width: '48px', height: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'absolute', top: '16px', bottom: '16px', width: '8px', background: 'linear-gradient(to bottom, #2E7D32, #4CAF50, #2E7D32)', borderRadius: '4px', animation: 'nj-vine-sway 4s ease-in-out infinite', transformOrigin: 'top center' }}>
        {[0.15, 0.35, 0.55, 0.75].map((pos, i) => (<span key={i} style={{ position: 'absolute', top: `${pos * 100}%`, left: i % 2 === 0 ? '-14px' : '10px', fontSize: '16px', animation: `nj-leaf-float 3s ease-in-out ${i * 0.5}s infinite` }}>{'\u{1F343}'}</span>))}
      </div>
      <div style={{ position: 'absolute', bottom: monkeyBottom, left: '50%', transform: 'translateX(-50%)', fontSize: '32px', transition: 'bottom 0.6s ease', animation: 'nj-monkey-climb 1.5s ease-in-out infinite', zIndex: 2, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' }}>{'\u{1F412}'}</div>
      <span style={{ position: 'absolute', top: '-4px', fontSize: '20px', zIndex: 3 }}>{'\u{2B50}'}</span>
    </div>
  );
}

function NJNumberButton({ value, onClick, disabled, feedback }) {
  const [pressed, setPressed] = useState(false);
  const bgColor = feedback === 'correct' ? '#4CAF50' : feedback === 'wrong' ? '#E57373' : '#2E7D32';
  return (
    <button type="button" onClick={() => { if (disabled) return; setPressed(true); setTimeout(() => setPressed(false), 300); onClick(value); }} disabled={disabled}
      style={{
        width: 'clamp(64px, 15vw, 88px)', height: 'clamp(64px, 15vw, 88px)', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.3)',
        background: bgColor, color: '#FFFFFF', fontSize: 'clamp(24px, 5vw, 36px)',
        fontFamily: 'var(--font-display, "Andika", sans-serif)', fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25), inset 0 2px 0 rgba(255,255,255,0.2)',
        animation: pressed ? 'nj-btn-bounce 0.3s ease' : feedback === 'wrong' ? 'gentle-shake 0.4s ease' : 'none',
        transition: 'background-color 0.2s ease, transform 0.15s ease',
        transform: pressed ? 'scale(0.92)' : 'scale(1)', opacity: disabled ? 0.6 : 1,
        userSelect: 'none', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
      }}>{value}</button>
  );
}

function NumberJungle({ onComplete, onBack }) {
  useEffect(() => { njInjectStyles(); }, []);

  const { state, dispatch, isComplete } = useGameState('number-jungle');
  const { speak, isSpeaking } = useTextToSpeech();
  const { difficulty, recordAnswer } = useAdaptiveDifficulty({ initialLevel: 1, onLevelChange: (newLevel) => { speak(`Great work! Level ${newLevel}!`); } });

  const [problem, setProblem] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mascotMessage, setMascotMessage] = useState('');
  const [animClass, setAnimClass] = useState('bounce-in');
  const [guidedIndex, setGuidedIndex] = useState(0);
  const [subPhase, setSubPhase] = useState('idle');
  const [correctCount, setCorrectCount] = useState(0);
  const totalProblems = 12;
  const feedbackTimeoutRef = useRef(null);

  useEffect(() => { return () => { if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current); }; }, []);

  const njSpeakProblem = useCallback((p) => {
    if (p.mode === 'COUNTING') speak('How many animals do you see?');
    else if (p.mode === 'ADDITION') speak(`What is ${p.a} plus ${p.b}?`);
    else speak(`${p.a} take away ${p.b}. How many are left?`);
  }, [speak]);

  const nextProblem = useCallback(() => {
    const p = njGenerateProblem(difficulty);
    setProblem(p); setFeedback(null); setSelectedAnswer(null); setAnimClass('bounce-in'); setSubPhase('answering');
    njSpeakProblem(p);
  }, [difficulty, njSpeakProblem]);

  const startGame = useCallback(() => {
    dispatch({ type: 'START_DEMO' });
    setMascotMessage("Let me show you how to play! Count the animals!");
    speak("Let me show you how to play! Count the animals!");
    setTimeout(() => {
      const demo = njGenerateProblem(1);
      setProblem(demo); setAnimClass('bounce-in'); setSubPhase('answering');
      if (demo.mode === 'COUNTING') speak('How many animals do you see? Let\'s count together!');
    }, 2000);
  }, [dispatch, speak]);

  const advancePhase = useCallback((wasCorrect) => {
    if (state.phase === 'demonstrate') {
      dispatch({ type: 'START_GUIDED' }); setGuidedIndex(0);
      setMascotMessage("Now you try! I'll help if you need it.");
      speak("Now you try! I'll help if you need it.");
      setTimeout(() => { const p = njGenerateProblem(difficulty); setProblem(p); setAnimClass('bounce-in'); setSubPhase('answering'); njSpeakProblem(p); }, 1500);
    } else if (state.phase === 'guided') {
      const nextIdx = guidedIndex + 1;
      if (nextIdx >= 2) {
        dispatch({ type: 'START_INDEPENDENT' }); dispatch({ type: 'SET_TOTAL_ITEMS', totalItems: 10 });
        setMascotMessage("You've got this! Try these on your own!");
        speak("You've got this! Try these on your own!");
        setTimeout(() => { const p = njGenerateProblem(difficulty); setProblem(p); setAnimClass('bounce-in'); setSubPhase('answering'); njSpeakProblem(p); }, 1500);
      } else {
        setGuidedIndex(nextIdx);
        setTimeout(() => { const p = njGenerateProblem(difficulty); setProblem(p); setAnimClass('bounce-in'); setSubPhase('answering'); njSpeakProblem(p); }, 1000);
      }
    } else if (state.phase === 'independent') {
      dispatch({ type: 'NEXT_ITEM' });
      const nextItem = state.currentItem + 1;
      if (nextItem >= 10) { dispatch({ type: 'COMPLETE' }); SFX.celebrate(); setMascotMessage('You finished the jungle adventure!'); speak('You finished the jungle adventure! Great work!'); }
      else { setTimeout(() => { const p = njGenerateProblem(difficulty); setProblem(p); setAnimClass('bounce-in'); setSubPhase('answering'); njSpeakProblem(p); }, 1000); }
    }
  }, [state.phase, state.currentItem, guidedIndex, difficulty, dispatch, speak, njSpeakProblem]);

  const handleAnswer = useCallback((value) => {
    if (subPhase !== 'answering' || !problem) return;
    setSelectedAnswer(value); setSubPhase('feedback');
    const isCorrect = value === problem.answer;
    if (isCorrect) {
      SFX.correct(); SFX.drum();
      setFeedback('correct'); setAnimClass('wiggle'); setShowConfetti(true);
      setMascotMessage('Amazing! Great job!'); speak('Amazing! Great job!');
      setCorrectCount((c) => c + 1);
      if (state.phase === 'guided' || state.phase === 'independent') { dispatch({ type: 'RECORD_ANSWER', correct: true }); recordAnswer(true); }
      feedbackTimeoutRef.current = setTimeout(() => { setShowConfetti(false); setFeedback(null); advancePhase(true); }, 1800);
    } else {
      SFX.wrong();
      setFeedback('wrong');
      setMascotMessage(`Not quite! Let's count together. The answer is ${problem.answer}.`);
      speak(`Not quite! Let's count together. The answer is ${problem.answer}.`);
      if (state.phase === 'guided' || state.phase === 'independent') { dispatch({ type: 'RECORD_ANSWER', correct: false }); recordAnswer(false); }
      feedbackTimeoutRef.current = setTimeout(() => { setFeedback(null); advancePhase(false); }, 2500);
    }
  }, [subPhase, problem, state.phase, dispatch, recordAnswer, speak, advancePhase]);

  useEffect(() => {
    if (isComplete && onComplete) { /* let user click Back to Hub */ }
  }, [isComplete, onComplete, state.stars, state.score]);

  const jungleBg = { background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 30%, #388E3C 60%, #1B5E20 100%)', minHeight: '100%', position: 'relative', overflow: 'hidden' };
  const vineDecoration = (side) => ({ position: 'absolute', top: 0, [side]: 0, width: '40px', height: '100%', background: 'linear-gradient(to bottom, #2E7D32, #4CAF50, #2E7D32)', opacity: 0.3, pointerEvents: 'none', zIndex: 0 });

  if (state.phase === 'intro') {
    return (
      <GameShell title="Number Jungle" onBack={onBack}>
        <div style={jungleBg}>
          <div style={vineDecoration('left')} /><div style={vineDecoration('right')} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', padding: '24px', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 'clamp(36px, 8vw, 56px)', fontFamily: 'var(--font-display, "Andika", sans-serif)', fontWeight: 700, color: '#FFD700', textShadow: '2px 2px 4px rgba(0,0,0,0.4)', textAlign: 'center', marginBottom: '8px', animation: 'fade-slide-in 0.6s ease both' }}>{'\u{1F334}'} Number Jungle {'\u{1F334}'}</div>
            <div style={{ fontSize: 'clamp(32px, 7vw, 52px)', marginBottom: '24px', animation: 'fade-slide-in 0.6s ease 0.2s both' }}>{'\u{1F412}'} {'\u{1F99C}'} {'\u{1F438}'} {'\u{1F98E}'} {'\u{1F422}'}</div>
            <div style={{ animation: 'fade-slide-in 0.6s ease 0.4s both' }}><MascotGuide message="Welcome to the jungle! Let's count, add, and subtract with our animal friends!" speaking={isSpeaking} /></div>
            <div style={{ marginTop: '24px', animation: 'fade-slide-in 0.6s ease 0.6s both' }}>
              <BigButton onClick={() => { speak("Into the Jungle! Let's go!"); startGame(); }} label="Into the Jungle!" icon={'\u{1F333}'} size="lg" />
            </div>
          </div>
        </div>
      </GameShell>
    );
  }

  if (state.phase === 'celebrate') {
    return (
      <GameShell title="Number Jungle" onBack={onBack}>
        <div style={jungleBg}>
          <div style={vineDecoration('left')} /><div style={vineDecoration('right')} />
          <ConfettiBlast trigger={true} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', padding: '24px', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 'clamp(36px, 8vw, 52px)', fontFamily: 'var(--font-display, "Andika", sans-serif)', fontWeight: 700, color: '#FFD700', textShadow: '2px 2px 4px rgba(0,0,0,0.4)', textAlign: 'center', marginBottom: '16px', animation: 'celebrate-bounce 0.8s ease both' }}>{'\u{1F389}'} Jungle Champion! {'\u{1F389}'}</div>
            <div style={{ fontSize: 'clamp(32px, 6vw, 48px)', marginBottom: '20px', display: 'flex', gap: '8px' }}>
              {NJ_JUNGLE_ANIMALS.slice(0, 5).map((a, i) => (<span key={i} style={{ display: 'inline-block', animation: `nj-wiggle 0.6s ease ${i * 0.12}s infinite` }}>{a}</span>))}
            </div>
            <StarRating stars={state.stars} />
            <div style={{ marginTop: '16px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '16px', padding: '20px 32px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              <div style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontFamily: 'var(--font-display, "Andika", sans-serif)', fontWeight: 700, color: '#2E7D32', marginBottom: '8px' }}>Problems Solved</div>
              <div style={{ fontSize: 'clamp(32px, 7vw, 48px)', fontWeight: 800, color: '#1B5E20', fontFamily: 'var(--font-display, "Andika", sans-serif)' }}>{state.score.correct} / {state.score.total}</div>
            </div>
            <MascotGuide message="Amazing jungle adventure! You are a number champion!" speaking={isSpeaking} />
            <div style={{ marginTop: '20px' }}>
              <BigButton onClick={() => { if (onComplete) onComplete({ stars: state.stars, correct: state.score.correct, total: state.score.total }); }} label="Back to Hub" icon={'\u{1F3E0}'} size="lg" />
            </div>
          </div>
        </div>
      </GameShell>
    );
  }

  const phaseLabel = state.phase === 'demonstrate' ? 'Watch & Learn' : state.phase === 'guided' ? `Guided (${guidedIndex + 1}/2)` : `Problem ${Math.min(state.currentItem + 1, 10)}/10`;
  const njProgressCurrent = state.phase === 'demonstrate' ? 0 : state.phase === 'guided' ? guidedIndex : state.currentItem;
  const njProgressTotal = state.phase === 'demonstrate' ? 1 : state.phase === 'guided' ? 2 : 10;

  return (
    <GameShell title="Number Jungle" onBack={onBack}>
      <div style={{ ...jungleBg, padding: '0' }}>
        <div style={vineDecoration('left')} /><div style={vineDecoration('right')} />
        <ConfettiBlast trigger={showConfetti} />
        <div style={{ display: 'flex', flexDirection: 'row', minHeight: 'calc(100vh - 80px)', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 4px', minWidth: '56px' }}>
            <NJVineTracker current={correctCount} total={totalProblems} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '320px' }}>
              <div style={{ color: '#FFFFFF', fontFamily: 'var(--font-body, "Nunito", sans-serif)', fontWeight: 700, fontSize: 'clamp(14px, 2.5vw, 18px)', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>{phaseLabel} {'\u{1F3AF}'} Level {difficulty}</div>
              {state.phase === 'independent' && (<div style={{ width: '100%' }}><ProgressBar current={njProgressCurrent} total={njProgressTotal} /></div>)}
            </div>
            {problem && (
              <div style={{ backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: '24px', padding: 'clamp(16px, 3vw, 28px)', boxShadow: '0 6px 24px rgba(0,0,0,0.2)', width: '100%', maxWidth: '420px', textAlign: 'center', animation: 'fade-slide-in 0.4s ease both' }}>
                <div style={{ fontSize: 'clamp(16px, 3vw, 22px)', fontFamily: 'var(--font-display, "Andika", sans-serif)', fontWeight: 700, color: '#2E7D32', marginBottom: '12px' }}>
                  {problem.mode === 'COUNTING' && 'Count the Animals!'}{problem.mode === 'ADDITION' && 'Add Them Up!'}{problem.mode === 'SUBTRACTION' && 'How Many Are Left?'}
                </div>
                <div style={{ marginBottom: '16px', minHeight: '80px' }}>
                  {problem.mode === 'COUNTING' && <NJEmojiGrid emoji={problem.emoji} count={problem.count} animationClass={animClass} />}
                  {problem.mode === 'ADDITION' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: 'rgba(46,125,50,0.1)', border: '2px dashed #4CAF50' }}><NJEmojiGrid emoji={problem.emoji} count={problem.a} animationClass={animClass} /></div>
                      <span style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#2E7D32' }}>+</span>
                      <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: 'rgba(46,125,50,0.1)', border: '2px dashed #4CAF50', animation: feedback === 'correct' ? 'nj-merge 0.6s ease both' : 'none', '--merge-from': '20px' }}><NJEmojiGrid emoji={problem.emoji} count={problem.b} animationClass={animClass} /></div>
                      <span style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#2E7D32' }}>= ?</span>
                    </div>
                  )}
                  {problem.mode === 'SUBTRACTION' && (
                    <div>
                      <NJEmojiGrid emoji={problem.emoji} count={problem.a - problem.b} animationClass={animClass} swingAwayCount={feedback === null || feedback === 'wrong' ? problem.b : 0} />
                      <div style={{ marginTop: '8px', fontSize: 'clamp(18px, 3.5vw, 24px)', fontWeight: 700, color: '#5C4033', fontFamily: 'var(--font-display, "Andika", sans-serif)' }}>{problem.a} - {problem.b} = ?</div>
                    </div>
                  )}
                </div>
                {feedback === 'correct' && (<div style={{ fontSize: 'clamp(36px, 8vw, 56px)', fontWeight: 800, color: '#4CAF50', fontFamily: 'var(--font-display, "Andika", sans-serif)', animation: 'nj-grow 0.6s ease both' }}>{problem.answer}</div>)}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(12px, 3vw, 24px)', marginTop: '12px' }}>
                  {problem.options.map((opt) => (
                    <NJNumberButton key={opt} value={opt} onClick={handleAnswer} disabled={subPhase !== 'answering'}
                      feedback={selectedAnswer === opt ? feedback : feedback === 'correct' && opt === problem.answer ? 'correct' : null} />
                  ))}
                </div>
              </div>
            )}
            {!problem && (<div style={{ color: '#FFFFFF', fontSize: 'clamp(20px, 4vw, 28px)', fontFamily: 'var(--font-display, "Andika", sans-serif)', textShadow: '1px 1px 2px rgba(0,0,0,0.3)', animation: 'fade-slide-in 0.4s ease both' }}>Get ready... {'\u{1F412}'}</div>)}
            <div style={{ marginTop: '8px' }}><MascotGuide message={mascotMessage} speaking={isSpeaking} /></div>
          </div>
        </div>
      </div>
    </GameShell>
  );
}

// ============================================================================
// 11. HUB: GameHub (default export)
// ============================================================================

const HUB_GAMES = [
  { id: 'letter-launch', key: 'letterLaunch', emoji: '\u{1F680}', name: 'Letter Launch', tagline: 'Listen & Launch!', subject: 'Phonics', component: LetterLaunch, position: { left: '12%', top: '22%' }, bgColor: '#FFE0D0', accentColor: '#E8734A', scene: 'launchpad' },
  { id: 'sound-safari', key: 'soundSafari', emoji: '\u{1F981}', name: 'Sound Safari', tagline: 'Find the Sound!', subject: 'Phoneme Matching', component: SoundSafari, position: { left: '35%', top: '45%' }, bgColor: '#FFF3D0', accentColor: '#D4A017', scene: 'tent' },
  { id: 'word-river', key: 'wordRiver', emoji: '\u{1F30A}', name: 'Word River', tagline: 'Build Words!', subject: 'Spelling', component: WordRiver, position: { left: '55%', top: '25%' }, bgColor: '#D0EAFF', accentColor: '#4A90D9', scene: 'river' },
  { id: 'story-sparks', key: 'storySparks', emoji: '\u{1F4DA}', name: 'Story Sparks', tagline: 'Read & Discover!', subject: 'Comprehension', component: StorySparks, position: { left: '75%', top: '48%' }, bgColor: '#E8D8F8', accentColor: '#8B5CF6', scene: 'treehouse' },
  { id: 'number-jungle', key: 'numberJungle', emoji: '\u{1F522}', name: 'Number Jungle', tagline: 'Count & Solve!', subject: 'Math', component: NumberJungle, position: { left: '88%', top: '28%' }, bgColor: '#D0F5D0', accentColor: '#6BC06B', scene: 'jungle' },
];

const HUB_DEFAULT_PROGRESS = {
  letterLaunch: { stars: 0, played: false }, soundSafari: { stars: 0, played: false },
  wordRiver: { stars: 0, played: false }, storySparks: { stars: 0, played: false },
  numberJungle: { stars: 0, played: false },
};

const HUB_LEVEL_BADGES = [
  { minStars: 0, label: 'Beginner', emoji: '\u{1F331}' }, { minStars: 3, label: 'Explorer', emoji: '\u{1F9ED}' },
  { minStars: 6, label: 'Adventurer', emoji: '\u{2B50}' }, { minStars: 10, label: 'Champion', emoji: '\u{1F3C6}' },
  { minStars: 14, label: 'Master', emoji: '\u{1F451}' },
];

function hubGetLevelBadge(totalStars) {
  let badge = HUB_LEVEL_BADGES[0];
  for (const b of HUB_LEVEL_BADGES) { if (totalStars >= b.minStars) badge = b; }
  return badge;
}

const HUB_STYLES = `
  @keyframes cloud-drift { 0% { transform: translateX(0); } 100% { transform: translateX(40px); } }
  @keyframes sun-pulse { 0% { transform: scale(1); opacity: 0.95; } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 0.95; } }
  @keyframes path-dash { 0% { stroke-dashoffset: 20; } 100% { stroke-dashoffset: 0; } }
  @keyframes card-appear { 0% { opacity: 0; transform: translateY(30px) scale(0.8); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes zoom-in { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }
  @keyframes zoom-out-in { 0% { transform: scale(0.3); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  @keyframes title-glow { 0% { text-shadow: 0 2px 8px rgba(232, 115, 74, 0.3); } 50% { text-shadow: 0 2px 16px rgba(232, 115, 74, 0.5); } 100% { text-shadow: 0 2px 8px rgba(232, 115, 74, 0.3); } }
  .hub-game-card:hover { transform: translateY(-6px) scale(1.05) !important; box-shadow: 0 8px 24px rgba(45, 27, 20, 0.2) !important; }
  .hub-game-card:active { transform: translateY(-2px) scale(0.98) !important; }
  .hub-name-input { background: transparent; border: none; border-bottom: 2px dashed rgba(255,255,255,0.6); color: #FFFFFF; font-family: var(--font-display, 'Andika', sans-serif); font-size: clamp(22px, 5vw, 34px); font-weight: 700; text-align: center; outline: none; padding: 2px 8px; max-width: 200px; }
  .hub-name-input:focus { border-bottom-color: #FFD700; }
`;

function HubWorldBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }} aria-hidden="true">
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #87CEEB 0%, #B0E0FF 40%, #E8F4FD 70%, #C8E6C9 85%, #A5D6A7 100%)' }} />
      <div style={{ position: 'absolute', top: '5%', right: '10%', width: 'clamp(60px, 10vw, 100px)', height: 'clamp(60px, 10vw, 100px)', borderRadius: '50%', background: 'radial-gradient(circle, #FFE082 0%, #FFD54F 40%, #FFB300 100%)', boxShadow: '0 0 40px 20px rgba(255, 213, 79, 0.4), 0 0 80px 40px rgba(255, 183, 0, 0.15)', animation: 'sun-pulse 4s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', top: '10%', left: '15%', animation: 'cloud-drift 8s ease-in-out infinite alternate' }}>
        <div style={{ width: '100px', height: '40px', borderRadius: '40px', background: 'rgba(255,255,255,0.85)', position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: '15px', left: '20px', width: '50px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.85)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '45px', width: '40px', height: '35px', borderRadius: '50%', background: 'rgba(255,255,255,0.85)' }} />
        </div>
      </div>
      <div style={{ position: 'absolute', top: '18%', left: '55%', animation: 'cloud-drift 10s ease-in-out infinite alternate-reverse' }}>
        <div style={{ width: '120px', height: '45px', borderRadius: '45px', background: 'rgba(255,255,255,0.75)', position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: '18px', left: '25px', width: '55px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,0.75)' }} />
          <div style={{ position: 'absolute', bottom: '12px', left: '55px', width: '42px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.75)' }} />
        </div>
      </div>
      <div style={{ position: 'absolute', top: '8%', left: '75%', animation: 'cloud-drift 12s ease-in-out infinite alternate', opacity: 0.6 }}>
        <div style={{ width: '80px', height: '32px', borderRadius: '32px', background: 'rgba(255,255,255,0.8)', position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: '12px', left: '15px', width: '40px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)' }} />
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: '-5%', right: '-5%', height: '45%', background: 'radial-gradient(ellipse 60% 80% at 20% 0%, #81C784 0%, transparent 70%), radial-gradient(ellipse 50% 90% at 50% 0%, #66BB6A 0%, transparent 70%), radial-gradient(ellipse 55% 75% at 80% 0%, #81C784 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '-5%', right: '-5%', height: '35%', background: 'radial-gradient(ellipse 45% 100% at 10% 0%, #4CAF50 0%, transparent 65%), radial-gradient(ellipse 40% 100% at 40% 10%, #66BB6A 0%, transparent 60%), radial-gradient(ellipse 50% 100% at 70% 5%, #4CAF50 0%, transparent 65%), radial-gradient(ellipse 35% 100% at 95% 0%, #66BB6A 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '15%', background: 'linear-gradient(180deg, #4CAF50 0%, #388E3C 100%)' }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 1000 600" preserveAspectRatio="none">
        <path d="M 80,180 C 180,250 280,320 350,300 C 420,280 480,200 550,190 C 620,180 700,300 750,310 C 800,320 850,220 900,200" fill="none" stroke="#D2B48C" strokeWidth="18" strokeLinecap="round" strokeDasharray="4 12" opacity="0.6" />
        <path d="M 80,180 C 180,250 280,320 350,300 C 420,280 480,200 550,190 C 620,180 700,300 750,310 C 800,320 850,220 900,200" fill="none" stroke="#C4A882" strokeWidth="10" strokeLinecap="round" opacity="0.4" />
      </svg>
      {[{ left: '5%', bottom: '22%', size: 30 }, { left: '25%', bottom: '30%', size: 25 }, { left: '45%', bottom: '18%', size: 35 }, { left: '65%', bottom: '25%', size: 28 }, { left: '92%', bottom: '20%', size: 32 }].map((tree, i) => (
        <div key={i} style={{ position: 'absolute', left: tree.left, bottom: tree.bottom, width: `${tree.size}px`, height: `${tree.size * 1.5}px`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: `${tree.size}px`, height: `${tree.size}px`, borderRadius: '50%', background: i % 2 === 0 ? 'radial-gradient(circle at 40% 40%, #66BB6A, #2E7D32)' : 'radial-gradient(circle at 40% 40%, #81C784, #388E3C)' }} />
          <div style={{ width: `${tree.size * 0.2}px`, height: `${tree.size * 0.5}px`, background: '#795548', borderRadius: '2px', marginTop: '-4px' }} />
        </div>
      ))}
    </div>
  );
}

function HubGameCard({ game, stars, played, onClick, index }) {
  return (
    <button type="button" className="hub-game-card" onClick={onClick} aria-label={`Play ${game.name} - ${game.tagline} - ${stars} stars earned`}
      style={{
        position: 'absolute', left: game.position.left, top: game.position.top, transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        padding: '14px 16px', minWidth: '130px', minHeight: '130px',
        background: `linear-gradient(135deg, ${game.bgColor} 0%, #FFFFFF 100%)`,
        border: `3px solid ${game.accentColor}`, borderRadius: 'var(--radius-lg, 24px)',
        boxShadow: 'var(--shadow-medium, 0 4px 16px rgba(45, 27, 20, 0.15))',
        cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        animation: `card-appear 0.5s ease ${index * 0.12}s both`,
        fontFamily: 'var(--font-body, "Nunito", sans-serif)', zIndex: 2,
        WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
      }}>
      <span style={{ fontSize: 'clamp(36px, 7vw, 48px)', lineHeight: 1 }} aria-hidden="true">{game.emoji}</span>
      <span style={{ fontFamily: 'var(--font-display, "Andika", sans-serif)', fontWeight: 700, fontSize: 'clamp(13px, 2.5vw, 16px)', color: 'var(--text-primary, #2D1B14)', lineHeight: 1.2, textAlign: 'center' }}>{game.name}</span>
      <span style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: 'var(--text-secondary, #5C4033)', lineHeight: 1.2, textAlign: 'center' }}>{game.tagline}</span>
      <div style={{ transform: 'scale(0.65)', transformOrigin: 'center', marginTop: '-4px', marginBottom: '-8px' }}><StarRating stars={stars} /></div>
      <span style={{ fontSize: '10px', fontWeight: 600, color: '#FFFFFF', background: game.accentColor, padding: '2px 8px', borderRadius: '10px', letterSpacing: '0.3px' }}>{game.subject}</span>
    </button>
  );
}

function HubEditableName({ name, onChangeName, onCommit }) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => { if (editing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); } }, [editing]);
  const handleCommit = useCallback(() => {
    setEditing(false);
    const trimmed = name.trim();
    if (trimmed.length === 0) { onChangeName('Explorer'); onCommit('Explorer'); } else { onCommit(trimmed); }
  }, [name, onChangeName, onCommit]);

  if (editing) {
    return (
      <input ref={inputRef} className="hub-name-input" value={name}
        onChange={(e) => onChangeName(e.target.value.slice(0, 20))}
        onBlur={handleCommit} onKeyDown={(e) => { if (e.key === 'Enter') handleCommit(); }}
        aria-label="Edit your name" maxLength={20} />
    );
  }
  return (
    <span onClick={() => setEditing(true)} onKeyDown={(e) => { if (e.key === 'Enter') setEditing(true); }}
      tabIndex={0} role="button" aria-label={`Your name is ${name}. Tap to change.`}
      style={{ cursor: 'pointer', borderBottom: '2px dashed rgba(255,255,255,0.5)', paddingBottom: '2px', transition: 'border-color 0.2s' }}>
      {name}
    </span>
  );
}

export default function GameHub() {
  const [playerName, setPlayerName] = useState('Explorer');
  const [gameProgress, setGameProgress] = useState(HUB_DEFAULT_PROGRESS);
  const [currentGame, setCurrentGame] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [transitioning, setTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState(null);
  const [returningToHub, setReturningToHub] = useState(false);
  const [nameJustSet, setNameJustSet] = useState(false);

  const previousStarsRef = useRef(0);
  const { speak } = useTextToSpeech();

  const totalStars = useMemo(() => Object.values(gameProgress).reduce((sum, g) => sum + g.stars, 0), [gameProgress]);
  const levelBadge = useMemo(() => hubGetLevelBadge(totalStars), [totalStars]);

  useEffect(() => { FONT_LOADER(); }, []);
  useEffect(() => { previousStarsRef.current = totalStars; }, [totalStars]);
  useEffect(() => { if (nameJustSet) { speak(`Welcome, ${playerName}! Where shall we explore today?`); setNameJustSet(false); } }, [nameJustSet, playerName, speak]);

  const handleNameCommit = useCallback(() => { setNameJustSet(true); }, []);

  const handleGameSelect = useCallback((gameId) => {
    setTransitioning(true); setTransitionTarget(gameId);
    setTimeout(() => { setCurrentGame(gameId); setTransitioning(false); setTransitionTarget(null); }, 500);
  }, []);

  const handleGameComplete = useCallback(({ stars, correct, total }) => {
    const game = HUB_GAMES.find((g) => g.id === currentGame);
    if (!game) return;
    const prevStars = gameProgress[game.key].stars;
    const newStars = Math.max(prevStars, stars);
    const starsGained = newStars - prevStars;
    setGameProgress((prev) => ({ ...prev, [game.key]: { stars: newStars, played: true } }));
    setReturningToHub(true); setCurrentGame(null);
    setTimeout(() => {
      setReturningToHub(false);
      if (starsGained > 0) {
        setShowCelebration(true); SFX.celebrate();
        const starWord = starsGained === 1 ? 'star' : 'stars';
        setCelebrationMessage(`Amazing! You earned ${starsGained} new ${starWord} in ${game.name}!`);
        speak(`Amazing! You earned ${starsGained} new ${starWord} in ${game.name}!`);
        setTimeout(() => { setShowCelebration(false); setCelebrationMessage(''); }, 3500);
      }
    }, 400);
  }, [currentGame, gameProgress, speak]);

  const handleGameBack = useCallback(() => {
    setReturningToHub(true); setCurrentGame(null);
    setTimeout(() => { setReturningToHub(false); }, 400);
  }, []);

  if (currentGame) {
    const game = HUB_GAMES.find((g) => g.id === currentGame);
    if (game && game.component) {
      const GameComponent = game.component;
      return (<><style>{`:root { ${CSS_VARIABLES} } ${GLOBAL_STYLES} ${HUB_STYLES}`}</style><GameComponent onComplete={handleGameComplete} onBack={handleGameBack} /></>);
    }
    return (
      <><style>{`:root { ${CSS_VARIABLES} } ${GLOBAL_STYLES} ${HUB_STYLES}`}</style>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', background: 'var(--bg-primary)', fontFamily: 'var(--font-body)', padding: '24px', textAlign: 'center' }}>
          <span style={{ fontSize: '64px' }}>{game.emoji}</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 5vw, 36px)', color: 'var(--text-primary)' }}>{game.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>Coming soon!</p>
          <BigButton onClick={handleGameBack} label="Back to Hub" icon={'\u2190'} size="lg" variant="primary" />
        </div>
      </>
    );
  }

  let zoomOrigin = 'center center';
  if (transitionTarget) { const targetGame = HUB_GAMES.find((g) => g.id === transitionTarget); if (targetGame) zoomOrigin = `${targetGame.position.left} ${targetGame.position.top}`; }

  return (
    <>
      <style>{`:root { ${CSS_VARIABLES} } ${GLOBAL_STYLES} ${HUB_STYLES}`}</style>
      <ConfettiBlast trigger={showCelebration} />
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
        fontFamily: 'var(--font-body)', transformOrigin: zoomOrigin,
        animation: transitioning ? 'zoom-in 0.5s ease-in forwards' : returningToHub ? 'zoom-out-in 0.4s ease-out forwards' : 'none',
      }}>
        <HubWorldBackground />
        <header style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 20px 12px', background: 'linear-gradient(180deg, rgba(45, 27, 20, 0.35) 0%, transparent 100%)' }}>
          <h1 style={{
            fontFamily: 'var(--font-display, "Andika", sans-serif)', fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 700,
            color: '#FFFFFF', textShadow: '0 2px 8px rgba(45, 27, 20, 0.4), 0 0 24px rgba(232, 115, 74, 0.3)',
            display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center',
            lineHeight: 1.3, animation: 'title-glow 3s ease-in-out infinite', margin: 0,
          }}>
            <span aria-hidden="true">{'\u{1F31F}'}</span>
            <HubEditableName name={playerName} onChangeName={setPlayerName} onCommit={handleNameCommit} />
            <span>'s Learning World</span>
          </h1>
        </header>

        <div style={{ flex: 1, position: 'relative', zIndex: 1, minHeight: '400px' }}>
          <div style={{ position: 'absolute', left: '12%', top: '35%', transform: 'translate(-50%, 0)', width: '60px', height: '30px', background: 'linear-gradient(0deg, #888 0%, #BBB 100%)', borderRadius: '4px 4px 0 0', zIndex: 1, opacity: 0.5 }} aria-hidden="true" />
          <div style={{ position: 'absolute', left: '35%', top: '58%', transform: 'translate(-50%, 0)', width: 0, height: 0, borderLeft: '25px solid transparent', borderRight: '25px solid transparent', borderBottom: '35px solid #D4A017', zIndex: 1, opacity: 0.4 }} aria-hidden="true" />
          <div style={{ position: 'absolute', left: '55%', top: '38%', transform: 'translate(-50%, 0)', width: '80px', height: '20px', background: 'linear-gradient(90deg, rgba(74, 144, 217, 0.3), rgba(74, 144, 217, 0.5), rgba(74, 144, 217, 0.3))', borderRadius: '50%', zIndex: 1, animation: 'wave-motion 3s ease-in-out infinite' }} aria-hidden="true" />
          <div style={{ position: 'absolute', left: '75%', top: '60%', transform: 'translate(-50%, 0)', zIndex: 1, opacity: 0.4 }} aria-hidden="true">
            <div style={{ width: '8px', height: '40px', background: '#795548', margin: '0 auto' }} />
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#388E3C', marginTop: '-45px' }} />
          </div>
          <div style={{ position: 'absolute', left: '88%', top: '40%', transform: 'translate(-50%, 0)', zIndex: 1, opacity: 0.4 }} aria-hidden="true">
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #66BB6A, #1B5E20)' }} />
            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'radial-gradient(circle at 60% 40%, #81C784, #2E7D32)', marginTop: '-15px', marginLeft: '10px' }} />
          </div>
          {HUB_GAMES.map((game, index) => (
            <HubGameCard key={game.id} game={game} stars={gameProgress[game.key].stars} played={gameProgress[game.key].played} onClick={() => handleGameSelect(game.id)} index={index} />
          ))}
        </div>

        {showCelebration && (
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, pointerEvents: 'none' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: 'var(--radius-lg, 24px)', padding: '32px 40px', boxShadow: '0 8px 32px rgba(45, 27, 20, 0.25)', textAlign: 'center', animation: 'celebrate-bounce 0.6s ease', maxWidth: '90vw' }} role="alert" aria-live="assertive">
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>{'\u{1F389}'}</div>
              <p style={{ fontFamily: 'var(--font-display, "Andika", sans-serif)', fontSize: 'clamp(18px, 4vw, 26px)', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>{celebrationMessage}</p>
            </div>
          </div>
        )}

        <footer style={{ position: 'relative', zIndex: 10, padding: '12px 20px 16px', background: 'linear-gradient(0deg, rgba(45, 27, 20, 0.4) 0%, transparent 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.9)', padding: '6px 16px', borderRadius: 'var(--radius-md, 16px)', boxShadow: 'var(--shadow-soft)' }}>
            <span style={{ fontSize: '20px' }} aria-hidden="true">{levelBadge.emoji}</span>
            <span style={{ fontFamily: 'var(--font-display, "Andika", sans-serif)', fontWeight: 700, fontSize: 'clamp(14px, 2.5vw, 18px)', color: 'var(--text-primary)' }}>{levelBadge.label}</span>
          </div>
          <div style={{ width: '100%', maxWidth: '400px', background: 'rgba(255, 255, 255, 0.85)', padding: '10px 16px', borderRadius: 'var(--radius-md, 16px)', boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ textAlign: 'center', fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>{'\u{2B50}'} Total Stars</div>
            <ProgressBar current={totalStars} total={15} />
          </div>
        </footer>
      </div>
    </>
  );
}
