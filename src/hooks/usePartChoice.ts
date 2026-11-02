import { useCallback } from 'react';
import type { Role } from '../types';
import { useSettings } from '../state/useSettings';

// Picking a part or side by side, as the reader's own choice (it is saved).
// Either one reflows the steps, so `keepPlace` is called first to hold the
// reader's place; picking what is already shown does nothing.
export function usePartChoice(keepPlace: () => void) {
  const { role, sideBySide, setRole, setSideBySide } = useSettings();

  const pickRole = useCallback(
    (next: Role) => {
      if (next === role && !sideBySide) return;
      keepPlace();
      setRole(next);
    },
    [role, sideBySide, keepPlace, setRole],
  );

  const pickSideBySide = useCallback(
    (on: boolean) => {
      if (on === sideBySide) return;
      keepPlace();
      setSideBySide(on);
    },
    [sideBySide, keepPlace, setSideBySide],
  );

  return { pickRole, pickSideBySide };
}
