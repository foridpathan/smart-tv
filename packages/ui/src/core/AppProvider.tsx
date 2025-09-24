import * as React from "react";
import { createContext, useContext, useMemo, useState } from "react";
import {
    getCurrentFocusKey,
    InitOptions,
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
    children: React.ReactNode;
    initialLabel?: string;
    init?: InitOptions
}) {
    const [label, setLabel] = useState(initialLabel);

    if (init) {
        navigationInit(init);
    }

    const value = useMemo<AppProviderValue>(() => ({
        label,
        setLabel,
        init: (opts = {}) => navigationInit(opts),
        destroy: () => navigationDestroy(),
        setFocus: (focusKey: string) => navigationSetFocus(focusKey),
        navigate: (direction: "up" | "down" | "left" | "right") =>
            navigationNavigateByDirection(direction as any, {} as any),
        getFocusedKey: () => getCurrentFocusKey(),
        setRtl: (rtl: boolean) => navigationUpdateRtl(rtl),
    }), [label]);

    return React.createElement(AppContext.Provider, { value }, children);
}

export function useAppProvider() {
    const ctx = useContext(AppContext);

    if (!ctx) {
        throw new Error("useAppProvider must be used within an AppProvider");
    }

    return ctx;
}

