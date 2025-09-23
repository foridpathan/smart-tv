import React from 'react';

// TV navigation bar
export const Navbar = ({ children }: { children: React.ReactNode }) => {
  // TODO: Add focus navigation for TV
  return <nav className="tv-navbar">{children}</nav>;
};
