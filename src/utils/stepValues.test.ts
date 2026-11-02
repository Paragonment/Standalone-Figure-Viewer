import { describe, expect, it } from 'vitest';
import { formatStepValue, keepRanges } from './stepValues';

const WJ = '⁠';

describe('keepRanges', () => {
  it('wraps the hyphen of a number range in word joiners', () => {
    expect(keepRanges('3-5')).toBe(`3${WJ}-${WJ}5`);
  });

  it('leaves other hyphens alone', () => {
    expect(keepRanges('Heel-Toe')).toBe('Heel-Toe');
  });
});

describe('formatStepValue', () => {
  it('hides empty and Nil values', () => {
    expect(formatStepValue('Footwork', '')).toBeNull();
    expect(formatStepValue('Amount of Turn', 'Nil')).toBeNull();
  });

  it('hides a CBM that is not used and spells out one that is', () => {
    expect(formatStepValue('CBM', 'false')).toBeNull();
    expect(formatStepValue('CBM', 'true')).toBe('Yes');
  });

  it('spells out sway', () => {
    expect(formatStepValue('Sway', 'L')).toBe('Left');
  });

  it('shows footwork as words, and joined codes as hyphenated words when spelling out', () => {
    expect(formatStepValue('Footwork', 'HT')).toBe('Heel toe');
    expect(formatStepValue('Footwork', 'HT', true)).toBe('Heel-Toe');
  });
});
