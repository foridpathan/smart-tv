'use client';
import type { ReactNode } from "react";
import * as React from "react";

type RouteState = any;

interface RouteEntry {
    path: string;
    state?: RouteState;
    base?: string;
    skippable?: boolean;
}

interface RouterContextValue {
    current: RouteEntry;
    push: (path: string, state?: RouteState) => void;
    replace: (path: string, state?: RouteState) => void;
    back: () => void;
    go: (n: number) => void;
    registerRoute: (pattern: string, opts?: { skippable?: boolean }) => (() => void);
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

export function RouterProvider({ children, initial = "/", maxStack = 50, collapseSameBase = true, skipDuplicates = true }: { children: ReactNode; initial?: string; maxStack?: number; collapseSameBase?: boolean; skipDuplicates?: boolean; }) {
    const routesRef = React.useRef<Set<string>>(new Set());
    const skippableRoutesRef = React.useRef<Set<string>>(new Set());
    const stackRef = React.useRef<RouteEntry[]>([{ path: initial, state: undefined, base: pathToSegments(initial)[0] ?? '' }]);
    const [, tick] = React.useState(0);

    // current is always defined because stackRef is initialized with at least one entry
    const current: RouteEntry = stackRef.current[stackRef.current.length - 1] || { path: initial, state: undefined };

    const push = React.useCallback((path: string, state?: RouteState) => {
        const top = stackRef.current[stackRef.current.length - 1];
        const base = pathToSegments(path)[0] ?? '';

        // If pushing the same path as current, replace the state instead of adding a duplicate
        if (top && top.path === path) {
            if (top.state !== state) {
                stackRef.current[stackRef.current.length - 1] = { path, state, base };
                tick((n) => n + 1);
            }
            return;
        }

    // Optionally collapse navigations that stay within the same base section (simple replace)
        if (collapseSameBase && top) {
            const topBase = top.base ?? (pathToSegments(top.path)[0] ?? '');
            const newBase = base;
            if (topBase && newBase && topBase === newBase) {
                // Two options: replace top (current simple behavior) OR mark older entries skippable.
                if (skipDuplicates) {
                    // Mark any earlier entries with same base as skippable to avoid loops when going back
                    for (let i = 0; i < stackRef.current.length - 1; i++) {
                        if (stackRef.current[i].base === newBase) {
                            stackRef.current[i].skippable = true;
                        }
                    }
            const entrySkippable = skippableRoutesRef.current.has(path) || skippableRoutesRef.current.has(base);
            stackRef.current.push({ path, state, base, skippable: entrySkippable });
                } else {
                    // default: replace top so stack doesn't grow
            const entrySkippable = skippableRoutesRef.current.has(path) || skippableRoutesRef.current.has(base);
            stackRef.current[stackRef.current.length - 1] = { path, state, base, skippable: entrySkippable };
                }
                tick((n) => n + 1);
                return;
            }
        }

    const entrySkippable = skippableRoutesRef.current.has(path) || skippableRoutesRef.current.has(base);
    stackRef.current.push({ path, state, base, skippable: entrySkippable });

        // enforce max stack depth to avoid unbounded memory usage on long sessions
        if (maxStack > 0 && stackRef.current.length > maxStack) {
            // keep the most recent `maxStack` entries
            stackRef.current = stackRef.current.slice(-maxStack);
        }

        tick((n) => n + 1);
    }, [collapseSameBase, maxStack, skipDuplicates]);

    const replace = React.useCallback((path: string, state?: RouteState) => {
        stackRef.current[stackRef.current.length - 1] = { path, state };
        tick((n) => n + 1);
    }, []);

    const back = React.useCallback(() => {
        if (stackRef.current.length <= 1) return;

        // pop current
        stackRef.current.pop();

        // Skip entries marked skippable
        while (stackRef.current.length > 1 && stackRef.current[stackRef.current.length - 1].skippable) {
            stackRef.current.pop();
        }

        tick((n) => n + 1);
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

    const registerRoute = React.useCallback((pattern: string, opts?: { skippable?: boolean }) => {
        routesRef.current.add(pattern);
        if (opts?.skippable) skippableRoutesRef.current.add(pattern);
        return () => {
            routesRef.current.delete(pattern);
            if (opts?.skippable) skippableRoutesRef.current.delete(pattern);
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
    skippable,
}: {
    path: string;
    component?: React.ComponentType<{ params?: Params; state?: RouteState }>;
    element?: ReactNode | ((props: { params: Params; state?: RouteState }) => ReactNode);
    children?: ReactNode | ((props: { params: Params; state?: RouteState }) => ReactNode);
    skippable?: boolean;
}) {
    const { current } = useRouter();
    const { registerRoute } = useRouter();

    React.useEffect(() => registerRoute(path, { skippable }), [path, registerRoute, skippable]);

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
