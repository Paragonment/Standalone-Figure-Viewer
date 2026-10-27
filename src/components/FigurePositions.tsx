import React from 'react';
import type { FigureGroup } from '../types';
import './FigurePositions.css';

interface FigurePositionsProps {
  figure: FigureGroup;
  showStart?: boolean;
  showEnd?: boolean;
}

// Where a figure starts and ends (Closed, Fan, Promenade...). Latin
// figures are chained by these positions, so they read as a path from one
// to the other. Renders nothing for figures that don't chart them.
const FigurePositions: React.FC<FigurePositionsProps> = ({ figure, showStart = true, showEnd = true }) => {
  const start = showStart ? figure.startingPosition : '';
  const end = showEnd ? figure.endingPosition : '';
  if (!start && !end) return null;

  return (
    <div className="figure-positions">
      {start && (
        <span className="figure-position">
          <span className="figure-position-label">Starts</span>
          <span className="figure-position-value">{start}</span>
        </span>
      )}
      {start && end && <span className="figure-position-arrow" aria-hidden="true">→</span>}
      {end && (
        <span className="figure-position">
          <span className="figure-position-label">Ends</span>
          <span className="figure-position-value">{end}</span>
        </span>
      )}
    </div>
  );
};

export default FigurePositions;
