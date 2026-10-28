import React from 'react';
import CheckBox from './ui/CheckBox';
import { DANCE_STYLES, danceShortLabel, toggleItem, toggleStyleMobile, type StyleDances } from '../utils/danceStyles';
import { levelLook } from '../utils/levels';
import './FilterToggle.css';

interface FilterToggleProps {
  danceGroups: StyleDances[];
  selectedDances: string[];
  setSelectedDances: (dances: string[]) => void;
  levels: string[];
  selectedLevels: string[];
  setSelectedLevels: (levels: string[]) => void;
  filteredCount: number;
}

const styleLabel = (group: StyleDances) => DANCE_STYLES.find((s) => s.id === group.style)?.label ?? group.style;

// The desktop filter panel: one segmented track per style with a select-all
// box, then the level pills. An empty selection means "no filter", and
// picking every option stores the same, so nothing reads as selected until
// the list is narrowed.
const FilterToggle: React.FC<FilterToggleProps> = ({
  danceGroups,
  selectedDances,
  setSelectedDances,
  levels,
  selectedLevels,
  setSelectedLevels,
  filteredCount,
}) => {
  const allDances = danceGroups.flatMap((g) => g.dances);

  return (
    <div className="filter-control-panel">
      <div className="filter-rows">
        {danceGroups.map((group) => {
          const pickedCount = group.dances.filter((d) => selectedDances.includes(d)).length;
          const state = pickedCount === 0 ? 'off' : pickedCount === group.dances.length ? 'on' : 'mixed';
          const label = styleLabel(group);

          return (
            <div key={group.style} className="filter-row" role="group" aria-label={`${label} dances`}>
              <button
                type="button"
                role="checkbox"
                aria-checked={state === 'mixed' ? 'mixed' : state === 'on'}
                aria-label={`All ${label}`}
                className="filter-style-btn"
                onClick={() => setSelectedDances(toggleStyleMobile(group.dances, selectedDances, allDances))}
              >
                <CheckBox state={state} />
                <span className="filter-style-name">{label}</span>
              </button>

              <div className="filter-track">
                {group.dances.map((dance, i) => {
                  const on = selectedDances.includes(dance);
                  const prevOn = i > 0 && selectedDances.includes(group.dances[i - 1]);
                  return (
                    <button
                      key={dance}
                      type="button"
                      className={`filter-seg${on ? ' on' : ''}${i > 0 && !on && !prevOn ? ' sep' : ''}`}
                      aria-pressed={on}
                      aria-label={dance}
                      onClick={() => setSelectedDances(toggleItem(selectedDances, dance, allDances))}
                    >
                      <span className="filter-seg-fill" />
                      <span className="filter-seg-label">{danceShortLabel(dance)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="filter-row" role="group" aria-label="Level">
          <span className="filter-row-label">Level</span>
          <div className="filter-levels">
            {levels.map((level) => {
              const on = selectedLevels.includes(level);
              const look = levelLook(level);
              return (
                <button
                  key={level}
                  type="button"
                  className={`filter-pill${on ? ' on' : ''}`}
                  aria-pressed={on}
                  onClick={() => setSelectedLevels(toggleItem(selectedLevels, level, levels))}
                >
                  <span
                    className="filter-pill-dot"
                    style={{ borderColor: look.dot, backgroundColor: look.hollow ? 'transparent' : look.dot }}
                  />
                  {level}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="filter-count" aria-live="polite">
        <strong>{filteredCount}</strong> figure{filteredCount === 1 ? '' : 's'}
      </p>
    </div>
  );
};

export default FilterToggle;
