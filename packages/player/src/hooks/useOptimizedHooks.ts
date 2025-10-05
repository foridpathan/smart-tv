import {
    PlayerContext,
    PlayerDisplayContext,
    PlayerPlaybackContext,
    PlayerTimeContext,
    PlayerVolumeContext,
    TracksContext
} from './MediaContext';
import { shallowEqualArray, timeBasedEquality, useContextSelector } from './useContextSelector';

// Optimized hooks using context selectors

// Hook for current time only - updates only when time changes significantly
export const useCurrentTime = () => {
  return useContextSelector(
    PlayerTimeContext,
    (value) => value?.currentTime ?? 0,
    timeBasedEquality
  );
};

// Hook for duration only
export const useDuration = () => {
  return useContextSelector(
    PlayerTimeContext,
    (value) => value?.duration ?? 0
  );
};

// Hook for buffered state only
export const useBuffered = () => {
  return useContextSelector(
    PlayerTimeContext,
    (value) => value?.buffered ?? null
  );
};

// Hook for paused state only
export const usePaused = () => {
  return useContextSelector(
    PlayerPlaybackContext,
    (value) => value?.paused ?? true
  );
};

// Hook for loading state only
export const useLoading = () => {
  return useContextSelector(
    PlayerPlaybackContext,
    (value) => value?.loading ?? false
  );
};

// Hook for volume state only
export const useVolume = () => {
  return useContextSelector(
    PlayerVolumeContext,
    (value) => value?.volume ?? 1
  );
};

// Hook for muted state only
export const useMuted = () => {
  return useContextSelector(
    PlayerVolumeContext,
    (value) => value?.muted ?? false
  );
};

// Hook for fullscreen state only
export const useFullscreen = () => {
  return useContextSelector(
    PlayerDisplayContext,
    (value) => value?.fullscreen ?? false
  );
};

// Hook for picture-in-picture state only
export const usePictureInPicture = () => {
  return useContextSelector(
    PlayerDisplayContext,
    (value) => value?.pictureInPicture ?? false
  );
};

// Hook for audio tracks only
export const useAudioTracks = () => {
  return useContextSelector(
    TracksContext,
    (value) => value?.audioTracks ?? [],
    shallowEqualArray
  );
};

// Hook for video tracks only
export const useVideoTracks = () => {
  return useContextSelector(
    TracksContext,
    (value) => value?.videoTracks ?? [],
    shallowEqualArray
  );
};

// Hook for text tracks only
export const useTextTracks = () => {
  return useContextSelector(
    TracksContext,
    (value) => value?.textTracks ?? [],
    shallowEqualArray
  );
};

// Hook for player instance only
export const usePlayerInstance = () => {
  return useContextSelector(
    PlayerContext,
    (value) => value?.player ?? null
  );
};

// Hook for player actions only
export const usePlayerActionsOnly = () => {
  return useContextSelector(
    PlayerContext,
    (value) => value?.actions ?? null
  );
};

// Combined hooks for commonly used combinations
export const useTimeProgress = () => {
  const currentTime = useCurrentTime();
  const duration = useDuration();
  
  return {
    currentTime,
    duration,
    progress: duration > 0 ? (currentTime / duration) * 100 : 0
  };
};

export const usePlaybackState = () => {
  const paused = usePaused();
  const loading = useLoading();
  
  return { paused, loading };
};

export const useVolumeState = () => {
  const volume = useVolume();
  const muted = useMuted();
  
  return { volume, muted };
};

export const usePlayerControls = () => {
  const player = usePlayerInstance();
  const actions = usePlayerActionsOnly();
  
  return { player, actions };
};
