// What a figure can be danced after and before. Each style's transitions
// CSV holds the book's Precede and Follow lists one link per row; the text
// the app shows is built from those rows per figure, the first time the
// figure asks for it, and kept.
import type { FigureGroup, FigureLink, Relation } from '../types';
import { LEVELS } from './levels';

export const TRANSITION_COLUMNS = [
  'Dance',
  'Figure Name',
  'Relation',
  'Level',
  'Condition',
  'Steps',
  'Linked Figure',
  'Linked Steps',
  'Same As',
  'Details',
] as const;

const RELATIONS: readonly Relation[] = ['Preceded By', 'Followed By'];

export interface TransitionRecord {
  dance: string;
  figure: string;
  link: FigureLink;
}

// Rows of a transitions CSV as links. A missing column or an unknown
// relation is an error, not a silently shorter list.
export function readTransitionRows(rows: Record<string, string>[], columns: string[], file: string): TransitionRecord[] {
  const missing = TRANSITION_COLUMNS.filter((c) => !columns.includes(c));
  if (missing.length > 0) throw new Error(`${file} has no ${missing.join(', ')} column`);
  return rows.map((row, i) => {
    const relation = RELATIONS.find((r) => r === row.Relation);
    // Row 1 is the header.
    if (!relation) throw new Error(`${file} row ${i + 2}: unknown Relation "${row.Relation}"`);
    const cell = (column: (typeof TRANSITION_COLUMNS)[number]) => (row[column] ?? '').trim();
    return {
      dance: cell('Dance'),
      figure: cell('Figure Name'),
      link: {
        relation,
        level: cell('Level'),
        condition: cell('Condition'),
        steps: cell('Steps'),
        linkedFigure: cell('Linked Figure'),
        linkedSteps: cell('Linked Steps'),
        sameAs: cell('Same As'),
        details: cell('Details'),
      },
    };
  });
}

// A link with any "As for" list it came through already followed.
export interface ResolvedLink extends FigureLink {
  // The linked figure's chart; null for a group or a figure not charted here.
  target: FigureGroup | null;
}

export interface TransitionItem {
  // Which steps of the linked figure: "4-6", "step 6 of", or empty.
  steps: string;
  // The linked figure's name as the list reads it; empty for a group entry.
  name: string;
  // The book's wording for this case, after the name.
  details: string;
  // The charted figures the item names (two for "Tipple Chasse to Right",
  // charted at a corner and along the side of the room).
  figures: FigureGroup[];
  text: string;
}

export interface TransitionLine {
  // The level the items are first listed at; empty when ungraded.
  level: string;
  // When the items apply ("At corner", "After steps 1-3"); empty for always.
  when: string;
  items: TransitionItem[];
  text: string;
}

export interface TransitionList {
  relation: Relation;
  label: string;
  // Every link of the list, "As for" lists included, in book order.
  links: ResolvedLink[];
  // Grouped by level, then by when they apply.
  lines: TransitionLine[];
  // Whether the lines need their level shown: false when every link is
  // ungraded or at the figure's own level.
  graded: boolean;
  text: string;
}

export interface FigureTransitions {
  precededBy: TransitionList;
  followedBy: TransitionList;
  // Both lists as plain text, for search.
  text: string;
}

export interface TransitionBook {
  forFigure(figure: FigureGroup): FigureTransitions;
}

const LABELS: Record<Relation, string> = { 'Preceded By': 'Preceded by', 'Followed By': 'Followed by' };

const LEVEL_ORDER: readonly string[] = LEVELS;
const levelRank = (level: string): number => LEVEL_ORDER.indexOf(level);
const higherLevel = (a: string, b: string): string => (levelRank(a) >= levelRank(b) ? a : b);

// "If ended DC" reads "if ended DC" after another phrase; "LF Cuban Rock" stays.
const lowerFirst = (text: string): string => (/^[A-Z][a-z]/.test(text) ? text.charAt(0).toLowerCase() + text.slice(1) : text);
const joinPhrases = (...phrases: string[]): string =>
  phrases
    .filter(Boolean)
    .map((p, i) => (i === 0 ? p : lowerFirst(p)))
    .join(', ');

const isRange = (steps: string) => steps.includes('-');

// The figure's own steps the link joins, as a phrase.
const ownSteps = (relation: Relation, steps: string): string => {
  if (!steps) return '';
  const which = `${isRange(steps) ? 'steps' : 'step'} ${steps}`;
  return relation === 'Preceded By' ? `Into ${which}` : `After ${which}`;
};

// A figure's notes as search reads them: its General Notes, then its
// Precede and Follow lists.
export const searchableNotes = (figure: FigureGroup, book: TransitionBook): string =>
  [figure.generalNotes, book.forFigure(figure).text].filter(Boolean).join(' ');

// A list names figures without the qualifier some charts carry in
// brackets: "Top Spin", not "Top Spin (At a Corner, After 1-6 Reverse Turn)".
export const listName = (name: string): string => name.replace(/\s*\([^()]*\)$/, '');

const figureKey = (dance: string, name: string) => `${dance} - ${name}`;

export function createTransitionBook(figures: FigureGroup[]): TransitionBook {
  const byKey = new Map(figures.map((f) => [figureKey(f.dance, f.name), f]));
  const cache = new WeakMap<FigureGroup, FigureTransitions>();
  const find = (dance: string, name: string) => byKey.get(figureKey(dance, name)) ?? null;

  // The figure's links of one relation, with "As for" lists followed.
  // Only the other figure's whole-figure links carry over: one into its
  // steps 4-6 says nothing about this figure.
  const resolve = (figure: FigureGroup, relation: Relation, visiting: Set<FigureGroup>): FigureLink[] => {
    const links: FigureLink[] = [];
    for (const link of figure.links) {
      if (link.relation !== relation) continue;
      if (!link.sameAs) {
        links.push(link);
        continue;
      }
      const source = find(figure.dance, link.sameAs);
      if (!source || visiting.has(source)) continue;
      visiting.add(source);
      for (const inherited of resolve(source, relation, visiting)) {
        if (inherited.steps) continue;
        links.push({
          ...inherited,
          level: higherLevel(link.level, inherited.level),
          condition: joinPhrases(link.condition, inherited.condition),
          steps: link.steps,
        });
      }
      visiting.delete(source);
    }
    return links;
  };

  const buildList = (figure: FigureGroup, relation: Relation): TransitionList => {
    const seen = new Set<string>();
    const links: ResolvedLink[] = [];
    for (const link of resolve(figure, relation, new Set([figure]))) {
      // A graded link is never listed below the figure's own level.
      const level = link.level ? higherLevel(link.level, figure.level) : '';
      const resolved: ResolvedLink = {
        ...link,
        level,
        target: link.linkedFigure ? find(figure.dance, link.linkedFigure) : null,
      };
      const id = [level, resolved.condition, resolved.steps, resolved.linkedFigure, resolved.linkedSteps, resolved.details].join('|');
      if (seen.has(id)) continue;
      seen.add(id);
      links.push(resolved);
    }

    const byLevel = new Map<string, Map<string, TransitionItem[]>>();
    for (const link of links) {
      const when = joinPhrases(ownSteps(relation, link.steps), link.condition);
      const groups = byLevel.get(link.level) ?? new Map<string, TransitionItem[]>();
      byLevel.set(link.level, groups);
      const items = groups.get(when) ?? [];
      groups.set(when, items);

      const name = link.linkedFigure ? listName(link.linkedFigure) : '';
      const steps = !link.linkedSteps ? '' : isRange(link.linkedSteps) ? link.linkedSteps : `step ${link.linkedSteps} of`;
      const text = [steps, name, link.details].filter(Boolean).join(' ');
      const same = items.find((item) => item.text === text);
      if (same) {
        if (link.target && !same.figures.includes(link.target)) same.figures.push(link.target);
        continue;
      }
      items.push({ steps, name, details: link.details, figures: link.target ? [link.target] : [], text });
    }

    const levels = [...byLevel.keys()].sort((a, b) => levelRank(a) - levelRank(b));
    const lines: TransitionLine[] = levels.flatMap((level) =>
      [...byLevel.get(level)!.entries()].map(([when, items]) => {
        const list = items.map((item) => item.text).join(', ');
        return { level, when, items, text: when ? `${when}: ${list}` : list };
      }),
    );
    const graded = levels.some((level) => level && level !== figure.level) || levels.filter(Boolean).length > 1;
    const text = lines.map((line) => (graded && line.level ? `${line.level} - ${line.text}` : line.text)).join('; ');
    return { relation, label: LABELS[relation], links, lines, graded, text };
  };

  return {
    forFigure(figure) {
      let transitions = cache.get(figure);
      if (!transitions) {
        const precededBy = buildList(figure, 'Preceded By');
        const followedBy = buildList(figure, 'Followed By');
        const text = [precededBy, followedBy]
          .filter((list) => list.lines.length > 0)
          .map((list) => `${list.label}: ${list.text}.`)
          .join(' ');
        transitions = { precededBy, followedBy, text };
        cache.set(figure, transitions);
      }
      return transitions;
    },
  };
}
