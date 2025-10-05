import { useFocusable } from '@smart-tv/ui';
import React, { memo, useEffect, useState } from 'react';
import { PlaylistItem } from '../types';
import { cn, formatTime } from '../utils';

interface AutoPlayCountdownProps {
  nextItem: PlaylistItem;
  countdown: number; // seconds
  onCancel: () => void;
  onConfirm: () => void;
  className?: string;
  focusKey?: string;
}

const AutoPlayCountdownComponent: React.FC<AutoPlayCountdownProps> = ({
  nextItem,
  countdown,
  onCancel,
  onConfirm,
  className,
  focusKey = 'autoplay-countdown',
}) => {
  const [timeLeft, setTimeLeft] = useState(countdown);

  const { ref: cancelRef, focused: cancelFocused } = useFocusable({
    focusKey: `${focusKey}-cancel`,
    onEnterPress: onCancel,
  });

  const { ref: playRef, focused: playFocused } = useFocusable({
    focusKey: `${focusKey}-play`,
    onEnterPress: onConfirm,
  });

  useEffect(() => {
    setTimeLeft(countdown);
  }, [countdown]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onConfirm();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onConfirm]);

  const progress = ((countdown - timeLeft) / countdown) * 100;

  return (
    <div
      className={cn(
        'autoplay-countdown',
        'player-absolute player-bottom-20 player-right-4',
        'player-bg-black player-bg-opacity-90 player-text-white',
        'player-rounded-lg player-p-4 player-min-w-[300px]',
        'player-border player-border-gray-600',
        'player-shadow-lg player-backdrop-blur-sm',
        'player-transition-all player-duration-300',
        'player-z-50',
        className
      )}
    >
      {/* Header */}
      <div className="player-flex player-items-center player-justify-between player-mb-3">
        <div className="player-flex player-items-center player-gap-2">
          <div className="player-w-2 player-h-2 player-bg-green-500 player-rounded-full player-animate-pulse" />
          <span className="player-text-sm player-font-medium">Auto-playing next</span>
        </div>
        <span className="player-text-lg player-font-bold player-text-green-400">
          {timeLeft}s
        </span>
      </div>

      {/* Progress Bar */}
      <div className="player-w-full player-h-1 player-bg-gray-700 player-rounded-full player-mb-3 player-overflow-hidden">
        <div 
          className="player-h-full player-bg-green-500 player-transition-all player-duration-1000 player-ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Next Item Info */}
      <div className="player-flex player-items-center player-gap-3 player-mb-4">
        {nextItem.thumbnail && (
          <div className="player-flex-shrink-0 player-w-16 player-h-10 player-bg-gray-700 player-rounded player-overflow-hidden">
            <img
              src={nextItem.thumbnail}
              alt={nextItem.title}
              className="player-w-full player-h-full player-object-cover"
              loading="lazy"
            />
          </div>
        )}
        
        <div className="player-flex-1 player-min-w-0">
          <h4 className="player-text-sm player-font-medium player-text-white player-truncate">
            {nextItem.title}
          </h4>
          {nextItem.description && (
            <p className="player-text-xs player-text-gray-400 player-truncate player-mt-1">
              {nextItem.description}
            </p>
          )}
          {nextItem.duration && (
            <span className="player-text-xs player-text-gray-500">
              {formatTime(nextItem.duration)}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="player-flex player-items-center player-gap-2">
        <button
          ref={cancelRef}
          onClick={onCancel}
          className={cn(
            'player-flex-1 player-px-3 player-py-2 player-text-sm player-font-medium',
            'player-text-gray-300 player-bg-gray-700 hover:player-bg-gray-600',
            'player-rounded-md player-transition-all player-duration-200',
            'player-border player-border-gray-600',
            cancelFocused && 'player-ring-2 player-ring-white player-ring-opacity-50'
          )}
        >
          Cancel
        </button>
        
        <button
          ref={playRef}
          onClick={onConfirm}
          className={cn(
            'player-flex-1 player-px-3 player-py-2 player-text-sm player-font-medium',
            'player-text-white player-bg-green-600 hover:player-bg-green-500',
            'player-rounded-md player-transition-all player-duration-200',
            'player-border player-border-green-500',
            playFocused && 'player-ring-2 player-ring-white player-ring-opacity-50'
          )}
        >
          <div className="player-flex player-items-center player-justify-center player-gap-2">
            <svg className="player-w-4 player-h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Play Now
          </div>
        </button>
      </div>

      {/* DRM Indicator */}
      {nextItem.drm && (
        <div className="player-flex player-items-center player-gap-1 player-mt-2 player-text-xs player-text-yellow-400">
          <svg className="player-w-3 player-h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>DRM Protected Content</span>
        </div>
      )}
    </div>
  );
};

export const AutoPlayCountdown = memo(AutoPlayCountdownComponent);
