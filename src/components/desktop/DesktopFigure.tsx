import { useEffect, type RefObject } from 'react';
import type { FigureGroup } from '../../types';
import type { useDanceFilters } from '../../hooks/useDanceFilters';
import { useFigureScroll } from '../../hooks/useFigureScroll';
import type { FigureControls } from '../../hooks/useShortcuts';
import { useSettings } from '../../state/useSettings';
import { figureRoute, linkTo } from '../../utils/route';
import FigureBody from '../figure/FigureBody';
import CopyLink from './CopyLink';
import DetailBar from './DetailBar';
import FigureCrumb from './FigureCrumb';

interface DesktopFigureProps {
  figure: FigureGroup;
  filters: ReturnType<typeof useDanceFilters>;
  // Where this figure offers the keyboard its controls, while it is open.
  controlsRef: RefObject<FigureControls | null>;
}

// The right pane with a figure open. The host keys it by figure so scroll
// position and the About band start fresh.
export default function DesktopFigure({ figure, filters, controlsRef }: DesktopFigureProps) {
  const scroll = useFigureScroll();
  const { role, sideBySide } = useSettings();
  const { current, goToStep, keepPlace, titleRef } = scroll;
  const stepCount = figure.steps.length;

  useEffect(() => {
    controlsRef.current = {
      stepCount,
      currentStep: current,
      goToStep,
      keepPlace,
      focusHeading: () => titleRef.current?.focus(),
    };
    return () => {
      controlsRef.current = null;
    };
  }, [controlsRef, stepCount, current, goToStep, keepPlace, titleRef]);

  // The link opens what is on screen: this part, at this step.
  const getUrl = () =>
    linkTo(window.location.href, figureRoute(figure, { part: sideBySide ? 'both' : role, step: scroll.current }));

  return (
    <FigureBody
      figure={figure}
      scroll={scroll}
      layout="adaptive"
      headerSlot={
        <DetailBar actions={<CopyLink getUrl={getUrl} />} title={figure.name} scrolled={scroll.scrolled}>
          <FigureCrumb figure={figure} filters={filters} />
        </DetailBar>
      }
    />
  );
}
