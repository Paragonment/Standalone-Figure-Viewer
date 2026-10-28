import type { DanceStyle } from '../types';

export interface DanceStyleDef {
  id: DanceStyle;
  label: string;
  // Served from public/, resolved against the app's base path.
  dataFile: string;
  // The style's dances in display order (not alphabetical).
  dances: string[];
}

// Display order: Standard's controls come first, Latin's to their right.
export const DANCE_STYLES: DanceStyleDef[] = [
  { id: 'Standard', label: 'Standard', dataFile: 'standard.csv', dances: ['Waltz', 'Tango', 'Foxtrot', 'Quickstep'] },
  { id: 'Latin', label: 'Latin', dataFile: 'latin.csv', dances: ['Cha Cha Cha', 'Samba', 'Rumba', 'Paso Doble', 'Jive'] },
];

// Shorter names for the narrow segmented controls.
const DANCE_SHORT_LABEL: Record<string, string> = { 'Cha Cha Cha': 'Cha Cha', 'Paso Doble': 'Paso' };

export const danceShortLabel = (dance: string): string => DANCE_SHORT_LABEL[dance] ?? dance;

export interface StyleDances {
  style: DanceStyle;
  dances: string[];
}

// Short label for a selection, e.g. for breadcrumbs: a single dance, a
// whole style ("Latin"), or a count.
export const describeSelection = (selected: string[], groups: StyleDances[]): string => {
  if (selected.length === 1) return selected[0];
  const whole = groups.find(
    (g) => g.dances.length === selected.length && g.dances.every((d) => selected.includes(d)),
  );
  if (whole) return DANCE_STYLES.find((s) => s.id === whole.style)?.label ?? whole.style;
  return `${selected.length} Dances`;
};

// Mobile selection model. An empty selection means "no filter", and
// picking every option is stored the same way.

// Selecting every option there is is the same as selecting none.
const normalizeSelection = (selected: string[], allDances: string[]): string[] =>
  allDances.every((d) => selected.includes(d)) ? [] : selected;

// A single segment or pill. From "everything" it narrows to just that
// item; otherwise it toggles the item.
export const toggleItem = (selected: string[], item: string, all: string[]): string[] => {
  if (selected.length === 0) return [item];
  const next = selected.includes(item) ? selected.filter((d) => d !== item) : [...selected, item];
  return normalizeSelection(next, all);
};

// A style's select-all box: when all of the style's dances are selected it
// removes them, otherwise it adds them.
export const toggleStyleMobile = (styleDances: string[], selected: string[], allDances: string[]): string[] => {
  const allSelected = selected.length > 0 && styleDances.every((d) => selected.includes(d));
  const next = allSelected
    ? selected.filter((d) => !styleDances.includes(d))
    : [...new Set([...selected, ...styleDances])];
  return normalizeSelection(next, allDances);
};
