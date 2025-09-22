import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
    getCurrentFocusKey,
    destroy as navigationDestroy,
    init as navigationInit,
    navigateByDirection as navigationNavigateByDirection,
    setFocus as navigationSetFocus,
    updateRtl as navigationUpdateRtl
} from "./Navigation";

// Minimal shape of the app context
export interface AppProviderValue {
    label: string;
    setLabel: (label: string) => void;
    init: typeof navigationInit;
    destroy: () => void;
    setFocus: (focusKey: string) => void;
    navigate: (direction: "up" | "down" | "left" | "right") => void;
    getFocusedKey: () => string;
    setRtl: (rtl: boolean) => void;
}

export const AppContext = createContext<AppProviderValue | undefined>(undefined);

export function AppProvider({
    children,
    initialLabel = "",
    init,
}: {
    children: ReactNode;
    initialLabel?: string;
    init?: Parameters<typeof navigationInit>[0];
}) {
    const [label, setLabel] = useState(initialLabel);

    // initialize navigation on mount (if requested)
    useEffect(() => {
        if (init) {
            navigationInit(init as any);
        }

        return () => {
            if (init) {
                navigationDestroy();
            }
        };
        // intentionally run only on mount/unmount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const value = useMemo<AppProviderValue>(() => ({
        label,
        setLabel,
        init: (opts = {}) => navigationInit(opts as any),
        destroy: () => navigationDestroy(),
        setFocus: (focusKey: string) => navigationSetFocus(focusKey),
        navigate: (direction: "up" | "down" | "left" | "right") =>
            navigationNavigateByDirection(direction as any, {} as any),
        getFocusedKey: () => getCurrentFocusKey(),
        setRtl: (rtl: boolean) => navigationUpdateRtl(rtl),
    }), [label]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppProvider() {
    const ctx = useContext(AppContext);

    if (!ctx) {
        throw new Error("useAppProvider must be used within an AppProvider");
    }

    return ctx;
}

