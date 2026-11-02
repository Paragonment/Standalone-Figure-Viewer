import { useSettings } from '../state/useSettings';
import { useIsMobile } from './useIsMobile';

// Whether Practice is on offer. A phone always has it; a wide window only
// once Settings turns it on. The Practice button, the `p` shortcut and the
// shortcut's listing all follow this.
export const usePracticeEnabled = () => {
  const { showPractice } = useSettings();
  return useIsMobile() || showPractice;
};
