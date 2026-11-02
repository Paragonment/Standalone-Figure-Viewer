import type { FigureGroup } from '../types';
import { beatsPerBar } from './danceStyles';
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
const parseBeatValue = (value: string): number => {
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

// Standard's S and Q counts are read as words.
const SPOKEN_COUNT: Record<string, string> = { S: 'slow', Q: 'quick' };

export const spokenCount = (count: string): string => SPOKEN_COUNT[count] ?? count.replace(/&/g, 'and');

const FRACTIONS: Record<number, string> = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

// 1 -> "1 beat", 0.5 -> "½ beat", 1.75 -> "1¾ beats", 2 -> "2 beats".
export const formatBeats = (value: number): string => {
  const whole = Math.floor(value + 1e-9);
  const frac = Math.round((value - whole) * 4) / 4;
  const fracText = FRACTIONS[frac];
  const text = fracText ? `${whole > 0 ? whole : ''}${fracText}` : String(Math.round(value));
  return `${text} ${value > 1 ? 'beats' : 'beat'}`;
};

// Whether every step of the figure has a count.
export const hasTiming = (figure: FigureGroup): boolean =>
  figure.steps.length > 0 && figure.steps.every((s) => (s[TIMING_COLUMN] ?? '').trim() !== '');

// One beat per step. A figure without timing gets an equal bar per step,
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

// Length of the figure in bars of its dance's music, or null when it has
// no beat values.
export const barCount = (figure: FigureGroup): number | null => {
  if (!hasTiming(figure)) return null;
  const beats = figure.steps.reduce((sum, s) => sum + parseBeatValue(s[BEAT_VALUE_COLUMN] ?? ''), 0);
  return beats / beatsPerBar(figure.dance);
};

// Beat values are charted to the quarter beat and a bar holds 2, 3 or 4
// beats, so every bar count is a whole number of 48ths.
const BAR_PARTS = 48;

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

// Fractions with a glyph of their own; they sit against the whole number
// ("1⅓") the way formatBeats writes quarters. The rest are written out
// after an en space, so "1 5/12" cannot be misread as "15/12".
const BAR_FRACTIONS: Record<string, string> = {
  '1/2': '½',
  '1/3': '⅓',
  '2/3': '⅔',
  '1/4': '¼',
  '3/4': '¾',
  '1/6': '⅙',
  '5/6': '⅚',
  '1/8': '⅛',
  '3/8': '⅜',
  '5/8': '⅝',
  '7/8': '⅞',
};

// "1 bar", "2 bars", "1½ bars", "1⅓ bars", "½ bar".
export const formatBars = (bars: number): string => {
  const parts = Math.round(bars * BAR_PARTS);
  const whole = Math.floor(parts / BAR_PARTS);
  const rest = parts % BAR_PARTS;
  const divisor = gcd(rest, BAR_PARTS);
  const frac = rest > 0 ? `${rest / divisor}/${BAR_PARTS / divisor}` : '';
  const glyph = BAR_FRACTIONS[frac];
  const fracText = glyph ?? frac;
  const wholeText = whole > 0 ? String(whole) : '';
  const text = glyph || !wholeText || !frac ? wholeText + fracText : `${wholeText}${EN_SPACE}${fracText}`;
  return `${text || '0'} ${parts <= BAR_PARTS ? 'bar' : 'bars'}`;
};
