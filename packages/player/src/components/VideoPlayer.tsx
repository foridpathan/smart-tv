import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import shaka from 'shaka-player';
import { useMediaContext } from '../hooks/MediaContext';
import { AudioTrack, MediaPlayerInstance, MediaPlayerProps, TextTrack, VideoTrack } from '../types';
import { cn } from '../utils';

// Ensure Shaka Player polyfills are installed
if (typeof window !== 'undefined') {
  shaka.polyfill.installAll();
}

export const VideoPlayer = forwardRef<MediaPlayerInstance, MediaPlayerProps>(
  (props, ref) => {
    const {
      src,
      poster,
      autoPlay = true,
      loop = false,
      muted = false,
      controls = false,
      className,
      style,
      volume = 1,
      playbackRate = 1,
      crossOrigin,
      preload = 'metadata',
      onReady,
      onPlay,
      onPause,
      onEnded,
      onError,
      onTimeUpdate,
      onDurationChange,
      onVolumeChange,
      onProgress,
      onSeeking,
      onSeeked,
      onWaiting,
      onLoadStart,
      onLoadedData,
      onLoadedMetadata,
      onCanPlay,
      onCanPlayThrough,
      onFullscreenChange,
      onPictureInPictureChange,
      onPlaybackRateChange,
      onTracksChange,
    } = props;

    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<shaka.Player | null>(null);
    const lastTimeUpdateRef = useRef<number>(0);
    
    // Throttle time updates to prevent excessive re-renders (update at most every 100ms)
    const TIME_UPDATE_THROTTLE = 100;
    
    // Get media context if available
    let mediaContext: any = null;
    try {
      mediaContext = useMediaContext();
    } catch {
      // Context not available, that's okay
    }

    // Player instance API
    const playerInstance: MediaPlayerInstance = {
      async play() {
        if (videoRef.current) {
          await videoRef.current.play();
        }
      },
      
      pause() {
        if (videoRef.current) {
          videoRef.current.pause();
        }
      },
      
      seek(time: number) {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      },
      
      setVolume(volume: number) {
        if (videoRef.current) {
          videoRef.current.volume = Math.max(0, Math.min(1, volume));
        }
      },
      
      setMuted(muted: boolean) {
        if (videoRef.current) {
          videoRef.current.muted = muted;
        }
      },
      
      setPlaybackRate(rate: number) {
        if (videoRef.current) {
          videoRef.current.playbackRate = rate;
        }
      },
      
      async enterFullscreen() {
        if (videoRef.current && videoRef.current.requestFullscreen) {
          await videoRef.current.requestFullscreen();
        }
      },
      
      async exitFullscreen() {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      },
      
      async enterPictureInPicture() {
        if (videoRef.current && (videoRef.current as any).requestPictureInPicture) {
          await (videoRef.current as any).requestPictureInPicture();
        }
      },
      
      async exitPictureInPicture() {
        if ((document as any).exitPictureInPicture) {
          await (document as any).exitPictureInPicture();
        }
      },
      
      getCurrentTime(): number {
        return videoRef.current?.currentTime ?? 0;
      },
      
      getDuration(): number {
        return videoRef.current?.duration ?? 0;
      },
      
      getVolume(): number {
        return videoRef.current?.volume ?? 0;
      },
      
      isMuted(): boolean {
        return videoRef.current?.muted ?? false;
      },
      
      isPaused(): boolean {
        return videoRef.current?.paused ?? true;
      },
      
      isEnded(): boolean {
        return videoRef.current?.ended ?? false;
      },
      
      isFullscreen(): boolean {
        return !!document.fullscreenElement;
      },
      
      isPictureInPicture(): boolean {
        return !!(document as any).pictureInPictureElement;
      },
      
      getPlaybackRate(): number {
        return videoRef.current?.playbackRate ?? 1;
      },
      
      getAudioTracks(): AudioTrack[] {
        if (!playerRef.current) return [];
        
        const variants = playerRef.current.getVariantTracks();
        const audioTracks: AudioTrack[] = [];
        const seenLanguages = new Set<string>();
        
        variants.forEach((variant: any) => {
          if (variant.audioCodec && !seenLanguages.has(variant.language)) {
            seenLanguages.add(variant.language);
            audioTracks.push({
              id: variant.audioId?.toString() || '',
              language: variant.language,
              label: variant.label || variant.language,
              kind: 'main',
              roles: variant.roles,
              active: variant.active,
              bandwidth: variant.audioBandwidth,
              codecs: variant.audioCodec,
            });
          }
        });
        
        return audioTracks;
      },
      
      getVideoTracks(): VideoTrack[] {
        if (!playerRef.current) return [];
        
        const variants = playerRef.current.getVariantTracks();
        return variants
          .filter((variant: any) => variant.videoCodec)
          .map((variant: any) => ({
            id: variant.videoId?.toString() || '',
            language: variant.language,
            label: variant.label || `${variant.height}p`,
            kind: 'main',
            bandwidth: variant.bandwidth,
            width: variant.width || 0,
            height: variant.height || 0,
            frameRate: variant.frameRate || 0,
            codecs: variant.videoCodec || '',
            active: variant.active,
          }));
      },
      
      getTextTracks(): TextTrack[] {
        if (!playerRef.current) return [];
        
        const textTracks = playerRef.current.getTextTracks();
        return textTracks.map((track: any) => ({
          id: track.id,
          language: track.language,
          label: track.label || track.language,
          kind: track.kind as any,
          active: track.active,
          mode: track.active ? 'showing' : 'disabled',
        }));
      },
      
      selectAudioTrack(trackId: string) {
        if (playerRef.current) {
          const variants = playerRef.current.getVariantTracks();
          const track = variants.find((v: any) => v.audioId?.toString() === trackId);
          if (track) {
            playerRef.current.selectAudioLanguage(track.language, track.roles?.[0]);
            // Refresh tracks after selection to update active state
            // Use setTimeout to ensure Shaka Player has updated its internal state
            setTimeout(() => {
              const updatedTracks = this.getAudioTracks();
              mediaContext?.setAudioTracks?.(updatedTracks);
            }, 0);
          }
        }
      },
      
      selectVideoTrack(trackId: string) {
        if (playerRef.current) {
          const variants = playerRef.current.getVariantTracks();
          const track = variants.find((v: any) => v.videoId?.toString() === trackId);
          if (track) {
            playerRef.current.selectVariantTrack(track, true);
            // Refresh tracks after selection to update active state
            // Use setTimeout to ensure Shaka Player has updated its internal state
            setTimeout(() => {
              const updatedTracks = this.getVideoTracks();
              mediaContext?.setVideoTracks?.(updatedTracks);
            }, 0);
          }
        }
      },
      
      selectTextTrack(trackId: string) {
        if (playerRef.current) {
          const textTracks = playerRef.current.getTextTracks();
          const track = textTracks.find((t: any) => t.id === trackId);
          if (track) {
            playerRef.current.selectTextTrack(track);
            // Refresh tracks after selection to update active state
            // Use setTimeout to ensure Shaka Player has updated its internal state
            setTimeout(() => {
              const updatedTracks = this.getTextTracks();
              mediaContext?.setTextTracks?.(updatedTracks);
            }, 0);
          }
        }
      },
      
      destroy() {
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
      },
    };

    // Expose player instance via ref
    useImperativeHandle(ref, () => playerInstance, []);

    // Initialize Shaka Player
    useEffect(() => {
      if (!videoRef.current) return;

      const video = videoRef.current;
      const player = new shaka.Player(video);
      playerRef.current = player;

      // Set up error handling
      player.addEventListener('error', (event: any) => {
        const error = new Error(event.detail?.message || 'Shaka Player error');
        onError?.(error);
        mediaContext?.actions.setError(error);
      });

      // Set up track change events
      player.addEventListener('trackschanged', () => {
        onTracksChange?.();
        
        // Update context with new tracks
        if (mediaContext) {
          mediaContext.setAudioTracks(playerInstance.getAudioTracks());
          mediaContext.setVideoTracks(playerInstance.getVideoTracks());
          mediaContext.setTextTracks(playerInstance.getTextTracks());
        }
      });

      // Call onReady
      onReady?.();
      mediaContext?.setPlayer(playerInstance);

      return () => {
        player.destroy();
      };
    }, []);

    // Load source
    useEffect(() => {
      if (!playerRef.current || !src) return;

      const loadSource = async () => {
        try {
          // Ensure player is ready before loading
          if (!playerRef.current) {
            throw new Error('Player not initialized');
          }

          mediaContext?.actions.setLoading(true);
          
          if (typeof src === 'string') {
            await playerRef.current.load(src);
          } else if (Array.isArray(src) && src.length > 0) {
            const source = src[0];
            if (source.drm) {
              playerRef.current.configure({
                drm: {
                  servers: source.drm.servers,
                  advanced: source.drm.advanced,
                  clearKeys: source.drm.clearKeys,
                }
              });
            }
            await playerRef.current.load(source.src);
          }
          
          onLoadedData?.();
          mediaContext?.actions.setLoading(false);
          mediaContext?.actions.setError(null);
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Failed to load source');
          onError?.(err);
          mediaContext?.actions.setError(err);
          mediaContext?.actions.setLoading(false);
        }
      };

      // Add a small delay to ensure player is ready
      const timeoutId = setTimeout(loadSource, 100);
      return () => clearTimeout(timeoutId);
    }, [src, onLoadedData, onError]);

    // Set up video event listeners
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handlePlay = () => {
        onPlay?.();
        mediaContext?.actions.setPaused(false);
      };

      const handlePause = () => {
        onPause?.();
        mediaContext?.actions.setPaused(true);
      };

      const handleEnded = () => {
        onEnded?.();
        mediaContext?.actions.setEnded(true);
      };

      const handleTimeUpdate = () => {
        const currentTime = video.currentTime;
        const now = Date.now();
        
        // Throttle time updates to prevent excessive re-renders
        if (now - lastTimeUpdateRef.current >= TIME_UPDATE_THROTTLE) {
          onTimeUpdate?.(currentTime);
          mediaContext?.actions.setCurrentTime(currentTime);
          lastTimeUpdateRef.current = now;
        }
      };

      const handleDurationChange = () => {
        const duration = video.duration;
        onDurationChange?.(duration);
        mediaContext?.actions.setDuration(duration);
      };

      const handleVolumeChange = () => {
        const volume = video.volume;
        const muted = video.muted;
        onVolumeChange?.(volume);
        mediaContext?.actions.setVolume(volume);
        mediaContext?.actions.setMuted(muted);
      };

      const handleProgress = () => {
        onProgress?.(video.buffered);
        mediaContext?.actions.setBuffered(video.buffered);
      };

      const handleSeeking = () => {
        onSeeking?.();
        mediaContext?.actions.setSeeking(true);
      };

      const handleSeeked = () => {
        onSeeked?.();
        mediaContext?.actions.setSeeking(false);
      };

      const handleWaiting = () => {
        onWaiting?.();
        mediaContext?.actions.setWaiting(true);
      };

      const handleCanPlay = () => {
        onCanPlay?.();
        mediaContext?.actions.setWaiting(false);
      };

      const handleRateChange = () => {
        const rate = video.playbackRate;
        onPlaybackRateChange?.(rate);
        mediaContext?.actions.setPlaybackRate(rate);
      };

      const handleFullscreenChange = () => {
        const isFullscreen = !!document.fullscreenElement;
        onFullscreenChange?.(isFullscreen);
        mediaContext?.actions.setFullscreen(isFullscreen);
      };

      const handlePipChange = () => {
        const isPip = !!(document as any).pictureInPictureElement;
        onPictureInPictureChange?.(isPip);
        mediaContext?.actions.setPictureInPicture(isPip);
      };

      // Add event listeners
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('ended', handleEnded);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('durationchange', handleDurationChange);
      video.addEventListener('volumechange', handleVolumeChange);
      video.addEventListener('progress', handleProgress);
      video.addEventListener('seeking', handleSeeking);
      video.addEventListener('seeked', handleSeeked);
      video.addEventListener('waiting', handleWaiting);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('canplaythrough', onCanPlayThrough || (() => {}));
      video.addEventListener('loadstart', onLoadStart || (() => {}));
      video.addEventListener('loadeddata', onLoadedData || (() => {}));
      video.addEventListener('loadedmetadata', onLoadedMetadata || (() => {}));
      video.addEventListener('ratechange', handleRateChange);
      
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('msfullscreenchange', handleFullscreenChange);
      
      document.addEventListener('enterpictureinpicture', handlePipChange);
      document.addEventListener('leavepictureinpicture', handlePipChange);

      return () => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('durationchange', handleDurationChange);
        video.removeEventListener('volumechange', handleVolumeChange);
        video.removeEventListener('progress', handleProgress);
        video.removeEventListener('seeking', handleSeeking);
        video.removeEventListener('seeked', handleSeeked);
        video.removeEventListener('waiting', handleWaiting);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('canplaythrough', onCanPlayThrough || (() => {}));
        video.removeEventListener('loadstart', onLoadStart || (() => {}));
        video.removeEventListener('loadeddata', onLoadedData || (() => {}));
        video.removeEventListener('loadedmetadata', onLoadedMetadata || (() => {}));
        video.removeEventListener('ratechange', handleRateChange);
        
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        
        document.removeEventListener('enterpictureinpicture', handlePipChange);
        document.removeEventListener('leavepictureinpicture', handlePipChange);
      };
    }, []);

    // Set initial properties
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      video.autoplay = autoPlay;
      video.loop = loop;
      video.muted = muted;
      video.controls = controls;
      video.volume = volume;
      video.playbackRate = playbackRate;
      video.crossOrigin = crossOrigin || null;
      video.preload = preload;
      
      if (poster) {
        video.poster = poster;
      }
    }, [autoPlay, loop, muted, controls, volume, playbackRate, crossOrigin, preload, poster]);

    return (
      <video
        ref={videoRef}
        className={cn('player-w-full player-h-full', className)}
        style={style}
        playsInline
      />
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';
