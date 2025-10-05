import { useFocusable } from '@smart-tv/ui';
import React, { memo } from 'react';
import { usePlaybackState, usePlayerInstance } from '../hooks/useOptimizedHooks';
import { PlayButtonProps } from '../types';
import { cn } from '../utils';

const PlayButtonComponent: React.FC<PlayButtonProps> = ({
  className,
  style,
  focusKey = 'play-button',
  size = 'md',
  variant = 'default',
  showIcon = true,
  playIcon,
  pauseIcon,
  onClick,
  onFocus,
  onBlur,
}) => {
  const player = usePlayerInstance();
  const { paused, loading } = usePlaybackState();

  const { ref, focused } = useFocusable({
    focusKey,
    onEnterPress: handlePress,
    onFocus: onFocus as any,
    onBlur: onBlur as any,
  });

  async function handlePress() {
    if (loading || !player) return;

    if (paused) {
      await player.play();
    } else {
      player.pause();
    }

    onClick?.();
  }

  const sizeClasses = {
    sm: 'player-w-8 player-h-8 player-text-sm',
    md: 'player-w-12 player-h-12 player-text-base',
    lg: 'player-w-16 player-h-16 player-text-lg',
  };

  const variantClasses = {
    default: 'player-bg-white player-bg-opacity-20 hover:player-bg-opacity-30 player-text-white',
    ghost: 'player-bg-transparent hover:player-bg-white hover:player-bg-opacity-10 player-text-white',
    outline: 'player-border player-border-white player-border-opacity-50 hover:player-border-opacity-100 player-bg-transparent player-text-white',
  };

  const DefaultPlayIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="player-w-6 player-h-6">
      <path d="M8 5v14l11-7z" />
    </svg>
  );

  const DefaultPauseIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="player-w-6 player-h-6">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );

  return (
    <button
      ref={ref}
      className={cn(
        'player-flex player-items-center player-justify-center player-rounded-full player-transition-all player-duration-200',
        'focus:player-outline-none focus:player-ring-2 focus:player-ring-white focus:player-ring-opacity-50',
        sizeClasses[size],
        variantClasses[variant],
        focused && 'player-ring-2 player-ring-white player-ring-opacity-75 player-scale-110',
        loading && 'player-opacity-50 player-cursor-not-allowed',
        className
      )}
      style={style}
      onClick={handlePress}
      disabled={loading}
    >
      {showIcon && !loading && (
        <>
          {paused ? (
            playIcon || <DefaultPlayIcon />
          ) : (
            pauseIcon || <DefaultPauseIcon />
          )}
        </>
      )}

      {loading && (
        <div className="player-animate-spin player-rounded-full player-h-4 player-w-4 player-border-b-2 player-border-white" />
      )}
    </button>
  );
};

// Export memoized component to prevent unnecessary re-renders
export const PlayButton = memo(PlayButtonComponent);
