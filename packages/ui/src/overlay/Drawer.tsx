import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const drawerRootId = 'smart-tv-drawer-root';
function getDrawerRoot() {
  let root = document.getElementById(drawerRootId);
  if (!root) {
    root = document.createElement('div');
    root.id = drawerRootId;
    document.body.appendChild(root);
  }
  return root;
}

export type DrawerProps = {
  open: boolean;
  children: React.ReactNode;
  onClose?: () => void;
  side?: 'left' | 'right';
  width?: string | number;
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
};

export const Drawer = React.memo(function Drawer({
  open,
  children,
  onClose,
  side = 'left',
  width = 360,
  closeOnEsc = true,
  closeOnBackdrop = true,
  className = '',
}: DrawerProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const prevFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    prevFocused.current = document.activeElement as HTMLElement | null;
    const focusable = ref.current?.querySelector<HTMLElement>('button, [tabindex]:not([tabindex="-1"])');
    (focusable ?? ref.current)?.focus();
    return () => prevFocused.current?.focus?.();
  }, [open]);

  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeOnEsc, onClose]);

  if (!open) return null;

  const panelStyles = typeof width === 'number' ? { width: `${width}px` } : { width };

  return createPortal(
    <div
      className={`fixed inset-0 z-40 bg-black/40 flex ${side === 'left' ? 'justify-start' : 'justify-end'} ${className}`}
      onMouseDown={(e) => closeOnBackdrop && e.target === e.currentTarget && onClose?.()}
      aria-hidden={!open}
    >
      <div
        ref={ref}
        className={`h-full bg-white dark:bg-neutral-900 shadow-lg focus:outline-none`}
        style={panelStyles}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>,
    getDrawerRoot(),
  );
});
