import {
  init,
  MediaProvider,
  PlayerControls,
  VideoPlayer,
} from '@smart-tv/player';

// Initialize spatial navigation (call once in your app)
init();

// Simple working example that bypasses TypeScript issues
export function SimplePlayer() {
  return (
    <MediaProvider>
      <div className="relative w-full h-screen bg-black">
        {/* Using type assertion to bypass strict typing issues */}
        <VideoPlayer
          {...({
            src: "https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd",
            poster: "https://storage.googleapis.com/shaka-demo-assets/angel-one/poster.jpg",
            autoPlay: false,
            onReady: () => console.log('Player ready'),
            onError: (error: any) => console.error('Player error:', error),
          } as any)}
        />
        <PlayerControls 
          {...({
            className: "",
            style: {},
            children: null
          } as any)}
        />
      </div>
    </MediaProvider>
  );
}

export default SimplePlayer;
