import React, { useState } from 'react';
import type { FigureGroup } from '../types';
import { getColumnGroup } from '../utils/columns';
import { displayCount } from '../utils/rhythm';
import { levelLook } from '../utils/levels';
import { keepRanges } from '../utils/stepValues';
import FieldValue from './FieldValue';
import FigurePositions from './FigurePositions';
import { RowChevronIcon } from './ui/Icons';
import { TIMING_COLUMN } from '../utils/stepFields';
import './DanceTable.css';

interface DanceTableProps {
  data: FigureGroup[];
  visibleColumns?: string[];
}

const baseFieldKey = (header: string) => header.replace(/^(Lead|Follow) /, '');

// Shown on the figure's own row (or above its steps), not per step.
const OUTER_COLUMNS = ['Dance', 'Figure Name', 'Level', 'Starting Position', 'Ending Position'];

// The desktop figure table. A row expands in place to show the figure's
// steps in a nested table, with one column per chosen step field.
const DanceTable: React.FC<DanceTableProps> = ({ data, visibleColumns }) => {
  const [expandedFigures, setExpandedFigures] = useState<Set<string>>(new Set());

  if (data.length === 0) {
    return (
      <div className="no-results">
        <h3>No figures match</h3>
        <p>Try different words, or change the dances and levels in Filters.</p>
      </div>
    );
  }

  const isVisible = (column: string) => !visibleColumns || visibleColumns.includes(column);

  // Standard and Latin rows chart different columns, so each figure's
  // step table is built from its own. Positions are figure-level and sit
  // above the table instead of as a mostly empty column.
  const innerHeadersFor = (fig: FigureGroup) =>
    Object.keys(fig.steps[0]).filter(
      (h) => isVisible(h) && !OUTER_COLUMNS.includes(h)
    );

  const showDance = isVisible('Dance');
  const showLevel = isVisible('Level');
  const showStep = isVisible('Step');
  const showNotes = isVisible('General Notes');
  const colSpan = 1 + (showDance ? 1 : 0) + 1 + (showLevel ? 1 : 0) + (showStep ? 1 : 0) + (showNotes ? 1 : 0);

  const renderInnerCell = (header: string, value: string) => {
    if (header === TIMING_COLUMN) {
      if (!value || value.trim() === '') return null;
      return <span className="timing-badge">{displayCount(value)}</span>;
    }
    if (header === 'Step') {
      return (
        <div className="step-cell">
          <span className="step-badge">{value}</span>
        </div>
      );
    }
    if (header === 'General Notes') {
      if (!value || value.trim() === '') return null;
      return <span className="notes-text">{keepRanges(value)}</span>;
    }
    return <FieldValue field={baseFieldKey(header)} value={value} />;
  };

  const toggleFigure = (fig: FigureGroup) => {
    const key = `${fig.dance}-${fig.name}`;
    setExpandedFigures(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="table-container">
      <table className="dance-table">
        <thead>
          <tr>
            <th className="th-toggle-arrow"><span className="fv-sr-only">Expand</span></th>
            {showDance && <th>Dance</th>}
            <th>Figure name</th>
            {showLevel && <th>Level</th>}
            {showStep && <th className="th-step-count">Steps</th>}
            {showNotes && <th>Notes</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((fig) => {
            const key = `${fig.dance}-${fig.name}`;
            const isExpanded = expandedFigures.has(key);
            const look = levelLook(fig.level);

            return (
              <React.Fragment key={key}>
                <tr
                  className={`figure-parent-row ${isExpanded ? 'parent-expanded' : ''}`}
                  onClick={() => toggleFigure(fig)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleFigure(fig);
                    }
                  }}
                  tabIndex={0}
                  aria-expanded={isExpanded}
                >
                  <td className="td-toggle-arrow">
                    <RowChevronIcon className={`toggle-arrow-icon ${isExpanded ? 'rotated' : ''}`} size={16} />
                  </td>
                  {showDance && <td className="dance-cell">{fig.dance}</td>}
                  <td className="figure-name-cell">
                    <strong>{fig.name}</strong>
                  </td>
                  {showLevel && (
                    <td>
                      <span className="level-label" style={{ color: look.text }}>
                        <span
                          className="level-dot"
                          style={{ borderColor: look.dot, backgroundColor: look.hollow ? 'transparent' : look.dot }}
                        />
                        {fig.level}
                      </span>
                    </td>
                  )}
                  {showStep && (
                    <td className="td-step-count">
                      {fig.steps.length} step{fig.steps.length === 1 ? '' : 's'}
                    </td>
                  )}
                  {showNotes && (
                    <td className="general-notes-summary-cell">
                      <span className="notes-text truncate">{keepRanges(fig.generalNotes)}</span>
                    </td>
                  )}
                </tr>

                {isExpanded && (
                  <tr className="figure-child-row">
                    <td colSpan={colSpan} className="expanded-details-cell">
                      <div className="dropdown-details-wrapper">
                        <FigurePositions
                          figure={fig}
                          showStart={isVisible('Starting Position')}
                          showEnd={isVisible('Ending Position')}
                        />
                        <div className="nested-table-scroll">
                          <table className="nested-steps-table">
                            <thead>
                              <tr>
                                {innerHeadersFor(fig).map((header) => {
                                  let className = '';
                                  if (header === 'Step') className = 'th-step';
                                  else if (header === 'General Notes') className = 'th-notes';
                                  else if (getColumnGroup(header) === 'lead') className = 'th-lead';
                                  else if (getColumnGroup(header) === 'follow') className = 'th-follow';

                                  return (
                                    <th key={header} className={className}>
                                      {header}
                                    </th>
                                  );
                                })}
                              </tr>
                            </thead>
                            <tbody>
                              {fig.steps.map((step, idx) => (
                                <tr key={idx}>
                                  {innerHeadersFor(fig).map((header) => {
                                    let className = '';
                                    if (header === 'Step') className = 'td-step';
                                    else if (header === 'General Notes') className = 'td-notes';

                                    return (
                                      <td key={header} className={className}>
                                        {renderInnerCell(header, step[header])}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DanceTable;
