import React, { forwardRef } from 'react';
import { FocusContext, useFocusable, UseFocusableConfig } from '../hooks';

type NavbarProps = {
  children?: React.ReactNode;
  className?: string;
  focusKey?: string;
  trackChildren?: boolean;
  saveLastFocusedChild?: boolean;
} & Partial<UseFocusableConfig>;

export const Navbar = forwardRef<HTMLElement, NavbarProps>(function Navbar(
  { children, className = '', focusKey, trackChildren = true, saveLastFocusedChild = true, ...rest },
  ref
) {
  const { ref: innerRef, focusKey: providedFocusKey, focused } = useFocusable({
    focusKey,
    focusable: true,
    trackChildren,
    saveLastFocusedChild,
    ...rest,
  } as UseFocusableConfig);

  React.useImperativeHandle(ref, () => innerRef.current, [innerRef]);

  return (
    <FocusContext.Provider value={providedFocusKey}>
      <nav ref={innerRef as any} className={`tv-navbar ${className} ${focused ? 'focused' : ''}`}>
        {children}
      </nav>
    </FocusContext.Provider>
  );
});

Navbar.displayName = 'Navbar';
