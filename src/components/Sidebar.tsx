import React, { useState, useMemo } from 'react';
import './Sidebar.css';

interface SidebarProps {
  dances: string[];
  selectedDance: string;
  setSelectedDance: (dance: string) => void;
  figures: string[];
  selectedFigure: string;
  setSelectedFigure: (figure: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  dances,
  selectedDance,
  setSelectedDance,
  figures,
  selectedFigure,
  setSelectedFigure,
  theme,
  toggleTheme,
}) => {
  const [standardExpanded, setStandardExpanded] = useState(true);
  const [figuresExpanded, setFiguresExpanded] = useState(true);
  const [figureSearch, setFigureSearch] = useState('');

  // Filter figures list locally by user search
  const filteredFigures = useMemo(() => {
    if (!figureSearch.trim()) return figures;
    const lower = figureSearch.toLowerCase();
    return figures.filter(f => f.toLowerCase().includes(lower));
  }, [figures, figureSearch]);

  const getDanceEmoji = (dance: string) => {
    switch (dance.toLowerCase()) {
      case 'waltz': return '⏳';
      case 'tango': return '🌹';
      case 'foxtrot': return '🦊';
      case 'quickstep': return '⚡';
      default: return '💃';
    }
  };

  return (
    <aside className="sidebar-container">
      {/* Pane 1: Sidebar Rail */}
      <div className="sidebar-rail">
        <div className="rail-top">
          <div className="logo-badge" title="RoutineBuilder Logo">
            <span className="logo-icon">💃</span>
          </div>
        </div>

        <div className="rail-middle">
          <button 
            className={`rail-btn ${selectedDance === '' ? 'active' : ''}`} 
            onClick={() => { setSelectedDance(''); setSelectedFigure(''); setFigureSearch(''); }}
            title="All Dances"
          >
            <span className="rail-btn-icon">🌐</span>
            <span className="rail-tooltip">All Dances</span>
          </button>
          
          <div className="rail-divider" />
          
          {dances.map((dance) => (
            <button
              key={dance}
              className={`rail-btn ${selectedDance === dance ? 'active' : ''}`}
              onClick={() => { setSelectedDance(dance); setSelectedFigure(''); setFigureSearch(''); }}
              title={dance}
            >
              <span className="rail-btn-initial">{dance[0]}</span>
              <span className="rail-tooltip">{dance}</span>
            </button>
          ))}
        </div>

        <div className="rail-bottom">
          <div className="rail-divider" />
          <button 
            className="rail-btn theme-btn" 
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            <span className="rail-btn-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
            <span className="rail-tooltip">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>
      </div>

      {/* Pane 2: Sidebar Explorer */}
      <div className="sidebar-explorer">
        <div className="explorer-header">
          <h2>Explorer</h2>
          {selectedDance && (
            <button 
              className="explorer-reset-btn"
              onClick={() => { setSelectedDance(''); setSelectedFigure(''); setFigureSearch(''); }}
            >
              Clear
            </button>
          )}
        </div>

        <div className="explorer-content">
          {/* Accordion 1: Standard Ballroom */}
          <div className={`explorer-accordion ${standardExpanded ? 'expanded' : ''}`}>
            <div 
              className="accordion-header" 
              onClick={() => setStandardExpanded(!standardExpanded)}
            >
              <span className="header-title">🏆 Standard Ballroom</span>
              <span className="header-arrow">{standardExpanded ? '▼' : '▶'}</span>
            </div>
            {standardExpanded && (
              <ul className="explorer-list">
                <li
                  className={`explorer-item ${selectedDance === '' ? 'active' : ''}`}
                  onClick={() => { setSelectedDance(''); setSelectedFigure(''); setFigureSearch(''); }}
                >
                  <span className="item-icon">🌐</span>
                  <span className="item-name">All Standard</span>
                </li>
                {dances.map((dance) => (
                  <li
                    key={dance}
                    className={`explorer-item ${selectedDance === dance ? 'active' : ''}`}
                    onClick={() => { setSelectedDance(dance); setSelectedFigure(''); setFigureSearch(''); }}
                  >
                    <span className="item-icon">{getDanceEmoji(dance)}</span>
                    <span className="item-name">{dance}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Accordion 2: Latin Ballroom (Coming soon) */}
          <div className="explorer-accordion collapsed disabled">
            <div className="accordion-header">
              <span className="header-title">🔥 Latin Ballroom</span>
              <span className="badge-coming-soon">Soon</span>
            </div>
          </div>

          {/* Accordion 3: Figures List for the selected Dance */}
          {selectedDance ? (
            <div className={`explorer-accordion figures-section ${figuresExpanded ? 'expanded' : ''}`}>
              <div 
                className="accordion-header" 
                onClick={() => setFiguresExpanded(!figuresExpanded)}
              >
                <span className="header-title">📂 {selectedDance} Figures</span>
                <span className="header-arrow">{figuresExpanded ? '▼' : '▶'}</span>
              </div>
              
              {figuresExpanded && (
                <div className="accordion-body">
                  <div className="figure-search-container">
                    <input
                      type="text"
                      className="figure-search-input"
                      placeholder="Filter figures..."
                      value={figureSearch}
                      onChange={(e) => setFigureSearch(e.target.value)}
                    />
                    {figureSearch && (
                      <button className="search-clear-btn" onClick={() => setFigureSearch('')}>×</button>
                    )}
                  </div>

                  <ul className="explorer-list figures-list">
                    <li
                      className={`explorer-item ${selectedFigure === '' ? 'active' : ''}`}
                      onClick={() => setSelectedFigure('')}
                    >
                      <span className="item-icon">📄</span>
                      <span className="item-name">All Figures</span>
                    </li>
                    {filteredFigures.map((figure) => (
                      <li
                        key={figure}
                        className={`explorer-item ${selectedFigure === figure ? 'active' : ''}`}
                        onClick={() => setSelectedFigure(figure)}
                        title={figure}
                      >
                        <span className="item-icon">🩰</span>
                        <span className="item-name">{figure}</span>
                      </li>
                    ))}
                    {filteredFigures.length === 0 && (
                      <li className="explorer-no-results">No figures match</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="explorer-tip">
              <p>Select a dance in the rail or list above to explore specific figures.</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
