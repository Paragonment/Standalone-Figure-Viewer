import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { FigureGroup } from '../types';
import { useDanceData } from '../hooks/useDanceData';
import { useFigureGroups } from '../hooks/useFigureGroups';
import { useDanceFilters } from '../hooks/useDanceFilters';
import FilterToggle from './FilterToggle';
import DanceTable from './DanceTable';
import ColumnToggle from './ColumnToggle';
import FigureDetail, { type DetailMode } from './FigureDetail';
import BottomSheet from './BottomSheet';
import StepFieldFilter from './StepFieldFilter';
import { useIsMobile } from '../hooks/useIsMobile';
import { STEP_FIELDS } from '../utils/stepFields';
import './ViewerContainer.css';

interface FigureHistoryState {
  figureKey: string;
}

const getFigureKey = (figure: FigureGroup) => `${figure.dance}-${figure.name}`;

const readHistoryFigureKey = (): string | null =>
  (window.history.state as FigureHistoryState | null)?.figureKey ?? null;

interface ViewerContainerProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ViewerContainer: React.FC<ViewerContainerProps> = ({ theme, toggleTheme }) => {
  const { data, loading, error } = useDanceData();
  const figureGroups = useFigureGroups(data);
  const {
    searchTerm,
    setSearchTerm,
    selectedDances,
    setSelectedDances,
    selectedFigures,
    setSelectedFigures,
    selectedLevels,
    setSelectedLevels,
    dances,
    figures,
    levels,
    filteredFigures,
    hasActiveFilters,
    clearFilters,
  } = useDanceFilters(data, figureGroups);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isMobile = useIsMobile();

  // Figure detail navigation (mobile only - desktop expands the row
  // in place instead). Opening a figure pushes a history entry, so the
  // phone's back gesture returns to the list instead of leaving the app;
  // the open figure is read back from history.state, which also restores
  // it after a reload. detailMode is lifted here rather than into
  // FigureDetail so it persists across re-renders of the detail view.
  const [activeFigureKey, setActiveFigureKey] = useState<string | null>(readHistoryFigureKey);
  const [detailMode, setDetailMode] = useState<DetailMode>('cards');

  // The list's scroll offset survives a round trip through the detail
  // view, so going back lands where you left off.
  const listScrollTopRef = useRef(0);

  const activeFigure = useMemo<FigureGroup | null>(() => {
    if (!activeFigureKey) return null;
    return figureGroups.find((f) => getFigureKey(f) === activeFigureKey) ?? null;
  }, [figureGroups, activeFigureKey]);

  const view: 'list' | 'detail' = activeFigure ? 'detail' : 'list';

  const openFigure = (figure: FigureGroup) => {
    const figureKey = getFigureKey(figure);
    window.history.pushState({ figureKey } satisfies FigureHistoryState, '');
    setActiveFigureKey(figureKey);
    setDetailMode('cards');
    setShowFilterControl(false);
    setShowColumnControl(false);
  };

  const closeDetail = useCallback(() => {
    if (readHistoryFigureKey()) {
      // The popstate listener below clears activeFigureKey.
      window.history.back();
    } else {
      setActiveFigureKey(null);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => setActiveFigureKey(readHistoryFigureKey());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Escape returns to the figure list from the detail view.
  useEffect(() => {
    if (view !== 'detail') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // An open sheet handles its own Escape; don't also leave the figure.
      if (e.key === 'Escape' && !document.querySelector('dialog[open]')) closeDetail();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, closeDetail]);

  // Dropdown states
  const [showFilterControl, setShowFilterControl] = useState(false);
  const [showColumnControl, setShowColumnControl] = useState(false);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const columnBtnRef = useRef<HTMLButtonElement>(null);
  const columnPanelRef = useRef<HTMLDivElement>(null);

  // Initialize visible columns once data is loaded
  useEffect(() => {
    if (data.length > 0 && visibleColumns.length === 0) {
      const allHeaders = Object.keys(data[0]);
      // Default visible columns - common ones
      const defaults = ['Dance', 'Figure Name', 'Level', 'Step', 'Lead Feet Positions', 'Lead Footwork', 'Follow Feet Positions', 'Follow Footwork'];
      setVisibleColumns(allHeaders.filter(h => defaults.includes(h) || h === 'Dance' || h === 'Figure Name' || h === 'Level' || h === 'Step'));
    }
  }, [data, visibleColumns.length]);

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

  // Close an open dropdown panel on outside click or Escape. On mobile the
  // same controls live in bottom sheets, which dismiss themselves.
  useEffect(() => {
    if (isMobile || (!showFilterControl && !showColumnControl)) return;

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
  }, [isMobile, showFilterControl, showColumnControl]);

  const allColumns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const shownFieldCount = STEP_FIELDS.filter(
    (f) => visibleColumns.includes(f.leadKey) || visibleColumns.includes(f.followKey)
  ).length;

  const toggleColumn = (column: string) => {
    setVisibleColumns(prev => 
      prev.includes(column) 
        ? prev.filter(c => c !== column) 
        : [...prev, column]
    );
  };

  if (loading) {
    return (
      <div className="status-container">
        <div className="loading-spinner"></div>
        <div className="status-message">Loading dance technique database...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="status-container error">
        <span className="error-icon">⚠️</span>
        <div className="status-message">Failed to load database: {error}</div>
      </div>
    );
  }

  return (
    <div className="viewer-layout">
      <main className="main-content">
        <header className={`viewer-header ${view === 'list' && (searchFocused || searchTerm) ? 'search-active' : ''}`}>
          <div className="title-area">
            {view === 'detail' && activeFigure && (
              <button
                type="button"
                className="detail-back-btn"
                onClick={closeDetail}
                aria-label="Back to figures"
                title="Back to figures"
              >
                ‹
              </button>
            )}
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              {view === 'detail' && activeFigure ? (
                <>
                  <button type="button" className="breadcrumb-item linkable detail-root" onClick={closeDetail}>
                    Dances
                  </button>
                  <span className="breadcrumb-separator detail-root">/</span>
                  <span className="breadcrumb-item active" aria-current="page">{activeFigure.name}</span>
                </>
              ) : (
                <>
                  <button type="button" className="breadcrumb-item linkable" onClick={() => { setSelectedDances([]); setSelectedFigures([]); }}>
                    Dances
                  </button>
                  {selectedDances.length > 0 && (
                    <>
                      <span className="breadcrumb-separator">/</span>
                      <button type="button" className="breadcrumb-item linkable" onClick={() => setSelectedFigures([])}>
                        {selectedDances.length === 1 ? selectedDances[0] : `${selectedDances.length} Dances`}
                      </button>
                    </>
                  )}
                  {selectedFigures.length > 0 && (
                    <>
                      <span className="breadcrumb-separator">/</span>
                      <span className="breadcrumb-item active" aria-current="page">
                        {selectedFigures.length === 1 ? selectedFigures[0] : `${selectedFigures.length} Figures`}
                      </span>
                    </>
                  )}
                </>
              )}
            </nav>
          </div>

          <div className="header-actions">
            {view === 'list' && hasActiveFilters && (
              <button
                className="clear-filters-pill"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}

            {view === 'list' && (
            <button
              ref={filterBtnRef}
              className={`header-filter-toggle-btn ${showFilterControl ? 'active' : ''}`}
              onClick={() => {
                setShowFilterControl(!showFilterControl);
                setShowColumnControl(false);
              }}
              title={showFilterControl ? "Hide Filters" : "Show Filters"}
              aria-expanded={showFilterControl}
            >
              🪩
            </button>
            )}

            {/* On mobile the list has no step columns to configure, so this
                only appears on a figure, where it picks the step details. */}
            {(!isMobile || view === 'detail') && (
            <button
              ref={columnBtnRef}
              className={`header-column-toggle-btn ${showColumnControl ? 'active' : ''}`}
              onClick={() => {
                setShowColumnControl(!showColumnControl);
                setShowFilterControl(false);
              }}
              title={isMobile ? 'Choose step details' : showColumnControl ? 'Hide Column Settings' : 'Show Column Settings'}
              aria-label={isMobile ? `Choose step details, ${shownFieldCount} of ${STEP_FIELDS.length} shown` : undefined}
              aria-expanded={showColumnControl}
            >
              ⚙️
              {isMobile && shownFieldCount < STEP_FIELDS.length && (
                <span className="header-btn-badge" aria-hidden="true">{shownFieldCount}</span>
              )}
            </button>
            )}

            <button
              className="header-theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {view === 'list' && (
            <div
              className={`expandable-search-container ${searchFocused ? 'focused' : ''} ${searchTerm ? 'has-text' : ''}`}
              onClick={() => searchInputRef.current?.focus()}
            >
              <span className="search-icon">🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder="Search for anything"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {searchTerm && (
                <button
                  className="search-clear-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm('');
                  }}
                >
                  ×
                </button>
              )}
              {!searchFocused && !searchTerm && (
                <span className="search-shortcut-hint">/</span>
              )}
            </div>
            )}
          </div>
        </header>

        <div className="content-body">
          {!isMobile && view === 'list' && showFilterControl && (
            <div ref={filterPanelRef}>
              <FilterToggle
                dances={dances}
                selectedDances={selectedDances}
                setSelectedDances={setSelectedDances}
                levels={levels}
                selectedLevels={selectedLevels}
                setSelectedLevels={setSelectedLevels}
                figures={figures}
                selectedFigures={selectedFigures}
                setSelectedFigures={setSelectedFigures}
                filteredCount={filteredFigures.length}
              />
            </div>
          )}

          {!isMobile && showColumnControl && (
            <div ref={columnPanelRef}>
              <ColumnToggle
                columns={allColumns}
                visibleColumns={visibleColumns}
                setVisibleColumns={setVisibleColumns}
                toggleColumn={toggleColumn}
              />
            </div>
          )}

          {isMobile && (
            <>
              <BottomSheet
                open={view === 'list' && showFilterControl}
                onClose={() => setShowFilterControl(false)}
                title="Filter figures"
                doneLabel={`Show ${filteredFigures.length} figure${filteredFigures.length === 1 ? '' : 's'}`}
              >
                <FilterToggle
                  dances={dances}
                  selectedDances={selectedDances}
                  setSelectedDances={setSelectedDances}
                  levels={levels}
                  selectedLevels={selectedLevels}
                  setSelectedLevels={setSelectedLevels}
                  figures={figures}
                  selectedFigures={selectedFigures}
                  setSelectedFigures={setSelectedFigures}
                  filteredCount={filteredFigures.length}
                />
              </BottomSheet>

              <BottomSheet
                open={view === 'detail' && showColumnControl}
                onClose={() => setShowColumnControl(false)}
                title="Show on each step"
              >
                <StepFieldFilter visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} />
              </BottomSheet>
            </>
          )}

          {view === 'detail' && activeFigure ? (
            <FigureDetail
              figure={activeFigure}
              visibleColumns={visibleColumns}
              mode={detailMode}
              setMode={setDetailMode}
            />
          ) : (
            <DanceTable
              data={filteredFigures}
              visibleColumns={visibleColumns}
              selectedFigures={selectedFigures}
              onSelectFigure={openFigure}
              scrollTopRef={listScrollTopRef}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default ViewerContainer;
