import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FocusContext } from '../hooks';
import { useFocusable } from '../hooks/useFocusable';

type RenderProps = {
  focused: boolean;
  ref: React.RefObject<HTMLElement> | null;
  focusKey: string;
};

type SidebarProps = {
  children: React.ReactNode | ((props: RenderProps) => React.ReactNode);
  // width when collapsed (px or tailwind width classes can be used via style)
  collapsedWidth?: number;
  // width when expanded
  expandedWidth?: number;
  // delay (ms) before collapsing after focus leaves
  collapseDelay?: number;
  // if true, sidebar will render as an overlay when expanded (like shadcn)
  overlay?: boolean;
  className?: string;
  focusKey?: string;
};

// TV side panel: expands when any child receives focus, collapses after focus leaves
export const Sidebar = ({
  children,
  collapsedWidth = 72,
  expandedWidth = 280,
  collapseDelay = 300,
  overlay = false,
  className = '',
  focusKey: componentFocusKey = 'SIDEBAR',
}: SidebarProps) => {
  // Use the project's navigation hooks so sidebar reacts to TV focus engine
  const { ref: containerRef, focused, hasFocusedChild, focusKey } = useFocusable({
    focusKey: componentFocusKey,
    focusable: true,
    trackChildren: true,
    saveLastFocusedChild: true,
  });

  const [expanded, setExpanded] = useState(false);
  const collapseTimer = useRef<number | null>(null);

  const clearCollapseTimer = useCallback(() => {
    if (collapseTimer.current) {
      window.clearTimeout(collapseTimer.current);
      collapseTimer.current = null;
    }
  }, []);

  const scheduleCollapse = useCallback(() => {
    clearCollapseTimer();
    collapseTimer.current = window.setTimeout(() => {
      setExpanded(false);
      collapseTimer.current = null;
    }, collapseDelay);
  }, [collapseDelay, clearCollapseTimer]);

  // Sync expanded state to focus state from SmartTvNavigation
  useEffect(() => {
    // If either the sidebar itself is focused or it has a focused child, expand
    if (focused || hasFocusedChild) {
      clearCollapseTimer();
      setExpanded(true);
      return;
    }

    // Otherwise schedule collapse
    scheduleCollapse();
  }, [focused, hasFocusedChild, clearCollapseTimer, scheduleCollapse]);

  // Keyboard: allow toggle with Enter or Space when container itself focused
  // Keyboard toggle when the container element (focusable) receives keydown
  useEffect(() => {
    const el = containerRef.current as HTMLElement | null;
    if (!el) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        setExpanded((s) => !s);
      }
    };
    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, [containerRef]);

  // inline styles for width transition
  const baseStyle: React.CSSProperties = {
    width: expanded ? expandedWidth : collapsedWidth,
    transition: 'width 200ms ease',
  };

  // overlay mode styles
  const overlayStyle: React.CSSProperties = overlay
    ? {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 50,
      boxShadow: expanded ? '0 6px 18px rgba(0,0,0,0.4)' : 'none',
    }
    : { position: 'relative' };

  return (
    <FocusContext.Provider value={focusKey}>
      <aside
        ref={containerRef as any}
        tabIndex={0}
        aria-expanded={expanded}
        className={`ui-flex ui-flex-col ui-h-full ui-bg-slate-200 ui-text-foreground ${className}`}
        style={{ ...baseStyle, ...overlayStyle }}
      >
        {/* visual thin divider when collapsed */}
        <div
          className="ui-h-full ui-overflow-hidden"
          style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
        >
          {typeof children === "function"
            ? children({ focused: focused || hasFocusedChild, ref: containerRef, focusKey })
            : children}
        </div>
      </aside>
    </FocusContext.Provider>
  );
};
