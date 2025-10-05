import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { PlaylistCallbacks, PlaylistConfig, PlaylistItem, PlaylistRail, PlaylistState } from '../types';

// Playlist Actions
type PlaylistAction =
  | { type: 'SET_VISIBILITY'; payload: boolean }
  | { type: 'SET_RAILS'; payload: PlaylistRail[] }
  | { type: 'ADD_RAIL'; payload: PlaylistRail }
  | { type: 'UPDATE_RAIL'; payload: { railId: string; rail: Partial<PlaylistRail> } }
  | { type: 'REMOVE_RAIL'; payload: string }
  | { type: 'ADD_ITEM'; payload: { railId: string; item: PlaylistItem; index?: number } }
  | { type: 'UPDATE_ITEM'; payload: { railId: string; itemId: string; item: Partial<PlaylistItem> } }
  | { type: 'REMOVE_ITEM'; payload: { railId: string; itemId: string } }
  | { type: 'SET_CURRENT_ITEM'; payload: string | undefined }
  | { type: 'SET_ACTIVE_RAIL'; payload: string | undefined }
  | { type: 'TOGGLE_RAIL_EXPANSION'; payload: string }
  | { type: 'SET_EXPANDED_RAILS'; payload: string[] }
  | { type: 'MOVE_ITEM'; payload: { railId: string; fromIndex: number; toIndex: number } }
  | { type: 'CLEAR_RAIL'; payload: string }
  | { type: 'SET_AUTOPLAY_ENABLED'; payload: boolean }
  | { type: 'SET_AUTOPLAY_COUNTDOWN'; payload: number }
  | { type: 'SET_NEXT_ITEM'; payload: string | undefined }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: PlaylistState = {
  currentItemId: undefined,
  rails: [],
  isVisible: false,
  expandedRails: [],
  activeRail: undefined,
  autoPlayEnabled: false,
  autoPlayCountdown: 0,
  nextItemId: undefined,
};

// Playlist reducer
function playlistReducer(state: PlaylistState, action: PlaylistAction): PlaylistState {
  switch (action.type) {
    case 'SET_VISIBILITY':
      return { ...state, isVisible: action.payload };

    case 'SET_RAILS':
      return { ...state, rails: action.payload };

    case 'ADD_RAIL':
      return {
        ...state,
        rails: [...state.rails, action.payload],
      };

    case 'UPDATE_RAIL': {
      const { railId, rail } = action.payload;
      return {
        ...state,
        rails: state.rails.map(r => 
          r.id === railId ? { ...r, ...rail } : r
        ),
      };
    }

    case 'REMOVE_RAIL':
      return {
        ...state,
        rails: state.rails.filter(rail => rail.id !== action.payload),
        expandedRails: state.expandedRails.filter(id => id !== action.payload),
        activeRail: state.activeRail === action.payload ? undefined : state.activeRail,
      };

    case 'ADD_ITEM': {
      const { railId, item, index } = action.payload;
      return {
        ...state,
        rails: state.rails.map(rail => {
          if (rail.id === railId) {
            const newItems = [...rail.items];
            if (index !== undefined) {
              newItems.splice(index, 0, item);
            } else {
              newItems.push(item);
            }
            return { ...rail, items: newItems };
          }
          return rail;
        }),
      };
    }

    case 'UPDATE_ITEM': {
      const { railId, itemId, item } = action.payload;
      return {
        ...state,
        rails: state.rails.map(rail => {
          if (rail.id === railId) {
            return {
              ...rail,
              items: rail.items.map(i => 
                i.id === itemId ? { ...i, ...item } : i
              ),
            };
          }
          return rail;
        }),
      };
    }

    case 'REMOVE_ITEM': {
      const { railId, itemId } = action.payload;
      return {
        ...state,
        rails: state.rails.map(rail => {
          if (rail.id === railId) {
            return {
              ...rail,
              items: rail.items.filter(item => item.id !== itemId),
            };
          }
          return rail;
        }),
        currentItemId: state.currentItemId === itemId ? undefined : state.currentItemId,
      };
    }

    case 'SET_CURRENT_ITEM':
      return {
        ...state,
        currentItemId: action.payload,
        rails: state.rails.map(rail => ({
          ...rail,
          items: rail.items.map(item => ({
            ...item,
            isActive: item.id === action.payload,
          })),
        })),
      };

    case 'SET_ACTIVE_RAIL':
      return { ...state, activeRail: action.payload };

    case 'TOGGLE_RAIL_EXPANSION': {
      const railId = action.payload;
      const isExpanded = state.expandedRails.includes(railId);
      return {
        ...state,
        expandedRails: isExpanded
          ? state.expandedRails.filter(id => id !== railId)
          : [...state.expandedRails, railId],
      };
    }

    case 'SET_EXPANDED_RAILS':
      return { ...state, expandedRails: action.payload };

    case 'MOVE_ITEM': {
      const { railId, fromIndex, toIndex } = action.payload;
      return {
        ...state,
        rails: state.rails.map(rail => {
          if (rail.id === railId) {
            const newItems = [...rail.items];
            const [movedItem] = newItems.splice(fromIndex, 1);
            newItems.splice(toIndex, 0, movedItem);
            return { ...rail, items: newItems };
          }
          return rail;
        }),
      };
    }

    case 'CLEAR_RAIL':
      return {
        ...state,
        rails: state.rails.map(rail => 
          rail.id === action.payload ? { ...rail, items: [] } : rail
        ),
      };

    case 'SET_AUTOPLAY_ENABLED':
      return { ...state, autoPlayEnabled: action.payload };

    case 'SET_AUTOPLAY_COUNTDOWN':
      return { ...state, autoPlayCountdown: action.payload };

    case 'SET_NEXT_ITEM':
      return { ...state, nextItemId: action.payload };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// Context interface
interface PlaylistContextValue {
  state: PlaylistState;
  config?: PlaylistConfig;
  callbacks?: PlaylistCallbacks;
  // Actions
  setVisibility: (visible: boolean) => void;
  setRails: (rails: PlaylistRail[]) => void;
  addRail: (rail: PlaylistRail) => void;
  updateRail: (railId: string, rail: Partial<PlaylistRail>) => void;
  removeRail: (railId: string) => void;
  addItem: (railId: string, item: PlaylistItem, index?: number) => void;
  updateItem: (railId: string, itemId: string, item: Partial<PlaylistItem>) => void;
  removeItem: (railId: string, itemId: string) => void;
  setCurrentItem: (itemId: string | undefined) => void;
  setActiveRail: (railId: string | undefined) => void;
  toggleRailExpansion: (railId: string) => void;
  setExpandedRails: (railIds: string[]) => void;
  moveItem: (railId: string, fromIndex: number, toIndex: number) => void;
  clearRail: (railId: string) => void;
  // Auto-play actions
  setAutoPlayEnabled: (enabled: boolean) => void;
  setAutoPlayCountdown: (countdown: number) => void;
  setNextItem: (itemId: string | undefined) => void;
  resetState: () => void;
  // Helpers
  getCurrentItem: () => PlaylistItem | undefined;
  getActiveRail: () => PlaylistRail | undefined;
  getRailById: (railId: string) => PlaylistRail | undefined;
  getItemById: (itemId: string) => { rail: PlaylistRail; item: PlaylistItem } | undefined;
  getNextItem: () => PlaylistItem | undefined;
  getPreviousItem: () => PlaylistItem | undefined;
}

// Create context
const PlaylistContext = createContext<PlaylistContextValue | undefined>(undefined);

// Provider props
interface PlaylistProviderProps {
  children: React.ReactNode;
  initialState?: Partial<PlaylistState>;
  config?: PlaylistConfig;
  callbacks?: PlaylistCallbacks;
}

// Provider component
export const PlaylistProvider: React.FC<PlaylistProviderProps> = ({
  children,
  initialState: providedInitialState,
  config,
  callbacks,
}) => {
  const [state, dispatch] = useReducer(
    playlistReducer,
    providedInitialState ? { ...initialState, ...providedInitialState } : initialState
  );

  // Actions
  const setVisibility = useCallback((visible: boolean) => {
    dispatch({ type: 'SET_VISIBILITY', payload: visible });
  }, []);

  const setRails = useCallback((rails: PlaylistRail[]) => {
    dispatch({ type: 'SET_RAILS', payload: rails });
  }, []);

  const addRail = useCallback((rail: PlaylistRail) => {
    dispatch({ type: 'ADD_RAIL', payload: rail });
  }, []);

  const updateRail = useCallback((railId: string, rail: Partial<PlaylistRail>) => {
    dispatch({ type: 'UPDATE_RAIL', payload: { railId, rail } });
  }, []);

  const removeRail = useCallback((railId: string) => {
    dispatch({ type: 'REMOVE_RAIL', payload: railId });
  }, []);

  const addItem = useCallback((railId: string, item: PlaylistItem, index?: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { railId, item, index } });
  }, []);

  const updateItem = useCallback((railId: string, itemId: string, item: Partial<PlaylistItem>) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { railId, itemId, item } });
  }, []);

  const removeItem = useCallback((railId: string, itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { railId, itemId } });
  }, []);

  const setCurrentItem = useCallback((itemId: string | undefined) => {
    dispatch({ type: 'SET_CURRENT_ITEM', payload: itemId });
  }, []);

  const setActiveRail = useCallback((railId: string | undefined) => {
    dispatch({ type: 'SET_ACTIVE_RAIL', payload: railId });
  }, []);

  const toggleRailExpansion = useCallback((railId: string) => {
    dispatch({ type: 'TOGGLE_RAIL_EXPANSION', payload: railId });
  }, []);

  const setExpandedRails = useCallback((railIds: string[]) => {
    dispatch({ type: 'SET_EXPANDED_RAILS', payload: railIds });
  }, []);

  const moveItem = useCallback((railId: string, fromIndex: number, toIndex: number) => {
    dispatch({ type: 'MOVE_ITEM', payload: { railId, fromIndex, toIndex } });
  }, []);

  const clearRail = useCallback((railId: string) => {
    dispatch({ type: 'CLEAR_RAIL', payload: railId });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // Auto-play actions
  const setAutoPlayEnabled = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_AUTOPLAY_ENABLED', payload: enabled });
  }, []);

  const setAutoPlayCountdown = useCallback((countdown: number) => {
    dispatch({ type: 'SET_AUTOPLAY_COUNTDOWN', payload: countdown });
  }, []);

  const setNextItem = useCallback((itemId: string | undefined) => {
    dispatch({ type: 'SET_NEXT_ITEM', payload: itemId });
  }, []);

  // Helper functions
  const getCurrentItem = useCallback(() => {
    if (!state.currentItemId) return undefined;
    
    for (const rail of state.rails) {
      const item = rail.items.find(item => item.id === state.currentItemId);
      if (item) return item;
    }
    return undefined;
  }, [state.currentItemId, state.rails]);

  const getActiveRail = useCallback(() => {
    if (!state.activeRail) return undefined;
    return state.rails.find(rail => rail.id === state.activeRail);
  }, [state.activeRail, state.rails]);

  const getRailById = useCallback((railId: string) => {
    return state.rails.find(rail => rail.id === railId);
  }, [state.rails]);

  const getItemById = useCallback((itemId: string) => {
    for (const rail of state.rails) {
      const item = rail.items.find(item => item.id === itemId);
      if (item) return { rail, item };
    }
    return undefined;
  }, [state.rails]);

  // Navigation helpers
  const getNextItem = useCallback(() => {
    const currentItem = getCurrentItem();
    if (!currentItem) return undefined;

    // First try the custom callback
    if (callbacks?.onGetNextItem) {
      return callbacks.onGetNextItem(currentItem.id);
    }

    // Default logic: find next item in the same rail
    for (const rail of state.rails) {
      const currentIndex = rail.items.findIndex(item => item.id === currentItem.id);
      if (currentIndex !== -1) {
        // Check if there's a next item in this rail
        if (currentIndex < rail.items.length - 1) {
          return rail.items[currentIndex + 1];
        }
        
        // If loop is enabled, go back to the first item
        if (config?.loop && rail.items.length > 0) {
          return rail.items[0];
        }
        
        // Look for next rail with items
        const currentRailIndex = state.rails.findIndex(r => r.id === rail.id);
        for (let i = currentRailIndex + 1; i < state.rails.length; i++) {
          if (state.rails[i].items.length > 0) {
            return state.rails[i].items[0];
          }
        }
        
        // If loop is enabled, start from the first rail
        if (config?.loop) {
          for (let i = 0; i < currentRailIndex; i++) {
            if (state.rails[i].items.length > 0) {
              return state.rails[i].items[0];
            }
          }
        }
        
        break;
      }
    }

    return undefined;
  }, [getCurrentItem, state.rails, config?.loop, callbacks]);

  const getPreviousItem = useCallback(() => {
    const currentItem = getCurrentItem();
    if (!currentItem) return undefined;

    // First try the custom callback
    if (callbacks?.onGetPreviousItem) {
      return callbacks.onGetPreviousItem(currentItem.id);
    }

    // Default logic: find previous item in the same rail
    for (const rail of state.rails) {
      const currentIndex = rail.items.findIndex(item => item.id === currentItem.id);
      if (currentIndex !== -1) {
        // Check if there's a previous item in this rail
        if (currentIndex > 0) {
          return rail.items[currentIndex - 1];
        }
        
        // Look for previous rail with items
        const currentRailIndex = state.rails.findIndex(r => r.id === rail.id);
        for (let i = currentRailIndex - 1; i >= 0; i--) {
          if (state.rails[i].items.length > 0) {
            return state.rails[i].items[state.rails[i].items.length - 1];
          }
        }
        
        // If loop is enabled, go to the last item of the last rail
        if (config?.loop) {
          for (let i = state.rails.length - 1; i > currentRailIndex; i--) {
            if (state.rails[i].items.length > 0) {
              return state.rails[i].items[state.rails[i].items.length - 1];
            }
          }
        }
        
        break;
      }
    }

    return undefined;
  }, [getCurrentItem, state.rails, config?.loop, callbacks]);

  const value = useMemo<PlaylistContextValue>(() => ({
    state,
    config,
    callbacks,
    setVisibility,
    setRails,
    addRail,
    updateRail,
    removeRail,
    addItem,
    updateItem,
    removeItem,
    setCurrentItem,
    setActiveRail,
    toggleRailExpansion,
    setExpandedRails,
    moveItem,
    clearRail,
    setAutoPlayEnabled,
    setAutoPlayCountdown,
    setNextItem,
    resetState,
    getCurrentItem,
    getActiveRail,
    getRailById,
    getItemById,
    getNextItem,
    getPreviousItem,
  }), [
    state,
    config,
    callbacks,
    setVisibility,
    setRails,
    addRail,
    updateRail,
    removeRail,
    addItem,
    updateItem,
    removeItem,
    setCurrentItem,
    setActiveRail,
    toggleRailExpansion,
    setExpandedRails,
    moveItem,
    clearRail,
    setAutoPlayEnabled,
    setAutoPlayCountdown,
    setNextItem,
    resetState,
    getCurrentItem,
    getActiveRail,
    getRailById,
    getItemById,
    getNextItem,
    getPreviousItem,
  ]);

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
};

// Hook to use playlist context
export const usePlaylist = (): PlaylistContextValue => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
};

// Additional hooks for specific functionality
export const usePlaylistState = () => {
  const { state } = usePlaylist();
  return state;
};

export const usePlaylistActions = () => {
  const {
    setVisibility,
    setRails,
    addRail,
    updateRail,
    removeRail,
    addItem,
    updateItem,
    removeItem,
    setCurrentItem,
    setActiveRail,
    toggleRailExpansion,
    setExpandedRails,
    moveItem,
    clearRail,
    resetState,
  } = usePlaylist();

  return {
    setVisibility,
    setRails,
    addRail,
    updateRail,
    removeRail,
    addItem,
    updateItem,
    removeItem,
    setCurrentItem,
    setActiveRail,
    toggleRailExpansion,
    setExpandedRails,
    moveItem,
    clearRail,
    resetState,
  };
};

export const usePlaylistHelpers = () => {
  const { getCurrentItem, getActiveRail, getRailById, getItemById } = usePlaylist();
  return { getCurrentItem, getActiveRail, getRailById, getItemById };
};
