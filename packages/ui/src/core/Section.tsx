import React, { forwardRef } from 'react';
import { FocusContext, useFocusable, UseFocusableConfig } from '../hooks';

type SectionProps = {
  children?: React.ReactNode;
  className?: string;
  focusKey?: string;
  selfFocus?: boolean;
  onEnterPress?: () => void;
  onFocus?: (layout?: any) => void;
  onBlur?: (layout?: any) => void;
  trackChildren?: boolean;
  saveLastFocusedChild?: boolean;
} & Partial<UseFocusableConfig>;

// Section for grouping TV UI elements and providing a FocusContext
export const Section = forwardRef<HTMLDivElement, SectionProps>(function Section(
  {
    children,
    className = '',
    focusKey,
    selfFocus = false,
    onEnterPress,
    onFocus,
    onBlur,
    trackChildren = true,
    saveLastFocusedChild = true,
    ...rest
  },
  ref
) {
  // useFocusable returns a ref and focus helpers for the section
  const { ref: innerRef, focusKey: providedFocusKey, focusSelf, focused } =
    useFocusable({
      focusKey,
      focusable: true,
      trackChildren,
      saveLastFocusedChild,
      onEnterPress,
      onFocus,
      onBlur,
      ...rest,
    } as UseFocusableConfig);

  // merge forwarded ref and internal ref
  React.useImperativeHandle(ref, () => innerRef.current, [innerRef]);

  // Provide the focus key to descendants
  return (
    <FocusContext.Provider value={providedFocusKey}>
      <section
        ref={innerRef as any}
        className={`tv-section ${className} ${focused ? 'focused' : ''}`}
        tabIndex={0}
      >
        {children}
      </section>
    </FocusContext.Provider>
  );
});

Section.displayName = 'Section';
