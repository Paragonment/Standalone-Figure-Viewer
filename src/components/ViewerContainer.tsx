import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { FigureGroup } from '../types';
import { useDanceData } from '../hooks/useDanceData';
import { useFigureGroups } from '../hooks/useFigureGroups';
import { useDanceFilters } from '../hooks/useDanceFilters';
import { useIsMobile } from '../hooks/useIsMobile';
import DesktopViewer from './desktop/DesktopViewer';
import HomeScreen from './home/HomeScreen';
import FigureScreen from './figure/FigureScreen';
import PracticeScreen from './practice/PracticeScreen';
import './ViewerContainer.css';

// The mobile app has three screens, driven by history.state so the phone's
// back gesture steps Practice -> Figure -> Home and a reload lands on the
// same screen. The settings sheet is an overlay, not a history entry.
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
  // Filter and search state lives here so it outlives the screens.
  const filters = useDanceFilters(figureGroups);
  const isMobile = useIsMobile();

  const [route, setRoute] = useState<RouteState | null>(readRoute);

  // The list's scroll offset survives a round trip through a figure, so
  // going back lands where you left off.
  const listScrollTopRef = useRef(0);

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

  useEffect(() => {
    const handlePopState = () => setRoute(readRoute());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Escape steps back from Figure and Practice.
  useEffect(() => {
    if (!isMobile || screen === 'home') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // An open sheet handles its own Escape; don't also leave the screen.
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
    return <DesktopViewer datasets={datasets} figureGroups={figureGroups} filters={filters} />;
  }

  if (activeFigure && screen === 'practice') {
    return <PracticeScreen figure={activeFigure} onBack={goBack} />;
  }

  if (activeFigure) {
    return <FigureScreen figure={activeFigure} onBack={goBack} onPractice={openPractice} />;
  }

  return (
    <HomeScreen
      figures={figureGroups}
      filters={filters}
      onOpenFigure={openFigure}
      scrollTopRef={listScrollTopRef}
    />
  );
};

export default ViewerContainer;
