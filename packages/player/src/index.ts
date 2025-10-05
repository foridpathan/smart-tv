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
export { AudioTrack as AudioTrackSelector } from "./components/AudioTrack";
export { TextTrack as TextTrackSelector } from "./components/TextTrack";
export { TrackSelector } from "./components/TrackSelector";
export { VideoTrack as VideoTrackSelector } from "./components/VideoTrack";

// Hooks and context
export {
    MediaProvider,
    useMediaContext,
    usePlayer,
    usePlayerActions,
    usePlayerState,
    useTracks
} from "./hooks/MediaContext";

// Types
export type {
    AudioTrack,
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
    TextTrack,
    TrackSelectorProps,
    VideoTrack,
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

