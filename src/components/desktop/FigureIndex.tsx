import DetailBar from './DetailBar';
import './FigureIndex.css';

// The right pane with nothing open.
export default function FigureIndex({ count }: { count: number }) {
  return (
    <div className="fi">
      <header className="fi-header">
        <DetailBar />
        <h2 className="fi-title">Pick a figure</h2>
        <p className="fi-meta">
          {count} {count === 1 ? 'figure' : 'figures'}
        </p>
      </header>
    </div>
  );
}
