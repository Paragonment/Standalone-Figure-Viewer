import type { FigureGroup } from '../../types';
import type { useDanceFilters } from '../../hooks/useDanceFilters';
import { useFigureScroll } from '../../hooks/useFigureScroll';
import { useSettings } from '../../state/useSettings';
import { figureRoute, linkTo } from '../../utils/route';
import FigureBody from '../figure/FigureBody';
import CopyLink from './CopyLink';
import DetailBar from './DetailBar';
import FigureCrumb from './FigureCrumb';

interface DesktopFigureProps {
  figure: FigureGroup;
  filters: ReturnType<typeof useDanceFilters>;
}

// The right pane with a figure open. The host keys it by figure so scroll
// position and the About band start fresh.
export default function DesktopFigure({ figure, filters }: DesktopFigureProps) {
  const scroll = useFigureScroll();
  const { role, sideBySide } = useSettings();

  // The link opens what is on screen: this part, at this step.
  const getUrl = () =>
    linkTo(window.location.href, figureRoute(figure, { part: sideBySide ? 'both' : role, step: scroll.current }));

  return (
    <FigureBody
      figure={figure}
      scroll={scroll}
      layout="adaptive"
      headerSlot={
        <DetailBar actions={<CopyLink getUrl={getUrl} />}>
          <FigureCrumb figure={figure} filters={filters} />
        </DetailBar>
      }
    />
  );
}
