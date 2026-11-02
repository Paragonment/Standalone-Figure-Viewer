import { describe, expect, it } from 'vitest';
import type { FigureGroup } from '../types';
import { buildSections } from './search';

const fig = (dance: string, name: string, level: string, notes = ''): FigureGroup => ({
  style: dance === 'Waltz' || dance === 'Tango' ? 'Standard' : 'Latin',
  dance,
  name,
  level,
  steps: [],
  generalNotes: notes,
  startingPosition: '',
  endingPosition: '',
});

const figures = [
  fig('Rumba', 'Alemana', 'Bronze'),
  fig('Jive', 'Link', 'Silver'),
  fig('Waltz', 'Whisk', 'Pre-Bronze', 'ends in a spin'),
  fig('Waltz', 'Natural Turn', 'Bronze'),
  fig('Tango', 'Walk', 'Pre-Bronze'),
  fig('Waltz', 'Spin', 'Bronze'),
];
const base = { figures, dances: [], levels: [], query: '' };

describe('buildSections', () => {
  it('is one run of every figure with nothing picked', () => {
    const built = buildSections(base);
    expect(built.sections).toHaveLength(1);
    expect(built.grouped).toBe(false);
    expect(built.total).toBe(6);
  });

  it('groups one dance by level, in syllabus order', () => {
    const built = buildSections({ ...base, dances: ['Waltz'] });
    expect(built.grouped).toBe(true);
    expect(built.sections.map((s) => s.heading)).toEqual(['Pre-Bronze', 'Bronze']);
    expect(built.sections.every((s) => s.group === undefined)).toBe(true);
  });

  it('groups by dance, then level, when asked and nothing narrows it to one dance', () => {
    const built = buildSections({ ...base, groupByDance: true });
    expect(built.grouped).toBe(true);
    expect(built.sections.map((s) => [s.group, s.heading, s.count])).toEqual([
      ['Waltz', 'Pre-Bronze', 1],
      ['Waltz', 'Bronze', 2],
      ['Tango', 'Pre-Bronze', 1],
      ['Rumba', 'Bronze', 1],
      ['Jive', 'Silver', 1],
    ]);
    expect(built.total).toBe(6);
  });

  it('groups only the dances and levels picked', () => {
    const built = buildSections({ ...base, dances: ['Waltz', 'Tango'], levels: ['Pre-Bronze'], groupByDance: true });
    expect(built.sections.map((s) => [s.group, s.heading])).toEqual([
      ['Waltz', 'Pre-Bronze'],
      ['Tango', 'Pre-Bronze'],
    ]);
  });

  it('does not add a dance group to a single dance', () => {
    const built = buildSections({ ...base, dances: ['Rumba'], groupByDance: true });
    expect(built.sections.map((s) => [s.group, s.heading])).toEqual([[undefined, 'Bronze']]);
  });

  it('lists matches, not groups, once there is a query', () => {
    const built = buildSections({ ...base, query: 'spin', groupByDance: true });
    expect(built.grouped).toBe(false);
    expect(built.sections.map((s) => s.key)).toEqual(['names', 'notes']);
    expect(built.sections.every((s) => s.group === undefined)).toBe(true);
  });
});
