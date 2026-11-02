import { describeSelection, type StyleDances } from './danceStyles';

const describeLevels = (levels: string[]) => (levels.length <= 2 ? levels.join(', ') : `${levels.length} Levels`);

// What the list is showing in a few words, e.g. ["Latin", "Silver"]: the
// picked dances, the picked levels and the query, each only when set.
export const summarizeFilters = (
  dances: string[],
  levels: string[],
  query: string,
  danceGroups: StyleDances[],
): string[] =>
  [
    dances.length > 0 ? describeSelection(dances, danceGroups) : '',
    levels.length > 0 ? describeLevels(levels) : '',
    query.trim().length > 0 ? `“${query.trim()}”` : '',
  ].filter(Boolean);
