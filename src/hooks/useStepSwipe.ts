import { useCallback, useEffect, useRef, type RefObject, type TouchEvent } from 'react';

// Movement before a touch commits to an axis, so a slightly diagonal
// vertical scroll never starts dragging the step sideways.
const AXIS_LOCK_PX = 8;
// A drag past this fraction of the viewport's width changes step...
const COMMIT_FRACTION = 0.22;
// ...as does a quick flick, however short.
const FLICK_MS = 250;
const FLICK_PX = 35;
// How much of the drag carries through when there's no step that way.
const EDGE_RESISTANCE = 0.3;

interface DragState {
  x: number;
  y: number;
  t: number;
  axis: 'x' | 'y' | null;
  dx: number;
}

interface UseStepSwipeOptions {
  // 0-based current step and the number of steps.
  index: number;
  total: number;
  onChange(next: number): void;
  // The element the gesture is measured against (its width sets the commit distance).
  bodyRef: RefObject<HTMLElement | null>;
  // The element that follows the finger.
  slideRef: RefObject<HTMLElement | null>;
  // ArrowLeft / ArrowRight change step too. Default true.
  keys?: boolean;
}

const isEditable = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

// Swipe left or right to change step, with the step following the finger,
// plus the arrow keys. Returns the touch handlers to spread on the scroller.
export function useStepSwipe({ index, total, onChange, bodyRef, slideRef, keys = true }: UseStepSwipeOptions) {
  const drag = useRef<DragState | null>(null);

  // The handlers read the latest values through a ref so the window key
  // listener and the touch callbacks never go stale.
  const latest = useRef({ index, total, onChange });
  useEffect(() => {
    latest.current = { index, total, onChange };
  });

  const setSlideOffset = useCallback(
    (px: number, animate: boolean) => {
      const el = slideRef.current;
      if (!el) return;
      el.style.transition = animate ? 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none';
      el.style.transform = px === 0 ? '' : `translateX(${px}px)`;
    },
    [slideRef],
  );

  const goTo = useCallback((next: number) => {
    const { index: current, total: count, onChange: change } = latest.current;
    if (next < 0 || next >= count || next === current) return;
    change(next);
  }, []);

  useEffect(() => {
    if (!keys) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      if (isEditable(e.target) || document.querySelector('dialog[open]')) return;
      goTo(latest.current.index + (e.key === 'ArrowRight' ? 1 : -1));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [keys, goTo]);

  const onTouchStart = useCallback((e: TouchEvent) => {
    const t = e.touches[0];
    drag.current = { x: t.clientX, y: t.clientY, t: e.timeStamp, axis: null, dx: 0 };
  }, []);

  // The step follows the finger, so the gesture shows what it will do
  // before you let go.
  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.touches[0].clientX - d.x;
      const dy = e.touches[0].clientY - d.y;
      if (!d.axis) {
        if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
        d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
      if (d.axis !== 'x') return;
      const { index: current, total: count } = latest.current;
      const atEdge = (dx < 0 && current === count - 1) || (dx > 0 && current === 0);
      d.dx = atEdge ? dx * EDGE_RESISTANCE : dx;
      setSlideOffset(d.dx, false);
    },
    [setSlideOffset],
  );

  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      const d = drag.current;
      drag.current = null;
      if (!d || d.axis !== 'x') return;

      const width = bodyRef.current?.clientWidth ?? 320;
      const elapsed = e.timeStamp - d.t;
      const target = latest.current.index + (d.dx < 0 ? 1 : -1);
      const farEnough = Math.abs(d.dx) > width * COMMIT_FRACTION;
      const flicked = elapsed < FLICK_MS && Math.abs(d.dx) > FLICK_PX;

      if ((farEnough || flicked) && target >= 0 && target < latest.current.total) {
        goTo(target);
      } else {
        setSlideOffset(0, true);
      }
    },
    [bodyRef, goTo, setSlideOffset],
  );

  const onTouchCancel = useCallback(() => {
    drag.current = null;
    setSlideOffset(0, true);
  }, [setSlideOffset]);

  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel };
}
