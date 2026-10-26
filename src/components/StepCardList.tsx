import React from 'react';
import type { FigureGroup } from '../types';
import { STEP_FIELDS } from '../utils/stepFields';
import FieldValue from './FieldValue';
import './StepCardList.css';

interface StepCardListProps {
  figure: FigureGroup;
  visibleColumns: string[];
  highlightFields: string[];
}

const StepCardList: React.FC<StepCardListProps> = ({ figure, visibleColumns, highlightFields }) => {
  const leadFields = STEP_FIELDS.filter((f) => visibleColumns.includes(f.leadKey));
  const followFields = STEP_FIELDS.filter((f) => visibleColumns.includes(f.followKey));
  const showLeadFeet = visibleColumns.includes('Lead Feet Positions');
  const showFollowFeet = visibleColumns.includes('Follow Feet Positions');

  return (
    <div className="step-card-list">
      {figure.steps.map((step, idx) => {
        const headline = [showLeadFeet ? step['Lead Feet Positions'] : null, showFollowFeet ? step['Follow Feet Positions'] : null]
          .filter(Boolean)
          .join(' / ');

        return (
          <div className="step-card" key={idx}>
            <div className="step-card-head">
              <span className="step-num">{idx + 1}</span>
              {headline && <span className="step-headline">{headline}</span>}
            </div>
            <div className="step-split">
              <div className="step-col">
                <div className="step-col-head">
                  <span className="role-chip lead">Lead</span>
                </div>
                {leadFields.length === 0 ? (
                  <p className="step-col-empty">No fields selected</p>
                ) : (
                  leadFields.map((f) => (
                    <div
                      className={`field-row ${highlightFields.includes(f.key) ? 'highlighted' : ''}`}
                      key={f.key}
                    >
                      <div className="field-label">{f.label}</div>
                      <div className="field-value">
                        <FieldValue field={f.key} value={step[f.leadKey]} />
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="step-col">
                <div className="step-col-head">
                  <span className="role-chip follow">Follow</span>
                </div>
                {followFields.length === 0 ? (
                  <p className="step-col-empty">No fields selected</p>
                ) : (
                  followFields.map((f) => (
                    <div
                      className={`field-row ${highlightFields.includes(f.key) ? 'highlighted' : ''}`}
                      key={f.key}
                    >
                      <div className="field-label">{f.label}</div>
                      <div className="field-value">
                        <FieldValue field={f.key} value={step[f.followKey]} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StepCardList;
