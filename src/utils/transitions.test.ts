import { describe, expect, it } from 'vitest';
import type { FigureGroup, FigureLink } from '../types';
import { createTransitionBook, listName, readTransitionRows, TRANSITION_COLUMNS } from './transitions';

const link = (relation: FigureLink['relation'], fields: Partial<FigureLink>): FigureLink => ({
  relation,
  level: '',
  condition: '',
  steps: '',
  linkedFigure: '',
  linkedSteps: '',
  sameAs: '',
  details: '',
  ...fields,
});

const figure = (name: string, level: string, links: FigureLink[]): FigureGroup => ({
  style: 'Standard',
  dance: 'Waltz',
  name,
  level,
  steps: [],
  generalNotes: '',
  startingPosition: '',
  endingPosition: '',
  links,
});

describe('readTransitionRows', () => {
  it('reads a row into a link', () => {
    const [record] = readTransitionRows(
      [{ Dance: 'Waltz', 'Figure Name': 'Whisk', Relation: 'Followed By', Level: 'Bronze', 'Linked Figure': 'Chasse from PP', Details: ' x ' }],
      [...TRANSITION_COLUMNS],
      't.csv',
    );
    expect(record.figure).toBe('Whisk');
    expect(record.link).toMatchObject({ relation: 'Followed By', level: 'Bronze', linkedFigure: 'Chasse from PP', details: 'x', steps: '' });
  });

  it('rejects a missing column and an unknown relation', () => {
    expect(() => readTransitionRows([], ['Dance'], 't.csv')).toThrow(/no Figure Name/);
    expect(() => readTransitionRows([{ Relation: 'Precedes' }], [...TRANSITION_COLUMNS], 't.csv')).toThrow(/row 2: unknown Relation/);
  });
});

describe('createTransitionBook', () => {
  const natural = figure('Natural Turn', 'Bronze', [
    link('Preceded By', { level: 'Bronze', linkedFigure: 'Closed Change' }),
    link('Preceded By', { level: 'Bronze', condition: 'At corner', linkedFigure: 'Natural Turn' }),
    link('Preceded By', { level: 'Bronze', steps: '4-6', linkedFigure: 'Reverse Corte' }),
    link('Preceded By', { level: 'Silver', linkedFigure: 'Outside Spin', details: '(underturned)' }),
  ]);
  const spin = figure('Natural Spin Turn', 'Bronze', [link('Preceded By', { sameAs: 'Natural Turn' })]);
  const telemark = figure('Closed Telemark', 'Silver', [link('Preceded By', { level: 'Silver', sameAs: 'Natural Turn' })]);
  const corte = figure('Reverse Corte', 'Bronze', [link('Followed By', { linkedFigure: 'Natural Turn', linkedSteps: '4-6' })]);
  const a = figure('A', 'Gold', [link('Followed By', { sameAs: 'B' })]);
  const b = figure('B', 'Gold', [link('Followed By', { sameAs: 'A' }), link('Followed By', { linkedFigure: 'Natural Turn' })]);
  const book = createTransitionBook([natural, spin, telemark, corte, a, b]);

  it('groups a list by level, then by when it applies', () => {
    const { precededBy } = book.forFigure(natural);
    expect(precededBy.lines.map((l) => [l.level, l.when, l.text])).toEqual([
      ['Bronze', '', 'Closed Change'],
      ['Bronze', 'At corner', 'At corner: Natural Turn'],
      ['Bronze', 'Into steps 4-6', 'Into steps 4-6: Reverse Corte'],
      ['Silver', '', 'Outside Spin (underturned)'],
    ]);
    expect(precededBy.graded).toBe(true);
  });

  it('follows "As for" lists, leaving out links into part of the other figure', () => {
    const texts = book.forFigure(spin).precededBy.lines.map((l) => l.text);
    expect(texts).toEqual(['Closed Change', 'At corner: Natural Turn', 'Outside Spin (underturned)']);
  });

  it('never lists a link below the figure or the "As for" level', () => {
    const { precededBy } = book.forFigure(telemark);
    expect(precededBy.lines.every((l) => l.level === 'Silver')).toBe(true);
    // Every link is at the figure's own level, so no level needs showing.
    expect(precededBy.graded).toBe(false);
  });

  it('names linked steps and resolves charted targets', () => {
    const [item] = book.forFigure(corte).followedBy.lines[0].items;
    expect(item.text).toBe('4-6 Natural Turn');
    expect(item.figures).toEqual([natural]);
  });

  it('survives "As for" cycles', () => {
    expect(book.forFigure(a).followedBy.text).toBe('Natural Turn');
  });

  it('builds a figure once and returns the cached lists after', () => {
    expect(book.forFigure(natural)).toBe(book.forFigure(natural));
  });

  it('reads both lists as text for search', () => {
    expect(book.forFigure(corte).text).toBe('Followed by: 4-6 Natural Turn.');
  });
});

describe('listName', () => {
  it('drops a chart qualifier in brackets', () => {
    expect(listName('Top Spin (At a Corner, After 1-6 Reverse Turn)')).toBe('Top Spin');
    expect(listName('Spot Turn to L')).toBe('Spot Turn to L');
  });
});
