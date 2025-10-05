import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusable } from '../hooks/useFocusable';
import { useMediaActions, useMediaState } from './MediaContext';

export interface VideoTrackProps {
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  showLabel?: boolean;
  label?: string;
  focusKey?: string;
}

export interface VideoTrackRef {
  focus: () => void;
  openMenu: () => void;
  closeMenu: () => void;
}

// Smart TV Video Track component
export const VideoTrack = forwardRef<VideoTrackRef, VideoTrackProps>(function VideoTrack({
  disabled = false,
  className = '',
  placeholder = 'Select quality',
  showLabel = false,
  label = 'Quality',
  focusKey
}, ref) {
  const { videoTracks, activeVideoTrack } = useMediaState();
  const { showControls, selectVideoTrack } = useMediaActions();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter video tracks to only show unique qualities
  const availableVideoTracks = useMemo(() => {
    if (!videoTracks) return [];
    
    // Group tracks by resolution and keep only one track per resolution
    // This will give us unique quality options regardless of audio track association
    const resolutionMap = new Map<string, typeof videoTracks[0]>();
    
    videoTracks.forEach(track => {
      const resolution = `${track.width || 0}x${track.height || 0}`;
      const key = resolution;
      
      // If we don't have this resolution yet, or if this track has higher bandwidth, keep it
      if (!resolutionMap.has(key) || 
          (track.bandwidth && resolutionMap.get(key)?.bandwidth && 
           track.bandwidth > (resolutionMap.get(key)?.bandwidth || 0))) {
        resolutionMap.set(key, track);
      }
    });

    const uniqueQualities = Array.from(resolutionMap.values());
    
    console.log('Video Track Debug:', {
      totalTracks: videoTracks.length,
      uniqueQualities: uniqueQualities.length,
      qualities: uniqueQualities.map(t => `${t.width}x${t.height} @ ${(t.bandwidth || 0) / 1000000}Mbps`)
    });
    
    return uniqueQualities;
  }, [videoTracks]);
  const currentTrack = useMemo(
    () => availableVideoTracks.find(track => track.id === activeVideoTrack),
    [availableVideoTracks, activeVideoTrack]
  );

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openMenu = useCallback(() => {
    if (!disabled && availableVideoTracks.length > 0) {
      setIsOpen(true);
      setFocusedIndex(0);
      showControls();
    }
  }, [disabled, availableVideoTracks.length, showControls]);

  const selectTrack = useCallback((trackIndex: number) => {
    if (!disabled && availableVideoTracks[trackIndex]) {
      selectVideoTrack(availableVideoTracks[trackIndex].id);
      closeMenu();
      showControls();
    }
  }, [disabled, availableVideoTracks, selectVideoTrack, closeMenu, showControls]);

  // Smart TV navigation for menu button
  const handleMenuButtonPress = useCallback(() => {
    if (!isOpen) {
      openMenu();
    } else {
      closeMenu();
    }
  }, [isOpen, openMenu, closeMenu]);

  // Smart TV navigation for menu items
  const handleArrowPress = useCallback((direction: string) => {
    if (!isOpen) return true;
    
    showControls();
    
    if (direction === 'up') {
      setFocusedIndex(prev => prev > 0 ? prev - 1 : availableVideoTracks.length - 1);
      return false;
    }
    
    if (direction === 'down') {
      setFocusedIndex(prev => prev < availableVideoTracks.length - 1 ? prev + 1 : 0);
      return false;
    }
    
    return true;
  }, [isOpen, availableVideoTracks.length, showControls]);

  const handleEnterPress = useCallback(() => {
    if (isOpen && availableVideoTracks.length > 0) {
      selectTrack(focusedIndex);
      return false;
    }
    return true;
  }, [isOpen, availableVideoTracks.length, focusedIndex, selectTrack]);

  const { ref: buttonFocusRef, focused: buttonFocused } = useFocusable({
    focusKey,
    onEnterPress: handleMenuButtonPress,
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
    return getTrackLabel(currentTrack);
  };

  const getTrackLabel = (track: { id: string; width?: number; height?: number; bandwidth?: number; frameRate?: number; label?: string }) => {
    if (track.label) return track.label;
    
    const parts = [];
    
    // Add resolution and quality label
    if (track.width && track.height) {
      const resolution = `${track.width}x${track.height}`;
      
      if (track.height >= 2160) {
        parts.push('4K UHD');
      } else if (track.height >= 1440) {
        parts.push('QHD');
      } else if (track.height >= 1080) {
        parts.push('Full HD');
      } else if (track.height >= 720) {
        parts.push('HD');
      } else if (track.height >= 480) {
        parts.push('SD');
      }
      
      parts.push(`(${resolution})`);
    }
    
    // Add bandwidth
    if (track.bandwidth) {
      const mbps = (track.bandwidth / 1000000).toFixed(1);
      parts.push(`${mbps} Mbps`);
    }
    
    return parts.length > 0 ? parts.join(' ') : `Track ${track.id}`;
  };

  return (
    <div className={`tv-video-track-selector ui-relative ${className}`} ref={menuRef}>
      {showLabel && (
        <label className="ui-block ui-text-sm ui-font-medium ui-text-gray-700 ui-mb-1">
          {label}
        </label>
      )}
      
      <button
        ref={buttonFocusRef}
        onClick={handleMenuButtonPress}
        disabled={disabled || availableVideoTracks.length === 0}
        className={`
          tv-video-button
          ui-w-full ui-px-3 ui-py-2 ui-text-left
          ui-bg-white ui-border ui-border-gray-300 ui-rounded-md ui-shadow-sm
          hover:ui-bg-gray-50 focus:ui-outline-none
          disabled:ui-bg-gray-100 disabled:ui-text-gray-400 disabled:ui-cursor-not-allowed
          ui-transition-all ui-duration-200
          ${buttonFocused ? 'ui-ring-4 ui-ring-blue-300 ui-scale-105' : 'ui-ring-2 ui-ring-transparent'}
          ui-flex ui-items-center ui-justify-between
        `}
        aria-label="Select video quality"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="ui-block ui-truncate">
          {availableVideoTracks.length > 0 ? getCurrentTrackLabel() : 'No quality options'}
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

      {isOpen && availableVideoTracks.length > 0 && (
        <div className="ui-absolute ui-top-full ui-left-0 ui-right-0 ui-z-50 ui-mt-1">
          <div
            ref={menuFocusRef}
            className={`
              tv-video-menu
              ui-bg-white ui-border ui-border-gray-300 ui-rounded-md ui-shadow-lg ui-max-h-60 ui-overflow-auto
              focus:ui-outline-none
              ${menuFocused ? 'ui-ring-4 ui-ring-blue-300' : 'ui-ring-2 ui-ring-transparent'}
            `}
            role="listbox"
            aria-label="Video quality options"
            tabIndex={-1}
          >
            {/* Auto option */}
            <div
              onClick={() => {
                selectVideoTrack('auto');
                closeMenu();
                showControls();
              }}
              className={`
                ui-px-3 ui-py-2 ui-cursor-pointer ui-transition-colors ui-duration-150
                ${focusedIndex === -1 ? 'ui-bg-blue-100 ui-text-blue-900' : 'ui-text-gray-900 hover:ui-bg-gray-100'}
                ${activeVideoTrack === 'auto' ? 'ui-bg-blue-50 ui-font-medium' : ''}
              `}
              role="option"
              aria-selected={activeVideoTrack === 'auto'}
            >
              <div className="ui-flex ui-items-center ui-justify-between">
                <span className="ui-block ui-truncate">Auto (Adaptive)</span>
                {activeVideoTrack === 'auto' && (
                  <svg className="ui-w-4 ui-h-4 ui-text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            
            {availableVideoTracks
              .sort((a, b) => {
                // Sort by resolution descending, then by bandwidth descending
                if (a.height && b.height && a.height !== b.height) {
                  return b.height - a.height;
                }
                if (a.bandwidth && b.bandwidth) {
                  return b.bandwidth - a.bandwidth;
                }
                return 0;
              })
              .map((track, index) => (
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
