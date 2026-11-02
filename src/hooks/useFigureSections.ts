import { useMemo } from 'react';
import type { FigureGroup } from '../types';
import { buildSections } from '../utils/search';
import type { useDanceFilters } from './useDanceFilters';

// What the figure list shows for the filters and search: its sections, in
// order. Computed once, where the filters live, for the list to draw and the
// keyboard to step through. `groupByDance` groups an unsearched list of
// several dances by dance, then level (the wide layout's).
export function useFigureSections(
  figures: FigureGroup[],
  filters: ReturnType<typeof useDanceFilters>,
  groupByDance: boolean,
) {
  const { searchTerm, selectedDances, selectedLevels } = filters;
  return useMemo(
    () => buildSections({ figures, dances: selectedDances, levels: selectedLevels, query: searchTerm, groupByDance }),
    [figures, selectedDances, selectedLevels, searchTerm, groupByDance],
  );
}
