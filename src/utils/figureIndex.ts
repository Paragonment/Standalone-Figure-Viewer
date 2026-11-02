import type { DanceStyle, FigureGroup } from '../types';
import { DANCE_STYLES, type StyleDances } from './danceStyles';
import { LEVELS } from './levels';
import { filterScope } from './search';

export interface IndexColumn {
  dance: string;
  // Figures of the dance inside the picked levels.
  count: number;
}

export interface IndexRow {
  level: string;
  // One list of figures per column of the table, in its order.
  cells: FigureGroup[][];
}

// One style's contents: its dances across, the levels down.
export interface IndexTable {
  style: DanceStyle;
  label: string;
  columns: IndexColumn[];
  rows: IndexRow[];
}

export interface FigureIndexData {
  tables: IndexTable[];
  // Figures and dances across all the tables.
  total: number;
  danceCount: number;
}

// The levels the figures are in: the known ones in order, then any other
// alphabetically.
const levelsOf = (figures: FigureGroup[]): string[] => {
  const known: readonly string[] = LEVELS;
  const present = new Set(figures.map((f) => f.level));
  return [...known.filter((l) => present.has(l)), ...[...present].filter((l) => !known.includes(l)).sort()];
};

// The contents page for the picked dances and levels (all, when none): a
// table per style, a column per dance with figures in scope and a row per
// level with figures in scope, the figures in the order they are listed.
export function buildIndex(
  figures: FigureGroup[],
  danceGroups: StyleDances[],
  dances: string[],
  levels: string[],
): FigureIndexData {
  const inScope = filterScope(figures, dances, levels);
  const tables = danceGroups
    .map(({ style, dances: styleDances }): IndexTable => {
      const inStyle = inScope.filter((f) => f.style === style);
      const columns = styleDances
        .map((dance) => ({ dance, count: inStyle.filter((f) => f.dance === dance).length }))
        .filter((column) => column.count > 0);
      const rows = levelsOf(inStyle).map((level) => ({
        level,
        cells: columns.map(({ dance }) => inStyle.filter((f) => f.dance === dance && f.level === level)),
      }));
      return { style, label: DANCE_STYLES.find((s) => s.id === style)?.label ?? style, columns, rows };
    })
    .filter((table) => table.columns.length > 0);

  return {
    tables,
    total: inScope.length,
    danceCount: tables.reduce((n, table) => n + table.columns.length, 0),
  };
}
