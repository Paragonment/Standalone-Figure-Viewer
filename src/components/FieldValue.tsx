import React from 'react';
import { useDisplaySettings } from '../hooks/useDisplaySettings';
import { formatStepValue } from '../utils/stepValues';
import './FieldValue.css';

interface FieldValueProps {
  field: string;
  value: string;
}

// One step value in a table cell. Empty and "Nil" values render nothing
// (no placeholder dashes); footwork shorthand is spelled out.
const FieldValue: React.FC<FieldValueProps> = ({ field, value }) => {
  const { spellOutAbbreviations } = useDisplaySettings();
  const text = formatStepValue(field, value, spellOutAbbreviations);
  if (text === null) return null;

  switch (field) {
    case 'CBM':
      return <span className="field-pill field-pill-strong">{text}</span>;

    case 'Footwork':
      return (
        <span className="field-pill" title={value}>
          {text}
        </span>
      );

    case 'Sway':
      return <span className="field-pill">{text}</span>;

    default:
      return <span className="standard-text">{text}</span>;
  }
};

export default FieldValue;
