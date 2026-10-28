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
export const DANCE_SHORT_LABEL: Record<string, string> = { 'Cha Cha Cha': 'Cha Cha', 'Paso Doble': 'Paso' };

export const danceShortLabel = (dance: string): string => DANCE_SHORT_LABEL[dance] ?? dance;

export interface StyleDances {
  style: DanceStyle;
  dances: string[];
}

// Which dances are shown, per style. An empty selection means "no dance
// filter", so every style counts as fully shown; otherwise a style is
// fully shown only when every one of its dances is selected.
export const isStyleFullyShown = (group: StyleDances, selected: string[]) =>
  selected.length === 0 || group.dances.every((d) => selected.includes(d));

// Selecting every dance there is is the same as having no dance filter,
// and is stored that way so "Clear Filters" and the defaults agree.
const normalize = (selected: string[], groups: StyleDances[]) => {
  const all = groups.flatMap((g) => g.dances);
  return all.every((d) => selected.includes(d)) ? [] : selected;
};

// "All <style>" checkbox: on adds the whole style alongside whatever else
// is selected; off removes it. Turning off the only style that's shown
// would leave nothing to show, so it falls back to showing everything.
export const toggleStyle = (group: StyleDances, selected: string[], groups: StyleDances[]): string[] => {
  if (isStyleFullyShown(group, selected)) {
    const effective = selected.length === 0 ? groups.flatMap((g) => g.dances) : selected;
    const rest = effective.filter((d) => !group.dances.includes(d));
    return rest.length === 0 ? [] : normalize(rest, groups);
  }
  return normalize([...new Set([...selected, ...group.dances])], groups);
};

// Single dance checkbox. From "everything" it narrows to just that dance,
// the same as before Latin existed; a dance whose whole style is shown
// narrows that style down to the dance and leaves other styles alone.
export const toggleDance = (
  dance: string,
  group: StyleDances,
  selected: string[],
  groups: StyleDances[],
): string[] => {
  if (selected.length === 0) return [dance];
  if (isStyleFullyShown(group, selected)) {
    return normalize([...selected.filter((d) => !group.dances.includes(d)), dance], groups);
  }
  const next = selected.includes(dance) ? selected.filter((d) => d !== dance) : [...selected, dance];
  return normalize(next, groups);
};

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
export const normalizeSelection = (selected: string[], allDances: string[]): string[] =>
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
