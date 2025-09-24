import { createContext, useContext } from 'react';
import { ROOT_FOCUS_KEY } from '../core/Navigation';

export const FocusContext = createContext(ROOT_FOCUS_KEY);
FocusContext.displayName = 'FocusContext';

/** @internal */
export const useFocusContext = () => useContext(FocusContext);
