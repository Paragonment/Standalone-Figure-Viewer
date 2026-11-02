import { useMemo, useRef, useState } from 'react';
import type { FigureGroup } from '../../types';
import type { useDanceFilters } from '../../hooks/useDanceFilters';
import { useShortcuts, type FigureControls } from '../../hooks/useShortcuts';
import { figureKey } from '../../utils/figureKey';
import type { BuiltSections } from '../../utils/search';
import HomeScreen from '../home/HomeScreen';
import DesktopFigure from './DesktopFigure';
import FigureIndex from './FigureIndex';
import './DesktopShell.css';

export interface DesktopShellProps {
  figures: FigureGroup[];
  // What the list shows (see useFigureSections), in the order it shows it.
  built: BuiltSections;
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
export default function DesktopShell({ figures, built, filters, figure, onOpenFigure, notice }: DesktopShellProps) {
  const listScrollTopRef = useRef(0);
  const listRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const figureControlsRef = useRef<FigureControls | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // The figures as the list shows them, for the keys that step through it.
  const shown = useMemo(() => built.sections.flatMap((section) => section.rows.map((row) => row.figure)), [built]);

  useShortcuts({
    figures: shown,
    figure,
    searchRef,
    listRef,
    figureControlsRef,
    setSearchTerm: filters.setSearchTerm,
    announce: setAnnouncement,
  });

  return (
    <div className="ds">
      <section ref={listRef} className="ds-list" aria-label="Figure list">
        <HomeScreen
          figures={figures}
          built={built}
          filters={filters}
          onOpenFigure={onOpenFigure}
          scrollTopRef={listScrollTopRef}
          showMenu={false}
          pinHeader
          selectedKey={figure ? figureKey(figure) : undefined}
          searchRef={searchRef}
        />
      </section>
      <main className="ds-detail">
        {figure ? (
          <DesktopFigure key={figureKey(figure)} figure={figure} filters={filters} controlsRef={figureControlsRef} />
        ) : (
          <FigureIndex count={figures.length} notice={notice} />
        )}
      </main>
      <div className="fv-sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </div>
  );
}
