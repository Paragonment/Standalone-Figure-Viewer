import type { DanceStep } from '../types';

export interface StepFieldDef {
  key: string;
  label: string;
  leadKey: keyof DanceStep;
  followKey: keyof DanceStep;
}

// The technique attributes that make up a single step, independent of
// Lead/Follow. Drives both the step card field rows and the highlight chips,
// so adding a new Lead-/Follow-prefixed CSV column only means adding one
// entry here.
export const STEP_FIELDS: StepFieldDef[] = [
  { key: 'Feet Positions', label: 'Feet', leadKey: 'Lead Feet Positions', followKey: 'Follow Feet Positions' },
  { key: 'Alignment', label: 'Alignment', leadKey: 'Lead Alignment', followKey: 'Follow Alignment' },
  { key: 'Amount of Turn', label: 'Turn', leadKey: 'Lead Amount of Turn', followKey: 'Follow Amount of Turn' },
  { key: 'Rise and Fall', label: 'Rise & Fall', leadKey: 'Lead Rise and Fall', followKey: 'Follow Rise and Fall' },
  { key: 'Footwork', label: 'Footwork', leadKey: 'Lead Footwork', followKey: 'Follow Footwork' },
  { key: 'CBM', label: 'CBM', leadKey: 'Lead CBM', followKey: 'Follow CBM' },
  { key: 'Sway', label: 'Sway', leadKey: 'Lead Sway', followKey: 'Follow Sway' },
];
