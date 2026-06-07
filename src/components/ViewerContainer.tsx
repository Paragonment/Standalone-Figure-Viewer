import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDanceData } from '../hooks/useDanceData';
import type { FigureGroup } from '../types';
import Sidebar from './Sidebar';
import DanceTable from './DanceTable';
import ColumnToggle from './ColumnToggle';
import './ViewerContainer.css';

interface ViewerContainerProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ViewerContainer: React.FC<ViewerContainerProps> = ({ theme, toggleTheme }) => {
  const { data, loading, error } = useDanceData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDance, setSelectedDance] = useState('');
  const [selectedFigure, setSelectedFigure] = useState('');
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sidebar and Column Control states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showColumnControl, setShowColumnControl] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth > 900 : true
  );

  // Initialize visible columns once data is loaded
  useEffect(() => {
    if (data.length > 0 && visibleColumns.length === 0) {
      const allHeaders = Object.keys(data[0]);
      // Default visible columns - common ones
      const defaults = ['Dance', 'Figure Name', 'Step', 'Lead Feet Positions', 'Lead Footwork', 'Follow Feet Positions', 'Follow Footwork'];
      setVisibleColumns(allHeaders.filter(h => defaults.includes(h) || h === 'Dance' || h === 'Figure Name' || h === 'Step'));
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

  // Group raw step rows into structured figures
  const figureGroups = useMemo<FigureGroup[]>(() => {
    const groups: FigureGroup[] = [];
    const seen = new Map<string, FigureGroup>();

    data.forEach(item => {
      const key = `${item.Dance} - ${item["Figure Name"]}`;
      let group = seen.get(key);
      if (!group) {
        group = {
          dance: item.Dance,
          name: item["Figure Name"],
          steps: [],
          generalNotes: ''
        };
        seen.set(key, group);
        groups.push(group);
      }
      group.steps.push(item);
      if (item["General Notes"] && !group.generalNotes) {
        group.generalNotes = item["General Notes"];
      }
    });

    return groups;
  }, [data]);

  const dances = useMemo(() => {
    const uniqueDances = new Set(data.map((item) => item.Dance));
    return Array.from(uniqueDances).sort();
  }, [data]);

  const figures = useMemo(() => {
    if (!selectedDance) return [];
    const danceFigures = data
      .filter(item => item.Dance === selectedDance)
      .map(item => item["Figure Name"]);
    return Array.from(new Set(danceFigures)).sort();
  }, [data, selectedDance]);

  const filteredFigures = useMemo(() => {
    return figureGroups.filter((group) => {
      // 1. Filter by selected dance
      const matchesDance = selectedDance === '' || group.dance === selectedDance;
      
      // 2. Filter by selected figure
      const matchesFigure = selectedFigure === '' || group.name === selectedFigure;
      
      // 3. Filter by search term
      const searchLower = searchTerm.trim().toLowerCase();
      if (!searchLower) return matchesDance && matchesFigure;
      
      const matchesSearch =
        group.dance.toLowerCase().includes(searchLower) ||
        group.name.toLowerCase().includes(searchLower) ||
        group.generalNotes.toLowerCase().includes(searchLower) ||
        group.steps.some((step) =>
          Object.values(step).some((val) =>
            String(val).toLowerCase().includes(searchLower)
          )
        );
        
      return matchesDance && matchesFigure && matchesSearch;
    });
  }, [figureGroups, searchTerm, selectedDance, selectedFigure]);

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
    <div className={`viewer-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${showColumnControl ? 'column-control-open' : 'column-control-closed'}`}>
      {/* Mobile Sidebar Overlay Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="mobile-sidebar-backdrop" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar 
        dances={dances}
        selectedDance={selectedDance}
        setSelectedDance={setSelectedDance}
        figures={figures}
        selectedFigure={selectedFigure}
        setSelectedFigure={setSelectedFigure}
        theme={theme}
        toggleTheme={toggleTheme}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />
      
      <main className="main-content">
        <header className="viewer-header">
          <div className="title-area">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <button 
                className="mobile-menu-toggle-btn"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
              >
                ☰
              </button>
              <span className="breadcrumb-item linkable" onClick={() => { setSelectedDance(''); setSelectedFigure(''); }}>
                Dances
              </span>
              {selectedDance && (
                <>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-item linkable" onClick={() => setSelectedFigure('')}>
                    {selectedDance}
                  </span>
                </>
              )}
              {selectedFigure && (
                <>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-item active">{selectedFigure}</span>
                </>
              )}
            </nav>
            <h1>
              {selectedFigure ? selectedFigure : selectedDance ? `${selectedDance} Figures` : 'Standard Ballroom Techniques'}
            </h1>
            <p>
              {selectedFigure 
                ? `Detailed steps, alignments, footwork, rise & fall, CBM, and sway for ${selectedFigure}.`
                : selectedDance 
                  ? `Technique syllabus and figures for the competitive ${selectedDance}.`
                  : 'Select a dance style to explore figures, step techniques, and alignment guides.'}
            </p>
          </div>

          <div className="header-actions">
            {(selectedDance || selectedFigure || searchTerm) && !showColumnControl && (
              <button 
                className="clear-filters-pill"
                onClick={() => {
                  setSelectedDance('');
                  setSelectedFigure('');
                  setSearchTerm('');
                }}
              >
                Clear
              </button>
            )}

            <button 
              className={`header-column-toggle-btn ${showColumnControl ? 'active' : ''}`}
              onClick={() => setShowColumnControl(!showColumnControl)}
              title={showColumnControl ? "Hide Column Settings" : "Show Column Settings"}
            >
              ⚙️
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
                placeholder="Search techniques..."
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
          {showColumnControl && (
            <ColumnToggle 
              columns={allColumns}
              visibleColumns={visibleColumns}
              setVisibleColumns={setVisibleColumns}
              toggleColumn={toggleColumn}
              filteredCount={filteredFigures.length}
              hasFilters={!!(selectedDance || selectedFigure || searchTerm)}
              onClearFilters={() => {
                setSelectedDance('');
                setSelectedFigure('');
                setSearchTerm('');
              }}
            />
          )}

          <DanceTable 
            data={filteredFigures} 
            visibleColumns={visibleColumns} 
            selectedFigure={selectedFigure}
          />
        </div>
      </main>
    </div>
  );
};

export default ViewerContainer;
