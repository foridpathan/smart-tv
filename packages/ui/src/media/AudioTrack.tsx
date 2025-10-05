import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusable } from '../hooks/useFocusable';
import { useMediaActions, useMediaState } from './MediaContext';

export interface AudioTrackProps {
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  showLabel?: boolean;
  label?: string;
  focusKey?: string;
}

export interface AudioTrackRef {
  focus: () => void;
  openMenu: () => void;
  closeMenu: () => void;
}

// Smart TV Audio Track component
export const AudioTrack = forwardRef<AudioTrackRef, AudioTrackProps>(function AudioTrack({
  disabled = false,
  className = '',
  placeholder = 'Select audio track',
  showLabel = false,
  label = 'Audio',
  focusKey
}, ref) {
  const { audioTracks, activeAudioTrack } = useMediaState();
  const { showControls, selectAudioTrack } = useMediaActions();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const availableAudioTracks = useMemo(() => audioTracks || [], [audioTracks]);
  const currentTrack = useMemo(
    () => availableAudioTracks.find(track => track.id === activeAudioTrack),
    [availableAudioTracks, activeAudioTrack]
  );

  const openMenu = useCallback(() => {
    if (!disabled && availableAudioTracks.length > 0) {
      setIsOpen(true);
      setFocusedIndex(0);
      showControls();
    }
  }, [disabled, availableAudioTracks.length, showControls]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const selectTrack = useCallback((trackIndex: number) => {
    if (!disabled && availableAudioTracks[trackIndex]) {
      selectAudioTrack(availableAudioTracks[trackIndex].id);
      closeMenu();
      showControls();
    }
  }, [disabled, availableAudioTracks, selectAudioTrack, closeMenu, showControls]);

  // Smart TV navigation for menu button
  const handleMenuButtonPress = useCallback(() => {
    if (!isOpen) {
      openMenu();
    } else {
      closeMenu();
    }
  }, [isOpen, openMenu, closeMenu]);

  // Handle arrow press for better smart TV compatibility
  const handleArrowPress = useCallback((direction: string) => {
    if (isOpen) {
      showControls();
      
      if (direction === 'up') {
        setFocusedIndex(prev => prev > 0 ? prev - 1 : availableAudioTracks.length - 1);
        return false;
      }
      
      if (direction === 'down') {
        setFocusedIndex(prev => prev < availableAudioTracks.length - 1 ? prev + 1 : 0);
        return false;
      }
    }
    
    return true;
  }, [isOpen, availableAudioTracks.length, showControls]);

  const handleEnterPress = useCallback(() => {
    if (isOpen && availableAudioTracks.length > 0) {
      selectTrack(focusedIndex);
      return false;
    }
    
    // If menu is closed, open it
    if (!isOpen) {
      openMenu();
      return false;
    }
    
    return true;
  }, [isOpen, availableAudioTracks.length, focusedIndex, selectTrack, openMenu]);

  const { ref: buttonFocusRef, focused: buttonFocused } = useFocusable({
    focusKey,
    onEnterPress: handleEnterPress,
    onArrowPress: handleArrowPress,
    onFocus: () => showControls(),
  });

  const { ref: menuFocusRef, focused: menuFocused } = useFocusable({
    focusKey: `${focusKey}_menu`,
    onArrowPress: handleArrowPress,
    onEnterPress: handleEnterPress,
    onFocus: () => showControls(),
    focusable: isOpen, // Only focusable when menu is open
  });

  React.useImperativeHandle(ref, () => ({
    focus: () => {
      buttonRef.current?.focus();
    },
    openMenu,
    closeMenu
  }));

  // Close menu when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeMenu]);

  // Auto-focus menu when opened
  useEffect(() => {
    if (isOpen && menuRef.current) {
      // Small delay to ensure menu is rendered
      setTimeout(() => {
        if (menuFocusRef.current) {
          menuFocusRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen, menuFocusRef]);

  const getCurrentTrackLabel = () => {
    if (!currentTrack) return placeholder;
    return currentTrack.label || currentTrack.language || `Track ${currentTrack.id}`;
  };

  const getTrackLabel = (track: { id: string; language: string; label?: string }) => {
    return track.label || track.language || `Track ${track.id}`;
  };

  return (
    <div className={`tv-audio-track-selector ui-relative ${className}`} ref={menuRef}>
      {showLabel && (
        <label className="ui-block ui-text-sm ui-font-medium ui-text-gray-700 ui-mb-1">
          {label}
        </label>
      )}
      
      <button
        ref={buttonFocusRef}
        onClick={handleMenuButtonPress}
        disabled={disabled || availableAudioTracks.length === 0}
        className={`
          tv-audio-button
          ui-w-full ui-px-3 ui-py-2 ui-text-left
          ui-bg-white ui-border ui-border-gray-300 ui-rounded-md ui-shadow-sm
          hover:ui-bg-gray-50 focus:ui-outline-none
          disabled:ui-bg-gray-100 disabled:ui-text-gray-400 disabled:ui-cursor-not-allowed
          ui-transition-all ui-duration-200
          ${buttonFocused ? 'ui-ring-4 ui-ring-blue-300 ui-scale-105' : 'ui-ring-2 ui-ring-transparent'}
          ui-flex ui-items-center ui-justify-between
        `}
        aria-label="Select audio track"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="ui-block ui-truncate">
          {availableAudioTracks.length > 0 ? getCurrentTrackLabel() : 'No audio tracks'}
        </span>
        <svg 
          className={`ui-w-5 ui-h-5 ui-text-gray-400 ui-transition-transform ui-duration-200 ${isOpen ? 'ui-rotate-180' : ''}`} 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {buttonFocused && (
        <div className="ui-text-xs ui-text-center ui-mt-1 ui-text-blue-600">
          Press Enter to open menu
        </div>
      )}

      {isOpen && availableAudioTracks.length > 0 && (
        <div className="ui-absolute ui-top-full ui-left-0 ui-right-0 ui-z-50 ui-mt-1">
          <div
            ref={menuFocusRef}
            className={`
              tv-audio-menu
              ui-bg-white ui-border ui-border-gray-300 ui-rounded-md ui-shadow-lg ui-max-h-60 ui-overflow-auto
              focus:ui-outline-none
              ${menuFocused ? 'ui-ring-4 ui-ring-blue-300' : 'ui-ring-2 ui-ring-transparent'}
            `}
            role="listbox"
            aria-label="Audio track options"
            tabIndex={-1}
          >
            {availableAudioTracks.map((track, index) => (
              <div
                key={track.id || index}
                onClick={() => selectTrack(index)}
                className={`
                  ui-px-3 ui-py-2 ui-cursor-pointer ui-transition-colors ui-duration-150
                  ${focusedIndex === index ? 'ui-bg-blue-100 ui-text-blue-900' : 'ui-text-gray-900 hover:ui-bg-gray-100'}
                  ${currentTrack?.id === track.id ? 'ui-bg-blue-50 ui-font-medium' : ''}
                `}
                role="option"
                aria-selected={currentTrack?.id === track.id}
              >
                <div className="ui-flex ui-items-center ui-justify-between">
                  <span className="ui-block ui-truncate">{getTrackLabel(track)}</span>
                  {currentTrack?.id === track.id && (
                    <svg className="ui-w-4 ui-h-4 ui-text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {menuFocused && (
            <div className="ui-text-xs ui-text-center ui-mt-1 ui-text-blue-600">
              Use ↑↓ arrows to navigate, Enter to select
            </div>
          )}
        </div>
      )}
    </div>
  );
});
