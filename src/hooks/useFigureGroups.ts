import { useMemo } from 'react';
import type { DanceStep, FigureGroup } from '../types';

// Groups raw CSV rows (one per step) into one entry per Dance+Figure, in
// alphabetical order by figure name.
export const useFigureGroups = (data: DanceStep[]): FigureGroup[] => {
  return useMemo(() => {
    const groups: FigureGroup[] = [];
    const seen = new Map<string, FigureGroup>();

    data.forEach((item) => {
      const key = `${item.Dance} - ${item['Figure Name']}`;
      let group = seen.get(key);
      if (!group) {
        group = {
          dance: item.Dance,
          name: item['Figure Name'],
          level: item.Level,
          steps: [],
          generalNotes: '',
        };
        seen.set(key, group);
        groups.push(group);
      }
      group.steps.push(item);
      if (item['General Notes'] && !group.generalNotes) {
        group.generalNotes = item['General Notes'];
      }
    });

    return groups.sort((a, b) => {
      const nameCompare = a.name.localeCompare(b.name);
      if (nameCompare !== 0) return nameCompare;
      return a.dance.localeCompare(b.dance);
    });
  }, [data]);
};
