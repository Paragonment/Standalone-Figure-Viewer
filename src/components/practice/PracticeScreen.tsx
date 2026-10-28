import type { FigureGroup } from '../../types';
import TopBar from '../ui/TopBar';

export interface PracticeScreenProps {
  figure: FigureGroup;
  onBack(): void;
}

// STUB (Phase 0): WS-C replaces this with the real Practice screen.
export default function PracticeScreen({ figure, onBack }: PracticeScreenProps) {
  return (
    <>
      <TopBar
        backLabel="Steps"
        backAriaLabel="Back to steps"
        onBack={onBack}
        title={figure.name}
        styleHint={figure.style}
      />
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 16, background: 'var(--floor)' }}>
        <h1 className="fv-display">PracticeScreen</h1>
        <p>{figure.name}</p>
      </div>
    </>
  );
}
