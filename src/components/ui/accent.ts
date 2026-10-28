import type { Role } from '../../types';

// The color that stands for the current part: Lead blue, Follow orange,
// and plain ink when both parts are shown side by side.
export type Accent = 'lead' | 'follow' | 'ink';

export const accentFor = (role: Role, sideBySide: boolean): Accent => (sideBySide ? 'ink' : role);

export const accentColor = (accent: Accent): string => `var(--${accent})`;
