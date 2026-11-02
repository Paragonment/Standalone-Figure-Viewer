import { describe, expect, it } from 'vitest';
import { figureKey } from './figureKey';

describe('figureKey', () => {
  it('joins dance and name', () => {
    expect(figureKey({ dance: 'Waltz', name: 'Back Lock' })).toBe('Waltz-Back Lock');
  });

  it('tells a name shared by two dances apart', () => {
    expect(figureKey({ dance: 'Waltz', name: 'Natural Turn' })).not.toBe(
      figureKey({ dance: 'Foxtrot', name: 'Natural Turn' }),
    );
  });
});
