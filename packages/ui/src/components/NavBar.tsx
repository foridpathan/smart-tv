import React from 'react';

// TV navigation bar
export const NavBar = ({ children }: { children: React.ReactNode }) => {
  // TODO: Add focus navigation for TV
  return <nav className="tv-navbar">{children}</nav>;
};
