import { RefObject } from 'react';

// Types for spatial navigation
export interface FocusableComponentLayout {
  left: number;
  top: number;
  readonly right: number;
  readonly bottom: number;
  width: number;
  height: number;
  x: number;
  y: number;
  node: HTMLElement;
}

export interface KeyPressDetails {
  pressedKeys: PressedKeys;
}

export type PressedKeys = { [index: string]: number };

export interface FocusDetails {
  event?: KeyboardEvent;
}

export interface UseFocusableConfig {
  focusable?: boolean;
  saveLastFocusedChild?: boolean;
  trackChildren?: boolean;
  autoRestoreFocus?: boolean;
  forceFocus?: boolean;
  isFocusBoundary?: boolean;
  focusBoundaryDirections?: Array<'left' | 'right' | 'up' | 'down'>;
  focusKey?: string;
  preferredChildFocusKey?: string;
  onEnterPress?: (extraProps?: any, details?: KeyPressDetails) => void;
  onEnterRelease?: (extraProps?: any) => void;
  onArrowPress?: (direction: string, extraProps?: any, details?: KeyPressDetails) => boolean;
  onArrowRelease?: (direction: string, extraProps?: any) => void;
  onFocus?: (layout: FocusableComponentLayout, extraProps?: any, details?: FocusDetails) => void;
  onBlur?: (layout: FocusableComponentLayout, extraProps?: any, details?: FocusDetails) => void;
  extraProps?: any;
}

export interface UseFocusableResult {
  ref: RefObject<HTMLElement>;
  focusSelf: () => void;
  focused: boolean;
  hasFocusedChild: boolean;
  focusKey: string;
}

export type DistanceCalculationMethod = 'edges' | 'center' | 'corners';

export interface Corners {
  a: { x: number; y: number };
  b: { x: number; y: number };
}

export type DistanceCalculationFunction = (
  refCorners: Corners,
  siblingCorners: Corners,
  isVerticalDirection: boolean,
  distanceCalculationMethod: DistanceCalculationMethod
) => number;

export interface KeyMap {
  [key: string]: number | number[] | string | string[];
}

export interface InitConfig {
  debug?: boolean;
  visualDebug?: boolean;
  nativeMode?: boolean;
  throttle?: number;
  throttleKeypresses?: boolean;
  useGetBoundingClientRect?: boolean;
  shouldFocusDOMNode?: boolean;
  domNodeFocusOptions?: FocusOptions;
  shouldUseNativeEvents?: boolean;
  rtl?: boolean;
  distanceCalculationMethod?: DistanceCalculationMethod;
  customDistanceCalculationFunction?: DistanceCalculationFunction;
}

export interface ThrottleConfig {
  throttle: number;
  throttleKeypresses: boolean;
}
