import React, { forwardRef } from 'react';
import { FocusContext, useFocusable, UseFocusableConfig } from '../hooks';

type SectionProps = {
  children?: React.ReactNode;
  className?: string;
  focusKey?: string;
  viewOnly?: boolean;
  selfFocus?: boolean;
  onEnterPress?: () => void;
  onFocus?: (layout?: any) => void;
  onBlur?: (layout?: any) => void;
  trackChildren?: boolean;
  saveLastFocusedChild?: boolean;
  style?: React.CSSProperties;
} & Partial<UseFocusableConfig>;

// Section for grouping TV UI elements and providing a FocusContext
export const Section = forwardRef<HTMLDivElement, SectionProps>(function Section(
  {
    children,
    className = '',
    focusKey,
    viewOnly = false,
    onEnterPress,
    onFocus,
    onBlur,
    trackChildren = true,
    saveLastFocusedChild = true,
    style,
    ...rest
  },
  ref
) {
  // useFocusable returns a ref and focus helpers for the section
  const { ref: innerRef, focusKey: providedFocusKey, focused } =
    useFocusable({
      focusKey,
      focusable: !viewOnly,
      trackChildren,
      saveLastFocusedChild,
      onEnterPress,
      onFocus,
      onBlur,
      ...rest,
    } as UseFocusableConfig);

  // If the hook didn't generate a focus key (eg. viewOnly), fall back to the
  // explicit prop so descendants still receive a value.
  const providerValue = providedFocusKey ?? focusKey;

  // merge forwarded ref and internal ref
  React.useImperativeHandle(ref, () => innerRef.current, [innerRef]);

  // Provide the focus key to descendants
  return (
    <FocusContext.Provider value={providerValue}>
      <section
        ref={innerRef as any}
        className={`tv-section focus-visible:ui-outline-none ${className} ${focused ? 'focused' : ''}`}
        tabIndex={0}
        style={style}
      >
        {children}
      </section>
    </FocusContext.Provider>
  );
});

Section.displayName = 'Section';
