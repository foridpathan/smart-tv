// Core components
export { PlayerControls } from "./components/PlayerControls";
export { VideoPlayer } from "./components/VideoPlayer";

// Control components
export { Fullscreen } from "./components/Fullscreen";
export { PictureInPicture } from "./components/PictureInPicture";
export { PlayButton } from "./components/PlayButton";
export { SeekBar } from "./components/SeekBar";
export { VolumeControl } from "./components/VolumeControl";

// Track components
export { AudioTrack } from "./components/AudioTrack";
export { TextTrack } from "./components/TextTrack";
export { TrackSelector } from "./components/TrackSelector";
export { VideoTrack } from "./components/VideoTrack";

// Hooks and context
export {
    MediaProvider,
    useMediaContext,
    usePlayer,
    usePlayerActions,
    usePlayerDisplay,
    usePlayerPlayback,
    usePlayerState,
    usePlayerTime,
    usePlayerVolume,
    useTracks
} from "./hooks/MediaContext";

// Optimized hooks to prevent unnecessary re-renders
export {
    useAudioTracks,
    useBuffered,
    useCurrentTime,
    useDuration,
    useFullscreen,
    useLoading,
    useMuted,
    usePaused,
    usePictureInPicture,
    usePlaybackState,
    usePlayerActionsOnly,
    usePlayerControls,
    usePlayerInstance,
    useTextTracks,
    useTimeProgress,
    useVideoTracks,
    useVolume,
    useVolumeState
} from "./hooks/useOptimizedHooks";

// Types
export type {
    AudioTrack as AudioTrackType,
    DrmConfig,
    MediaPlayerInstance,
    MediaPlayerProps,
    PlayButtonProps,
    PlayerControlsProps,
    PlayerEvent,
    PlayerEventType,
    PlayerSource,
    PlayerState,
    SeekBarProps,
    TextTrack as TextTrackType,
    TrackSelectorProps,
    VideoTrack as VideoTrackType,
    VolumeControlProps
} from "./types";

// Utilities
export {
    clamp,
    cn,
    debounce,
    formatTime,
    getDisplayLanguage,
    throttle
} from "./utils";

