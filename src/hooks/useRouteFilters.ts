import { useEffect, useMemo, useRef } from 'react';
import { formatRoute, homeRoute, matchSlugs } from '../utils/route';
import type { useDanceFilters } from './useDanceFilters';
import { useRoute } from './useRoute';

const same = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i]);

// Keeps the list's filters and search in the address of the list, both ways.
//
// - Arriving on the list (a link, a reload, Back) sets the filters from the
//   address.
// - Changing a filter or the search rewrites the address in place. While a
//   figure is open the address is the figure's, so the filters just stay.
//
// Returns the list's own address, for Back to fall to when there is no
// earlier entry.
export function useRouteFilters(filters: ReturnType<typeof useDanceFilters>) {
  const { route, source, replaceHome } = useRoute();
  const { danceGroups, levels, searchTerm, selectedDances, selectedLevels } = filters;
  const { setSearchTerm, setSelectedDances, setSelectedLevels } = filters;

  const dances = useMemo(() => danceGroups.flatMap((g) => g.dances), [danceGroups]);
  // The names are known once the figures have loaded.
  const ready = levels.length > 0;

  // The app's own rewrite of the address is not an arrival.
  const arrival = source === 'replace' ? null : route;
  useEffect(() => {
    if (!ready || arrival?.screen !== 'home') return;
    const nextDances = matchSlugs(arrival.dances, dances);
    const nextLevels = matchSlugs(arrival.levels, levels);
    setSelectedDances((prev) => (same(prev, nextDances) ? prev : nextDances));
    setSelectedLevels((prev) => (same(prev, nextLevels) ? prev : nextLevels));
    setSearchTerm(arrival.query);
  }, [arrival, ready, dances, levels, setSelectedDances, setSelectedLevels, setSearchTerm]);

  const home = useMemo(
    () => homeRoute(selectedDances, selectedLevels, searchTerm),
    [selectedDances, selectedLevels, searchTerm],
  );

  const written = useRef(formatRoute(home));
  useEffect(() => {
    const hash = formatRoute(home);
    if (written.current === hash) return;
    written.current = hash;
    if (ready && route.screen === 'home' && formatRoute(route) !== hash) replaceHome(home);
  }, [home, ready, route, replaceHome]);

  return home;
}
