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
const RISE_AND_FALL = field('Rise and Fall', 'Rise & Fall');
const FOOTWORK = field('Footwork', 'Footwork');
const CBM = field('CBM', 'CBM');
const SWAY = field('Sway', 'Sway');
const ACTION = field('Action', 'Action');

// The technique attributes that make up a single step, independent of
// Lead/Follow, as each style's book charts them. Drives the step card
// field rows and the field chips, so adding a new Lead-/Follow-prefixed
// CSV column only means adding one entry here.
export const STEP_FIELDS_BY_STYLE: Record<DanceStyle, StepFieldDef[]> = {
  Standard: [FEET, ALIGNMENT, TURN, RISE_AND_FALL, FOOTWORK, CBM, SWAY],
  Latin: [FEET, ALIGNMENT, TURN, FOOTWORK, ACTION],
};

// Every field any style charts, in one stable order, for controls that
// span styles.
export const STEP_FIELDS: StepFieldDef[] = [FEET, ALIGNMENT, TURN, RISE_AND_FALL, FOOTWORK, CBM, SWAY, ACTION];

export const getStepFields = (style: DanceStyle): StepFieldDef[] => STEP_FIELDS_BY_STYLE[style];

// Figure-level columns: filled on a figure's first step only.
export const FIGURE_LEVEL_COLUMNS = ['General Notes', 'Starting Position', 'Ending Position'];

// Shared (not per-role) timing columns, charted for Latin only.
export const TIMING_COLUMN = 'Timing';
export const BEAT_VALUE_COLUMN = 'Beat Value';
