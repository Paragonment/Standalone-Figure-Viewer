export type DetailMode = 'cards' | 'practice';

export interface DetailModeDef {
  id: DetailMode;
  label: string;
  icon: string;
  description: string;
}

// Ordered list of ways to view a figure's steps. To add another one (e.g. a
// future "Quiz" mode), add an entry here and a case in FigureDetail's render.
export const DETAIL_MODES: DetailModeDef[] = [
  { id: 'cards', label: 'Step cards', icon: '🗂️', description: 'Every step at a glance' },
  { id: 'practice', label: 'Practice', icon: '▶️', description: 'One step at a time' },
];
