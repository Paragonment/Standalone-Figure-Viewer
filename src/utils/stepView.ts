import type { DanceStep, DanceStyle, Role } from '../types';
import { FEET_KEY, getStepFields, type StepFieldDef } from './stepFields';
import { partValue } from './stepValues';

export interface StepColumns {
  // Whether the Feet field is on: it headlines the step and gates the partner line.
  feetOn: boolean;
  // The other enabled fields of the style, in the style's own order.
  defs: StepFieldDef[];
}

// What a step shows for a style, given the reader's enabled field keys.
// Shared by the phone's step list and the desktop chart.
export const stepColumns = (style: DanceStyle, enabled: string[]): StepColumns => ({
  feetOn: enabled.includes(FEET_KEY),
  defs: getStepFields(style).filter((def) => def.key !== FEET_KEY && enabled.includes(def.key)),
});

export interface Detail {
  label: string;
  value: string;
}

// One value per field for one part's step, null where there is nothing to
// say. Index-aligned with `defs`, so a chart can leave the cell blank.
export const partCells = (step: DanceStep, role: Role, defs: StepFieldDef[], spell: boolean): (string | null)[] =>
  defs.map((def) => partValue(step, role, def, spell));

// The same values as labelled rows, with the empty ones left out.
export const partDetails = (step: DanceStep, role: Role, defs: StepFieldDef[], spell: boolean): Detail[] =>
  partCells(step, role, defs, spell).flatMap((value, i) => (value === null ? [] : [{ label: defs[i].label, value }]));
