import React, { useEffect, useId, useRef } from 'react';
import './BottomSheet.css';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  doneLabel?: string;
  children: React.ReactNode;
}

// Mobile home for controls you set once and then put away (filters, which
// step fields to show), so they cost no screen space while you read.
// Built on a native modal <dialog>: focus trapping, Escape and rendering
// above everything else come from the browser instead of hand-rolled code.
const BottomSheet: React.FC<BottomSheetProps> = ({ open, onClose, title, doneLabel = 'Done', children }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // Start focus on the sheet itself rather than letting the browser pick
      // its first focusable descendant (the scroll area, or a control that
      // would then be one Enter press from changing).
      panelRef.current?.focus();
    } else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="bottom-sheet"
      aria-labelledby={titleId}
      onCancel={(e) => {
        // Escape: let React state drive the close so `open` stays in sync.
        e.preventDefault();
        onClose();
      }}
      onClose={() => {
        // Covers any close the browser does on its own, so `open` can
        // never claim the sheet is up while it's actually gone.
        if (open) onClose();
      }}
      onClick={(e) => {
        // The panel fills the dialog box, so a click landing on the dialog
        // itself can only be a click on the backdrop.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bottom-sheet-panel" ref={panelRef} tabIndex={-1}>
        <div className="bottom-sheet-handle" aria-hidden="true" />
        <h2 className="bottom-sheet-title" id={titleId}>{title}</h2>
        <div className="bottom-sheet-body">{children}</div>
        <div className="bottom-sheet-footer">
          <button type="button" className="bottom-sheet-done" onClick={onClose}>
            {doneLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default BottomSheet;
