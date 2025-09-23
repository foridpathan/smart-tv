import React, { forwardRef } from 'react';
import { FocusContext, useFocusable, UseFocusableConfig } from '../hooks';

type ColumnProps = {
  children?: React.ReactNode;
  className?: string;
  focusKey?: string;
  gap?: number | string;
  trackChildren?: boolean;
  saveLastFocusedChild?: boolean;
} & Partial<UseFocusableConfig>;

export const Column = forwardRef<HTMLDivElement, ColumnProps>(function Column(
  { children, className = '', focusKey, gap = 0, trackChildren = true, saveLastFocusedChild = true, ...rest },
  ref
) {
  const { ref: innerRef, focusKey: providedFocusKey, focusSelf, focused } = useFocusable({
    focusKey,
    focusable: true,
    trackChildren,
    saveLastFocusedChild,
    ...rest,
  } as UseFocusableConfig);

  React.useImperativeHandle(ref, () => innerRef.current, [innerRef]);

  const style = typeof gap === 'number' ? { gap: `${gap}px` } : { gap };

  return (
    <FocusContext.Provider value={providedFocusKey}>
      <div ref={innerRef as any} className={`tv-column ${className} ${focused ? 'focused' : ''}`} style={style}>
        {children}
      </div>
    </FocusContext.Provider>
  );
});

Column.displayName = 'Column';
