import React from 'react';
import type { DanceStyle } from '../types';
import CheckBox from './ui/CheckBox';
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
    return <span className="column-style-tag">{styles[0]}</span>;
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

  const renderColumn = (col: string, label: string) => (
    <label key={col} className="column-checkbox-item">
      <input
        type="checkbox"
        className="fv-sr-only"
        checked={visibleColumns.includes(col)}
        onChange={() => toggleColumn(col)}
      />
      <CheckBox state={visibleColumns.includes(col) ? 'on' : 'off'} />
      <span className="column-name">{label}</span>
      {styleTag(col)}
    </label>
  );

  return (
    <div className="column-control-panel">
      <div className="column-preset-row">
        <div className="column-presets" role="group" aria-label="Column presets">
          <button
            type="button"
            className={`column-preset${activePreset === 'all' ? ' on' : ''}`}
            aria-pressed={activePreset === 'all'}
            onClick={() => applyPreset('all')}
          >
            Show all
          </button>
          <button
            type="button"
            className={`column-preset lead${activePreset === 'lead' ? ' on' : ''}`}
            aria-pressed={activePreset === 'lead'}
            onClick={() => applyPreset('lead')}
          >
            Lead
          </button>
          <button
            type="button"
            className={`column-preset follow${activePreset === 'follow' ? ' on' : ''}`}
            aria-pressed={activePreset === 'follow'}
            onClick={() => applyPreset('follow')}
          >
            Follow
          </button>
        </div>
        {activePreset === 'custom' && <span className="column-custom">Customized</span>}

        <p className="column-count" aria-live="polite">
          Showing <strong>{totalColumnsCount}</strong> column{totalColumnsCount === 1 ? '' : 's'}
        </p>
      </div>

      <div className="column-group-grid">
        <div className="column-group">
          <h5>Common info</h5>
          <div className="column-checkbox-list">
            {commonHeaders.map(col => renderColumn(col, col))}
          </div>
        </div>

        <div className="column-group lead-group">
          <h5>Lead details</h5>
          <div className="column-checkbox-list">
            {leadHeaders.map(col => renderColumn(col, col.replace('Lead ', '')))}
          </div>
        </div>

        <div className="column-group follow-group">
          <h5>Follow details</h5>
          <div className="column-checkbox-list">
            {followHeaders.map(col => renderColumn(col, col.replace('Follow ', '')))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnToggle;
