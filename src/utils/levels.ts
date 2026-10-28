// The four syllabus levels in pedagogical order. Levels are metal tones
// that always sit next to their name, never carrying meaning alone.
export const LEVELS = ['Pre-Bronze', 'Bronze', 'Silver', 'Gold'] as const;

export interface LevelLook {
  // CSS color for the level's name.
  text: string;
  // CSS color for the leading dot.
  dot: string;
  // Pre-Bronze draws its dot as a hollow ring instead of a filled disc.
  hollow: boolean;
}

export const levelLook = (level: string): LevelLook => {
  switch (level) {
    case 'Pre-Bronze':
      return { text: 'var(--slate)', dot: 'var(--pre-bronze-dot)', hollow: true };
    case 'Bronze':
      return { text: 'var(--bronze)', dot: 'var(--bronze-dot)', hollow: false };
    case 'Silver':
      return { text: 'var(--silver)', dot: 'var(--silver-dot)', hollow: false };
    case 'Gold':
      return { text: 'var(--gold)', dot: 'var(--gold-dot)', hollow: false };
    default:
      return { text: 'var(--slate)', dot: 'var(--idle)', hollow: false };
  }
};
