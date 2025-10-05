import { useFocusable } from '@smart-tv/ui';
import React, { memo, useCallback } from 'react';
import { usePlayerInstance, useVolumeState } from '../hooks/useOptimizedHooks';
import { VolumeControlProps } from '../types';
import { clamp, cn, shallowEqual } from '../utils';

export const VolumeControl: React.FC<VolumeControlProps> = memo(({
  className,
  style,
  focusKey = 'volume-control',
  orientation = 'horizontal',
  showMuteButton = true,
  step = 0.1,
  onVolumeChange,
  onMuteToggle,
}) => {
  const player = usePlayerInstance();
  const { volume, muted } = useVolumeState();

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!player) return;
    
    const clampedVolume = clamp(newVolume, 0, 1);
    player.setVolume(clampedVolume);
    onVolumeChange?.(clampedVolume);
  }, [player, onVolumeChange]);

  const handleMuteToggle = useCallback(() => {
    if (!player) return;
    
    const newMuted = !muted;
    player.setMuted(newMuted);
    onMuteToggle?.();
  }, [player, muted, onMuteToggle]);

  const { ref, focused } = useFocusable({
    focusKey,
    onArrowPress: (direction) => {
      const isHorizontal = orientation === 'horizontal';
      const increaseVolume = 
        (isHorizontal && direction === 'right') || 
        (!isHorizontal && direction === 'up');
      const decreaseVolume = 
        (isHorizontal && direction === 'left') || 
        (!isHorizontal && direction === 'down');

      if (increaseVolume || decreaseVolume) {
        const newVolume = clamp(
          volume + (increaseVolume ? step : -step),
          0,
          1
        );
        handleVolumeChange(newVolume);
        return false; // Prevent default navigation
      }
      return true;
    },
    onEnterPress: () => {
      if (showMuteButton) {
        handleMuteToggle();
      }
    },
  });

  const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    let percentage: number;
    
    if (orientation === 'horizontal') {
      percentage = (event.clientX - rect.left) / rect.width;
    } else {
      percentage = 1 - (event.clientY - rect.top) / rect.height;
    }
    
    const newVolume = clamp(percentage, 0, 1);
    handleVolumeChange(newVolume);
  }, [orientation, handleVolumeChange]);

  const VolumeIcon = () => {
    if (muted || volume === 0) {
      return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="player-w-5 player-h-5">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
      );
    } else if (volume < 0.5) {
      return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="player-w-5 player-h-5">
          <path d="M7 9v6h4l5 5V4l-5 5H7z"/>
        </svg>
      );
    } else {
      return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="player-w-5 player-h-5">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      );
    }
  };

  const displayVolume = muted ? 0 : volume;
  const progressPercentage = displayVolume * 100;

  return (
    <div
      ref={ref}
      className={cn(
        'player-flex player-items-center player-gap-2 player-text-white',
        orientation === 'vertical' && 'player-flex-col',
        className
      )}
      style={style}
    >
      {showMuteButton && (
        <button
          className={cn(
              'player-p-1 player-rounded hover:player-bg-white hover:player-bg-opacity-20 player-transition-colors',
              focused && 'player-bg-white player-bg-opacity-20'
            )}
          onClick={handleMuteToggle}
        >
          <VolumeIcon />
        </button>
      )}

      {/* Volume slider */}
      <div
        className={cn(
          'player-relative player-bg-white player-bg-opacity-25 player-rounded-full player-cursor-pointer player-group',
          orientation === 'horizontal' ? 'player-w-20 player-h-1' : 'player-h-20 player-w-1',
          focused && 'player-ring-2 player-ring-white player-ring-opacity-50'
        )}
        onClick={handleClick}
      >
        {/* Volume progress */}
        <div
          className={cn(
            'player-absolute player-bg-white player-rounded-full player-transition-all player-duration-200',
            orientation === 'horizontal' 
              ? 'player-top-0 player-left-0 player-h-full' 
              : 'player-bottom-0 player-left-0 player-w-full'
          )}
          style={{
            [orientation === 'horizontal' ? 'width' : 'height']: `${progressPercentage}%`,
          }}
        />
        
        {/* Volume handle */}
        <div
          className={cn(
            'player-absolute player-w-3 player-h-3 player-bg-white player-rounded-full player-transform',
            'player-transition-all player-duration-200 player-opacity-0 group-hover:player-opacity-100',
            orientation === 'horizontal' 
              ? 'player-top-1/2 -player-translate-y-1/2 -player-translate-x-1/2' 
              : 'player-left-1/2 -player-translate-x-1/2 player-translate-y-1/2',
            focused && 'player-opacity-100 player-scale-125'
          )}
          style={{
            [orientation === 'horizontal' ? 'left' : 'bottom']: `${progressPercentage}%`,
          }}
        />
      </div>

      {/* Volume percentage (optional) */}
      {focused && (
        <span className="player-text-xs player-min-w-[2rem] player-text-center">
          {Math.round(displayVolume * 100)}%
        </span>
      )}
    </div>
  );
}, shallowEqual);
