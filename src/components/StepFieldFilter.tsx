import React from 'react';
import { STEP_FIELDS } from '../utils/stepFields';
import './StepFieldFilter.css';

interface StepFieldFilterProps {
  visibleColumns: string[];
  setVisibleColumns: (cols: string[]) => void;
}

const ESSENTIALS = ['Feet Positions', 'Footwork'];

// Mobile controls Lead and Follow visibility together, per attribute - a
// beginner thinks "I don't care about sway," not "hide only the Lead's
// sway." Desktop keeps the original per-role granularity in ColumnToggle.
const StepFieldFilter: React.FC<StepFieldFilterProps> = ({ visibleColumns, setVisibleColumns }) => {
  const isOn = (keys: string[]) => keys.some((k) => visibleColumns.includes(k));

  const applyFieldKeys = (keys: string[]) => {
    const kept = visibleColumns.filter((c) => !STEP_FIELDS.some((f) => f.leadKey === c || f.followKey === c));
    setVisibleColumns([...kept, ...keys]);
  };

  const toggleField = (field: (typeof STEP_FIELDS)[number]) => {
    const on = isOn([field.leadKey, field.followKey]);
    if (on) {
      setVisibleColumns(visibleColumns.filter((c) => c !== field.leadKey && c !== field.followKey));
    } else {
      setVisibleColumns([...new Set([...visibleColumns, field.leadKey, field.followKey])]);
    }
  };

  const showEssentials = () => {
    const keys = STEP_FIELDS.filter((f) => ESSENTIALS.includes(f.key)).flatMap((f) => [f.leadKey, f.followKey]);
    applyFieldKeys(keys);
  };

  const showAll = () => {
    applyFieldKeys(STEP_FIELDS.flatMap((f) => [f.leadKey, f.followKey]));
  };

  const allOn = STEP_FIELDS.every((f) => isOn([f.leadKey, f.followKey]));
  const onlyEssentials =
    STEP_FIELDS.every((f) => isOn([f.leadKey, f.followKey]) === ESSENTIALS.includes(f.key));

  return (
    <div className="step-field-filter">
      <div className="step-field-presets" role="group" aria-label="Presets">
        <button type="button" aria-pressed={onlyEssentials} onClick={showEssentials}>
          Essentials
        </button>
        <button type="button" aria-pressed={allOn} onClick={showAll}>
          Everything
        </button>
      </div>
      <div className="step-field-chips">
        {STEP_FIELDS.map((field) => {
          const on = isOn([field.leadKey, field.followKey]);
          return (
            <button
              key={field.key}
              type="button"
              className={`step-field-chip ${on ? 'active' : ''}`}
              onClick={() => toggleField(field)}
              aria-pressed={on}
            >
              <span className="step-field-chip-mark" aria-hidden="true">{on ? '✓' : '+'}</span>
              {field.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepFieldFilter;
