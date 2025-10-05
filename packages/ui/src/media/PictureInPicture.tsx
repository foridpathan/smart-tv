import React, { forwardRef, useEffect, useRef, useState } from 'react';

// Type for video element with PiP support
type PictureInPictureVideoElement = HTMLVideoElement & {
  requestPictureInPicture?: () => Promise<PictureInPictureWindow>;
};

// Type for document with PiP support
type PictureInPictureDocument = Document & {
  pictureInPictureEnabled?: boolean;
  pictureInPictureElement?: Element;
  exitPictureInPicture?: () => Promise<void>;
};

export interface PictureInPictureProps {
  videoElement?: HTMLVideoElement | null;
  disabled?: boolean;
  className?: string;
  pipIcon?: React.ReactNode;
  exitPipIcon?: React.ReactNode;
  onEnterPiP?: () => void;
  onExitPiP?: () => void;
  onToggle?: (isPiP: boolean) => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'circular' | 'square';
}

export interface PictureInPictureRef {
  focus: () => void;
  click: () => void;
  enterPiP: () => Promise<void>;
  exitPiP: () => Promise<void>;
  isPictureInPicture: () => boolean;
}

// Modular Picture-in-Picture component
export const PictureInPicture = forwardRef<PictureInPictureRef, PictureInPictureProps>(function PictureInPicture({
  videoElement,
  disabled = false,
  className = '',
  pipIcon,
  exitPipIcon,
  onEnterPiP,
  onExitPiP,
  onToggle,
  size = 'medium',
  variant = 'default'
}, ref) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isPiP, setIsPiP] = useState(false);

  // Check if video is in Picture-in-Picture mode
  const checkPiPStatus = (): boolean => {
    const doc = document as PictureInPictureDocument;
    return !!(doc.pictureInPictureElement);
  };

  // Enter Picture-in-Picture
  const enterPiP = async (): Promise<void> => {
    if (!videoElement) {
      console.warn('No video element provided for Picture-in-Picture');
      return;
    }

    const pipVideo = videoElement as PictureInPictureVideoElement;
    
    try {
      if (pipVideo.requestPictureInPicture) {
        await pipVideo.requestPictureInPicture();
      } else {
        console.warn('Picture-in-Picture not supported');
      }
    } catch (error) {
      console.error('Error entering Picture-in-Picture:', error);
    }
  };

  // Exit Picture-in-Picture
  const exitPiP = async (): Promise<void> => {
    const doc = document as PictureInPictureDocument;
    
    try {
      if (doc.exitPictureInPicture) {
        await doc.exitPictureInPicture();
      }
    } catch (error) {
      console.error('Error exiting Picture-in-Picture:', error);
    }
  };

  // Toggle Picture-in-Picture
  const togglePiP = async (): Promise<void> => {
    if (checkPiPStatus()) {
      await exitPiP();
    } else {
      await enterPiP();
    }
  };

  // Handle Picture-in-Picture change events
  useEffect(() => {
    if (!videoElement) return;

    const handleEnterPiP = () => {
      setIsPiP(true);
      onEnterPiP?.();
      onToggle?.(true);
    };

    const handleLeavePiP = () => {
      setIsPiP(false);
      onExitPiP?.();
      onToggle?.(false);
    };

    videoElement.addEventListener('enterpictureinpicture', handleEnterPiP);
    videoElement.addEventListener('leavepictureinpicture', handleLeavePiP);

    // Initial check
    setIsPiP(checkPiPStatus());

    return () => {
      videoElement.removeEventListener('enterpictureinpicture', handleEnterPiP);
      videoElement.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, [videoElement, onEnterPiP, onExitPiP, onToggle]);

  React.useImperativeHandle(ref, () => ({
    focus: () => buttonRef.current?.focus(),
    click: () => buttonRef.current?.click(),
    enterPiP,
    exitPiP,
    isPictureInPicture: () => isPiP
  }));

  const handleClick = () => {
    if (disabled) return;
    togglePiP();
  };

  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-12 h-12 text-base',
    large: 'w-16 h-16 text-lg'
  };

  const variantClasses = {
    default: 'rounded',
    circular: 'rounded-full',
    square: 'rounded-none'
  };

  const defaultPipIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2">
      <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
    </svg>
  );

  const defaultExitPipIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2">
      <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM14 10l-2-2v4l2-2z"/>
    </svg>
  );

  // Check if Picture-in-Picture is supported
  const doc = document as PictureInPictureDocument;
  const isPiPSupported = !!(doc.pictureInPictureEnabled && videoElement);

  if (!isPiPSupported) {
    return null; // Don't render if PiP is not supported
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled || !videoElement}
      tabIndex={0}
      className={`
        tv-pip-button
        flex items-center justify-center
        bg-purple-600 hover:bg-purple-700 
        disabled:bg-gray-400 disabled:cursor-not-allowed
        text-white
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      aria-label={isPiP ? 'Exit Picture-in-Picture' : 'Enter Picture-in-Picture'}
      title={isPiP ? 'Exit Picture-in-Picture' : 'Enter Picture-in-Picture'}
      role="button"
    >
      {isPiP 
        ? (exitPipIcon || defaultExitPipIcon) 
        : (pipIcon || defaultPipIcon)
      }
    </button>
  );
});
