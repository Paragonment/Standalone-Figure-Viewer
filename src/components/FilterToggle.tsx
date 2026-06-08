import React from 'react';
import './FilterToggle.css';

interface FilterToggleProps {
  dances: string[];
  selectedDances: string[];
  setSelectedDances: (dances: string[]) => void;
  selectedLevels: string[];
  setSelectedLevels: (levels: string[]) => void;
  figures: string[];
  selectedFigures: string[];
  setSelectedFigures: (figures: string[]) => void;
  filteredCount: number;
}

const FilterToggle: React.FC<FilterToggleProps> = ({
  dances,
  selectedDances,
  setSelectedDances,
  selectedLevels,
  setSelectedLevels,
  figures,
  selectedFigures,
  setSelectedFigures,
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

  // Determine active style (dance) preset
  const activeDancePreset = selectedDances.length === 0
    ? ''
    : selectedDances.length === 1
      ? selectedDances[0]
      : 'custom';

  const applyDancePreset = (dance: string) => {
    if (dance === '') {
      setSelectedDances([]);
    } else {
      setSelectedDances([dance]);
    }
    setSelectedFigures([]); // Clear selected figures when dance changes
  };

  return (
    <div className="filter-control-panel">
      {/* Preset Row: Dance Style (Styles) Segments */}
      <div className="preset-row">
        <div className="preset-group">
          <div className="segmented-control">
            <button
              className={`preset-btn ${activeDancePreset === '' ? 'active' : ''}`}
              onClick={() => applyDancePreset('')}
            >
              All Standard
            </button>
            {dances.map((dance) => (
              <button
                key={dance}
                className={`preset-btn ${activeDancePreset === dance ? 'active' : ''}`}
                onClick={() => applyDancePreset(dance)}
              >
                {getDanceEmoji(dance)} {dance}
              </button>
            ))}
            {activeDancePreset === 'custom' && (
              <span className="preset-badge">Customized</span>
            )}
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
          {/* Card 1: Dance Styles (Multiple Select Checkboxes) */}
          <div className="filter-group-card dance-card">
            <h5>🏆 Dance Style</h5>
            <div className="filter-checkbox-list">
              <label className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedDances.length === 0}
                  onChange={() => {
                    setSelectedDances([]);
                    setSelectedFigures([]);
                  }}
                />
                <span className="checkbox-custom"></span>
                <span className="filter-name">All Standard</span>
              </label>

              {dances.map((dance) => {
                const isChecked = selectedDances.includes(dance);
                return (
                  <label key={dance} className="filter-checkbox-item">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setSelectedDances(selectedDances.filter((d) => d !== dance));
                        } else {
                          setSelectedDances([...selectedDances, dance]);
                        }
                        setSelectedFigures([]);
                      }}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="filter-name">
                      <span className="filter-emoji">{getDanceEmoji(dance)}</span>
                      {dance}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Card 2: Syllabus Levels (Multiple Select Checkboxes) */}
          <div className="filter-group-card level-card">
            <h5>📊 Syllabus Level</h5>
            <div className="filter-checkbox-list">
              <label className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedLevels.length === 0}
                  onChange={() => setSelectedLevels([])}
                />
                <span className="checkbox-custom"></span>
                <span className="filter-name">All Levels</span>
              </label>

              {[
                { id: 'Pre-Bronze', name: 'Pre-Bronze' },
                { id: 'Bronze', name: 'Bronze' },
                { id: 'Silver', name: 'Silver' },
                { id: 'Gold', name: 'Gold' },
              ].map((lvl) => {
                const isChecked = selectedLevels.includes(lvl.id);
                return (
                  <label key={lvl.id} className="filter-checkbox-item">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setSelectedLevels(selectedLevels.filter((l) => l !== lvl.id));
                        } else {
                          setSelectedLevels([...selectedLevels, lvl.id]);
                        }
                      }}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="filter-name">
                      <span className="filter-emoji">{getLevelEmoji(lvl.id)}</span>
                      {lvl.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Card 3: Specific Figures (Multiple Select Checkboxes) */}
          <div className="filter-group-card figures-card">
            <h5>📂 Figures</h5>
            <div className="filter-checkbox-list scrollable-list">
              {selectedDances.length > 0 ? (
                <>
                  <label className="filter-checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedFigures.length === 0}
                      onChange={() => setSelectedFigures([])}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="filter-name">All Figures</span>
                  </label>

                  {figures.map((figure) => {
                    const isChecked = selectedFigures.includes(figure);
                    return (
                      <label key={figure} className="filter-checkbox-item">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedFigures(selectedFigures.filter((f) => f !== figure));
                            } else {
                              setSelectedFigures([...selectedFigures, figure]);
                            }
                          }}
                        />
                        <span className="checkbox-custom"></span>
                        <span className="filter-name">🩰 {figure}</span>
                      </label>
                    );
                  })}
                </>
              ) : (
                <div className="filter-tip">
                  <p>Select at least one dance style to list and filter by specific figures.</p>
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
