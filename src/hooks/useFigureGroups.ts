import { useMemo } from 'react';
import type { FigureGroup } from '../types';
import type { DanceDataset } from './useDanceData';

const figureKey = (dance: string, name: string) => `${dance} - ${name}`;

// Groups raw CSV rows (one per step) into one entry per Dance+Figure, in
// alphabetical order by figure name, each with its Precede and Follow links.
export const useFigureGroups = (datasets: DanceDataset[]): FigureGroup[] => {
  return useMemo(() => {
    const groups: FigureGroup[] = [];
    const seen = new Map<string, FigureGroup>();

    datasets.forEach(({ style, rows, transitions }) => {
      rows.forEach((item) => {
        const key = figureKey(item.Dance, item['Figure Name']);
        let group = seen.get(key);
        if (!group) {
          group = {
            style,
            dance: item.Dance,
            name: item['Figure Name'],
            level: item.Level,
            steps: [],
            generalNotes: '',
            startingPosition: '',
            endingPosition: '',
            links: [],
          };
          seen.set(key, group);
          groups.push(group);
        }
        group.steps.push(item);
        // Figure-level facts are charted on the first step only.
        if (item['General Notes'] && !group.generalNotes) group.generalNotes = item['General Notes'];
        if (item['Starting Position'] && !group.startingPosition) group.startingPosition = item['Starting Position'];
        if (item['Ending Position'] && !group.endingPosition) group.endingPosition = item['Ending Position'];
      });
      // In CSV order, which is the book's order.
      transitions.forEach(({ dance, figure, link }) => {
        seen.get(figureKey(dance, figure))?.links.push(link);
      });
    });

    return groups.sort((a, b) => {
      const nameCompare = a.name.localeCompare(b.name);
      if (nameCompare !== 0) return nameCompare;
      return a.dance.localeCompare(b.dance);
    });
  }, [datasets]);
};
