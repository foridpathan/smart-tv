 # Smart TV Media Components

A comprehensive, modular smart TV component library built with Shaka Player for advanced video streaming capabilities. Each component is designed to be fully exportable and plug-and-play for maximum developer flexibility.

## Features

- 🎥 **Shaka Player Integration** - Advanced streaming with DASH, HLS, and MSE support
- 🧩 **Modular Design** - Each control is a separate, exportable component
- 📱 **Smart TV Optimized** - Designed for TV interfaces and remote control navigation
- 🎨 **Fully Customizable** - Extensive styling and theming options
- ♿ **Accessible** - ARIA labels and keyboard navigation support
- 🔧 **TypeScript** - Full type safety with comprehensive interfaces

## Components

### Core Video Player

#### VideoPlayer
The main video player component with Shaka Player integration.

```tsx
import { VideoPlayer, VideoPlayerRef } from '@smart-tv/ui/media';

const playerRef = useRef<VideoPlayerRef>(null);

<VideoPlayer
  ref={playerRef}
  src="https://example.com/video.mpd"
  autoplay={false}
  muted={false}
  onLoad={() => console.log('Video loaded')}
  onError={(error) => console.error('Video error:', error)}
  onTimeUpdate={(time) => setCurrentTime(time)}
  onDurationChange={(duration) => setDuration(duration)}
/>
```

### Individual Control Components

#### PlayButton
Play/Pause toggle button.

```tsx
import { PlayButton } from '@smart-tv/ui/media';

<PlayButton
  isPlaying={isPlaying}
  onPlay={() => playerRef.current?.play()}
  onPause={() => playerRef.current?.pause()}
  size="large"
  variant="circular"
/>
```

#### SeekBar
Video scrubbing and progress display.

```tsx
import { SeekBar } from '@smart-tv/ui/media';

<SeekBar
  currentTime={currentTime}
  duration={duration}
  buffered={bufferedTime}
  onSeek={(time) => playerRef.current?.seek(time)}
  showTime={true}
  height="medium"
/>
```

#### VolumeControl
Volume slider with mute button.

```tsx
import { VolumeControl } from '@smart-tv/ui/media';

<VolumeControl
  volume={volume}
  muted={muted}
  onChange={(vol) => playerRef.current?.setVolume(vol)}
  onMute={() => setMuted(true)}
  onUnmute={() => setMuted(false)}
  orientation="horizontal"
  showMuteButton={true}
/>
```

#### FullscreenButton
Toggle fullscreen mode.

```tsx
import { FullscreenButton } from '@smart-tv/ui/media';

<FullscreenButton
  targetElement={videoContainerRef.current}
  onToggle={(isFullscreen) => console.log('Fullscreen:', isFullscreen)}
  size="medium"
/>
```

#### PictureInPictureButton
Toggle Picture-in-Picture mode.

```tsx
import { PictureInPictureButton } from '@smart-tv/ui/media';

<PictureInPictureButton
  videoElement={playerRef.current?.videoElement}
  onToggle={(isPiP) => console.log('PiP:', isPiP)}
  size="medium"
/>
```

### Track Selector Components

#### AudioTrackSelector
Select audio tracks/languages.

```tsx
import { AudioTrackSelector } from '@smart-tv/ui/media';

<AudioTrackSelector
  tracks={audioTracks}
  activeTrackId={activeAudioTrack}
  onTrackSelect={(track) => playerRef.current?.selectAudioTrack(track.id)}
  showLabels={true}
/>
```

#### VideoTrackSelector
Select video quality/resolution.

```tsx
import { VideoTrackSelector } from '@smart-tv/ui/media';

<VideoTrackSelector
  tracks={videoTracks}
  activeTrackId={activeVideoTrack}
  onTrackSelect={(track) => playerRef.current?.selectVideoTrack(track.id)}
  showQuality={true}
  showBandwidth={true}
/>
```

#### TextTrackSelector
Select subtitles/captions.

```tsx
import { TextTrackSelector } from '@smart-tv/ui/media';

<TextTrackSelector
  tracks={textTracks}
  activeTrackId={activeTextTrack}
  onTrackSelect={(track) => {
    if (track) {
      playerRef.current?.selectTextTrack(track.id);
    } else {
      // Turn off subtitles
    }
  }}
  showOff={true}
  groupByLanguage={true}
/>
```

### Comprehensive Controls

#### PlayerControls
All-in-one control panel combining all individual components.

```tsx
import { PlayerControls } from '@smart-tv/ui/media';

<PlayerControls
  isPlaying={isPlaying}
  currentTime={currentTime}
  duration={duration}
  volume={volume}
  muted={muted}
  videoElement={playerRef.current?.videoElement}
  audioTracks={audioTracks}
  videoTracks={videoTracks}
  textTracks={textTracks}
  onPlay={() => playerRef.current?.play()}
  onPause={() => playerRef.current?.pause()}
  onSeek={(time) => playerRef.current?.seek(time)}
  onVolumeChange={(vol) => playerRef.current?.setVolume(vol)}
  showAudioTrackSelector={true}
  showVideoTrackSelector={true}
  showTextTrackSelector={true}
  size="medium"
  theme="dark"
  layout="horizontal"
/>
```

## Complete Example

```tsx
import React, { useRef, useState } from 'react';
import {
  VideoPlayer,
  PlayerControls,
  VideoPlayerRef,
  PlayerControlsRef
} from '@smart-tv/ui/media';

export function VideoPlayerExample() {
  const playerRef = useRef<VideoPlayerRef>(null);
  const controlsRef = useRef<PlayerControlsRef>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  return (
    <div className="video-player-container">
      <VideoPlayer
        ref={playerRef}
        src="https://example.com/video.mpd"
        onTimeUpdate={setCurrentTime}
        onDurationChange={setDuration}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onVolumeChange={setVolume}
      />
      
      <PlayerControls
        ref={controlsRef}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        muted={muted}
        videoElement={playerRef.current?.videoElement}
        onPlay={() => playerRef.current?.play()}
        onPause={() => playerRef.current?.pause()}
        onSeek={(time) => playerRef.current?.seek(time)}
        onVolumeChange={(vol) => playerRef.current?.setVolume(vol)}
        onMute={() => setMuted(true)}
        onUnmute={() => setMuted(false)}
        theme="dark"
        size="medium"
      />
    </div>
  );
}
```

## Plug & Play Usage

Each component can be used independently:

```tsx
// Use only what you need
import { PlayButton, SeekBar, VolumeControl } from '@smart-tv/ui/media';

// Custom control layout
<div className="my-custom-controls">
  <PlayButton onToggle={handlePlayToggle} />
  <SeekBar currentTime={time} duration={duration} onSeek={handleSeek} />
  <VolumeControl volume={volume} onChange={handleVolumeChange} />
</div>
```

## Styling & Theming

All components support:
- **Size variants**: `small`, `medium`, `large`
- **Custom className**: Add your own CSS classes
- **Theme support**: Light/dark themes
- **CSS variables**: Customize colors and spacing

```tsx
<PlayerControls
  className="my-custom-controls"
  size="large"
  theme="dark"
  // Custom styling via CSS
/>
```

## Accessibility

- Full keyboard navigation support
- ARIA labels and descriptions
- Screen reader compatible
- Focus management
- High contrast support

## Browser Support

- Modern browsers with ES2017+ support
- Shaka Player requirements apply
- Fullscreen API support
- Picture-in-Picture API support (where available)

## Dependencies

- `shaka-player`: Advanced video streaming
- `react`: Component framework
- `tailwindcss`: Styling (optional, can be customized)
