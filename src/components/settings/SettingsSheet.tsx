import { useSettings } from '../../state/useSettings';

// STUB (Phase 0): WS-D replaces this with the real Settings sheet.
export default function SettingsSheet() {
  const { settingsOpen, closeSettings } = useSettings();
  if (!settingsOpen) return null;
  return (
    <div role="dialog" aria-label="Settings" style={{ position: 'fixed', inset: 'auto 0 0 0', padding: 16, background: 'var(--floor)' }}>
      <h2 className="fv-display">SettingsSheet</h2>
      <button type="button" onClick={closeSettings}>
        Done
      </button>
    </div>
  );
}
