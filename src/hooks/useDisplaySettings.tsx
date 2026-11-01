import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface DisplaySettings {
  spellOutAbbreviations: boolean;
  setSpellOutAbbreviations: (on: boolean) => void;
}

const STORAGE_KEY = 'spellOutAbbreviations';

const readStored = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

const DisplaySettingsContext = createContext<DisplaySettings | null>(null);

// Display preferences that apply across views (as opposed to which step
// fields show, which lives with the column state). Provided once near the
// root so any component can read them without prop threading.
export const DisplaySettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [spellOutAbbreviations, setState] = useState(readStored);

  const setSpellOutAbbreviations = useCallback((on: boolean) => {
    setState(on);
    try {
      localStorage.setItem(STORAGE_KEY, String(on));
    } catch {
      // Private mode etc: the setting still works for this visit.
    }
  }, []);

  const value = useMemo(
    () => ({ spellOutAbbreviations, setSpellOutAbbreviations }),
    [spellOutAbbreviations, setSpellOutAbbreviations],
  );

  return <DisplaySettingsContext.Provider value={value}>{children}</DisplaySettingsContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDisplaySettings = (): DisplaySettings => {
  const ctx = useContext(DisplaySettingsContext);
  if (!ctx) throw new Error('useDisplaySettings must be used inside DisplaySettingsProvider');
  return ctx;
};
