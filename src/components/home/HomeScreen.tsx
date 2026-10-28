import type { RefObject } from 'react';
import type { FigureGroup } from '../../types';
import type { useDanceFilters } from '../../hooks/useDanceFilters';
import MenuButton from '../ui/MenuButton';

export interface HomeScreenProps {
  figures: FigureGroup[];
  filters: ReturnType<typeof useDanceFilters>;
  onOpenFigure(figure: FigureGroup): void;
  scrollTopRef: RefObject<number>;
}

// STUB (Phase 0): WS-A replaces this with the real Home screen.
export default function HomeScreen({ figures, onOpenFigure }: HomeScreenProps) {
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 16 }}>
      <MenuButton />
      <h1 className="fv-display">HomeScreen</h1>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {figures.slice(0, 40).map((figure) => (
          <li key={`${figure.dance}-${figure.name}`}>
            <button type="button" onClick={() => onOpenFigure(figure)}>
              {figure.name} ({figure.dance})
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
