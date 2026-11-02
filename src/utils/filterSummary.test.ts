import { describe, expect, it } from 'vitest';
import { summarizeFilters } from './filterSummary';

const groups = [{ style: 'Latin' as const, dances: ['Rumba', 'Samba'] }];

describe('summarizeFilters', () => {
  it('is empty with nothing picked', () => {
    expect(summarizeFilters([], [], '  ', groups)).toEqual([]);
  });

  it('names a single dance, lists up to two levels and quotes the query', () => {
    expect(summarizeFilters(['Rumba'], ['Bronze', 'Silver'], ' hip ', groups)).toEqual([
      'Rumba',
      'Bronze, Silver',
      '“hip”',
    ]);
  });

  it('counts three or more levels and names a whole style', () => {
    expect(summarizeFilters(['Rumba', 'Samba'], ['A', 'B', 'C'], '', groups)).toEqual(['Latin', '3 Levels']);
  });
});
