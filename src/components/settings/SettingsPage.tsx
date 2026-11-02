import { useState, type ReactNode } from 'react';
import SlideOverPage from '../SlideOverPage';
import { useSettings } from '../../state/useSettings';
import { useDisplaySettings } from '../../hooks/useDisplaySettings';
import type { ThemePreference } from '../../state/settingsContext';
import type { DanceStyle } from '../../types';
import { DANCE_STYLES } from '../../utils/danceStyles';
import { getStepFields } from '../../utils/stepFields';
import { ChoiceRow, NavRow, SettingsSection, SwitchRow, type Choice } from './SettingsRows';
import StepFieldsPage from './StepFieldsPage';

const THEME_CHOICES: Choice<ThemePreference>[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

// A page that opens on top of Settings from one of its rows, for settings
// with more choices than fit in a row. Keyed by an id kept in the history
// entry (see SettingsProvider), so Back and reload know which one is up.
interface SubPage {
  title: string;
  intro?: ReactNode;
  content: ReactNode;
}

const stepsPageId = (style: DanceStyle) => `steps-${style}`;

const SUB_PAGES: Record<string, SubPage> = Object.fromEntries(
  DANCE_STYLES.map(({ id, label }): [string, SubPage] => [
    stepsPageId(id),
    {
      title: `${label} steps`,
      intro: `Choose what each step of a ${label} figure shows.`,
      content: <StepFieldsPage style={id} />,
    },
  ]),
);

// Settings slides in from the right over whichever screen you are on, and
// its pages slide in over it in turn. Each is a history entry, so the
// phone's back gesture steps back one level, as do Back, a swipe right and
// Escape.
export default function SettingsPage() {
  const { settingsOpen, settingsStyle, settingsPage, closeSettings, closeSettingsPage } = useSettings();
  const page = settingsPage !== null ? SUB_PAGES[settingsPage] : undefined;

  // What was last open stays on screen while it slides out.
  const [shown, setShown] = useState({ style: settingsStyle, page });
  if (settingsOpen && settingsStyle !== shown.style) setShown({ ...shown, style: settingsStyle });
  if (page && page !== shown.page) setShown({ ...shown, page });

  return (
    <>
      <SlideOverPage open={settingsOpen} onClose={closeSettings} title="Settings">
        <SettingsHome figureStyle={shown.style} />
      </SlideOverPage>
      {/* After Settings, so on a reload with both open it opens on top. */}
      <SlideOverPage
        open={settingsOpen && page !== undefined}
        onClose={closeSettingsPage}
        title={shown.page?.title ?? ''}
        intro={shown.page?.intro}
        backLabel="Settings"
      >
        {shown.page?.content}
      </SlideOverPage>
    </>
  );
}

// figureStyle: the style of the figure Settings was opened from, if any.
function SettingsHome({ figureStyle }: { figureStyle: DanceStyle | null }) {
  const { theme, fields, setTheme, openSettingsPage } = useSettings();
  const { spellOutAbbreviations, setSpellOutAbbreviations } = useDisplaySettings();

  return (
    <>
      <SettingsSection title="Steps" description="Choose what each step of a figure shows, separately for Standard and Latin.">
        {DANCE_STYLES.map(({ id, label }) => {
          const defs = getStepFields(id);
          // No-break spaces: a wrapped list breaks between names, not inside one.
          const shownLabels = defs.filter((f) => fields[id].includes(f.key)).map((f) => f.label.replace(/ /g, '\u00a0'));
          const summary =
            shownLabels.length === defs.length
              ? 'All details'
              : shownLabels.length > 0
                ? shownLabels.join(', ')
                : 'Step numbers only';
          return (
            <NavRow
              key={id}
              label={label}
              badge={id === figureStyle ? 'This figure' : undefined}
              summary={summary}
              value={`${shownLabels.length} of ${defs.length}`}
              onOpen={() => openSettingsPage(stepsPageId(id))}
            />
          );
        })}
        <SwitchRow
          label="Spell out abbreviations"
          description={<>Show &lsquo;forward&rsquo; instead of &lsquo;fwd&rsquo;</>}
          checked={spellOutAbbreviations}
          onChange={setSpellOutAbbreviations}
        />
      </SettingsSection>

      <SettingsSection title="Appearance">
        <ChoiceRow
          label="Theme"
          description="System matches your phone's light or dark setting."
          value={theme}
          choices={THEME_CHOICES}
          onChange={setTheme}
        />
      </SettingsSection>
    </>
  );
}
