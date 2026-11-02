import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useDanceData } from '../hooks/useDanceData';
import { useFigureGroups } from '../hooks/useFigureGroups';
import { useDanceFilters } from '../hooks/useDanceFilters';
import { useFigureRoute } from '../hooks/useFigureRoute';
import { useIsMobile } from '../hooks/useIsMobile';
import { clearSwipe, useSwipeBack } from '../hooks/useSwipeBack';
import DesktopViewer from './desktop/DesktopViewer';
import HomeScreen from './home/HomeScreen';
import FigureScreen from './figure/FigureScreen';
import PracticeScreen from './practice/PracticeScreen';
import './ViewerContainer.css';

// The mobile app has three screens (see useFigureRoute): the phone's back
// gesture steps Practice -> Figure -> Home.
//
// Home stays mounted, hidden, under Figure and Practice, so swiping right
// on a figure slides it away to show the list beneath.
const ViewerContainer: React.FC = () => {
  const { datasets, loading, error } = useDanceData();
  const figureGroups = useFigureGroups(datasets);
  // Filter and search state lives here so it outlives the screens.
  const filters = useDanceFilters(figureGroups);
  const isMobile = useIsMobile();

  const { figure: activeFigure, screen, openFigure, openPractice, goBack } = useFigureRoute(figureGroups);

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
    return <DesktopViewer datasets={datasets} figureGroups={figureGroups} filters={filters} />;
  }

  const covered = activeFigure !== null;

  return (
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
  );
};

export default ViewerContainer;
