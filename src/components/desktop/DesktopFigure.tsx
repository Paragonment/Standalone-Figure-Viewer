import type { FigureGroup } from '../../types';
import type { useDanceFilters } from '../../hooks/useDanceFilters';
import { useFigureScroll } from '../../hooks/useFigureScroll';
import FigureBody from '../figure/FigureBody';
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

  return (
    <FigureBody
      figure={figure}
      scroll={scroll}
      layout="adaptive"
      headerSlot={
        <DetailBar>
          <FigureCrumb figure={figure} filters={filters} />
        </DetailBar>
      }
    />
  );
}
