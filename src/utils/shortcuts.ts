// The keyboard shortcuts, as data: one entry each, read by the one hook that
// listens (useShortcuts) and by the dialog that lists them. A new shortcut is
// an entry here and its action in useShortcuts.

export type ShortcutId =
  | 'search'
  | 'escape'
  | 'listPrevious'
  | 'listNext'
  | 'figurePrevious'
  | 'figureNext'
  | 'focusFigure'
  | 'stepPrevious'
  | 'stepNext'
  | 'stepJump'
  | 'lead'
  | 'follow'
  | 'both'
  | 'settings'
  | 'help'
  | 'practice';

export type ShortcutGroup = 'Find' | 'Figures' | 'Steps' | 'Part' | 'General';

// The dialog's sections, in order.
export const SHORTCUT_GROUPS: ShortcutGroup[] = ['Find', 'Figures', 'Steps', 'Part', 'General'];

// What decides whether a shortcut is on offer right now.
export interface ShortcutContext {
  hasFigure: boolean;
  practiceEnabled: boolean;
}

export interface Shortcut {
  id: ShortcutId;
  // `KeyboardEvent.key` values; single letters in lower case.
  keys: readonly string[];
  // How the dialog draws the keys, when not as they are.
  display?: readonly string[];
  description: string;
  group: ShortcutGroup;
  // Only while focus is on the figure list: elsewhere the key scrolls.
  inList?: boolean;
  // Also while typing in a field.
  whileTyping?: boolean;
  // Not while a button or link has focus, which the key would press.
  yieldsToControls?: boolean;
  // Offered only when this holds; always, if absent.
  when?(context: ShortcutContext): boolean;
}

const hasFigure = ({ hasFigure: open }: ShortcutContext) => open;

export const SHORTCUTS: readonly Shortcut[] = [
  { id: 'search', keys: ['/'], description: 'Search the figures', group: 'Find' },
  {
    id: 'escape',
    keys: ['Escape'],
    display: ['Esc'],
    description: 'Clear search, then back to the list',
    group: 'Find',
    whileTyping: true,
  },
  {
    id: 'listPrevious',
    keys: ['ArrowUp'],
    display: ['↑'],
    description: 'Open the previous figure in the list',
    group: 'Figures',
    inList: true,
  },
  {
    id: 'listNext',
    keys: ['ArrowDown'],
    display: ['↓'],
    description: 'Open the next figure in the list',
    group: 'Figures',
    inList: true,
  },
  { id: 'figurePrevious', keys: ['['], description: 'Previous figure', group: 'Figures' },
  { id: 'figureNext', keys: [']'], description: 'Next figure', group: 'Figures' },
  {
    id: 'focusFigure',
    keys: ['Enter'],
    description: 'Move to the open figure',
    group: 'Figures',
    yieldsToControls: true,
    when: hasFigure,
  },
  { id: 'stepPrevious', keys: ['k'], description: 'Previous step', group: 'Steps', when: hasFigure },
  { id: 'stepNext', keys: ['j'], description: 'Next step', group: 'Steps', when: hasFigure },
  {
    id: 'stepJump',
    keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    display: ['1-9'],
    description: 'Go to that step',
    group: 'Steps',
    when: hasFigure,
  },
  { id: 'lead', keys: ['l'], description: 'Show Lead', group: 'Part', when: hasFigure },
  { id: 'follow', keys: ['f'], description: 'Show Follow', group: 'Part', when: hasFigure },
  { id: 'both', keys: ['b'], description: 'Show both side by side', group: 'Part', when: hasFigure },
  { id: 'settings', keys: [','], description: 'Open Settings', group: 'General' },
  { id: 'help', keys: ['?'], description: 'Show the keyboard shortcuts', group: 'General' },
  {
    id: 'practice',
    keys: ['p'],
    description: 'Practice the open figure',
    group: 'General',
    when: ({ hasFigure: open, practiceEnabled }) => open && practiceEnabled,
  },
];

// What the matcher needs to know of a key press.
export interface KeyPress {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  // Typing in a field.
  typing: boolean;
  // Focus is on a row of the figure list.
  inList: boolean;
  // Focus is on a button, link or the like.
  onControl: boolean;
  // Settings or another dialog is open.
  overlayOpen: boolean;
}

// A letter is the same key with Caps Lock on or Shift held.
const normalizeKey = (key: string) => (key.length === 1 ? key.toLowerCase() : key);

// The shortcut a key press triggers, if any: none while a modifier is held,
// while a dialog is open, while typing (bar the few that say so), or when
// the shortcut is not on offer.
export function matchShortcut(press: KeyPress, context: ShortcutContext): Shortcut | null {
  if (press.ctrlKey || press.metaKey || press.altKey || press.overlayOpen) return null;
  const key = normalizeKey(press.key);
  const shortcut = SHORTCUTS.find((s) => s.keys.includes(key));
  if (!shortcut) return null;
  if (press.typing && !shortcut.whileTyping) return null;
  if (shortcut.inList && !press.inList) return null;
  if (shortcut.yieldsToControls && press.onControl) return null;
  if (shortcut.when && !shortcut.when(context)) return null;
  return shortcut;
}

export interface ShortcutSection {
  group: ShortcutGroup;
  shortcuts: Shortcut[];
}

// What the dialog lists: the shortcuts on offer, by group.
export function shortcutSections(context: ShortcutContext): ShortcutSection[] {
  const offered = SHORTCUTS.filter((s) => !s.when || s.when(context));
  return SHORTCUT_GROUPS.map((group) => ({ group, shortcuts: offered.filter((s) => s.group === group) })).filter(
    (section) => section.shortcuts.length > 0,
  );
}
