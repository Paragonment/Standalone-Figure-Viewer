import { useId, useRef, useState } from 'react';
import BottomSheet from '../BottomSheet';
import CheckBox from '../ui/CheckBox';
import { useSettings } from '../../state/useSettings';
import type { ThemePreference } from '../../state/settingsContext';
import type { DanceStyle } from '../../types';
import { DANCE_STYLES } from '../../utils/danceStyles';
import { getStepFields } from '../../utils/stepFields';
import './SettingsSheet.css';

type RoleChoice = 'lead' | 'follow' | 'both';

const ROLE_CHOICES: { id: RoleChoice; label: string }[] = [
  { id: 'lead', label: 'Lead' },
  { id: 'follow', label: 'Follow' },
  { id: 'both', label: 'Both' },
];

const THEME_CHOICES: { id: ThemePreference; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

// Settings opens as a modal sheet over whichever screen you are on. It is
// not a history entry: Escape, the backdrop or Done closes it.
export default function SettingsSheet() {
  const { settingsOpen, settingsStyle, closeSettings } = useSettings();
  return (
    <BottomSheet open={settingsOpen} onClose={closeSettings} title="Settings">
      {/* Mounted only while open so the tab always starts on the style that opened it. */}
      {settingsOpen && <SettingsBody initialStyle={settingsStyle} />}
    </BottomSheet>
  );
}

function SettingsBody({ initialStyle }: { initialStyle: DanceStyle }) {
  const { role, sideBySide, theme, fields, setRole, setSideBySide, setTheme, setStyleFields } = useSettings();
  const [tab, setTab] = useState<DanceStyle>(initialStyle);
  const tabRefs = useRef<Partial<Record<DanceStyle, HTMLButtonElement | null>>>({});
  const tabId = useId();

  const selectedRole: RoleChoice = sideBySide ? 'both' : role;
  const pickRole = (choice: RoleChoice) => {
    if (choice === 'both') setSideBySide(true);
    else setRole(choice);
  };

  const defs = getStepFields(tab);
  const picked = fields[tab];
  const allOn = defs.every((f) => picked.includes(f.key));
  const noneOn = picked.length === 0;
  const masterState = allOn ? 'on' : noneOn ? 'off' : 'mixed';

  const toggleField = (key: string) =>
    setStyleFields(tab, picked.includes(key) ? picked.filter((k) => k !== key) : [...picked, key]);

  // Arrow keys move between the style tabs, selecting the one they land on.
  const onTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    const count = DANCE_STYLES.length;
    let next: number;
    if (e.key === 'ArrowRight') next = (index + 1) % count;
    else if (e.key === 'ArrowLeft') next = (index - 1 + count) % count;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = count - 1;
    else return;
    e.preventDefault();
    const id = DANCE_STYLES[next].id;
    setTab(id);
    tabRefs.current[id]?.focus();
  };

  return (
    <>
      <fieldset className="set-group">
        <legend className="set-legend">I dance</legend>
        <div className="set-seg">
          {ROLE_CHOICES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={`set-seg-btn set-seg-${id}`}
              aria-pressed={selectedRole === id}
              onClick={() => pickRole(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="set-group set-group-fields">
        <legend className="set-legend">Show on each step</legend>
        <div role="tablist" aria-label="Dance style" className="set-tabs">
          {DANCE_STYLES.map(({ id, label }, i) => {
            const selected = tab === id;
            return (
              <button
                key={id}
                ref={(el) => {
                  tabRefs.current[id] = el;
                }}
                type="button"
                role="tab"
                id={`${tabId}-tab-${id}`}
                aria-selected={selected}
                aria-controls={`${tabId}-panel`}
                tabIndex={selected ? 0 : -1}
                className="set-tab"
                onClick={() => setTab(id)}
                onKeyDown={(e) => onTabKeyDown(e, i)}
              >
                {label} <span className="set-tab-tally">{fields[id].length} of {getStepFields(id).length}</span>
              </button>
            );
          })}
        </div>

        <div role="tabpanel" id={`${tabId}-panel`} aria-labelledby={`${tabId}-tab-${tab}`} className="set-panel">
          <button
            type="button"
            role="checkbox"
            aria-checked={masterState === 'on' ? 'true' : masterState === 'off' ? 'false' : 'mixed'}
            className="set-check set-check-master"
            onClick={() => setStyleFields(tab, allOn ? [] : defs.map((f) => f.key))}
          >
            <CheckBox state={masterState} size={22} />
            <span className="set-check-label">{allOn ? 'Deselect all' : 'Select all'}</span>
          </button>

          <div role="group" aria-label={`${tab} step details`} className="set-fields">
            {defs.map((f) => {
              const on = picked.includes(f.key);
              return (
                <button
                  key={f.key}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  className="set-check"
                  onClick={() => toggleField(f.key)}
                >
                  <CheckBox state={on ? 'on' : 'off'} size={22} />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </fieldset>

      <fieldset className="set-group">
        <legend className="set-legend">Appearance</legend>
        <div className="set-seg">
          {THEME_CHOICES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className="set-seg-btn set-seg-theme"
              aria-pressed={theme === id}
              onClick={() => setTheme(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>
    </>
  );
}
