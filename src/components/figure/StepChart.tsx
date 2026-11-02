import type { CSSProperties } from 'react';
import type { DanceStep, FigureGroup, Role } from '../../types';
import type { Beat } from '../../utils/rhythm';
import type { StepFieldDef } from '../../utils/stepFields';
import { useDisplaySettings } from '../../hooks/useDisplaySettings';
import { feetText } from '../../utils/stepValues';
import { partCells, stepColumns } from '../../utils/stepView';
import { accentColor, type Accent } from '../ui/accent';
import './StepChart.css';

export interface StepChartProps {
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

interface CellsProps {
  step: DanceStep;
  role: Role;
  feetOn: boolean;
  defs: StepFieldDef[];
  spell: boolean;
  // Put the partner's feet under the reader's own.
  showPartner: boolean;
}

// The feet and field cells of one part's row.
function PartCells({ step, role, feetOn, defs, spell, showPartner }: CellsProps) {
  const partner: Role = role === 'lead' ? 'follow' : 'lead';
  const partnerFeet = showPartner && feetOn ? feetText(step, partner, spell) : '';
  return (
    <>
      {feetOn && (
        <td className="sc-feet">
          {feetText(step, role, spell)}
          {partnerFeet && (
            <span className={`sc-partner sc-partner-${partner}`}>
              <span className="fv-sr-only">{ROLE_LABEL[partner]}: </span>
              {partnerFeet}
            </span>
          )}
        </td>
      )}
      {partCells(step, role, defs, spell).map((value, i) => (
        <td key={defs[i].key}>{value}</td>
      ))}
    </>
  );
}

// The steps of a figure as a table for a wide pane: a column per step field
// the reader turned on, one row per step for one part (the partner's feet
// underneath), or a Lead and a Follow row per step for both. An empty value
// leaves its cell blank.
export default function StepChart({ figure, role, sideBySide, fields, beats, timed, current, accent }: StepChartProps) {
  const { spellOutAbbreviations: spell } = useDisplaySettings();
  const { feetOn, defs } = stepColumns(figure.style, fields);
  const span = sideBySide ? 2 : 1;

  return (
    <div className="sc" style={{ '--accent': accentColor(accent) } as CSSProperties}>
      <table aria-label="Steps" className="sc-table">
        <thead>
          <tr>
            <th scope="col" className="sc-n">
              #
            </th>
            {timed && (
              <th scope="col" className="sc-count">
                Count
              </th>
            )}
            {sideBySide && (
              <th scope="col" className="sc-part">
                Part
              </th>
            )}
            {feetOn && (
              <th scope="col" className="sc-feet">
                Feet
              </th>
            )}
            {defs.map((def) => (
              <th key={def.key} scope="col">
                {def.label}
              </th>
            ))}
          </tr>
        </thead>
        {figure.steps.map((step, i) => {
          const n = i + 1;
          const cls = `sc-step${sideBySide ? ' sc-step-both' : ''}${n === current ? ' sc-step-current' : ''}`;
          const numbers = (
            <>
              <th scope="row" rowSpan={span} className="sc-n">
                {n}
              </th>
              {timed && (
                <td rowSpan={span} className="sc-count">
                  {beats[i].count}
                </td>
              )}
            </>
          );

          if (!sideBySide) {
            return (
              <tbody key={n} data-n={n} className={cls}>
                <tr>
                  {numbers}
                  <PartCells step={step} role={role} feetOn={feetOn} defs={defs} spell={spell} showPartner />
                </tr>
              </tbody>
            );
          }

          return (
            <tbody key={n} data-n={n} className={cls}>
              {ROLES.map((r, k) => (
                <tr key={r} className={`sc-row-${r}`}>
                  {k === 0 && numbers}
                  <td className="sc-part">
                    <span className="sc-dot" aria-hidden="true" />
                    {ROLE_LABEL[r]}
                  </td>
                  <PartCells step={step} role={r} feetOn={feetOn} defs={defs} spell={spell} showPartner={false} />
                </tr>
              ))}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}
