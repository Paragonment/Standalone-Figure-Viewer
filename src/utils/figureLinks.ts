import type { FigureGroup } from '../types';
import { figureKey } from './figureKey';

// The notes of a figure name other figures of the same dance ("Precede:
// Bronze - Natural Turn, 4-6 Natural Turn after Back Lock or Progressive
// Chasse to R"). This finds those names, so the reader can follow them.
//
// Matching is deliberately plain: a figure's name, written the way the book
// writes it, between word boundaries, case-sensitive. The longest name wins
// at any one place, so "Natural Spin Turn" and "Natural Turn with Hesitation"
// are not read as "Natural Turn". Everything else in the sentence ("4-6",
// "Bronze -", "after") stays text. Beyond the exact name there are only the
// two spellings in NAME_VARIANTS; add a variant there, not fuzzy matching.

export interface NoteSegment {
  text: string;
  // Set when the text names a figure.
  figure?: FigureGroup;
}

// A name followed by "Position" is a position, not the figure: "ends in Fan
// Position", "Promenade Position".
const POSITION_AFTER = String.raw`(?!\s+Positions?(?![A-Za-z0-9]))`;

// "Progressive Chasse to R" is the book's shorthand for "... to Right".
const SIDE_WORDS: Array<[short: string, long: string]> = [
  ['L', 'Left'],
  ['R', 'Right'],
];

const PARENTHETICAL = /\s*\([^()]*\)\s*$/;

// Other spellings of a figure's name that the notes use for it.
const NAME_VARIANTS: Array<(name: string) => string[]> = [
  // "Reverse Turn (Incorporating Feather Finish)" is noted as "Reverse Turn".
  (name) => (PARENTHETICAL.test(name) ? [name.replace(PARENTHETICAL, '')] : []),
  // A trailing side, short or long: "Spot Turn to L" <-> "Spot Turn to Left".
  (name) =>
    SIDE_WORDS.flatMap(([short, long]) => {
      const base = name.replace(PARENTHETICAL, '');
      if (base.endsWith(` to ${long}`)) return [`${base.slice(0, -long.length)}${short}`];
      if (base.endsWith(` to ${short}`)) return [`${base.slice(0, -short.length)}${long}`];
      return [];
    }),
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

interface Matcher {
  pattern: RegExp;
  byPhrase: Map<string, FigureGroup>;
}

// Every phrase that names a figure. A phrase that two figures could claim
// (a variant that is another figure's variant too) names neither; a phrase
// that is a figure's own name always names that figure.
const phrasesOf = (figures: FigureGroup[]): Map<string, FigureGroup> => {
  const exact = new Map(figures.map((figure) => [figure.name, figure]));
  const claims = new Map<string, FigureGroup[]>();
  figures.forEach((figure) => {
    NAME_VARIANTS.flatMap((variant) => variant(figure.name)).forEach((phrase) => {
      if (!exact.has(phrase)) claims.set(phrase, [...(claims.get(phrase) ?? []), figure]);
    });
  });
  const phrases = new Map(exact);
  claims.forEach((claimants, phrase) => {
    if (claimants.length === 1) phrases.set(phrase, claimants[0]);
  });
  return phrases;
};

const matcherCache = new WeakMap<FigureGroup[], Matcher | null>();

const matcherFor = (figures: FigureGroup[]): Matcher | null => {
  if (matcherCache.has(figures)) return matcherCache.get(figures) ?? null;
  const byPhrase = phrasesOf(figures);
  // Longest first, so the alternation prefers "Natural Turn with Hesitation"
  // to "Natural Turn"; the lookarounds keep a match from starting or ending
  // inside a longer word.
  const matcher =
    byPhrase.size === 0
      ? null
      : {
          byPhrase,
          pattern: new RegExp(
            `(?<![A-Za-z0-9])(?:${[...byPhrase.keys()]
              .sort((a, b) => b.length - a.length)
              .map(escape)
              .join('|')})(?![A-Za-z0-9])${POSITION_AFTER}`,
            'g',
          ),
        };
  matcherCache.set(figures, matcher);
  return matcher;
};

// `text` cut into plain stretches and figure names. `figures` are those of
// one dance (a name only means a figure within its own dance); `self`, the
// figure whose notes these are, is never linked to itself. The segments
// always join back into `text`.
export function linkFigures(text: string, figures: FigureGroup[], self?: FigureGroup): NoteSegment[] {
  const matcher = matcherFor(figures);
  const segments: NoteSegment[] = [];
  let plain = '';
  let cursor = 0;

  const flush = () => {
    if (plain) segments.push({ text: plain });
    plain = '';
  };

  if (matcher) {
    for (const match of text.matchAll(matcher.pattern)) {
      const figure = matcher.byPhrase.get(match[0]);
      plain += text.slice(cursor, match.index);
      cursor = match.index + match[0].length;
      if (!figure || (self && figureKey(figure) === figureKey(self))) {
        plain += match[0];
        continue;
      }
      flush();
      segments.push({ text: match[0], figure });
    }
  }
  plain += text.slice(cursor);
  flush();
  return segments;
}
