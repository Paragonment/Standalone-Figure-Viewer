import React from 'react';
import { getDanceEmoji, getLevelEmoji, getStyleEmoji } from '../utils/danceEmoji';
import { DANCE_STYLES, isStyleFullyShown, toggleDance, toggleStyle, type StyleDances } from '../utils/danceStyles';
import './FilterToggle.css';

interface FilterToggleProps {
  danceGroups: StyleDances[];
  selectedDances: string[];
  setSelectedDances: (dances: string[]) => void;
  levels: string[];
  selectedLevels: string[];
  setSelectedLevels: (levels: string[]) => void;
  figures: string[];
  selectedFigures: string[];
  setSelectedFigures: (figures: string[]) => void;
  filteredCount: number;
}

const styleLabel = (group: StyleDances) => DANCE_STYLES.find((s) => s.id === group.style)?.label ?? group.style;

const sameDances = (a: string[], b: string[]) => a.length === b.length && a.every((d) => b.includes(d));

const FilterToggle: React.FC<FilterToggleProps> = ({
  danceGroups,
  selectedDances,
  setSelectedDances,
  levels,
  selectedLevels,
  setSelectedLevels,
  figures,
  selectedFigures,
  setSelectedFigures,
  filteredCount,
}) => {
  // Figures are listed per selected dance, so any dance change resets them.
  const changeDances = (dances: string[]) => {
    setSelectedDances(dances);
    setSelectedFigures([]);
  };

  // The presets are one-tap shortcuts: a dance shows only that dance, and
  // "All <style>" shows only that style - or, tapped again while it's the
  // only thing shown, goes back to every dance. With no dance filter every
  // "All" segment reads as active, since every style is on screen.
  const applyStylePreset = (group: StyleDances) => {
    changeDances(sameDances(selectedDances, group.dances) ? [] : group.dances);
  };

  const isPresetSelection =
    selectedDances.length <= 1 || danceGroups.some((g) => sameDances(selectedDances, g.dances));

  return (
    <div className="filter-control-panel">
      {/* Preset Row: one segmented control per style, Standard then Latin */}
      <div className="preset-row">
        <div className="preset-group">
          {danceGroups.map((group) => {
            const styleShown = isStyleFullyShown(group, selectedDances);
            return (
              <div key={group.style} className="segmented-control" role="group" aria-label={`${styleLabel(group)} dances`}>
                <button
                  className={`preset-btn ${styleShown ? 'active' : ''}`}
                  aria-pressed={styleShown}
                  onClick={() => applyStylePreset(group)}
                >
                  All {styleLabel(group)}
                </button>
                {group.dances.map((dance) => {
                  const active = !styleShown && selectedDances.length === 1 && selectedDances[0] === dance;
                  return (
                    <button
                      key={dance}
                      className={`preset-btn ${active ? 'active' : ''}`}
                      aria-pressed={active}
                      onClick={() => changeDances([dance])}
                    >
                      {getDanceEmoji(dance)} {dance}
                    </button>
                  );
                })}
              </div>
            );
          })}
          {!isPresetSelection && <span className="preset-badge">Customized</span>}
        </div>

        <div className="preset-results-summary">
          <span className="results-count-text">
            <strong>{filteredCount}</strong> figure{filteredCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Grid of Card Sections */}
      <div className="granular-filters-container">
        <div className="filter-group-grid">
          {/* One card per style (Multiple Select Checkboxes) */}
          {danceGroups.map((group) => {
            const label = styleLabel(group);
            const styleShown = isStyleFullyShown(group, selectedDances);
            return (
              <div key={group.style} className={`filter-group-card dance-card style-${group.style.toLowerCase()}`}>
                <h5>{getStyleEmoji(group.style)} {label}</h5>
                <div className="filter-checkbox-list">
                  <label className="filter-checkbox-item">
                    <input
                      type="checkbox"
                      checked={styleShown}
                      onChange={() => changeDances(toggleStyle(group, selectedDances, danceGroups))}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="filter-name">All {label}</span>
                  </label>

                  {group.dances.map((dance) => {
                    const isChecked = !styleShown && selectedDances.includes(dance);
                    return (
                      <label key={dance} className="filter-checkbox-item">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => changeDances(toggleDance(dance, group, selectedDances, danceGroups))}
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
            );
          })}

          {/* Syllabus Levels (Multiple Select Checkboxes) */}
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

              {levels.map((level) => {
                const isChecked = selectedLevels.includes(level);
                return (
                  <label key={level} className="filter-checkbox-item">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setSelectedLevels(selectedLevels.filter((l) => l !== level));
                        } else {
                          setSelectedLevels([...selectedLevels, level]);
                        }
                      }}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="filter-name">
                      <span className="filter-emoji">{getLevelEmoji(level)}</span>
                      {level}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Specific Figures (Multiple Select Checkboxes) */}
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
