import React, { forwardRef } from 'react';
import { FocusContext, useFocusable, UseFocusableConfig } from '../hooks';

type GridProps = {
  children?: React.ReactNode;
  className?: string;
  focusKey?: string;
  columns?: number;
  gap?: number | string;
  trackChildren?: boolean;
  saveLastFocusedChild?: boolean;
} & Partial<UseFocusableConfig>;

export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(
  { children, className = '', focusKey, columns = 3, gap = 8, trackChildren = true, saveLastFocusedChild = true, ...rest },
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

  const style: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: typeof gap === 'number' ? `${gap}px` : gap,
  };

  return (
    <FocusContext.Provider value={providedFocusKey}>
      <div ref={innerRef as any} className={`tv-grid ${className} ${focused ? 'focused' : ''}`} style={style}>
        {children}
      </div>
    </FocusContext.Provider>
  );
});

Grid.displayName = 'Grid';
