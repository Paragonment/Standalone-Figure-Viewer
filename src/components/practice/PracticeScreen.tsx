import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { DanceStep, FigureGroup, Role } from '../../types';
import { useSettings } from '../../state/useSettings';
import { useStepSwipe } from '../../hooks/useStepSwipe';
import { buildBeats, formatBeats, hasTiming, spokenCount } from '../../utils/rhythm';
import { FEET_KEY, getStepFields } from '../../utils/stepFields';
import { feetText, keepRanges, partValue } from '../../utils/stepValues';
import { accentColor, accentFor } from '../ui/accent';
import { BackIcon, CheckIcon, NextIcon } from '../ui/Icons';
import PartControls from '../ui/PartControls';
import PositionsLine from '../ui/PositionsLine';
import RhythmStrip from '../ui/RhythmStrip';
import TopBar from '../ui/TopBar';
import './PracticeScreen.css';

export interface PracticeScreenProps {
  figure: FigureGroup;
  onBack(): void;
}

type Direction = 'next' | 'prev';

interface Nav {
  figure: FigureGroup;
  index: number;
  // Which way the current step arrived from; drives its slide-in.
  from: Direction | null;
}

interface DetailRow {
  label: string;
  value: string;
}

const ROLE_LABEL: Record<Role, string> = { lead: 'Lead', follow: 'Follow' };

export default function PracticeScreen({ figure, onBack }: PracticeScreenProps) {
  const { role, sideBySide, fields, setRole, setSideBySide } = useSettings();
  const total = figure.steps.length;

  // Practice starts at step 1, and a different figure starts over rather
  // than risk landing past the end of a shorter one.
  const [nav, setNav] = useState<Nav>({ figure, index: 0, from: null });
  let current = nav;
  if (nav.figure !== figure) {
    current = { figure, index: 0, from: null };
    setNav(current);
  }
  const index = Math.min(current.index, Math.max(total - 1, 0));
  const from = current.from;

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= total || next === index) return;
      setNav({ figure, index: next, from: next > index ? 'next' : 'prev' });
    },
    [figure, index, total],
  );

  const mainRef = useRef<HTMLElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);

  const swipe = useStepSwipe({ index, total, onChange: goTo, bodyRef: mainRef, slideRef });

  // A rule above Back and Next shows only while more of the step sits
  // below the visible area.
  const syncFoot = useCallback(() => {
    const el = mainRef.current;
    if (!el) return;
    setMore(el.scrollHeight - el.clientHeight - el.scrollTop > 1);
  }, []);

  // Each new step, or a change between one part and both, starts at the top.
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [index, sideBySide, figure]);

  // Re-check the rule whenever the step's height can change: a new step,
  // other fields or part, the viewport, or web fonts arriving.
  useEffect(() => {
    const main = mainRef.current;
    const slide = slideRef.current;
    if (!main) return;
    const observer = new ResizeObserver(syncFoot);
    observer.observe(main);
    if (slide) observer.observe(slide);
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) syncFoot();
    });
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [index, figure, syncFoot]);

  const beats = useMemo(() => buildBeats(figure), [figure]);
  const timed = useMemo(() => hasTiming(figure), [figure]);

  const step: DanceStep | undefined = figure.steps[index];
  const style = figure.style;
  const enabled = fields[style];
  const feetOn = enabled.includes(FEET_KEY);
  const detailFields = getStepFields(style).filter((f) => f.key !== FEET_KEY && enabled.includes(f.key));

  const detailsFor = (s: DanceStep, r: Role): DetailRow[] =>
    detailFields.flatMap((f) => {
      const value = partValue(s, r, f);
      return value === null ? [] : [{ label: f.label, value }];
    });

  const partner: Role = role === 'lead' ? 'follow' : 'lead';
  const accent = accentColor(accentFor(role, sideBySide));
  const partnerColor = `var(--${partner})`;
  const parts: Role[] = ['lead', 'follow'];

  const atStart = index === 0;
  const atEnd = index === total - 1;
  const stepOf = `Step ${index + 1} of ${total}`;
  const beat = beats[index];

  // A look ahead at the step Next goes to. The last step says where the
  // figure ends instead.
  const next = atEnd ? undefined : figure.steps[index + 1];
  const nextBeat = atEnd ? undefined : beats[index + 1];
  const endText = keepRanges(figure.endingPosition.trim());
  const nextWhen = nextBeat ? (timed ? `on ${nextBeat.count}` : `step ${index + 2}`) : '';
  const aheadLabel = atEnd ? 'Ends in' : 'Then';
  const aheadAria = atEnd
    ? `Ends in ${figure.endingPosition.trim()}`
    : `Then, ${timed ? `on ${spokenCount(nextBeat?.count ?? '')}` : `step ${index + 2}`}`;
  const aheadFeet: string[] = next
    ? feetOn
      ? (sideBySide ? parts : [role]).map((r) => feetText(next, r)).filter(Boolean)
      : []
    : endText
      ? [endText]
      : [];
  const showAhead = next !== undefined || endText !== '';

  const renderSingle = (s: DanceStep) => {
    const feet = feetOn ? feetText(s, role) : '';
    const partnerFeet = feetOn ? feetText(s, partner) : '';
    const details = detailsFor(s, role);
    return (
      <div className="pr-single">
        {feet && <p className="pr-feet">{feet}</p>}
        {(details.length > 0 || partnerFeet) && (
          <dl className="pr-details">
            {details.map((d) => (
              <Fragment key={d.label}>
                <dt>{d.label}</dt>
                <dd>{d.value}</dd>
              </Fragment>
            ))}
            {partnerFeet && (
              <>
                <dt className="pr-partner-label" style={{ color: partnerColor }}>
                  {ROLE_LABEL[partner]}
                </dt>
                <dd className="pr-partner-feet">{partnerFeet}</dd>
              </>
            )}
          </dl>
        )}
      </div>
    );
  };

  const renderBoth = (s: DanceStep) => (
    <div className="pr-both">
      {parts.map((r) => {
        const feet = feetOn ? feetText(s, r) : '';
        const details = detailsFor(s, r);
        return (
          <div key={r} role="group" aria-label={ROLE_LABEL[r]} className="pr-part">
            <span className="pr-part-label" style={{ color: `var(--${r})` }}>
              {ROLE_LABEL[r]}
            </span>
            {feet && <p className="pr-part-feet">{feet}</p>}
            {details.length > 0 && (
              <dl className="pr-part-details">
                {details.map((d) => (
                  <div key={d.label}>
                    <dt>{d.label}</dt>
                    <dd>{d.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <TopBar
        backLabel="Steps"
        backAriaLabel="Back to steps"
        onBack={onBack}
        title={figure.name}
        styleHint={style}
      />

      <div className="pr-frozen">
        <PositionsLine start={figure.startingPosition.trim()} end={figure.endingPosition.trim()} />
        <RhythmStrip beats={beats} current={index} accent={accentFor(role, sideBySide)} onSelect={goTo} />
        <PartControls role={role} sideBySide={sideBySide} onRole={setRole} onSideBySide={setSideBySide} />
      </div>

      <main
        ref={mainRef}
        className="pr-main"
        aria-label={stepOf}
        onScroll={syncFoot}
        onTouchStart={swipe.onTouchStart}
        onTouchMove={swipe.onTouchMove}
        onTouchEnd={swipe.onTouchEnd}
        onTouchCancel={swipe.onTouchCancel}
      >
        {/* Keyed by step so each new step mounts fresh and plays its
            slide-in from the side it came from. */}
        {step && (
          <div
            key={index}
            ref={slideRef}
            className={`pr-slide${from ? ` pr-enter-${from}` : ''}`}
            style={{ '--pr-accent': accent } as CSSProperties}
          >
            <p className="pr-count">
              <span className="pr-when">
                <span className="pr-on">{timed ? 'on' : 'Step'}</span>
                <span className="pr-numeral fv-display">{timed ? beat.count : index + 1}</span>
              </span>
              {timed && <span className="pr-meta">{formatBeats(beat.value)}</span>}
              <span className="pr-meta pr-of">{stepOf}</span>
            </p>

            {sideBySide ? renderBoth(step) : renderSingle(step)}

            {showAhead && (
              <section aria-label={aheadAria} className="pr-ahead">
                <div className="pr-ahead-inner">
                  <span className="pr-ahead-label">
                    {aheadLabel} {nextWhen && <b>{nextWhen}</b>}
                  </span>
                  {aheadFeet.length > 0 && (
                    <div className={`pr-ahead-feet${aheadFeet.length > 1 ? ' pr-ahead-both' : ''}`}>
                      {aheadFeet.map((text, i) => (
                        <span key={i}>{text}</span>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Outside the keyed slide so it persists and screen readers hear
          each step change, however it was triggered. */}
      <span className="fv-sr-only" aria-live="polite">
        {stepOf}
      </span>

      <div className={`pr-foot${more ? ' pr-foot-rule' : ''}`}>
        <div className="pr-foot-row">
          <button type="button" className="pr-btn pr-btn-back" disabled={atStart} onClick={() => goTo(index - 1)}>
            <BackIcon size={20} />
            Back
          </button>
          {/* One button for Next and Done so keyboard focus stays put when
              the last step swaps its label. */}
          <button
            type="button"
            className={`pr-btn pr-btn-next${atEnd ? ' pr-btn-done' : ''}`}
            onClick={atEnd ? onBack : () => goTo(index + 1)}
          >
            {atEnd ? (
              <>
                <CheckIcon size={20} strokeWidth={2.4} />
                Done
              </>
            ) : (
              <>
                Next
                <NextIcon />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
