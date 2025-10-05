import { useFocusable } from '@smart-tv/ui';
import React from 'react';
import { useMediaContext } from '../hooks/MediaContext';
import { AudioTrack as AudioTrackType } from '../types';
import { cn, getDisplayLanguage } from '../utils';

interface AudioTrackProps {
  className?: string;
  onTrackSelect?: (track: AudioTrackType) => void;
  onClose?: () => void;
}

export const AudioTrack: React.FC<AudioTrackProps> = ({
  className,
  onTrackSelect,
  onClose,
}) => {
  const { player, audioTracks } = useMediaContext();
  
  const { ref, focusKey } = useFocusable({
    focusKey: 'audio-track-selector',
    trackChildren: true,
  });

  const handleTrackSelect = (track: AudioTrackType) => {
    if (player) {
      player.selectAudioTrack(track.id);
      onTrackSelect?.(track);
      onClose?.();
    }
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
        <h3 className="player-text-xl player-font-semibold">Audio Language</h3>
      </div>
      
      <div className="player-space-y-2">
        {audioTracks.map((track, index) => (
          <AudioTrackItem
            key={track.id}
            track={track}
            focusKey={`audio-track-${index}`}
            isSelected={track.active}
            onSelect={() => handleTrackSelect(track)}
          />
        ))}
      </div>
    </div>
  );
};

interface AudioTrackItemProps {
  track: AudioTrackType;
  focusKey: string;
  isSelected: boolean;
  onSelect: () => void;
}

const AudioTrackItem: React.FC<AudioTrackItemProps> = ({
  track,
  focusKey,
  isSelected,
  onSelect,
}) => {
  const { ref, focused } = useFocusable({
    focusKey,
    onEnterPress: onSelect,
  });

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between p-3 rounded cursor-pointer transition-colors',
        'hover:bg-white hover:bg-opacity-10',
        focused && 'bg-blue-600',
        isSelected && 'bg-green-600'
      )}
      onClick={onSelect}
    >
      <span className="player-text-lg">
        {getDisplayLanguage(track.language)}
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
