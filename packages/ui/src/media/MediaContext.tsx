import React, { createContext, ReactNode, useCallback, useContext, useEffect, useReducer, useRef } from 'react';

// Shaka Player types
interface ShakaTrack {
  id: number;
  language: string;
  label?: string;
  kind?: string;
  bandwidth?: number;
  width?: number;
  height?: number;
}

interface ShakaPlayer {
  addEventListener(type: string, listener: (event: Event) => void): void;
  load(assetUri: string): Promise<void>;
  destroy(): Promise<void>;
  selectAudioLanguage(language: string): void;
  selectTextTrack(track: ShakaTrack): void;
  selectVariantTrack(track: ShakaTrack): void;
  getAudioLanguages(): string[];
  getTextTracks(): ShakaTrack[];
  getVariantTracks(): ShakaTrack[];
}

// Extend types for browser compatibility
type ExtendedDocument = Document & {
  webkitFullscreenElement?: Element;
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
};

type ExtendedVideoElement = HTMLVideoElement & {
  requestPictureInPicture?: () => Promise<PictureInPictureWindow>;
};

export interface MediaState {
  // Player state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  loading: boolean;
  error: string | null;
  buffered: number;

  // Tracks
  audioTracks: { id: string; language: string; label?: string; channels?: number; bandwidth?: number }[];
  videoTracks: { id: string; width?: number; height?: number; bandwidth?: number; frameRate?: number; codecs?: string; label?: string; language?: string; audioTrackId?: string }[];
  textTracks: { id: string; language: string; label?: string; kind?: string; forced?: boolean }[];
  
  // Active tracks
  activeAudioTrack: string | null;
  activeVideoTrack: string | null;
  activeTextTrack: string | null;

  // UI state
  controlsVisible: boolean;
  fullscreen: boolean;
  pictureInPicture: boolean;
}

type MediaAction =
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_MUTED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BUFFERED'; payload: number }
  | { type: 'SET_AUDIO_TRACKS'; payload: MediaState['audioTracks'] }
  | { type: 'SET_VIDEO_TRACKS'; payload: MediaState['videoTracks'] }
  | { type: 'SET_TEXT_TRACKS'; payload: MediaState['textTracks'] }
  | { type: 'SET_ACTIVE_AUDIO_TRACK'; payload: string | null }
  | { type: 'SET_ACTIVE_VIDEO_TRACK'; payload: string | null }
  | { type: 'SET_ACTIVE_TEXT_TRACK'; payload: string | null }
  | { type: 'SET_CONTROLS_VISIBLE'; payload: boolean }
  | { type: 'SET_FULLSCREEN'; payload: boolean }
  | { type: 'SET_PICTURE_IN_PICTURE'; payload: boolean }
  | { type: 'RESET_STATE' };

export interface MediaContextValue {
  state: MediaState;
  dispatch: React.Dispatch<MediaAction>;
  
  // Player ref
  playerRef: React.MutableRefObject<ShakaPlayer | null>;
  videoElementRef: React.MutableRefObject<HTMLVideoElement | null>;
  
  // Actions
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  selectAudioTrack: (trackId: string) => void;
  selectVideoTrack: (trackId: string) => void;
  selectTextTrack: (trackId: string | null) => void;
  toggleFullscreen: () => Promise<void>;
  togglePictureInPicture: () => Promise<void>;
  showControls: () => void;
  hideControls: () => void;
}

const initialState: MediaState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  muted: false,
  loading: false,
  error: null,
  buffered: 0,
  audioTracks: [],
  videoTracks: [],
  textTracks: [],
  activeAudioTrack: null,
  activeVideoTrack: null,
  activeTextTrack: null,
  controlsVisible: true,
  fullscreen: false,
  pictureInPicture: false,
};

function mediaReducer(state: MediaState, action: MediaAction): MediaState {
  switch (action.type) {
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'SET_MUTED':
      return { ...state, muted: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_BUFFERED':
      return { ...state, buffered: action.payload };
    case 'SET_AUDIO_TRACKS':
      return { ...state, audioTracks: action.payload };
    case 'SET_VIDEO_TRACKS':
      return { ...state, videoTracks: action.payload };
    case 'SET_TEXT_TRACKS':
      return { ...state, textTracks: action.payload };
    case 'SET_ACTIVE_AUDIO_TRACK':
      return { ...state, activeAudioTrack: action.payload };
    case 'SET_ACTIVE_VIDEO_TRACK':
      return { ...state, activeVideoTrack: action.payload };
    case 'SET_ACTIVE_TEXT_TRACK':
      return { ...state, activeTextTrack: action.payload };
    case 'SET_CONTROLS_VISIBLE':
      return { ...state, controlsVisible: action.payload };
    case 'SET_FULLSCREEN':
      return { ...state, fullscreen: action.payload };
    case 'SET_PICTURE_IN_PICTURE':
      return { ...state, pictureInPicture: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

const MediaContext = createContext<MediaContextValue | null>(null);

export interface MediaProviderProps {
  children: ReactNode;
}

export function MediaProvider({ children }: MediaProviderProps) {
  const [state, dispatch] = useReducer(mediaReducer, initialState);
  const playerRef = useRef<ShakaPlayer | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Player actions
  const play = useCallback(async () => {
    if (videoElementRef.current) {
      try {
        await videoElementRef.current.play();
        dispatch({ type: 'SET_PLAYING', payload: true });
      } catch {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to play video' });
      }
    }
  }, []);

  const pause = useCallback(() => {
    if (videoElementRef.current) {
      videoElementRef.current.pause();
      dispatch({ type: 'SET_PLAYING', payload: false });
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (videoElementRef.current) {
      videoElementRef.current.currentTime = time;
      dispatch({ type: 'SET_TIME', payload: time });
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (videoElementRef.current) {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      videoElementRef.current.volume = clampedVolume;
      dispatch({ type: 'SET_VOLUME', payload: clampedVolume });
      
      if (clampedVolume > 0 && state.muted) {
        dispatch({ type: 'SET_MUTED', payload: false });
      }
    }
  }, [state.muted]);

  const toggleMute = useCallback(() => {
    if (videoElementRef.current) {
      const newMuted = !state.muted;
      videoElementRef.current.muted = newMuted;
      dispatch({ type: 'SET_MUTED', payload: newMuted });
    }
  }, [state.muted]);

  // Track selection
  const selectAudioTrack = useCallback((trackId: string) => {
    if (playerRef.current) {
      const tracks = playerRef.current.getAudioLanguages();
      const trackIndex = tracks.findIndex(track => track === trackId);
      if (trackIndex !== -1) {
        playerRef.current.selectAudioLanguage(tracks[trackIndex]);
        dispatch({ type: 'SET_ACTIVE_AUDIO_TRACK', payload: trackId });
      }
    }
  }, []);

  const selectVideoTrack = useCallback((trackId: string) => {
    if (playerRef.current) {
      const tracks = playerRef.current.getVariantTracks();
      const track = tracks.find(t => t.id.toString() === trackId);
      if (track) {
        playerRef.current.selectVariantTrack(track);
        dispatch({ type: 'SET_ACTIVE_VIDEO_TRACK', payload: trackId });
      }
    }
  }, []);

  const selectTextTrack = useCallback((trackId: string | null) => {
    if (playerRef.current) {
      if (trackId === null) {
        // Turn off subtitles
        const tracks = playerRef.current.getTextTracks();
        tracks.forEach(track => {
          if (track.kind === 'subtitles') {
            playerRef.current?.selectTextTrack(track);
          }
        });
      } else {
        const tracks = playerRef.current.getTextTracks();
        const track = tracks.find(t => t.id.toString() === trackId);
        if (track) {
          playerRef.current.selectTextTrack(track);
        }
      }
      dispatch({ type: 'SET_ACTIVE_TEXT_TRACK', payload: trackId });
    }
  }, []);

  // Fullscreen
  const toggleFullscreen = useCallback(async () => {
    try {
      if (state.fullscreen) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } else {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, [state.fullscreen]);

  // Picture-in-Picture
  const togglePictureInPicture = useCallback(async () => {
    if (videoElementRef.current) {
      try {
        const video = videoElementRef.current as ExtendedVideoElement;
        if (state.pictureInPicture) {
          if (document.exitPictureInPicture) {
            await document.exitPictureInPicture();
          }
        } else {
          if (video.requestPictureInPicture) {
            await video.requestPictureInPicture();
          }
        }
      } catch (error) {
        console.error('Picture-in-Picture error:', error);
      }
    }
  }, [state.pictureInPicture]);

  // Controls visibility
  const showControls = useCallback(() => {
    dispatch({ type: 'SET_CONTROLS_VISIBLE', payload: true });
    
    // Auto-hide controls after 3 seconds of inactivity
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (state.isPlaying) {
        dispatch({ type: 'SET_CONTROLS_VISIBLE', payload: false });
      }
    }, 3000);
  }, [state.isPlaying]);

  const hideControls = useCallback(() => {
    dispatch({ type: 'SET_CONTROLS_VISIBLE', payload: false });
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as ExtendedDocument).webkitFullscreenElement ||
        (document as ExtendedDocument).mozFullScreenElement ||
        (document as ExtendedDocument).msFullscreenElement
      );
      dispatch({ type: 'SET_FULLSCREEN', payload: isFullscreen });
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Listen for picture-in-picture changes
  useEffect(() => {
    const video = videoElementRef.current;
    if (!video) return;

    const handleEnterPiP = () => dispatch({ type: 'SET_PICTURE_IN_PICTURE', payload: true });
    const handleLeavePiP = () => dispatch({ type: 'SET_PICTURE_IN_PICTURE', payload: false });

    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const contextValue: MediaContextValue = {
    state,
    dispatch,
    playerRef,
    videoElementRef,
    play,
    pause,
    seek,
    setVolume,
    toggleMute,
    selectAudioTrack,
    selectVideoTrack,
    selectTextTrack,
    toggleFullscreen,
    togglePictureInPicture,
    showControls,
    hideControls,
  };

  return (
    <MediaContext.Provider value={contextValue}>
      {children}
    </MediaContext.Provider>
  );
}

export function useMediaContext(): MediaContextValue {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMediaContext must be used within a MediaProvider');
  }
  return context;
}

// Custom hooks for specific parts of the state
export function useMediaState() {
  const { state } = useMediaContext();
  return state;
}

export function useMediaActions() {
  const {
    play,
    pause,
    seek,
    setVolume,
    toggleMute,
    selectAudioTrack,
    selectVideoTrack,
    selectTextTrack,
    toggleFullscreen,
    togglePictureInPicture,
    showControls,
    hideControls,
  } = useMediaContext();

  return {
    play,
    pause,
    seek,
    setVolume,
    toggleMute,
    selectAudioTrack,
    selectVideoTrack,
    selectTextTrack,
    toggleFullscreen,
    togglePictureInPicture,
    showControls,
    hideControls,
  };
}
