import { useMemo } from 'react';
import type { DanceStyle } from '../../types';
import { useSettings } from '../../state/useSettings';
import { buildBeats, hasTiming } from '../../utils/rhythm';
import { getStepFields } from '../../utils/stepFields';
import StepList from '../figure/StepList';
import { accentFor } from '../ui/accent';
import { EXAMPLE_FIGURES } from './exampleSteps';
import { CheckRow, SettingsSection } from './SettingsRows';
import './StepFieldsPage.css';

// Which details one style's steps show. A real step, drawn exactly as the
// Figure screen draws it, changes as the boxes below it do, so what each
// one is for needs no explaining.
export default function StepFieldsPage({ style }: { style: DanceStyle }) {
  const { role, fields, setStyleFields } = useSettings();
  const figure = EXAMPLE_FIGURES[style];
  const beats = useMemo(() => buildBeats(figure), [figure]);
  const defs = getStepFields(style);
  const picked = fields[style];
  const allOn = defs.every((f) => picked.includes(f.key));

  const setField = (key: string, on: boolean) =>
    setStyleFields(style, on ? [...picked, key] : picked.filter((k) => k !== key));

  return (
    <>
      <SettingsSection title="Preview" description={`Step 1 of the ${figure.dance} ${figure.name}.`}>
        <div className="set-example">
          <StepList
            figure={figure}
            role={role}
            sideBySide={false}
            fields={picked}
            beats={beats}
            timed={hasTiming(figure)}
            current={1}
            accent={accentFor(role, false)}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Details"
        action={
          <button
            type="button"
            className="fv-act set-act"
            onClick={() => setStyleFields(style, allOn ? [] : defs.map((f) => f.key))}
          >
            {allOn ? 'Hide all' : 'Show all'}
          </button>
        }
      >
        {defs.map((f) => (
          <CheckRow
            key={f.key}
            label={f.label}
            description={f.hint}
            checked={picked.includes(f.key)}
            onChange={(on) => setField(f.key, on)}
          />
        ))}
      </SettingsSection>
    </>
  );
}
