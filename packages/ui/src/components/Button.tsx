
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
  data?: any;
};

type ButtonProps = {
  children?: React.ReactNode | ((props: RenderProps) => React.ReactNode);
  onBlur?: BlurHandler<any>;
  onEnterPress?: EnterPressHandler<any> | undefined;
  onFocus?: FocusHandler<any>;
  onEnterRelease?: EnterReleaseHandler<any> | undefined;
  onArrowPress?: ArrowPressHandler<any> | undefined;
  focusKey: string;
  className?: string;
  active?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  isSelfFocus?: boolean;
  hover?: boolean;
  data?: any;
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
    isSelfFocus,
    active,
    hover,
    data,
  } = props;
  const { ref, focused, focusSelf } = useFocusable({
    onBlur,
    onEnterPress: !disabled ? onEnterPress : undefined,
    onFocus,
    onEnterRelease: !disabled ? onEnterRelease : undefined,
    onArrowPress,
    focusKey: focusKey,
    extraProps: {
      ...data,
      focusKey,
    },
  });
  React.useEffect(() => {
    if (isSelfFocus) {
      focusSelf();
    }
  }, [focusSelf, isSelfFocus]);

  const handleClick = () => {
    if (!disabled && typeof onEnterPress === "function") {
      const details: KeyPressDetails = { pressedKeys: { keyCode: 13 } };
      onEnterPress(
        {
          ...data,
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
      onMouseUp={!hover ? () => { if (!disabled) onEnterRelease?.({ ...data, focusKey }); } : undefined}
      onMouseEnter={!hover ? () => { if (!disabled) focusSelf(); } : undefined}
      disabled={disabled}>
      {typeof children === "function"
        ? children({ focused, focusSelf, ref, focusKey, data })
        : children}
    </button>
  );
}
