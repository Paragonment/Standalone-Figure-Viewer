import { useMemo, useSyncExternalStore } from 'react';
import { formatRoute, homeRoute, parseRoute, type FigureRoute, type HomeRoute, type Route } from '../utils/route';

// Where the app is: the one place that reads or writes the address (see
// utils/route for its shape).
//
// - Opening a figure or Practice pushes a history entry, so Back and Forward
//   retrace what was read. Browsing from one figure to the next with the
//   keyboard replaces it instead.
// - Everything the reader adjusts in place (filters, search, part, step)
//   replaces the current entry instead, a moment after the last change.
// - Settings adds entries of its own on top (see SettingsProvider); they keep
//   the URL, so the route does not change under them.

// How the address last changed: `replace` is the app tidying its own entry,
// anything else is somewhere to go to.
export type RouteSource = 'initial' | 'push' | 'replace' | 'pop';

// Marks an entry the app pushed itself, so going back from it stays in the app.
const PUSHED = 'fvPushed';
// How long a replace waits for the next change. Also keeps clear of
// Safari's cap on how often the address may be rewritten.
const REPLACE_DELAY_MS = 250;

interface Snapshot {
  hash: string;
  source: RouteSource;
}

let snapshot: Snapshot = { hash: window.location.hash, source: 'initial' };
const listeners = new Set<() => void>();
let pending: { route: Route; timer: number } | null = null;

const emit = (source: RouteSource) => {
  snapshot = { hash: window.location.hash, source };
  listeners.forEach((listener) => listener());
};

const current = (): Route => parseRoute(window.location.hash);

const writeReplace = (route: Route) => {
  const hash = formatRoute(route);
  if (hash === window.location.hash) return;
  try {
    window.history.replaceState(window.history.state, '', hash);
  } catch {
    // The browser limits how often the address may change; the next one lands.
    return;
  }
  emit('replace');
};

const flush = () => {
  if (!pending) return;
  window.clearTimeout(pending.timer);
  const { route } = pending;
  pending = null;
  writeReplace(route);
};

const cancel = () => {
  if (!pending) return;
  window.clearTimeout(pending.timer);
  pending = null;
};

const replaceSoon = (route: Route, delay: number) => {
  cancel();
  if (delay <= 0) {
    writeReplace(route);
    return;
  }
  pending = { route, timer: window.setTimeout(flush, delay) };
};

const push = (route: Route) => {
  // A change still waiting belongs to the entry being left.
  flush();
  if (formatRoute(route) === window.location.hash) return;
  window.history.pushState({ [PUSHED]: true }, '', formatRoute(route));
  emit('push');
};

const handlePopState = () => {
  // Settings steps through entries that share the address: nothing moved.
  if (window.location.hash === snapshot.hash) return;
  // Whatever waited belonged to the entry the browser just left.
  cancel();
  emit('pop');
};

const subscribe = (listener: () => void) => {
  if (listeners.size === 0) {
    window.addEventListener('popstate', handlePopState);
    // A reload or close right after a change still keeps it.
    window.addEventListener('pagehide', flush);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pagehide', flush);
    }
  };
};

const getSnapshot = () => snapshot;

export type RoutePatch = Partial<Pick<FigureRoute, 'part' | 'step'>>;

const actions = {
  // Goes to `next` as a new history entry.
  open: push,
  // Practice for the open figure, as a new history entry.
  openPractice: () => {
    flush();
    const now = current();
    if (now.screen === 'figure') push({ ...now, screen: 'practice', step: undefined });
  },
  // Moves to another figure while browsing (the arrow keys, [ and ]): the
  // first move from the contents is a new entry, the rest replace it, so
  // stepping through the list is one stop in history, not hundreds.
  browse: (next: FigureRoute) => {
    if (current().screen === 'home') {
      push(next);
      return;
    }
    cancel();
    writeReplace(next);
  },
  // One step back: the previous entry when the app pushed this one, else (a
  // link opened here, or a reload with nothing before it) the screen above
  // this one, in place.
  goBack: (home: HomeRoute = homeRoute()) => {
    flush();
    if ((window.history.state as Record<string, unknown> | null)?.[PUSHED]) {
      window.history.back();
      return;
    }
    const now = current();
    const parent: Route = now.screen === 'practice' ? { ...now, screen: 'figure' } : home;
    window.history.replaceState(window.history.state, '', formatRoute(parent));
    emit('push');
  },
  // The list's filters and search, kept in the address of the list.
  replaceHome: (next: HomeRoute) => {
    if (current().screen === 'home') replaceSoon(next, REPLACE_DELAY_MS);
  },
  // The part or step of the open figure. Patches wait together: a later one
  // never undoes an earlier one that has not been written yet.
  replaceFigure: (patch: RoutePatch, delay = REPLACE_DELAY_MS) => {
    const base = pending?.route ?? current();
    if (base.screen === 'home') return;
    replaceSoon({ ...base, ...patch }, delay);
  },
};

export function useRoute() {
  const { hash, source } = useSyncExternalStore(subscribe, getSnapshot);
  const route = useMemo(() => parseRoute(hash), [hash]);
  return { route, source, ...actions };
}
