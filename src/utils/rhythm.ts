import type { FigureGroup } from '../types';
import { BEAT_VALUE_COLUMN, TIMING_COLUMN } from './stepFields';
import { keepRanges } from './stepValues';

export interface Beat {
  // Display text of the count: "2", "&", "a", "4 1".
  count: string;
  // Relative length of the beat, used as the strip bar's flex-grow.
  value: number;
  // Spoken label: "Step 3, on 4".
  aria: string;
}

// "1/2" -> 0.5, "1 3/4" -> 1.75, "" -> 1.
export const parseBeatValue = (value: string): number => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 1;
  let total = 0;
  for (const part of parts) {
    const [num, den] = part.split('/');
    const n = den === undefined ? Number(num) : Number(num) / Number(den);
    if (!Number.isFinite(n)) return 1;
    total += n;
  }
  return total > 0 ? total : 1;
};

const EN_SPACE = ' ';

// A count held across two beats is charted "4-1" (4, then 1 of the next
// bar) and reads as "4 1"; any other range keeps its hyphen but cannot
// break across lines.
export const displayCount = (timing: string): string => {
  const text = timing.trim();
  const held = /^(\d+)-(\d+)$/.exec(text);
  if (held && Number(held[2]) < Number(held[1])) return `${held[1]}${EN_SPACE}${held[2]}`;
  return keepRanges(text);
};

export const spokenCount = (count: string): string => count.replace(/&/g, 'and');

const FRACTIONS: Record<number, string> = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

// 1 -> "1 beat", 0.5 -> "½ beat", 1.75 -> "1¾ beats", 2 -> "2 beats".
export const formatBeats = (value: number): string => {
  const whole = Math.floor(value + 1e-9);
  const frac = Math.round((value - whole) * 4) / 4;
  const fracText = FRACTIONS[frac];
  const text = fracText ? `${whole > 0 ? whole : ''}${fracText}` : String(Math.round(value));
  return `${text} ${value > 1 ? 'beats' : 'beat'}`;
};

// Only Latin charts Timing; Standard figures have none.
export const hasTiming = (figure: FigureGroup): boolean =>
  figure.steps.length > 0 && figure.steps.every((s) => (s[TIMING_COLUMN] ?? '').trim() !== '');

// One beat per step. Without timing (Standard) each step is an equal bar
// labelled with its step number.
export const buildBeats = (figure: FigureGroup): Beat[] => {
  const timed = hasTiming(figure);
  return figure.steps.map((step, i) => {
    if (!timed) return { count: String(i + 1), value: 1, aria: `Step ${i + 1}` };
    const count = displayCount(step[TIMING_COLUMN] ?? '');
    return {
      count,
      value: parseBeatValue(step[BEAT_VALUE_COLUMN] ?? ''),
      aria: `Step ${i + 1}, on ${spokenCount(count)}`,
    };
  });
};

// Length of the figure in bars of four beats, or null when it has no beat values.
export const barCount = (figure: FigureGroup): number | null => {
  if (!hasTiming(figure)) return null;
  const beats = figure.steps.reduce((sum, s) => sum + parseBeatValue(s[BEAT_VALUE_COLUMN] ?? ''), 0);
  return beats / 4;
};

const BAR_FRACTIONS = ['', '1/4', '1/2', '3/4'];

// Rounded to the nearest quarter: "1 bar", "2 bars", "2 1/2 bars", "1/2 bar".
export const formatBars = (bars: number): string => {
  const quarters = Math.round(bars * 4);
  const whole = Math.floor(quarters / 4);
  const frac = BAR_FRACTIONS[quarters % 4];
  const text = [whole > 0 ? String(whole) : '', frac].filter(Boolean).join(' ') || '0';
  return `${text} ${quarters <= 4 ? 'bar' : 'bars'}`;
};
