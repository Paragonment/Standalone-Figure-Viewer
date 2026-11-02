import { levelLook } from '../../utils/levels';
import './LevelDot.css';

// A level's metal dot, hollow for Pre-Bronze. It always sits next to the
// level's name, so it is hidden from assistive technology.
export default function LevelDot({ level }: { level: string }) {
  const look = levelLook(level);
  return (
    <span
      className="ui-level-dot"
      aria-hidden="true"
      style={{ borderColor: look.dot, background: look.hollow ? 'transparent' : look.dot }}
    />
  );
}
