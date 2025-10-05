import { useFocusable } from '@smart-tv/ui';
import React, { memo } from 'react';
import { cn } from '../utils';

interface PlaylistButtonProps {
  className?: string;
  style?: React.CSSProperties;
  focusKey?: string;
  isActive?: boolean;
  itemCount?: number;
  onClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const PlaylistButtonComponent: React.FC<PlaylistButtonProps> = ({
  className,
  style,
  focusKey = 'playlist-button',
  isActive = false,
  itemCount = 0,
  onClick,
  onFocus,
  onBlur,
}) => {
  const { ref, focused } = useFocusable({
    focusKey,
    onEnterPress: () => {
      onClick?.();
    },
    onFocus,
    onBlur,
  });

  return (
    <button
      ref={ref}
      className={cn(
        'playlist-button',
        'player-relative player-flex player-items-center player-justify-center',
        'player-w-10 player-h-10',
        'player-transition-all player-duration-200',
        'player-text-white hover:player-text-white',
        'hover:player-bg-white/20 focus:player-bg-white/20',
        focused && 'player-ring-2 player-ring-white player-ring-opacity-50',
        isActive && 'player-bg-white/30',
        className
      )}
      style={style}
      onClick={onClick}
      title={`${isActive ? 'Hide' : 'Show'} Playlist${itemCount > 0 ? ` (${itemCount} items)` : ''}`}
      aria-label={`${isActive ? 'Hide' : 'Show'} Playlist`}
      aria-pressed={isActive}
    >
      {/* Playlist Icon */}
      <svg
        className="player-w-5 player-h-5"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
          clipRule="evenodd"
        />
      </svg>

      {/* Item Count Badge */}
      {itemCount > 0 && (
        <div className="player-absolute player--top-1 player--right-1 player-min-w-[18px] player-h-[18px] player-bg-red-500 player-text-white player-text-xs player-font-bold player-rounded-full player-flex player-items-center player-justify-center player-px-1">
          {itemCount > 99 ? '99+' : itemCount}
        </div>
      )}

      {/* Active Indicator */}
      {isActive && (
        <div className="player-absolute player-bottom-0 player-left-1/2 player-transform player--translate-x-1/2 player-w-1 player-h-1 player-bg-white player-rounded-full" />
      )}
    </button>
  );
};

export const PlaylistButton = memo(PlaylistButtonComponent);
