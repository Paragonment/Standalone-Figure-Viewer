import type { ReactNode } from 'react';
import MenuButton from '../ui/MenuButton';
import './DetailBar.css';

// The top row of the right pane: what's passed in on the left, the menu at
// the far right of the window.
export default function DetailBar({ children }: { children?: ReactNode }) {
  return (
    <div className="db">
      <div className="db-main">{children}</div>
      <MenuButton className="db-menu" />
    </div>
  );
}
