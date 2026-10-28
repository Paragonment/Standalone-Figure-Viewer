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
  // The style tab the settings sheet opens on.
  settingsStyle: DanceStyle;
  openSettings(styleHint?: DanceStyle): void;
  closeSettings(): void;
}

export const SettingsContext = createContext<SettingsApi | null>(null);
