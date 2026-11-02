import { createContext } from 'react';
import type { FigureGroup } from '../types';

// What a figure's notes need to point at other figures: all of them, and how
// to open one. Absent outside the viewer, where names stay plain text.
export interface FigureLinksApi {
  figures: FigureGroup[];
  openFigure(figure: FigureGroup): void;
}

export const FigureLinksContext = createContext<FigureLinksApi | null>(null);
