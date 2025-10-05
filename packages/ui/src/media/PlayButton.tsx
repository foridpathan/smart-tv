import React, { forwardRef } from 'react';
import { useFocusable } from '../hooks/useFocusable';
import { useMediaActions, useMediaState } from './MediaContext';

export interface PlayButtonProps {
  disabled?: boolean;
  className?: string;
  playIcon?: React.ReactNode;
  pauseIcon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'circular' | 'square';
  focusKey?: string;
}

export interface PlayButtonRef {
  focus: () => void;
  click: () => void;
}

// Modular Play/Pause button component with smart TV navigation
export const PlayButton = forwardRef<PlayButtonRef, PlayButtonProps>(function PlayButton({
  disabled = false,
  className = '',
  playIcon,
  pauseIcon,
  size = 'medium',
  variant = 'default',
  focusKey
}, ref) {
  const { isPlaying } = useMediaState();
  const { play, pause, showControls } = useMediaActions();

  const handlePress = () => {
    if (disabled) return;
    
    showControls();
    
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const { ref: focusRef, focused } = useFocusable({
    focusKey,
    onEnterPress: handlePress,
    onFocus: () => showControls(),
  });

  React.useImperativeHandle(ref, () => ({
    focus: () => focusRef.current?.focus(),
    click: () => handlePress()
  }));

  const sizeClasses = {
    small: 'ui-w-8 ui-h-8 ui-text-sm',
    medium: 'ui-w-12 ui-h-12 ui-text-base',
    large: 'ui-w-16 ui-h-16 ui-text-lg'
  };

  const variantClasses = {
    default: 'ui-rounded',
    circular: 'ui-rounded-full',
    square: 'ui-rounded-none'
  };

  const defaultPlayIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" className="ui-w-1/2 ui-h-1/2">
      <path d="M8 5v14l11-7z"/>
    </svg>
  );

  const defaultPauseIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" className="ui-w-1/2 ui-h-1/2">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
    </svg>
  );

  return (
    <button
      ref={focusRef}
      onClick={handlePress}
      disabled={disabled}
      className={`
        tv-play-button
        ui-flex ui-items-center ui-justify-center
        ui-bg-blue-600 hover:ui-bg-blue-700 
        disabled:ui-bg-gray-400 disabled:ui-cursor-not-allowed
        ui-text-white
        ui-transition-all ui-duration-200
        focus:ui-outline-none 
        ${focused ? 'ui-ring-4 ui-ring-blue-300 ui-scale-110' : 'ui-ring-2 ui-ring-transparent'}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      aria-label={isPlaying ? 'Pause' : 'Play'}
      role="button"
    >
      {isPlaying ? (pauseIcon || defaultPauseIcon) : (playIcon || defaultPlayIcon)}
    </button>
  );
});
