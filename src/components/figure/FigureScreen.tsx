import type { FigureGroup } from '../../types';
import TopBar from '../ui/TopBar';
import PracticeButton from '../ui/PracticeButton';

export interface FigureScreenProps {
  figure: FigureGroup;
  onBack(): void;
  onPractice(): void;
}

// STUB (Phase 0): WS-B replaces this with the real Figure screen.
export default function FigureScreen({ figure, onBack, onPractice }: FigureScreenProps) {
  return (
    <>
      <TopBar
        backLabel="Figures"
        onBack={onBack}
        title={figure.name}
        styleHint={figure.style}
        action={<PracticeButton onClick={onPractice} />}
      />
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 16, background: 'var(--floor)' }}>
        <h1 className="fv-display">FigureScreen</h1>
        <p>{figure.name}</p>
      </div>
    </>
  );
}
