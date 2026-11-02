import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FigureGroup } from '../types';
import { figureKey } from '../utils/figureKey';

// Which figure is open, and whether Practice is up on top of it. It lives in
// history.state so the browser's back gesture steps Practice -> Figure ->
// Home and a reload lands on the same screen. Settings adds its own entry on
// top (see SettingsProvider). This hook is the one place that knows how the
// route is stored.
interface RouteState {
  figureKey: string;
  practice?: boolean;
}

export type Screen = 'home' | 'figure' | 'practice';

const readRoute = (): RouteState | null => {
  const state = window.history.state as Partial<RouteState> | null;
  if (!state || typeof state.figureKey !== 'string') return null;
  return { figureKey: state.figureKey, practice: state.practice === true };
};

export function useFigureRoute(figures: FigureGroup[]) {
  const [route, setRoute] = useState<RouteState | null>(readRoute);

  const figure = useMemo<FigureGroup | null>(() => {
    if (!route) return null;
    return figures.find((f) => figureKey(f) === route.figureKey) ?? null;
  }, [figures, route]);

  const screen: Screen = !figure ? 'home' : route?.practice ? 'practice' : 'figure';

  const push = useCallback((next: RouteState) => {
    window.history.pushState(next, '');
    setRoute(next);
  }, []);

  const openFigure = useCallback((target: FigureGroup) => push({ figureKey: figureKey(target) }), [push]);

  const openPractice = useCallback(() => {
    if (figure) push({ figureKey: figureKey(figure), practice: true });
  }, [figure, push]);

  const goBack = useCallback(() => {
    if (readRoute()) {
      // The popstate listener below updates the route.
      window.history.back();
    } else {
      setRoute(null);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => setRoute(readRoute());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return { figure, screen, openFigure, openPractice, goBack };
}
