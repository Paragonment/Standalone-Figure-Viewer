import type { FigureGroup } from '../types';

// The identity of a figure: names repeat across dances, so both are needed.
export const figureKey = (figure: Pick<FigureGroup, 'dance' | 'name'>): string => `${figure.dance}-${figure.name}`;
