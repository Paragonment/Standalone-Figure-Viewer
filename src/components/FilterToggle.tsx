import React from 'react';
import './FilterToggle.css';

interface FilterToggleProps {
  dances: string[];
  selectedDance: string;
  setSelectedDance: (dance: string) => void;
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  figures: string[];
  selectedFigure: string;
  setSelectedFigure: (figure: string) => void;
  filteredCount: number;
}

const FilterToggle: React.FC<FilterToggleProps> = ({
  dances,
  selectedDance,
  setSelectedDance,
  selectedLevel,
  setSelectedLevel,
  figures,
  selectedFigure,
  setSelectedFigure,
  filteredCount,
}) => {
  const getDanceEmoji = (dance: string) => {
    switch (dance.toLowerCase()) {
      case 'waltz': return '⏳';
      case 'tango': return '🌹';
      case 'foxtrot': return '🦊';
      case 'quickstep': return '⚡';
      default: return '💃';
    }
  };

  const getLevelEmoji = (level: string) => {
    switch (level) {
      case 'Pre-Bronze': return '⚪';
      case 'Bronze': return '🥉';
      case 'Silver': return '🥈';
      case 'Gold': return '🥇';
      default: return '🌐';
    }
  };

  return (
    <div className="filter-control-panel">
      {/* Preset Row: Syllabus Level Segments */}
      <div className="preset-row">
        <div className="preset-group">
          <div className="segmented-control">
            {[
              { id: '', label: 'All Levels' },
              { id: 'Pre-Bronze', label: 'Pre-Bronze' },
              { id: 'Bronze', label: '🥉 Bronze' },
              { id: 'Silver', label: '🥈 Silver' },
              { id: 'Gold', label: '🥇 Gold' },
            ].map((preset) => (
              <button
                key={preset.id}
                className={`preset-btn ${selectedLevel === preset.id ? 'active' : ''}`}
                onClick={() => setSelectedLevel(preset.id)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="preset-results-summary">
          <span className="results-count-text">
            Found <strong> {filteredCount} </strong> matching figure{filteredCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Grid of Card Sections */}
      <div className="granular-filters-container">
        <div className="filter-group-grid">
          {/* Card 1: Dance Styles */}
          <div className="filter-group-card dance-card">
            <h5>🏆 Dance Style</h5>
            <div className="filter-radio-list">
              <label className="filter-radio-item">
                <input
                  type="radio"
                  name="dance-filter"
                  checked={selectedDance === ''}
                  onChange={() => {
                    setSelectedDance('');
                    setSelectedFigure('');
                  }}
                />
                <span className="radio-custom"></span>
                <span className="filter-name">All Standard</span>
              </label>

              {dances.map((dance) => (
                <label key={dance} className="filter-radio-item">
                  <input
                    type="radio"
                    name="dance-filter"
                    checked={selectedDance === dance}
                    onChange={() => {
                      setSelectedDance(dance);
                      setSelectedFigure('');
                    }}
                  />
                  <span className="radio-custom"></span>
                  <span className="filter-name">
                    <span className="filter-emoji">{getDanceEmoji(dance)}</span>
                    {dance}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Card 2: Syllabus Levels */}
          <div className="filter-group-card level-card">
            <h5>📊 Syllabus Level</h5>
            <div className="filter-radio-list">
              {[
                { id: '', name: 'All Levels' },
                { id: 'Pre-Bronze', name: 'Pre-Bronze' },
                { id: 'Bronze', name: 'Bronze' },
                { id: 'Silver', name: 'Silver' },
                { id: 'Gold', name: 'Gold' },
              ].map((lvl) => (
                <label key={lvl.id} className="filter-radio-item">
                  <input
                    type="radio"
                    name="level-filter"
                    checked={selectedLevel === lvl.id}
                    onChange={() => setSelectedLevel(lvl.id)}
                  />
                  <span className="radio-custom"></span>
                  <span className="filter-name">
                    <span className="filter-emoji">{getLevelEmoji(lvl.id)}</span>
                    {lvl.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Card 3: Specific Figures */}
          <div className="filter-group-card figures-card">
            <h5>📂 {selectedDance ? `${selectedDance} Figures` : 'Specific Figure'}</h5>
            <div className="filter-radio-list scrollable-list">
              {selectedDance ? (
                <>
                  <label className="filter-radio-item">
                    <input
                      type="radio"
                      name="figure-filter"
                      checked={selectedFigure === ''}
                      onChange={() => setSelectedFigure('')}
                    />
                    <span className="radio-custom"></span>
                    <span className="filter-name">All Figures</span>
                  </label>

                  {figures.map((figure) => (
                    <label key={figure} className="filter-radio-item">
                      <input
                        type="radio"
                        name="figure-filter"
                        checked={selectedFigure === figure}
                        onChange={() => setSelectedFigure(figure)}
                      />
                      <span className="radio-custom"></span>
                      <span className="filter-name">🩰 {figure}</span>
                    </label>
                  ))}
                </>
              ) : (
                <div className="filter-tip">
                  <p>Select a dance style first to list and filter by specific figures.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterToggle;
