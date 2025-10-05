import { useFocusable } from '@smart-tv/ui';
import React, { memo, useCallback } from 'react';
import { usePictureInPicture, usePlayerInstance } from '../hooks/useOptimizedHooks';
import { cn, shallowEqual } from '../utils';

interface PictureInPictureProps {
  className?: string;
  style?: React.CSSProperties;
  focusKey?: string;
  onToggle?: (isPip: boolean) => void;
}

const PictureInPictureComponent: React.FC<PictureInPictureProps> = ({
  className,
  style,
  focusKey = 'pip-button',
  onToggle,
}) => {
  const player = usePlayerInstance();
  const pictureInPicture = usePictureInPicture();

  // Check if PiP is supported
  const isPipSupported = typeof document !== 'undefined' && 
    'pictureInPictureEnabled' in document;

  const handleToggle = useCallback(async () => {
    if (!player || !isPipSupported) return;
    
    try {
      if (pictureInPicture) {
        await player.exitPictureInPicture();
      } else {
        await player.enterPictureInPicture();
      }
      onToggle?.(!pictureInPicture);
    } catch (error) {
      console.warn('Picture-in-Picture toggle failed:', error);
    }
  }, [player, pictureInPicture, onToggle, isPipSupported]);

  const { ref, focused } = useFocusable({
    focusKey,
    onEnterPress: handleToggle,
  });

  const PipIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="player-w-5 player-h-5">
      {pictureInPicture ? (
        <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7h9v6h-9v-6z"/>
      ) : (
        <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7h9v6h-9v-6z"/>
      )}
    </svg>
  );

  if (!isPipSupported) {
    return null;
  }

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
      title={pictureInPicture ? 'Exit Picture-in-Picture' : 'Enter Picture-in-Picture'}
    >
      <PipIcon />
    </button>
  );
};

export const PictureInPicture = memo(PictureInPictureComponent, shallowEqual);
