
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type SnackbarProps = {
  message: string;
  open: boolean;
  duration?: number; // ms
  onClose?: () => void;
  action?: { label: string; onClick: () => void } | null;
  placement?: 'bottom' | 'top' | 'center';
  pauseOnHover?: boolean;
};

const snackbarRootId = 'smart-tv-snackbar-root';
function getSnackbarRoot() {
  let root = document.getElementById(snackbarRootId);
  if (!root) {
    root = document.createElement('div');
    root.id = snackbarRootId;
    document.body.appendChild(root);
  }
  return root;
}

export const Snackbar = React.memo(function Snackbar({
  message,
  open,
  duration = 4000,
  onClose,
  action = null,
  placement = 'bottom',
  pauseOnHover = true,
  }: SnackbarProps) {
  const [visible, setVisible] = useState(open);
  const timer = useRef<number | null>(null);

  useEffect(() => setVisible(open), [open]);

  const clear = useCallback(() => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    clear();
    timer.current = window.setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return clear;
  }, [visible, duration, onClose, clear]);

  if (!visible) return null;

  const base = 'fixed left-1/2 transform -translate-x-1/2 z-50 max-w-lg w-[min(96%,640px)]';
  const placementClass = placement === 'top' ? 'top-6' : placement === 'center' ? 'top-1/2 -translate-y-1/2' : 'bottom-6';

  return createPortal(
    <div className={`${base} ${placementClass}`} role="status" aria-live="polite">
      <div className="flex items-center justify-between gap-4 px-4 py-2 rounded-md bg-neutral-900 text-white shadow-lg">
        <div className="text-sm truncate">{message}</div>
        {action && (
          <button
            className="ml-2 text-sm font-medium underline"
            onClick={() => { action.onClick(); onClose?.(); }}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>,
    getSnackbarRoot(),
  );
});
