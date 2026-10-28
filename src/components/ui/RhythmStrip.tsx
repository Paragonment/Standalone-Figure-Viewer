import type { CSSProperties } from 'react';
import type { Beat } from '../../utils/rhythm';
import { accentColor, type Accent } from './accent';
import './RhythmStrip.css';

interface RhythmStripProps {
  beats: Beat[];
  // 0-based index of the current beat, -1 for none.
  current: number;
  accent: Accent;
  onSelect(index: number): void;
  ariaLabel?: string;
}

// One tappable bar per step, as wide as the step is long, with its count
// underneath. The current beat takes the part's color.
export default function RhythmStrip({
  beats,
  current,
  accent,
  onSelect,
  ariaLabel = 'Rhythm, go to a step',
}: RhythmStripProps) {
  return (
    <div role="group" aria-label={ariaLabel} className="ui-strip" style={{ '--accent': accentColor(accent) } as CSSProperties}>
      {beats.map((beat, i) => (
        <button
          key={i}
          type="button"
          className={`ui-strip-beat${i === current ? ' ui-strip-current' : ''}`}
          style={{ flexGrow: beat.value }}
          aria-label={beat.aria}
          aria-current={i === current ? 'step' : undefined}
          onClick={() => onSelect(i)}
        >
          <span className="ui-strip-bar" aria-hidden="true" />
          <span className="ui-strip-count" aria-hidden="true">
            {beat.count}
          </span>
        </button>
      ))}
    </div>
  );
}
