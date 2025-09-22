'use client';
import type { ReactNode } from "react";
import * as React from "react";

type RouteState = any;

interface RouteEntry {
  path: string;
  state?: RouteState;
}

interface RouterContextValue {
  current: RouteEntry;
  push: (path: string, state?: RouteState) => void;
  replace: (path: string, state?: RouteState) => void;
  back: () => void;
  go: (n: number) => void;
  registerRoute: (pattern: string) => (() => void);
  getParamsForPath: (path: string) => Params;
}

const RouterContext = React.createContext<RouterContextValue | undefined>(undefined);

function pathToSegments(path: string) {
  return path.replace(/^\//, "").split("/").filter(Boolean);
}

type Params = Record<string, string>;

function matchPath(pattern: string, path: string): { params: Params; matched: boolean } {
  const pSegments = pathToSegments(pattern);
  const tSegments = pathToSegments(path);

  const params: Params = {};

  // quick wildcard match
  if (pattern === "*") return { params, matched: true };

  if (pSegments.length !== tSegments.length) return { params, matched: false };

  for (let i = 0; i < pSegments.length; i++) {
    const ps = pSegments[i] ?? "";
    const ts = tSegments[i] ?? "";
    if (ps.startsWith(":")) {
      const key = ps.slice(1);
      params[key] = decodeURIComponent(ts || "");
      continue;
    }
    if (ps === "*") {
      // wildcard matches remainder
      return { params, matched: true };
    }
    if (ps !== ts) return { params, matched: false };
  }

  return { params, matched: true };
}

export function RouterProvider({ children, initial = "/" }: { children: ReactNode; initial?: string; }) {
  const routesRef = React.useRef<Set<string>>(new Set());
  const stackRef = React.useRef<RouteEntry[]>([{ path: initial, state: undefined }]);
  const [, tick] = React.useState(0);

  // current is always defined because stackRef is initialized with at least one entry
  const current: RouteEntry = stackRef.current[stackRef.current.length - 1] || { path: initial, state: undefined };

  const push = React.useCallback((path: string, state?: RouteState) => {
    stackRef.current.push({ path, state });
    tick((n) => n + 1);
  }, []);

  const replace = React.useCallback((path: string, state?: RouteState) => {
    stackRef.current[stackRef.current.length - 1] = { path, state };
    tick((n) => n + 1);
  }, []);

  const back = React.useCallback(() => {
    if (stackRef.current.length > 1) {
      stackRef.current.pop();
      tick((n) => n + 1);
    }
  }, []);

  const go = React.useCallback((n: number) => {
    if (n === 0) return;
    const idx = stackRef.current.length - 1 + n;
    if (idx < 0) {
      // keep only the first entry if going back past start
      stackRef.current = [stackRef.current[0] as RouteEntry];
    } else if (idx >= stackRef.current.length) {
      // no-op: can't go forward beyond stack
    } else {
      stackRef.current.splice(idx + 1);
    }
    tick((x) => x + 1);
  }, []);

  const registerRoute = React.useCallback((pattern: string) => {
    routesRef.current.add(pattern);
    return () => {
      routesRef.current.delete(pattern);
    };
  }, []);

  const getParamsForPath = React.useCallback((path: string) => {
    for (const pattern of Array.from(routesRef.current)) {
      const { params, matched } = matchPath(pattern, path);
      if (matched) return params;
    }
    return {} as Params;
  }, []);

  const value = React.useMemo(() => ({ current, push, replace, back, go, registerRoute, getParamsForPath }), [current, push, replace, back, go, registerRoute, getParamsForPath]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = React.useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used inside RouterProvider");
  return ctx;
}

export function Link({ to, state, children, replace = false }: { to: string; state?: RouteState; children: ReactNode; replace?: boolean }) {
  const r = useRouter();
  return (
    <a
      role="link"
      tabIndex={0}
      onClick={(e) => {
        // allow modifier keys and non-left clicks to fall through so users can open in new tabs
        if (e.defaultPrevented) return;
        if (e.button !== 0 || e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        if (replace) r.replace(to, state);
        else r.push(to, state);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (replace) r.replace(to, state);
          else r.push(to, state);
        }
      }}
    >
      {children}
    </a>
  );
}

// Simple Route component that renders children when the path matches exactly
export function Route({
  path,
  component: Component,
  element,
  children,
}: {
  path: string;
  component?: React.ComponentType<{ params?: Params; state?: RouteState }>;
  element?: ReactNode | ((props: { params: Params; state?: RouteState }) => ReactNode);
  children?: ReactNode | ((props: { params: Params; state?: RouteState }) => ReactNode);
}) {
  const { current } = useRouter();
  const { registerRoute } = useRouter();

  React.useEffect(() => registerRoute(path), [path, registerRoute]);

  const { params, matched } = matchPath(path, current.path);

  if (!matched) return null;

  const state = current.state;

  if (Component) return <Component params={params} state={state} />;

  if (typeof element === "function") return <>{(element as any)({ params, state })}</>;

  if (element) return <>{element}</>;

  if (typeof children === "function") return <>{(children as any)({ params, state })}</>;

  return <>{children ?? null}</>;
}

export function useParams() {
  const { current, getParamsForPath } = useRouter();
  return React.useMemo(() => getParamsForPath(current.path), [current.path, getParamsForPath]);
}

export function useRoute() {
  const { current } = useRouter();
  return current;
}

// A lightweight alternative to react-router's useLocation/useNavigate
export function useLocation() {
  const { current } = useRouter();
  return current;
}

export default {
  RouterProvider,
  Link,
  Route,
  useRouter,
  useLocation,
};
