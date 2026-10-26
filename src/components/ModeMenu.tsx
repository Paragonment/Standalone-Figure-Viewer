import React, { useEffect, useId, useRef, useState } from 'react';
import { DETAIL_MODES, type DetailMode } from '../utils/detailModes';
import './ModeMenu.css';

interface ModeMenuProps {
  figureName: string;
  mode: DetailMode;
  setMode: (mode: DetailMode) => void;
}

// The figure's title in the top bar doubles as the viewing-mode picker
// (the iOS "title menu" pattern): the name, with the current mode beneath
// it, opens a short menu of modes. Switching modes is occasional, so it
// earns no permanent screen space, and the name keeps the full title width
// instead of sharing it with another button.
const ModeMenu: React.FC<ModeMenuProps> = ({ figureName, mode, setMode }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const current = DETAIL_MODES.find((m) => m.id === mode) ?? DETAIL_MODES[0];

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Document listeners run before window ones, so this keeps the same
      // Escape from also closing the figure.
      e.stopPropagation();
      setOpen(false);
      rootRef.current?.querySelector<HTMLButtonElement>('.mode-menu-trigger')?.focus();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Move focus into the menu on open so keyboard users land on a choice.
  useEffect(() => {
    if (open) rootRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
  }, [open]);

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'));
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[next].focus();
  };

  return (
    <div className="mode-menu" ref={rootRef}>
      <button
        type="button"
        className="mode-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
        title={figureName}
      >
        <span className="mode-menu-name" aria-current="page">{figureName}</span>
        <span className="mode-menu-current">
          {current.label}
          <span className="mode-menu-caret" aria-hidden="true">▾</span>
        </span>
      </button>

      {open && (
        <div className="mode-menu-list" role="menu" id={menuId} aria-label="Viewing mode" onKeyDown={handleMenuKeyDown}>
          {/* The bar truncates long names; here the full name gets room. */}
          <div className="mode-menu-heading" role="presentation">{figureName}</div>
          {DETAIL_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="menuitemradio"
              aria-checked={m.id === mode}
              className="mode-menu-item"
              onClick={() => {
                setMode(m.id);
                setOpen(false);
              }}
            >
              <span className="mode-menu-item-icon" aria-hidden="true">{m.icon}</span>
              <span className="mode-menu-item-text">
                <span className="mode-menu-item-label">{m.label}</span>
                <span className="mode-menu-item-desc">{m.description}</span>
              </span>
              <span className="mode-menu-item-check" aria-hidden="true">{m.id === mode ? '✓' : ''}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModeMenu;
