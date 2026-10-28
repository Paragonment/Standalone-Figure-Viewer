import { DANCE_STYLES, danceShortLabel, toggleItem, toggleStyleMobile } from '../../utils/danceStyles';
import type { StyleDances } from '../../utils/danceStyles';
import { levelLook } from '../../utils/levels';
import CheckBox from '../ui/CheckBox';
import './FilterBar.css';

interface FilterBarProps {
  danceGroups: StyleDances[];
  levels: string[];
  selectedDances: string[];
  onDancesChange(dances: string[]): void;
  selectedLevels: string[];
  onLevelsChange(levels: string[]): void;
}

// An empty selection means "no filter", so with nothing picked the style
// boxes read as unchecked and no segment is filled.
export default function FilterBar({
  danceGroups,
  levels,
  selectedDances,
  onDancesChange,
  selectedLevels,
  onLevelsChange,
}: FilterBarProps) {
  const allDances = danceGroups.flatMap((g) => g.dances);

  return (
    <div role="group" aria-label="Filter by dance and level" className="fb">
      {danceGroups.map((group) => {
        const styleLabel = DANCE_STYLES.find((s) => s.id === group.style)?.label ?? group.style;
        const all = selectedDances.length > 0 && group.dances.every((d) => selectedDances.includes(d));
        const some = !all && group.dances.some((d) => selectedDances.includes(d));
        return (
          <div key={group.style} role="group" aria-label={`${styleLabel} dances`} className="fb-style">
            <button
              type="button"
              role="checkbox"
              aria-checked={all ? 'true' : some ? 'mixed' : 'false'}
              aria-label={`All ${styleLabel}`}
              className="fb-all"
              onClick={() => onDancesChange(toggleStyleMobile(group.dances, selectedDances, allDances))}
            >
              <CheckBox state={all ? 'on' : some ? 'mixed' : 'off'} size={20} />
            </button>
            <div className="fb-track">
              {group.dances.map((dance, i) => {
                const on = selectedDances.includes(dance);
                const prevOn = i > 0 && selectedDances.includes(group.dances[i - 1]);
                return (
                  <button
                    key={dance}
                    type="button"
                    aria-pressed={on}
                    aria-label={dance}
                    className={on ? 'fb-seg fb-seg-on' : 'fb-seg'}
                    onClick={() => onDancesChange(toggleItem(selectedDances, dance, allDances))}
                  >
                    {i > 0 && !on && !prevOn && <span className="fb-divider" aria-hidden="true" />}
                    <span className="fb-fill" aria-hidden="true" />
                    <span className="fb-label">{danceShortLabel(dance)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <div role="group" aria-label="Level" className="fb-levels">
        {levels.map((level) => {
          const on = selectedLevels.includes(level);
          const look = levelLook(level);
          return (
            <button
              key={level}
              type="button"
              aria-pressed={on}
              className={on ? 'fb-pill fb-pill-on' : 'fb-pill'}
              onClick={() => onLevelsChange(toggleItem(selectedLevels, level, levels))}
            >
              <span className="fb-pill-body">
                <span
                  className="fb-dot"
                  aria-hidden="true"
                  style={{ borderColor: look.dot, background: look.hollow ? 'transparent' : look.dot }}
                />
                {level}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
