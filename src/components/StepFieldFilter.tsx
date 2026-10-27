import React from 'react';
import type { StepFieldDef } from '../utils/stepFields';
import './StepFieldFilter.css';

interface StepFieldFilterProps {
  // The open figure's style's fields.
  fields: StepFieldDef[];
  visibleColumns: string[];
  setVisibleColumns: (cols: string[]) => void;
}

const ESSENTIALS = ['Feet Positions', 'Footwork'];

// Mobile controls Lead and Follow visibility together, per attribute - a
// beginner thinks "I don't care about sway," not "hide only the Lead's
// sway." Desktop keeps the original per-role granularity in ColumnToggle.
const StepFieldFilter: React.FC<StepFieldFilterProps> = ({ fields, visibleColumns, setVisibleColumns }) => {
  const isOn = (keys: string[]) => keys.some((k) => visibleColumns.includes(k));

  const applyFieldKeys = (keys: string[]) => {
    const kept = visibleColumns.filter((c) => !fields.some((f) => f.leadKey === c || f.followKey === c));
    setVisibleColumns([...kept, ...keys]);
  };

  const toggleField = (field: StepFieldDef) => {
    const on = isOn([field.leadKey, field.followKey]);
    if (on) {
      setVisibleColumns(visibleColumns.filter((c) => c !== field.leadKey && c !== field.followKey));
    } else {
      setVisibleColumns([...new Set([...visibleColumns, field.leadKey, field.followKey])]);
    }
  };

  const showEssentials = () => {
    const keys = fields.filter((f) => ESSENTIALS.includes(f.key)).flatMap((f) => [f.leadKey, f.followKey]);
    applyFieldKeys(keys);
  };

  const showAll = () => {
    applyFieldKeys(fields.flatMap((f) => [f.leadKey, f.followKey]));
  };

  const allOn = fields.every((f) => isOn([f.leadKey, f.followKey]));
  const onlyEssentials =
    fields.every((f) => isOn([f.leadKey, f.followKey]) === ESSENTIALS.includes(f.key));

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
        {fields.map((field) => {
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
