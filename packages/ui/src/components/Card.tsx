import * as React from "react";
import { FocusContext, useFocusable, UseFocusableConfig } from "../hooks";
import { cn } from "../utils";

type RenderProps = {
  focused: boolean;
  focusSelf: () => void;
  ref: React.RefObject<HTMLElement> | null;
  focusKey: string;
  payload?: unknown;
};

type CardProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  onSelect?: () => void;
  focusKey?: string;
  focusable?: boolean;
  children?: React.ReactNode | ((props: RenderProps) => React.ReactNode);
  payload?: unknown;
  active?: string;
} & Partial<UseFocusableConfig>;

const Card = React.forwardRef<
  HTMLDivElement,
  CardProps
>(({ className, focusable = true, active, children, ...rest }, ref) => {
  // separate focus-related props from html props
  const {
    saveLastFocusedChild,
    trackChildren,
    autoRestoreFocus,
    forceFocus,
    isFocusBoundary,
    focusBoundaryDirections,
    focusKey: propFocusKey,
    preferredChildFocusKey,
    onEnterPress,
    onEnterRelease,
    onArrowPress,
    onArrowRelease,
    onFocus,
    onBlur,
    extraProps,
    ...htmlProps
  } = rest as Partial<UseFocusableConfig> & React.HTMLAttributes<HTMLDivElement>;

  const focusConfig: UseFocusableConfig = {
    focusable,
    saveLastFocusedChild,
    trackChildren,
    autoRestoreFocus,
    forceFocus,
    isFocusBoundary,
    focusBoundaryDirections,
    focusKey: propFocusKey,
    preferredChildFocusKey,
    onEnterPress,
    onEnterRelease,
    onArrowPress,
    onArrowRelease,
    onFocus,
    onBlur,
    extraProps,
  };

  const { ref: innerRef, focusKey, focused, focusSelf } = useFocusable(
    focusConfig
  );

  React.useImperativeHandle(ref, () => innerRef.current, [innerRef]);

  // Provide the Card's focusKey to nested focusables via FocusContext
  return (
    <FocusContext.Provider value={focusKey}>
      <div
        ref={innerRef}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm",
          className,
          focused && active,
        )}
        {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}
      >
        {typeof children === "function"
          ? children({ focused, focusSelf, ref: innerRef, focusKey })
          : children}
      </div>
    </FocusContext.Provider>
  );
});
Card.displayName = "Card"

type SubcomponentProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> &
  Partial<UseFocusableConfig> & {
    focusable?: boolean;
    focusKey?: string;
    active?: string;
    children?: React.ReactNode | ((props: RenderProps) => React.ReactNode);
  };

const CardHeader = React.forwardRef<HTMLDivElement, SubcomponentProps>(
  ({ className, focusable = false, children, active, ...props }, ref) => {
    const {
      saveLastFocusedChild,
      trackChildren,
      autoRestoreFocus,
      forceFocus,
      isFocusBoundary,
      focusBoundaryDirections,
      focusKey: propFocusKey,
      preferredChildFocusKey,
      onEnterPress,
      onEnterRelease,
      onArrowPress,
      onArrowRelease,
      onFocus,
      onBlur,
      extraProps,
      ...htmlProps
    } = props as Partial<UseFocusableConfig> & React.HTMLAttributes<HTMLDivElement>;

    const focusConfig: UseFocusableConfig = {
      focusable,
      saveLastFocusedChild,
      trackChildren,
      autoRestoreFocus,
      forceFocus,
      isFocusBoundary,
      focusBoundaryDirections,
      focusKey: propFocusKey,
      preferredChildFocusKey,
      onEnterPress,
      onEnterRelease,
      onArrowPress,
      onArrowRelease,
      onFocus,
      onBlur,
      extraProps,
    };

    const { ref: innerRef, focused, focusSelf, focusKey } = useFocusable(
      focusConfig
    );

    React.useImperativeHandle(ref, () => innerRef.current, [innerRef]);

    return (
      <div
        ref={innerRef}
        className={cn("flex flex-col space-y-1.5 p-6", className, focused && active)}
        {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}
      >
        {typeof children === "function"
          ? children({ focused, focusSelf, ref: innerRef, focusKey })
          : children}
      </div>
    );
  }
);
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> &
  Partial<UseFocusableConfig> & {
    focusable?: boolean;
    focusKey?: string;
    active?: string;
    children?: React.ReactNode | ((props: RenderProps) => React.ReactNode);
  }
>(({ className, focusable = false, children, active, ...props }, ref) => {
  const {
    saveLastFocusedChild,
    trackChildren,
    autoRestoreFocus,
    forceFocus,
    isFocusBoundary,
    focusBoundaryDirections,
    focusKey: propFocusKey,
    preferredChildFocusKey,
    onEnterPress,
    onEnterRelease,
    onArrowPress,
    onArrowRelease,
    onFocus,
    onBlur,
    extraProps,
    ...htmlProps
  } = props as Partial<UseFocusableConfig> & React.HTMLAttributes<HTMLHeadingElement>;

  const focusConfig: UseFocusableConfig = {
    focusable,
    saveLastFocusedChild,
    trackChildren,
    autoRestoreFocus,
    forceFocus,
    isFocusBoundary,
    focusBoundaryDirections,
    focusKey: propFocusKey,
    preferredChildFocusKey,
    onEnterPress,
    onEnterRelease,
    onArrowPress,
    onArrowRelease,
    onFocus,
    onBlur,
    extraProps,
  };

  const { ref: innerRef, focused, focusSelf, focusKey } = useFocusable(
    focusConfig
  );

  React.useImperativeHandle(ref, () => innerRef.current, [innerRef]);

  return (
    <h3
      ref={innerRef}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className,
        focused && active
      )}
      {...(htmlProps as React.HTMLAttributes<HTMLHeadingElement>)}
    >
      {typeof children === "function"
        ? children({ focused, focusSelf, ref: innerRef, focusKey })
        : children}
    </h3>
  );
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, SubcomponentProps>(
  ({ className, focusable = false, children, active, ...props }, ref) => {
    const {
      saveLastFocusedChild,
      trackChildren,
      autoRestoreFocus,
      forceFocus,
      isFocusBoundary,
      focusBoundaryDirections,
      focusKey: propFocusKey,
      preferredChildFocusKey,
      onEnterPress,
      onEnterRelease,
      onArrowPress,
      onArrowRelease,
      onFocus,
      onBlur,
      extraProps,
      ...htmlProps
    } = props as Partial<UseFocusableConfig> & React.HTMLAttributes<HTMLHeadingElement>;

    const focusConfig: UseFocusableConfig = {
      focusable,
      saveLastFocusedChild,
      trackChildren,
      autoRestoreFocus,
      forceFocus,
      isFocusBoundary,
      focusBoundaryDirections,
      focusKey: propFocusKey,
      preferredChildFocusKey,
      onEnterPress,
      onEnterRelease,
      onArrowPress,
      onArrowRelease,
      onFocus,
      onBlur,
      extraProps,
    };

    const { ref: innerRef, focused, focusSelf, focusKey } = useFocusable(
      focusConfig
    );

    React.useImperativeHandle(ref, () => innerRef.current, [innerRef]);

    return (
      <div
        ref={innerRef}
        className={cn("p-6 pt-0", className, focused && active)}
        {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}
      >
        {typeof children === "function"
          ? children({ focused, focusSelf, ref: innerRef, focusKey })
          : children}
      </div>
    );
  }
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, SubcomponentProps>(
  ({ className, focusable = false, children, active, ...props }, ref) => {
    const {
      saveLastFocusedChild,
      trackChildren,
      autoRestoreFocus,
      forceFocus,
      isFocusBoundary,
      focusBoundaryDirections,
      focusKey: propFocusKey,
      preferredChildFocusKey,
      onEnterPress,
      onEnterRelease,
      onArrowPress,
      onArrowRelease,
      onFocus,
      onBlur,
      extraProps,
      ...htmlProps
    } = props as Partial<UseFocusableConfig> & React.HTMLAttributes<HTMLDivElement>;

    const focusConfig: UseFocusableConfig = {
      focusable,
      saveLastFocusedChild,
      trackChildren,
      autoRestoreFocus,
      forceFocus,
      isFocusBoundary,
      focusBoundaryDirections,
      focusKey: propFocusKey,
      preferredChildFocusKey,
      onEnterPress,
      onEnterRelease,
      onArrowPress,
      onArrowRelease,
      onFocus,
      onBlur,
      extraProps,
    };

    const { ref: innerRef, focused, focusSelf, focusKey } = useFocusable(
      focusConfig
    );

    React.useImperativeHandle(ref, () => innerRef.current, [innerRef]);

    return (
      <div
        ref={innerRef}
        className={cn("flex items-center p-6 pt-0", className, focused && active)}
        {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}
      >
        {typeof children === "function"
          ? children({ focused, focusSelf, ref: innerRef, focusKey })
          : children}
      </div>
    );
  }
)
CardFooter.displayName = "CardFooter"

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };

