import type { MouseEvent, ReactNode } from 'react';
import type { FigureGroup } from '../../types';
import { figureRoute, formatRoute } from '../../utils/route';

interface FigureLinkProps {
  figure: FigureGroup;
  onOpen(figure: FigureGroup): void;
  className?: string;
  children: ReactNode;
}

// A real link to a figure: a new tab, a copied link or a middle click get the
// address, a plain click opens it here as a new history entry.
export default function FigureLink({ figure, onOpen, className, children }: FigureLinkProps) {
  const open = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpen(figure);
  };

  return (
    <a className={className} href={formatRoute(figureRoute(figure))} onClick={open}>
      {children}
    </a>
  );
}
