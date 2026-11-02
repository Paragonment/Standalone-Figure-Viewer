import { useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import type { FigureGroup } from '../../types';
import type { useDanceFilters } from '../../hooks/useDanceFilters';
import { useHomeScroll } from '../../hooks/useHomeScroll';
import { describeSelection } from '../../utils/danceStyles';
import { buildSections, normalizeQuery } from '../../utils/search';
import MenuButton from '../ui/MenuButton';
import DevFlag from '../ui/DevFlag';
import SearchField from './SearchField';
import FilterBar from './FilterBar';
import HomeBar from './HomeBar';
import FigureList from './FigureList';
import './HomeScreen.css';

export interface HomeScreenProps {
  figures: FigureGroup[];
  filters: ReturnType<typeof useDanceFilters>;
  onOpenFigure(figure: FigureGroup): void;
  scrollTopRef: RefObject<number>;
}

const describeLevels = (levels: string[]) => (levels.length <= 2 ? levels.join(', ') : `${levels.length} Levels`);

export default function HomeScreen({ figures, filters, onOpenFigure, scrollTopRef }: HomeScreenProps) {
  const {
    searchTerm,
    setSearchTerm,
    selectedDances,
    setSelectedDances,
    selectedLevels,
    setSelectedLevels,
    danceGroups,
    levels,
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

  const summary = [
    selectedDances.length > 0 ? describeSelection(selectedDances, danceGroups) : '',
    selectedLevels.length > 0 ? describeLevels(selectedLevels) : '',
    needle.length > 0 ? `“${searchTerm.trim()}”` : '',
  ].filter(Boolean);

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
        <header ref={headerRef} className="home-header">
          <div className="home-title-row">
            <div className="home-title-group">
              <h1 className="fv-display home-title">Figures</h1>
              <DevFlag />
            </div>
            <MenuButton className="home-menu" />
          </div>
          <div className="home-search">
            <SearchField inputRef={searchRef} value={searchTerm} onChange={setSearchTerm} placeholder={placeholder} />
          </div>
          <div className="home-filters">
            <FilterBar
              danceGroups={danceGroups}
              levels={levels}
              selectedDances={selectedDances}
              onDancesChange={setSelectedDances}
              selectedLevels={selectedLevels}
              onLevelsChange={setSelectedLevels}
            />
          </div>
        </header>
        <HomeBar
          total={total}
          searching={needle.length > 0}
          filtered={filtered}
          summary={summary}
          stuck={stuck}
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
        />
      </div>
    </div>
  );
}
