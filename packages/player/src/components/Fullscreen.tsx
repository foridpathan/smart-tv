import { useFocusable } from '@smart-tv/ui';
import React, { memo, useCallback } from 'react';
import { useFullscreen, usePlayerInstance } from '../hooks/useOptimizedHooks';
import { cn, shallowEqual } from '../utils';

interface FullscreenProps {
  className?: string;
  style?: React.CSSProperties;
  focusKey?: string;
  onToggle?: (isFullscreen: boolean) => void;
}

const FullscreenComponent: React.FC<FullscreenProps> = ({
  className,
  style,
  focusKey = 'fullscreen-button',
  onToggle,
}) => {
  const player = usePlayerInstance();
  const fullscreen = useFullscreen();

  const handleToggle = useCallback(async () => {
    if (!player) return;
    
    try {
      if (fullscreen) {
        await player.exitFullscreen();
      } else {
        await player.enterFullscreen();
      }
      onToggle?.(!fullscreen);
    } catch (error) {
      console.warn('Fullscreen toggle failed:', error);
    }
  }, [player, fullscreen, onToggle]);

  const { ref, focused } = useFocusable({
    focusKey,
    onEnterPress: handleToggle,
  });

  const FullscreenIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="player-w-5 player-h-5">
      {fullscreen ? (
        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
      ) : (
        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
      )}
    </svg>
  );

  return (
    <button
      ref={ref}
      className={cn(
        'player-flex player-items-center player-justify-center player-p-2 player-rounded player-text-white',
        'hover:player-bg-white hover:player-bg-opacity-20 player-transition-colors',
        'focus:player-outline-none focus:player-ring-2 focus:player-ring-white focus:player-ring-opacity-50',
        focused && 'player-bg-white player-bg-opacity-20 player-ring-2 player-ring-white player-ring-opacity-50',
        className
      )}
      style={style}
      onClick={handleToggle}
      title={fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
    >
      <FullscreenIcon />
    </button>
  );
};

export const Fullscreen = memo(FullscreenComponent, shallowEqual);
