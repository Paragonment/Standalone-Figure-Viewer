import { useEffect, useRef } from 'react';
import { useSettings } from '../state/useSettings';
import type { PartParam } from '../utils/route';
import { useRoute } from './useRoute';

// Keeps the part in the address and the part on screen the same, both ways.
//
// - A part in the address shows while that figure is open and leaves the
//   saved part alone; a figure without one shows the saved part.
// - When the reader picks a part, the address follows it.
export function useRoutePart() {
  const { route, replaceFigure } = useRoute();
  const { role, sideBySide, setViewPart } = useSettings();
  const part: PartParam = sideBySide ? 'both' : role;

  const open = route.screen !== 'home';
  const figureId = open ? `${route.dance}/${route.figure}` : '';
  const routePart = open ? route.part : undefined;

  useEffect(() => {
    setViewPart(routePart ?? null);
  }, [figureId, routePart, setViewPart]);

  // Only a change of the part on screen is written, never what a new route
  // brings along: that is the address speaking, not the reader.
  const shown = useRef(part);
  useEffect(() => {
    if (shown.current === part) return;
    shown.current = part;
    if (open && routePart !== part) replaceFigure({ part }, 0);
  }, [part, open, routePart, replaceFigure]);
}
