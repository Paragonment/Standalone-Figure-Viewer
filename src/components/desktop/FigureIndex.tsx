import { useMemo } from 'react';
import type { FigureGroup } from '../../types';
import type { useDanceFilters } from '../../hooks/useDanceFilters';
import { buildIndex } from '../../utils/figureIndex';
import DetailBar from './DetailBar';
import IndexTable from './IndexTable';
import './FigureIndex.css';

interface FigureIndexProps {
  figures: FigureGroup[];
  filters: ReturnType<typeof useDanceFilters>;
  onOpenFigure(figure: FigureGroup): void;
  // Said under the title, e.g. that a link's figure is not there.
  notice?: string;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

// The right pane with nothing open: a contents page of the figures in the
// picked dances and levels (all, when none), a table for each style. Every
// name opens its figure; every dance and level heading narrows the list.
export default function FigureIndex({ figures, filters, onOpenFigure, notice }: FigureIndexProps) {
  const { danceGroups, selectedDances, selectedLevels, setSelectedDances, setSelectedLevels } = filters;
  const index = useMemo(
    () => buildIndex(figures, danceGroups, selectedDances, selectedLevels),
    [figures, danceGroups, selectedDances, selectedLevels],
  );

  return (
    <div className="fi">
      <DetailBar />
      <header className="fi-header">
        <h2 className="fi-title">Pick a figure</h2>
        <p className="fi-meta">
          {plural(index.total, 'figure', 'figures')} across {plural(index.danceCount, 'dance', 'dances')}. Choose one here
          or from the list.
        </p>
        {notice && (
          <p role="status" className="fi-notice">
            {notice}
          </p>
        )}
      </header>
      <div className="fi-body">
        {index.tables.map((table) => (
          <IndexTable
            key={table.style}
            table={table}
            onOpenFigure={onOpenFigure}
            onPickDance={(dance) => setSelectedDances([dance])}
            onPickLevel={(level) => setSelectedLevels([level])}
          />
        ))}
      </div>
    </div>
  );
}
