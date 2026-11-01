import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { DanceStyle } from '../types';
import { DANCE_STYLES } from '../utils/danceStyles';
import { DEFAULT_FIELDS, getStepFields } from '../utils/stepFields';
import { SettingsContext, type Role, type SettingsApi, type ThemePreference } from './settingsContext';

const SETTINGS_KEY = 'fv-settings';
const THEME_KEY = 'theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

interface StoredSettings {
  role: Role;
  sideBySide: boolean;
  fields: Record<DanceStyle, string[]>;
}

const defaultFields = (): Record<DanceStyle, string[]> => ({
  Standard: [...DEFAULT_FIELDS.Standard],
  Latin: [...DEFAULT_FIELDS.Latin],
});

// Keeps only keys the style actually charts, in the style's canonical order.
const canonicalFields = (style: DanceStyle, keys: string[]): string[] =>
  getStepFields(style)
    .map((f) => f.key)
    .filter((key) => keys.includes(key));

const readStored = (): StoredSettings => {
  const stored: StoredSettings = { role: 'lead', sideBySide: false, fields: defaultFields() };
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? 'null');
    if (typeof parsed !== 'object' || parsed === null) return stored;
    const data = parsed as Record<string, unknown>;
    if (data.role === 'lead' || data.role === 'follow') stored.role = data.role;
    if (typeof data.sideBySide === 'boolean') stored.sideBySide = data.sideBySide;
    if (typeof data.fields === 'object' && data.fields !== null) {
      const fields = data.fields as Record<string, unknown>;
      for (const { id } of DANCE_STYLES) {
        const list = fields[id];
        if (Array.isArray(list)) {
          stored.fields[id] = canonicalFields(id, list.filter((k): k is string => typeof k === 'string'));
        }
      }
    }
  } catch {
    // Unreadable or blocked storage: fall back to the defaults.
  }
  return stored;
};

const readTheme = (): ThemePreference => {
  try {
    const value = localStorage.getItem(THEME_KEY);
    if (value === 'light' || value === 'dark' || value === 'system') return value;
  } catch {
    // Blocked storage: follow the system.
  }
  return 'system';
};

const systemPrefersDark = () => window.matchMedia(DARK_QUERY).matches;

// Open settings is a history entry of its own: the screen's state plus the
// style tab it opened on. Back closes it, forward and reload bring it back.
const readSettingsEntry = (): DanceStyle | null => {
  const state = window.history.state as { settings?: unknown } | null;
  const style = DANCE_STYLES.find(({ id }) => id === state?.settings);
  return style ? style.id : null;
};

export default function SettingsProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredSettings>(readStored);
  const [theme, setThemeState] = useState<ThemePreference>(readTheme);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);
  const [settingsOpen, setSettingsOpen] = useState(() => readSettingsEntry() !== null);
  const [settingsStyle, setSettingsStyle] = useState<DanceStyle>(() => readSettingsEntry() ?? 'Latin');
  // Set between asking the browser to go back and it doing so, so a second
  // close in that gap can't also go back past the screen underneath.
  const leavingSettings = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      leavingSettings.current = false;
      const entry = readSettingsEntry();
      setSettingsOpen(entry !== null);
      if (entry) setSettingsStyle(entry);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 'system' follows the OS live.
  useEffect(() => {
    const mql = window.matchMedia(DARK_QUERY);
    const handleChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.theme === resolvedTheme) return;
    // Switch every color at once instead of fading half of them.
    root.classList.add('no-transitions');
    root.dataset.theme = resolvedTheme;
    void window.getComputedStyle(root).opacity; // flush styles synchronously
    const timer = window.setTimeout(() => root.classList.remove('no-transitions'), 20);
    return () => window.clearTimeout(timer);
  }, [resolvedTheme]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Not persisted; still applied for this visit.
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ v: 1, ...stored }));
    } catch {
      // Not persisted; still applied for this visit.
    }
  }, [stored]);

  const setRole = useCallback((role: Role) => setStored((s) => ({ ...s, role, sideBySide: false })), []);
  const setSideBySide = useCallback((on: boolean) => setStored((s) => ({ ...s, sideBySide: on })), []);
  const setTheme = useCallback((next: ThemePreference) => setThemeState(next), []);
  const setStyleFields = useCallback(
    (style: DanceStyle, keys: string[]) =>
      setStored((s) => ({ ...s, fields: { ...s.fields, [style]: canonicalFields(style, keys) } })),
    [],
  );
  const openSettings = useCallback(
    (styleHint?: DanceStyle) => {
      if (readSettingsEntry()) return;
      const style = styleHint ?? settingsStyle;
      window.history.pushState({ ...(window.history.state as object | null), settings: style }, '');
      setSettingsStyle(style);
      setSettingsOpen(true);
    },
    [settingsStyle],
  );
  const closeSettings = useCallback(() => {
    if (leavingSettings.current) return;
    if (readSettingsEntry()) {
      // The popstate listener above closes the page.
      leavingSettings.current = true;
      window.history.back();
    } else {
      setSettingsOpen(false);
    }
  }, []);

  const value = useMemo<SettingsApi>(
    () => ({
      role: stored.role,
      sideBySide: stored.sideBySide,
      theme,
      fields: stored.fields,
      resolvedTheme,
      setRole,
      setSideBySide,
      setTheme,
      setStyleFields,
      isFieldOn: (style, key) => stored.fields[style].includes(key),
      settingsOpen,
      settingsStyle,
      openSettings,
      closeSettings,
    }),
    [stored, theme, resolvedTheme, setRole, setSideBySide, setTheme, setStyleFields, settingsOpen, settingsStyle, openSettings, closeSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
