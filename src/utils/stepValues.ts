import type { DanceStep, Role } from '../types';
import type { StepFieldDef } from './stepFields';

// Word joiner: an invisible character that forbids a line break.
export const WJ = '⁠';

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

export const expandFootwork = (value: string): string => FOOTWORK_WORDS[value.trim()] ?? value;

const SWAY_WORDS: Record<string, string> = { L: 'Left', R: 'Right', S: 'Straight' };

// Display text for one step value, or null when the row should not be
// shown at all: empty and "Nil" values, and a CBM that is not used.
export const formatStepValue = (fieldKey: string, value: string): string | null => {
  const raw = value.trim();
  if (raw === '' || raw.toLowerCase() === 'nil') return null;

  let text = raw;
  if (fieldKey === 'Footwork') text = expandFootwork(raw);
  else if (fieldKey === 'CBM') {
    if (raw === 'false') return null;
    if (raw === 'true') text = 'Yes';
  } else if (fieldKey === 'Sway') text = SWAY_WORDS[raw] ?? raw;

  return keepRanges(text);
};

const roleKey = (field: StepFieldDef, role: Role) => (role === 'lead' ? field.leadKey : field.followKey);

// One part's display value for one field of a step.
export const partValue = (step: DanceStep, role: Role, field: StepFieldDef): string | null =>
  formatStepValue(field.key, step[roleKey(field, role)] ?? '');

// One part's feet line, the headline of a step.
export const feetText = (step: DanceStep, role: Role): string =>
  keepRanges(step[role === 'lead' ? 'Lead Feet Positions' : 'Follow Feet Positions'] ?? '');
