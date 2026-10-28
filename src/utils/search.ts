import type { FigureGroup } from '../types';
import { LEVELS, levelLook } from './levels';

export interface FigureRow {
  figure: FigureGroup;
  // Character range of the query inside the figure name.
  nameMatch?: [number, number];
  // The passage of the notes around the first match.
  snippet?: { pre: string; match: string; post: string };
}

export interface ResultSection {
  key: 'all' | 'names' | 'notes' | 'level';
  heading?: string;
  headingColor?: string;
  count: number;
  rows: FigureRow[];
  tinted?: boolean;
}

export interface BuiltSections {
  sections: ResultSection[];
  // Rows shown across all sections.
  total: number;
  // Figures inside the picked dances and levels, before any query.
  scope: number;
  // One dance, no query: rows are grouped by level and drop their sub line.
  grouped: boolean;
}

const ELLIPSIS = '…';
const SNIPPET_BEFORE = 36;
const SNIPPET_AFTER = 60;

// Search text is compared in a trimmed, whitespace-collapsed, lower-case form.
export const normalizeQuery = (query: string): string => query.trim().replace(/\s+/g, ' ').toLowerCase();

const collapse = (text: string): string => text.replace(/\s+/g, ' ').trim();

// 0 the name starts with the query, 1 a word in it does, 2 it appears inside a word.
const rank = (name: string, at: number): number => {
  if (at === 0) return 0;
  return /[^\p{L}\p{N}]/u.test(name[at - 1]) ? 1 : 2;
};

// The notes around a match: from about 36 characters before to about 60
// after, trimmed to word boundaries, with an ellipsis where text is cut.
const buildSnippet = (text: string, at: number, length: number): NonNullable<FigureRow['snippet']> => {
  let from = Math.max(0, at - SNIPPET_BEFORE);
  if (from > 0) {
    const space = text.indexOf(' ', from);
    if (space !== -1 && space + 1 <= at) from = space + 1;
  }
  let to = Math.min(text.length, at + length + SNIPPET_AFTER);
  if (to < text.length) {
    const space = text.lastIndexOf(' ', to);
    if (space > at + length) to = space;
  }
  return {
    pre: (from > 0 ? ELLIPSIS : '') + text.slice(from, at),
    match: text.slice(at, at + length),
    post: text.slice(at + length, to) + (to < text.length ? ELLIPSIS : ''),
  };
};

export function buildSections({
  figures,
  dances,
  levels,
  query,
}: {
  figures: FigureGroup[];
  dances: string[];
  levels: string[];
  query: string;
}): BuiltSections {
  const inScope = figures.filter(
    (f) => (dances.length === 0 || dances.includes(f.dance)) && (levels.length === 0 || levels.includes(f.level)),
  );
  const scope = inScope.length;
  const needle = normalizeQuery(query);

  if (needle) {
    const named: { figure: FigureGroup; at: number }[] = [];
    const rest: FigureGroup[] = [];
    for (const figure of inScope) {
      const at = figure.name.toLowerCase().indexOf(needle);
      if (at === -1) rest.push(figure);
      else named.push({ figure, at });
    }
    // Array.prototype.sort is stable, so the name order holds inside a rank.
    named.sort((a, b) => rank(a.figure.name, a.at) - rank(b.figure.name, b.at));

    const mentioned: FigureRow[] = [];
    for (const figure of rest) {
      const notes = collapse(figure.generalNotes);
      const at = notes.toLowerCase().indexOf(needle);
      if (at !== -1) mentioned.push({ figure, snippet: buildSnippet(notes, at, needle.length) });
    }

    const sections: ResultSection[] = [];
    if (named.length > 0) {
      sections.push({
        key: 'names',
        heading: 'Names',
        headingColor: 'var(--slate)',
        count: named.length,
        rows: named.map(({ figure, at }) => ({ figure, nameMatch: [at, at + needle.length] as [number, number] })),
      });
    }
    if (mentioned.length > 0) {
      sections.push({
        key: 'notes',
        heading: 'Mentioned in notes',
        headingColor: 'var(--slate)',
        count: mentioned.length,
        rows: mentioned,
        tinted: true,
      });
    }
    return { sections, total: named.length + mentioned.length, scope, grouped: false };
  }

  if (dances.length === 1) {
    const known: readonly string[] = LEVELS;
    const extra = [...new Set(inScope.map((f) => f.level))].filter((l) => !known.includes(l)).sort();
    const sections: ResultSection[] = [...known, ...extra]
      .map((level): ResultSection => {
        const rows = inScope.filter((f) => f.level === level).map((figure) => ({ figure }));
        return { key: 'level', heading: level, headingColor: levelLook(level).text, count: rows.length, rows };
      })
      .filter((s) => s.rows.length > 0);
    return { sections, total: inScope.length, scope, grouped: true };
  }

  return {
    sections: [{ key: 'all', count: inScope.length, rows: inScope.map((figure) => ({ figure })) }],
    total: inScope.length,
    scope,
    grouped: false,
  };
}
