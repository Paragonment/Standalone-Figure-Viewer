import React from 'react';
import { getDanceEmoji, getLevelEmoji, getStyleEmoji } from '../utils/danceEmoji';
import { DANCE_STYLES, isStyleFullyShown, toggleDance, toggleStyle, type StyleDances } from '../utils/danceStyles';
import './FilterToggle.css';

interface FilterToggleProps {
  // 'panel' is the desktop dropdown of segmented controls; 'sheet' is the
  // mobile bottom sheet's checklists, which are easier to tap.
  layout: 'panel' | 'sheet';
  danceGroups: StyleDances[];
  selectedDances: string[];
  setSelectedDances: (dances: string[]) => void;
  levels: string[];
  selectedLevels: string[];
  setSelectedLevels: (levels: string[]) => void;
  filteredCount: number;
}

const styleLabel = (group: StyleDances) => DANCE_STYLES.find((s) => s.id === group.style)?.label ?? group.style;

// Selecting every level is the same as no level filter, and is stored
// that way so "All Levels" reads as active again.
const toggleLevel = (level: string, selected: string[], levels: string[]): string[] => {
  const next = selected.includes(level) ? selected.filter((l) => l !== level) : [...selected, level];
  return levels.every((l) => next.includes(l)) ? [] : next;
};

const FilterToggle: React.FC<FilterToggleProps> = ({
  layout,
  danceGroups,
  selectedDances,
  setSelectedDances,
  levels,
  selectedLevels,
  setSelectedLevels,
  filteredCount,
}) => {
  // Shared by both layouts so a button and a checkbox behave the same.
  // With no dance filter every "All <style>" option reads as on, since
  // every style is on screen; a dance reads as on only when it's picked
  // out from its style.
  const danceOptions = (group: StyleDances) => {
    const styleShown = isStyleFullyShown(group, selectedDances);
    return {
      styleShown,
      onStyle: () => setSelectedDances(toggleStyle(group, selectedDances, danceGroups)),
      dances: group.dances.map((dance) => ({
        dance,
        on: !styleShown && selectedDances.includes(dance),
        onToggle: () => setSelectedDances(toggleDance(dance, group, selectedDances, danceGroups)),
      })),
    };
  };

  const onLevel = (level: string) => setSelectedLevels(toggleLevel(level, selectedLevels, levels));

  if (layout === 'panel') {
    return (
      <div className="filter-control-panel">
        <div className="preset-row">
          <div className="preset-stack">
            <div className="preset-group">
              {/* One segmented control per style, Standard then Latin */}
              {danceGroups.map((group) => {
                const { styleShown, onStyle, dances } = danceOptions(group);
                return (
                  <div
                    key={group.style}
                    className={`segmented-control style-${group.style.toLowerCase()}`}
                    role="group"
                    aria-label={`${styleLabel(group)} dances`}
                  >
                    <button className={`preset-btn ${styleShown ? 'active' : ''}`} aria-pressed={styleShown} onClick={onStyle}>
                      All {styleLabel(group)}
                    </button>
                    {dances.map(({ dance, on, onToggle }) => (
                      <button key={dance} className={`preset-btn ${on ? 'active' : ''}`} aria-pressed={on} onClick={onToggle}>
                        {getDanceEmoji(dance)} {dance}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>

            <div className="preset-group">
              <div className="segmented-control level-control" role="group" aria-label="Syllabus levels">
                <button
                  className={`preset-btn ${selectedLevels.length === 0 ? 'active' : ''}`}
                  aria-pressed={selectedLevels.length === 0}
                  onClick={() => setSelectedLevels([])}
                >
                  All Levels
                </button>
                {levels.map((level) => {
                  const on = selectedLevels.includes(level);
                  return (
                    <button key={level} className={`preset-btn ${on ? 'active' : ''}`} aria-pressed={on} onClick={() => onLevel(level)}>
                      {getLevelEmoji(level)} {level}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="preset-results-summary">
            <span className="results-count-text">
              <strong>{filteredCount}</strong> figure{filteredCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="filter-control-panel">
      <div className="filter-group-grid">
        {/* Both styles in one box, side by side: Standard then Latin */}
        <div className="filter-group-card dance-card">
          <h5>💃 Dances</h5>
          <div className="dance-style-columns">
            {danceGroups.map((group) => {
              const { styleShown, onStyle, dances } = danceOptions(group);
              return (
                <div key={group.style} className={`filter-checkbox-list style-${group.style.toLowerCase()}`}>
                  <label className="filter-checkbox-item style-all">
                    <input type="checkbox" checked={styleShown} onChange={onStyle} />
                    <span className="checkbox-custom"></span>
                    <span className="filter-name">
                      <span className="filter-emoji">{getStyleEmoji(group.style)}</span>
                      All {styleLabel(group)}
                    </span>
                  </label>
                  {dances.map(({ dance, on, onToggle }) => (
                    <label key={dance} className="filter-checkbox-item">
                      <input type="checkbox" checked={on} onChange={onToggle} />
                      <span className="checkbox-custom"></span>
                      <span className="filter-name">
                        <span className="filter-emoji">{getDanceEmoji(dance)}</span>
                        {dance}
                      </span>
                    </label>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <div className="filter-group-card level-card">
          <h5>📊 Syllabus Level</h5>
          <div className="filter-checkbox-list">
            <label className="filter-checkbox-item">
              <input type="checkbox" checked={selectedLevels.length === 0} onChange={() => setSelectedLevels([])} />
              <span className="checkbox-custom"></span>
              <span className="filter-name">All Levels</span>
            </label>
            {levels.map((level) => (
              <label key={level} className="filter-checkbox-item">
                <input type="checkbox" checked={selectedLevels.includes(level)} onChange={() => onLevel(level)} />
                <span className="checkbox-custom"></span>
                <span className="filter-name">
                  <span className="filter-emoji">{getLevelEmoji(level)}</span>
                  {level}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterToggle;
