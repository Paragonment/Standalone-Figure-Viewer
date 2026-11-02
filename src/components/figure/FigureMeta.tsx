import type { FigureGroup } from '../../types';
import { levelLook } from '../../utils/levels';
import { barCount, formatBars } from '../../utils/rhythm';
import './FigureMeta.css';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

// What the figure is, in one line: dance, level (in its metal) and its
// length. The sub-header of the About content, wherever that is shown.
export default function FigureMeta({ figure }: { figure: FigureGroup }) {
  const bars = barCount(figure);

  return (
    <p className="fig-meta">
      <span>{figure.dance}</span>
      <span className="fig-level" style={{ color: levelLook(figure.level).text }}>
        {figure.level}
      </span>
      <span>
        {plural(figure.steps.length, 'step')}
        {bars !== null && `, ${formatBars(bars)}`}
      </span>
    </p>
  );
}
