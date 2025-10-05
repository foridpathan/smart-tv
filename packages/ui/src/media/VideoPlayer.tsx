
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useMediaContext } from './MediaContext';

// Declare Shaka Player types
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

interface ShakaStatic {
  Player: {
    new (video: HTMLVideoElement): ShakaPlayer;
    isBrowserSupported(): boolean;
  };
  polyfill: {
    installAll(): void;
  };
}

// Declare global shaka
declare global {
  interface Window {
    shaka?: ShakaStatic;
  }
}

export interface VideoPlayerProps {
  src: string;
  autoplay?: boolean;
  muted?: boolean;
  poster?: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export interface VideoPlayerRef {
  player: ShakaPlayer | null;
  videoElement: HTMLVideoElement | null;
}

// Core Shaka Player wrapper component
export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(function VideoPlayer({
  src,
  autoplay = true,
  muted = false,
  poster,
  className = '',
  onLoad,
  onError,
}, ref) {
  const { playerRef, videoElementRef, dispatch, showControls } = useMediaContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shakaLoaded, setShakaLoaded] = useState(false);

  // Load Shaka Player dynamically
  useEffect(() => {
    let mounted = true;
    
    const initializeShaka = async () => {
      try {
        // Load Shaka Player from CDN
        if (!window.shaka) {
          // Check if script already exists
          if (!document.querySelector('script[src*="shaka-player"]')) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/shaka-player@4.16.3/dist/shaka-player.compiled.js';
            script.async = true;
            
            await new Promise<void>((resolve, reject) => {
              script.onload = () => resolve();
              script.onerror = reject;
              document.head.appendChild(script);
            });
          }
          
          // Wait for shaka to be available
          let attempts = 0;
          while (!window.shaka && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
        }
        
        if (window.shaka?.polyfill && mounted) {
          window.shaka.polyfill.installAll();
          setShakaLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load Shaka Player:', error);
        if (mounted) {
          dispatch({ type: 'SET_ERROR', payload: 'Failed to load video player' });
        }
      }
    };
    
    initializeShaka();
    
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!videoRef.current || !shakaLoaded || !window.shaka) return;

    // Store reference in context
    videoElementRef.current = videoRef.current;

    // Check for browser support
    if (!window.shaka.Player.isBrowserSupported()) {
      onError?.(new Error('Browser not supported!'));
      return;
    }

    const player = new window.shaka.Player(videoRef.current);
    playerRef.current = player;

    // Error handling
    player.addEventListener('error', (event: Event) => {
      const errorEvent = event as Event & { detail?: { message?: string } };
      const errorMsg = errorEvent.detail?.message || 'Player error';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      onError?.(new Error(errorMsg));
    });

    // Load the video
    dispatch({ type: 'SET_LOADING', payload: true });
    player.load(src).then(() => {
      dispatch({ type: 'SET_LOADING', payload: false });
      onLoad?.();
      
      // Update tracks
      const audioTracks = player.getAudioLanguages().map((lang) => ({
        id: lang,
        language: lang,
      }));
      
      const videoTracks = player.getVariantTracks().map(track => ({
        id: track.id.toString(),
        width: track.width,
        height: track.height,
        bandwidth: track.bandwidth,
        language: track.language, // Include language to associate with audio tracks
      }));
      
      const textTracks = player.getTextTracks().map(track => ({
        id: track.id.toString(),
        language: track.language,
        label: track.label,
        kind: track.kind,
      }));
      
      dispatch({ type: 'SET_AUDIO_TRACKS', payload: audioTracks });
      dispatch({ type: 'SET_VIDEO_TRACKS', payload: videoTracks });
      dispatch({ type: 'SET_TEXT_TRACKS', payload: textTracks });
      
    }).catch((error: Error) => {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_ERROR', payload: error.message });
      onError?.(error);
    });

    return () => {
      player.destroy().catch(console.error);
    };
  }, [src, onLoad, onError, dispatch, playerRef, videoElementRef, shakaLoaded]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      dispatch({ type: 'SET_TIME', payload: video.currentTime });
      
      // Update buffered
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        dispatch({ type: 'SET_BUFFERED', payload: bufferedEnd });
      }
    };
    
    const handleDurationChange = () => {
      dispatch({ type: 'SET_DURATION', payload: video.duration });
    };
    
    const handlePlay = () => {
      dispatch({ type: 'SET_PLAYING', payload: true });
    };
    
    const handlePause = () => {
      dispatch({ type: 'SET_PLAYING', payload: false });
    };
    
    const handleVolumeChange = () => {
      dispatch({ type: 'SET_VOLUME', payload: video.volume });
      dispatch({ type: 'SET_MUTED', payload: video.muted });
    };

    const handleMouseMove = () => {
      showControls();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('mousemove', handleMouseMove);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('mousemove', handleMouseMove);
    };
  }, [dispatch, showControls]);

  useImperativeHandle(ref, () => ({
    player: playerRef.current,
    videoElement: videoRef.current,
  }));

  return (
    <video
      ref={videoRef}
      autoPlay={autoplay}
      muted={muted}
      poster={poster}
      className={`tv-video-player ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
});
