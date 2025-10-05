import { FocusContext, useFocusable } from '@smart-tv/ui';
import React, { memo, useCallback, useMemo } from 'react';
import { usePlayerInstance, useVideoTracks } from '../hooks/useOptimizedHooks';
import { VideoTrack as VideoTrackType } from '../types';
import { cn, compareTrackProps } from '../utils';

interface VideoTrackProps {
  className?: string;
  onTrackSelect?: (track: VideoTrackType) => void;
  onClose?: () => void;
}

const VideoTrackComponent: React.FC<VideoTrackProps> = ({
  className,
  onTrackSelect,
  onClose,
}) => {
  const player = usePlayerInstance();
  const videoTracks = useVideoTracks();

  const { ref, focusKey } = useFocusable({
    focusKey: 'video-track-selector',
    trackChildren: true,
  });

  // Sort tracks by height (quality) in descending order - memoized to prevent recalculation
  const sortedTracks = useMemo(() => 
    [...videoTracks]
      .sort((a, b) => b.height - a.height)
      .filter((track, index, self) => {
        // Remove duplicates based on height
        return index === self.findIndex(t => t.height === track.height);
      }), [videoTracks]);

  const handleTrackSelect = useCallback((track: VideoTrackType) => {
    if (player) {
      player.selectVideoTrack(track.id);
      onTrackSelect?.(track);
      onClose?.();
    }
  }, [player, onTrackSelect, onClose]);

  const handleAutoQuality = useCallback(() => {
    // Reset to auto quality by not selecting any specific track
    // Shaka Player will handle adaptive streaming
    if (player) {
      // Enable adaptation
      onClose?.();
    }
  }, [player, onClose]);

  return (
    <FocusContext.Provider value={focusKey}>
      <div
        ref={ref}
        className={cn(
          'player-bg-black player-bg-opacity-80 player-text-white player-p-6 player-rounded-lg player-min-w-80',
          className
        )}
      >
        <div className="player-mb-4">
          <h3 className="player-text-xl player-font-semibold">Video Quality</h3>
        </div>

        <div className="player-space-y-2">
          {/* Auto quality option */}
          <VideoTrackItem
            track={null}
            focusKey="video-track-auto"
            isSelected={!sortedTracks.some(track => track.active)}
            onSelect={handleAutoQuality}
            label="Auto"
          />

          {sortedTracks.map((track, index) => (
            <VideoTrackItem
              key={track.id}
              track={track}
              focusKey={`video-track-${index}`}
              isSelected={track.active}
              onSelect={() => handleTrackSelect(track)}
            />
          ))}
        </div>
      </div>
    </FocusContext.Provider>
  );
};

export const VideoTrack = memo(VideoTrackComponent, compareTrackProps);

interface VideoTrackItemProps {
  track: VideoTrackType | null;
  focusKey: string;
  isSelected: boolean;
  onSelect: () => void;
  label?: string;
}

const VideoTrackItem: React.FC<VideoTrackItemProps> = ({
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

  const getQualityLabel = () => {
    if (label) return label;
    if (!track) return 'Auto';

    const quality = track.height ? `${track.height}p` : 'Unknown';
    const bandwidth = track.bandwidth ? `${Math.round(track.bandwidth / 1000)}kbps` : '';

    return bandwidth ? `${quality} (${bandwidth})` : quality;
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
        {getQualityLabel()}
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
