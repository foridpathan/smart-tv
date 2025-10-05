import { useFocusable } from '@smart-tv/ui';
import React, { memo, useEffect, useRef, useState } from 'react';
import { useBuffered, usePaused, usePlayerInstance, useTimeProgress } from '../hooks/useOptimizedHooks';
import { SeekBarProps } from '../types';
import { clamp, cn, formatTime } from '../utils';

const SeekBarComponent: React.FC<SeekBarProps> = ({
  className,
  style,
  focusKey = 'seek-bar',
  showPreview = true,
  stepTime = 10,
  onSeek,
  onSeekStart,
  onSeekEnd,
}) => {
  const player = usePlayerInstance();
  const { currentTime, duration } = useTimeProgress();
  const buffered = useBuffered();
  const paused = usePaused();
  const [isDragging, setIsDragging] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [showPreviewTooltip, setShowPreviewTooltip] = useState(false);
  const seekBarRef = useRef<HTMLDivElement>(null);

  const { ref, focused } = useFocusable({
    focusKey,
    onArrowPress: (direction) => {
      if (direction === 'left' || direction === 'right') {
        handleKeySeek(direction === 'right' ? stepTime : -stepTime);
        return false; // Prevent default navigation
      }
      return true;
    },
    onEnterPress: () => {
      // Toggle play/pause on enter
      if (player) {
        if (paused) {
          player.play();
        } else {
          player.pause();
        }
      }
    },
  });

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  // Calculate buffered progress
  const getBufferedProgress = () => {
    if (!buffered || buffered.length === 0 || duration === 0) return 0;
    
    // Find the buffered range that contains current time
    for (let i = 0; i < buffered.length; i++) {
      const start = buffered.start(i);
      const end = buffered.end(i);
      if (currentTime >= start && currentTime <= end) {
        return (end / duration) * 100;
      }
    }
    
    // If current time is not in any buffered range, return the latest buffered end
    if (buffered.length > 0) {
      const lastBufferedEnd = buffered.end(buffered.length - 1);
      return (lastBufferedEnd / duration) * 100;
    }
    
    return 0;
  };

  const bufferedProgress = getBufferedProgress();

  const handleKeySeek = (seconds: number) => {
    if (!player) return;
    
    const newTime = clamp(currentTime + seconds, 0, duration);
    onSeekStart?.();
    player.seek(newTime);
    onSeek?.(newTime);
    onSeekEnd?.();
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!seekBarRef.current || !showPreview) return;
    
    const rect = seekBarRef.current.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    const time = clamp(percentage * duration, 0, duration);
    
    setPreviewTime(time);
    setShowPreviewTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowPreviewTooltip(false);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!seekBarRef.current || !player) return;
    
    const rect = seekBarRef.current.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    const time = clamp(percentage * duration, 0, duration);
    
    onSeekStart?.();
    player.seek(time);
    onSeek?.(time);
    onSeekEnd?.();
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleClick(event);
    onSeekStart?.();
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onSeekEnd?.();
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => handleMouseUp();
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (isDragging && seekBarRef.current && player) {
        const rect = seekBarRef.current.getBoundingClientRect();
        const percentage = (event.clientX - rect.left) / rect.width;
        const time = clamp(percentage * duration, 0, duration);
        player.seek(time);
        onSeek?.(time);
      }
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mousemove', handleGlobalMouseMove);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging, duration, player, onSeek]);

  return (
    <div ref={ref} className={cn('player-relative player-group', className)} style={style}>
      {/* Time display */}
      <div className="player-flex player-items-center player-justify-between player-text-sm player-text-white player-mb-2">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Seek bar container */}
      <div
        ref={seekBarRef}
        className={cn(
          'player-relative player-h-2 player-bg-white player-bg-opacity-25 player-rounded-full player-cursor-pointer',
          'player-transition-all player-duration-200',
          focused && 'player-h-3 player-ring-2 player-ring-white player-ring-opacity-50',
          'hover:player-h-3'
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      >
        {/* Buffered progress */}
        <div
          className="player-absolute player-top-0 player-left-0 player-h-full player-bg-white player-bg-opacity-40 player-rounded-full player-transition-all player-duration-200"
          style={{ width: `${bufferedProgress}%` }}
        />
        
        {/* Current progress */}
        <div
          className="player-absolute player-top-0 player-left-0 player-h-full player-bg-white player-rounded-full player-transition-all player-duration-200"
          style={{ width: `${progress}%` }}
        />
        
        {/* Progress handle */}
        <div
          className={cn(
            'player-absolute player-top-1/2 player-transform player--translate-y-1/2 player-w-4 player-h-4 player-bg-white player-rounded-full',
            'player-transition-all player-duration-200 player-opacity-0 group-hover:player-opacity-100',
            focused && 'player-opacity-100 player-scale-125',
            isDragging && 'player-scale-150'
          )}
          style={{ left: `calc(${progress}% - 8px)` }}
        />
      </div>

      {/* Preview tooltip */}
      {showPreviewTooltip && showPreview && (
        <div
          className="player-absolute player-bottom-full player-mb-2 player-px-2 player-py-1 player-bg-black player-bg-opacity-80 player-text-white player-text-xs player-rounded player-whitespace-nowrap player-transform player--translate-x-1/2"
          style={{
            left: `${(previewTime / duration) * 100}%`,
          }}
        >
          {formatTime(previewTime)}
        </div>
      )}
    </div>
  );
};

// Export memoized component to prevent unnecessary re-renders
export const SeekBar = memo(SeekBarComponent);
