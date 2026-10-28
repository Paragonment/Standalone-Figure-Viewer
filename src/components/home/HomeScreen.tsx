import { useMemo } from 'react';
import type { RefObject } from 'react';
import type { FigureGroup } from '../../types';
import type { useDanceFilters } from '../../hooks/useDanceFilters';
import { buildSections, normalizeQuery } from '../../utils/search';
import MenuButton from '../ui/MenuButton';
import DevFlag from '../ui/DevFlag';
import SearchField from './SearchField';
import FilterBar from './FilterBar';
import FigureList from './FigureList';
import './HomeScreen.css';

export interface HomeScreenProps {
  figures: FigureGroup[];
  filters: ReturnType<typeof useDanceFilters>;
  onOpenFigure(figure: FigureGroup): void;
  scrollTopRef: RefObject<number>;
}

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

  const clearFilters = () => {
    setSelectedDances([]);
    setSelectedLevels([]);
  };

  return (
    <div className="home">
      <header className="home-header">
        <div className="home-title-row">
          <div className="home-title-group">
            <h1 className="fv-display home-title">Figures</h1>
            <DevFlag />
          </div>
          <MenuButton className="home-menu" />
        </div>
        <div className="home-search">
          <SearchField value={searchTerm} onChange={setSearchTerm} placeholder={placeholder} />
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
        scrollTopRef={scrollTopRef}
        resetKey={`${selectedDances.join('|')}#${selectedLevels.join('|')}#${needle}`}
      />
    </div>
  );
}
