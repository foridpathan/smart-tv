import { useFocusable } from '@smart-tv/ui';
import React, { useEffect, useState } from 'react';
import { useMediaContext } from '../hooks/MediaContext';
import { PlayerControlsProps } from '../types';
import { cn } from '../utils';
import { Fullscreen } from './Fullscreen';
import { PictureInPicture } from './PictureInPicture';
import { PlayButton } from './PlayButton';
import { SeekBar } from './SeekBar';
import { TrackSelector } from './TrackSelector';
import { VolumeControl } from './VolumeControl';

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  className,
  style,
  showOnHover = true,
  autoHide = true,
  autoHideDelay = 4000,
  focusKey = 'player-controls',
  children,
}) => {
  const { state } = useMediaContext();
  const [isVisible, setIsVisible] = useState(true);
  const [showTrackSelector, setShowTrackSelector] = useState(false);
  const [trackSelectorType, setTrackSelectorType] = useState<'audio' | 'video' | 'text'>('audio');
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  const { ref, focused, hasFocusedChild } = useFocusable({
    focusKey,
    trackChildren: true,
    saveLastFocusedChild: true,
  });

  // Auto-hide logic
  useEffect(() => {
    if (!autoHide) return;

    const shouldShow = focused || hasFocusedChild || showTrackSelector || state.paused;
    
    if (shouldShow) {
      setIsVisible(true);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        setHideTimeout(null);
      }
    } else {
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);
      setHideTimeout(timeout);
    }

    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [focused, hasFocusedChild, showTrackSelector, state.paused, autoHide, autoHideDelay, hideTimeout]);

  // Show on mouse movement
  useEffect(() => {
    if (!showOnHover) return;

    const handleMouseMove = () => {
      setIsVisible(true);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      
      if (autoHide && !focused && !hasFocusedChild && !showTrackSelector) {
        const timeout = setTimeout(() => {
          setIsVisible(false);
        }, autoHideDelay);
        setHideTimeout(timeout);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [showOnHover, autoHide, autoHideDelay, focused, hasFocusedChild, showTrackSelector, hideTimeout]);

  const handleOpenTrackSelector = (type: 'audio' | 'video' | 'text') => {
    setTrackSelectorType(type);
    setShowTrackSelector(true);
  };

  const handleCloseTrackSelector = () => {
    setShowTrackSelector(false);
  };

  // Format time helper
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const ControlButton = ({ 
    children, 
    focusKey, 
    onClick, 
    title, 
    size = 'md' 
  }: { 
    children: React.ReactNode; 
    focusKey: string; 
    onClick?: () => void; 
    title?: string;
    size?: 'sm' | 'md' | 'lg';
  }) => {
    const { ref: buttonRef, focused: buttonFocused } = useFocusable({
      focusKey,
      onEnterPress: onClick,
    });

    const sizeClasses = {
      sm: 'player-w-8 player-h-8 player-text-sm',
      md: 'player-w-10 player-h-10 player-text-base',
      lg: 'player-w-12 player-h-12 player-text-lg'
    };

    return (
      <button
        ref={buttonRef}
        onClick={onClick}
        title={title}
        className={cn(
          'player-flex player-items-center player-justify-center player-rounded-full player-text-white player-transition-all player-duration-200',
          'hover:player-bg-white hover:player-bg-opacity-20',
          'focus:player-outline-none',
          sizeClasses[size],
          buttonFocused && 'player-bg-white player-bg-opacity-30 player-ring-2 player-ring-white player-ring-opacity-60 player-scale-110'
        )}
      >
        {children}
      </button>
    );
  };

  if (!isVisible && !showTrackSelector) {
    return null;
  }

  return (
    <div className="player-absolute player-inset-0 player-pointer-events-none">
      {/* YouTube-style Controls */}
      <div
        ref={ref}
        className={cn(
          'player-absolute player-bottom-0 player-left-0 player-right-0 player-pointer-events-auto',
          'player-bg-gradient-to-t player-from-black/90 player-via-black/60 player-to-transparent',
          'player-transition-all player-duration-300 player-ease-out',
          isVisible ? 'player-opacity-100 player-translate-y-0' : 'player-opacity-0 player-translate-y-full',
          className
        )}
        style={style}
      >
        {/* Progress Bar Container */}
        <div className="player-px-6 player-pt-6 player-pb-2">
          <SeekBar focusKey="youtube-seek-bar" className="player-mb-4" />
        </div>

        <div className="player-px-6 player-pb-6">
          <div className="player-flex player-items-center player-justify-between">
            {/* Left Side - Playback Controls */}
            <div className="player-flex player-items-center player-gap-3">
              <PlayButton focusKey="youtube-play-button" size="lg" />

              {/* Previous/Next buttons */}
              <ControlButton focusKey="prev-track" title="Previous">
                <svg viewBox="0 0 24 24" fill="currentColor" className="player-w-5 player-h-5">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                </svg>
              </ControlButton>

              <ControlButton focusKey="next-track" title="Next">
                <svg viewBox="0 0 24 24" fill="currentColor" className="player-w-5 player-h-5">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                </svg>
              </ControlButton>

              <VolumeControl focusKey="youtube-volume-control" />

              {/* Time Display */}
              <div className="player-text-white player-text-sm player-font-medium player-ml-2">
                {formatTime(state.currentTime)} / {formatTime(state.duration)}
              </div>
            </div>

            {/* Right Side - Settings & Features */}
            <div className="player-flex player-items-center player-gap-2">
              {/* Quality Button */}
              <ControlButton
                focusKey="youtube-quality-button"
                onClick={() => handleOpenTrackSelector('video')}
                title="Quality"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="player-w-5 player-h-5">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </ControlButton>

              {/* Subtitles Button */}
              <ControlButton
                focusKey="youtube-subtitles-button"
                onClick={() => handleOpenTrackSelector('text')}
                title="Subtitles"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="player-w-5 player-h-5">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z"/>
                </svg>
              </ControlButton>

              {/* Audio Language Button */}
              <ControlButton
                focusKey="youtube-audio-button"
                onClick={() => handleOpenTrackSelector('audio')}
                title="Audio Language"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="player-w-5 player-h-5">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </ControlButton>

              {/* Picture in Picture */}
              <PictureInPicture focusKey="youtube-pip-button" />

              {/* Fullscreen */}
              <Fullscreen focusKey="youtube-fullscreen-button" />
            </div>
          </div>
        </div>

        {/* Custom children content */}
        {children}
      </div>

      {/* Track Selector Modal */}
      {showTrackSelector && (
        <div className="player-absolute player-inset-0 player-bg-black player-bg-opacity-50 player-flex player-items-center player-justify-center player-pointer-events-auto">
          <TrackSelector
            type={trackSelectorType}
            focusKey="youtube-track-selector-modal"
            onClose={handleCloseTrackSelector}
            className="player-bg-gray-900 player-rounded-lg player-p-6 player-max-w-md player-w-full player-mx-4"
          />
        </div>
      )}
    </div>
  );
};
