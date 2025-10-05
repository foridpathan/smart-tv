import { ReactNode } from 'react';

// Player state types
export interface PlayerState {
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  paused: boolean;
  ended: boolean;
  buffered: TimeRanges | null;
  loading: boolean;
  error: Error | null;
  fullscreen: boolean;
  pictureInPicture: boolean;
  playbackRate: number;
  seeking: boolean;
  waiting: boolean;
  audioTracks: AudioTrack[];
  videoTracks: VideoTrack[];
  textTracks: TextTrack[];
}

// Track types
export interface AudioTrack {
  id: string;
  language: string;
  label: string;
  kind: string;
  roles?: string[];
  active: boolean;
  bandwidth?: number;
  codecs?: string;
}

export interface VideoTrack {
  id: string;
  language: string;
  label: string;
  kind: string;
  bandwidth: number;
  width: number;
  height: number;
  frameRate: number;
  codecs: string;
  active: boolean;
}

export interface TextTrack {
  id: string;
  language: string;
  label: string;
  kind: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
  active: boolean;
  mode: 'disabled' | 'hidden' | 'showing';
}

// Player source types
export interface PlayerSource {
  src: string;
  type?: string;
  drm?: DrmConfig;
}

export interface DrmConfig {
  servers: Record<string, string>;
  advanced?: Record<string, any>;
  clearKeys?: Record<string, string>;
}

// Component props types
export interface MediaPlayerProps {
  src?: string | PlayerSource[];
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  style?: React.CSSProperties;
  volume?: number;
  playbackRate?: number;
  crossOrigin?: 'anonymous' | 'use-credentials';
  preload?: 'none' | 'metadata' | 'auto';
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onVolumeChange?: (volume: number) => void;
  onProgress?: (buffered: TimeRanges) => void;
  onSeeking?: () => void;
  onSeeked?: () => void;
  onWaiting?: () => void;
  onLoadStart?: () => void;
  onLoadedData?: () => void;
  onLoadedMetadata?: () => void;
  onCanPlay?: () => void;
  onCanPlayThrough?: () => void;
  onFullscreenChange?: (fullscreen: boolean) => void;
  onPictureInPictureChange?: (pip: boolean) => void;
  onPlaybackRateChange?: (rate: number) => void;
  onTracksChange?: () => void;
}

export interface PlayerControlsProps {
  className?: string;
  style?: React.CSSProperties;
  showOnHover?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  focusKey?: string;
  children?: ReactNode;
}

export interface PlayButtonProps {
  className?: string;
  style?: React.CSSProperties;
  focusKey?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  showIcon?: boolean;
  playIcon?: ReactNode;
  pauseIcon?: ReactNode;
  onClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface SeekBarProps {
  className?: string;
  style?: React.CSSProperties;
  focusKey?: string;
  showPreview?: boolean;
  showThumbnails?: boolean;
  thumbnailSrc?: string;
  stepTime?: number;
  onSeek?: (time: number) => void;
  onSeekStart?: () => void;
  onSeekEnd?: () => void;
}

export interface VolumeControlProps {
  className?: string;
  style?: React.CSSProperties;
  focusKey?: string;
  orientation?: 'horizontal' | 'vertical';
  showMuteButton?: boolean;
  step?: number;
  onVolumeChange?: (volume: number) => void;
  onMuteToggle?: () => void;
}

export interface TrackSelectorProps {
  className?: string;
  style?: React.CSSProperties;
  focusKey?: string;
  type: 'audio' | 'video' | 'text';
  title?: string;
  onTrackSelect?: (trackId: string) => void;
  onClose?: () => void;
}

// Player instance types
export interface MediaPlayerInstance {
  play(): Promise<void>;
  pause(): void;
  seek(time: number): void;
  setVolume(volume: number): void;
  setMuted(muted: boolean): void;
  setPlaybackRate(rate: number): void;
  enterFullscreen(): Promise<void>;
  exitFullscreen(): Promise<void>;
  enterPictureInPicture(): Promise<void>;
  exitPictureInPicture(): Promise<void>;
  getCurrentTime(): number;
  getDuration(): number;
  getVolume(): number;
  isMuted(): boolean;
  isPaused(): boolean;
  isEnded(): boolean;
  isFullscreen(): boolean;
  isPictureInPicture(): boolean;
  getPlaybackRate(): number;
  getAudioTracks(): AudioTrack[];
  getVideoTracks(): VideoTrack[];
  getTextTracks(): TextTrack[];
  selectAudioTrack(trackId: string): void;
  selectVideoTrack(trackId: string): void;
  selectTextTrack(trackId: string): void;
  destroy(): void;
}

// Event types
export type PlayerEventType =
  | 'ready'
  | 'play'
  | 'pause'
  | 'ended'
  | 'error'
  | 'timeupdate'
  | 'durationchange'
  | 'volumechange'
  | 'progress'
  | 'seeking'
  | 'seeked'
  | 'waiting'
  | 'loadstart'
  | 'loadeddata'
  | 'loadedmetadata'
  | 'canplay'
  | 'canplaythrough'
  | 'fullscreenchange'
  | 'pictureinpicturechange'
  | 'playbackratechange'
  | 'trackschange';

export interface PlayerEvent {
  type: PlayerEventType;
  target: MediaPlayerInstance;
  data?: any;
}
