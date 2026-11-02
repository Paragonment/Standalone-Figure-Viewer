import { useMemo } from 'react';
import type { FigureGroup } from '../types';
import { buildSections } from '../utils/search';
import type { useDanceFilters } from './useDanceFilters';

// What the figure list shows for the filters and search: its sections, in
// order. Computed once, where the filters live, for the list to draw and the
// keyboard to step through.
export function useFigureSections(figures: FigureGroup[], filters: ReturnType<typeof useDanceFilters>) {
  const { searchTerm, selectedDances, selectedLevels } = filters;
  return useMemo(
    () => buildSections({ figures, dances: selectedDances, levels: selectedLevels, query: searchTerm }),
    [figures, selectedDances, selectedLevels, searchTerm],
  );
}
