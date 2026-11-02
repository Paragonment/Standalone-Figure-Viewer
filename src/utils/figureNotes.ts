// A figure's General Notes are free text. The books label some sentences
// ("Precede: ...", "Follow: ...", "Alternative endings: ..."); the About
// band shows those as their own rows and everything else as the description.

export type NoteLabel = 'Endings' | 'Preceded by' | 'Followed by';

// One line of a row. The books give what precedes or follows by level
// ("Bronze - Natural Turn; Silver, Gold - Wing"); `levels` is that prefix,
// empty when the line is not about a level.
export interface NoteEntry {
  levels: string[];
  text: string;
}

export interface NoteRow {
  label: NoteLabel;
  entries: NoteEntry[];
}

export interface FigureNotes {
  description: string;
  rows: NoteRow[];
}

// Whether there is anything to show for a figure.
export const hasNotes = (notes: FigureNotes): boolean => notes.description !== '' || notes.rows.length > 0;

const ROW_ORDER: NoteLabel[] = ['Endings', 'Preceded by', 'Followed by'];

const LABEL_WORD = /^(?:ISTD alternative endings?|Alternative endings?|Endings?|Precedes?|Follows?)/;

// A label word, an optional qualifier ("ending A", "(ending in Open CPP)"
// or "LF Cuban Rock") and a colon, at the start of a sentence.
const LABEL =
  /(?<=^|[.;!?]\s+)(?:ISTD alternative endings?|Alternative endings?|Endings?|Precedes?|Follows?)(?:\s+[A-Za-z0-9][A-Za-z0-9 ]{0,30})?(?:\s*\([^()]{0,60}\))?\s*:/g;

const labelFor = (head: string): { label: NoteLabel; qualifier: string } => {
  const word = LABEL_WORD.exec(head)?.[0] ?? '';
  const label: NoteLabel = word.startsWith('Precede') ? 'Preceded by' : word.startsWith('Follow') ? 'Followed by' : 'Endings';
  // Anything between the label word and the colon qualifies the value.
  const qualifier = head.slice(word.length).replace(/:$/, '').trim();
  return { label, qualifier };
};

// Where a labelled value ends: at the next label, or at the end of its
// sentence (a period before a capital or digit, outside any parentheses).
const valueEnd = (text: string, from: number, limit: number): number => {
  let depth = 0;
  for (let i = from; i < limit; i++) {
    const ch = text[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    else if (ch === '.' && depth === 0 && /^\s[A-Z0-9]/.test(text.slice(i + 1, i + 3))) return i + 1;
  }
  return limit;
};

const LEVEL_NAME = 'Pre-Bronze|Bronze|Silver|Gold';
// "Bronze - ", "Silver, Gold - ", "Bronze and Silver - ": levels, then a dash.
const LEVEL_PREFIX = new RegExp(`^((?:${LEVEL_NAME})(?:\\s*(?:,|&|and)\\s*(?:${LEVEL_NAME}))*)\\s+-\\s+(?=\\S)`);

const capitalise = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

// Cuts a value at the semicolons outside parentheses.
const splitLines = (value: string): string[] => {
  const lines: string[] = [];
  let depth = 0;
  let start = 0;
  [...value].forEach((ch, i) => {
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    else if (ch === ';' && depth === 0) {
      lines.push(value.slice(start, i));
      start = i + 1;
    }
  });
  lines.push(value.slice(start));
  return lines.map((line) => line.trim()).filter(Boolean);
};

const entryOf = (line: string): NoteEntry => {
  const prefix = LEVEL_PREFIX.exec(line);
  if (!prefix) return { levels: [], text: capitalise(line) };
  return { levels: prefix[1].split(/\s*(?:,|&|and)\s*/), text: line.slice(prefix[0].length) };
};

// What precedes and follows is told level by level, a line each; the other
// rows stay whole.
const entriesOf = (label: NoteLabel, value: string): NoteEntry[] =>
  label === 'Endings' ? [{ levels: [], text: capitalise(value) }] : splitLines(value).map(entryOf);

const clean = (text: string): string => text.trim().replace(/[.;,]+$/, '').trim();

// Never drops text: whatever is not a labelled row stays in the description.
export function parseFigureNotes(notes: string): FigureNotes {
  const text = notes.replace(/\s+/g, ' ').trim();
  if (!text) return { description: '', rows: [] };

  const found = [...text.matchAll(LABEL)];
  const values = new Map<NoteLabel, string[]>();
  const outside: string[] = [];
  let cursor = 0;

  found.forEach((match, i) => {
    const start = match.index;
    if (start < cursor) return;
    const bodyStart = start + match[0].length;
    const nextLabel = found[i + 1]?.index ?? text.length;
    const end = valueEnd(text, bodyStart, nextLabel);
    const { label, qualifier } = labelFor(match[0]);
    const body = clean(text.slice(bodyStart, end));
    if (!body) return;

    outside.push(text.slice(cursor, start));
    cursor = end;
    const value = qualifier ? `${qualifier} ${body}` : body;
    values.set(label, [...(values.get(label) ?? []), value]);
  });
  outside.push(text.slice(cursor));

  const rows = ROW_ORDER.filter((label) => values.has(label)).map((label) => {
    return { label, entries: entriesOf(label, (values.get(label) ?? []).join('; ')) };
  });
  const description = outside
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ');
  return { description, rows };
}
