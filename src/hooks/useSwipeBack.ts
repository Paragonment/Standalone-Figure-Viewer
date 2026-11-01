import { useCallback, useEffect, useRef, type MouseEvent, type RefObject, type TouchEvent } from 'react';

// Movement before a touch commits to an axis, so a slightly diagonal
// vertical scroll never starts dragging the screen sideways.
const AXIS_LOCK_PX = 8;
// Let go past this fraction of the width and the screen goes back...
const COMMIT_FRACTION = 0.35;
// ...as it does when flicked right at least this fast (px per ms) and this
// far, however short the drag. A flick back left keeps it, however far.
const FLICK_SPEED = 0.4;
const FLICK_PX = 30;
// The flick speed is measured over the end of the drag only.
const VELOCITY_WINDOW_MS = 100;
// A click this soon after a drag ends is the drag's own, not a tap.
const CLICK_AFTER_DRAG_MS = 400;
// Matches the transitions on [data-swipe='settle'] in the CSS.
export const SWIPE_SETTLE_MS = 250;

interface Sample {
  x: number;
  t: number;
}

interface DragState {
  x: number;
  y: number;
  axis: 'x' | 'y' | null;
  samples: Sample[];
}

interface UseSwipeBackOptions {
  // Carries the swipe for the CSS to follow: `--swipe`, from 0 (in place) to
  // 1 (swiped fully off to the right), and `data-swipe` while it is not at
  // rest: 'drag' follows the finger, 'settle' animates.
  ref: RefObject<HTMLElement | null>;
  // The element whose width is a full swipe. Defaults to `ref`.
  widthRef?: RefObject<HTMLElement | null>;
  // Called once the screen has slid all the way off.
  onBack(): void;
  enabled?: boolean;
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Puts the element back at rest, as if it had never been swiped.
export function clearSwipe(el: HTMLElement) {
  delete el.dataset.swipe;
  el.style.removeProperty('--swipe');
}

// Swipe right anywhere to go back, with the screen following the finger.
// Returns the handlers to spread on the swiped element, and `slide` to move
// it from code (opening and closing animations).
export function useSwipeBack({ ref, widthRef, onBack, enabled = true }: UseSwipeBackOptions) {
  const drag = useRef<DragState | null>(null);
  // When the last drag ended, so one ending over a button doesn't also press it.
  const dragEnded = useRef(-Infinity);
  const timer = useRef<number | undefined>(undefined);

  const latest = useRef({ onBack, enabled });
  useEffect(() => {
    latest.current = { onBack, enabled };
  });

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Moves to `progress`, animated or not, then calls `then`. Coming to rest
  // at 0 clears the swipe; anywhere else it stays until clearSwipe.
  const slide = useCallback(
    (progress: number, animate: boolean, then?: () => void) => {
      const el = ref.current;
      window.clearTimeout(timer.current);
      if (!el) return;
      if (progress === 0 && !animate) {
        clearSwipe(el);
        then?.();
        return;
      }
      el.dataset.swipe = animate ? 'settle' : 'drag';
      el.style.setProperty('--swipe', String(progress));
      if (!animate) {
        then?.();
        return;
      }
      timer.current = window.setTimeout(
        () => {
          if (progress === 0) clearSwipe(el);
          then?.();
        },
        reducedMotion() ? 0 : SWIPE_SETTLE_MS,
      );
    },
    [ref],
  );

  const width = useCallback(() => (widthRef ?? ref).current?.clientWidth || window.innerWidth, [ref, widthRef]);

  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      // A new touch is a new tap; its click is its own.
      dragEnded.current = -Infinity;
      if (!latest.current.enabled || e.touches.length !== 1) {
        drag.current = null;
        return;
      }
      const t = e.touches[0];
      drag.current = { x: t.clientX, y: t.clientY, axis: null, samples: [{ x: t.clientX, t: e.timeStamp }] };
    },
    [],
  );

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      const d = drag.current;
      if (!d) return;
      if (e.touches.length !== 1) {
        // A second finger: this is a pinch, not a swipe.
        drag.current = null;
        if (d.axis === 'x') slide(0, true);
        return;
      }
      const x = e.touches[0].clientX;
      const dx = x - d.x;
      const dy = e.touches[0].clientY - d.y;
      if (!d.axis) {
        if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
        d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
      if (d.axis !== 'x') return;
      d.samples.push({ x, t: e.timeStamp });
      while (d.samples.length > 2 && e.timeStamp - d.samples[0].t > VELOCITY_WINDOW_MS) d.samples.shift();
      slide(Math.min(Math.max(dx, 0) / width(), 1), false);
    },
    [slide, width],
  );

  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      const d = drag.current;
      drag.current = null;
      if (!d || d.axis !== 'x') return;
      dragEnded.current = performance.now();

      const x = e.changedTouches[0]?.clientX ?? d.samples[d.samples.length - 1].x;
      const dx = x - d.x;
      const first = d.samples[0];
      const elapsed = e.timeStamp - first.t;
      const speed = elapsed > 0 ? (x - first.x) / elapsed : 0;
      const progress = Math.min(Math.max(dx, 0) / width(), 1);

      const flickedRight = speed >= FLICK_SPEED && dx > FLICK_PX;
      const flickedLeft = speed <= -FLICK_SPEED;
      if (flickedRight || (progress > COMMIT_FRACTION && !flickedLeft)) {
        slide(1, true, () => latest.current.onBack());
      } else {
        slide(0, true);
      }
    },
    [slide, width],
  );

  const onTouchCancel = useCallback(() => {
    const d = drag.current;
    drag.current = null;
    if (d?.axis === 'x') slide(0, true);
  }, [slide]);

  const onClickCapture = useCallback((e: MouseEvent) => {
    if (performance.now() - dragEnded.current > CLICK_AFTER_DRAG_MS) return;
    dragEnded.current = -Infinity;
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return {
    handlers: { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel, onClickCapture },
    slide,
  };
}
