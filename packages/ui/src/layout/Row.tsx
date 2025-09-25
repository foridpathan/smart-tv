import React, {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { navigateByDirection } from "../core";
import { FocusContext, useFocusable, UseFocusableConfig } from "../hooks";

type RowProps = {
  children?: React.ReactNode;
  className?: string;
  focusKey?: string;
  gap?: number | string;
  trackChildren?: boolean;
  saveLastFocusedChild?: boolean;
  scrollProps?: {
    behavior?: ScrollBehavior;
    block?: ScrollLogicalPosition;
    inline?: ScrollLogicalPosition;
  };
  virtualize?: { enabled?: boolean; itemSize?: number; buffer?: number };
  infinite?: { fetchNext?: () => Promise<any>; hasNext?: boolean; threshold?: number };
} & Partial<UseFocusableConfig>;

export const Row = forwardRef<HTMLDivElement, RowProps>(function Row(
  {
    children,
    className = "",
    focusKey,
    gap = 0,
    trackChildren = true,
    saveLastFocusedChild = true,
    scrollProps,
    ...rest
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const {
    ref: fRef,
    focusKey: providedFocusKey,
    focusSelf,
    focused,
  } = useFocusable({
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

  const style = typeof gap === "number" ? { gap: `${gap}px` } : { gap };

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
      targetChild.scrollIntoView(
        scrollProps || {
          behavior: "smooth",
          block: "center",
          inline: "center", // "start" sometimes causes offset issues
        }
      );
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

  // force focus handling still kept
  useEffect(() => {
    if (rest.forceFocus) {
      focusSelf();
    }
  }, [rest.forceFocus, focusSelf]);

  // virtualization + infinite
  const childrenArr = useMemo(() => React.Children.toArray(children), [children]);
  const totalItems = childrenArr.length;
  const itemSize = (rest as any).virtualize?.itemSize ?? 0;
  // if not provided, try to measure first child width
  const measuredRef = useRef<HTMLDivElement | null>(null);
  const [measured, setMeasured] = useState<number | null>(null);
  const buffer = (rest as any).virtualize?.buffer ?? 2;
  const virtualEnabled = !!(rest as any).virtualize?.enabled;
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || !virtualEnabled || itemSize <= 0) return;

    const onWheel = (event) => {
      const direction: "left" | "right" = event.deltaX > 0 ? "right" : "left";
      if (direction === "left") {
        navigateByDirection("left", event);
      } else {
        navigateByDirection("right", event);
      }
    }

    const onScroll = () => {
      const scrollLeft = el.scrollLeft;
      const clientWidth = el.clientWidth || 1;
      const newStart = Math.max(0, Math.floor(scrollLeft / itemSize) - buffer);
      const visible = Math.ceil(clientWidth / itemSize) + buffer * 2;
      setStartIndex(newStart);
      setVisibleCount(visible);

      const threshold = (rest as any).infinite?.threshold ?? 250;
      const distanceToRight = el.scrollWidth - (scrollLeft + clientWidth);
      if ((rest as any).infinite?.fetchNext && (rest as any).infinite?.hasNext && distanceToRight < threshold) {
        void (rest as any).infinite.fetchNext();
      }
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
  }, [virtualEnabled, itemSize, buffer, rest]);

  // measure first child if needed
  useEffect(() => {
    if (itemSize > 0) return;
    const el = measuredRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width > 0) setMeasured(Math.round(r.width));
  }, [measuredRef.current]);

  if (virtualEnabled && itemSize > 0) {
    const effectiveItemSize = itemSize || measured || 0;
    const first = startIndex;
    const last = Math.min(totalItems, first + visibleCount);

    // Render every child but replace offscreen children with lightweight placeholders
    const rendered = childrenArr.map((child, idx) => {
      const isVisible = idx >= first && idx < last;
      if (isVisible) return child;
      // render placeholder by cloning element and replacing children with a small stub
      if (React.isValidElement(child)) {
        const placeholder = (
          <div style={{ width: `${effectiveItemSize}px`, height: '100%' }} aria-hidden="true" />
        );
        try {
          return React.cloneElement(child, { children: placeholder });
        } catch {
          return <div style={{ width: `${effectiveItemSize}px`, height: '100%' }} />;
        }
      }
      return <div style={{ width: `${effectiveItemSize}px`, height: '100%' }} />;
    });

    return (
      <FocusContext.Provider value={providedFocusKey}>
        <div
          ref={containerRef}
          className="ui-row overflow-x-auto"
          style={{ WebkitOverflowScrolling: 'touch', width: 'calc(98vw - var(--ui-sidebar-width, 0px))' } as React.CSSProperties}
        >
          <div style={{ display: 'inline-block' }} ref={measuredRef} aria-hidden>
            {/* measuring element for dynamic item size */}
          </div>
          <div
            ref={fRef}
            className={`flex flex-nowrap ${className} ${focused ? "focused" : ""}`}
            style={style}
          >
            {rendered}
          </div>
        </div>
      </FocusContext.Provider>
    );
  }

  return (
    <FocusContext.Provider value={providedFocusKey}>
      <div
        ref={containerRef}
        className="ui-row overflow-x-auto"
        style={{
          WebkitOverflowScrolling: "touch",
          width: 'calc(98vw - var(--ui-sidebar-width, 0px))'
        } as React.CSSProperties}
      >
        <div
          ref={fRef}
          className={`flex flex-nowrap ${className} ${focused ? "focused" : ""}`}
          style={style}
        >
          {children}
        </div>
      </div>
    </FocusContext.Provider>
  );
});

Row.displayName = "Row";