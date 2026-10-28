import { LeadsToIcon } from './Icons';
import './PositionsLine.css';

interface PositionsLineProps {
  start?: string;
  end?: string;
}

// Where the figure starts and ends. With only one of the two it shows just
// that one; with neither (every Standard figure) it renders nothing.
export default function PositionsLine({ start, end }: PositionsLineProps) {
  if (!start && !end) return null;
  return (
    <p className="ui-positions">
      {start && <span>{start}</span>}
      {start && end && <LeadsToIcon className="ui-positions-arrow" />}
      {end && <span>{end}</span>}
    </p>
  );
}
