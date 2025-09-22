import React from 'react';

// TV dialog/modal
export const Dialog = ({ open, children, onClose }: {
  open: boolean;
  children: React.ReactNode;
  onClose?: () => void;
}) => {
  // TODO: Add remote navigation for dialog
  if (!open) return null;
  return (
    <div className="tv-dialog">
      <div>{children}</div>
      <button tabIndex={0} onClick={onClose}>Close</button>
    </div>
  );
};
