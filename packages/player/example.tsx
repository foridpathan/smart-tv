import {
    Fullscreen,
    init,
    MediaProvider,
    PictureInPicture,
    PlayButton,
    PlayerControls,
    SeekBar,
    TrackSelector,
    useFocusable,
    useMediaContext,
    VideoPlayer,
    VolumeControl,
} from '@smart-tv/player';
import { useState } from 'react';

// Initialize spatial navigation (call once in your app)
init();

// Basic Player Example
export function BasicPlayer() {
  return (
    <MediaProvider>
      <div className="relative w-full h-screen bg-black">
        <VideoPlayer
          src="https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd"
          poster="https://storage.googleapis.com/shaka-demo-assets/angel-one/poster.jpg"
          autoPlay={false}
          onReady={() => console.log('Player ready')}
          onError={(error) => console.error('Player error:', error)}
          onPlay={() => console.log('Playing')}
          onPause={() => console.log('Paused')}
        />
        <PlayerControls 
          className=""
          style={{}}
        />
      </div>
    </MediaProvider>
  );
}

// Advanced Player with Custom Controls
export function AdvancedPlayer() {
  const [showAudioTracks, setShowAudioTracks] = useState(false);
  const [showVideoTracks, setShowVideoTracks] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);

  return (
    <MediaProvider>
      <div className="relative w-full h-screen bg-black">
        <VideoPlayer
          src="https://storage.googleapis.com/shaka-demo-assets/sintel/dash.mpd"
          autoPlay={false}
          muted={false}
          volume={0.8}
        />
        
        <CustomControls
          onShowAudioTracks={() => setShowAudioTracks(true)}
          onShowVideoTracks={() => setShowVideoTracks(true)}
          onShowSubtitles={() => setShowSubtitles(true)}
        />

        {showAudioTracks && (
          <TrackSelector
            type="audio"
            title="Select Audio Language"
            onClose={() => setShowAudioTracks(false)}
            className=""
            style={{}}
            onTrackSelect={() => {}}
          />
        )}

        {showVideoTracks && (
          <TrackSelector
            type="video"
            title="Video Quality"
            onClose={() => setShowVideoTracks(false)}
            className=""
            style={{}}
            onTrackSelect={() => {}}
          />
        )}

        {showSubtitles && (
          <TrackSelector
            type="text"
            title="Subtitles"
            onClose={() => setShowSubtitles(false)}
            className=""
            style={{}}
            onTrackSelect={() => {}}
          />
        )}
      </div>
    </MediaProvider>
  );
}

// Custom Controls Component
function CustomControls({ onShowAudioTracks, onShowVideoTracks, onShowSubtitles }: {
  onShowAudioTracks: () => void;
  onShowVideoTracks: () => void;
  onShowSubtitles: () => void;
}) {
  const { state } = useMediaContext();
  const { ref, hasFocusedChild } = useFocusable({
    focusKey: 'custom-controls',
    trackChildren: true,
  });

  const [isVisible, setIsVisible] = useState(true);

  return (
    <div
      ref={ref}
      className={`absolute bottom-0 left-0 right-0 z-10 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)',
      }}
    >
      <div className="p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <SeekBar 
            focusKey="main-seekbar"
            showPreview={true}
            stepTime={10}
            className="w-full"
            style={{}}
            onSeek={() => {}}
            onSeekStart={() => {}}
            onSeekEnd={() => {}}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-4">
            <PlayButton
              focusKey="main-play"
              size="lg"
              variant="default"
              className=""
              style={{}}
              playIcon={<span>▶</span>}
              pauseIcon={<span>⏸</span>}
              onClick={() => {}}
              onFocus={() => {}}
              onBlur={() => {}}
            />
            <VolumeControl
              focusKey="main-volume"
              orientation="horizontal"
              showMuteButton={true}
              className=""
              style={{}}
              onVolumeChange={() => {}}
              onMuteToggle={() => {}}
            />
            <div className="text-white text-sm">
              {formatTime((state as any)?.currentTime || 0)} / {formatTime((state as any)?.duration || 0)}
            </div>
          </div>

          {/* Center Controls */}
          <div className="flex items-center gap-3">
            <ControlButton
              focusKey="audio-btn"
              onClick={onShowAudioTracks}
              label="Audio"
            />
            <ControlButton
              focusKey="quality-btn"
              onClick={onShowVideoTracks}
              label="Quality"
            />
            <ControlButton
              focusKey="subtitles-btn"
              onClick={onShowSubtitles}
              label="Subtitles"
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <PictureInPicture 
              focusKey="pip-btn"
              className=""
              style={{}}
              onToggle={() => {}}
            />
            <Fullscreen 
              focusKey="fullscreen-btn"
              className=""
              style={{}}
              onToggle={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom Control Button
function ControlButton({ focusKey, onClick, label }) {
  const { ref, focused } = useFocusable({
    focusKey,
    onEnterPress: onClick,
  });

  return (
    <button
      ref={ref}
      className={`px-4 py-2 rounded text-white text-sm transition-all ${
        focused
          ? 'bg-blue-600 ring-2 ring-blue-400 scale-105'
          : 'bg-white bg-opacity-20 hover:bg-opacity-30'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// DRM Protected Content Example
export function DRMPlayer() {
  const drmSources = [
    {
      src: 'https://storage.googleapis.com/shaka-demo-assets/angel-one-widevine/dash.mpd',
      drm: {
        servers: {
          'com.widevine.alpha': 'https://cwip-shaka-proxy.appspot.com/no_auth',
        },
      },
    },
  ];

  return (
    <MediaProvider>
      <div className="relative w-full h-screen bg-black">
        <VideoPlayer
          src={drmSources}
          onError={(error) => {
            console.error('DRM Player Error:', error);
            // Handle DRM errors gracefully
          }}
        />
        <PlayerControls 
          className=""
          style={{}}
        >
          {/* Default controls will be rendered */}
        </PlayerControls>
      </div>
    </MediaProvider>
  );
}

// Smart TV Navigation Example
export function SmartTVExample() {
  const { ref } = useFocusable({
    focusKey: 'smart-tv-app',
    trackChildren: true,
  });

  return (
    <div ref={ref} className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="p-4 bg-gray-800">
        <h1 className="text-2xl font-bold">Smart TV Player Demo</h1>
        <p className="text-gray-300 mt-1">Use arrow keys or remote control to navigate</p>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <AdvancedPlayer />
      </main>

      {/* Instructions */}
      <footer className="p-4 bg-gray-800 text-sm text-gray-300">
        <div className="flex gap-8">
          <div>
            <strong>Remote Control:</strong>
            <ul className="mt-1 space-y-1">
              <li>Arrow Keys: Navigate</li>
              <li>Enter/OK: Select</li>
              <li>Back: Close menus</li>
            </ul>
          </div>
          <div>
            <strong>Playback:</strong>
            <ul className="mt-1 space-y-1">
              <li>Space/Play: Play/Pause</li>
              <li>Left/Right: Seek</li>
              <li>Up/Down: Volume</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Utility function (you can import from @smart-tv/player)
function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Export all examples
export default {
  BasicPlayer,
  AdvancedPlayer,
  DRMPlayer,
  SmartTVExample,
};
