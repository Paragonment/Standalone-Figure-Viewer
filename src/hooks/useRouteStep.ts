import { useEffect, useLayoutEffect, useRef } from 'react';
import type { FigureScroll } from './useFigureScroll';
import { useRoute } from './useRoute';

// Keeps the step the reader is at in the address of the open figure. The host
// keys it by figure, so a mount is an arrival: it brings the step the
// address names into view, then follows the reader from there once the scroll settles.
export function useRouteStep({ current, revealStep }: FigureScroll) {
  const { route, replaceFigure } = useRoute();
  const arrivalStep = useRef(route.screen === 'figure' ? route.step : undefined);

  useLayoutEffect(() => {
    const n = arrivalStep.current;
    if (!n) return;
    revealStep(n);
    // Fonts arriving change the rows' heights; the step is brought back into view.
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) revealStep(n);
    });
    return () => {
      cancelled = true;
    };
  }, [revealStep]);

  const shown = useRef(current);
  useEffect(() => {
    if (shown.current === current) return;
    shown.current = current;
    if (route.screen === 'figure' && (route.step ?? 1) !== current) replaceFigure({ step: current });
  }, [current, route, replaceFigure]);
}
