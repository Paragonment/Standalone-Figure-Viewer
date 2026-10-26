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
type Direction = 'next' | 'prev';

const FEET_FIELD = STEP_FIELDS.find((f) => f.key === 'Feet Positions')!;
const ALIGNMENT_FIELD = STEP_FIELDS.find((f) => f.key === 'Alignment')!;
const META_FIELDS = STEP_FIELDS.filter((f) => f.key !== 'Feet Positions' && f.key !== 'Alignment');

const ROLES: { id: Role; label: string; icon: string }[] = [
  { id: 'lead', label: 'Lead', icon: '🕺' },
  { id: 'follow', label: 'Follow', icon: '💃' },
];

// Movement before a touch commits to an axis, so a slightly diagonal
// vertical scroll never starts dragging the step sideways.
const AXIS_LOCK_PX = 8;
// A drag past this fraction of the stepper's width changes step...
const COMMIT_FRACTION = 0.22;
// ...as does a quick flick, however short.
const FLICK_MS = 250;
const FLICK_PX = 35;
// How much of the drag carries through when there's no step that way.
const EDGE_RESISTANCE = 0.3;

const roleKey = (role: Role): 'leadKey' | 'followKey' => (role === 'lead' ? 'leadKey' : 'followKey');

// The swipe hint is for discovering the gesture, so once someone has swiped
// it stays hidden for the rest of the visit, across figures and modes.
let hasSwipedThisVisit = false;

interface DragState {
  x: number;
  y: number;
  t: number;
  axis: 'x' | 'y' | null;
  dx: number;
}

const PracticeStepper: React.FC<PracticeStepperProps> = ({ figure, visibleColumns }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [primaryRole, setPrimaryRole] = useState<Role>('lead');
  // Which way the current step arrived from; drives its slide-in.
  const [enterFrom, setEnterFrom] = useState<Direction | null>(null);
  const [showHint, setShowHint] = useState(!hasSwipedThisVisit);
  const drag = useRef<DragState | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);

  // A different figure means a different step count, so start over rather
  // than risk landing past the end of a shorter figure.
  useEffect(() => {
    setStepIndex(0);
    setEnterFrom(null);
  }, [figure]);

  const total = figure.steps.length;
  const step = figure.steps[stepIndex];

  const goTo = (next: number) => {
    if (next < 0 || next >= total || next === stepIndex) return;
    setEnterFrom(next > stepIndex ? 'next' : 'prev');
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

  const setSlideOffset = (px: number, animate: boolean) => {
    const el = slideRef.current;
    if (!el) return;
    el.style.transition = animate ? 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none';
    el.style.transform = px === 0 ? '' : `translateX(${px}px)`;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    drag.current = { x: t.clientX, y: t.clientY, t: e.timeStamp, axis: null, dx: 0 };
  };

  // The step follows the finger, so the gesture shows what it will do
  // before you let go.
  const handleTouchMove = (e: React.TouchEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.touches[0].clientX - d.x;
    const dy = e.touches[0].clientY - d.y;
    if (!d.axis) {
      if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
      d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (d.axis !== 'x') return;
    const atEdge = (dx < 0 && stepIndex === total - 1) || (dx > 0 && stepIndex === 0);
    d.dx = atEdge ? dx * EDGE_RESISTANCE : dx;
    setSlideOffset(d.dx, false);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.axis !== 'x') return;

    const width = bodyRef.current?.clientWidth ?? 320;
    const elapsed = e.timeStamp - d.t;
    const direction: Direction = d.dx < 0 ? 'next' : 'prev';
    const target = stepIndex + (direction === 'next' ? 1 : -1);
    const farEnough = Math.abs(d.dx) > width * COMMIT_FRACTION;
    const flicked = elapsed < FLICK_MS && Math.abs(d.dx) > FLICK_PX;

    if ((farEnough || flicked) && target >= 0 && target < total) {
      hasSwipedThisVisit = true;
      setShowHint(false);
      goTo(target);
    } else {
      setSlideOffset(0, true);
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
        {/* Progress doubles as navigation: each segment jumps to its step,
            the non-gesture way to move now that there are no arrow buttons. */}
        <div className="ps-dots" role="group" aria-label="Steps">
          {figure.steps.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`ps-dot ${i <= stepIndex ? 'done' : ''}`}
              aria-label={`Step ${i + 1}`}
              aria-current={i === stepIndex ? 'step' : undefined}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        <div className="ps-role-toggle" role="radiogroup" aria-label="Whose part to show">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={primaryRole === r.id}
              className={`ps-role-option ${r.id}`}
              onClick={() => setPrimaryRole(r.id)}
            >
              <span aria-hidden="true">{r.icon}</span> {r.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="ps-body"
        ref={bodyRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          drag.current = null;
          setSlideOffset(0, true);
        }}
      >
        {/* Keyed by step so each new step mounts fresh and plays its
            slide-in from the side it came from. */}
        <div
          key={stepIndex}
          ref={slideRef}
          className={`ps-slide ${enterFrom ? `enter-${enterFrom}` : ''}`}
        >
          <div className="ps-hero">
            <div className="ps-count">Step {stepIndex + 1} of {total}</div>
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
      </div>

      {/* Outside the keyed slide so it persists and screen readers hear
          each step change, however it was triggered. */}
      <span className="ps-sr-only" aria-live="polite">
        Step {stepIndex + 1} of {total}
      </span>

      {showHint && total > 1 && (
        <div className="ps-hint" aria-hidden="true">
          <span>‹</span> Swipe to change step <span>›</span>
        </div>
      )}
    </div>
  );
};

export default PracticeStepper;
