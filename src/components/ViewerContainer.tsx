import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { FigureGroup } from '../types';
import { useDanceData } from '../hooks/useDanceData';
import { useFigureGroups } from '../hooks/useFigureGroups';
import { useDanceFilters } from '../hooks/useDanceFilters';
import { useFigureSections } from '../hooks/useFigureSections';
import { useRoute } from '../hooks/useRoute';
import { useRouteFilters } from '../hooks/useRouteFilters';
import { useRoutePart } from '../hooks/useRoutePart';
import { useIsMobile } from '../hooks/useIsMobile';
import { clearSwipe, useSwipeBack } from '../hooks/useSwipeBack';
import { figureRoute, resolveRoute } from '../utils/route';
import DesktopShell from './desktop/DesktopShell';
import HomeScreen from './home/HomeScreen';
import FigureScreen from './figure/FigureScreen';
import PracticeScreen from './practice/PracticeScreen';
import './ViewerContainer.css';

const APP_NAME = 'Figure Viewer';

// The mobile app has three screens (see useRoute): the phone's back
// gesture steps Practice -> Figure -> Home.
//
// Home stays mounted, hidden, under Figure and Practice, so swiping right
// on a figure slides it away to show the list beneath.
const ViewerContainer: React.FC = () => {
  const { datasets, loading, error } = useDanceData();
  const figureGroups = useFigureGroups(datasets);
  // Filter and search state lives here so it outlives the screens.
  const filters = useDanceFilters(figureGroups);
  const built = useFigureSections(figureGroups, filters);
  const isMobile = useIsMobile();

  const { route, open, openPractice, goBack: goBackTo } = useRoute();
  const { figure: activeFigure, screen, missing } = useMemo(() => resolveRoute(figureGroups, route), [figureGroups, route]);
  const home = useRouteFilters(filters);
  useRoutePart();

  // What a link asked for that is not there, said quietly where the list is.
  const notice = missing === null ? undefined : `No figure called “${missing}”`;

  const openFigure = useCallback((target: FigureGroup) => open(figureRoute(target)), [open]);
  const goBack = useCallback(() => goBackTo(home), [goBackTo, home]);

  // The tab says where you are, so a bookmark or a history entry reads well.
  useEffect(() => {
    document.title = activeFigure ? `${activeFigure.name}, ${activeFigure.dance} - ${APP_NAME}` : APP_NAME;
  }, [activeFigure]);

  // The list's scroll offset survives a round trip through a figure, so
  // going back lands where you left off.
  const listScrollTopRef = useRef(0);
  const stackRef = useRef<HTMLDivElement>(null);

  const swipeBack = useSwipeBack({ ref: stackRef, onBack: goBack, enabled: screen === 'figure' });

  // A swipe back leaves the figure parked off screen until the route
  // changes; the new screen starts at rest.
  useLayoutEffect(() => {
    if (stackRef.current) clearSwipe(stackRef.current);
  }, [screen]);

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
    return <DesktopShell figures={figureGroups} built={built} filters={filters} figure={activeFigure} onOpenFigure={openFigure} notice={notice} />;
  }

  const covered = activeFigure !== null;

  return (
    <div ref={stackRef} className="vc-stack">
      <div className={covered ? 'vc-layer vc-under vc-covered' : 'vc-layer vc-under'} inert={covered}>
        <HomeScreen
          figures={figureGroups}
          built={built}
          filters={filters}
          onOpenFigure={openFigure}
          scrollTopRef={listScrollTopRef}
          notice={notice}
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
  );
};

export default ViewerContainer;
