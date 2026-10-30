import type { DanceStep, Role } from '../types';
import type { StepFieldDef } from './stepFields';
import { expandAbbreviations, FOOTWORK_COMBINATIONS } from './abbreviations';

// Word joiner: an invisible character that forbids a line break.
const WJ = '⁠';

// Number ranges like "3-5" must never break across lines, so a hyphen
// between digits gets a word joiner on both sides.
export const keepRanges = (text: string): string => text.replace(/(\d)-(?=\d)/g, `$1${WJ}-${WJ}`);

// The data charts footwork in the books' shorthand; readers get words.
// Exact matches only, anything else is shown as charted.
const FOOTWORK_WORDS: Record<string, string> = {
  BF: 'Ball flat',
  B: 'Ball',
  T: 'Toe',
  HF: 'Heel flat',
  H: 'Heel',
  F: 'Flat',
  Flat: 'Flat',
  WF: 'Whole foot',
  'IE of T': 'Inside edge of toe',
  'OE of T': 'Outside edge of toe',
  'T then F': 'Toe, then flat',
  'T then flat': 'Toe, then flat',
  'B or BF': 'Ball or ball flat',
  'HF or BF': 'Heel flat or ball flat',
  TH: 'Toe heel',
  HT: 'Heel toe',
  BH: 'Ball heel',
  THT: 'Toe heel toe',
};

// With `spell` on, joined codes read as hyphenated words ("Heel-Toe") and
// anything not charted as a plain code goes through the general expansion.
const expandFootwork = (value: string, spell: boolean): string => {
  const code = value.trim();
  if (!spell) return FOOTWORK_WORDS[code] ?? value;
  return FOOTWORK_COMBINATIONS[code] ?? FOOTWORK_WORDS[code] ?? expandAbbreviations(value);
};

const SWAY_WORDS: Record<string, string> = { L: 'Left', R: 'Right', S: 'Straight' };

// Display text for one step value, or null when the row should not be
// shown at all: empty and "Nil" values, and a CBM that is not used.
export const formatStepValue = (fieldKey: string, value: string, spell = false): string | null => {
  const raw = value.trim();
  if (raw === '' || raw.toLowerCase() === 'nil') return null;

  let text = raw;
  if (fieldKey === 'Footwork') text = expandFootwork(raw, spell);
  else if (fieldKey === 'CBM') {
    if (raw === 'false') return null;
    if (raw === 'true') text = 'Yes';
  } else if (fieldKey === 'Sway') text = SWAY_WORDS[raw] ?? raw;
  else if (spell) text = expandAbbreviations(raw);

  return keepRanges(text);
};

const roleKey = (field: StepFieldDef, role: Role) => (role === 'lead' ? field.leadKey : field.followKey);

// One part's display value for one field of a step.
export const partValue = (step: DanceStep, role: Role, field: StepFieldDef, spell = false): string | null =>
  formatStepValue(field.key, step[roleKey(field, role)] ?? '', spell);

// One part's feet line, the headline of a step.
export const feetText = (step: DanceStep, role: Role, spell = false): string => {
  const feet = step[role === 'lead' ? 'Lead Feet Positions' : 'Follow Feet Positions'] ?? '';
  return keepRanges(spell ? expandAbbreviations(feet) : feet);
};
