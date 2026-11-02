import type { FigureGroup } from '../../types';
import type { FigureNotes } from '../../utils/figureNotes';
import AboutNotes from './AboutNotes';
import './AboutAside.css';

// The About content open beside the chart, for windows wide enough to spare
// the room. FigureBody turns it on from 1280px, where AboutBand steps aside.
export default function AboutAside({ figure, notes }: { figure: FigureGroup; notes: FigureNotes }) {
  return (
    <aside aria-labelledby="about-aside-title" className="about-aside">
      <h2 id="about-aside-title" className="about-aside-title">
        About
      </h2>
      <AboutNotes figure={figure} notes={notes} />
    </aside>
  );
}
