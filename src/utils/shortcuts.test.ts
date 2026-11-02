import { describe, expect, it } from 'vitest';
import { SHORTCUTS, matchShortcut, shortcutSections, type KeyPress, type ShortcutContext } from './shortcuts';

const press = (key: string, extra: Partial<KeyPress> = {}): KeyPress => ({
  key,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  typing: false,
  inList: false,
  onControl: false,
  overlayOpen: false,
  ...extra,
});

const open: ShortcutContext = { hasFigure: true, practiceEnabled: false };
const none: ShortcutContext = { hasFigure: false, practiceEnabled: false };

const idOf = (key: string, extra: Partial<KeyPress> = {}, context = open) => matchShortcut(press(key, extra), context)?.id;

describe('the table', () => {
  it('gives every shortcut a distinct id and no key twice', () => {
    expect(new Set(SHORTCUTS.map((s) => s.id)).size).toBe(SHORTCUTS.length);
    const keys = SHORTCUTS.flatMap((s) => s.keys);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('matchShortcut', () => {
  it('finds a shortcut by its key', () => {
    expect(idOf('/')).toBe('search');
    expect(idOf('[')).toBe('figurePrevious');
    expect(idOf(']')).toBe('figureNext');
    expect(idOf('j')).toBe('stepNext');
    expect(idOf('k')).toBe('stepPrevious');
    expect(idOf(',')).toBe('settings');
    expect(idOf('?')).toBe('help');
  });

  it('takes 1 to 9 as one shortcut and ignores 0', () => {
    for (const digit of '123456789') expect(idOf(digit)).toBe('stepJump');
    expect(idOf('0')).toBeUndefined();
  });

  it('reads letters the same with Caps Lock or Shift', () => {
    expect(idOf('J')).toBe('stepNext');
    expect(idOf('L')).toBe('lead');
  });

  it('ignores keys it does not know', () => {
    expect(idOf('x')).toBeUndefined();
    expect(idOf('Tab')).toBeUndefined();
  });

  it('ignores a key pressed with Ctrl, Meta or Alt', () => {
    for (const modifier of ['ctrlKey', 'metaKey', 'altKey'] as const) {
      expect(idOf('/', { [modifier]: true })).toBeUndefined();
      expect(idOf('j', { [modifier]: true })).toBeUndefined();
    }
  });

  it('ignores everything while a dialog is open', () => {
    expect(idOf('/', { overlayOpen: true })).toBeUndefined();
    expect(idOf('Escape', { overlayOpen: true })).toBeUndefined();
  });

  it('ignores letters typed into a field, but not Escape', () => {
    expect(idOf('j', { typing: true })).toBeUndefined();
    expect(idOf('/', { typing: true })).toBeUndefined();
    expect(idOf('1', { typing: true })).toBeUndefined();
    expect(idOf('Escape', { typing: true })).toBe('escape');
  });

  it('moves the selection with the arrows only from the list', () => {
    expect(idOf('ArrowDown')).toBeUndefined();
    expect(idOf('ArrowDown', { inList: true })).toBe('listNext');
    expect(idOf('ArrowUp', { inList: true })).toBe('listPrevious');
  });

  it('leaves Enter to a control that has focus', () => {
    expect(idOf('Enter')).toBe('focusFigure');
    expect(idOf('Enter', { onControl: true })).toBeUndefined();
  });

  it('offers figure shortcuts only with a figure open', () => {
    for (const key of ['Enter', 'j', 'k', '3', 'l', 'f', 'b']) expect(idOf(key, {}, none)).toBeUndefined();
    expect(idOf('/', {}, none)).toBe('search');
    expect(idOf('[', {}, none)).toBe('figurePrevious');
  });

  it('offers Practice only when it is enabled', () => {
    expect(idOf('p')).toBeUndefined();
    expect(idOf('p', {}, { hasFigure: true, practiceEnabled: true })).toBe('practice');
    expect(idOf('p', {}, { hasFigure: false, practiceEnabled: true })).toBeUndefined();
  });
});

describe('shortcutSections', () => {
  it('lists the groups in order, with what is on offer', () => {
    const sections = shortcutSections(open);
    expect(sections.map((s) => s.group)).toEqual(['Find', 'Figures', 'Steps', 'Part', 'General']);
    const ids = sections.flatMap((s) => s.shortcuts.map((x) => x.id));
    expect(ids).not.toContain('practice');
    expect(shortcutSections({ hasFigure: true, practiceEnabled: true }).flatMap((s) => s.shortcuts.map((x) => x.id))).toContain(
      'practice',
    );
  });
});
