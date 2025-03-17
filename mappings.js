// Character mappings
const engToUkrMapping = {
  q: "й",
  w: "ц",
  e: "у",
  r: "к",
  t: "е",
  y: "н",
  u: "г",
  i: "ш",
  o: "щ",
  p: "з",
  "[": "х",
  "]": "ї",
  a: "ф",
  s: "і",
  d: "в",
  f: "а",
  g: "п",
  h: "р",
  j: "о",
  k: "л",
  l: "д",
  ";": "ж",
  "'": "є",
  z: "я",
  x: "ч",
  c: "с",
  v: "м",
  b: "и",
  n: "т",
  m: "ь",
  ",": "б",
  ".": "ю",
  "/": ".",
  "`": "ё",
  // Uppercase mappings
  Q: "Й",
  W: "Ц",
  E: "У",
  R: "К",
  T: "Е",
  Y: "Н",
  U: "Г",
  I: "Ш",
  O: "Щ",
  P: "З",
  "{": "Х",
  "}": "Ї",
  A: "Ф",
  S: "І",
  D: "В",
  F: "А",
  G: "П",
  H: "Р",
  J: "О",
  K: "Л",
  L: "Д",
  ":": "Ж",
  '"': "Є",
  Z: "Я",
  X: "Ч",
  C: "С",
  V: "М",
  B: "И",
  N: "Т",
  M: "Ь",
  "<": "Б",
  ">": "Ю",
  "?": ",",
  "~": "Ё",
};

// Creating reverse mapping for Ukrainian to English
const ukrToEngMapping = {};
for (const [eng, ukr] of Object.entries(engToUkrMapping)) {
  ukrToEngMapping[ukr] = eng;
}

// Function to detect if a character is in the English layout
function isEnglishChar(char) {
  return Object.keys(engToUkrMapping).includes(char);
}

// Function to detect if a character is in the Ukrainian layout
function isUkrainianChar(char) {
  return Object.keys(ukrToEngMapping).includes(char);
}

// Function to determine direction based on the first letter
function detectDirection(text) {
  if (!text || text.length === 0) return "engToUkr"; // Default
  
  const firstChar = text.charAt(0);
  if (isEnglishChar(firstChar)) return "engToUkr";
  if (isUkrainianChar(firstChar)) return "ukrToEng";
  
  // If can't determine, default to English to Ukrainian
  return "engToUkr";
}

// Function to convert text between layouts
function convertText(text, direction) {
  const mapping = direction === "engToUkr" ? engToUkrMapping : ukrToEngMapping;
  return Array.from(text)
    .map((char) => mapping[char] || char)
    .join("");
}

// Remove duplicated context menu creation and handlers from here
// They should only exist in background.js
