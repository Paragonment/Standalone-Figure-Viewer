import type { DanceStyle } from '../types';

export interface StepFieldDef {
  key: string;
  label: string;
  leadKey: string;
  followKey: string;
}

const field = (key: string, label: string): StepFieldDef => ({
  key,
  label,
  leadKey: `Lead ${key}`,
  followKey: `Follow ${key}`,
});

const FEET = field('Feet Positions', 'Feet');
const ALIGNMENT = field('Alignment', 'Alignment');
const TURN = field('Amount of Turn', 'Turn');
const RISE_AND_FALL = field('Rise and Fall', 'Rise and fall');
const FOOTWORK = field('Footwork', 'Footwork');
const CBM = field('CBM', 'CBM');
const SWAY = field('Sway', 'Sway');
const ACTION = field('Action', 'Action');

// The technique attributes that make up a single step, independent of
// Lead/Follow, as each style's book charts them. Drives the step rows
// and the settings checklist, so adding a new Lead-/Follow-prefixed
// CSV column only means adding one entry here.
const STEP_FIELDS_BY_STYLE: Record<DanceStyle, StepFieldDef[]> = {
  Standard: [FEET, ALIGNMENT, TURN, RISE_AND_FALL, FOOTWORK, CBM, SWAY],
  Latin: [FEET, ALIGNMENT, TURN, FOOTWORK, ACTION],
};

export const getStepFields = (style: DanceStyle): StepFieldDef[] => STEP_FIELDS_BY_STYLE[style];

// Step fields shown by default, per style, as StepFieldDef.key values.
export const DEFAULT_FIELDS: Record<DanceStyle, string[]> = {
  Standard: ['Feet Positions', 'Footwork', 'Rise and Fall'],
  Latin: ['Feet Positions', 'Amount of Turn', 'Footwork', 'Action'],
};

// The feet line headlines every step, and the partner line is a feet line
// too, so this one field gates both.
export const FEET_KEY = 'Feet Positions';

// Shared (not per-role) timing columns, charted for Latin only.
export const TIMING_COLUMN = 'Timing';
export const BEAT_VALUE_COLUMN = 'Beat Value';
