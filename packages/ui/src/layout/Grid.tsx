import React, { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { navigateByDirection } from '../core';
import { FocusContext, useFocusable, UseFocusableConfig } from '../hooks';

type VirtualizeConfig = { enabled?: boolean; itemSize?: number; buffer?: number; preserveFocus?: boolean; debug?: boolean };
type InfiniteConfig = { fetchNext?: () => Promise<any>; hasNext?: boolean; threshold?: number };

type GridProps = {
  children?: React.ReactNode;
  className?: string;
  focusKey?: string;
  columns?: number;
  gap?: number | string;
  trackChildren?: boolean;
  saveLastFocusedChild?: boolean;
  virtualize?: VirtualizeConfig;
  infinite?: InfiniteConfig;
  // how many rows before/after focused row to include in the visible window
  focusWindowBefore?: number;
  focusWindowAfter?: number;
} & Partial<UseFocusableConfig>;

const clamp = (v: number, a = 0, b = Infinity) => Math.max(a, Math.min(b, v));

export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(
  {
    children,
    className = '',
    focusKey,
    columns = 3,
    gap = 8,
    trackChildren = true,
    saveLastFocusedChild = true,
    virtualize,
    infinite,
    focusWindowBefore = 2,
    focusWindowAfter = 2,
    ...rest
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const measurerRef = useRef<HTMLDivElement | null>(null);

  const { ref: fRef, focusKey: providedFocusKey, focused, focusSelf } = useFocusable({ focusKey, focusable: true, trackChildren, saveLastFocusedChild, ...rest } as UseFocusableConfig);
  useEffect(() => { innerRef.current = (fRef as any)?.current ?? innerRef.current; }, [fRef]);
  React.useImperativeHandle(ref, () => innerRef.current, [innerRef]);

  const childrenArr = useMemo(() => React.Children.toArray(children), [children]);
  const totalItems = childrenArr.length;
  const itemsPerRow = Math.max(1, columns);
  const totalRows = Math.max(1, Math.ceil(totalItems / itemsPerRow));

  const itemSizeProp = virtualize?.itemSize ?? 0;
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);
  const itemHeight = itemSizeProp || measuredHeight || 0;

  const buffer = virtualize?.buffer ?? 2;
  const preserveFocus = virtualize?.preserveFocus ?? true;
  const debug = virtualize?.debug ?? false;

  const [startRow, setStartRow] = useState(0);
  const [visibleRows, setVisibleRows] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

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
      targetChild.scrollIntoView(
        {
          behavior: "smooth",
          block: "center",
          inline: "center", // "start" sometimes causes offset issues
        }
      );
    });
  }, []);

  // Observe focus marker changes to keep focusedIndex in sync and reveal focus
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const obs = new MutationObserver(() => {
      const marked = inner.querySelector<HTMLElement>('[data-focused="true"], .focused');
      if (marked) {
        const child = findRowChild(marked);
        if (child) {
          scrollToChild(child);
          const childrenList = Array.from(inner.children) as HTMLElement[];
          const idx = childrenList.indexOf(child);
          if (idx >= 0) setFocusedIndex(idx);
        }
      }
    });
    obs.observe(inner, { attributes: true, attributeFilter: ['data-focused', 'class'], subtree: true });
    return () => obs.disconnect();
  }, [findRowChild]);

  // measure item height from first child if not provided
  useEffect(() => {
    if (itemSizeProp > 0) return;
    const inner = (fRef as any)?.current as HTMLElement | null;
    if (!inner) return;
    const first = inner.firstElementChild as HTMLElement | null;
    if (!first) return;
    const r = first.getBoundingClientRect();
    if (r.height > 0) setMeasuredHeight(Math.round(r.height));
  }, [childrenArr.length, itemSizeProp, fRef]);

  // scrolling logic: compute startRow and visibleRows, and trigger infinite fetch
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || !virtualize?.enabled || itemHeight <= 0) return;

    const onWheel = (event) => {
      const direction: 'up' | 'down' = event.deltaY > 0 ? 'down' : 'up';
      if (direction === 'up') {
        navigateByDirection("up", event)
      } else if (direction === 'down') {
        navigateByDirection("down", event)
      }
    }

    const onScroll = () => {
      const scrollTop = el.scrollTop || 0;
      const clientHeight = el.clientHeight || 1;
      const newStart = clamp(Math.floor(scrollTop / itemHeight) - buffer, 0, Math.max(0, totalRows - 1));
      const rowsVisible = Math.ceil(clientHeight / itemHeight) + buffer * 2;
      setStartRow(newStart);
      setVisibleRows(rowsVisible);

      const threshold = infinite?.threshold ?? 250;
      const distanceToBottom = el.scrollHeight - (scrollTop + clientHeight);
      if (infinite?.fetchNext && infinite.hasNext && distanceToBottom < threshold) void infinite.fetchNext();
    };

    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('wheel', onWheel);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('wheel', onWheel);
    };
  }, [virtualize?.enabled, itemHeight, buffer, totalRows, infinite]);

  // expose revealIndex helper on the container DOM node
  useEffect(() => {
    const c = containerRef.current as any;
    if (!c) return;
    c.revealIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
      if (!c || itemHeight <= 0) return;
      const idx = clamp(Math.floor(index), 0, Math.max(0, totalItems - 1));
      const row = Math.floor(idx / itemsPerRow);
      const top = row * itemHeight;
      try { c.scrollTo({ top, behavior }); } catch { c.scrollTop = top; }
      setStartRow(clamp(row - buffer, 0, Math.max(0, totalRows - 1)));
    };
    return () => { if (c) delete c.revealIndex; };
  }, [itemHeight, itemsPerRow, totalItems, buffer, totalRows]);

  // force focus handling still kept
  useEffect(() => {
    if (rest.forceFocus) {
      focusSelf();
    }
  }, [rest.forceFocus, focusSelf]);

  const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: typeof gap === 'number' ? `${gap}px` : gap };

  // Virtualized rendering
  if (virtualize?.enabled && itemHeight > 0) {
    // base window computed from scroll
    let firstRow = startRow;
    let lastRow = Math.min(totalRows - 1, startRow + Math.max(1, visibleRows) - 1);

    // if there's a focused item, expand window around it so focus and neighbors stay rendered
    if (focusedIndex != null && focusedIndex >= 0) {
      const focusedRow = Math.floor(focusedIndex / itemsPerRow);
      firstRow = Math.min(firstRow, Math.max(0, focusedRow - focusWindowBefore));
      lastRow = Math.max(lastRow, Math.min(totalRows - 1, focusedRow + focusWindowAfter));

      // bound window size so it doesn't grow unbounded
      const maxWindow = Math.max(1, Math.ceil((visibleRows || 1) + focusWindowBefore + focusWindowAfter));
      if (lastRow - firstRow + 1 > maxWindow) {
        const half = Math.floor(maxWindow / 2);
        firstRow = clamp(focusedRow - half, 0, Math.max(0, totalRows - maxWindow));
        lastRow = firstRow + maxWindow - 1;
      }
    }

    const firstIndex = firstRow * itemsPerRow;
    const lastIndex = Math.min(totalItems, (lastRow + 1) * itemsPerRow);

    const topSpacer = firstRow * itemHeight;
    const totalHeight = totalRows * itemHeight;
    const visibleHeight = (lastRow - firstRow + 1) * itemHeight;
    const bottomSpacer = Math.max(0, totalHeight - topSpacer - visibleHeight);

    if (preserveFocus) {
      const rendered = childrenArr.map((child, idx) => {
        const isVisible = idx >= firstIndex && idx < lastIndex;
        const isFocus = focusedIndex === idx;
        if (isVisible || isFocus) return child;
        if (React.isValidElement(child)) {
          const placeholder = <div style={{ width: '100%', height: '100%' }} aria-hidden />;
          try { return React.cloneElement(child, { children: placeholder }); } catch { return placeholder; }
        }
        return <div aria-hidden style={{ width: '100%', height: `${itemHeight}px` }} />;
      });

      return (
        <FocusContext.Provider value={providedFocusKey}>
          <div ref={containerRef} className={`ui-grid-wrap overflow-auto`} style={{ maxHeight: '100%', position: 'relative' }}>
            {debug && (
              <div style={{ position: 'absolute', right: 8, top: 8, zIndex: 9999, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 8px', borderRadius: 6, fontSize: 12 }}>
                <div>rows: {firstRow} - {lastRow} / {totalRows}</div>
                <div>itemH: {itemHeight}px</div>
              </div>
            )}

            {!itemSizeProp && <div ref={measurerRef} style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none' }} />}

            <div style={{ height: topSpacer }} />
            <div
              ref={node => {
                try { if (typeof (fRef as any) === 'function') (fRef as any)(node); else (fRef as any).current = node; } catch { }
                innerRef.current = node as any;
              }}
              className={`ui-grid ${className} ${focused ? 'focused' : ''}`}
              style={gridStyle}
            >
              {rendered}
            </div>
            <div style={{ height: bottomSpacer }} />
          </div>
        </FocusContext.Provider>
      );
    }

    const visibleChildren = childrenArr.slice(firstIndex, lastIndex);
    return (
      <FocusContext.Provider value={providedFocusKey}>
        <div ref={containerRef} className="ui-grid-wrap overflow-auto" style={{ maxHeight: '100%' }}>
          {debug && (
            <div style={{ position: 'absolute', right: 8, top: 8, zIndex: 9999, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 8px', borderRadius: 6, fontSize: 12 }}>
              <div>rows: {firstRow} - {lastRow} / {totalRows}</div>
              <div>itemH: {itemHeight}px</div>
            </div>
          )}

          <div style={{ height: topSpacer }} />
          {!itemSizeProp && <div ref={measurerRef} style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none' }} />}
          <div
            ref={node => {
              try { if (typeof (fRef as any) === 'function') (fRef as any)(node); else (fRef as any).current = node; } catch { }
              innerRef.current = node as any;
            }}
            className={`ui-grid ${className} ${focused ? 'focused' : ''}`}
            style={gridStyle}
          >
            {visibleChildren}
          </div>
          <div style={{ height: bottomSpacer }} />
        </div>
      </FocusContext.Provider>
    );
  }

  // non-virtualized fallback
  return (
    <FocusContext.Provider value={providedFocusKey}>
      <div ref={containerRef} className="ui-grid-wrap overflow-x-auto">
        <div
          ref={node => {
            try { if (typeof (fRef as any) === 'function') (fRef as any)(node); else (fRef as any).current = node; } catch { }
            innerRef.current = node as any;
          }}
          className={`ui-grid ${className} ${focused ? 'focused' : ''}`}
          style={gridStyle}
        >
          {children}
        </div>
      </div>
    </FocusContext.Provider>
  );
});

Grid.displayName = 'Grid';