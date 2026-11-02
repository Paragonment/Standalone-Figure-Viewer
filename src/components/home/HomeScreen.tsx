import { useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import type { FigureGroup } from '../../types';
import type { useDanceFilters } from '../../hooks/useDanceFilters';
import { useHomeScroll } from '../../hooks/useHomeScroll';
import { summarizeFilters } from '../../utils/filterSummary';
import { buildSections, normalizeQuery } from '../../utils/search';
import HomeHeader from './HomeHeader';
import HomeBar from './HomeBar';
import FigureList from './FigureList';
import './HomeScreen.css';

export interface HomeScreenProps {
  figures: FigureGroup[];
  filters: ReturnType<typeof useDanceFilters>;
  onOpenFigure(figure: FigureGroup): void;
  scrollTopRef: RefObject<number>;
  // The menu button beside the title and in the compact banner. The desktop
  // shell turns it off: its menu sits at the far right of the figure pane.
  showMenu?: boolean;
  // The open figure's key (see figureKey), marked in the list.
  selectedKey?: string;
}

export default function HomeScreen({ figures, filters, onOpenFigure, scrollTopRef, showMenu = true, selectedKey }: HomeScreenProps) {
  const {
    searchTerm,
    selectedDances,
    setSelectedDances,
    selectedLevels,
    setSelectedLevels,
    danceGroups,
  } = filters;

  const { sections, total, scope, grouped } = useMemo(
    () => buildSections({ figures, dances: selectedDances, levels: selectedLevels, query: searchTerm }),
    [figures, selectedDances, selectedLevels, searchTerm],
  );

  const needle = normalizeQuery(searchTerm);
  const filtered = selectedDances.length > 0 || selectedLevels.length > 0;
  const placeholder = `Search ${scope} ${scope === 1 ? 'figure' : 'figures'}`;
  const resetKey = `${selectedDances.join('|')}#${selectedLevels.join('|')}#${needle}`;
  const { scrollRef, headerRef, stuck, onScroll, scrollToTop } = useHomeScroll(scrollTopRef, resetKey);
  const searchRef = useRef<HTMLInputElement>(null);

  const summary = summarizeFilters(selectedDances, selectedLevels, searchTerm, danceGroups);

  const clearFilters = () => {
    setSelectedDances([]);
    setSelectedLevels([]);
  };

  // Focus first, inside the tap, so a phone raises its keyboard.
  const search = () => {
    searchRef.current?.focus({ preventScroll: true });
    scrollToTop();
  };

  return (
    <div className="home">
      <div ref={scrollRef} className="home-scroll" onScroll={onScroll}>
        <HomeHeader
          ref={headerRef}
          filters={filters}
          placeholder={placeholder}
          searchRef={searchRef}
          menu={showMenu}
        />
        <HomeBar
          total={total}
          searching={needle.length > 0}
          filtered={filtered}
          summary={summary}
          stuck={stuck}
          menu={showMenu}
          onClearFilters={clearFilters}
          onShowFilters={scrollToTop}
          onSearch={search}
        />
        <FigureList
          sections={sections}
          total={total}
          allCount={figures.length}
          grouped={grouped}
          query={searchTerm}
          searching={needle.length > 0}
          filtered={filtered}
          onClearFilters={clearFilters}
          onOpenFigure={onOpenFigure}
          selectedKey={selectedKey}
        />
      </div>
    </div>
  );
}
