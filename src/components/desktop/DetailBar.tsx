import type { ReactNode } from 'react';
import MenuButton from '../ui/MenuButton';
import './DetailBar.css';

// The top row of the right pane: what's passed in on the left, the menu at
// the far right of the window, with the page's own actions just before it.
export default function DetailBar({ children, actions }: { children?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="db">
      <div className="db-main">{children}</div>
      {actions && <div className="db-actions">{actions}</div>}
      <MenuButton className="db-menu" />
    </div>
  );
}
