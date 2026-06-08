import React, { useState, useEffect } from 'react';
import type { FigureGroup, DanceStep } from '../types';
import './DanceTable.css';

interface DanceTableProps {
  data: FigureGroup[];
  visibleColumns?: string[];
  selectedFigure?: string;
}

const getShortenedHeader = (header: string) => {
  return header
    .replace('Lead Feet Positions', 'Feet')
    .replace('Follow Feet Positions', 'Feet')
    .replace('Lead Alignment', 'Align')
    .replace('Follow Alignment', 'Align')
    .replace('Lead Amount of Turn', 'Turn')
    .replace('Follow Amount of Turn', 'Turn')
    .replace('Lead Rise and Fall', 'Rise/Fall')
    .replace('Follow Rise and Fall', 'Rise/Fall')
    .replace('Lead Footwork', 'Footwork')
    .replace('Follow Footwork', 'Footwork')
    .replace('Lead CBM', 'CBM')
    .replace('Follow CBM', 'CBM')
    .replace('Lead Sway', 'Sway')
    .replace('Follow Sway', 'Sway')
    .replace('General Notes', 'Notes');
};

const DanceTable: React.FC<DanceTableProps> = ({ data, visibleColumns, selectedFigure }) => {
  const [expandedFigures, setExpandedFigures] = useState<Set<string>>(new Set());

  // Auto-expand the selected figure when it changes
  useEffect(() => {
    if (selectedFigure) {
      const found = data.find(f => f.name === selectedFigure);
      if (found) {
        setExpandedFigures(prev => {
          const next = new Set(prev);
          next.add(`${found.dance}-${found.name}`);
          return next;
        });
      }
    }
  }, [selectedFigure, data]);

  if (data.length === 0) {
    return (
      <div className="no-results">
        <span className="no-results-icon">🔍</span>
        <h3>No Figures Found</h3>
        <p>Try adjusting your search criteria, role filters, or selected dances.</p>
      </div>
    );
  }

  // Obtain all headers from the first step of the first figure
  const allHeaders = Object.keys(data[0].steps[0]) as (keyof DanceStep)[];
  const headers = visibleColumns 
    ? allHeaders.filter(h => visibleColumns.includes(h))
    : allHeaders;

  // Filter out redundant 'Dance', 'Figure Name', and 'Level' from the inner step details
  const innerHeaders = headers.filter(h => h !== 'Dance' && h !== 'Figure Name' && h !== 'Level');

  const showDance = !visibleColumns || visibleColumns.includes('Dance');
  const showLevel = !visibleColumns || visibleColumns.includes('Level');
  const showStep = !visibleColumns || visibleColumns.includes('Step');
  const showNotes = !visibleColumns || visibleColumns.includes('General Notes');
  const colSpan = 1 + (showDance ? 1 : 0) + 1 + (showLevel ? 1 : 0) + (showStep ? 1 : 0) + (showNotes ? 1 : 0);

  const getDanceEmoji = (dance: string) => {
    switch (dance.toLowerCase()) {
      case 'waltz': return '⏳';
      case 'tango': return '🌹';
      case 'foxtrot': return '🦊';
      case 'quickstep': return '⚡';
      default: return '💃';
    }
  };

  const toggleFigure = (dance: string, name: string) => {
    const key = `${dance}-${name}`;
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

  const renderCell = (header: keyof DanceStep, value: string) => {
    if (!value || value.trim() === '' || value.trim() === 'Nil') {
      return <span className="cell-empty">—</span>;
    }

    switch (header) {
      case 'Step':
        return (
          <div className="step-cell">
            <span className="step-badge">{value}</span>
          </div>
        );
      
      case 'Dance':
        return (
          <span className="dance-badge">
            <span className="dance-badge-icon">{getDanceEmoji(value)}</span>
            <span className="dance-badge-name">{value}</span>
          </span>
        );

      case 'Lead CBM':
      case 'Follow CBM': {
        const isCbm = value.toLowerCase() === 'true';
        return (
          <span className={`cbm-pill ${isCbm ? 'active' : 'inactive'}`}>
            {isCbm ? 'CBM' : 'No'}
          </span>
        );
      }

      case 'Lead Footwork':
      case 'Follow Footwork':
        return (
          <span className="footwork-pill" title={value}>
            {value}
          </span>
        );

      case 'Lead Sway':
      case 'Follow Sway': {
        const valUpper = value.toUpperCase();
        let swayClass = 'sway-none';
        let swayLabel = value;
        if (valUpper === 'L') {
          swayClass = 'sway-left';
          swayLabel = 'Left (L)';
        } else if (valUpper === 'R') {
          swayClass = 'sway-right';
          swayLabel = 'Right (R)';
        } else if (valUpper === 'S') {
          swayClass = 'sway-straight';
          swayLabel = 'Straight (S)';
        }
        return (
          <span className={`sway-pill ${swayClass}`}>
            {swayLabel}
          </span>
        );
      }

      case 'General Notes':
        return <span className="notes-text">{value}</span>;

      default:
        return <span className="standard-text">{value}</span>;
    }
  };

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
            {showStep && <th className="th-step-count">Steps</th>}
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
            const isExpanded = expandedFigures.has(key);

            return (
              <React.Fragment key={key}>
                {/* Parent Row */}
                <tr 
                  className={`figure-parent-row ${isExpanded ? 'parent-expanded' : ''}`}
                  onClick={() => toggleFigure(fig.dance, fig.name)}
                >
                  <td className="td-toggle-arrow">
                    <span className={`toggle-arrow-icon ${isExpanded ? 'rotated' : ''}`}>▶</span>
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
                        {fig.steps.length} step{fig.steps.length === 1 ? '' : 's'}
                      </span>
                    </td>
                  )}
                  {showNotes && (
                    <td className="general-notes-summary-cell desktop-only">
                      <span className="notes-text truncate">{fig.generalNotes || '—'}</span>
                    </td>
                  )}
                </tr>

                {/* Expanded Sub-table Row */}
                {isExpanded && (
                  <tr className="figure-child-row">
                    <td colSpan={colSpan} className="expanded-details-cell">
                      <div className="dropdown-details-wrapper">
                        <div className="nested-table-scroll">
                          <table className="nested-steps-table">
                            <thead>
                              <tr>
                                {innerHeaders.map((header) => {
                                  let className = '';
                                  if (header === 'Step') className = 'th-step';
                                  else if (header.startsWith('Lead ')) className = 'th-lead';
                                  else if (header.startsWith('Follow ')) className = 'th-follow';
                                  
                                  return (
                                    <th key={header} className={className}>
                                      <span className="header-text-desktop">{header}</span>
                                      <span className="header-text-mobile">{getShortenedHeader(header)}</span>
                                    </th>
                                  );
                                })}
                              </tr>
                            </thead>
                            <tbody>
                              {fig.steps.map((step, idx) => (
                                <tr key={idx}>
                                  {innerHeaders.map((header) => {
                                    let className = '';
                                    if (header === 'Step') className = 'td-step';
                                    else if (header.startsWith('Lead ')) className = 'td-lead';
                                    else if (header.startsWith('Follow ')) className = 'td-follow';
                                    
                                    return (
                                      <td key={header} className={className}>
                                        {renderCell(header, step[header])}
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
