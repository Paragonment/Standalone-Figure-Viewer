import { PlayIcon } from './Icons';
import './PracticeButton.css';

interface PracticeButtonProps {
  onClick(): void;
}

// The "Practice" pill in the Figure top bar.
export default function PracticeButton({ onClick }: PracticeButtonProps) {
  return (
    <button type="button" className="ui-practice-btn" onClick={onClick}>
      <span className="ui-practice-pill">
        <PlayIcon />
        Practice
      </span>
    </button>
  );
}
