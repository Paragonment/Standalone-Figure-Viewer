import { Fragment } from 'react';
import type { FigureGroup } from '../../types';
import type { FigureNotes } from '../../utils/figureNotes';
import { useDisplaySettings } from '../../hooks/useDisplaySettings';
import { useFigureLinks } from '../../hooks/useFigureLinks';
import { expandAbbreviations } from '../../utils/abbreviations';
import { levelLook } from '../../utils/levels';
import { keepRanges } from '../../utils/stepValues';
import FigureLink from '../ui/FigureLink';
import './AboutNotes.css';

interface AboutNotesProps {
  figure: FigureGroup;
  notes: FigureNotes;
}

// The description and the labelled endings, what comes before and what
// follows, as siblings for the band or aside that holds them to lay out.
// Where the text names another figure of the dance it links to it.
export default function AboutNotes({ figure, notes }: AboutNotesProps) {
  const { spellOutAbbreviations } = useDisplaySettings();
  const { segment, openFigure } = useFigureLinks(figure);

  const show = (text: string, preceding = '') =>
    keepRanges(spellOutAbbreviations ? expandAbbreviations(text, preceding) : text);

  const linked = (text: string) => {
    let preceding = '';
    return segment(text).map((part, i) => {
      const shown = show(part.text, preceding);
      preceding += part.text;
      return part.figure && openFigure ? (
        <FigureLink key={i} className="about-link" figure={part.figure} onOpen={openFigure}>
          {shown}
        </FigureLink>
      ) : (
        <Fragment key={i}>{shown}</Fragment>
      );
    });
  };

  return (
    <>
      {notes.description && <p className="about-description">{linked(notes.description)}</p>}
      {notes.rows.length > 0 && (
        <dl className="about-rows">
          {notes.rows.map((row) => (
            <Fragment key={row.label}>
              <dt>{row.label}</dt>
              <dd>
                {row.entries.map((entry) => (
                  <p key={`${entry.levels.join()}-${entry.text}`} className="about-entry">
                    {entry.levels.length > 0 && (
                      <span className="about-levels">
                        {entry.levels.map((level, i) => (
                          <Fragment key={level}>
                            {i > 0 && ', '}
                            <span style={{ color: levelLook(level).text }}>{level}</span>
                          </Fragment>
                        ))}
                      </span>
                    )}
                    {linked(entry.text)}
                  </p>
                ))}
              </dd>
            </Fragment>
          ))}
        </dl>
      )}
    </>
  );
}
