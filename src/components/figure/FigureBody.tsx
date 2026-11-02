import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { FigureGroup, Role } from '../../types';
import type { FigureScroll } from '../../hooks/useFigureScroll';
import { useSettings } from '../../state/useSettings';
import { parseFigureNotes } from '../../utils/figureNotes';
import { levelLook } from '../../utils/levels';
import { barCount, buildBeats, formatBars, hasTiming } from '../../utils/rhythm';
import PositionsLine from '../ui/PositionsLine';
import RhythmStrip from '../ui/RhythmStrip';
import PartControls from '../ui/PartControls';
import { accentFor } from '../ui/accent';
import AboutBand from './AboutBand';
import StepList from './StepList';
import './FigureScreen.css';

export interface FigureBodyProps {
  figure: FigureGroup;
  // From useFigureScroll(), called by the host. FigureBody renders the scroll
  // container and attaches it; the host keeps the state (`scrolled`, ...).
  scroll: FigureScroll;
  // Rendered above the title, inside the header (desktop: breadcrumb, Copy
  // link, menu). Nothing on mobile, whose top bar sits outside the body.
  headerSlot?: ReactNode;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

// Everything of an open figure but the screen's own top bar: header, About
// band, frozen block (positions, rhythm strip, part controls) and the steps.
// The host keys it (and the scroll hook's owner) by figure so scroll position
// and the About band start fresh.
export default function FigureBody({ figure, scroll, headerSlot }: FigureBodyProps) {
  const { role, sideBySide, fields, setRole, setSideBySide } = useSettings();
  const { listRef, barRef, titleRef, current, onScroll, goToStep, keepPlace } = scroll;

  const beats = useMemo(() => buildBeats(figure), [figure]);
  const notes = useMemo(() => parseFigureNotes(figure.generalNotes), [figure]);
  const timed = hasTiming(figure);
  const bars = barCount(figure);
  const accent = accentFor(role, sideBySide);
  const level = levelLook(figure.level);

  // Switching part or side by side must not move the reader's place.
  const pickRole = (next: Role) => {
    if (next === role && !sideBySide) return;
    keepPlace();
    setRole(next);
  };
  const pickSideBySide = (on: boolean) => {
    if (on === sideBySide) return;
    keepPlace();
    setSideBySide(on);
  };

  return (
    <div ref={listRef} className="fig-scroll" onScroll={onScroll}>
      <header className="fig-header">
        {headerSlot}
        <h1 ref={titleRef} className="fig-title">
          {figure.name}
        </h1>
        <p className="fig-meta">
          <span>{figure.dance}</span>
          <span className="fig-level" style={{ color: level.text }}>
            {figure.level}
          </span>
          <span>
            {plural(figure.steps.length, 'step')}
            {bars !== null && `, ${formatBars(bars)}`}
          </span>
        </p>
        <AboutBand notes={notes} />
      </header>

      <div ref={barRef} className="fig-bar">
        <PositionsLine start={figure.startingPosition} end={figure.endingPosition} />
        <RhythmStrip beats={beats} current={current - 1} accent={accent} onSelect={(i) => goToStep(i + 1)} />
        <PartControls role={role} sideBySide={sideBySide} onRole={pickRole} onSideBySide={pickSideBySide} />
      </div>

      <StepList
        figure={figure}
        role={role}
        sideBySide={sideBySide}
        fields={fields[figure.style]}
        beats={beats}
        timed={timed}
        current={current}
        accent={accent}
      />
    </div>
  );
}
