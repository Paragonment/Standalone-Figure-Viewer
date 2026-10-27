import { useMemo, useState } from 'react';
import type { FigureGroup } from '../types';
import { DANCE_STYLES, type StyleDances } from '../utils/danceStyles';

// Known syllabus levels in pedagogical (not alphabetical) order. Any level
// found in the data but not listed here is appended alphabetically, so a
// new level added to the CSV always gets a filter option instead of being
// silently dropped.
const KNOWN_LEVEL_ORDER = ['Pre-Bronze', 'Bronze', 'Silver', 'Gold'];

const sortLevels = (levels: string[]): string[] => {
  return [...levels].sort((a, b) => {
    const ai = KNOWN_LEVEL_ORDER.indexOf(a);
    const bi = KNOWN_LEVEL_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
};

export const useDanceFilters = (figureGroups: FigureGroup[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDances, setSelectedDances] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

  // Each style's dances, alphabetically, in DANCE_STYLES order. A style
  // with no data yet is left out rather than shown as an empty filter.
  const danceGroups = useMemo<StyleDances[]>(() => {
    return DANCE_STYLES.map((s) => ({
      style: s.id,
      dances: Array.from(new Set(figureGroups.filter((g) => g.style === s.id).map((g) => g.dance))).sort(),
    })).filter((g) => g.dances.length > 0);
  }, [figureGroups]);

  const levels = useMemo(() => {
    return sortLevels(Array.from(new Set(figureGroups.map((g) => g.level))));
  }, [figureGroups]);

  const filteredFigures = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();

    return figureGroups.filter((group) => {
      const matchesDance = selectedDances.length === 0 || selectedDances.includes(group.dance);
      const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(group.level);

      if (!matchesDance || !matchesLevel) return false;
      if (!searchLower) return true;

      return (
        group.dance.toLowerCase().includes(searchLower) ||
        group.style.toLowerCase().includes(searchLower) ||
        group.name.toLowerCase().includes(searchLower) ||
        group.generalNotes.toLowerCase().includes(searchLower) ||
        group.steps.some((step) =>
          Object.values(step).some((val) => String(val).toLowerCase().includes(searchLower))
        )
      );
    });
  }, [figureGroups, searchTerm, selectedDances, selectedLevels]);

  const hasActiveFilters =
    selectedDances.length > 0 ||
    selectedLevels.length > 0 ||
    searchTerm.length > 0;

  const clearFilters = () => {
    setSelectedDances([]);
    setSelectedLevels([]);
    setSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedDances,
    setSelectedDances,
    selectedLevels,
    setSelectedLevels,
    danceGroups,
    levels,
    filteredFigures,
    hasActiveFilters,
    clearFilters,
  };
};
