import type { DanceStyle } from '../../types';
import { useSettings } from '../../state/useSettings';
import { MenuDotsIcon } from './Icons';
import './MenuButton.css';

interface MenuButtonProps {
  styleHint?: DanceStyle;
  className?: string;
}

// The three dots that open the Settings sheet from any screen.
export default function MenuButton({ styleHint, className }: MenuButtonProps) {
  const { openSettings } = useSettings();
  return (
    <button
      type="button"
      className={className ? `ui-menu-btn ${className}` : 'ui-menu-btn'}
      aria-label="Menu"
      onClick={() => openSettings(styleHint)}
    >
      <MenuDotsIcon />
    </button>
  );
}
