import React, { forwardRef, useCallback, useState } from 'react';
import { useMediaActions, useMediaState } from '../media/MediaContext';
import { cn } from '../utils';
import { SmartTVButton } from './SmartTVButton';

export interface SmartTVProgressProps {
  handleSkipForward?: () => void;
  handleSkipBack?: () => void;
  disabled?: boolean;
  className?: string;
  activeClass?: string;
  selectedClass?: string;
  progressClassName?: string;
  progressSelectedClass?: string;
  timerStyle?: 'leftRight' | 'leftTop' | 'rightTop' | 'leftBottom' | 'rightBottom';
  focusKey?: string;
}

export interface SmartTVProgressRef {
  focus: () => void;
  seek: (time: number) => void;
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Smart TV compatible Progress Bar component
export const SmartTVProgress = forwardRef<SmartTVProgressRef, SmartTVProgressProps>(function SmartTVProgress({
  handleSkipForward,
  handleSkipBack,
  disabled = false,
  className = '',
  activeClass = '',
  selectedClass = '',
  progressClassName = '',
  progressSelectedClass = '',
  timerStyle = 'leftRight',
  focusKey = 'progress-bar-button'
}, ref) {
  const { currentTime, duration, isPlaying } = useMediaState();
  const { play, pause, seek, showControls } = useMediaActions();
  
  const [isSkipping, setIsSkipping] = useState(false);
  
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  React.useImperativeHandle(ref, () => ({
    focus: () => {
      // Focus will be handled by the SmartTVButton
    },
    seek: (time: number) => {
      seek(time);
    }
  }));

  const togglePlay = () => {
    showControls();
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleArrowPress = useCallback((dir: string) => {
    if (disabled) return false;
    
    showControls();
    
    if (dir === 'up' || dir === 'down') return true;
    
    setIsSkipping(true);
    
    if (dir === 'left' && handleSkipBack) {
      handleSkipBack();
    } else if (dir === 'right' && handleSkipForward) {
      handleSkipForward();
    }
    
    setTimeout(() => setIsSkipping(false), 300);
    
    return false;
  }, [disabled, showControls, handleSkipBack, handleSkipForward]);

  const handleSeekToPosition = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    const innerDiv = event.currentTarget;
    const clickX = event.nativeEvent.offsetX;
    const calculatedPercentage = clickX / innerDiv.offsetWidth;
    const seekTime = calculatedPercentage * duration;
    
    seek(seekTime);
    showControls();
  };

  // Helper function to determine layout style
  const isHorizontal = timerStyle === 'leftRight';
  const isTop = timerStyle === 'leftTop' || timerStyle === 'rightTop';
  const isBottom = timerStyle === 'leftBottom' || timerStyle === 'rightBottom';

  return (
    <div
      className={cn(
        'ui-flex ui-pt-6 ui-text-white ui-transition-all ui-delay-150 ui-flex-col',
        isHorizontal ? 'ui-flex-row ui-items-center ui-space-x-3' : 'ui-space-y-3',
        className
      )}
    >
      {isHorizontal ? (
        <span className="ui-text-2xl ui-w-24">
          {formatTime(currentTime)}
        </span>
      ) : isTop ? (
        <div
          className={cn(
            'ui-flex ui-text-2xl ui-flex-1',
            timerStyle === 'leftTop' ? 'ui-justify-start' : 'ui-justify-end'
          )}
        >
          <span className="ui-text-2xl">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      ) : null}
      
      <div
        className={cn(
          'ui-flex-1 ui-h-2 ui-bg-gray-300 ui-bg-opacity-35 ui-cursor-pointer ui-transition-all',
          progressClassName
        )}
        onMouseDown={(e) => e.preventDefault()}
        onMouseUp={handleSeekToPosition}
      >
        <div className="ui-relative ui-h-2 ui-transition-all">
          <SmartTVButton
            style={{ left: `${progressPercentage}%` }}
            className={cn(
              'ui-w-6 ui-h-6 ui-bg-white ui-rounded-full ui-absolute -ui-top-2 ui-transition-all ui-border-transparent',
              isSkipping && 'ui-animate-pulse'
            )}
            activeClass={cn(
              'ui-w-10 ui-h-10 -ui-top-4 ui-border-double ui-border-8 ui-border-gray-600',
              selectedClass
            )}
            focusKey={focusKey}
            handleArrowPress={handleArrowPress}
            handlePress={togglePlay}
            disabled={disabled}
          />
          
          <span
            className={cn(
              'ui-absolute ui-transition-all ui-h-full ui-block ui-left-0 ui-bg-white',
              progressSelectedClass
            )}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {isHorizontal ? (
        <span className="ui-text-2xl ui-w-20 ui-text-right">
          {formatTime(duration)}
        </span>
      ) : isBottom ? (
        <div
          className={cn(
            'ui-flex ui-text-2xl ui-flex-1',
            timerStyle === 'leftBottom' ? 'ui-justify-start' : 'ui-justify-end'
          )}
        >
          <span className="ui-text-2xl">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      ) : null}
    </div>
  );
});

export default SmartTVProgress;
