// Spelling out the shorthand the technique books chart steps in (RF fwd,
// Facing DW, Com to turn R, ...). Only tokens that mean one thing in
// ballroom technique are listed; a bare T, H, B or S stays as written
// because it can be a footwork code, a timing or a label depending on
// where it sits. Add a row to ABBREVIATIONS to teach it a new one.

interface Abbreviation {
  // The shorthand exactly as the books write it.
  short: string;
  // Its meaning, lowercase (it is capitalised at the start of a sentence).
  long: string;
  // A word-like shorthand ("Com", "fwd") that may also appear with a
  // capital first letter. Codes like LF and DW are matched exactly.
  word?: boolean;
}

const ABBREVIATIONS: Abbreviation[] = [
  // Feet
  { short: 'LF', long: 'left foot' },
  { short: 'RF', long: 'right foot' },
  { short: 'R', long: 'right' },
  { short: 'L', long: 'left' },
  // Alignments and directions
  { short: 'LOD', long: 'line of dance' },
  { short: 'DW', long: 'diagonal to wall' },
  { short: 'DC', long: 'diagonal to centre' },
  { short: 'fwd', long: 'forward', word: true },
  { short: 'diag', long: 'diagonal', word: true },
  // Positions and body action
  { short: 'CBMP', long: 'contra body movement position' },
  { short: 'CBM', long: 'contra body movement' },
  { short: 'CPP', long: 'counter promenade position' },
  { short: 'PP', long: 'promenade position' },
  { short: 'OP', long: 'outside partner' },
  // Rise and fall, weight
  { short: 'NFR', long: 'no foot rise' },
  { short: 'e/o', long: 'end of', word: true },
  { short: 'wt', long: 'weight', word: true },
  // Instructions
  { short: 'Com', long: 'commence', word: true },
  { short: 'Cont', long: 'continue', word: true },
  // Parts of the foot
  { short: 'IE of T', long: 'inside edge of toe' },
  { short: 'OE of T', long: 'outside edge of toe' },
  { short: 'IE', long: 'inside edge' },
  { short: 'OE', long: 'outside edge' },
];

// Footwork charted as joined codes, shown hyphenated when spelled out.
export const FOOTWORK_COMBINATIONS: Record<string, string> = {
  HT: 'Heel-Toe',
  TH: 'Toe-Heel',
  BH: 'Ball-Heel',
  HB: 'Heel-Ball',
  THT: 'Toe-Heel-Toe',
  HTH: 'Heel-Toe-Heel',
  BHB: 'Ball-Heel-Ball',
  TTH: 'Toe-Toe-Heel',
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Every spelling a shorthand may take in the data, mapped to its entry.
const LOOKUP = new Map<string, Abbreviation>();
for (const entry of ABBREVIATIONS) {
  LOOKUP.set(entry.short, entry);
  if (entry.word) LOOKUP.set(capitalise(entry.short), entry);
}

// Longest first so "IE of T" wins over "IE" and "CBMP" over "CBM". The
// lookarounds keep a match from starting or ending inside a longer word.
const PATTERN = new RegExp(
  `(?<![A-Za-z0-9])(?:${[...LOOKUP.keys()]
    .sort((a, b) => b.length - a.length)
    .map(escape)
    .join('|')})(?![A-Za-z0-9])`,
  'g',
);

const SENTENCE_START = /(?:^|[.!?]\s+)$/;

export function expandAbbreviations(text: string): string {
  return text.replace(PATTERN, (token, offset: number) => {
    const entry = LOOKUP.get(token);
    if (!entry) return token;
    const atStart = SENTENCE_START.test(text.slice(0, offset));
    const capitalised = atStart || (entry.word === true && token !== entry.short);
    return capitalised ? capitalise(entry.long) : entry.long;
  });
}
