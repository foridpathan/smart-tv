import { useFocusable } from '@smart-tv/ui';
import React from 'react';
import { TrackSelectorProps } from '../types';
import { cn } from '../utils';
import { AudioTrack } from './AudioTrack';
import { TextTrack } from './TextTrack';
import { VideoTrack } from './VideoTrack';

export const TrackSelector: React.FC<TrackSelectorProps> = ({
  className,
  style,
  focusKey = 'track-selector',
  type,
  title,
  onTrackSelect,
  onClose,
}) => {
  const { ref, focused } = useFocusable({
    focusKey,
    trackChildren: true,
    onArrowPress: (direction) => {
      // Handle back navigation
      if (direction === 'left') {
        onClose?.();
        return false;
      }
      return true;
    },
  });

  const renderTrackComponent = () => {
    switch (type) {
      case 'audio':
        return (
          <AudioTrack 
            onTrackSelect={onTrackSelect as any}
            onClose={onClose}
          />
        );
      case 'video':
        return (
          <VideoTrack 
            onTrackSelect={onTrackSelect as any}
            onClose={onClose}
          />
        );
      case 'text':
        return (
          <TextTrack 
            onTrackSelect={onTrackSelect as any}
            onClose={onClose}
          />
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'audio':
        return 'Audio Language';
      case 'video':
        return 'Video Quality';
      case 'text':
        return 'Subtitles';
      default:
        return 'Track Selection';
    }
  };

  return (
    <div 
      ref={ref}
      className={cn(
        'fixed inset-0 z-50 player-flex player-items-center player-justify-center',
        'player-bg-black player-bg-opacity-50 player-backdrop-blur-sm',
        className
      )}
      style={style}
    >
      <div
        className={cn(
          'player-relative player-bg-gray-900 player-rounded-lg player-shadow-xl',
          'player-border player-border-gray-700',
          focused && 'player-ring-2 player-ring-blue-500'
        )}
      >
        {/* Header */}
        <div className="player-flex player-items-center player-justify-between player-p-4 player-border-b player-border-gray-700">
          <h2 className="player-text-xl player-font-semibold player-text-white">
            {getTitle()}
          </h2>
          <button
            className="player-text-gray-400 hover:player-text-white player-transition-colors player-p-1"
            onClick={onClose}
          >
            <svg className="player-w-6 player-h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Track component */}
        <div className="player-p-4">
          {renderTrackComponent()}
        </div>
      </div>
    </div>
  );
};
