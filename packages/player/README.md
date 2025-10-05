# @smart-tv/player

A comprehensive Smart TV video player built with Shaka Player and spatial navigation support. Designed for TV apps, this player provides a full-featured video experience with focus management optimized for remote control navigation.

## Features

- 🎥 **Shaka Player Integration** - Professional-grade streaming with adaptive bitrate
- 🎯 **Smart TV Focus Management** - Built-in spatial navigation for remote controls
- 🔧 **Fully Customizable** - Flexible component architecture
- 📱 **Responsive Design** - Works on TV, mobile, and desktop
- 🎭 **No External Dependencies** - Self-contained state management
- 🌐 **Multi-language Support** - Audio tracks, subtitles, and quality selection
- 🎨 **Tailwind CSS** - Styled with utility classes
- 📡 **DRM Support** - Protected content playback
- 🖼️ **Picture-in-Picture** - Modern viewing experience
- ⌨️ **Keyboard Navigation** - Full keyboard and remote control support

## Installation

```bash
npm install @smart-tv/player
# or
yarn add @smart-tv/player
# or
pnpm add @smart-tv/player
```

## Quick Start

```tsx
import React from 'react';
import { 
  VideoPlayer, 
  PlayerControls, 
  MediaProvider,
  init 
} from '@smart-tv/player';

// Initialize focus management (call once in your app)
init();

function App() {
  return (
    <MediaProvider>
      <div className="relative w-full h-screen bg-black">
        <VideoPlayer
          src="https://example.com/video.m3u8"
          poster="https://example.com/poster.jpg"
          autoPlay={false}
          onReady={() => console.log('Player ready')}
          onError={(error) => console.error('Player error:', error)}
        />
        <PlayerControls />
      </div>
    </MediaProvider>
  );
}
```

## Advanced Usage

### With Custom Controls

```tsx
import React from 'react';
import { 
  VideoPlayer, 
  MediaProvider,
  PlayButton,
  SeekBar,
  VolumeControl,
  Fullscreen,
  TrackSelector,
  useFocusable
} from '@smart-tv/player';

function CustomPlayer() {
  const [showTracks, setShowTracks] = useState(false);
  const { ref } = useFocusable({ focusKey: 'custom-player' });

  return (
    <MediaProvider>
      <div ref={ref} className="relative w-full h-screen bg-black">
        <VideoPlayer
          src="https://example.com/video.m3u8"
          autoPlay={false}
        />
        
        {/* Custom control layout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black">
          <SeekBar className="mb-4" />
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <PlayButton size="lg" />
              <VolumeControl orientation="horizontal" />
            </div>
            
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-white bg-opacity-20 rounded text-white"
                onClick={() => setShowTracks(true)}
              >
                Settings
              </button>
              <Fullscreen />
            </div>
          </div>
        </div>

        {showTracks && (
          <TrackSelector
            type="video"
            onClose={() => setShowTracks(false)}
          />
        )}
      </div>
    </MediaProvider>
  );
}
```

### With DRM Support

```tsx
import React from 'react';
import { VideoPlayer, MediaProvider } from '@smart-tv/player';

const drmSources = [
  {
    src: 'https://example.com/protected-video.m3u8',
    drm: {
      servers: {
        'com.widevine.alpha': 'https://license-server.com/widevine',
        'com.microsoft.playready': 'https://license-server.com/playready'
      },
      advanced: {
        'com.widevine.alpha': {
          videoRobustness: 'SW_SECURE_CRYPTO',
          audioRobustness: 'SW_SECURE_CRYPTO'
        }
      }
    }
  }
];

function ProtectedVideo() {
  return (
    <MediaProvider>
      <VideoPlayer
        src={drmSources}
        onError={(error) => console.error('DRM Error:', error)}
      />
    </MediaProvider>
  );
}
```

## API Reference

### Core Components

#### `<VideoPlayer>`
The main video player component using Shaka Player.

**Props:**
- `src?: string | PlayerSource[]` - Video source URL or array of sources
- `poster?: string` - Poster image URL
- `autoPlay?: boolean` - Auto-play video
- `loop?: boolean` - Loop playback
- `muted?: boolean` - Start muted
- `volume?: number` - Initial volume (0-1)
- `playbackRate?: number` - Initial playback rate
- `onReady?: () => void` - Player ready callback
- `onPlay?: () => void` - Play event callback
- `onPause?: () => void` - Pause event callback
- `onError?: (error: Error) => void` - Error callback

#### `<PlayerControls>`
Complete player controls overlay with Smart TV navigation.

**Props:**
- `showOnHover?: boolean` - Show controls on mouse hover
- `autoHide?: boolean` - Auto-hide controls
- `autoHideDelay?: number` - Auto-hide delay in milliseconds
- `className?: string` - Custom CSS classes
- `children?: ReactNode` - Custom content

#### `<MediaProvider>`
Context provider for player state management.

### Control Components

#### `<PlayButton>`
Play/pause button with focus management.

**Props:**
- `size?: 'sm' | 'md' | 'lg'` - Button size
- `variant?: 'default' | 'ghost' | 'outline'` - Button style
- `focusKey?: string` - Custom focus key
- `playIcon?: ReactNode` - Custom play icon
- `pauseIcon?: ReactNode` - Custom pause icon

#### `<SeekBar>`
Progress bar with seeking functionality.

**Props:**
- `showPreview?: boolean` - Show time preview on hover
- `stepTime?: number` - Keyboard seek step in seconds
- `focusKey?: string` - Custom focus key

#### `<VolumeControl>`
Volume control with mute button.

**Props:**
- `orientation?: 'horizontal' | 'vertical'` - Control orientation
- `showMuteButton?: boolean` - Show mute button
- `step?: number` - Volume change step

#### `<TrackSelector>`
Track selection overlay (audio, video quality, subtitles).

**Props:**
- `type: 'audio' | 'video' | 'text'` - Track type
- `title?: string` - Custom title
- `onTrackSelect?: (track) => void` - Track selection callback
- `onClose?: () => void` - Close callback

### Hooks

#### `useMediaContext()`
Access the media context state and actions.

```tsx
const { state, player, actions } = useMediaContext();
```

#### `usePlayerState()`
Get current player state.

```tsx
const { currentTime, duration, paused, volume } = usePlayerState();
```

#### `useFocusable(config)`
Smart TV focus management hook.

```tsx
const { ref, focused, focusSelf } = useFocusable({
  focusKey: 'my-component',
  onEnterPress: () => console.log('Enter pressed'),
  onArrowPress: (direction) => console.log('Arrow:', direction)
});
```

### Focus Management

The package includes a complete spatial navigation system for Smart TV apps:

```tsx
import { init, setFocus, useFocusable } from '@smart-tv/player';

// Initialize once in your app
init();

// Use in components
function MyButton() {
  const { ref, focused } = useFocusable({
    focusKey: 'my-button',
    onEnterPress: () => console.log('Button pressed!'),
    onArrowPress: (direction) => {
      // Handle arrow navigation
      return true; // Allow default navigation
    }
  });

  return (
    <button 
      ref={ref}
      className={focused ? 'ring-2 ring-blue-500' : ''}
    >
      My Button
    </button>
  );
}

// Programmatic focus
setFocus('my-button');
```

## Styling

The package uses Tailwind CSS classes. Make sure Tailwind is configured in your project:

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@smart-tv/player/**/*.{js,ts,jsx,tsx}',
  ],
  // ... rest of your config
};
```

Or import the base styles:

```css
@import '@smart-tv/player/styles.css';
```

## Browser Support

- Modern browsers with ES2018+ support
- Smart TV platforms (Tizen, webOS, Android TV)
- Chrome, Firefox, Safari, Edge
- Node.js 16+ for SSR

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Built with [Shaka Player](https://github.com/shaka-project/shaka-player)
- Inspired by modern TV streaming experiences
- Designed for the Smart TV development community
