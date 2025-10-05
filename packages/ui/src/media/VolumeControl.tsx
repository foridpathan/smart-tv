
import React, { forwardRef, useCallback, useRef } from 'react';
import { useFocusable } from '../hooks/useFocusable';
import { useMediaActions, useMediaState } from './MediaContext';

export interface VolumeControlProps {
  disabled?: boolean;
  className?: string;
  showMuteButton?: boolean;
  orientation?: 'horizontal' | 'vertical';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  backgroundColor?: string;
  muteIcon?: React.ReactNode;
  volumeIcon?: React.ReactNode;
  steps?: number;
  focusKey?: string;
  muteFocusKey?: string;
}

export interface VolumeControlRef {
  focus: () => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unmute: () => void;
}

// Modular Volume Control component with smart TV navigation
export const VolumeControl = forwardRef<VolumeControlRef, VolumeControlProps>(function VolumeControl({
  disabled = false,
  className = '',
  showMuteButton = true,
  orientation = 'horizontal',
  size = 'medium',
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  muteIcon,
  volumeIcon,
  steps = 20,
  focusKey,
  muteFocusKey
}, ref) {
  const { volume, muted } = useMediaState();
  const { setVolume, toggleMute, showControls } = useMediaActions();
  const sliderRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const displayVolume = muted ? 0 : volume;
  const volumePercentage = displayVolume * 100;

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(event.target.value) / 100;
    setVolume(newVolume);
    showControls();
  };

  const handleMuteToggle = useCallback(() => {
    toggleMute();
    showControls();
  }, [toggleMute, showControls]);

  // Smart TV navigation for volume slider
  const handleVolumeArrowPress = useCallback((direction: string) => {
    if (disabled) return false;
    
    showControls();
    
    if (direction === 'left' || direction === 'right') {
      const increment = direction === 'right' ? 0.05 : -0.05; // 5% jumps
      const newVolume = Math.max(0, Math.min(1, volume + increment));
      setVolume(newVolume);
      return false; // Prevent default navigation
    }
    
    return true; // Allow default navigation for up/down
  }, [disabled, showControls, volume, setVolume]);

  // Smart TV navigation for mute button
  const handleMutePress = useCallback(() => {
    handleMuteToggle();
  }, [handleMuteToggle]);

  const { ref: volumeFocusRef, focused: volumeFocused } = useFocusable({
    focusKey,
    onArrowPress: handleVolumeArrowPress,
    onFocus: () => showControls(),
  });

  const { ref: muteFocusRef, focused: muteFocused } = useFocusable({
    focusKey: muteFocusKey,
    onEnterPress: handleMutePress,
    onFocus: () => showControls(),
  });

  React.useImperativeHandle(ref, () => ({
    focus: () => {
      if (showMuteButton) {
        buttonRef.current?.focus();
      } else {
        sliderRef.current?.focus();
      }
    },
    setVolume: (vol: number) => {
      setVolume(Math.max(0, Math.min(1, vol)));
    },
    mute: () => {
      if (!muted) {
        toggleMute();
      }
    },
    unmute: () => {
      if (muted) {
        toggleMute();
      }
    }
  }));

  const sizeClasses = {
    small: showMuteButton ? 'ui-gap-1' : '',
    medium: showMuteButton ? 'ui-gap-2' : '',
    large: showMuteButton ? 'ui-gap-3' : ''
  };

  const sliderSizeClasses = {
    small: orientation === 'horizontal' ? 'ui-w-16 ui-h-1' : 'ui-h-16 ui-w-1',
    medium: orientation === 'horizontal' ? 'ui-w-24 ui-h-2' : 'ui-h-24 ui-w-2',
    large: orientation === 'horizontal' ? 'ui-w-32 ui-h-3' : 'ui-h-32 ui-w-3'
  };

  const buttonSizeClasses = {
    small: 'ui-w-6 ui-h-6',
    medium: 'ui-w-8 ui-h-8',
    large: 'ui-w-10 ui-h-10'
  };

  const getVolumeIcon = () => {
    if (volumeIcon) return volumeIcon;
    
    if (muted || volume === 0) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="ui-w-full ui-h-full">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
      );
    }
    
    if (volume < 0.3) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="ui-w-full ui-h-full">
          <path d="M7 9v6h4l5 5V4l-5 5H7z"/>
        </svg>
      );
    }
    
    if (volume < 0.7) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="ui-w-full ui-h-full">
          <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
        </svg>
      );
    }
    
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="ui-w-full ui-h-full">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>
    );
  };

  const containerClass = orientation === 'horizontal' 
    ? `ui-flex ui-items-center ${sizeClasses[size]}`
    : `ui-flex ui-flex-col ui-items-center ${sizeClasses[size]}`;

  return (
    <div className={`tv-volume-control ${containerClass} ${className}`}>
      {showMuteButton && (
        <button
          ref={muteFocusRef}
          onClick={handleMuteToggle}
          disabled={disabled}
          className={`
            tv-mute-button
            ui-flex ui-items-center ui-justify-center
            ui-text-gray-600 hover:ui-text-gray-900
            disabled:ui-text-gray-300 disabled:ui-cursor-not-allowed
            ui-transition-all ui-duration-200
            focus:ui-outline-none
            ${muteFocused ? 'ui-ring-4 ui-ring-blue-300 ui-scale-110' : 'ui-ring-2 ui-ring-transparent'}
            ${buttonSizeClasses[size]}
          `}
          aria-label={muted ? 'Unmute' : 'Mute'}
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muteIcon || getVolumeIcon()}
        </button>
      )}
      
      <div className="ui-relative">
        {/* Background track */}
        <div 
          className={`ui-absolute ui-rounded-full ${sliderSizeClasses[size]}`}
          style={{ backgroundColor }}
        />
        
        {/* Volume progress */}
        <div 
          className={`
            ui-absolute ui-rounded-full ui-transition-all ui-duration-200
            ${orientation === 'horizontal' ? 'ui-h-full' : 'ui-w-full'}
          `}
          style={{ 
            [orientation === 'horizontal' ? 'width' : 'height']: `${volumePercentage}%`,
            backgroundColor: color
          }}
        />
        
        {/* Slider input */}
        <input
          ref={volumeFocusRef}
          type="range"
          min="0"
          max="100"
          step={100 / steps}
          value={volumePercentage}
          onChange={handleVolumeChange}
          disabled={disabled}
          className={`
            tv-volume-slider
            ui-absolute ui-appearance-none ui-bg-transparent ui-cursor-pointer
            focus:ui-outline-none
            ${volumeFocused ? 'ui-ring-4 ui-ring-blue-300' : 'ui-ring-2 ui-ring-transparent'}
            disabled:ui-cursor-not-allowed
            ${sliderSizeClasses[size]}
            ${orientation === 'vertical' ? 'ui-rotate-90' : ''}
            ui-transition-all ui-duration-200
          `}
          style={{ background: 'transparent' }}
          aria-label="Volume"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(volumePercentage)}
          aria-valuetext={`Volume ${Math.round(volumePercentage)}%`}
        />
      </div>
      
      {volumeFocused && (
        <div className="ui-text-xs ui-text-center ui-mt-1 ui-text-blue-600">
          Use ← → arrows to adjust volume
        </div>
      )}
    </div>
  );
});
