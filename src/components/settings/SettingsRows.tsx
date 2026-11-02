import { useId, type ReactNode } from 'react';
import CheckBox from '../ui/CheckBox';
import { RowChevronIcon } from '../ui/Icons';
import './SettingsRows.css';

// The building blocks of every settings page: a section is a heading on the
// Mirror ground over a Floor band of rows, and each row is one setting.
// A new setting is one row in a section; a new group is one more section.

interface SectionProps {
  title: string;
  // What the section's settings change, in a sentence.
  description?: ReactNode;
  // A text action at the right of the heading, such as Show all.
  action?: ReactNode;
  children: ReactNode;
}

export function SettingsSection({ title, description, action, children }: SectionProps) {
  const headingId = useId();
  return (
    <section className="set-section" aria-labelledby={headingId}>
      <div className="set-section-head">
        <h3 className="set-section-title" id={headingId}>
          {title}
        </h3>
        {action}
      </div>
      {description && <p className="set-section-text">{description}</p>}
      <div className="set-band">{children}</div>
    </section>
  );
}

// Label and the line under it, shared by every row.
function RowText({ labelId, label, extra, descId, description }: {
  labelId: string;
  label: ReactNode;
  extra?: ReactNode;
  descId: string;
  description?: ReactNode;
}) {
  return (
    <span className="set-row-text">
      <span className="set-row-label">
        <span id={labelId}>{label}</span>
        {extra}
      </span>
      {description && (
        <span className="set-row-sub" id={descId}>
          {description}
        </span>
      )}
    </span>
  );
}

interface NavRowProps {
  label: string;
  // Marks the row, e.g. the style of the figure Settings was opened from.
  badge?: string;
  // The current choice, summed up: what the page behind the row is set to.
  summary?: string;
  // A short count at the right, such as "3 of 7".
  value?: string;
  onOpen(): void;
}

// Opens a page of its own, for a setting with too many choices to show here.
export function NavRow({ label, badge, summary, value, onOpen }: NavRowProps) {
  const id = useId();
  return (
    <button
      type="button"
      className="set-row set-row-nav"
      aria-labelledby={`${id}-label`}
      aria-describedby={[badge && `${id}-badge`, summary && `${id}-sub`, value && `${id}-value`].filter(Boolean).join(' ') || undefined}
      onClick={onOpen}
    >
      <RowText
        labelId={`${id}-label`}
        label={label}
        extra={
          badge && (
            <span className="set-badge" id={`${id}-badge`}>
              {badge}
            </span>
          )
        }
        descId={`${id}-sub`}
        description={summary}
      />
      {value && (
        <span className="set-row-value" id={`${id}-value`}>
          {value}
        </span>
      )}
      <RowChevronIcon className="set-row-chevron" />
    </button>
  );
}

interface SwitchRowProps {
  label: string;
  description?: ReactNode;
  checked: boolean;
  onChange(on: boolean): void;
}

// On or off, taking effect at once.
export function SwitchRow({ label, description, checked, onChange }: SwitchRowProps) {
  const id = useId();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="set-row set-row-switch"
      aria-labelledby={`${id}-label`}
      aria-describedby={description ? `${id}-sub` : undefined}
      onClick={() => onChange(!checked)}
    >
      <RowText labelId={`${id}-label`} label={label} descId={`${id}-sub`} description={description} />
      <span className="set-switch" aria-hidden="true" />
    </button>
  );
}

interface CheckRowProps {
  label: string;
  description?: ReactNode;
  checked: boolean;
  onChange(on: boolean): void;
}

// One of a set of things to include; the box leads, as in Home's filters.
export function CheckRow({ label, description, checked, onChange }: CheckRowProps) {
  const id = useId();
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className="set-row set-row-check"
      aria-labelledby={`${id}-label`}
      aria-describedby={description ? `${id}-sub` : undefined}
      onClick={() => onChange(!checked)}
    >
      <CheckBox state={checked ? 'on' : 'off'} size={22} />
      <RowText labelId={`${id}-label`} label={label} descId={`${id}-sub`} description={description} />
    </button>
  );
}

export interface Choice<T extends string> {
  value: T;
  label: string;
}

interface ChoiceRowProps<T extends string> {
  label: string;
  description?: ReactNode;
  value: T;
  choices: Choice<T>[];
  onChange(value: T): void;
}

// One of a few choices, all in view: a segmented control under the label.
// Suits two to four short choices; more belong on a page of their own.
export function ChoiceRow<T extends string>({ label, description, value, choices, onChange }: ChoiceRowProps<T>) {
  const id = useId();
  return (
    <div className="set-row set-row-choice">
      <RowText labelId={`${id}-label`} label={label} descId={`${id}-sub`} description={description} />
      <div
        role="group"
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-sub` : undefined}
        className="set-seg"
        style={{ gridTemplateColumns: `repeat(${choices.length}, minmax(0, 1fr))` }}
      >
        {choices.map((choice) => (
          <button
            key={choice.value}
            type="button"
            className="set-seg-btn"
            aria-pressed={value === choice.value}
            onClick={() => onChange(choice.value)}
          >
            <span>{choice.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
