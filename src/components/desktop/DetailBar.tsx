import type { ReactNode } from 'react';
import BarTitle from '../ui/BarTitle';
import MenuButton from '../ui/MenuButton';
import './DetailBar.css';

interface DetailBarProps {
  children?: ReactNode;
  actions?: ReactNode;
  // The figure's name, revealed in the bar once the big title has scrolled
  // away (`scrolled`), the way the phone's top bar does.
  title?: string;
  scrolled?: boolean;
}

// The top row of the right pane, pinned to the top of its scroller: what's
// passed in on the left, the small title, then the page's own actions and
// the menu at the far right of the window.
export default function DetailBar({ children, actions, title, scrolled = false }: DetailBarProps) {
  return (
    <div className={`db${scrolled ? ' db-rule' : ''}`}>
      <div className="db-main">{children}</div>
      <BarTitle title={title} visible={scrolled} />
      {actions && <div className="db-actions">{actions}</div>}
      <MenuButton className="db-menu" />
    </div>
  );
}
