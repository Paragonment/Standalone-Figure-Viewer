import type { Ref, RefObject } from 'react';
import type { useDanceFilters } from '../../hooks/useDanceFilters';
import MenuButton from '../ui/MenuButton';
import DevFlag from '../ui/DevFlag';
import SearchField from './SearchField';
import FilterBar from './FilterBar';
import './HomeHeader.css';

interface HomeHeaderProps {
  filters: ReturnType<typeof useDanceFilters>;
  placeholder: string;
  searchRef: RefObject<HTMLInputElement | null>;
  // Show the menu button beside the title. Defaults to on.
  menu?: boolean;
  ref?: Ref<HTMLElement>;
}

// Title, development flag, search and filters: the top of the list.
export default function HomeHeader({ filters, placeholder, searchRef, menu = true, ref }: HomeHeaderProps) {
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

  return (
    <header ref={ref} className="home-header">
      <div className="home-title-row">
        <div className="home-title-group">
          <h1 className="fv-display home-title">Figures</h1>
          <DevFlag />
        </div>
        {menu && <MenuButton className="home-menu" />}
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
  );
}
