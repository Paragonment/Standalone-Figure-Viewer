import React, { useState } from 'react';
import './ColumnToggle.css';

interface ColumnToggleProps {
  columns: string[];
  visibleColumns: string[];
  setVisibleColumns: (cols: string[]) => void;
  toggleColumn: (column: string) => void;
}

const COMMON_COLUMNS = ['Dance', 'Figure Name', 'Step', 'General Notes'];
const LEAD_COLUMNS = [
  'Man Feet Positions',
  'Man Alignment',
  'Man Amount of Turn',
  'Man Rise and Fall',
  'Man Footwork',
  'Man CBM',
  'Man Sway'
];
const FOLLOW_COLUMNS = [
  'Lady Feet Positions',
  'Lady Alignment',
  'Lady Amount of Turn',
  'Lady Rise and Fall',
  'Lady Footwork',
  'Lady CBM',
  'Lady Sway'
];

const ColumnToggle: React.FC<ColumnToggleProps> = ({
  columns,
  visibleColumns,
  setVisibleColumns,
  toggleColumn
}) => {
  const [isOpen, setIsOpen] = useState(false);

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
          <span className="preset-label">Role View:</span>
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
              🕺 Lead (Man)
            </button>
            <button
              className={`preset-btn ${activePreset === 'follow' ? 'active' : ''}`}
              onClick={() => applyPreset('follow')}
            >
              💃 Follow (Lady)
            </button>
            {activePreset === 'custom' && (
              <span className="preset-badge">Customized</span>
            )}
          </div>
        </div>

        <button
          className={`customize-toggle-btn ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="icon">⚙️</span>
          <span>{isOpen ? 'Hide Column Settings' : 'Customize Columns'}</span>
          <span className="arrow">{isOpen ? '▲' : '▼'}</span>
        </button>
      </div>

      {isOpen && (
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
                    <span className="column-name">{col.replace('Man ', '')}</span>
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
                    <span className="column-name">{col.replace('Lady ', '')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnToggle;
