import type { ReactNode } from 'react';
import type { DanceStyle } from '../../types';
import { BackIcon } from './Icons';
import MenuButton from './MenuButton';
import './TopBar.css';

interface TopBarProps {
  backLabel: string;
  backAriaLabel?: string;
  showBackLabel?: boolean;
  onBack(): void;
  title?: string;
  titleVisible?: boolean;
  ruleVisible?: boolean;
  action?: ReactNode;
  styleHint?: DanceStyle;
}

// Back, figure name, optional action and the menu, on the Mirror ground.
export default function TopBar({
  backLabel,
  backAriaLabel,
  showBackLabel = true,
  onBack,
  title,
  titleVisible = true,
  ruleVisible = true,
  action,
  styleHint,
}: TopBarProps) {
  return (
    <div className={`ui-topbar${ruleVisible ? ' ui-topbar-rule' : ''}`}>
      <button
        type="button"
        className={`ui-topbar-back${showBackLabel ? '' : ' ui-topbar-back-icon'}`}
        aria-label={backAriaLabel ?? backLabel}
        onClick={onBack}
      >
        <BackIcon />
        {showBackLabel && <span>{backLabel}</span>}
      </button>
      <span
        aria-hidden="true"
        className={`ui-topbar-title${title !== undefined && titleVisible ? '' : ' ui-topbar-title-hidden'}`}
      >
        {title}
      </span>
      {action}
      <MenuButton styleHint={styleHint} />
    </div>
  );
}
