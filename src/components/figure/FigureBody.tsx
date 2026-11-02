import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { FigureGroup } from '../../types';
import type { FigureScroll } from '../../hooks/useFigureScroll';
import { usePartChoice } from '../../hooks/usePartChoice';
import { useRouteStep } from '../../hooks/useRouteStep';
import { useSettings } from '../../state/useSettings';
import { hasNotes, parseFigureNotes } from '../../utils/figureNotes';
import { levelLook } from '../../utils/levels';
import { barCount, buildBeats, formatBars, hasTiming } from '../../utils/rhythm';
import PositionsLine from '../ui/PositionsLine';
import RhythmStrip from '../ui/RhythmStrip';
import PartControls from '../ui/PartControls';
import { accentFor } from '../ui/accent';
import AboutAside from './AboutAside';
import AboutBand from './AboutBand';
import StepChart from './StepChart';
import StepList from './StepList';
import './FigureScreen.css';

export interface FigureBodyProps {
  figure: FigureGroup;
  // From useFigureScroll(), called by the host. FigureBody renders the scroll
  // container and attaches it; the host keeps the state (`scrolled`, ...).
  scroll: FigureScroll;
  // Rendered first in the scroller, ahead of the header, so it can pin to the
  // top of it (desktop: breadcrumb, Copy link, menu). Nothing on mobile,
  // whose top bar sits outside the body.
  headerSlot?: ReactNode;
  // 'list' is the phone's step list. 'adaptive' is for a wide pane: the
  // chart when the pane is 640px or wider (the list below that), and the
  // About content open beside it from a 1280px window.
  layout?: 'list' | 'adaptive';
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

// Everything of an open figure but the screen's own top bar: header, About
// band, frozen block (positions, rhythm strip, part controls) and the steps.
// The host keys it (and the scroll hook's owner) by figure so scroll position
// and the About band start fresh.
export default function FigureBody({ figure, scroll, headerSlot, layout = 'list' }: FigureBodyProps) {
  const { role, sideBySide, fields } = useSettings();
  const { listRef, barRef, titleRef, current, onScroll, goToStep, keepPlace } = scroll;
  useRouteStep(scroll);

  const beats = useMemo(() => buildBeats(figure), [figure]);
  const notes = useMemo(() => parseFigureNotes(figure.generalNotes), [figure]);
  const timed = hasTiming(figure);
  const bars = barCount(figure);
  const accent = accentFor(role, sideBySide);
  const level = levelLook(figure.level);
  const aside = layout === 'adaptive' && hasNotes(notes);

  // Switching part or side by side must not move the reader's place.
  const { pickRole, pickSideBySide } = usePartChoice(keepPlace);

  const stepProps = {
    figure,
    role,
    sideBySide,
    fields: fields[figure.style],
    beats,
    timed,
    current,
    accent,
  };

  return (
    <div ref={listRef} className={`fig-scroll${aside ? ' fig-has-aside' : ''}`} onScroll={onScroll}>
      {headerSlot}
      <header className="fig-header">
        <h1 ref={titleRef} className="fig-title" tabIndex={-1}>
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
        <AboutBand figure={figure} notes={notes} />
      </header>

      <div ref={barRef} className="fig-bar">
        <PositionsLine start={figure.startingPosition} end={figure.endingPosition} />
        <RhythmStrip beats={beats} current={current - 1} accent={accent} onSelect={(i) => goToStep(i + 1)} />
        <PartControls role={role} sideBySide={sideBySide} onRole={pickRole} onSideBySide={pickSideBySide} />
      </div>

      {layout === 'list' ? (
        <StepList {...stepProps} />
      ) : (
        <div className="fig-main">
          <div className="fig-main-steps">
            <StepList {...stepProps} />
            <StepChart {...stepProps} />
          </div>
          {aside && <AboutAside figure={figure} notes={notes} />}
        </div>
      )}
    </div>
  );
}
