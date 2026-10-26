import React from 'react';
import './FieldValue.css';

interface FieldValueProps {
  field: string;
  value: string;
}

const FieldValue: React.FC<FieldValueProps> = ({ field, value }) => {
  if (!value || value.trim() === '' || value.trim() === 'Nil') {
    return <span className="cell-empty">—</span>;
  }

  switch (field) {
    case 'CBM': {
      const isCbm = value.toLowerCase() === 'true';
      return (
        <span className={`cbm-pill ${isCbm ? 'active' : 'inactive'}`}>
          {isCbm ? 'CBM' : 'No'}
        </span>
      );
    }

    case 'Footwork':
      return (
        <span className="footwork-pill" title={value}>
          {value}
        </span>
      );

    case 'Sway': {
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
      return <span className={`sway-pill ${swayClass}`}>{swayLabel}</span>;
    }

    default:
      return <span className="standard-text">{value}</span>;
  }
};

export default FieldValue;
