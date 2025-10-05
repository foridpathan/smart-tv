
import React, { forwardRef, useCallback, useState } from 'react';
import { useFocusable } from '../hooks/useFocusable';
import { useMediaActions, useMediaState } from './MediaContext';

export interface SeekBarProps {
  disabled?: boolean;
  className?: string;
  onSeekStart?: () => void;
  onSeekEnd?: () => void;
  showTime?: boolean;
  showBuffer?: boolean;
  height?: 'thin' | 'medium' | 'thick';
  color?: string;
  bufferColor?: string;
  backgroundColor?: string;
  thumbSize?: 'small' | 'medium' | 'large';
  focusKey?: string;
}

export interface SeekBarRef {
  focus: () => void;
  seek: (time: number) => void;
}

// Format time in MM:SS or HH:MM:SS format
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

// Modular Seek Bar component for video scrubbing with smart TV navigation
export const SeekBar = forwardRef<SeekBarRef, SeekBarProps>(function SeekBar({
  disabled = false,
  className = '',
  onSeekStart,
  onSeekEnd,
  showTime = true,
  showBuffer = true,
  height = 'medium',
  color = '#3b82f6',
  bufferColor = '#9ca3af',
  backgroundColor = '#e5e7eb',
  thumbSize = 'medium',
  focusKey
}, ref) {
  const { currentTime, duration, buffered } = useMediaState();
  const { seek, showControls } = useMediaActions();
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferProgress = duration > 0 ? (buffered / duration) * 100 : 0;
  const displayValue = isDragging ? dragValue : progress;

  const handleSeekStart = useCallback(() => {
    setIsDragging(true);
    showControls();
    onSeekStart?.();
  }, [onSeekStart, showControls]);

  const handleSeekEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      const seekTime = (dragValue / 100) * duration;
      seek(seekTime);
      onSeekEnd?.();
    }
  }, [isDragging, dragValue, duration, seek, onSeekEnd]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setDragValue(value);
    
    if (!isDragging) {
      const seekTime = (value / 100) * duration;
      seek(seekTime);
    }
  }, [isDragging, duration, seek]);

  // Smart TV navigation handlers
  const handleArrowPress = useCallback((direction: string) => {
    if (disabled) return false;
    
    showControls();
    
    if (direction === 'left' || direction === 'right') {
      const increment = direction === 'right' ? 5 : -5; // 5 second jumps
      const newTime = Math.max(0, Math.min(duration, currentTime + increment));
      seek(newTime);
      return false; // Prevent default navigation
    }
    
    return true; // Allow default navigation for up/down
  }, [disabled, showControls, currentTime, duration, seek]);

  const { ref: focusRef, focused } = useFocusable({
    focusKey,
    onArrowPress: handleArrowPress,
    onFocus: () => showControls(),
  });

  React.useImperativeHandle(ref, () => ({
    focus: () => focusRef.current?.focus(),
    seek: (time: number) => {
      const percentage = duration > 0 ? (time / duration) * 100 : 0;
      setDragValue(percentage);
      seek(time);
    }
  }));

  const heightClasses = {
    thin: 'ui-h-1',
    medium: 'ui-h-2',
    thick: 'ui-h-3'
  };

  const thumbSizeClasses = {
    small: 'ui-w-3 ui-h-3',
    medium: 'ui-w-4 ui-h-4',
    large: 'ui-w-5 ui-h-5'
  };

  return (
    <div className={`tv-seek-bar-container ${className}`}>
      {showTime && (
        <div className="ui-flex ui-justify-between ui-text-sm ui-text-gray-600 ui-mb-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      )}
      
      <div className="ui-relative">
        {/* Background track */}
        <div 
          className={`ui-absolute ui-w-full ui-rounded-full ${heightClasses[height]}`}
          style={{ backgroundColor }}
        />
        
        {/* Buffer progress */}
        {showBuffer && (
          <div 
            className={`ui-absolute ui-rounded-full ${heightClasses[height]} ui-transition-all ui-duration-200`}
            style={{ 
              width: `${bufferProgress}%`,
              backgroundColor: bufferColor
            }}
          />
        )}
        
        {/* Current progress */}
        <div 
          className={`ui-absolute ui-rounded-full ${heightClasses[height]} ui-transition-all ui-duration-200`}
          style={{ 
            width: `${displayValue}%`,
            backgroundColor: color
          }}
        />
        
        {/* Slider input */}
        <input
          ref={focusRef}
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={displayValue}
          onChange={handleChange}
          onMouseDown={handleSeekStart}
          onMouseUp={handleSeekEnd}
          disabled={disabled}
          className={`
            tv-seek-bar
            ui-absolute ui-w-full ui-appearance-none ui-bg-transparent ui-cursor-pointer
            focus:ui-outline-none
            ${focused ? 'ui-ring-4 ui-ring-blue-300' : 'ui-ring-2 ui-ring-transparent'}
            disabled:ui-cursor-not-allowed
            ${heightClasses[height]}
            ui-transition-all ui-duration-200
          `}
          style={{
            background: 'transparent'
          }}
          aria-label="Seek video"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
          aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
        />
        
        {/* Custom thumb */}
        <div 
          className={`
            ui-absolute ui-top-1/2 ui-transform -ui-translate-y-1/2 -ui-translate-x-1/2
            ui-rounded-full ui-border-2 ui-border-white ui-shadow-lg
            ui-transition-all ui-duration-200
            ${thumbSizeClasses[thumbSize]}
            ${disabled ? 'ui-opacity-50' : focused ? 'ui-scale-125' : 'hover:ui-scale-110'}
          `}
          style={{ 
            left: `${displayValue}%`,
            backgroundColor: color
          }}
        />
      </div>
      
      {focused && (
        <div className="ui-text-xs ui-text-center ui-mt-1 ui-text-blue-600">
          Use ← → arrows to seek
        </div>
      )}
    </div>
  );
});
