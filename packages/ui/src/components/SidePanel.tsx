import React from 'react';

// TV side panel
export const SidePanel = ({ children }: { children: React.ReactNode }) => {
  // TODO: Add focus/slide logic for TV
  return <aside className="tv-side-panel">{children}</aside>;
};
