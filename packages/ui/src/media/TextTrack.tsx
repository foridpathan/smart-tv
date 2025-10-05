import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusable } from '../hooks/useFocusable';
import { useMediaActions, useMediaState } from './MediaContext';

export interface TextTrackProps {
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  showLabel?: boolean;
  label?: string;
  focusKey?: string;
}

export interface TextTrackRef {
  focus: () => void;
  openMenu: () => void;
  closeMenu: () => void;
}

// Smart TV Text/Subtitle Track component
export const TextTrack = forwardRef<TextTrackRef, TextTrackProps>(function TextTrack({
  disabled = false,
  className = '',
  placeholder = 'Select subtitles',
  showLabel = false,
  label = 'Subtitles',
  focusKey
}, ref) {
  const { textTracks, activeTextTrack } = useMediaState();
  const { showControls, selectTextTrack } = useMediaActions();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const availableTextTracks = useMemo(() => textTracks || [], [textTracks]);
  const currentTrack = useMemo(
    () => availableTextTracks.find(track => track.id === activeTextTrack),
    [availableTextTracks, activeTextTrack]
  );

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openMenu = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      setFocusedIndex(0);
      showControls();
    }
  }, [disabled, showControls]);

  const selectTrack = useCallback((trackIndex: number | null) => {
    if (!disabled) {
      if (trackIndex === null) {
        selectTextTrack(null);
      } else if (availableTextTracks[trackIndex]) {
        selectTextTrack(availableTextTracks[trackIndex].id);
      }
      closeMenu();
      showControls();
    }
  }, [disabled, availableTextTracks, selectTextTrack, closeMenu, showControls]);

  const selectOff = useCallback(() => {
    selectTextTrack(null);
    closeMenu();
    showControls();
  }, [selectTextTrack, closeMenu, showControls]);

  // Smart TV navigation for menu button
  const handleMenuButtonPress = useCallback(() => {
    if (!isOpen) {
      openMenu();
    } else {
      closeMenu();
    }
  }, [isOpen, openMenu, closeMenu]);

  // Total menu items (Off + tracks)
  const totalMenuItems = availableTextTracks.length + 1; // +1 for "Off" option

  // Smart TV navigation for menu items
  const handleMenuArrowPress = useCallback((direction: string) => {
    if (!isOpen) return true;
    
    showControls();
    
    if (direction === 'up') {
      setFocusedIndex(prev => prev > 0 ? prev - 1 : totalMenuItems - 1);
      return false;
    }
    
    if (direction === 'down') {
      setFocusedIndex(prev => prev < totalMenuItems - 1 ? prev + 1 : 0);
      return false;
    }
    
    return true;
  }, [isOpen, totalMenuItems, showControls]);

  const handleMenuEnterPress = useCallback(() => {
    if (isOpen) {
      if (focusedIndex === 0) {
        // "Off" option
        selectOff();
      } else {
        // Track option
        selectTrack(focusedIndex - 1);
      }
      return false;
    }
    return true;
  }, [isOpen, focusedIndex, selectOff, selectTrack]);

  const { ref: buttonFocusRef, focused: buttonFocused } = useFocusable({
    focusKey,
    onEnterPress: handleMenuButtonPress,
    onFocus: () => showControls(),
  });

  const { ref: menuFocusRef, focused: menuFocused } = useFocusable({
    focusKey: `${focusKey}_menu`,
    onArrowPress: handleMenuArrowPress,
    onEnterPress: handleMenuEnterPress,
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
    if (!activeTextTrack) return 'Off';
    if (!currentTrack) return placeholder;
    return getTrackLabel(currentTrack);
  };

  const getTrackLabel = (track: { id: string; language: string; label?: string; kind?: string; forced?: boolean }) => {
    const parts = [];
    
    if (track.label) {
      parts.push(track.label);
    } else if (track.language) {
      const languageNames: Record<string, string> = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese',
        'ar': 'Arabic',
        'hi': 'Hindi'
      };
      
      parts.push(languageNames[track.language] || track.language.toUpperCase());
    }
    
    if (track.kind && track.kind !== 'subtitles') {
      parts.push(`(${track.kind})`);
    }
    
    if (track.forced) {
      parts.push('(Forced)');
    }
    
    return parts.join(' ') || `Track ${track.id}`;
  };

  return (
    <div className={`tv-text-track-selector relative ${className}`} ref={menuRef}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <button
        ref={buttonFocusRef}
        onClick={handleMenuButtonPress}
        disabled={disabled}
        className={`
          tv-subtitle-button
          w-full px-3 py-2 text-left
          bg-white border border-gray-300 rounded-md shadow-sm
          hover:bg-gray-50 focus:outline-none
          disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
          transition-all duration-200
          ${buttonFocused ? 'ring-4 ring-blue-300 scale-105' : 'ring-2 ring-transparent'}
          flex items-center justify-between
        `}
        aria-label="Select subtitle track"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="block truncate">
          {getCurrentTrackLabel()}
        </span>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {buttonFocused && (
        <div className="text-xs text-center mt-1 text-blue-600">
          Press Enter to open menu
        </div>
      )}

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1">
          <div
            ref={menuFocusRef}
            className={`
              tv-subtitle-menu
              bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto
              focus:outline-none
              ${menuFocused ? 'ring-4 ring-blue-300' : 'ring-2 ring-transparent'}
            `}
            role="listbox"
            aria-label="Subtitle track options"
            tabIndex={-1}
          >
            {/* Off option */}
            <div
              onClick={selectOff}
              className={`
                px-3 py-2 cursor-pointer transition-colors duration-150
                ${focusedIndex === 0 ? 'bg-blue-100 text-blue-900' : 'text-gray-900 hover:bg-gray-100'}
                ${!activeTextTrack ? 'bg-blue-50 font-medium' : ''}
              `}
              role="option"
              aria-selected={!activeTextTrack}
            >
              <div className="flex items-center justify-between">
                <span className="block truncate">Off</span>
                {!activeTextTrack && (
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            
            {availableTextTracks.map((track, index) => (
              <div
                key={track.id || index}
                onClick={() => selectTrack(index)}
                className={`
                  px-3 py-2 cursor-pointer transition-colors duration-150
                  ${focusedIndex === index + 1 ? 'bg-blue-100 text-blue-900' : 'text-gray-900 hover:bg-gray-100'}
                  ${currentTrack?.id === track.id ? 'bg-blue-50 font-medium' : ''}
                `}
                role="option"
                aria-selected={currentTrack?.id === track.id}
              >
                <div className="flex items-center justify-between">
                  <span className="block truncate">{getTrackLabel(track)}</span>
                  {currentTrack?.id === track.id && (
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {menuFocused && (
            <div className="text-xs text-center mt-1 text-blue-600">
              Use ↑↓ arrows to navigate, Enter to select
            </div>
          )}
        </div>
      )}
    </div>
  );
});
