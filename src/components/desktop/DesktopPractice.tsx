import type { FigureGroup } from '../../types';
import PracticeScreen from '../practice/PracticeScreen';
import './DesktopPractice.css';

interface DesktopPracticeProps {
  figure: FigureGroup;
  onBack(): void;
}

// Practice on a wide window: the phone's screen over both panes, its content
// kept to a column of a comfortable width.
export default function DesktopPractice({ figure, onBack }: DesktopPracticeProps) {
  return (
    <div className="dp">
      <PracticeScreen figure={figure} onBack={onBack} />
    </div>
  );
}
