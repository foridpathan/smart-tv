import { useFocusable } from '@smart-tv/ui';
import React from 'react';
import { useMediaContext } from '../hooks/MediaContext';
import { TextTrack as TextTrackType } from '../types';
import { cn, getDisplayLanguage } from '../utils';

interface TextTrackProps {
  className?: string;
  onTrackSelect?: (track: TextTrackType | null) => void;
  onClose?: () => void;
}

export const TextTrack: React.FC<TextTrackProps> = ({
  className,
  onTrackSelect,
  onClose,
}) => {
  const { player, textTracks } = useMediaContext();
  
  const { ref } = useFocusable({
    focusKey: 'text-track-selector',
    trackChildren: true,
  });

  const handleTrackSelect = (track: TextTrackType) => {
    if (player) {
      player.selectTextTrack(track.id);
      onTrackSelect?.(track);
      onClose?.();
    }
  };

  const handleDisableSubtitles = () => {
    // Disable all text tracks
    textTracks.forEach(track => {
      if (player) {
        // Disable the track
        track.mode = 'disabled';
      }
    });
    onTrackSelect?.(null);
    onClose?.();
  };

  return (
    <div
      ref={ref}
      className={cn(
        'player-bg-black player-bg-opacity-80 player-text-white player-p-6 player-rounded-lg player-min-w-80',
        className
      )}
    >
      <div className="player-mb-4">
        <h3 className="player-text-xl player-font-semibold">Subtitles</h3>
      </div>
      
  <div className="player-space-y-2">
        {/* Off option */}
        <TextTrackItem
          track={null}
          focusKey="text-track-off"
          isSelected={!textTracks.some(track => track.active)}
          onSelect={handleDisableSubtitles}
          label="Off"
        />
        
        {textTracks
          .filter(track => track.kind === 'subtitles' || track.kind === 'captions')
          .map((track, index) => (
            <TextTrackItem
              key={track.id}
              track={track}
              focusKey={`text-track-${index}`}
              isSelected={track.active}
              onSelect={() => handleTrackSelect(track)}
            />
          ))}
      </div>
    </div>
  );
};

interface TextTrackItemProps {
  track: TextTrackType | null;
  focusKey: string;
  isSelected: boolean;
  onSelect: () => void;
  label?: string;
}

const TextTrackItem: React.FC<TextTrackItemProps> = ({
  track,
  focusKey,
  isSelected,
  onSelect,
  label,
}) => {
  const { ref, focused } = useFocusable({
    focusKey,
    onEnterPress: onSelect,
  });

  const getTrackLabel = () => {
    if (label) return label;
    if (!track) return 'Off';
    
    return track.label || getDisplayLanguage(track.language);
  };

  return (
    <div
      ref={ref}
      className={cn(
        'player-flex player-items-center player-justify-between player-p-3 player-rounded player-cursor-pointer player-transition-colors',
        'hover:player-bg-white hover:player-bg-opacity-10',
        focused && 'player-bg-blue-600',
        isSelected && 'player-bg-green-600'
      )}
      onClick={onSelect}
    >
      <span className="player-text-lg">
        {getTrackLabel()}
      </span>
      {isSelected && (
        <svg className="player-w-6 player-h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );
};
