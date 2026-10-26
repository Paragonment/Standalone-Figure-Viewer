import React from 'react';
import type { FigureGroup } from '../types';
import { getDanceEmoji } from '../utils/danceEmoji';
import './DanceTable.css';

interface DanceTableProps {
  data: FigureGroup[];
  visibleColumns?: string[];
  onSelectFigure: (figure: FigureGroup) => void;
}

const DanceTable: React.FC<DanceTableProps> = ({ data, visibleColumns, onSelectFigure }) => {
  if (data.length === 0) {
    return (
      <div className="no-results">
        <span className="no-results-icon">🔍</span>
        <h3>No Figures Found</h3>
        <p>Try adjusting your search criteria, role filters, or selected dances.</p>
      </div>
    );
  }

  const showDance = !visibleColumns || visibleColumns.includes('Dance');
  const showLevel = !visibleColumns || visibleColumns.includes('Level');
  const showStep = !visibleColumns || visibleColumns.includes('Step');
  const showNotes = !visibleColumns || visibleColumns.includes('General Notes');

  return (
    <div className="table-container">
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

            return (
              <tr
                className="figure-parent-row"
                key={key}
                onClick={() => onSelectFigure(fig)}
              >
                <td className="td-toggle-arrow">
                  <span className="open-arrow-icon">›</span>
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DanceTable;
