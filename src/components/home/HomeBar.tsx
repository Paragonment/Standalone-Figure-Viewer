import { SearchIcon } from '../ui/Icons';
import MenuButton from '../ui/MenuButton';
import './HomeBar.css';

interface HomeBarProps {
  total: number;
  searching: boolean;
  // A dance or level filter is active.
  filtered: boolean;
  // The active dances, levels and query in a few words, e.g. "Latin · Silver".
  summary: string[];
  // The header has scrolled away and the bar rests at the top.
  stuck: boolean;
  onClearFilters(): void;
  onShowFilters(): void;
  onSearch(): void;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

// The count bar on top of the list. Once the title, search and filters have
// scrolled away it stays at the top as a compact banner: the title, what the
// list is showing, search and the menu.
export default function HomeBar({
  total,
  searching,
  filtered,
  summary,
  stuck,
  onClearFilters,
  onShowFilters,
  onSearch,
}: HomeBarProps) {
  const countLabel = searching ? plural(total, 'match', 'matches') : plural(total, 'figure', 'figures');

  return (
    <div className={stuck ? 'hb hb-stuck' : 'hb'}>
      <span aria-live="polite" className="fv-sr-only">
        {countLabel}
      </span>
      <div className={stuck ? 'hb-rest hb-hidden' : 'hb-rest'} inert={stuck}>
        <span aria-hidden="true" className="hb-count">
          {countLabel}
        </span>
        {filtered && total > 0 && (
          <button type="button" className="fv-act hb-act" onClick={onClearFilters}>
            {searching ? 'Search all' : 'Show all'}
          </button>
        )}
      </div>
      <div className={stuck ? 'hb-compact' : 'hb-compact hb-hidden'} inert={!stuck}>
        <button type="button" className="hb-jump" onClick={onShowFilters}>
          <span className="hb-title">Figures</span>
          {/* What is picked gives way before the count does. */}
          <span className="hb-summary">
            {summary.length > 0 && <span className="hb-picked">{summary.join(' · ')}</span>}
            <span className="hb-tally">
              {summary.length > 0 && ' · '}
              {countLabel}
            </span>
          </span>
          <span className="fv-sr-only">, show filters</span>
        </button>
        <button type="button" className="hb-icon" aria-label="Search" onClick={onSearch}>
          <SearchIcon />
        </button>
        <MenuButton />
      </div>
    </div>
  );
}
