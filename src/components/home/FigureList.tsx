import type { FigureGroup } from '../../types';
import type { FigureRow, ResultSection } from '../../utils/search';
import { figureKey } from '../../utils/figureKey';
import { levelLook } from '../../utils/levels';
import { keepRanges } from '../../utils/stepValues';
import { RowChevronIcon } from '../ui/Icons';
import './FigureList.css';

interface FigureListProps {
  sections: ResultSection[];
  total: number;
  // Total figures in the whole data set, for "Search all N figures".
  allCount: number;
  // One dance, no query: level sections, short rows, no sub line.
  grouped: boolean;
  // The query as typed; empty when not searching.
  query: string;
  searching: boolean;
  // A dance or level filter is active.
  filtered: boolean;
  onClearFilters(): void;
  onOpenFigure(figure: FigureGroup): void;
  // The open figure's key (see figureKey): its row is marked as current.
  selectedKey?: string;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

interface RowProps {
  row: FigureRow;
  grouped: boolean;
  selected: boolean;
  onOpen(figure: FigureGroup): void;
}

function Row({ row, grouped, selected, onOpen }: RowProps) {
  const { figure, nameMatch, snippet } = row;
  const look = levelLook(figure.level);
  return (
    <li className="fl-item">
      <button
        type="button"
        className={['fl-row', grouped && 'fl-row-short', selected && 'fl-row-selected'].filter(Boolean).join(' ')}
        aria-current={selected ? 'true' : undefined}
        onClick={() => onOpen(figure)}
      >
        <span className="fl-text">
          <span className="fl-name">
            {nameMatch ? (
              <>
                {figure.name.slice(0, nameMatch[0])}
                <mark>{figure.name.slice(nameMatch[0], nameMatch[1])}</mark>
                {figure.name.slice(nameMatch[1])}
              </>
            ) : (
              figure.name
            )}
          </span>
          {!grouped && (
            <span className="fl-sub">
              {figure.dance} <span className="fl-level" style={{ color: look.text }}>{figure.level}</span>
            </span>
          )}
          {snippet && (
            <span className="fl-snippet">
              {keepRanges(snippet.pre)}
              <mark>{snippet.match}</mark>
              {keepRanges(snippet.post)}
            </span>
          )}
        </span>
        <span className="fl-steps">{plural(figure.steps.length, 'step', 'steps')}</span>
        <RowChevronIcon className="fl-chevron" />
      </button>
    </li>
  );
}

export default function FigureList({
  sections,
  total,
  allCount,
  grouped,
  query,
  searching,
  filtered,
  onClearFilters,
  onOpenFigure,
  selectedKey,
}: FigureListProps) {
  return (
    <div className="fl">
      {total === 0 && (
        <div className="fl-empty">
          <p className="fl-empty-title">{searching ? `No figures match “${query.trim()}”` : 'No figures match'}</p>
          {searching && (
            <p className="fl-empty-hint">
              {filtered
                ? 'Search looks only in the dances and levels picked above.'
                : 'Check the spelling, or try part of the name.'}
            </p>
          )}
          {filtered && (
            <button type="button" className="fv-act fl-empty-act" onClick={onClearFilters}>
              {searching ? `Search all ${allCount} figures` : 'Show all'}
            </button>
          )}
        </div>
      )}
      {sections.map((section) => (
        <section key={section.heading ?? section.key} className={section.tinted ? 'fl-section fl-section-tint' : 'fl-section'}>
          {section.heading && (
            <h2 className="fl-heading" style={{ color: section.headingColor }}>
              <span>{section.heading}</span>
              <span className="fl-heading-count">{section.count}</span>
            </h2>
          )}
          <ul className="fl-list">
            {section.rows.map((row) => (
              <Row
                key={figureKey(row.figure)}
                row={row}
                grouped={grouped}
                selected={figureKey(row.figure) === selectedKey}
                onOpen={onOpenFigure}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
