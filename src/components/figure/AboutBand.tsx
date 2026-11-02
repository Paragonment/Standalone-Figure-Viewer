import { useState } from 'react';
import { hasNotes, type FigureNotes } from '../../utils/figureNotes';
import { ExpandIcon } from '../ui/Icons';
import AboutNotes from './AboutNotes';
import './AboutBand.css';

interface AboutBandProps {
  notes: FigureNotes;
}

// "About this figure": the description and the labelled endings, what
// comes before and what follows. Closed until the reader opens it.
export default function AboutBand({ notes }: AboutBandProps) {
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
      {open && (
        <div id="about-panel" className="about-panel">
          <AboutNotes notes={notes} />
        </div>
      )}
    </div>
  );
}
