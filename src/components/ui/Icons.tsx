import type { ReactNode } from 'react';

// One stroke icon set on a 24px grid with round caps and joins. Every icon
// is decorative (aria-hidden) except LeadsToIcon, which reads as "to".

interface IconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

interface SvgProps extends IconProps {
  defaultSize: number;
  defaultStroke: number;
  viewBox?: string;
  children: ReactNode;
}

function Svg({ size, strokeWidth, defaultSize, defaultStroke, viewBox = '0 0 24 24', className, children }: SvgProps) {
  const px = size ?? defaultSize;
  return (
    <svg
      width={px}
      height={px}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? defaultStroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Svg defaultSize={20} defaultStroke={2} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </Svg>
  );
}

export function MenuDotsIcon(props: IconProps) {
  return (
    <Svg defaultSize={22} defaultStroke={2} {...props}>
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="19" cy="12" r="1.2" />
    </Svg>
  );
}

export function BackIcon(props: IconProps) {
  return (
    <Svg defaultSize={22} defaultStroke={2.4} {...props}>
      <path d="M15 5l-7 7 7 7" />
    </Svg>
  );
}

export function NextIcon(props: IconProps) {
  return (
    <Svg defaultSize={20} defaultStroke={2.4} {...props}>
      <path d="M9 5l7 7-7 7" />
    </Svg>
  );
}

export function RowChevronIcon(props: IconProps) {
  return (
    <Svg defaultSize={18} defaultStroke={2.2} {...props}>
      <path d="M9 6l6 6-6 6" />
    </Svg>
  );
}

export function ExpandIcon(props: IconProps) {
  return (
    <Svg defaultSize={18} defaultStroke={2.2} {...props}>
      <path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

// The only filled icon.
export function PlayIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M8 5.5v13l10.5-6.5z" />
    </svg>
  );
}

export function SideBySideIcon(props: IconProps) {
  return (
    <Svg defaultSize={22} defaultStroke={2} {...props}>
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
      <path d="M12 5v14" />
    </Svg>
  );
}

// Start position "to" end position. Meaningful, so it is not hidden.
export function LeadsToIcon({ size = 18, strokeWidth = 2, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="to"
      className={className}
    >
      <path d="M4 12h15M14 7l5 5-5 5" />
    </svg>
  );
}

// The x inside the search field's clear button; the circle behind it is
// drawn by the button.
export function ClearIcon(props: IconProps) {
  return (
    <Svg defaultSize={11} defaultStroke={3.2} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg defaultSize={14} defaultStroke={3.4} {...props}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Svg>
  );
}

export function DashIcon(props: IconProps) {
  return (
    <Svg defaultSize={14} defaultStroke={3.4} {...props}>
      <path d="M6 12h12" />
    </Svg>
  );
}

// Home's 20px checkbox draws its marks on a 12px grid.
export function CheckSmallIcon(props: IconProps) {
  return (
    <Svg defaultSize={12} defaultStroke={2} viewBox="0 0 12 12" {...props}>
      <path d="M2.5 6.2l2.4 2.4 4.6-5" />
    </Svg>
  );
}

export function DashSmallIcon(props: IconProps) {
  return (
    <Svg defaultSize={12} defaultStroke={2} viewBox="0 0 12 12" {...props}>
      <path d="M3 6h6" />
    </Svg>
  );
}
