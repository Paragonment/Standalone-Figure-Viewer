import { useCallback, useLayoutEffect, useRef, useState } from 'react';

// How far a step must show below the frozen block to count as the current one.
const VISIBLE_SLACK = 32;
// A step picked from the strip stays current while the jump runs.
const PIN_MS = 900;

interface Anchor {
  n: number;
  top: number;
}

interface Pin {
  n: number;
  top: number;
  until: number;
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll behavior of the Figure screen: one scroll container holds the
// header, the sticky frozen block and the step rows (`li[data-n]`).
//
// - `current` is the first step still clearly showing below the frozen block.
// - `scrolled` turns true once the big title has scrolled away.
// - `goToStep` scrolls a step to just under the frozen block and pins it as
//   current while the jump runs and while the list rests there (near the end
//   the last steps cannot reach the top).
// - `keepPlace` is called right before a change that reflows the steps
//   (part, side by side); once `layoutKey` has changed the step that was at
//   the top is put back where it was.
export function useStepScroll(layoutKey: string) {
  const listRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const anchorRef = useRef<Anchor | null>(null);
  const pinRef = useRef<Pin | null>(null);
  const currentRef = useRef(1);
  const [current, setCurrent] = useState(1);
  const [scrolled, setScrolled] = useState(false);

  const rowFor = useCallback((n: number) => listRef.current?.querySelector<HTMLElement>(`li[data-n="${n}"]`) ?? null, []);

  // The first step whose bottom is more than `slack` below the frozen block.
  const firstVisible = useCallback((slack: number): Anchor | null => {
    const list = listRef.current;
    const bar = barRef.current;
    if (!list || !bar) return null;
    const line = bar.getBoundingClientRect().bottom;
    for (const row of list.querySelectorAll<HTMLElement>('li[data-n]')) {
      const box = row.getBoundingClientRect();
      if (box.bottom > line + slack) return { n: Number(row.dataset.n), top: box.top };
    }
    return null;
  }, []);

  const onScroll = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const title = titleRef.current;
    const edge = title ? title.offsetTop + title.offsetHeight : 48;
    setScrolled(list.scrollTop >= edge);

    let next = currentRef.current;
    const pin = pinRef.current;
    if (pin && (Date.now() < pin.until || Math.abs(list.scrollTop - pin.top) <= 1)) {
      next = pin.n;
    } else {
      pinRef.current = null;
      const hit = firstVisible(VISIBLE_SLACK);
      if (hit) next = hit.n;
    }
    currentRef.current = next;
    setCurrent(next);
  }, [firstVisible]);

  // The frozen block is stuck at top: -1px, so its bottom edge sits at
  // offsetHeight - 1 inside the scroller.
  const goToStep = useCallback(
    (n: number) => {
      const list = listRef.current;
      const bar = barRef.current;
      const row = rowFor(n);
      if (!list || !bar || !row) return;
      const max = list.scrollHeight - list.clientHeight;
      const top = Math.max(0, Math.min(max, row.offsetTop - (bar.offsetHeight - 1)));
      if (prefersReducedMotion()) list.scrollTop = top;
      else list.scrollTo({ top, behavior: 'smooth' });
      pinRef.current = { n, top, until: Date.now() + PIN_MS };
      currentRef.current = n;
      setCurrent(n);
    },
    [rowFor],
  );

  const keepPlace = useCallback(() => {
    const hit = firstVisible(1);
    if (hit) anchorRef.current = hit;
  }, [firstVisible]);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    anchorRef.current = null;
    const list = listRef.current;
    if (!anchor || !list) return;
    const row = rowFor(anchor.n);
    if (row) list.scrollTop += row.getBoundingClientRect().top - anchor.top;
    // A step picked from the strip stays the current one across the switch.
    if (pinRef.current) pinRef.current = { n: pinRef.current.n, top: list.scrollTop, until: 0 };
  }, [layoutKey, rowFor]);

  return { listRef, barRef, titleRef, current, scrolled, onScroll, goToStep, keepPlace };
}
