import { useContext } from 'react';
import { SettingsContext, type SettingsApi } from './settingsContext';

export function useSettings(): SettingsApi {
  const settings = useContext(SettingsContext);
  if (!settings) throw new Error('useSettings must be used inside a SettingsProvider');
  return settings;
}
