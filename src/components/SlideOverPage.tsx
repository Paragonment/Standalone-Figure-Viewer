import React, { useEffect, useId, useRef, useState } from 'react';
import { clearSwipe, useSwipeBack } from '../hooks/useSwipeBack';
import TopBar from './ui/TopBar';
import './SlideOverPage.css';

interface SlideOverPageProps {
  open: boolean;
  onClose: () => void;
  title: string;
  backLabel?: string;
  children: React.ReactNode;
}

// A page that slides in from the right over whichever screen is showing,
// and leaves the way it came: Back, a swipe right anywhere on it, Escape,
// or a tap on the dimmed screen beside it where the window is wide.
// Built on a native modal <dialog>: focus trapping and rendering above
// everything else come from the browser instead of hand-rolled code.
const SlideOverPage: React.FC<SlideOverPageProps> = ({ open, onClose, title, backLabel = 'Back', children }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const [scrolled, setScrolled] = useState(false);

  // The swipe closes through `open`, like every other way out, so the
  // close below finds the page already off screen and skips its slide.
  const { handlers, slide } = useSwipeBack({ ref: dialogRef, widthRef: panelRef, onBack: onClose });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) {
        dialog.showModal();
        // Start focus on the page itself rather than letting the browser
        // pick its first control, which would then be one Enter press
        // from changing.
        panelRef.current?.focus();
        // Start off screen, then slide in.
        slide(1, false);
        void dialog.offsetWidth;
      }
      // Also turns back a close that is still sliding out.
      slide(0, true);
    } else if (dialog.open) {
      const away = () => {
        dialog.close();
        clearSwipe(dialog);
        setScrolled(false);
      };
      if (dialog.style.getPropertyValue('--swipe') === '1') away();
      else slide(1, true, away);
    }
  }, [open, slide]);

  return (
    <dialog
      ref={dialogRef}
      className="slide-page"
      aria-labelledby={titleId}
      onCancel={(e) => {
        // Escape: let React state drive the close so it slides out.
        e.preventDefault();
        onClose();
      }}
      onClose={() => {
        // Covers any close the browser does on its own, so `open` can
        // never claim the page is up while it's actually gone.
        if (open) onClose();
      }}
      {...handlers}
    >
      <div className="slide-page-scrim" aria-hidden="true" onClick={onClose} />
      <div className="slide-page-panel" ref={panelRef} tabIndex={-1}>
        <TopBar
          backLabel={backLabel}
          showBackLabel={!scrolled}
          onBack={onClose}
          title={title}
          titleVisible={scrolled}
          ruleVisible={scrolled}
          showMenu={false}
        />
        <div
          className="slide-page-body"
          onScroll={(e) => {
            const heading = titleRef.current;
            const edge = heading ? heading.offsetTop + heading.offsetHeight : 48;
            setScrolled(e.currentTarget.scrollTop >= edge);
          }}
        >
          <h2 ref={titleRef} className="slide-page-title" id={titleId}>
            {title}
          </h2>
          {children}
        </div>
      </div>
    </dialog>
  );
};

export default SlideOverPage;
