import { useEffect, useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { FigureGroup } from '../../types';
import type { FigureRow, ResultSection } from '../../utils/search';
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
  scrollTopRef: RefObject<number>;
  // Changes whenever the filters or query change; the list jumps back to the top.
  resetKey: string;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function Row({ row, grouped, onOpen }: { row: FigureRow; grouped: boolean; onOpen(figure: FigureGroup): void }) {
  const { figure, nameMatch, snippet } = row;
  const look = levelLook(figure.level);
  return (
    <li className="fl-item">
      <button type="button" className={grouped ? 'fl-row fl-row-short' : 'fl-row'} onClick={() => onOpen(figure)}>
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
  scrollTopRef,
  resetKey,
}: FigureListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const lastResetKey = useRef(resetKey);

  // Coming back from a figure lands where the reader left off.
  useLayoutEffect(() => {
    if (listRef.current) listRef.current.scrollTop = scrollTopRef.current;
  }, [scrollTopRef]);

  // Any change to the filters or the query starts the list from the top.
  useEffect(() => {
    if (lastResetKey.current === resetKey) return;
    lastResetKey.current = resetKey;
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [resetKey]);

  const countLabel = searching ? plural(total, 'match', 'matches') : plural(total, 'figure', 'figures');

  return (
    <div className="fl">
      <div className="fl-count">
        <span aria-live="polite" className="fl-count-text">
          {countLabel}
        </span>
        {filtered && total > 0 && (
          <button type="button" className="fv-act fl-act" onClick={onClearFilters}>
            {searching ? 'Search all' : 'Show all'}
          </button>
        )}
      </div>
      <div
        ref={listRef}
        className="fl-scroll"
        onScroll={(e) => {
          scrollTopRef.current = e.currentTarget.scrollTop;
        }}
      >
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
                <Row key={`${row.figure.dance}-${row.figure.name}`} row={row} grouped={grouped} onOpen={onOpenFigure} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
