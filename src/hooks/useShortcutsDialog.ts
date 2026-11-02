import { useSyncExternalStore } from 'react';

// Whether the keyboard shortcuts dialog is up. Shared by whatever opens it
// (the `?` key, a row in Settings) and the dialog itself, which sits beside
// the app's other overlays rather than inside any one screen.
let isOpen = false;
const listeners = new Set<() => void>();

const set = (next: boolean) => {
  if (isOpen === next) return;
  isOpen = next;
  listeners.forEach((listener) => listener());
};

const show = () => set(true);
const hide = () => set(false);

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => isOpen;

export function useShortcutsDialog() {
  const open = useSyncExternalStore(subscribe, getSnapshot);
  return { open, show, hide };
}
