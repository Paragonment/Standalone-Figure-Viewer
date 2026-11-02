import { useEffect, useLayoutEffect, useRef } from 'react';
import type { FigureScroll } from './useFigureScroll';
import { useRoute } from './useRoute';

// Keeps the step the reader is at in the address of the open figure. The host
// keys it by figure, so a mount is an arrival: it goes to the step the
// address names, then follows the reader from there once the scroll settles.
export function useRouteStep({ current, goToStep }: FigureScroll) {
  const { route, replaceFigure } = useRoute();
  const arrivalStep = useRef(route.screen === 'figure' ? route.step : undefined);

  useLayoutEffect(() => {
    if (arrivalStep.current) goToStep(arrivalStep.current, true);
  }, [goToStep]);

  const shown = useRef(current);
  useEffect(() => {
    if (shown.current === current) return;
    shown.current = current;
    if (route.screen === 'figure' && (route.step ?? 1) !== current) replaceFigure({ step: current });
  }, [current, route, replaceFigure]);
}
