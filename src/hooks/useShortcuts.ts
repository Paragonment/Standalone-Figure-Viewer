import { useCallback, useEffect, useRef, type RefObject } from 'react';
import type { FigureGroup } from '../types';
import { useSettings } from '../state/useSettings';
import { figureKey } from '../utils/figureKey';
import { figureRoute } from '../utils/route';
import { matchShortcut, type ShortcutContext, type ShortcutId } from '../utils/shortcuts';
import { usePartChoice } from './usePartChoice';
import { usePracticeEnabled } from './usePracticeEnabled';
import { useRoute } from './useRoute';
import { useShortcutsDialog } from './useShortcutsDialog';

// What the open figure lets the keyboard do. DesktopFigure registers it
// while it is mounted: the step scroll lives in the figure, the listener
// above it.
export interface FigureControls {
  stepCount: number;
  currentStep: number;
  goToStep(n: number): void;
  keepPlace(): void;
  focusHeading(): void;
}

export interface ShortcutsHost {
  // The figures in the order the list shows them.
  figures: FigureGroup[];
  // The open figure, if any.
  figure: FigureGroup | null;
  // Practice is open over the window; Escape closes it.
  practiceOpen: boolean;
  closePractice(): void;
  searchRef: RefObject<HTMLInputElement | null>;
  listRef: RefObject<HTMLElement | null>;
  figureControlsRef: RefObject<FigureControls | null>;
  setSearchTerm(term: string): void;
  // Says something to a screen reader, without moving focus.
  announce(message: string): void;
}

const CONTROL_SELECTOR = 'button, a[href], summary, select, [role="button"]';
const EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';

const isEditable = (el: Element | null) => el !== null && el.closest(EDITABLE_SELECTOR) !== null;

// A row of the list that is the open figure keeps Enter for the shortcut.
const isControl = (el: Element | null) =>
  el !== null && el.closest(CONTROL_SELECTOR) !== null && el.closest('[aria-current="true"]') === null;

// Listens for the shortcuts of utils/shortcuts and runs what each one does.
// Mounted once, by the wide layout.
export function useShortcuts(host: ShortcutsHost) {
  const { figure, figureControlsRef } = host;
  const route = useRoute();
  const { openSettings } = useSettings();
  const dialog = useShortcutsDialog();
  const practiceEnabled = usePracticeEnabled();
  const keepPlace = useCallback(() => figureControlsRef.current?.keepPlace(), [figureControlsRef]);
  const { pickRole, pickSideBySide } = usePartChoice(keepPlace);

  const focusList = () => {
    const rows = host.listRef.current;
    const row = rows?.querySelector<HTMLElement>('.fl-row[aria-current="true"]') ?? rows?.querySelector<HTMLElement>('.fl-row');
    row?.focus();
  };

  // One step along the list, from the open figure; from none, its first or last.
  const browse = (delta: 1 | -1) => {
    const { figures } = host;
    const at = host.figure ? figures.findIndex((f) => figureKey(f) === figureKey(host.figure!)) : -1;
    const next = at === -1 ? (delta > 0 ? figures[0] : figures[figures.length - 1]) : figures[at + delta];
    if (!next) return;
    route.browse(figureRoute(next));
    host.announce(`${next.name}, ${next.dance}, ${next.level}`);
  };

  const step = (to: (controls: FigureControls) => number) => {
    const controls = host.figureControlsRef.current;
    if (!controls) return;
    const n = to(controls);
    if (n >= 1 && n <= controls.stepCount) controls.goToStep(n);
  };

  const actions: Record<ShortcutId, (key: string) => void> = {
    search: () => {
      host.searchRef.current?.focus();
      host.searchRef.current?.select();
    },
    escape: () => {
      if (host.practiceOpen) {
        host.closePractice();
        return;
      }
      const input = host.searchRef.current;
      if (input && document.activeElement === input && input.value) {
        host.setSearchTerm('');
        return;
      }
      focusList();
    },
    listPrevious: () => browse(-1),
    listNext: () => browse(1),
    figurePrevious: () => browse(-1),
    figureNext: () => browse(1),
    focusFigure: () => host.figureControlsRef.current?.focusHeading(),
    stepPrevious: () => step((c) => c.currentStep - 1),
    stepNext: () => step((c) => c.currentStep + 1),
    stepJump: (key) => step(() => Number(key)),
    lead: () => pickRole('lead'),
    follow: () => pickRole('follow'),
    both: () => pickSideBySide(true),
    settings: () => openSettings(figure?.style),
    help: dialog.show,
    practice: route.openPractice,
  };

  // The listener is added once and reads the latest of everything through this.
  const context: ShortcutContext = { hasFigure: figure !== null, practiceEnabled, practiceOpen: host.practiceOpen };
  const latest = useRef({ actions, context });
  useEffect(() => {
    latest.current = { actions, context };
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing) return;
      const target = e.target instanceof Element ? e.target : null;
      const shortcut = matchShortcut(
        {
          key: e.key,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          altKey: e.altKey,
          typing: isEditable(target),
          inList: target?.closest('.fl') != null,
          onControl: isControl(target),
          overlayOpen: document.querySelector('dialog[open]') !== null,
        },
        latest.current.context,
      );
      if (!shortcut) return;
      e.preventDefault();
      latest.current.actions[shortcut.id](e.key);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
