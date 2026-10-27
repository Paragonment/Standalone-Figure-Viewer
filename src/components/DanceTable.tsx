import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import type { FigureGroup } from '../types';
import { getDanceEmoji } from '../utils/danceEmoji';
import { getColumnGroup, getShortHeader } from '../utils/columns';
import { useIsMobile } from '../hooks/useIsMobile';
import FieldValue from './FieldValue';
import FigurePositions from './FigurePositions';
import { TIMING_COLUMN } from '../utils/stepFields';
import './DanceTable.css';

interface DanceTableProps {
  data: FigureGroup[];
  visibleColumns?: string[];
  selectedFigures?: string[];
  onSelectFigure: (figure: FigureGroup) => void;
  // Owned by the parent so the scroll offset outlives this component,
  // which unmounts while a figure's detail view is open.
  scrollTopRef?: React.RefObject<number>;
}

const baseFieldKey = (header: string) => header.replace(/^(Lead|Follow) /, '');

// Shown on the figure's own row (or above its steps), not per step.
const OUTER_COLUMNS = ['Dance', 'Figure Name', 'Level', 'Starting Position', 'Ending Position'];

const DanceTable: React.FC<DanceTableProps> = ({ data, visibleColumns, selectedFigures, onSelectFigure, scrollTopRef }) => {
  const isMobile = useIsMobile();
  const [expandedFigures, setExpandedFigures] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Restore before paint so the list never flashes at the top first.
  useLayoutEffect(() => {
    if (containerRef.current && scrollTopRef) {
      containerRef.current.scrollTop = scrollTopRef.current;
    }
    // Mount only: afterwards the container's own scroll position is the source of truth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-expand the selected figures when they change (desktop only).
  useEffect(() => {
    if (selectedFigures && selectedFigures.length > 0) {
      setExpandedFigures(prev => {
        const next = new Set(prev);
        selectedFigures.forEach(figName => {
          const matchingGroups = data.filter(f => f.name === figName);
          matchingGroups.forEach(g => {
            next.add(`${g.dance}-${g.name}`);
          });
        });
        return next;
      });
    }
  }, [selectedFigures, data]);

  // A figure open via inline expansion doesn't carry over if the viewport
  // crosses into mobile, which navigates to the detail view instead.
  useEffect(() => {
    if (isMobile) setExpandedFigures(new Set());
  }, [isMobile]);

  if (data.length === 0) {
    return (
      <div className="no-results">
        <span className="no-results-icon">🔍</span>
        <h3>No Figures Found</h3>
        <p>Try adjusting your search criteria, role filters, or selected dances.</p>
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
      if (!value || value.trim() === '') return <span className="cell-empty">—</span>;
      return <span className="timing-badge">{value}</span>;
    }
    if (header === 'Step') {
      return (
        <div className="step-cell">
          <span className="step-badge">{value}</span>
        </div>
      );
    }
    if (header === 'General Notes') {
      if (!value || value.trim() === '') return <span className="cell-empty">—</span>;
      return <span className="notes-text">{value}</span>;
    }
    return <FieldValue field={baseFieldKey(header)} value={value} />;
  };

  const handleRowClick = (fig: FigureGroup) => {
    if (isMobile) {
      onSelectFigure(fig);
      return;
    }
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
    <div
      className="table-container"
      ref={containerRef}
      onScroll={(e) => {
        if (scrollTopRef) scrollTopRef.current = e.currentTarget.scrollTop;
      }}
    >
      <table className="dance-table">
        <thead>
          <tr>
            <th className="th-toggle-arrow"></th>
            {showDance && <th>Dance</th>}
            <th>
              <span className="header-text-desktop">Figure Name</span>
              <span className="header-text-mobile">Figure</span>
            </th>
            {showLevel && <th>Level</th>}
            {showStep && (
              <th className="th-step-count">
                <span className="header-text-desktop">Steps</span>
                <span className="header-text-mobile">#</span>
              </th>
            )}
            {showNotes && (
              <th className="desktop-only">
                <span className="header-text-desktop">General Notes Summary</span>
                <span className="header-text-mobile">Notes</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((fig) => {
            const key = `${fig.dance}-${fig.name}`;
            const isExpanded = !isMobile && expandedFigures.has(key);

            return (
              <React.Fragment key={key}>
                <tr
                  className={`figure-parent-row ${isExpanded ? 'parent-expanded' : ''}`}
                  onClick={() => handleRowClick(fig)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRowClick(fig);
                    }
                  }}
                  tabIndex={0}
                  aria-expanded={isMobile ? undefined : isExpanded}
                >
                  <td className="td-toggle-arrow">
                    <span className={`toggle-arrow-icon ${isExpanded ? 'rotated' : ''}`}>
                      {isMobile ? '›' : '▶'}
                    </span>
                  </td>
                  {showDance && (
                    <td>
                      <span className="dance-badge">
                        <span className="dance-badge-icon">{getDanceEmoji(fig.dance)}</span>
                        <span className="dance-badge-name">{fig.dance}</span>
                      </span>
                    </td>
                  )}
                  <td className="figure-name-cell">
                    <strong>{fig.name}</strong>
                  </td>
                  {showLevel && (
                    <td>
                      <span className={`level-badge ${fig.level.toLowerCase().replace(' ', '-')}`}>
                        {fig.level}
                      </span>
                    </td>
                  )}
                  {showStep && (
                    <td className="td-step-count">
                      <span className="step-count-badge">
                        <span className="header-text-desktop">
                          {fig.steps.length} step{fig.steps.length === 1 ? '' : 's'}
                        </span>
                        <span className="header-text-mobile">{fig.steps.length}</span>
                      </span>
                    </td>
                  )}
                  {showNotes && (
                    <td className="general-notes-summary-cell desktop-only">
                      <span className="notes-text truncate">{fig.generalNotes || '—'}</span>
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
                                      <span className="header-text-desktop">{header}</span>
                                      <span className="header-text-mobile">{getShortHeader(header)}</span>
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
                                    else if (getColumnGroup(header) === 'lead') className = 'td-lead';
                                    else if (getColumnGroup(header) === 'follow') className = 'td-follow';

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
