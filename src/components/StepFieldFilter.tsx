import React, { useId, useState } from 'react';
import { STEP_FIELDS } from '../utils/stepFields';
import './StepFieldFilter.css';

interface StepFieldFilterProps {
  visibleColumns: string[];
  setVisibleColumns: (cols: string[]) => void;
  // Starts closed as a one-line summary of what's shown, for layouts
  // (Practice) where the chips would cost too much vertical space.
  collapsible?: boolean;
}

const ESSENTIALS = ['Feet Positions', 'Footwork'];

// Mobile controls Lead and Follow visibility together, per attribute - a
// beginner thinks "I don't care about sway," not "hide only the Lead's
// sway." Desktop keeps the original per-role granularity in ColumnToggle.
const StepFieldFilter: React.FC<StepFieldFilterProps> = ({ visibleColumns, setVisibleColumns, collapsible = false }) => {
  const [open, setOpen] = useState(!collapsible);
  const bodyId = useId();

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

  const activeFields = STEP_FIELDS.filter((f) => isOn([f.leadKey, f.followKey]));
  const allOn = activeFields.length === STEP_FIELDS.length;
  const onlyEssentials =
    STEP_FIELDS.every((f) => isOn([f.leadKey, f.followKey]) === ESSENTIALS.includes(f.key));

  const summary = allOn
    ? 'Everything'
    : activeFields.length === 0
      ? 'Nothing selected'
      : activeFields.map((f) => f.label).join(', ');

  return (
    <div className={`step-field-filter ${collapsible ? 'collapsible' : ''} ${open ? 'open' : ''}`}>
      {collapsible && (
        <button
          type="button"
          className="step-field-filter-summary"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={bodyId}
        >
          <span className="step-field-filter-label">Show</span>
          <span className="step-field-filter-summary-text">{summary}</span>
          <span className="step-field-filter-chevron" aria-hidden="true">▾</span>
        </button>
      )}
      {open && (
        <div className="step-field-filter-body" id={bodyId}>
          <div className="step-field-filter-head">
            {!collapsible && <span className="step-field-filter-label">Show</span>}
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
      )}
    </div>
  );
};

export default StepFieldFilter;
