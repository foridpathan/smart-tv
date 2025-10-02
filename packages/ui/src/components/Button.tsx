
import * as React from "react";
import { KeyPressDetails } from "../core";
import { useFocusable } from "../hooks";
import type {
  ArrowPressHandler,
  BlurHandler,
  EnterPressHandler,
  EnterReleaseHandler,
  FocusHandler,
} from "../hooks/useFocusable";
import { cn } from "../utils";

type RenderProps = {
  focused: boolean;
  focusSelf: () => void;
  ref: React.RefObject<HTMLElement> | null;
  focusKey: string;
  payload?: any;
};

type ButtonProps = {
  children?: React.ReactNode | ((props: RenderProps) => React.ReactNode);
  onBlur?: BlurHandler;
  onEnterPress?: EnterPressHandler | undefined;
  onFocus?: FocusHandler;
  onEnterRelease?: EnterReleaseHandler | undefined;
  onArrowPress?: ArrowPressHandler | undefined;
  focusKey: string;
  className?: string;
  active?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  forceFocus?: boolean;
  hover?: boolean;
  payload?: any;
};

export function Button(props: ButtonProps) {
  const {
    children,
    onEnterPress,
    onFocus,
    onBlur,
    onEnterRelease,
    onArrowPress,
    focusKey,
    className,
    style,
    disabled,
    forceFocus,
    active,
    hover = false,
    payload,
  } = props;
  const { ref, focused, focusSelf } = useFocusable({
    onBlur,
    onEnterPress: !disabled ? onEnterPress : undefined,
    onFocus,
    onEnterRelease: !disabled ? onEnterRelease : undefined,
    onArrowPress,
    focusKey: focusKey,
    extraProps: {
      ...payload,
      focusKey,
    },
  });
  React.useEffect(() => {
    if (forceFocus) {
      focusSelf();
    }
  }, [focusSelf, forceFocus]);

  const handleClick = () => {
    if (!disabled && typeof onEnterPress === "function") {
      const details: KeyPressDetails = { pressedKeys: { keyCode: 13 } };
      onEnterPress(
        {
          ...payload,
          focusKey,
        },
        details
      );
    }
  };

  return (
    <button
      style={style}
      className={cn("ui-bg-transparent", className, focused && active, {
        focused,
        disabled,
      })}
      onClick={handleClick}
      ref={ref}
      onMouseUp={hover ? () => { if (!disabled) onEnterRelease?.({ ...payload, focusKey }); } : undefined}
      onMouseEnter={hover ? () => { if (!disabled) focusSelf(); } : undefined}
      disabled={disabled}>
      {typeof children === "function"
        ? children({ focused, focusSelf, ref, focusKey, payload })
        : children}
    </button>
  );
}
