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
  children?: ReactNode;
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
  // Playlist configuration
  playlist?: {
    state: PlaylistState;
    config?: PlaylistConfig;
    callbacks?: PlaylistCallbacks;
  };
  showPlaylist?: boolean;
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

// Playlist types
export interface PlaylistItem {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  url: string;
  type?: 'video' | 'audio';
  metadata?: Record<string, any>;
  isActive?: boolean;
  progress?: number; // 0-100
  // DRM configuration for this specific item
  drm?: DrmConfig;
  // Custom headers for this item
  headers?: Record<string, string>;
  // Subtitles/captions for this item
  subtitles?: Array<{
    url: string;
    language: string;
    label: string;
    isDefault?: boolean;
  }>;
  // Quality levels available for this item
  qualities?: Array<{
    url: string;
    label: string;
    width?: number;
    height?: number;
    bandwidth?: number;
  }>;
}

export interface PlaylistRail {
  id: string;
  title: string;
  type: 'queue' | 'related' | 'recommendations' | 'history' | 'custom';
  items: PlaylistItem[];
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  maxVisible?: number;
  priority?: number; // for ordering rails
}

export interface PlaylistState {
  currentItemId?: string;
  rails: PlaylistRail[];
  isVisible: boolean;
  expandedRails: string[];
  activeRail?: string;
  // Auto-play state
  autoPlayEnabled?: boolean;
  autoPlayCountdown?: number; // seconds
  nextItemId?: string;
}

export interface PlaylistConfig {
  showThumbnails?: boolean;
  showDuration?: boolean;
  showProgress?: boolean;
  maxRailHeight?: number;
  itemsPerRow?: number;
  autoPlay?: boolean;
  autoPlayDelay?: number; // seconds before auto-playing next item (default: 5)
  autoPlayCountdown?: boolean; // show countdown timer
  loop?: boolean;
  shuffle?: boolean;
  saveHistory?: boolean;
  // DRM configuration
  globalDrm?: DrmConfig; // Global DRM config applied to all items without specific DRM
  drmFallback?: boolean; // Try to play without DRM if DRM fails
  // Quality settings
  preferredQuality?: 'auto' | 'highest' | 'lowest' | string;
  adaptiveStreaming?: boolean;
  // Preload settings
  preloadNext?: boolean; // Preload the next item in queue
  preloadCount?: number; // Number of items to preload (default: 1)
}

export interface PlaylistCallbacks {
  onItemSelect?: (item: PlaylistItem) => void;
  onItemPlay?: (item: PlaylistItem) => void;
  onItemEnd?: (item: PlaylistItem) => void; // Called when an item finishes playing
  onAutoPlayStart?: (nextItem: PlaylistItem, countdown: number) => void;
  onAutoPlayCancel?: (nextItem: PlaylistItem) => void;
  onDrmError?: (item: PlaylistItem, error: Error) => void;
  onQualityChange?: (item: PlaylistItem, quality: string) => void;
  onRailExpand?: (railId: string) => void;
  onRailCollapse?: (railId: string) => void;
  onLoadMore?: (railId: string) => Promise<PlaylistItem[]>;
  // Navigation callbacks
  onNext?: () => PlaylistItem | undefined;
  onPrevious?: () => PlaylistItem | undefined;
  onGetNextItem?: (currentItemId: string) => PlaylistItem | undefined;
  onGetPreviousItem?: (currentItemId: string) => PlaylistItem | undefined;
}
