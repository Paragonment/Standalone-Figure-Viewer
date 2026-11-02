import type { MouseEvent } from 'react';
import type { CSSProperties } from 'react';
import type { FigureGroup } from '../../types';
import { figureKey } from '../../utils/figureKey';
import type { IndexTable as IndexTableData } from '../../utils/figureIndex';
import { levelLook } from '../../utils/levels';
import { figureRoute, formatRoute } from '../../utils/route';
import LevelDot from '../ui/LevelDot';
import './IndexTable.css';

interface IndexTableProps {
  table: IndexTableData;
  onOpenFigure(figure: FigureGroup): void;
  // A dance or level heading narrows the list to it.
  onPickDance(dance: string): void;
  onPickLevel(level: string): void;
}

// One style's contents: a column for each dance, a row for each level, every
// figure a link that opens it. A new tab or a copied link gets the address.
export default function IndexTable({ table, onOpenFigure, onPickDance, onPickLevel }: IndexTableProps) {
  const { style, label, columns, rows } = table;
  const headingId = `ix-${style}`;

  const open = (event: MouseEvent<HTMLAnchorElement>, figure: FigureGroup) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpenFigure(figure);
  };

  return (
    <section aria-labelledby={headingId} className="ix">
      <h3 id={headingId} className="ix-style">
        {label}
      </h3>
      <div className="ix-scroll">
        <table className="ix-table" style={{ '--ix-columns': columns.length } as CSSProperties}>
          <thead>
            <tr>
              <td className="ix-corner" />
              {columns.map(({ dance, count }) => (
                <th key={dance} scope="col" className="ix-dance">
                  <button type="button" className="ix-pick" onClick={() => onPickDance(dance)}>
                    {dance}{' '}
                    <span className="ix-count">{count}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ level, cells }) => (
              <tr key={level}>
                <th scope="row" className="ix-level">
                  <button
                    type="button"
                    className="ix-pick"
                    style={{ color: levelLook(level).text }}
                    onClick={() => onPickLevel(level)}
                  >
                    <LevelDot level={level} />
                    {level}
                  </button>
                </th>
                {cells.map((figures, i) => (
                  <td key={columns[i].dance}>
                    <ul className="ix-names">
                      {figures.map((figure) => (
                        <li key={figureKey(figure)}>
                          <a href={formatRoute(figureRoute(figure))} onClick={(event) => open(event, figure)}>
                            {figure.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
