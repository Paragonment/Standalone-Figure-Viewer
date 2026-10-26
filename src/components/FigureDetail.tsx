import React from 'react';
import type { FigureGroup } from '../types';
import { getDanceEmoji, getLevelEmoji } from '../utils/danceEmoji';
import StepCardList from './StepCardList';
import PracticeStepper from './PracticeStepper';
import './FigureDetail.css';

export type DetailMode = 'cards' | 'practice';

interface DetailModeDef {
  id: DetailMode;
  label: string;
  icon: string;
}

// Ordered list of ways to view a figure's steps. To add another one (e.g. a
// future "Quiz" mode), add an entry here and a case in the render switch below.
const DETAIL_MODES: DetailModeDef[] = [
  { id: 'cards', label: 'Step Cards', icon: '🗂️' },
  { id: 'practice', label: 'Practice', icon: '▶️' },
];

interface FigureDetailProps {
  figure: FigureGroup;
  visibleColumns: string[];
  mode: DetailMode;
  setMode: (mode: DetailMode) => void;
}

const FigureDetail: React.FC<FigureDetailProps> = ({
  figure,
  visibleColumns,
  mode,
  setMode,
}) => {
  // The mode switch stays first in both modes so it doesn't jump out from
  // under your thumb when you tap it. Which step fields show is chosen
  // from the header's settings button rather than inline, so neither mode
  // spends screen space on a control you set once. Practice is focused and
  // full-bleed: the figure overview drops away too, so the stepper gets the
  // whole screen without nesting a scroll area inside a scrolling page.
  return (
    <div className={`figure-detail mode-${mode}`}>
      <div className="mode-switch" role="tablist" aria-label="Viewing mode">
        {DETAIL_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            className={`mode-switch-btn ${mode === m.id ? 'active' : ''}`}
            onClick={() => setMode(m.id)}
          >
            <span aria-hidden="true">{m.icon}</span> {m.label}
          </button>
        ))}
      </div>

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
