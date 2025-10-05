
import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useFocusable } from '../hooks/useFocusable';
import { AudioTrack, AudioTrackRef } from './AudioTrack';
import { useMediaActions, useMediaState } from './MediaContext';
import { PlayButton, PlayButtonRef } from './PlayButton';
import { SeekBar, SeekBarRef } from './SeekBar';
import { TextTrack, TextTrackRef } from './TextTrack';
import { VideoTrack, VideoTrackRef } from './VideoTrack';
import { VolumeControl, VolumeControlRef } from './VolumeControl';

export interface PlayerControlsProps {
  className?: string;
  layout?: 'compact' | 'standard' | 'full';
  showProgress?: boolean;
  showPlayButton?: boolean;
  showVolumeControl?: boolean;
  showTrackSelectors?: boolean;
  showAudioTracks?: boolean;
  showVideoTracks?: boolean;
  showTextTracks?: boolean;
  showTimeDisplay?: boolean;
  showFullscreenButton?: boolean;
  showPictureInPictureButton?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  focusKey?: string;
}

export interface PlayerControlsRef {
  focus: () => void;
  show: () => void;
  hide: () => void;
  toggleFullscreen: () => void;
  togglePictureInPicture: () => void;
}

// Comprehensive Player Controls component with smart TV navigation
export const PlayerControls = forwardRef<PlayerControlsRef, PlayerControlsProps>(function PlayerControls({
  className = '',
  layout = 'standard',
  showProgress = true,
  showPlayButton = true,
  showVolumeControl = true,
  showTrackSelectors = true,
  showAudioTracks = true,
  showVideoTracks = true,
  showTextTracks = true,
  showTimeDisplay = true,
  showFullscreenButton = true,
  showPictureInPictureButton = true,
  autoHide = true,
  autoHideDelay = 3000,
  focusKey = 'player-controls'
}, ref) {
  const { 
    isPlaying, 
    currentTime, 
    duration, 
    controlsVisible, 
    fullscreen, 
    pictureInPicture,
    loading 
  } = useMediaState();
  
  const { 
    showControls, 
    hideControls, 
    toggleFullscreen, 
    togglePictureInPicture 
  } = useMediaActions();

  const [focusedControl, setFocusedControl] = useState('play');
  const playButtonRef = useRef<PlayButtonRef>(null);
  const seekBarRef = useRef<SeekBarRef>(null);
  const volumeRef = useRef<VolumeControlRef>(null);
  const audioTrackRef = useRef<AudioTrackRef>(null);
  const videoTrackRef = useRef<VideoTrackRef>(null);
  const textTrackRef = useRef<TextTrackRef>(null);
  const fullscreenButtonRef = useRef<HTMLButtonElement>(null);
  const pipButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-hide controls
  useEffect(() => {
    if (!autoHide || !controlsVisible || !isPlaying) return;

    const timer = setTimeout(() => {
      hideControls();
    }, autoHideDelay);

    return () => clearTimeout(timer);
  }, [autoHide, controlsVisible, isPlaying, autoHideDelay, hideControls]);

  // Show controls on mouse movement or focus
  const handleInteraction = useCallback(() => {
    showControls();
  }, [showControls]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Control navigation mapping
  const controls = [
    { key: 'play', ref: playButtonRef, visible: showPlayButton },
    { key: 'seek', ref: seekBarRef, visible: showProgress },
    { key: 'volume', ref: volumeRef, visible: showVolumeControl },
    { key: 'audio', ref: audioTrackRef, visible: showTrackSelectors && showAudioTracks },
    { key: 'video', ref: videoTrackRef, visible: showTrackSelectors && showVideoTracks },
    { key: 'text', ref: textTrackRef, visible: showTrackSelectors && showTextTracks },
    { key: 'fullscreen', ref: fullscreenButtonRef, visible: showFullscreenButton },
    { key: 'pip', ref: pipButtonRef, visible: showPictureInPictureButton }
  ].filter(control => control.visible);

  // Smart TV navigation between controls
  const handleControlNavigation = useCallback((direction: string) => {
    const currentIndex = controls.findIndex(control => control.key === focusedControl);
    
    if (direction === 'left' && currentIndex > 0) {
      const prevControl = controls[currentIndex - 1];
      setFocusedControl(prevControl.key);
      prevControl.ref.current?.focus();
      return false;
    }
    
    if (direction === 'right' && currentIndex < controls.length - 1) {
      const nextControl = controls[currentIndex + 1];
      setFocusedControl(nextControl.key);
      nextControl.ref.current?.focus();
      return false;
    }
    
    return true;
  }, [controls, focusedControl]);

  const { ref: containerFocusRef, focused: containerFocused } = useFocusable({
    focusKey,
    onArrowPress: handleControlNavigation,
    onFocus: handleInteraction,
  });

  React.useImperativeHandle(ref, () => ({
    focus: () => {
      const firstControl = controls[0];
      if (firstControl) {
        firstControl.ref.current?.focus();
        setFocusedControl(firstControl.key);
      }
    },
    show: showControls,
    hide: hideControls,
    toggleFullscreen,
    togglePictureInPicture
  }));

  const layoutClasses = {
    compact: 'p-2 gap-2',
    standard: 'p-4 gap-3',
    full: 'p-6 gap-4'
  };

  if (!controlsVisible && autoHide) {
    return null;
  }

  return (
    <div
      ref={containerFocusRef}
      className={`
        tv-player-controls
        absolute bottom-0 left-0 right-0
        bg-gradient-to-t from-black/80 via-black/60 to-transparent
        text-white transition-all duration-300
        ${controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        ${layoutClasses[layout]}
        ${className}
      `}
      onMouseMove={handleInteraction}
      onFocus={handleInteraction}
    >
      {/* Progress bar row */}
      {showProgress && (
        <div className="w-full mb-2">
          <SeekBar
            ref={seekBarRef}
            focusKey={`${focusKey}_seek`}
            className="w-full"
          />
        </div>
      )}

      {/* Main controls row */}
      <div className="flex items-center justify-between gap-3">
        {/* Left side controls */}
        <div className="flex items-center gap-3">
          {showPlayButton && (
            <PlayButton
              ref={playButtonRef}
              focusKey={`${focusKey}_play`}
              size={layout === 'compact' ? 'small' : layout === 'full' ? 'large' : 'medium'}
            />
          )}

          {showVolumeControl && (
            <VolumeControl
              ref={volumeRef}
              focusKey={`${focusKey}_volume`}
              size={layout === 'compact' ? 'small' : layout === 'full' ? 'large' : 'medium'}
              showMuteButton
            />
          )}

          {showTimeDisplay && (
            <div className="text-sm font-mono whitespace-nowrap">
              <span>{formatTime(currentTime)}</span>
              <span className="mx-1 opacity-60">/</span>
              <span className="opacity-80">{formatTime(duration)}</span>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm opacity-80">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Loading...</span>
            </div>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Track selectors */}
          {showTrackSelectors && (
            <div className="flex items-center gap-2">
              {showAudioTracks && (
                <AudioTrack
                  ref={audioTrackRef}
                  focusKey={`${focusKey}_audio`}
                  className="min-w-[120px]"
                />
              )}

              {showVideoTracks && (
                <VideoTrack
                  ref={videoTrackRef}
                  focusKey={`${focusKey}_video`}
                  className="min-w-[120px]"
                />
              )}

              {showTextTracks && (
                <TextTrack
                  ref={textTrackRef}
                  focusKey={`${focusKey}_text`}
                  className="min-w-[120px]"
                />
              )}
            </div>
          )}

          {/* Fullscreen button */}
          {showFullscreenButton && (
            <button
              ref={fullscreenButtonRef}
              onClick={toggleFullscreen}
              className={`
                tv-fullscreen-button
                flex items-center justify-center
                w-10 h-10 rounded-md
                hover:bg-white/20 transition-colors duration-200
                focus:outline-none
                ${containerFocused && focusedControl === 'fullscreen' ? 'ring-4 ring-blue-300 scale-110' : 'ring-2 ring-transparent'}
              `}
              aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {fullscreen ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M.25 10a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-5z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M13.25 10a.75.75 0 01.75-.75h5a.75.75 0 01.75.75v5a.75.75 0 01-1.5 0v-4.5H14a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M10.25.25A.75.75 0 0110 1v4.5h4.5a.75.75 0 010 1.5h-5A.75.75 0 019 6.25v-5a.75.75 0 01.25-.75z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M.25 10a.75.75 0 01.75-.75h5a.75.75 0 01.75.75v5a.75.75 0 01-1.5 0v-4.5H1a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm12 0H5v10h10V5z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}

          {/* Picture-in-Picture button */}
          {showPictureInPictureButton && (
            <button
              ref={pipButtonRef}
              onClick={togglePictureInPicture}
              className={`
                tv-pip-button
                flex items-center justify-center
                w-10 h-10 rounded-md
                hover:bg-white/20 transition-colors duration-200
                focus:outline-none
                ${containerFocused && focusedControl === 'pip' ? 'ring-4 ring-blue-300 scale-110' : 'ring-2 ring-transparent'}
              `}
              aria-label={pictureInPicture ? 'Exit picture-in-picture' : 'Enter picture-in-picture'}
              title={pictureInPicture ? 'Exit picture-in-picture' : 'Enter picture-in-picture'}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v11a1 1 0 01-1 1h-5v-1a1 1 0 00-1-1H8a1 1 0 00-1 1v1H3a1 1 0 01-1-1V3z" />
                <path d="M15 8a1 1 0 00-1-1H9a1 1 0 00-1 1v5a1 1 0 001 1h5a1 1 0 001-1V8z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Navigation help text */}
      {containerFocused && (
        <div className="text-xs text-center mt-2 opacity-80">
          Use ← → arrows to navigate controls
        </div>
      )}
    </div>
  );
});
