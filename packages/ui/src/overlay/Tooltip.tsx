
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type TooltipProps = {
  message: string;
  visible: boolean;
  delay?: number;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
};

const tooltipRootId = 'smart-tv-tooltip-root';
function getTooltipRoot() {
  let root = document.getElementById(tooltipRootId);
  if (!root) {
    root = document.createElement('div');
    root.id = tooltipRootId;
    document.body.appendChild(root);
  }
  return root;
}

export const Tooltip = React.memo(function Tooltip({ message, visible, delay = 100, placement = 'top', className = '' }: TooltipProps) {
  const [show, setShow] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (visible) {
      timer.current = window.setTimeout(() => setShow(true), delay);
    } else {
      if (timer.current) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
      setShow(false);
    }
    return () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [visible, delay]);

  if (!show) return null;

  const positionClass =
    placement === 'top'
      ? 'fixed left-1/2 top-6 transform -translate-x-1/2 -translate-y-1/2'
      : placement === 'bottom'
      ? 'fixed left-1/2 bottom-6 transform -translate-x-1/2'
      : placement === 'left'
      ? 'fixed left-6 top-1/2 -translate-y-1/2'
      : 'fixed right-6 top-1/2 -translate-y-1/2';

  const classes = `${positionClass} z-50 bg-neutral-900 text-white text-sm px-2 py-1 rounded shadow ${className}`;

  return createPortal(
    <span role="tooltip" className={classes}>{message}</span>,
    getTooltipRoot(),
  );
});
