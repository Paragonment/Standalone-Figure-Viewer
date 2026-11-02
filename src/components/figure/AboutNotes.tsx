import { Fragment } from 'react';
import type { FigureNotes } from '../../utils/figureNotes';
import { useDisplaySettings } from '../../hooks/useDisplaySettings';
import { expandAbbreviations } from '../../utils/abbreviations';
import { keepRanges } from '../../utils/stepValues';
import './AboutNotes.css';

// The description and the labelled endings, what comes before and what
// follows, as siblings for the band or aside that holds them to lay out.
export default function AboutNotes({ notes }: { notes: FigureNotes }) {
  const { spellOutAbbreviations } = useDisplaySettings();
  const show = (text: string) => keepRanges(spellOutAbbreviations ? expandAbbreviations(text) : text);

  return (
    <>
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
    </>
  );
}
