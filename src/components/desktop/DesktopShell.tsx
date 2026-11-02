import { useRef } from 'react';
import type { FigureGroup } from '../../types';
import type { useDanceFilters } from '../../hooks/useDanceFilters';
import { figureKey } from '../../utils/figureKey';
import HomeScreen from '../home/HomeScreen';
import DesktopFigure from './DesktopFigure';
import FigureIndex from './FigureIndex';
import './DesktopShell.css';

export interface DesktopShellProps {
  figures: FigureGroup[];
  filters: ReturnType<typeof useDanceFilters>;
  // The open figure; null shows the empty state.
  figure: FigureGroup | null;
  onOpenFigure(figure: FigureGroup): void;
  // Said in the empty state, e.g. that a link's figure is not there.
  notice?: string;
}

// The wide layout: the figure list on the left, the open figure on the
// right. The list stays mounted, so its scroll position, filters and
// selection are still there whichever figure is open.
export default function DesktopShell({ figures, filters, figure, onOpenFigure, notice }: DesktopShellProps) {
  const listScrollTopRef = useRef(0);

  return (
    <div className="ds">
      <section className="ds-list" aria-label="Figure list">
        <HomeScreen
          figures={figures}
          filters={filters}
          onOpenFigure={onOpenFigure}
          scrollTopRef={listScrollTopRef}
          showMenu={false}
          selectedKey={figure ? figureKey(figure) : undefined}
        />
      </section>
      <main className="ds-detail">
        {figure ? (
          <DesktopFigure key={figureKey(figure)} figure={figure} filters={filters} />
        ) : (
          <FigureIndex count={figures.length} notice={notice} />
        )}
      </main>
    </div>
  );
}
