import { useMemo } from 'react';
import type { FigureGroup, Role } from '../../types';
import { useStepScroll } from '../../hooks/useStepScroll';
import { useSettings } from '../../state/useSettings';
import { parseFigureNotes } from '../../utils/figureNotes';
import { levelLook } from '../../utils/levels';
import { barCount, buildBeats, formatBars, hasTiming } from '../../utils/rhythm';
import TopBar from '../ui/TopBar';
import PracticeButton from '../ui/PracticeButton';
import PositionsLine from '../ui/PositionsLine';
import RhythmStrip from '../ui/RhythmStrip';
import PartControls from '../ui/PartControls';
import { accentFor } from '../ui/accent';
import AboutBand from './AboutBand';
import StepList from './StepList';
import './FigureScreen.css';

export interface FigureScreenProps {
  figure: FigureGroup;
  onBack(): void;
  onPractice(): void;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

function FigureView({ figure, onBack, onPractice }: FigureScreenProps) {
  const { role, sideBySide, fields, setRole, setSideBySide } = useSettings();
  const scroll = useStepScroll(`${role}-${sideBySide}`);
  const { listRef, barRef, titleRef, current, scrolled, onScroll, goToStep, keepPlace } = scroll;

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
    <>
      <TopBar
        backLabel="Figures"
        onBack={onBack}
        title={figure.name}
        titleVisible={scrolled}
        showBackLabel={!scrolled}
        ruleVisible={scrolled}
        styleHint={figure.style}
        action={<PracticeButton onClick={onPractice} />}
      />
      <div ref={listRef} className="fig-scroll" onScroll={onScroll}>
        <header className="fig-header">
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
    </>
  );
}

// Keyed by figure so scroll position and the About band start fresh.
export default function FigureScreen(props: FigureScreenProps) {
  const { figure } = props;
  return <FigureView key={`${figure.dance}-${figure.name}`} {...props} />;
}
