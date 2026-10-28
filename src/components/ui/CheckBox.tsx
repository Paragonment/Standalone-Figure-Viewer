import { CheckIcon, CheckSmallIcon, DashIcon, DashSmallIcon } from './Icons';
import './CheckBox.css';

interface CheckBoxProps {
  state: 'on' | 'off' | 'mixed';
  // 20 is Home's style row (radius 5, 1.5px border); 22 is Settings (radius 6, 2px).
  size?: 20 | 22;
}

// The visual box only. The caller wraps it in a 44px button that carries
// role="checkbox" and aria-checked.
export default function CheckBox({ state, size = 20 }: CheckBoxProps) {
  const small = size === 20;
  return (
    <span className={`ui-check ui-check-${size}${state === 'off' ? '' : ' ui-check-on'}`} aria-hidden="true">
      {state === 'on' && (small ? <CheckSmallIcon /> : <CheckIcon />)}
      {state === 'mixed' && (small ? <DashSmallIcon /> : <DashIcon />)}
    </span>
  );
}
