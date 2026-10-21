import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDanceData } from '../hooks/useDanceData';
import { useFigureGroups } from '../hooks/useFigureGroups';
import { useDanceFilters } from '../hooks/useDanceFilters';
import FilterToggle from './FilterToggle';
import DanceTable from './DanceTable';
import ColumnToggle from './ColumnToggle';
import './ViewerContainer.css';

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

  // Close an open dropdown panel on outside click or Escape
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

  const allColumns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

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
        <header className="viewer-header">
          <div className="title-area">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <span className="breadcrumb-item linkable" onClick={() => { setSelectedDances([]); setSelectedFigures([]); }}>
                Dances
              </span>
              {selectedDances.length > 0 && (
                <>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-item linkable" onClick={() => setSelectedFigures([])}>
                    {selectedDances.length === 1 ? selectedDances[0] : `${selectedDances.length} Dances`}
                  </span>
                </>
              )}
              {selectedFigures.length > 0 && (
                <>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-item active">
                    {selectedFigures.length === 1 ? selectedFigures[0] : `${selectedFigures.length} Figures`}
                  </span>
                </>
              )}
            </nav>
            <h1>
              {selectedFigures.length > 0 
                ? (selectedFigures.length === 1 ? selectedFigures[0] : 'Selected Figures') 
                : selectedDances.length > 0 
                  ? `${selectedDances.length === 1 ? selectedDances[0] : 'Selected'} Figures` 
                  : 'Standard Ballroom Techniques'}
            </h1>
            <p>
              {selectedFigures.length > 0 
                ? `Detailed steps, alignments, footwork, rise & fall, CBM, and sway for ${selectedFigures.length === 1 ? selectedFigures[0] : 'the selected figures'}.`
                : selectedDances.length > 0 
                  ? `Technique syllabus and figures for the selected competitive dances.`
                  : 'Select a dance style to explore figures, step techniques, and alignment guides.'}
            </p>
          </div>

          <div className="header-actions">
            {hasActiveFilters && (
              <button
                className="clear-filters-pill"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}

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

            <button
              ref={columnBtnRef}
              className={`header-column-toggle-btn ${showColumnControl ? 'active' : ''}`}
              onClick={() => {
                setShowColumnControl(!showColumnControl);
                setShowFilterControl(false);
              }}
              title={showColumnControl ? "Hide Column Settings" : "Show Column Settings"}
              aria-expanded={showColumnControl}
            >
              ⚙️
            </button>

            <button 
              className="header-theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

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
          </div>
        </header>
        
        <div className="content-body">
          {showFilterControl && (
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

          {showColumnControl && (
            <div ref={columnPanelRef}>
              <ColumnToggle
                columns={allColumns}
                visibleColumns={visibleColumns}
                setVisibleColumns={setVisibleColumns}
                toggleColumn={toggleColumn}
              />
            </div>
          )}

          <DanceTable 
            data={filteredFigures} 
            visibleColumns={visibleColumns} 
            selectedFigures={selectedFigures}
          />
        </div>
      </main>
    </div>
  );
};

export default ViewerContainer;
