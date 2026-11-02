import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll behavior of the Home screen: one scroll container holds the
// header (title, search, filters), the sticky count bar and the list.
//
// - `stuck` turns true once the header has scrolled away and the count bar
//   rests at the top, where it becomes the compact banner.
// - The offset is kept in `scrollTopRef`, so coming back from a figure
//   lands where the reader left off.
// - Whenever `resetKey` changes (filters, query) the list starts again from
//   its first row; the header stays where it is.
// - `pinned`: the header sits outside the scroller, so nothing scrolls away
//   and the bar never turns into the compact banner.
export function useHomeScroll(scrollTopRef: RefObject<number>, resetKey: string, pinned = false) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const lastResetKey = useRef(resetKey);
  const [stuck, setStuck] = useState(false);

  // The scroll offset at which the count bar reaches the top.
  const listTop = useCallback(() => {
    const header = headerRef.current;
    return header && !pinned ? header.offsetTop + header.offsetHeight : 0;
  }, [pinned]);

  const onScroll = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    scrollTopRef.current = scroller.scrollTop;
    setStuck(!pinned && scroller.scrollTop >= listTop());
  }, [scrollTopRef, listTop, pinned]);

  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollTopRef.current;
  }, [scrollTopRef]);

  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    if (lastResetKey.current === resetKey || !scroller) return;
    lastResetKey.current = resetKey;
    scroller.scrollTop = Math.min(scroller.scrollTop, listTop());
  }, [resetKey, listTop]);

  // Back up to the search field and filters.
  const scrollToTop = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    if (prefersReducedMotion()) scroller.scrollTop = 0;
    else scroller.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { scrollRef, headerRef, stuck, onScroll, scrollToTop };
}
