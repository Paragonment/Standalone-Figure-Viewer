import React from 'react';
import './ColumnToggle.css';

interface ColumnToggleProps {
  columns: string[];
  visibleColumns: string[];
  setVisibleColumns: (cols: string[]) => void;
  toggleColumn: (column: string) => void;
  filteredCount: number;
}

const COMMON_COLUMNS = ['Dance', 'Step', 'General Notes', 'Level'];
const LEAD_COLUMNS = [
  'Lead Feet Positions',
  'Lead Alignment',
  'Lead Amount of Turn',
  'Lead Rise and Fall',
  'Lead Footwork',
  'Lead CBM',
  'Lead Sway'
];
const FOLLOW_COLUMNS = [
  'Follow Feet Positions',
  'Follow Alignment',
  'Follow Amount of Turn',
  'Follow Rise and Fall',
  'Follow Footwork',
  'Follow CBM',
  'Follow Sway'
];

const ColumnToggle: React.FC<ColumnToggleProps> = ({
  columns,
  visibleColumns,
  setVisibleColumns,
  toggleColumn,
  filteredCount
}) => {
  // Determine active preset based on currently visible columns
  const getActivePreset = (): 'all' | 'lead' | 'follow' | 'custom' => {
    if (columns.length === 0) return 'all';

    const hasAll = columns.every(col => visibleColumns.includes(col));
    if (hasAll && visibleColumns.length === columns.length) return 'all';

    const matchesLead = columns.every(col => {
      const expected = COMMON_COLUMNS.includes(col) || LEAD_COLUMNS.includes(col);
      return visibleColumns.includes(col) === expected;
    });
    if (matchesLead) return 'lead';

    const matchesFollow = columns.every(col => {
      const expected = COMMON_COLUMNS.includes(col) || FOLLOW_COLUMNS.includes(col);
      return visibleColumns.includes(col) === expected;
    });
    if (matchesFollow) return 'follow';

    return 'custom';
  };

  const activePreset = getActivePreset();

  const applyPreset = (preset: 'all' | 'lead' | 'follow') => {
    if (preset === 'all') {
      setVisibleColumns([...columns]);
    } else if (preset === 'lead') {
      setVisibleColumns(columns.filter(col => COMMON_COLUMNS.includes(col) || LEAD_COLUMNS.includes(col)));
    } else if (preset === 'follow') {
      setVisibleColumns(columns.filter(col => COMMON_COLUMNS.includes(col) || FOLLOW_COLUMNS.includes(col)));
    }
  };

  // Group columns for cleaner display in custom toggle grid
  const commonHeaders = columns.filter(col => COMMON_COLUMNS.includes(col));
  const leadHeaders = columns.filter(col => LEAD_COLUMNS.includes(col));
  const followHeaders = columns.filter(col => FOLLOW_COLUMNS.includes(col));

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
            Showing <strong> {filteredCount} </strong> figure{filteredCount === 1 ? '' : 's'}
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
