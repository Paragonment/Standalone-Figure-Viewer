import { useShortcutsDialog } from '../../hooks/useShortcutsDialog';
import { usePracticeEnabled } from '../../hooks/usePracticeEnabled';
import { shortcutSections } from '../../utils/shortcuts';
import SlideOverPage from '../SlideOverPage';
import { SettingsSection } from '../settings/SettingsRows';
import './ShortcutsDialog.css';

// Every shortcut on offer, by group, read from the same table the keys are
// matched against. Opens with `?` or from Settings, over whatever is showing.
export default function ShortcutsDialog() {
  const { open, hide } = useShortcutsDialog();
  const practiceEnabled = usePracticeEnabled();
  const sections = shortcutSections({ hasFigure: true, practiceEnabled });

  return (
    <SlideOverPage open={open} onClose={hide} title="Keyboard shortcuts" intro="Keys work anywhere except while typing.">
      {sections.map(({ group, shortcuts }) => (
        <SettingsSection key={group} title={group}>
          {shortcuts.map(({ id, keys, display, description }) => (
            <div key={id} className="set-row kb-row">
              <span className="kb-text">{description}</span>
              <span className="kb-keys">
                {(display ?? keys).map((key) => (
                  <kbd key={key} className="kb-key">
                    {key}
                  </kbd>
                ))}
              </span>
            </div>
          ))}
        </SettingsSection>
      ))}
    </SlideOverPage>
  );
}
