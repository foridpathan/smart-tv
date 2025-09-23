
import * as React from "react";
import { KeyPressDetails, useRouter } from "../core";
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

type MenuProps = {
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
  focus?: boolean;
  hover?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  payload?: any;
};

export function Menu(props: MenuProps) {
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
    focus,
    active,
    hover,
    href,
    target,
    rel,
    payload,
  } = props;
  const router = (() => {
    try {
      return useRouter();
    } catch (e) {
      return null;
    }
  })();

  const { ref, focused, focusSelf } = useFocusable({
    onBlur,
    // provide a wrapper so that when no custom onEnterPress is provided
    // Enter will navigate to `href` when present (TV/remote enter)
    onEnterPress: !disabled
      ? (details) => {
        if (typeof onEnterPress === "function") {
          onEnterPress({ ...payload, focusKey }, details);
        }
        if (href && !disabled) {
          // prefer internal router when available
          if (router && typeof router.push === "function") {
            // respect target: replace behavior when target === '_self' or undefined
            if (target && target !== "_self") {
              window.open(href, target, rel || "noopener noreferrer");
            } else {
              router.push(href);
            }
          } else {
            if (target) {
              window.open(href, target, rel || "noopener noreferrer");
            } else {
              window.location.href = href;
            }
          }
        }
      }
      : undefined,
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
    if (focus) {
      focusSelf();
    }
  }, [focusSelf, focus]);

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
    // If href provided and no custom handler prevented navigation, navigate on click
    if (!disabled && href) {
      if (router && typeof router.push === "function") {
        if (target && target !== "_self") {
          window.open(href, target, rel || "noopener noreferrer");
        } else {
          router.push(href);
        }
      } else {
        if (target) {
          window.open(href, target, rel || "noopener noreferrer");
        } else {
          window.location.href = href;
        }
      }
    }
  };
  const Element: any = href ? "a" : "button";

  return (
    <Element
      style={style}
      className={cn("ui-bg-transparent", className, focused && active, {
        focused,
        disabled,
      })}
      onClick={(e: any) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        handleClick();
      }}
      ref={ref}
      onMouseUp={!hover ? () => { if (!disabled) onEnterRelease?.({ ...payload, focusKey }); } : undefined}
      onMouseEnter={!hover ? () => { if (!disabled) focusSelf(); } : undefined}
      href={href}
      target={href ? target : undefined}
      rel={href ? rel : undefined}
      disabled={href ? undefined : disabled}
    >
      {typeof children === "function"
        ? children({ focused, focusSelf, ref, focusKey, payload })
        : children}
    </Element>
  );
}
Menu.displayName = "Menu";