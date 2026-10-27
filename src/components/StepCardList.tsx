import React from 'react';
import type { FigureGroup } from '../types';
import { BEAT_VALUE_COLUMN, getStepFields, TIMING_COLUMN } from '../utils/stepFields';
import FieldValue from './FieldValue';
import './StepCardList.css';

interface StepCardListProps {
  figure: FigureGroup;
  visibleColumns: string[];
}

// Each step is a small table with Lead and Follow side by side, so both
// partners' part of the same step reads in one glance and a card is half
// the height of stacking the two roles. Feet leads (and is emphasized)
// because it's the line a dancer actually reads first. A Latin step's
// count sits by its number: it's shared by both partners and always shown,
// since in Latin the timing is as much the figure as the feet are.
const StepCardList: React.FC<StepCardListProps> = ({ figure, visibleColumns }) => {
  const fields = getStepFields(figure.style).filter(
    (f) => visibleColumns.includes(f.leadKey) || visibleColumns.includes(f.followKey)
  );

  if (fields.length === 0) {
    return (
      <p className="step-card-list-empty">
        No step details are selected. Tap ⚙️ at the top to choose some.
      </p>
    );
  }

  return (
    <ol className="step-card-list">
      {figure.steps.map((step, idx) => (
        <li className="step-card" key={idx}>
          <table className="step-table">
            <thead>
              <tr>
                <th scope="col" className="step-table-corner">
                  <span className="step-num" aria-label={`Step ${idx + 1}`}>{idx + 1}</span>
                  {step[TIMING_COLUMN] && (
                    <span
                      className="timing-badge"
                      title={step[BEAT_VALUE_COLUMN] ? `Beat value ${step[BEAT_VALUE_COLUMN]}` : undefined}
                      aria-label={`Count ${step[TIMING_COLUMN]}`}
                    >
                      {step[TIMING_COLUMN]}
                    </span>
                  )}
                </th>
                <th scope="col"><span className="role-chip lead">Lead</span></th>
                <th scope="col"><span className="role-chip follow">Follow</span></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((f) => (
                <tr key={f.key} className={f.key === 'Feet Positions' ? 'is-feet' : undefined}>
                  <th scope="row">{f.label}</th>
                  <td>{visibleColumns.includes(f.leadKey) && <FieldValue field={f.key} value={step[f.leadKey]} />}</td>
                  <td>{visibleColumns.includes(f.followKey) && <FieldValue field={f.key} value={step[f.followKey]} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </li>
      ))}
    </ol>
  );
};

export default StepCardList;
