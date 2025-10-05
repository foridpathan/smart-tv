import { useFocusable } from '@smart-tv/ui';
import React, { memo, useCallback, useState } from 'react';
import { PlaylistCallbacks, PlaylistConfig, PlaylistRail as PlaylistRailType } from '../types';
import { cn } from '../utils';
import { PlaylistItem } from './PlaylistItem';

interface PlaylistRailProps {
  rail: PlaylistRailType;
  config?: PlaylistConfig;
  callbacks?: PlaylistCallbacks;
  focusKey?: string;
  className?: string;
  isExpanded?: boolean;
  onToggleExpand?: (railId: string) => void;
}

const PlaylistRailComponent: React.FC<PlaylistRailProps> = ({
  rail,
  config,
  callbacks,
  focusKey = 'playlist-rail',
  className,
  isExpanded = false,
  onToggleExpand,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerRow = config?.itemsPerRow || 4;
  const maxVisible = rail.maxVisible || (isExpanded ? rail.items.length : itemsPerRow);
  const visibleItems = rail.items.slice(0, maxVisible);
  const hasMore = rail.items.length > maxVisible;

  const { ref, focused, hasFocusedChild } = useFocusable({
    focusKey: `${focusKey}-${rail.id}`,
    trackChildren: true,
    saveLastFocusedChild: true,
  });

  const handleToggleExpand = useCallback(() => {
    if (rail.isCollapsible !== false) {
      onToggleExpand?.(rail.id);
      if (isExpanded) {
        callbacks?.onRailCollapse?.(rail.id);
      } else {
        callbacks?.onRailExpand?.(rail.id);
      }
    }
  }, [rail.id, rail.isCollapsible, isExpanded, onToggleExpand, callbacks]);

  const handleLoadMore = useCallback(async () => {
    if (!callbacks?.onLoadMore || isLoading) return;
    
    setIsLoading(true);
    try {
      const newItems = await callbacks.onLoadMore(rail.id);
      // Note: The parent should handle updating the rail items
    } catch (error) {
      console.error('Failed to load more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [rail.id, callbacks, isLoading]);

  const getRailIcon = () => {
    switch (rail.type) {
      case 'queue':
        return (
          <svg className="player-w-4 player-h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'related':
        return (
          <svg className="player-w-4 player-h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
          </svg>
        );
      case 'recommendations':
        return (
          <svg className="player-w-4 player-h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        );
      case 'history':
        return (
          <svg className="player-w-4 player-h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="player-w-4 player-h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        'playlist-rail',
        'player-mb-6 player-select-none',
        (focused || hasFocusedChild) && 'player-ring-1 player-ring-blue-500 player-rounded-lg',
        className
      )}
    >
      {/* Rail Header */}
      <div className="playlist-rail-header player-flex player-items-center player-justify-between player-mb-3">
        <div className="player-flex player-items-center player-gap-2">
          <div className="player-text-gray-600 dark:player-text-gray-400">
            {getRailIcon()}
          </div>
          <h3 className="player-text-lg player-font-semibold player-text-gray-900 dark:player-text-gray-100">
            {rail.title}
          </h3>
          <span className="player-text-sm player-text-gray-500 player-bg-gray-100 dark:player-bg-gray-800 player-px-2 player-py-1 player-rounded-full">
            {rail.items.length}
          </span>
        </div>

        {/* Expand/Collapse Button */}
        {rail.isCollapsible !== false && hasMore && (
          <button
            onClick={handleToggleExpand}
            className={cn(
              'player-flex player-items-center player-gap-1 player-px-3 player-py-1 player-text-sm',
              'player-text-blue-600 dark:player-text-blue-400 hover:player-text-blue-800 dark:hover:player-text-blue-300',
              'player-border player-border-blue-200 dark:player-border-blue-800 player-rounded-full',
              'hover:player-bg-blue-50 dark:hover:player-bg-blue-900/50',
              'player-transition-all player-duration-200'
            )}
          >
            <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
            <svg 
              className={cn(
                'player-w-4 player-h-4 player-transition-transform player-duration-200',
                isExpanded && 'player-rotate-180'
              )} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Rail Content */}
      <div className="playlist-rail-content">
        {visibleItems.length > 0 ? (
          <div 
            className={cn(
              'playlist-rail-items player-grid player-gap-2',
              config?.itemsPerRow ? `player-grid-cols-${Math.min(config.itemsPerRow, 6)}` : 'player-grid-cols-1'
            )}
            style={{
              maxHeight: config?.maxRailHeight ? `${config.maxRailHeight}px` : undefined,
              overflowY: config?.maxRailHeight ? 'auto' : 'visible'
            }}
          >
            {visibleItems.map((item) => (
              <PlaylistItem
                key={item.id}
                item={item}
                config={config}
                focusKey={`${focusKey}-${rail.id}-item`}
                onSelect={callbacks?.onItemSelect}
                onPlay={callbacks?.onItemPlay}
              />
            ))}
          </div>
        ) : (
          <div className="player-text-center player-py-8 player-text-gray-500 dark:player-text-gray-400">
            <svg className="player-w-12 player-h-12 player-mx-auto player-mb-4 player-text-gray-300 dark:player-text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <p>No items in this playlist</p>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !isExpanded && callbacks?.onLoadMore && (
          <div className="player-mt-4 player-text-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className={cn(
                'player-px-4 player-py-2 player-text-sm player-font-medium',
                'player-text-blue-600 dark:player-text-blue-400',
                'player-border player-border-blue-200 dark:player-border-blue-800',
                'player-rounded-lg player-transition-all player-duration-200',
                'hover:player-bg-blue-50 dark:hover:player-bg-blue-900/50',
                'disabled:player-opacity-50 disabled:player-cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <div className="player-flex player-items-center player-gap-2">
                  <div className="player-w-4 player-h-4 player-border-2 player-border-blue-600 player-border-t-transparent player-rounded-full player-animate-spin" />
                  Loading...
                </div>
              ) : (
                `Load More (${rail.items.length - maxVisible} remaining)`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const PlaylistRail = memo(PlaylistRailComponent);
