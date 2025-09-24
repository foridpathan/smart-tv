import React, { ElementType, forwardRef, useEffect, useImperativeHandle } from 'react';
import { FocusContext, useFocusable, UseFocusableConfig } from '../hooks';
import { cn } from '../utils';

interface ScreenProps extends UseFocusableConfig {
  children: React.ReactNode;
  className?: string;
  selFocus?: boolean; // when true, focus this screen on mount
  as?: ElementType; // allow different root element
}

// Forward a DOM element ref (HTMLElement) instead of ReactNode to ensure
// consumers get a usable element ref and declaration files emit correct types.
export const Screen = forwardRef<HTMLElement, ScreenProps>(
  ({ children, className = '', selFocus, as: Tag = 'section', ...props }, ref) => {
    const { ref: internalRef, focusKey, focusSelf } = useFocusable(props as UseFocusableConfig);

    // forward the underlying DOM element to parent refs
    useImperativeHandle(ref, (): HTMLElement => {
      // assert non-null for typing; consumers should still check for null at runtime
      return internalRef.current as HTMLElement;
    }, [internalRef]);

    useEffect(() => {
      if (selFocus) {
        focusSelf();
      }
    }, [selFocus, focusSelf]);

    const Element = Tag as ElementType;

    const style: React.CSSProperties = {
      marginRight: 'calc(var(--ui-collapsed-width, 0px) * -1)',
    };

    return (
      <FocusContext.Provider value={focusKey}>
        <Element
          ref={internalRef as any}
          className={cn('ui-h-screen ui-overflow-hidden', className)}
          style={style}>{children}</Element>
      </FocusContext.Provider>
    );
  }
);

Screen.displayName = 'Screen';
