import React from 'react';

// Represents a screen/view in the TV app
export const Screen = ({ children }: { children: React.ReactNode }) => {
  // TODO: Add focus management for TV screens
  return <section>{children}</section>;
};
