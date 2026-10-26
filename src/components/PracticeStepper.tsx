import React, { useEffect, useRef, useState } from 'react';
import type { FigureGroup } from '../types';
import { STEP_FIELDS } from '../utils/stepFields';
import FieldValue from './FieldValue';
import './PracticeStepper.css';

interface PracticeStepperProps {
  figure: FigureGroup;
  visibleColumns: string[];
}

type Role = 'lead' | 'follow';

const FEET_FIELD = STEP_FIELDS.find((f) => f.key === 'Feet Positions')!;
const ALIGNMENT_FIELD = STEP_FIELDS.find((f) => f.key === 'Alignment')!;
const META_FIELDS = STEP_FIELDS.filter((f) => f.key !== 'Feet Positions' && f.key !== 'Alignment');

const roleKey = (role: Role): 'leadKey' | 'followKey' => (role === 'lead' ? 'leadKey' : 'followKey');

const PracticeStepper: React.FC<PracticeStepperProps> = ({ figure, visibleColumns }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [primaryRole, setPrimaryRole] = useState<Role>('lead');
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // A different figure means a different step count, so start over rather
  // than risk landing past the end of a shorter figure.
  useEffect(() => {
    setStepIndex(0);
  }, [figure]);

  const total = figure.steps.length;
  const step = figure.steps[stepIndex];

  const goTo = (next: number) => {
    if (next < 0 || next >= total) return;
    setStepIndex(next);
    // Each step starts from its top, not wherever the last one was scrolled to.
    bodyRef.current?.scrollTo({ top: 0 });
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(stepIndex + 1);
      if (e.key === 'ArrowLeft') goTo(stepIndex - 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, total]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    // Only a mostly-horizontal drag is a swipe; a vertical one is the user
    // scrolling a long step and shouldn't change steps.
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      goTo(stepIndex + (dx < 0 ? 1 : -1));
    }
  };

  if (!step) return null;

  const primaryK = roleKey(primaryRole);
  const secondaryRole: Role = primaryRole === 'lead' ? 'follow' : 'lead';
  const secondaryK = roleKey(secondaryRole);

  const showFeet = visibleColumns.includes(FEET_FIELD[primaryK]);
  const showAlign = visibleColumns.includes(ALIGNMENT_FIELD[primaryK]);
  const metaFields = META_FIELDS.filter((f) => visibleColumns.includes(f[primaryK]));

  const secondaryShowFeet = visibleColumns.includes(FEET_FIELD[secondaryK]);
  const secondaryShowAlign = visibleColumns.includes(ALIGNMENT_FIELD[secondaryK]);
  const secondarySummary = [
    secondaryShowFeet ? step[FEET_FIELD[secondaryK]] : null,
    secondaryShowAlign ? step[ALIGNMENT_FIELD[secondaryK]] : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="practice-stepper">
      <div className="ps-top">
        <div className="ps-dots">
          {figure.steps.map((_, i) => (
            <span key={i} className={`ps-dot ${i <= stepIndex ? 'done' : ''}`} />
          ))}
        </div>
        <div className="ps-count">
          Step {stepIndex + 1} / {total}
        </div>
      </div>

      <div className="ps-role-switch" role="tablist" aria-label="Whose part to show">
        <button
          type="button"
          role="tab"
          aria-selected={primaryRole === 'lead'}
          className={`ps-role-btn lead ${primaryRole === 'lead' ? 'active' : ''}`}
          onClick={() => setPrimaryRole('lead')}
        >
          🕺 Lead
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={primaryRole === 'follow'}
          className={`ps-role-btn follow ${primaryRole === 'follow' ? 'active' : ''}`}
          onClick={() => setPrimaryRole('follow')}
        >
          💃 Follow
        </button>
      </div>

      <div className="ps-body" ref={bodyRef} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="ps-hero">
          {showFeet && <div className="ps-feet">{step[FEET_FIELD[primaryK]]}</div>}
          {showAlign && <div className="ps-align">{step[ALIGNMENT_FIELD[primaryK]]}</div>}
        </div>

        {metaFields.length > 0 && (
          <div className="ps-meta-grid">
            {metaFields.map((f) => (
              <div key={f.key} className="ps-meta-cell">
                <span className="ps-meta-label">{f.label}</span>
                <FieldValue field={f.key} value={step[f[primaryK]]} />
              </div>
            ))}
          </div>
        )}

        {secondarySummary && (
          <div className="ps-secondary">
            <div className="ps-secondary-label">{secondaryRole} on this step</div>
            <div className="ps-secondary-value">{secondarySummary}</div>
          </div>
        )}
      </div>

      <div className="ps-nav">
        <button
          type="button"
          className="ps-arrow"
          disabled={stepIndex === 0}
          onClick={() => goTo(stepIndex - 1)}
          aria-label="Previous step"
        >
          ←
        </button>
        <button
          type="button"
          className="ps-arrow"
          disabled={stepIndex === total - 1}
          onClick={() => goTo(stepIndex + 1)}
          aria-label="Next step"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default PracticeStepper;
