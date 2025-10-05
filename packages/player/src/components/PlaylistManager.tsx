import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { DrmConfig, PlaylistCallbacks, PlaylistConfig, PlaylistItem, PlaylistState } from '../types';
import { AutoPlayCountdown } from './AutoPlayCountdown';

interface PlaylistManagerProps {
  state: PlaylistState;
  config?: PlaylistConfig;
  callbacks?: PlaylistCallbacks;
  currentItem?: PlaylistItem;
  onItemChange: (item: PlaylistItem) => void;
  onDrmConfigChange?: (drm: DrmConfig | undefined) => void;
  className?: string;
}

const PlaylistManagerComponent: React.FC<PlaylistManagerProps> = ({
  state,
  config,
  callbacks,
  currentItem,
  onItemChange,
  onDrmConfigChange,
  className,
}) => {
  const [showAutoPlayCountdown, setShowAutoPlayCountdown] = useState(false);
  const [autoPlayCountdown, setAutoPlayCountdown] = useState(0);
  const [nextItem, setNextItem] = useState<PlaylistItem | undefined>();
  const autoPlayTimerRef = useRef<NodeJS.Timeout>();
  const countdownTimerRef = useRef<NodeJS.Timeout>();

  // Get next item in playlist
  const getNextItem = useCallback((): PlaylistItem | undefined => {
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
  }, [currentItem, state.rails, config?.loop, callbacks]);

  // Get previous item in playlist
  const getPreviousItem = useCallback((): PlaylistItem | undefined => {
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
  }, [currentItem, state.rails, config?.loop, callbacks]);

  // Handle item end (video/audio finished playing)
  const handleItemEnd = useCallback(() => {
    if (!currentItem) return;

    // Call the item end callback
    callbacks?.onItemEnd?.(currentItem);

    // Check if auto-play is enabled
    if (config?.autoPlay) {
      const next = getNextItem();
      if (next) {
        setNextItem(next);
        const delay = config.autoPlayDelay || 5;
        setAutoPlayCountdown(delay);
        
        if (config.autoPlayCountdown !== false) {
          setShowAutoPlayCountdown(true);
          callbacks?.onAutoPlayStart?.(next, delay);
          
          // Start countdown
          countdownTimerRef.current = setInterval(() => {
            setAutoPlayCountdown(prev => {
              if (prev <= 1) {
                // Auto-play the next item
                handleAutoPlayConfirm();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          // Auto-play immediately without countdown
          autoPlayTimerRef.current = setTimeout(() => {
            playItem(next);
          }, delay * 1000);
        }
      }
    }
  }, [currentItem, config, callbacks, getNextItem]);

  // Play a specific item
  const playItem = useCallback((item: PlaylistItem) => {
    // Handle DRM configuration
    const drmConfig = item.drm || config?.globalDrm;
    if (drmConfig) {
      onDrmConfigChange?.(drmConfig);
    } else {
      onDrmConfigChange?.(undefined);
    }

    // Update the item and call callbacks
    onItemChange(item);
    callbacks?.onItemPlay?.(item);
    
    // Clear auto-play state
    setShowAutoPlayCountdown(false);
    setNextItem(undefined);
    clearAutoPlayTimers();
  }, [config?.globalDrm, onDrmConfigChange, onItemChange, callbacks]);

  // Handle auto-play confirmation
  const handleAutoPlayConfirm = useCallback(() => {
    if (nextItem) {
      playItem(nextItem);
    }
  }, [nextItem, playItem]);

  // Handle auto-play cancellation
  const handleAutoPlayCancel = useCallback(() => {
    if (nextItem) {
      callbacks?.onAutoPlayCancel?.(nextItem);
    }
    setShowAutoPlayCountdown(false);
    setNextItem(undefined);
    clearAutoPlayTimers();
  }, [nextItem, callbacks]);

  // Clear auto-play timers
  const clearAutoPlayTimers = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = undefined;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = undefined;
    }
  }, []);

  // Navigation functions
  const playNext = useCallback(() => {
    const next = getNextItem();
    if (next) {
      playItem(next);
    }
  }, [getNextItem, playItem]);

  const playPrevious = useCallback(() => {
    const previous = getPreviousItem();
    if (previous) {
      playItem(previous);
    }
  }, [getPreviousItem, playItem]);

  // Expose navigation functions through callbacks
  useEffect(() => {
    if (callbacks?.onNext) {
      callbacks.onNext = () => {
        const next = getNextItem();
        if (next) {
          playItem(next);
        }
        return next;
      };
    }
    if (callbacks?.onPrevious) {
      callbacks.onPrevious = () => {
        const previous = getPreviousItem();
        if (previous) {
          playItem(previous);
        }
        return previous;
      };
    }
  }, [callbacks, getNextItem, getPreviousItem, playItem]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearAutoPlayTimers();
    };
  }, [clearAutoPlayTimers]);

  // Listen for media ended events
  useEffect(() => {
    const handleMediaEnd = () => {
      handleItemEnd();
    };

    // You would typically listen to media player events here
    // This is a simplified example - in real implementation, you'd
    // listen to the actual media player's 'ended' event
    
    return () => {
      // Clean up event listeners
    };
  }, [handleItemEnd]);

  return (
    <div className={className}>
      {/* Auto-play countdown overlay */}
      {showAutoPlayCountdown && nextItem && (
        <AutoPlayCountdown
          nextItem={nextItem}
          countdown={autoPlayCountdown}
          onCancel={handleAutoPlayCancel}
          onConfirm={handleAutoPlayConfirm}
          focusKey="playlist-autoplay"
        />
      )}
    </div>
  );
};

export const PlaylistManager = memo(PlaylistManagerComponent);
