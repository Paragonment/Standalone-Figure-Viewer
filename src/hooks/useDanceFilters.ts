import { useMemo, useState } from 'react';
import type { DanceStep, FigureGroup } from '../types';

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

export const useDanceFilters = (data: DanceStep[], figureGroups: FigureGroup[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDances, setSelectedDances] = useState<string[]>([]);
  const [selectedFigures, setSelectedFigures] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

  const dances = useMemo(() => {
    return Array.from(new Set(data.map((item) => item.Dance))).sort();
  }, [data]);

  const levels = useMemo(() => {
    return sortLevels(Array.from(new Set(data.map((item) => item.Level))));
  }, [data]);

  const figures = useMemo(() => {
    if (selectedDances.length === 0) return [];
    const danceFigures = data
      .filter((item) => selectedDances.includes(item.Dance))
      .map((item) => item['Figure Name']);
    return Array.from(new Set(danceFigures)).sort();
  }, [data, selectedDances]);

  const filteredFigures = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();

    return figureGroups.filter((group) => {
      const matchesDance = selectedDances.length === 0 || selectedDances.includes(group.dance);
      const matchesFigure = selectedFigures.length === 0 || selectedFigures.includes(group.name);
      const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(group.level);

      if (!matchesDance || !matchesFigure || !matchesLevel) return false;
      if (!searchLower) return true;

      return (
        group.dance.toLowerCase().includes(searchLower) ||
        group.name.toLowerCase().includes(searchLower) ||
        group.generalNotes.toLowerCase().includes(searchLower) ||
        group.steps.some((step) =>
          Object.values(step).some((val) => String(val).toLowerCase().includes(searchLower))
        )
      );
    });
  }, [figureGroups, searchTerm, selectedDances, selectedFigures, selectedLevels]);

  const hasActiveFilters =
    selectedDances.length > 0 ||
    selectedFigures.length > 0 ||
    selectedLevels.length > 0 ||
    searchTerm.length > 0;

  const clearFilters = () => {
    setSelectedDances([]);
    setSelectedFigures([]);
    setSelectedLevels([]);
    setSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedDances,
    setSelectedDances,
    selectedFigures,
    setSelectedFigures,
    selectedLevels,
    setSelectedLevels,
    dances,
    figures,
    levels,
    filteredFigures,
    hasActiveFilters,
    clearFilters,
  };
};
