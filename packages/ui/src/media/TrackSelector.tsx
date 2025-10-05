
import React, { forwardRef, useRef } from 'react';

// Legacy track selector - prefer using specific track selectors
export interface Track {
  id: string;
  label: string;
  language?: string;
  kind?: string;
}

export interface TrackSelectorProps {
  tracks?: Track[];
  activeTrackId?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  onTrackSelect?: (track: Track) => void;
  size?: 'small' | 'medium' | 'large';
}

export interface TrackSelectorRef {
  focus: () => void;
  selectTrack: (trackId: string) => void;
}

// Legacy TV track selector (audio/subtitles) - Use specific selectors instead
export const TrackSelector = forwardRef<TrackSelectorRef, TrackSelectorProps>(function TrackSelector({
  tracks = [],
  activeTrackId,
  disabled = false,
  className = '',
  placeholder = 'Select Track',
  onTrackSelect,
  size = 'medium'
}, ref) {
  const selectRef = useRef<HTMLSelectElement>(null);

  const handleTrackChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTrack = tracks.find(track => track.id === event.target.value);
    if (selectedTrack) {
      onTrackSelect?.(selectedTrack);
    }
  };

  React.useImperativeHandle(ref, () => ({
    focus: () => selectRef.current?.focus(),
    selectTrack: (trackId: string) => {
      const track = tracks.find(t => t.id === trackId);
      if (track) {
        onTrackSelect?.(track);
      }
    }
  }));

  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-3 py-2 text-base',
    large: 'px-4 py-3 text-lg'
  };

  if (tracks.length === 0) {
    return (
      <div className={`tv-track-selector-empty text-gray-500 ${sizeClasses[size]} ${className}`}>
        No tracks available
      </div>
    );
  }

  return (
    <div className={`tv-track-selector-container relative ${className}`}>
      <select
        ref={selectRef}
        value={activeTrackId || ''}
        onChange={handleTrackChange}
        disabled={disabled}
        className={`
          tv-track-selector
          w-full border border-gray-300 rounded-md
          bg-white text-gray-900
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
          hover:border-gray-400
          transition-colors duration-200
          ${sizeClasses[size]}
        `}
        aria-label="Select Track"
        title="Track Selector"
      >
        {!activeTrackId && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {tracks.map((track) => (
          <option key={track.id} value={track.id}>
            {track.label}
          </option>
        ))}
      </select>
    </div>
  );
});
