import { useCallback, useContext, useMemo } from 'react';
import type { FigureGroup } from '../types';
import { FigureLinksContext } from '../state/figureLinksContext';
import { linkFigures, type NoteSegment } from '../utils/figureLinks';

// For the notes of `figure`: cuts a text into plain stretches and links to
// the other figures of its dance, and opens one of them.
export function useFigureLinks(figure: FigureGroup) {
  const links = useContext(FigureLinksContext);
  const sameDance = useMemo(
    () => links?.figures.filter((other) => other.dance === figure.dance) ?? [],
    [links, figure.dance],
  );

  const segment = useCallback(
    (text: string): NoteSegment[] => linkFigures(text, sameDance, figure),
    [sameDance, figure],
  );
  const openFigure = links?.openFigure;
  return { segment, openFigure };
}
