import { describe, expect, it } from 'vitest';
import type { FigureGroup } from '../types';
import { buildIndex } from './figureIndex';

const fig = (style: 'Standard' | 'Latin', dance: string, name: string, level: string): FigureGroup => ({
  style,
  dance,
  name,
  level,
  steps: [],
  generalNotes: '',
  startingPosition: '',
  endingPosition: '',
});

const figures = [
  fig('Standard', 'Waltz', 'Natural Turn', 'Bronze'),
  fig('Standard', 'Waltz', 'Whisk', 'Pre-Bronze'),
  fig('Standard', 'Tango', 'Walk', 'Pre-Bronze'),
  fig('Latin', 'Rumba', 'Basic', 'Pre-Bronze'),
  fig('Latin', 'Rumba', 'Alemana', 'Bronze'),
  fig('Latin', 'Jive', 'Link', 'Silver'),
];
const groups = [
  { style: 'Standard' as const, dances: ['Waltz', 'Tango', 'Foxtrot'] },
  { style: 'Latin' as const, dances: ['Rumba', 'Jive'] },
];
const names = (cell: FigureGroup[]) => cell.map((f) => f.name);

describe('buildIndex', () => {
  it('makes a table per style, dances across and levels down, with nothing picked', () => {
    const index = buildIndex(figures, groups, [], []);
    expect(index.total).toBe(6);
    expect(index.danceCount).toBe(4);
    expect(index.tables.map((t) => t.label)).toEqual(['Standard', 'Latin']);

    const standard = index.tables[0];
    // Foxtrot has no figures, so it has no column.
    expect(standard.columns).toEqual([
      { dance: 'Waltz', count: 2 },
      { dance: 'Tango', count: 1 },
    ]);
    expect(standard.rows.map((r) => r.level)).toEqual(['Pre-Bronze', 'Bronze']);
    expect(names(standard.rows[0].cells[0])).toEqual(['Whisk']);
    expect(names(standard.rows[1].cells[1])).toEqual([]);
  });

  it('keeps the dances in the order the groups give and the levels in syllabus order', () => {
    const latin = buildIndex(figures, groups, [], []).tables[1];
    expect(latin.columns.map((c) => c.dance)).toEqual(['Rumba', 'Jive']);
    expect(latin.rows.map((r) => r.level)).toEqual(['Pre-Bronze', 'Bronze', 'Silver']);
  });

  it('narrows to the picked dances, dropping a style with none', () => {
    const index = buildIndex(figures, groups, ['Rumba'], []);
    expect(index.tables.map((t) => t.label)).toEqual(['Latin']);
    expect(index.tables[0].columns).toEqual([{ dance: 'Rumba', count: 2 }]);
    expect(index.danceCount).toBe(1);
  });

  it('narrows to the picked levels and counts only those figures', () => {
    const index = buildIndex(figures, groups, [], ['Bronze']);
    expect(index.total).toBe(2);
    expect(index.tables[0].rows.map((r) => r.level)).toEqual(['Bronze']);
    expect(index.tables[0].columns).toEqual([{ dance: 'Waltz', count: 1 }]);
  });

  it('appends a level the syllabus does not list, alphabetically', () => {
    const odd = [...figures, fig('Standard', 'Waltz', 'Extra', 'Platinum'), fig('Standard', 'Waltz', 'More', 'Aqua')];
    expect(buildIndex(odd, groups, ['Waltz'], []).tables[0].rows.map((r) => r.level)).toEqual([
      'Pre-Bronze',
      'Bronze',
      'Aqua',
      'Platinum',
    ]);
  });

  it('is empty when nothing is in scope', () => {
    expect(buildIndex(figures, groups, ['Tango'], ['Gold'])).toEqual({ tables: [], total: 0, danceCount: 0 });
  });
});
