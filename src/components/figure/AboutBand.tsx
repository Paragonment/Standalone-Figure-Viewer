import { useState } from 'react';
import type { FigureGroup } from '../../types';
import { hasNotes, type FigureNotes } from '../../utils/figureNotes';
import { ExpandIcon } from '../ui/Icons';
import FigureMeta from './FigureMeta';
import AboutNotes from './AboutNotes';
import './AboutBand.css';

interface AboutBandProps {
  figure: FigureGroup;
  notes: FigureNotes;
}

// "About this figure": what the figure is (always in view), the description and the labelled endings, what
// comes before and what follows. Closed until the reader opens it.
export default function AboutBand({ figure, notes }: AboutBandProps) {
  const [open, setOpen] = useState(false);
  if (!hasNotes(notes)) return null;

  return (
    <div className="about-band">
      <button
        type="button"
        className="about-toggle"
        aria-expanded={open}
        aria-controls="about-panel"
        onClick={() => setOpen((o) => !o)}
      >
        About this figure
        <ExpandIcon className={`about-chevron${open ? ' about-chevron-open' : ''}`} />
      </button>
      <FigureMeta figure={figure} />
      {open && (
        <div id="about-panel" className="about-panel">
          <AboutNotes figure={figure} notes={notes} />
        </div>
      )}
    </div>
  );
}
