import React from 'react';
import type { FigureGroup } from '../types';
import type { DetailMode } from '../utils/detailModes';
import { getDanceEmoji, getLevelEmoji } from '../utils/danceEmoji';
import StepCardList from './StepCardList';
import FigurePositions from './FigurePositions';
import PracticeStepper from './PracticeStepper';
import './FigureDetail.css';

interface FigureDetailProps {
  figure: FigureGroup;
  visibleColumns: string[];
  mode: DetailMode;
}

// Controls you set once stay out of the content: the viewing mode is picked
// from the figure's title in the top bar, and which step fields show from
// the header's settings button. Practice is focused and full-bleed: the
// figure overview drops away too, so the stepper gets the whole screen
// without nesting a scroll area inside a scrolling page.
const FigureDetail: React.FC<FigureDetailProps> = ({ figure, visibleColumns, mode }) => {
  return (
    <div className={`figure-detail mode-${mode}`}>
      {mode === 'cards' ? (
        <>
          <div className="figure-detail-meta">
            <span className="dance-badge">
              <span className="dance-badge-icon">{getDanceEmoji(figure.dance)}</span>
              <span className="dance-badge-name">{figure.dance}</span>
            </span>
            <span className={`level-badge ${figure.level.toLowerCase().replace(' ', '-')}`}>
              {getLevelEmoji(figure.level)} {figure.level}
            </span>
            <span className="step-count-badge">
              {figure.steps.length} step{figure.steps.length === 1 ? '' : 's'}
            </span>
          </div>

          <FigurePositions
            figure={figure}
            showStart={visibleColumns.includes('Starting Position')}
            showEnd={visibleColumns.includes('Ending Position')}
          />

          {figure.generalNotes && <p className="figure-detail-notes">{figure.generalNotes}</p>}

          <StepCardList figure={figure} visibleColumns={visibleColumns} />
        </>
      ) : (
        <PracticeStepper figure={figure} visibleColumns={visibleColumns} />
      )}
    </div>
  );
};

export default FigureDetail;
