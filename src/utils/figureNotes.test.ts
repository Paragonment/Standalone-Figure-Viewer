import { describe, expect, it } from 'vitest';
import { parseFigureNotes } from './figureNotes';

describe('parseFigureNotes', () => {
  it('splits what precedes and follows by level', () => {
    const { description, rows } = parseFigureNotes(
      'Body backing DW. Precede: Bronze - Reverse Corte, Natural Turn; Silver, Gold - Wing (at corner; or not); At corner - Slip Pivot. Follow: Any Reverse figure.',
    );
    expect(description).toBe('Body backing DW.');
    expect(rows).toEqual([
      {
        label: 'Preceded by',
        entries: [
          { levels: ['Bronze'], text: 'Reverse Corte, Natural Turn' },
          { levels: ['Silver', 'Gold'], text: 'Wing (at corner; or not)' },
          { levels: [], text: 'At corner - Slip Pivot' },
        ],
      },
      { label: 'Followed by', entries: [{ levels: [], text: 'Any Reverse figure' }] },
    ]);
  });

  it('keeps endings whole', () => {
    const { rows } = parseFigureNotes('Alternative endings: (a) Rock; (b) Spot Turn.');
    expect(rows).toEqual([{ label: 'Endings', entries: [{ levels: [], text: '(a) Rock; (b) Spot Turn' }] }]);
  });
});
