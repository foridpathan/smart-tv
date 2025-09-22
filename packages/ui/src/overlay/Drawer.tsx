import React from 'react';

// TV drawer component
export const Drawer = ({ open, children, onClose }: {
  open: boolean;
  children: React.ReactNode;
  onClose?: () => void;
}) => {
  // TODO: Add remote navigation for drawer
  if (!open) return null;
  return (
    <aside className="tv-drawer">
      <div>{children}</div>
      <button tabIndex={0} onClick={onClose}>Close</button>
    </aside>
  );
};
