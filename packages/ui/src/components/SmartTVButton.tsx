import React, { forwardRef, useEffect } from 'react';
import { useFocusable } from '../hooks/useFocusable';
import { cn } from '../utils';

export interface KeyPressDetails {
  pressedKeys: {
    keyCode: number;
  };
}

export interface FocusDetails {
  focusKey?: string;
}

export interface FocusableComponentLayout {
  node: HTMLElement | null;
  x: number;
  y: number;
  width: number;
  height: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface SmartTVButtonProps {
  children?: React.ReactNode | ((props: {
    ref?: React.RefObject<HTMLElement>;
    onFocus?: () => void;
    onPress?: () => void;
    active?: boolean;
    focused?: boolean;
  }) => React.ReactNode);
  handlePress?: (props: object, details: KeyPressDetails) => void | undefined;
  onFocus?: (layout: FocusableComponentLayout, props: object, details: FocusDetails) => void;
  handleRelease?: () => void | undefined;
  handleArrowPress?: (dir: string) => boolean;
  focusKey?: string;
  className?: string;
  activeClass?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  id?: string;
  isSelfFocus?: boolean;
  autoFocus?: boolean;
}

export interface SmartTVButtonRef {
  focus: () => void;
  click: () => void;
}

// Smart TV compatible button component following the patterns from Toffee TV
export const SmartTVButton = forwardRef<SmartTVButtonRef, SmartTVButtonProps>(function SmartTVButton({
  children,
  handlePress,
  handleRelease,
  handleArrowPress = () => true,
  focusKey,
  className = '',
  style,
  disabled = false,
  onFocus,
  activeClass = '',
  id,
  isSelfFocus = false,
  autoFocus = false
}, ref) {
  const { ref: focusRef, focused, focusSelf } = useFocusable({
    focusKey,
    onFocus,
    onEnterPress: !disabled ? handlePress : undefined,
    onEnterRelease: !disabled ? handleRelease : undefined,
    onArrowPress: handleArrowPress,
    extraProps: { focusKey }
  });

  useEffect(() => {
    if ((isSelfFocus || autoFocus) && focusSelf) {
      focusSelf();
    }
  }, [focusSelf, isSelfFocus, autoFocus]);

  React.useImperativeHandle(ref, () => ({
    focus: () => focusRef.current?.focus(),
    click: () => handleClick()
  }));

  const handleClick = () => {
    if (disabled) return;
    
    const details = { pressedKeys: { keyCode: 13 } };
    handlePress?.({ focusKey }, details);
  };

  const handleMouseEnter = () => {
    if (!disabled && focusSelf) {
      focusSelf();
    }
  };

  const handleMouseUp = () => {
    if (!disabled && handleRelease) {
      handleRelease();
    }
  };

  return (
    <button
      ref={focusRef}
      style={style}
      className={cn(
        'ui-bg-transparent ui-transition-all ui-duration-200 focus:ui-outline-none',
        className,
        focused && activeClass,
        {
          'focused': focused,
          'disabled': disabled,
          'ui-cursor-not-allowed ui-opacity-50': disabled
        }
      )}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      disabled={disabled}
      id={id}
      aria-pressed={focused}
      role="button"
    >
      {typeof children === 'function'
        ? children({
            ref: focusRef,
            onFocus: () => onFocus?.(focusRef.current as FocusableComponentLayout, { focusKey }, { focusKey }),
            active: focused,
            focused,
            onPress: () => handlePress?.({ focusKey }, { pressedKeys: { keyCode: 13 } }),
          })
        : children}
    </button>
  );
});

export default SmartTVButton;
