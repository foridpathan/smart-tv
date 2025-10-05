import React, { forwardRef, useEffect, useRef, useState } from 'react';

// Extend Document and Element interfaces for fullscreen API
interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element;
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

interface FullscreenElement extends Element {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

export interface FullscreenButtonProps {
  targetElement?: HTMLElement | null;
  disabled?: boolean;
  className?: string;
  fullscreenIcon?: React.ReactNode;
  exitFullscreenIcon?: React.ReactNode;
  onEnterFullscreen?: () => void;
  onExitFullscreen?: () => void;
  onToggle?: (isFullscreen: boolean) => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'circular' | 'square';
}

export interface FullscreenButtonRef {
  focus: () => void;
  click: () => void;
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  isFullscreen: () => boolean;
}

// Modular Fullscreen Toggle Button component
export const Fullscreen = forwardRef<FullscreenButtonRef, FullscreenButtonProps>(function Fullscreen({
  targetElement,
  disabled = false,
  className = '',
  fullscreenIcon,
  exitFullscreenIcon,
  onEnterFullscreen,
  onExitFullscreen,
  onToggle,
  size = 'medium',
  variant = 'default'
}, ref) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if element is in fullscreen
  const checkFullscreenStatus = (): boolean => {
    const doc = document as FullscreenDocument;
    return !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );
  };

  // Enter fullscreen
  const enterFullscreen = async (): Promise<void> => {
    const element = (targetElement || document.documentElement) as FullscreenElement;
    
    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
    } catch (error) {
      console.error('Error entering fullscreen:', error);
    }
  };

  // Exit fullscreen
  const exitFullscreen = async (): Promise<void> => {
    const doc = document as FullscreenDocument;
    
    try {
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen();
      }
    } catch (error) {
      console.error('Error exiting fullscreen:', error);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = async (): Promise<void> => {
    if (checkFullscreenStatus()) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenStatus = checkFullscreenStatus();
      setIsFullscreen(fullscreenStatus);
      
      if (fullscreenStatus) {
        onEnterFullscreen?.();
      } else {
        onExitFullscreen?.();
      }
      
      onToggle?.(fullscreenStatus);
    };

    // Add event listeners for different browsers
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Initial check
    setIsFullscreen(checkFullscreenStatus());

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [onEnterFullscreen, onExitFullscreen, onToggle]);

  React.useImperativeHandle(ref, () => ({
    focus: () => buttonRef.current?.focus(),
    click: () => buttonRef.current?.click(),
    enterFullscreen,
    exitFullscreen,
    isFullscreen: () => isFullscreen
  }));

  const handleClick = () => {
    if (disabled) return;
    toggleFullscreen();
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

  const defaultFullscreenIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2">
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
    </svg>
  );

  const defaultExitFullscreenIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-1/2 h-1/2">
      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
    </svg>
  );

  // Check if fullscreen is supported
  const isFullscreenSupported = !!(
    document.documentElement.requestFullscreen ||
    (document.documentElement as FullscreenElement).webkitRequestFullscreen ||
    (document.documentElement as FullscreenElement).mozRequestFullScreen ||
    (document.documentElement as FullscreenElement).msRequestFullscreen
  );

  if (!isFullscreenSupported) {
    return null; // Don't render if fullscreen is not supported
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      tabIndex={0}
      className={`
        tv-fullscreen-button
        flex items-center justify-center
        bg-gray-600 hover:bg-gray-700 
        disabled:bg-gray-400 disabled:cursor-not-allowed
        text-white
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      role="button"
    >
      {isFullscreen 
        ? (exitFullscreenIcon || defaultExitFullscreenIcon) 
        : (fullscreenIcon || defaultFullscreenIcon)
      }
    </button>
  );
});
