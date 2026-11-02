import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { DanceStyle } from '../types';
import { DANCE_STYLES } from '../utils/danceStyles';
import { useIsMobile } from '../hooks/useIsMobile';
import type { PartParam } from '../utils/route';
import { DEFAULT_FIELDS, getStepFields } from '../utils/stepFields';
import { SettingsContext, type Role, type SettingsApi, type ThemePreference } from './settingsContext';

const SETTINGS_KEY = 'fv-settings';
const THEME_KEY = 'theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

interface StoredSettings {
  role: Role;
  sideBySide: boolean;
  // The reader has picked a part or side by side themselves. Until then the
  // layout decides (see the resolved `sideBySide` below).
  partChosen: boolean;
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
  const stored: StoredSettings = { role: 'lead', sideBySide: false, partChosen: false, fields: defaultFields() };
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? 'null');
    if (typeof parsed !== 'object' || parsed === null) return stored;
    const data = parsed as Record<string, unknown>;
    if (data.role === 'lead' || data.role === 'follow') stored.role = data.role;
    if (typeof data.sideBySide === 'boolean') stored.sideBySide = data.sideBySide;
    // Saved before the flag existed: anything but the defaults was a choice.
    stored.partChosen =
      typeof data.partChosen === 'boolean' ? data.partChosen : stored.role !== 'lead' || stored.sideBySide;
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

// Open settings is a history entry of its own, and so is each page opened
// on top of it: the screen's state plus `settings`, saying which figure
// style it was opened from and which page is up. Back steps out one level,
// forward and reload bring it back.
interface SettingsEntry {
  style: DanceStyle | null;
  page: string | null;
}

const readSettingsEntry = (): SettingsEntry | null => {
  const state = window.history.state as { settings?: unknown } | null;
  const entry = state?.settings;
  if (typeof entry !== 'object' || entry === null) return null;
  const { style, page } = entry as Record<string, unknown>;
  return {
    style: DANCE_STYLES.find(({ id }) => id === style)?.id ?? null,
    page: typeof page === 'string' ? page : null,
  };
};

const pushSettingsEntry = (entry: SettingsEntry) =>
  window.history.pushState({ ...(window.history.state as object | null), settings: entry }, '');

export default function SettingsProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredSettings>(readStored);
  const isMobile = useIsMobile();
  const [theme, setThemeState] = useState<ThemePreference>(readTheme);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);
  const [viewPart, setViewPart] = useState<PartParam | null>(null);
  const [entry, setEntry] = useState<SettingsEntry | null>(readSettingsEntry);
  // Set between asking the browser to go back and it doing so, so a second
  // close in that gap can't also go back past the screen underneath.
  const leavingSettings = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      leavingSettings.current = false;
      setEntry(readSettingsEntry());
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

  const setRole = useCallback((role: Role) => {
    setViewPart(null);
    setStored((s) => ({ ...s, role, sideBySide: false, partChosen: true }));
  }, []);
  const setSideBySide = useCallback((on: boolean) => {
    setViewPart(null);
    setStored((s) => ({ ...s, sideBySide: on, partChosen: true }));
  }, []);
  const setTheme = useCallback((next: ThemePreference) => setThemeState(next), []);
  const setStyleFields = useCallback(
    (style: DanceStyle, keys: string[]) =>
      setStored((s) => ({ ...s, fields: { ...s.fields, [style]: canonicalFields(style, keys) } })),
    [],
  );
  const openSettings = useCallback((styleHint?: DanceStyle) => {
    if (readSettingsEntry()) return;
    const next = { style: styleHint ?? null, page: null };
    pushSettingsEntry(next);
    setEntry(next);
  }, []);
  // Goes back `steps` entries; the popstate listener above then closes
  // whatever they had open.
  const goBack = useCallback((steps: number) => {
    if (leavingSettings.current) return;
    leavingSettings.current = true;
    window.history.go(-steps);
  }, []);
  const closeSettings = useCallback(() => {
    const current = readSettingsEntry();
    if (current) goBack(current.page ? 2 : 1);
    else setEntry(null);
  }, [goBack]);
  // One page deep: a page opens from Settings itself, never from another page.
  const openSettingsPage = useCallback((page: string) => {
    const current = readSettingsEntry();
    if (!current || current.page) return;
    const next = { ...current, page };
    pushSettingsEntry(next);
    setEntry(next);
  }, []);
  const closeSettingsPage = useCallback(() => {
    const current = readSettingsEntry();
    if (current?.page) goBack(1);
    else setEntry((e) => (e ? { ...e, page: null } : e));
  }, [goBack]);

  // The one place the default part is decided: until the reader chooses,
  // a wide window shows both parts and a phone the stored Lead. The stored
  // value is never rewritten by the window's size, so crossing the
  // breakpoint can't make the layouts fight over it.
  const savedSideBySide = stored.partChosen ? stored.sideBySide : !isMobile;
  // A link's part wins over the saved one while its view is open.
  const sideBySide = viewPart ? viewPart === 'both' : savedSideBySide;
  const role: Role = viewPart === 'lead' || viewPart === 'follow' ? viewPart : stored.role;

  const value = useMemo<SettingsApi>(
    () => ({
      role,
      sideBySide,
      theme,
      fields: stored.fields,
      resolvedTheme,
      setViewPart,
      setRole,
      setSideBySide,
      setTheme,
      setStyleFields,
      isFieldOn: (style, key) => stored.fields[style].includes(key),
      settingsOpen: entry !== null,
      settingsStyle: entry?.style ?? null,
      settingsPage: entry?.page ?? null,
      openSettings,
      closeSettings,
      openSettingsPage,
      closeSettingsPage,
    }),
    [
      stored,
      role,
      sideBySide,
      theme,
      resolvedTheme,
      setViewPart,
      setRole,
      setSideBySide,
      setTheme,
      setStyleFields,
      entry,
      openSettings,
      closeSettings,
      openSettingsPage,
      closeSettingsPage,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
