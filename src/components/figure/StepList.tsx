import type { CSSProperties } from 'react';
import type { DanceStep, FigureGroup, Role } from '../../types';
import type { Beat } from '../../utils/rhythm';
import { FEET_KEY, getStepFields, type StepFieldDef } from '../../utils/stepFields';
import { useDisplaySettings } from '../../hooks/useDisplaySettings';
import { feetText, partValue } from '../../utils/stepValues';
import { accentColor, type Accent } from '../ui/accent';
import './StepList.css';

interface StepListProps {
  figure: FigureGroup;
  role: Role;
  sideBySide: boolean;
  // Enabled StepFieldDef.key values for this figure's style.
  fields: string[];
  beats: Beat[];
  // Whether the figure charts a count for each step (Latin).
  timed: boolean;
  // 1-based number of the current step.
  current: number;
  accent: Accent;
}

const ROLE_LABEL: Record<Role, string> = { lead: 'Lead', follow: 'Follow' };
const ROLES: Role[] = ['lead', 'follow'];

interface Detail {
  label: string;
  value: string;
}

// The enabled detail rows of one part's step; empty values are left out.
const detailsFor = (step: DanceStep, role: Role, defs: StepFieldDef[], spell: boolean): Detail[] =>
  defs.flatMap((def) => {
    const value = partValue(step, role, def, spell);
    return value === null ? [] : [{ label: def.label, value }];
  });

interface NumberProps {
  n: number;
  count: string | null;
}

function StepNumber({ n, count }: NumberProps) {
  return (
    <div className="fig-num">
      <span className="fig-n">{n}</span>
      {count !== null && <span className="fig-count">on {count}</span>}
    </div>
  );
}

// The steps of a figure: one part with the partner's feet underneath, or
// both parts side by side. Only fields the reader turned on are shown, and
// a field with nothing to say is skipped, not dashed.
export default function StepList({ figure, role, sideBySide, fields, beats, timed, current, accent }: StepListProps) {
  const { spellOutAbbreviations: spell } = useDisplaySettings();
  const feetOn = fields.includes(FEET_KEY);
  const defs = getStepFields(figure.style).filter((def) => def.key !== FEET_KEY && fields.includes(def.key));
  const partner: Role = role === 'lead' ? 'follow' : 'lead';
  // "Rise and fall" does not fit the 66px label column on one line.
  const wideLabels = defs.some((def) => def.label.length > 10);

  return (
    <section
      aria-label="Steps"
      className="fig-steps"
      style={{ '--accent': accentColor(accent), '--fig-label-w': wideLabels ? '82px' : '66px' } as CSSProperties}
    >
      <ol className="fig-list">
        {figure.steps.map((step, i) => {
          const n = i + 1;
          const count = timed ? beats[i].count : null;

          if (sideBySide) {
            return (
              <li key={n} data-n={n} className="fig-step fig-step-both">
                <StepNumber n={n} count={count} />
                {ROLES.map((r) => {
                  const feet = feetOn ? feetText(step, r, spell) : '';
                  const details = detailsFor(step, r, defs, spell);
                  return (
                    <div key={r} role="group" aria-label={ROLE_LABEL[r]} className="fig-part">
                      {feet && <span className="fig-feet">{feet}</span>}
                      {details.length > 0 && (
                        <span className="fig-inline">
                          {details.map((d) => (
                            <span key={d.label} className="fig-inline-item">
                              <span className="fig-label">{d.label}</span> {d.value}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                  );
                })}
              </li>
            );
          }

          const feet = feetOn ? feetText(step, role, spell) : '';
          const partnerFeet = feetOn ? feetText(step, partner, spell) : '';
          const details = detailsFor(step, role, defs, spell);
          return (
            <li key={n} data-n={n} className={`fig-step${n === current ? ' fig-step-current' : ''}`}>
              <StepNumber n={n} count={count} />
              <div className="fig-body">
                {feet && <span className="fig-feet">{feet}</span>}
                {(details.length > 0 || partnerFeet) && (
                  <dl className="fig-details">
                    {details.map((d) => (
                      <div key={d.label} className="fig-detail">
                        <dt>{d.label}</dt>
                        <dd>{d.value}</dd>
                      </div>
                    ))}
                    {partnerFeet && (
                      <div className="fig-detail fig-partner">
                        <dt className={`fig-partner-${partner}`}>{ROLE_LABEL[partner]}</dt>
                        <dd>{partnerFeet}</dd>
                      </div>
                    )}
                  </dl>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
