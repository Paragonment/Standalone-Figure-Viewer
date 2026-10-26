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
      <div className="step-field-filter-head">
        <span className="step-field-filter-label">Show</span>
        <div className="step-field-filter-presets">
          <button
            type="button"
            className={onlyEssentials ? 'active' : ''}
            onClick={showEssentials}
          >
            Essentials
          </button>
          <button type="button" className={allOn ? 'active' : ''} onClick={showAll}>
            Everything
          </button>
        </div>
      </div>
      <div className="step-field-chips">
        {STEP_FIELDS.map((field) => (
          <button
            key={field.key}
            type="button"
            className={`step-field-chip ${isOn([field.leadKey, field.followKey]) ? 'active' : ''}`}
            onClick={() => toggleField(field)}
            aria-pressed={isOn([field.leadKey, field.followKey])}
          >
            {field.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StepFieldFilter;
