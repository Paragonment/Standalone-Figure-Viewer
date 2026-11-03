import { Fragment } from 'react';
import type { TransitionList } from '../utils/transitions';
import { useDisplaySettings } from '../hooks/useDisplaySettings';
import { expandAbbreviations } from '../utils/abbreviations';
import { keepRanges } from '../utils/stepValues';
import { levelLook } from '../utils/levels';
import './TransitionLines.css';

interface TransitionLinesProps {
  list: TransitionList;
}

// One generated Precede or Follow list: a line per level and case, the
// figure names standing out from the book's wording around them. Names
// are shown as charted; only the wording spells out abbreviations.
export default function TransitionLines({ list }: TransitionLinesProps) {
  const { spellOutAbbreviations } = useDisplaySettings();
  const show = (text: string) => keepRanges(spellOutAbbreviations ? expandAbbreviations(text) : text);

  return (
    <div className="tr-lines">
      {list.lines.map((line, i) => {
        const look = levelLook(line.level);
        const heading = list.graded && line.level && line.level !== list.lines[i - 1]?.level;
        return (
          <Fragment key={`${line.level}|${line.when}`}>
            {heading && (
              <p className="tr-level" style={{ color: look.text }}>
                <span
                  className="tr-level-dot"
                  style={{ borderColor: look.dot, backgroundColor: look.hollow ? 'transparent' : look.dot }}
                />
                {line.level}
              </p>
            )}
            <p className="tr-line">
              {line.when && <span className="tr-when">{show(line.when)}: </span>}
              {line.items.map((item, j) => (
                <Fragment key={item.text}>
                  {j > 0 && ', '}
                  {item.name ? (
                    <>
                      <span className="tr-name">{keepRanges(item.steps ? `${item.steps} ${item.name}` : item.name)}</span>
                      {item.details && ` ${show(item.details)}`}
                    </>
                  ) : (
                    show(item.details)
                  )}
                </Fragment>
              ))}
            </p>
          </Fragment>
        );
      })}
    </div>
  );
}
