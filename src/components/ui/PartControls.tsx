import type { Role } from '../../types';
import { SideBySideIcon } from './Icons';
import './PartControls.css';

interface PartControlsProps {
  role: Role;
  sideBySide: boolean;
  onRole(role: Role): void;
  onSideBySide(on: boolean): void;
}

const ROLES: { role: Role; label: string }[] = [
  { role: 'lead', label: 'Lead' },
  { role: 'follow', label: 'Follow' },
];

// The side-by-side toggle and the Lead/Follow switch. In side by side both
// halves are filled and act as column headers.
export default function PartControls({ role, sideBySide, onRole, onSideBySide }: PartControlsProps) {
  return (
    <div className="ui-part">
      <button
        type="button"
        className="ui-part-sbs"
        aria-pressed={sideBySide}
        aria-label="Side by side"
        title="Side by side"
        onClick={() => onSideBySide(!sideBySide)}
      >
        <SideBySideIcon />
      </button>
      <div role="group" aria-label="Part" className="ui-part-switch">
        {ROLES.map((r) => {
          const active = sideBySide || role === r.role;
          return (
            <button
              key={r.role}
              type="button"
              className={`ui-part-half ui-part-${r.role}${active ? ' ui-part-active' : ''}`}
              aria-pressed={active}
              onClick={() => onRole(r.role)}
            >
              <span className="ui-part-fill" aria-hidden="true" />
              <span className="ui-part-label">
                <span className="ui-part-dot" aria-hidden="true" />
                {r.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
