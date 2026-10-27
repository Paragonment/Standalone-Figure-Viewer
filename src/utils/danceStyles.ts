import type { DanceStyle } from '../types';

export interface DanceStyleDef {
  id: DanceStyle;
  label: string;
  // Served from public/, resolved against the app's base path.
  dataFile: string;
}

// Display order: Standard's controls come first, Latin's to their right.
export const DANCE_STYLES: DanceStyleDef[] = [
  { id: 'Standard', label: 'Standard', dataFile: 'standard.csv' },
  { id: 'Latin', label: 'Latin', dataFile: 'latin.csv' },
];

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
