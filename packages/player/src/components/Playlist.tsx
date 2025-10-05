import { useFocusable } from '@smart-tv/ui';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { PlaylistCallbacks, PlaylistConfig, PlaylistState } from '../types';
import { cn } from '../utils';
import { PlaylistRail } from './PlaylistRail';

interface PlaylistProps {
  state: PlaylistState;
  config?: PlaylistConfig;
  callbacks?: PlaylistCallbacks;
  focusKey?: string;
  className?: string;
  style?: React.CSSProperties;
  onClose?: () => void;
}

const PlaylistComponent: React.FC<PlaylistProps> = ({
  state,
  config,
  callbacks,
  focusKey = 'playlist',
  className,
  style,
  onClose,
}) => {
  const [expandedRails, setExpandedRails] = useState<Set<string>>(
    new Set(state.expandedRails || [])
  );

  const { ref, focused, hasFocusedChild } = useFocusable({
    focusKey,
    trackChildren: true,
    saveLastFocusedChild: true,
    onArrowPress: (direction) => {
      if (direction === 'up' || direction === 'down') {
        return true; // Allow navigation between rails
      }
      return false;
    },
  });

  // Sort rails by priority
  const sortedRails = useMemo(() => {
    return [...state.rails].sort((a, b) => (a.priority || 0) - (b.priority || 0));
  }, [state.rails]);

  const handleToggleExpand = useCallback((railId: string) => {
    setExpandedRails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(railId)) {
        newSet.delete(railId);
      } else {
        newSet.add(railId);
      }
      return newSet;
    });
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onClose?.();
        break;
      case 'Tab':
        // Handle tab navigation if needed
        break;
    }
  }, [onClose]);

  if (!state.isVisible) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        'playlist-container',
        'player-absolute player-bottom-full player-left-0 player-right-0',
        'player-bg-white dark:player-bg-gray-900',
        'player-border-t player-border-gray-200 dark:player-border-gray-700',
        'player-shadow-lg player-backdrop-blur-sm',
        'player-max-h-96 player-overflow-y-auto',
        'player-z-50',
        (focused || hasFocusedChild) && 'player-ring-2 player-ring-blue-500',
        className
      )}
      style={style}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Playlist Header */}
      <div className="playlist-header player-sticky player-top-0 player-bg-white dark:player-bg-gray-900 player-border-b player-border-gray-200 dark:player-border-gray-700 player-px-4 player-py-3 player-z-10">
        <div className="player-flex player-items-center player-justify-between">
          <div className="player-flex player-items-center player-gap-3">
            <div className="player-text-gray-600 dark:player-text-gray-400">
              <svg className="player-w-5 player-h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="player-text-xl player-font-bold player-text-gray-900 dark:player-text-gray-100">
              Playlist
            </h2>
            <div className="player-text-sm player-text-gray-500 player-bg-gray-100 dark:player-bg-gray-800 player-px-2 player-py-1 player-rounded-full">
              {state.rails.reduce((total, rail) => total + rail.items.length, 0)} items
            </div>
          </div>

          {/* Playlist Controls */}
          <div className="player-flex player-items-center player-gap-2">
            {/* Shuffle Button */}
            {config?.shuffle && (
              <button
                className={cn(
                  'player-p-2 player-text-gray-600 dark:player-text-gray-400',
                  'hover:player-text-gray-900 dark:hover:player-text-gray-100',
                  'hover:player-bg-gray-100 dark:hover:player-bg-gray-800',
                  'player-rounded-md player-transition-all player-duration-200'
                )}
                title="Shuffle"
              >
                <svg className="player-w-4 player-h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            {/* Loop Button */}
            {config?.loop && (
              <button
                className={cn(
                  'player-p-2 player-text-gray-600 dark:player-text-gray-400',
                  'hover:player-text-gray-900 dark:hover:player-text-gray-100',
                  'hover:player-bg-gray-100 dark:hover:player-bg-gray-800',
                  'player-rounded-md player-transition-all player-duration-200'
                )}
                title="Loop"
              >
                <svg className="player-w-4 player-h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className={cn(
                'player-p-2 player-text-gray-600 dark:player-text-gray-400',
                'hover:player-text-gray-900 dark:hover:player-text-gray-100',
                'hover:player-bg-gray-100 dark:hover:player-bg-gray-800',
                'player-rounded-md player-transition-all player-duration-200'
              )}
              title="Close Playlist"
            >
              <svg className="player-w-4 player-h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Playlist Content */}
      <div className="playlist-content player-px-4 player-py-4">
        {sortedRails.length > 0 ? (
          <div className="playlist-rails player-space-y-6">
            {sortedRails.map((rail) => (
              <PlaylistRail
                key={rail.id}
                rail={rail}
                config={config}
                callbacks={callbacks}
                focusKey={`${focusKey}-rail`}
                isExpanded={expandedRails.has(rail.id)}
                onToggleExpand={handleToggleExpand}
              />
            ))}
          </div>
        ) : (
          <div className="playlist-empty player-text-center player-py-12">
            <svg className="player-w-16 player-h-16 player-mx-auto player-mb-4 player-text-gray-300 dark:player-text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <h3 className="player-text-lg player-font-medium player-text-gray-900 dark:player-text-gray-100 player-mb-2">
              No Playlists Available
            </h3>
            <p className="player-text-gray-500 dark:player-text-gray-400">
              Add some content to get started with playlists.
            </p>
          </div>
        )}
      </div>

      {/* Resize Handle */}
      <div className="playlist-resize-handle player-absolute player-top-0 player-left-0 player-right-0 player-h-1 player-bg-gray-300 dark:player-bg-gray-600 hover:player-bg-blue-500 player-cursor-ns-resize player-transition-colors player-duration-200" />
    </div>
  );
};

export const Playlist = memo(PlaylistComponent);
