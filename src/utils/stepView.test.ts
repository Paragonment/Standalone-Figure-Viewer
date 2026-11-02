import { describe, expect, it } from 'vitest';
import type { DanceStep } from '../types';
import { partCells, partDetails, stepColumns } from './stepView';

const step = {
  'Lead Footwork': 'HT',
  'Follow Footwork': 'TH',
  'Lead Alignment': '',
  'Follow Alignment': 'Nil',
  'Lead Rise and Fall': 'Rise',
  'Follow Rise and Fall': 'Rise',
} as unknown as DanceStep;

describe('stepColumns', () => {
  it('keeps the enabled fields of the style in the style order, without Feet', () => {
    const { feetOn, defs } = stepColumns('Standard', ['Footwork', 'Feet Positions', 'Alignment']);
    expect(feetOn).toBe(true);
    expect(defs.map((d) => d.key)).toEqual(['Alignment', 'Footwork']);
  });

  it('reports Feet off and ignores keys the style does not have', () => {
    const { feetOn, defs } = stepColumns('Standard', ['Action', 'Sway']);
    expect(feetOn).toBe(false);
    expect(defs.map((d) => d.key)).toEqual(['Sway']);
  });
});

describe('partCells', () => {
  const { defs } = stepColumns('Standard', ['Alignment', 'Rise and Fall', 'Footwork']);

  it('lines up with the fields and leaves empty and Nil values null', () => {
    expect(partCells(step, 'lead', defs, false)).toEqual([null, 'Rise', 'Heel toe']);
    expect(partCells(step, 'follow', defs, false)).toEqual([null, 'Rise', 'Toe heel']);
  });
});

describe('partDetails', () => {
  it('labels the values and drops the empty ones', () => {
    const { defs } = stepColumns('Standard', ['Alignment', 'Rise and Fall', 'Footwork']);
    expect(partDetails(step, 'lead', defs, false)).toEqual([
      { label: 'Rise and fall', value: 'Rise' },
      { label: 'Footwork', value: 'Heel toe' },
    ]);
  });
});
