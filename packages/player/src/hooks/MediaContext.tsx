import React, { createContext, ReactNode, useCallback, useContext, useMemo, useReducer, useRef, useState } from 'react';
import { AudioTrack, MediaPlayerInstance, PlayerEvent, PlayerState, TextTrack, VideoTrack } from '../types';

// Define action types
type PlayerAction =
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_MUTED'; payload: boolean }
  | { type: 'SET_PAUSED'; payload: boolean }
  | { type: 'SET_ENDED'; payload: boolean }
  | { type: 'SET_BUFFERED'; payload: TimeRanges | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'SET_FULLSCREEN'; payload: boolean }
  | { type: 'SET_PICTURE_IN_PICTURE'; payload: boolean }
  | { type: 'SET_PLAYBACK_RATE'; payload: number }
  | { type: 'SET_SEEKING'; payload: boolean }
  | { type: 'SET_WAITING'; payload: boolean }
  | { type: 'SET_AUDIO_TRACKS'; payload: AudioTrack[] }
  | { type: 'SET_VIDEO_TRACKS'; payload: VideoTrack[] }
  | { type: 'SET_TEXT_TRACKS'; payload: TextTrack[] }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: PlayerState = {
  currentTime: 0,
  duration: 0,
  volume: 1,
  muted: false,
  paused: true,
  ended: false,
  buffered: null,
  loading: false,
  error: null,
  fullscreen: false,
  pictureInPicture: false,
  playbackRate: 1,
  seeking: false,
  waiting: false,
  audioTracks: [],
  videoTracks: [],
  textTracks: [],
};

// Reducer function
const playerReducer = (state: PlayerState, action: PlayerAction): PlayerState => {
  switch (action.type) {
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'SET_MUTED':
      return { ...state, muted: action.payload };
    case 'SET_PAUSED':
      return { ...state, paused: action.payload };
    case 'SET_ENDED':
      return { ...state, ended: action.payload };
    case 'SET_BUFFERED':
      return { ...state, buffered: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_FULLSCREEN':
      return { ...state, fullscreen: action.payload };
    case 'SET_PICTURE_IN_PICTURE':
      return { ...state, pictureInPicture: action.payload };
    case 'SET_PLAYBACK_RATE':
      return { ...state, playbackRate: action.payload };
    case 'SET_SEEKING':
      return { ...state, seeking: action.payload };
    case 'SET_WAITING':
      return { ...state, waiting: action.payload };
    case 'SET_AUDIO_TRACKS':
      return { ...state, audioTracks: action.payload };
    case 'SET_VIDEO_TRACKS':
      return { ...state, videoTracks: action.payload };
    case 'SET_TEXT_TRACKS':
      return { ...state, textTracks: action.payload };
    case 'RESET_STATE':
      return { ...initialState };
    default:
      return state;
  }
};

// Context interface
interface MediaContextValue {
  state: PlayerState;
  player: MediaPlayerInstance | null;
  audioTracks: AudioTrack[];
  videoTracks: VideoTrack[];
  textTracks: TextTrack[];
  actions: {
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    setVolume: (volume: number) => void;
    setMuted: (muted: boolean) => void;
    setPaused: (paused: boolean) => void;
    setEnded: (ended: boolean) => void;
    setBuffered: (buffered: TimeRanges | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: Error | null) => void;
    setFullscreen: (fullscreen: boolean) => void;
    setPictureInPicture: (pip: boolean) => void;
    setPlaybackRate: (rate: number) => void;
    setSeeking: (seeking: boolean) => void;
    setWaiting: (waiting: boolean) => void;
    resetState: () => void;
  };
  subscribe: (callback: (event: PlayerEvent) => void) => () => void;
}

// Create separate contexts to prevent unnecessary re-renders
export const TracksContext = createContext<{
  audioTracks: AudioTrack[];
  videoTracks: VideoTrack[];
  textTracks: TextTrack[];
} | null>(null);

export const PlayerContext = createContext<{
  player: MediaPlayerInstance | null;
  actions: {
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    setVolume: (volume: number) => void;
    setMuted: (muted: boolean) => void;
    setPaused: (paused: boolean) => void;
    setEnded: (ended: boolean) => void;
    setBuffered: (buffered: TimeRanges | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: Error | null) => void;
    setFullscreen: (fullscreen: boolean) => void;
    setPictureInPicture: (pip: boolean) => void;
    setPlaybackRate: (rate: number) => void;
    setSeeking: (seeking: boolean) => void;
    setWaiting: (waiting: boolean) => void;
    resetState: () => void;
  };
  subscribe: (callback: (event: PlayerEvent) => void) => () => void;
} | null>(null);

export const PlayerTimeContext = createContext<{
  currentTime: number;
  duration: number;
  buffered: TimeRanges | null;
} | null>(null);

export const PlayerPlaybackContext = createContext<{
  paused: boolean;
  loading: boolean;
  ended: boolean;
  seeking: boolean;
  waiting: boolean;
} | null>(null);

export const PlayerVolumeContext = createContext<{
  volume: number;
  muted: boolean;
} | null>(null);

export const PlayerDisplayContext = createContext<{
  fullscreen: boolean;
  pictureInPicture: boolean;
  playbackRate: number;
  error: Error | null;
} | null>(null);

// Legacy context for backward compatibility
const MediaContext = createContext<MediaContextValue | null>(null);

// Provider component
interface MediaProviderProps {
  children: ReactNode;
}

export const MediaProvider: React.FC<MediaProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const [player, setPlayerState] = useState<MediaPlayerInstance | null>(null);
  const subscribersRef = useRef<((event: PlayerEvent) => void)[]>([]);

  // Actions - memoized to prevent recreation on every render
  const actions = useMemo(() => ({
    setCurrentTime: (time: number) => dispatch({ type: 'SET_CURRENT_TIME', payload: time }),
    setDuration: (duration: number) => dispatch({ type: 'SET_DURATION', payload: duration }),
    setVolume: (volume: number) => dispatch({ type: 'SET_VOLUME', payload: volume }),
    setMuted: (muted: boolean) => dispatch({ type: 'SET_MUTED', payload: muted }),
    setPaused: (paused: boolean) => dispatch({ type: 'SET_PAUSED', payload: paused }),
    setEnded: (ended: boolean) => dispatch({ type: 'SET_ENDED', payload: ended }),
    setBuffered: (buffered: TimeRanges | null) => dispatch({ type: 'SET_BUFFERED', payload: buffered }),
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: Error | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    setFullscreen: (fullscreen: boolean) => dispatch({ type: 'SET_FULLSCREEN', payload: fullscreen }),
    setPictureInPicture: (pip: boolean) => dispatch({ type: 'SET_PICTURE_IN_PICTURE', payload: pip }),
    setPlaybackRate: (rate: number) => dispatch({ type: 'SET_PLAYBACK_RATE', payload: rate }),
    setSeeking: (seeking: boolean) => dispatch({ type: 'SET_SEEKING', payload: seeking }),
    setWaiting: (waiting: boolean) => dispatch({ type: 'SET_WAITING', payload: waiting }),
    resetState: () => dispatch({ type: 'RESET_STATE' }),
  }), []);

  // Subscribe function - memoized to prevent recreation
  const subscribe = useCallback((callback: (event: PlayerEvent) => void) => {
    subscribersRef.current.push(callback);
    return () => {
      subscribersRef.current = subscribersRef.current.filter(cb => cb !== callback);
    };
  }, []);

  // Emit events to subscribers - memoized to prevent recreation
  const emit = useCallback((event: PlayerEvent) => {
    subscribersRef.current.forEach(callback => callback(event));
  }, []);

  // Set player instance - now using state setter instead of dispatch  
  const setPlayer = useCallback((playerInstance: MediaPlayerInstance | null) => {
    setPlayerState(playerInstance);
  }, []);

  // Set tracks - now using dispatch to update state instead of refs
  const setAudioTracks = useCallback((tracks: AudioTrack[]) => {
    dispatch({ type: 'SET_AUDIO_TRACKS', payload: tracks });
  }, []);

  const setVideoTracks = useCallback((tracks: VideoTrack[]) => {
    dispatch({ type: 'SET_VIDEO_TRACKS', payload: tracks });
  }, []);

  const setTextTracks = useCallback((tracks: TextTrack[]) => {
    dispatch({ type: 'SET_TEXT_TRACKS', payload: tracks });
  }, []);

  // Memoize different parts of the state separately to prevent unnecessary re-renders
  const tracks = useMemo(() => ({
    audioTracks: state.audioTracks,
    videoTracks: state.videoTracks,
    textTracks: state.textTracks,
  }), [state.audioTracks, state.videoTracks, state.textTracks]);

  const playerData = useMemo(() => ({
    player,
    actions,
    subscribe,
    setPlayer,
    setAudioTracks,
    setVideoTracks,
    setTextTracks,
    emit,
  }), [player, actions, subscribe, setPlayer, setAudioTracks, setVideoTracks, setTextTracks, emit]);

  const timeData = useMemo(() => ({
    currentTime: state.currentTime,
    duration: state.duration,
    buffered: state.buffered,
  }), [state.currentTime, state.duration, state.buffered]);

  const playbackData = useMemo(() => ({
    paused: state.paused,
    loading: state.loading,
    ended: state.ended,
    seeking: state.seeking,
    waiting: state.waiting,
  }), [state.paused, state.loading, state.ended, state.seeking, state.waiting]);

  const volumeData = useMemo(() => ({
    volume: state.volume,
    muted: state.muted,
  }), [state.volume, state.muted]);

  const displayData = useMemo(() => ({
    fullscreen: state.fullscreen,
    pictureInPicture: state.pictureInPicture,
    playbackRate: state.playbackRate,
    error: state.error,
  }), [state.fullscreen, state.pictureInPicture, state.playbackRate, state.error]);

  // Legacy context value for backward compatibility
  const legacyValue = useMemo((): MediaContextValue => {
    const contextValue = {
      state,
      player,
      audioTracks: tracks.audioTracks,
      videoTracks: tracks.videoTracks,
      textTracks: tracks.textTracks,
      actions,
      subscribe,
    };

    // Add additional methods to the context
    (contextValue as any).setPlayer = setPlayer;
    (contextValue as any).setAudioTracks = setAudioTracks;
    (contextValue as any).setVideoTracks = setVideoTracks;
    (contextValue as any).setTextTracks = setTextTracks;
    (contextValue as any).emit = emit;

    return contextValue;
  }, [state, player, tracks, actions, subscribe, setPlayer, setAudioTracks, setVideoTracks, setTextTracks, emit]);

  return (
    <TracksContext.Provider value={tracks}>
      <PlayerContext.Provider value={playerData}>
        <PlayerTimeContext.Provider value={timeData}>
          <PlayerPlaybackContext.Provider value={playbackData}>
            <PlayerVolumeContext.Provider value={volumeData}>
              <PlayerDisplayContext.Provider value={displayData}>
                <MediaContext.Provider value={legacyValue}>
                  {children}
                </MediaContext.Provider>
              </PlayerDisplayContext.Provider>
            </PlayerVolumeContext.Provider>
          </PlayerPlaybackContext.Provider>
        </PlayerTimeContext.Provider>
      </PlayerContext.Provider>
    </TracksContext.Provider>
  );
};

// Hook to use media context
export const useMediaContext = (): MediaContextValue => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMediaContext must be used within a MediaProvider');
  }
  return context;
};

// Optimized hooks that use specific contexts to prevent unnecessary re-renders

// Hook to use tracks only - won't re-render when time or playback state changes
export const useTracks = () => {
  const context = useContext(TracksContext);
  if (!context) {
    throw new Error('useTracks must be used within a MediaProvider');
  }
  return context;
};

// Hook to use player instance and actions only
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a MediaProvider');
  }
  return context.player;
};

// Hook to use player actions only
export const usePlayerActions = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayerActions must be used within a MediaProvider');
  }
  return context.actions;
};

// Hook to use time data only - components using this will only re-render when time changes
export const usePlayerTime = () => {
  const context = useContext(PlayerTimeContext);
  if (!context) {
    throw new Error('usePlayerTime must be used within a MediaProvider');
  }
  return context;
};

// Hook to use playback state only - won't re-render when time changes
export const usePlayerPlayback = () => {
  const context = useContext(PlayerPlaybackContext);
  if (!context) {
    throw new Error('usePlayerPlayback must be used within a MediaProvider');
  }
  return context;
};

// Hook to use volume state only
export const usePlayerVolume = () => {
  const context = useContext(PlayerVolumeContext);
  if (!context) {
    throw new Error('usePlayerVolume must be used within a MediaProvider');
  }
  return context;
};

// Hook to use display state only
export const usePlayerDisplay = () => {
  const context = useContext(PlayerDisplayContext);
  if (!context) {
    throw new Error('usePlayerDisplay must be used within a MediaProvider');
  }
  return context;
};

// Legacy hooks for backward compatibility
export const usePlayerState = () => {
  const { state } = useMediaContext();
  return state;
};
