import React, { forwardRef, useCallback, useEffect, useRef } from 'react';
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  const { ref: fRef, focusKey: providedFocusKey, focusSelf, focused } = useFocusable({
    focusKey,
    focusable: true,
    trackChildren,
    saveLastFocusedChild,
    ...rest,
  } as UseFocusableConfig);


  // keep both refs in sync (useFocusable returns a ref we must assign to innerRef)
  useEffect(() => {
    innerRef.current = (fRef as React.MutableRefObject<HTMLDivElement | null>).current;
  }, [fRef]);

  React.useImperativeHandle(ref, () => innerRef.current, [innerRef]);

  // helper: find the row child element (direct child of innerRef) for a given descendant node
  const findRowChild = useCallback((node: Node | null): HTMLElement | null => {
    if (!node || !innerRef.current) return null;
    let el: HTMLElement | null = node instanceof HTMLElement ? node : (node.parentElement as HTMLElement | null);
    while (el && el !== innerRef.current) {
      if (el.parentElement === innerRef.current) return el;
      el = el.parentElement;
    }
    return null;
  }, []);

  // helper: do the centering scroll (uses bounding rects for robustness)
  const scrollToChild = useCallback((targetChild: HTMLElement | null) => {
    const scrollContainer = containerRef.current;
    if (!targetChild || !scrollContainer) return;

    requestAnimationFrame(() => {
      if (!targetChild || !scrollContainer) return;
      targetChild.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center", // "start" sometimes causes offset issues
      });
    });
  }, []);
  // MutationObserver fallback: many TV nav libraries mark focused item by adding attributes/classes.
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const observer = new MutationObserver((mutations) => {
      // a simple approach: on attribute change, find the currently marked node
      const marked = inner.querySelector<HTMLElement>('[data-focused="true"], .focused');
      if (marked) {
        const child = findRowChild(marked);
        if (child) scrollToChild(child);
      }
    });

    observer.observe(inner, {
      attributes: true,
      attributeFilter: ["data-focused", "class"],
      subtree: true,
    });

    return () => observer.disconnect();
  }, [findRowChild, scrollToChild]);

  const style: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: typeof gap === 'number' ? `${gap}px` : gap,
  };

  return (
    <FocusContext.Provider value={providedFocusKey}>
      <div
        ref={containerRef}
        className="ui-grid-wrap overflow-x-auto"
      >
        <div ref={fRef} className={`ui-grid ${className} ${focused ? 'focused' : ''}`} style={style}>
          {children}
        </div>
      </div>
    </FocusContext.Provider>
  );
});

Grid.displayName = 'Grid';
