import { describe, expect, it } from 'vitest';
import { formatBars } from './rhythm';

describe('formatBars', () => {
  it('writes whole bars and singular/plural', () => {
    expect(formatBars(1)).toBe('1 bar');
    expect(formatBars(2)).toBe('2 bars');
  });

  it('sets a fraction with a glyph against the whole number', () => {
    expect(formatBars(1 / 2)).toBe('½ bar');
    expect(formatBars(1 + 1 / 3)).toBe('1⅓ bars');
    expect(formatBars(1.5)).toBe('1½ bars');
  });

  it('keeps a mixed number readable when a fraction has no glyph', () => {
    const text = formatBars(1 + 5 / 12);
    expect(text).toMatch(/^1\s5\/12 bars$/);
    expect(text).not.toContain('1 5/12');
  });
});
