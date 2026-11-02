import { useSettings } from '../state/useSettings';
import { useStepScroll } from './useStepScroll';

export type FigureScroll = ReturnType<typeof useFigureScroll>;

// The scroll behavior of an open figure. The host calls this, so it can
// read `scrolled` (e.g. for a compact top bar), and hands the result to
// FigureBody, which attaches it to the scroll container. Part and side by
// side reflow the steps, hence they key the layout.
export function useFigureScroll() {
  const { role, sideBySide } = useSettings();
  return useStepScroll(`${role}-${sideBySide}`);
}
