import React, { useState, useMemo, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import type { FigureGroup } from '../types';
import { useDanceData } from '../hooks/useDanceData';
import { useFigureGroups } from '../hooks/useFigureGroups';
import { useDanceFilters } from '../hooks/useDanceFilters';
import { useIsMobile } from '../hooks/useIsMobile';
import { clearSwipe, useSwipeBack } from '../hooks/useSwipeBack';
import { TransitionsContext } from '../state/transitionsContext';
import { createTransitionBook } from '../utils/transitions';
import DesktopViewer from './desktop/DesktopViewer';
import HomeScreen from './home/HomeScreen';
import FigureScreen from './figure/FigureScreen';
import PracticeScreen from './practice/PracticeScreen';
import './ViewerContainer.css';

// The mobile app has three screens, driven by history.state so the phone's
// back gesture steps Practice -> Figure -> Home and a reload lands on the
// same screen. Settings adds its own entry on top (see SettingsProvider).
//
// Home stays mounted, hidden, under Figure and Practice, so swiping right
// on a figure slides it away to show the list beneath.
interface RouteState {
  figureKey: string;
  practice?: boolean;
}

const getFigureKey = (figure: FigureGroup) => `${figure.dance}-${figure.name}`;

const readRoute = (): RouteState | null => {
  const state = window.history.state as Partial<RouteState> | null;
  if (!state || typeof state.figureKey !== 'string') return null;
  return { figureKey: state.figureKey, practice: state.practice === true };
};

const ViewerContainer: React.FC = () => {
  const { datasets, loading, error } = useDanceData();
  const figureGroups = useFigureGroups(datasets);
  // Each figure's Precede and Follow text is built on first use and kept.
  const transitions = useMemo(() => createTransitionBook(figureGroups), [figureGroups]);
  // Filter and search state lives here so it outlives the screens.
  const filters = useDanceFilters(figureGroups, transitions);
  const isMobile = useIsMobile();

  const [route, setRoute] = useState<RouteState | null>(readRoute);

  // The list's scroll offset survives a round trip through a figure, so
  // going back lands where you left off.
  const listScrollTopRef = useRef(0);
  const stackRef = useRef<HTMLDivElement>(null);

  const activeFigure = useMemo<FigureGroup | null>(() => {
    if (!route) return null;
    return figureGroups.find((f) => getFigureKey(f) === route.figureKey) ?? null;
  }, [figureGroups, route]);

  const screen: 'home' | 'figure' | 'practice' = !activeFigure ? 'home' : route?.practice ? 'practice' : 'figure';

  const openFigure = useCallback((figure: FigureGroup) => {
    const next: RouteState = { figureKey: getFigureKey(figure) };
    window.history.pushState(next, '');
    setRoute(next);
  }, []);

  const openPractice = useCallback(() => {
    if (!activeFigure) return;
    const next: RouteState = { figureKey: getFigureKey(activeFigure), practice: true };
    window.history.pushState(next, '');
    setRoute(next);
  }, [activeFigure]);

  const goBack = useCallback(() => {
    if (readRoute()) {
      // The popstate listener below updates the route.
      window.history.back();
    } else {
      setRoute(null);
    }
  }, []);

  const swipeBack = useSwipeBack({ ref: stackRef, onBack: goBack, enabled: screen === 'figure' });

  // A swipe back leaves the figure parked off screen until the route
  // changes; the new screen starts at rest.
  useLayoutEffect(() => {
    if (stackRef.current) clearSwipe(stackRef.current);
  }, [screen]);

  useEffect(() => {
    const handlePopState = () => setRoute(readRoute());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Escape steps back from Figure and Practice.
  useEffect(() => {
    if (!isMobile || screen === 'home') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open settings handles its own Escape; don't also leave the screen.
      if (e.key === 'Escape' && !document.querySelector('dialog[open]')) goBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, screen, goBack]);

  if (loading) {
    return (
      <div className="vc-status" role="status">
        <p className="vc-status-text">Loading figures</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vc-status" role="alert">
        <p className="vc-status-title">Could not load the figures</p>
        <p className="vc-status-text">{error}</p>
        <button type="button" className="fv-act vc-status-action" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  if (!isMobile) {
    return (
      <TransitionsContext.Provider value={transitions}>
        <DesktopViewer datasets={datasets} figureGroups={figureGroups} filters={filters} />
      </TransitionsContext.Provider>
    );
  }

  const covered = activeFigure !== null;

  return (
    <TransitionsContext.Provider value={transitions}>
      <div ref={stackRef} className="vc-stack">
        <div className={covered ? 'vc-layer vc-under vc-covered' : 'vc-layer vc-under'} inert={covered}>
          <HomeScreen
            figures={figureGroups}
            filters={filters}
            onOpenFigure={openFigure}
            scrollTopRef={listScrollTopRef}
          />
        </div>
        {activeFigure && (
          <div className="vc-layer vc-top" {...swipeBack.handlers}>
            {screen === 'practice' ? (
              <PracticeScreen figure={activeFigure} onBack={goBack} />
            ) : (
              <FigureScreen figure={activeFigure} onBack={goBack} onPractice={openPractice} />
            )}
          </div>
        )}
      </div>
    </TransitionsContext.Provider>
  );
};

export default ViewerContainer;
