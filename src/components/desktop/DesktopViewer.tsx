import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { DanceStyle, FigureGroup } from '../../types';
import type { DanceDataset } from '../../hooks/useDanceData';
import type { useDanceFilters } from '../../hooks/useDanceFilters';
import { useSettings } from '../../state/useSettings';
import FilterToggle from '../FilterToggle';
import DanceTable from '../DanceTable';
import ColumnToggle from '../ColumnToggle';
import { SearchIcon, ClearIcon } from '../ui/Icons';
import DevFlag from '../ui/DevFlag';
import { describeSelection } from '../../utils/danceStyles';
import type { ThemePreference } from '../../state/settingsContext';
import './DesktopViewer.css';

export interface DesktopViewerProps {
  datasets: DanceDataset[];
  figureGroups: FigureGroup[];
  filters: ReturnType<typeof useDanceFilters>;
}

// Desktop keeps the data-dense table: breadcrumbs, a filter panel, a column
// panel and rows that expand in place to show their steps.
const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const DesktopViewer: React.FC<DesktopViewerProps> = ({ datasets, filters }) => {
  const {
    searchTerm,
    setSearchTerm,
    selectedDances,
    setSelectedDances,
    selectedLevels,
    setSelectedLevels,
    danceGroups,
    levels,
    filteredFigures,
    hasActiveFilters,
    clearFilters,
  } = filters;
  const { theme, setTheme } = useSettings();

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Dropdown states
  const [showFilterControl, setShowFilterControl] = useState(false);
  const [showColumnControl, setShowColumnControl] = useState(false);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const columnBtnRef = useRef<HTMLButtonElement>(null);
  const columnPanelRef = useRef<HTMLDivElement>(null);

  // Every column any style's CSV has, Standard's first, in CSV order.
  const allColumns = useMemo(() => {
    return Array.from(new Set(datasets.flatMap((d) => d.columns)));
  }, [datasets]);

  // Which styles chart each column, so the column settings can mark the
  // ones that only apply to Standard or only to Latin figures.
  const columnStyles = useMemo(() => {
    const styles: Record<string, DanceStyle[]> = {};
    datasets.forEach((d) => d.columns.forEach((c) => (styles[c] ??= []).push(d.style)));
    return styles;
  }, [datasets]);

  // Initialize visible columns once data is loaded
  useEffect(() => {
    if (allColumns.length > 0 && visibleColumns.length === 0) {
      // Default visible columns - common ones
      const defaults = [
        'Dance', 'Figure Name', 'Level', 'Step', 'Timing',
        'Lead Feet Positions', 'Lead Footwork', 'Follow Feet Positions', 'Follow Footwork',
        'Starting Position', 'Ending Position',
      ];
      setVisibleColumns(allColumns.filter(h => defaults.includes(h)));
    }
  }, [allColumns, visibleColumns.length]);

  // Focus search input when user presses the "/" key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close an open dropdown panel on outside click or Escape.
  useEffect(() => {
    if (!showFilterControl && !showColumnControl) return;

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        showFilterControl &&
        !filterPanelRef.current?.contains(target) &&
        !filterBtnRef.current?.contains(target)
      ) {
        setShowFilterControl(false);
      }
      if (
        showColumnControl &&
        !columnPanelRef.current?.contains(target) &&
        !columnBtnRef.current?.contains(target)
      ) {
        setShowColumnControl(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowFilterControl(false);
        setShowColumnControl(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showFilterControl, showColumnControl]);

  const toggleColumn = (column: string) => {
    setVisibleColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  return (
    <div className="viewer-layout">
      <main className="main-content">
        <header className="viewer-header">
          <div className="title-area">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <button type="button" className="breadcrumb-item linkable" onClick={() => setSelectedDances([])}>
                Figures
              </button>
              <DevFlag />
              {selectedDances.length > 0 && (
                <>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-item active" aria-current="page">
                    {describeSelection(selectedDances, danceGroups)}
                  </span>
                </>
              )}
            </nav>
          </div>

          <div className="header-actions">
            {hasActiveFilters && (
              <button type="button" className="fv-act header-show-all" onClick={clearFilters}>
                Show all
              </button>
            )}

            <button
              ref={filterBtnRef}
              type="button"
              className={`header-panel-btn ${showFilterControl ? 'active' : ''}`}
              onClick={() => {
                setShowFilterControl(!showFilterControl);
                setShowColumnControl(false);
              }}
              aria-expanded={showFilterControl}
            >
              Filters
            </button>

            <button
              ref={columnBtnRef}
              type="button"
              className={`header-panel-btn ${showColumnControl ? 'active' : ''}`}
              onClick={() => {
                setShowColumnControl(!showColumnControl);
                setShowFilterControl(false);
              }}
              aria-expanded={showColumnControl}
            >
              Columns
            </button>

            <div className="appearance-control" role="group" aria-label="Appearance">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`appearance-seg ${theme === option.value ? 'on' : ''}`}
                  aria-pressed={theme === option.value}
                  onClick={() => setTheme(option.value)}
                >
                  <span className="appearance-seg-fill" />
                  <span className="appearance-seg-label">{option.label}</span>
                </button>
              ))}
            </div>

            <div
              className={`expandable-search-container ${searchFocused ? 'focused' : ''} ${searchTerm ? 'has-text' : ''}`}
              role="search"
              onClick={() => searchInputRef.current?.focus()}
            >
              <SearchIcon className="search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder="Search for anything"
                aria-label="Search for anything"
                autoComplete="off"
                spellCheck={false}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="search-clear-btn"
                  aria-label="Clear search"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm('');
                    searchInputRef.current?.focus();
                  }}
                >
                  <ClearIcon />
                </button>
              )}
              {!searchFocused && !searchTerm && (
                <span className="search-shortcut-hint" aria-hidden="true">/</span>
              )}
            </div>
          </div>
        </header>

        <div className="content-body">
          {showFilterControl && (
            <div ref={filterPanelRef}>
              <FilterToggle
                danceGroups={danceGroups}
                selectedDances={selectedDances}
                setSelectedDances={setSelectedDances}
                levels={levels}
                selectedLevels={selectedLevels}
                setSelectedLevels={setSelectedLevels}
                filteredCount={filteredFigures.length}
              />
            </div>
          )}

          {showColumnControl && (
            <div ref={columnPanelRef}>
              <ColumnToggle
                columns={allColumns}
                columnStyles={columnStyles}
                visibleColumns={visibleColumns}
                setVisibleColumns={setVisibleColumns}
                toggleColumn={toggleColumn}
              />
            </div>
          )}

          {/* Rows expand in place; there is no separate figure screen. */}
          <DanceTable data={filteredFigures} visibleColumns={visibleColumns} />
        </div>
      </main>
    </div>
  );
};

export default DesktopViewer;
