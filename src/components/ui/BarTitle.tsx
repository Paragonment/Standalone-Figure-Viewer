import './TopBar.css';

interface BarTitleProps {
  title?: string;
  visible?: boolean;
}

// The small title a bar reveals once the big one has scrolled away. Shared
// by the phone's top bar and the wide pane's pinned bar.
export default function BarTitle({ title, visible = true }: BarTitleProps) {
  return (
    <span
      aria-hidden="true"
      className={`ui-topbar-title${title !== undefined && visible ? '' : ' ui-topbar-title-hidden'}`}
    >
      {title}
    </span>
  );
}
