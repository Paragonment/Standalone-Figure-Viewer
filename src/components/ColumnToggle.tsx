import React from 'react';
import type { DanceStyle } from '../types';
import { ALWAYS_VISIBLE_COLUMNS, getColumnGroup } from '../utils/columns';
import './ColumnToggle.css';

interface ColumnToggleProps {
  columns: string[];
  // Styles whose data has each column; a column only one style charts
  // (e.g. Standard's Sway, Latin's Timing) is tagged with that style.
  columnStyles: Record<string, DanceStyle[]>;
  visibleColumns: string[];
  setVisibleColumns: (cols: string[]) => void;
  toggleColumn: (column: string) => void;
}

// A column is "expected" visible under a Lead/Follow preset if it isn't
// tagged for the opposite role - this keeps presets correct automatically
// for any new "Lead "/"Follow "-prefixed CSV column, with no list to update.
const expectedForPreset = (column: string, preset: 'lead' | 'follow') => {
  if (ALWAYS_VISIBLE_COLUMNS.includes(column)) return true;
  const opposite = preset === 'lead' ? 'follow' : 'lead';
  return getColumnGroup(column) !== opposite;
};

const ColumnToggle: React.FC<ColumnToggleProps> = ({
  columns,
  columnStyles,
  visibleColumns,
  setVisibleColumns,
  toggleColumn
}) => {
  const styleCount = new Set(Object.values(columnStyles).flat()).size;
  const styleTag = (col: string) => {
    const styles = columnStyles[col] ?? [];
    if (styleCount < 2 || styles.length !== 1) return null;
    return <span className={`column-style-tag ${styles[0].toLowerCase()}`}>{styles[0]}</span>;
  };

  // Determine active preset based on currently visible columns
  const getActivePreset = (): 'all' | 'lead' | 'follow' | 'custom' => {
    if (columns.length === 0) return 'all';

    const hasAll = columns.every(col => visibleColumns.includes(col));
    if (hasAll && visibleColumns.length === columns.length) return 'all';

    const matchesLead = columns.every(col => visibleColumns.includes(col) === expectedForPreset(col, 'lead'));
    if (matchesLead) return 'lead';

    const matchesFollow = columns.every(col => visibleColumns.includes(col) === expectedForPreset(col, 'follow'));
    if (matchesFollow) return 'follow';

    return 'custom';
  };

  const activePreset = getActivePreset();

  const applyPreset = (preset: 'all' | 'lead' | 'follow') => {
    if (preset === 'all') {
      setVisibleColumns([...columns]);
    } else {
      setVisibleColumns(columns.filter(col => expectedForPreset(col, preset)));
    }
  };

  // Group columns for cleaner display in custom toggle grid
  const commonHeaders = columns.filter(col => getColumnGroup(col) === 'common' && !ALWAYS_VISIBLE_COLUMNS.includes(col));
  const leadHeaders = columns.filter(col => getColumnGroup(col) === 'lead');
  const followHeaders = columns.filter(col => getColumnGroup(col) === 'follow');

  const headers = visibleColumns.length > 0
    ? columns.filter(h => visibleColumns.includes(h))
    : columns;

  const innerHeaders = headers.filter(h => h !== 'Dance' && h !== 'Figure Name' && h !== 'Level');

  const showDance = visibleColumns.length === 0 || visibleColumns.includes('Dance');
  const showLevel = visibleColumns.length === 0 || visibleColumns.includes('Level');
  const showStep = visibleColumns.length === 0 || visibleColumns.includes('Step');
  const showNotes = visibleColumns.length === 0 || visibleColumns.includes('General Notes');

  const mainColumnsCount = 1 + (showDance ? 1 : 0) + 1 + (showLevel ? 1 : 0) + (showStep ? 1 : 0) + (showNotes ? 1 : 0);
  const subColumnsCount = innerHeaders.length;
  const totalColumnsCount = mainColumnsCount + subColumnsCount;

  return (
    <div className="column-control-panel">
      <div className="preset-row">
        <div className="preset-group">
          <div className="segmented-control">
            <button
              className={`preset-btn ${activePreset === 'all' ? 'active' : ''}`}
              onClick={() => applyPreset('all')}
            >
              Show All
            </button>
            <button
              className={`preset-btn ${activePreset === 'lead' ? 'active' : ''}`}
              onClick={() => applyPreset('lead')}
            >
              🕺 Lead
            </button>
            <button
              className={`preset-btn ${activePreset === 'follow' ? 'active' : ''}`}
              onClick={() => applyPreset('follow')}
            >
              💃 Follow
            </button>
            {activePreset === 'custom' && (
              <span className="preset-badge">Customized</span>
            )}
          </div>
        </div>
        
        <div className="preset-results-summary">
          <span className="results-count-text">
            Showing <strong> {totalColumnsCount} </strong> column{totalColumnsCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="granular-columns-container">
        <div className="column-group-grid">
          <div className="column-group-card">
            <h5>Common Info</h5>
            <div className="column-checkbox-list">
              {commonHeaders.map(col => (
                <label key={col} className="column-checkbox-item">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(col)}
                    onChange={() => toggleColumn(col)}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="column-name">{col}</span>
                  {styleTag(col)}
                </label>
              ))}
            </div>
          </div>

          <div className="column-group-card lead-card">
            <h5>Lead (Man) Details</h5>
            <div className="column-checkbox-list">
              {leadHeaders.map(col => (
                <label key={col} className="column-checkbox-item">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(col)}
                    onChange={() => toggleColumn(col)}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="column-name">{col.replace('Lead ', '')}</span>
                  {styleTag(col)}
                </label>
              ))}
            </div>
          </div>

          <div className="column-group-card follow-card">
            <h5>Follow (Lady) Details</h5>
            <div className="column-checkbox-list">
              {followHeaders.map(col => (
                <label key={col} className="column-checkbox-item">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(col)}
                    onChange={() => toggleColumn(col)}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="column-name">{col.replace('Follow ', '')}</span>
                  {styleTag(col)}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnToggle;
