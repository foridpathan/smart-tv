import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Lightweight focus trap and util hooks to keep renders minimal
function useOnKey(handler: (e: KeyboardEvent) => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const fn = (e: KeyboardEvent) => handler(e);
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [handler, active]);
}

const defaultRootId = 'smart-tv-overlay-root';
function getRoot() {
  let root = document.getElementById(defaultRootId);
  if (!root) {
    root = document.createElement('div');
    root.id = defaultRootId;
    document.body.appendChild(root);
  }
  return root;
}

type DialogProps = {
  open: boolean;
  children: React.ReactNode;
  onClose?: () => void;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  ariaLabel?: string;
  className?: string;
};

// TV dialog/modal optimized for fast renders: simple structure, portal, and minimal hooks
export const Dialog = React.memo(function Dialog({
  open,
  children,
  onClose,
  closeOnBackdrop = true,
  closeOnEsc = true,
  ariaLabel,
  className = '',
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const handleClose = useCallback(() => onClose?.(), [onClose]);

  useOnKey((e) => {
    if (e.key === 'Escape' && closeOnEsc && open) handleClose();
  }, open && closeOnEsc);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const el = dialogRef.current;
    const focusable = el?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    (focusable ?? el)?.focus();

    const onFocus = (e: FocusEvent) => {
      if (!el) return;
      if (!el.contains(e.target as Node)) {
        (el.querySelector<HTMLElement>('button, [tabindex]:not([tabindex="-1"])') ?? el).focus();
      }
    };
    document.addEventListener('focus', onFocus, true);
    return () => {
      document.removeEventListener('focus', onFocus, true);
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${className}`}
      onMouseDown={(e) => closeOnBackdrop && e.target === e.currentTarget && handleClose()}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="max-w-3xl w-full mx-4 bg-white dark:bg-neutral-900 rounded-lg shadow-lg focus:outline-none"
      >
        {children}
      </div>
    </div>,
    getRoot(),
  );
});
