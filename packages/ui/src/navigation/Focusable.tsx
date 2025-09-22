import React from 'react';

// Focusable element for TV remote navigation
export const Focusable = ({ children, onFocus, onBlur }: {
  children: React.ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
}) => {
  // TODO: Add focus/blur event handling for TV
  return <div tabIndex={0}>{children}</div>;
};
