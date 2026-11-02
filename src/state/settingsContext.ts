import { createContext } from 'react';
import type { DanceStyle, Role } from '../types';

export type { Role };

export type ThemePreference = 'system' | 'light' | 'dark';

export interface Settings {
  role: Role;
  sideBySide: boolean;
  theme: ThemePreference;
  // StepFieldDef.key values per style, in canonical order.
  fields: Record<DanceStyle, string[]>;
}

export interface SettingsApi extends Settings {
  resolvedTheme: 'light' | 'dark';
  // Choosing a part also leaves side by side.
  setRole(role: Role): void;
  setSideBySide(on: boolean): void;
  setTheme(theme: ThemePreference): void;
  setStyleFields(style: DanceStyle, keys: string[]): void;
  isFieldOn(style: DanceStyle, key: string): boolean;
  settingsOpen: boolean;
  // The style of the figure Settings was opened from; null from Home.
  settingsStyle: DanceStyle | null;
  // The page open on top of Settings (see SettingsPage), if any.
  settingsPage: string | null;
  openSettings(styleHint?: DanceStyle): void;
  // Leaves Settings altogether, from any of its pages.
  closeSettings(): void;
  openSettingsPage(id: string): void;
  // Back from a page to Settings itself.
  closeSettingsPage(): void;
}

export const SettingsContext = createContext<SettingsApi | null>(null);
