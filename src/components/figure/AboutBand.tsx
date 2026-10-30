import { Fragment, useState } from 'react';
import type { FigureNotes } from '../../utils/figureNotes';
import { useDisplaySettings } from '../../hooks/useDisplaySettings';
import { expandAbbreviations } from '../../utils/abbreviations';
import { keepRanges } from '../../utils/stepValues';
import { ExpandIcon } from '../ui/Icons';
import './AboutBand.css';

interface AboutBandProps {
  notes: FigureNotes;
}

// "About this figure": the description and the labelled endings, what
// comes before and what follows. Closed until the reader opens it.
export default function AboutBand({ notes }: AboutBandProps) {
  const [open, setOpen] = useState(false);
  const { spellOutAbbreviations } = useDisplaySettings();
  const show = (text: string) => keepRanges(spellOutAbbreviations ? expandAbbreviations(text) : text);
  if (!notes.description && notes.rows.length === 0) return null;

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
          {notes.description && <p className="about-description">{show(notes.description)}</p>}
          {notes.rows.length > 0 && (
            <dl className="about-rows">
              {notes.rows.map((row) => (
                <Fragment key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{show(row.value)}</dd>
                </Fragment>
              ))}
            </dl>
          )}
        </div>
      )}
    </div>
  );
}
