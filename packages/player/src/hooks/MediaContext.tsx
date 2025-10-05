import React, { createContext, ReactNode, useContext, useReducer, useRef } from 'react';
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

// Create context
const MediaContext = createContext<MediaContextValue | null>(null);

// Provider component
interface MediaProviderProps {
  children: ReactNode;
}

export const MediaProvider: React.FC<MediaProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const playerRef = useRef<MediaPlayerInstance | null>(null);
  const audioTracksRef = useRef<AudioTrack[]>([]);
  const videoTracksRef = useRef<VideoTrack[]>([]);
  const textTracksRef = useRef<TextTrack[]>([]);
  const subscribersRef = useRef<((event: PlayerEvent) => void)[]>([]);

  // Actions
  const actions = {
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
  };

  // Subscribe function
  const subscribe = (callback: (event: PlayerEvent) => void) => {
    subscribersRef.current.push(callback);
    return () => {
      subscribersRef.current = subscribersRef.current.filter(cb => cb !== callback);
    };
  };

  // Emit events to subscribers
  const emit = (event: PlayerEvent) => {
    subscribersRef.current.forEach(callback => callback(event));
  };

  // Set player instance
  const setPlayer = (player: MediaPlayerInstance | null) => {
    playerRef.current = player;
  };

  // Set tracks
  const setAudioTracks = (tracks: AudioTrack[]) => {
    audioTracksRef.current = tracks;
  };

  const setVideoTracks = (tracks: VideoTrack[]) => {
    videoTracksRef.current = tracks;
  };

  const setTextTracks = (tracks: TextTrack[]) => {
    textTracksRef.current = tracks;
  };

  const value: MediaContextValue = {
    state,
    player: playerRef.current,
    audioTracks: audioTracksRef.current,
    videoTracks: videoTracksRef.current,
    textTracks: textTracksRef.current,
    actions,
    subscribe,
  };

  // Add setPlayer, setAudioTracks, setVideoTracks, setTextTracks to the context
  (value as any).setPlayer = setPlayer;
  (value as any).setAudioTracks = setAudioTracks;
  (value as any).setVideoTracks = setVideoTracks;
  (value as any).setTextTracks = setTextTracks;
  (value as any).emit = emit;

  return (
    <MediaContext.Provider value={value}>
      {children}
    </MediaContext.Provider>
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

// Hook to use player state
export const usePlayerState = () => {
  const { state } = useMediaContext();
  return state;
};

// Hook to use player actions
export const usePlayerActions = () => {
  const { actions } = useMediaContext();
  return actions;
};

// Hook to use player instance
export const usePlayer = () => {
  const { player } = useMediaContext();
  return player;
};

// Hook to use tracks
export const useTracks = () => {
  const { audioTracks, videoTracks, textTracks } = useMediaContext();
  return { audioTracks, videoTracks, textTracks };
};
