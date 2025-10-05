import { useFocusable } from '@smart-tv/ui';
import React, { memo } from 'react';
import { PlaylistConfig, PlaylistItem as PlaylistItemType } from '../types';
import { cn, formatTime } from '../utils';

interface PlaylistItemProps {
  item: PlaylistItemType;
  config?: PlaylistConfig;
  focusKey?: string;
  onSelect?: (item: PlaylistItemType) => void;
  onPlay?: (item: PlaylistItemType) => void;
  className?: string;
}

const PlaylistItemComponent: React.FC<PlaylistItemProps> = ({
  item,
  config,
  focusKey = 'playlist-item',
  onSelect,
  onPlay,
  className,
}) => {
  const { ref, focused } = useFocusable({
    focusKey: `${focusKey}-${item.id}`,
    onEnterPress: () => {
      onPlay?.(item);
    },
    onArrowPress: () => {
      onSelect?.(item);
      return false;
    },
  });

  const showThumbnails = config?.showThumbnails !== false;
  const showDuration = config?.showDuration !== false;
  const showProgress = config?.showProgress !== false;

  return (
    <div
      ref={ref}
      className={cn(
        'playlist-item',
        'player-flex player-items-center player-p-2 player-rounded-md player-cursor-pointer',
        'player-transition-all player-duration-200',
        'hover:player-bg-gray-100 dark:hover:player-bg-gray-800',
        focused && 'player-ring-2 player-ring-blue-500 player-bg-blue-50 dark:player-bg-blue-900/30',
        item.isActive && 'player-bg-blue-100 dark:player-bg-blue-900/50 player-border-l-4 player-border-blue-500',
        className
      )}
      onClick={() => onPlay?.(item)}
    >
      {/* Thumbnail */}
      {showThumbnails && (
        <div className="playlist-item-thumbnail player-relative player-flex-shrink-0 player-w-20 player-h-12 player-mr-3 player-bg-gray-200 dark:player-bg-gray-700 player-rounded overflow-hidden">
          {item.thumbnail ? (
            <img
              src={item.thumbnail}
              alt={item.title}
              className="player-w-full player-h-full player-object-cover"
              loading="lazy"
            />
          ) : (
            <div className="player-w-full player-h-full player-flex player-items-center player-justify-center">
              <svg className="player-w-6 player-h-6 player-text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          
          {/* Duration overlay */}
          {showDuration && item.duration && (
            <div className="player-absolute player-bottom-1 player-right-1 player-bg-black player-bg-opacity-75 player-text-white player-text-xs player-px-1 player-rounded">
              {formatTime(item.duration)}
            </div>
          )}
          
          {/* Progress bar */}
          {showProgress && item.progress !== undefined && item.progress > 0 && (
            <div className="player-absolute player-bottom-0 player-left-0 player-w-full player-h-1 player-bg-black player-bg-opacity-25">
              <div 
                className="player-h-full player-bg-red-500 player-transition-all player-duration-300"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="playlist-item-content player-flex-1 player-min-w-0">
        <h4 className={cn(
          'playlist-item-title player-font-medium player-text-sm player-leading-tight player-truncate',
          item.isActive ? 'player-text-blue-600 dark:player-text-blue-400' : 'player-text-gray-900 dark:player-text-gray-100'
        )}>
          {item.title}
        </h4>
        
        {item.description && (
          <p className="playlist-item-description player-text-xs player-text-gray-600 dark:player-text-gray-400 player-mt-1 player-line-clamp-2">
            {item.description}
          </p>
        )}
        
        {/* Metadata */}
        <div className="playlist-item-metadata player-flex player-items-center player-gap-2 player-mt-1">
          {item.type && (
            <span className="player-text-xs player-text-gray-500 player-uppercase player-font-medium">
              {item.type}
            </span>
          )}
          
          {!showThumbnails && showDuration && item.duration && (
            <span className="player-text-xs player-text-gray-500">
              {formatTime(item.duration)}
            </span>
          )}
        </div>
      </div>

      {/* Active indicator */}
      {item.isActive && (
        <div className="playlist-item-indicator player-flex-shrink-0 player-ml-2">
          <div className="player-w-3 player-h-3 player-bg-blue-500 player-rounded-full player-animate-pulse" />
        </div>
      )}
    </div>
  );
};

export const PlaylistItem = memo(PlaylistItemComponent);
