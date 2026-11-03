import { useContext } from 'react';
import type { FigureGroup } from '../types';
import type { FigureTransitions, TransitionBook } from '../utils/transitions';
import { TransitionsContext } from './transitionsContext';

export function useTransitionBook(): TransitionBook {
  const book = useContext(TransitionsContext);
  if (!book) throw new Error('useTransitionBook must be used inside a TransitionsContext provider');
  return book;
}

// What the figure can follow and lead into. The book caches each figure's
// lists, so this is cheap on every render.
export function useFigureTransitions(figure: FigureGroup): FigureTransitions {
  return useTransitionBook().forFigure(figure);
}
