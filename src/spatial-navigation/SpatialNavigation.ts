import measureLayout, { getBoundingClientRect } from './measureLayout';
import { DistanceCalculationMethod, InitConfig, KeyMap, ThrottleConfig } from './types';

// Constants
export const ROOT_FOCUS_KEY = 'SN:ROOT';
export const DEFAULT_KEY_MAP = {
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  enter: 13
};

let config: InitConfig = {
  debug: false,
  visualDebug: false,
  nativeMode: false,
  throttle: 0,
  throttleKeypresses: false,
  useGetBoundingClientRect: false,
  shouldFocusDOMNode: false,
  domNodeFocusOptions: {},
  shouldUseNativeEvents: false,
  rtl: false,
  distanceCalculationMethod: 'corners' as DistanceCalculationMethod
};

let keyMap = { ...DEFAULT_KEY_MAP };
let throttleConfig: ThrottleConfig = { throttle: 0, throttleKeypresses: false };
let paused = false;
let currentFocusKey = ROOT_FOCUS_KEY;
let focusableComponents: Map<string, any> = new Map();
let keyDownEventThrottleId: number | null = null;
let keyUpEventThrottleId: number | null = null;

// Utility functions
export const generateId = (): string => {
  return 'SN:' + Math.random().toString(36).substr(2, 9);
};

export const isString = (value: any): value is string => typeof value === 'string';
export const isNumber = (value: any): value is number => typeof value === 'number';
export const isFunction = (value: any): value is Function => typeof value === 'function';
export const isObject = (value: any): value is object => typeof value === 'object' && value !== null;

export const log = (...args: any[]): void => {
  if (config.debug) {
    console.log('[@noriginmedia/norigin-spatial-navigation]', ...args);
  }
};

export const warn = (...args: any[]): void => {
  if (config.debug) {
    console.warn('[@noriginmedia/norigin-spatial-navigation]', ...args);
  }
};

// Configuration functions
export const init = (newConfig: InitConfig = {}): void => {
  config = { ...config, ...newConfig };
  
  if (!config.nativeMode) {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
  }
  
  throttleConfig = {
    throttle: config.throttle || 0,
    throttleKeypresses: config.throttleKeypresses || false
  };
  
  log('Spatial Navigation initialized with config:', config);
};

export const setKeyMap = (newKeyMap: KeyMap): void => {
  keyMap = { ...keyMap, ...newKeyMap };
  log('Key map updated:', keyMap);
};

export const setThrottle = (newThrottleConfig: ThrottleConfig): void => {
  throttleConfig = { ...throttleConfig, ...newThrottleConfig };
  log('Throttle config updated:', throttleConfig);
};

export const destroy = (): void => {
  if (!config.nativeMode) {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  }
  
  focusableComponents.clear();
  currentFocusKey = ROOT_FOCUS_KEY;
  paused = false;
  
  log('Spatial Navigation destroyed');
};

export const pause = (): void => {
  paused = true;
  log('Spatial Navigation paused');
};

export const resume = (): void => {
  paused = false;
  log('Spatial Navigation resumed');
};

export const getCurrentFocusKey = (): string => {
  return currentFocusKey;
};

export const setFocus = (focusKey: string = ROOT_FOCUS_KEY): void => {
  log('Setting focus to:', focusKey);
  
  if (focusKey === ROOT_FOCUS_KEY) {
    // Find force-focusable component
    const forceFocusableComponent = findForceFocusableComponent();
    if (forceFocusableComponent) {
      focusComponent(forceFocusableComponent.focusKey);
      return;
    }
  }
  
  const component = focusableComponents.get(focusKey);
  if (component) {
    focusComponent(focusKey);
  } else {
    warn('Component with focusKey not found:', focusKey);
  }
};

export const doesFocusableExist = (focusKey: string): boolean => {
  return focusableComponents.has(focusKey);
};

// Focus management
const focusComponent = (focusKey: string): void => {
  const component = focusableComponents.get(focusKey);
  if (!component) return;
  
  // Blur all other components first
  focusableComponents.forEach((comp, key) => {
    if (key !== focusKey && comp.focused) {
      comp.setFocused(false);
      if (comp.onBlur && comp.ref?.current) {
        const layout = getLayout(comp.ref.current);
        comp.onBlur(layout, comp.extraProps, {});
      }
    }
  });
  
  // Focus the target component
  currentFocusKey = focusKey;
  component.setFocused(true);
  
  // Call onFocus callback
  if (component.onFocus && component.ref?.current) {
    const layout = getLayout(component.ref.current);
    component.onFocus(layout, component.extraProps, {});
  }
  
  log('Focused component:', focusKey);
};

const findForceFocusableComponent = () => {
  let result = null;
  focusableComponents.forEach((component, focusKey) => {
    if (component.forceFocus && !result) {
      result = { focusKey, component };
    }
  });
  return result;
};

// Event handlers
const onKeyDown = (event: KeyboardEvent): void => {
  if (paused) return;
  
  const direction = getDirectionFromKey(event.keyCode || event.which);
  
  if (direction) {
    event.preventDefault();
    
    if (throttleConfig.throttle > 0) {
      if (keyDownEventThrottleId) return;
      
      keyDownEventThrottleId = window.setTimeout(() => {
        keyDownEventThrottleId = null;
      }, throttleConfig.throttle);
    }
    
    navigateByDirection(direction, { event });
  } else if (isEnterKey(event.keyCode || event.which)) {
    event.preventDefault();
    handleEnterPress({ event });
  }
};

const onKeyUp = (event: KeyboardEvent): void => {
  if (paused) return;
  
  const direction = getDirectionFromKey(event.keyCode || event.which);
  
  if (direction) {
    event.preventDefault();
    handleArrowRelease(direction);
  } else if (isEnterKey(event.keyCode || event.which)) {
    event.preventDefault();
    handleEnterRelease();
  }
};

const getDirectionFromKey = (keyCode: number): string | null => {
  const directions = ['left', 'up', 'right', 'down'];
  
  for (let i = 0; i < directions.length; i++) {
    const direction = directions[i];
    const codes = keyMap[direction];
    
    if (Array.isArray(codes)) {
      for (let j = 0; j < codes.length; j++) {
        if (codes[j] === keyCode) return direction;
      }
    } else if (codes === keyCode) {
      return direction;
    }
  }
  return null;
};

const isEnterKey = (keyCode: number): boolean => {
  const enterCodes = keyMap.enter;
  if (Array.isArray(enterCodes)) {
    for (let i = 0; i < enterCodes.length; i++) {
      if (enterCodes[i] === keyCode) return true;
    }
    return false;
  }
  return enterCodes === keyCode;
};

export const navigateByDirection = (direction: string, focusDetails: any): void => {
  const currentComponent = focusableComponents.get(currentFocusKey);
  if (!currentComponent) return;
  
  // Call onArrowPress callback if exists
  if (currentComponent.onArrowPress) {
    const shouldContinue = currentComponent.onArrowPress(direction, currentComponent.extraProps, focusDetails);
    if (!shouldContinue) return;
  }
  
  // Find next focusable component
  const nextComponent = findNextComponent(direction);
  if (nextComponent) {
    setFocus(nextComponent);
  }
};

const findNextComponent = (direction: string): string | null => {
  const currentComponent = focusableComponents.get(currentFocusKey);
  if (!currentComponent || !currentComponent.ref?.current) return null;
  
  const currentLayout = getLayout(currentComponent.ref.current);
  let bestCandidate: { focusKey: string; distance: number } | null = null;
  
  focusableComponents.forEach((component, focusKey) => {
    if (focusKey === currentFocusKey || !component.focusable || !component.ref?.current) return;
    
    const layout = getLayout(component.ref.current);
    if (isInDirection(currentLayout, layout, direction)) {
      const distance = calculateDistance(currentLayout, layout, direction);
      
      if (!bestCandidate || distance < bestCandidate.distance) {
        bestCandidate = { focusKey, distance };
      }
    }
  });
  
  return bestCandidate?.focusKey || null;
};

const getLayout = (element: HTMLElement) => {
  if (config.useGetBoundingClientRect) {
    return getBoundingClientRect(element);
  } else {
    return measureLayout(element);
  }
};

const isInDirection = (currentLayout: any, targetLayout: any, direction: string): boolean => {
  const currentCenterX = currentLayout.left + currentLayout.width / 2;
  const currentCenterY = currentLayout.top + currentLayout.height / 2;
  const targetCenterX = targetLayout.left + targetLayout.width / 2;
  const targetCenterY = targetLayout.top + targetLayout.height / 2;

  switch (direction) {
    case 'left':
      return config.rtl ? targetCenterX > currentCenterX : targetCenterX < currentCenterX;
    case 'right':
      return config.rtl ? targetCenterX < currentCenterX : targetCenterX > currentCenterX;
    case 'up':
      return targetCenterY < currentCenterY;
    case 'down':
      return targetCenterY > currentCenterY;
    default:
      return false;
  }
};

const calculateDistance = (currentLayout: any, targetLayout: any, direction: string): number => {
  const isVertical = direction === 'up' || direction === 'down';
  
  // Primary axis distance
  let primaryDistance = 0;
  if (direction === 'left') {
    primaryDistance = currentLayout.left - targetLayout.right;
  } else if (direction === 'right') {
    primaryDistance = targetLayout.left - currentLayout.right;
  } else if (direction === 'up') {
    primaryDistance = currentLayout.top - targetLayout.bottom;
  } else if (direction === 'down') {
    primaryDistance = targetLayout.top - currentLayout.bottom;
  }
  
  // Secondary axis distance
  let secondaryDistance = 0;
  if (isVertical) {
    const currentCenter = currentLayout.left + currentLayout.width / 2;
    const targetCenter = targetLayout.left + targetLayout.width / 2;
    secondaryDistance = Math.abs(currentCenter - targetCenter);
  } else {
    const currentCenter = currentLayout.top + currentLayout.height / 2;
    const targetCenter = targetLayout.top + targetLayout.height / 2;
    secondaryDistance = Math.abs(currentCenter - targetCenter);
  }
  
  return Math.sqrt(primaryDistance * primaryDistance + secondaryDistance * secondaryDistance);
};

const handleEnterPress = (details: any): void => {
  const currentComponent = focusableComponents.get(currentFocusKey);
  if (currentComponent?.onEnterPress) {
    currentComponent.onEnterPress(currentComponent.extraProps, details);
  }
};

const handleEnterRelease = (): void => {
  const currentComponent = focusableComponents.get(currentFocusKey);
  if (currentComponent?.onEnterRelease) {
    currentComponent.onEnterRelease(currentComponent.extraProps);
  }
};

const handleArrowRelease = (direction: string): void => {
  const currentComponent = focusableComponents.get(currentFocusKey);
  if (currentComponent?.onArrowRelease) {
    currentComponent.onArrowRelease(direction, currentComponent.extraProps);
  }
};

// Component registration
export const addFocusableComponent = (focusKey: string, component: any): void => {
  focusableComponents.set(focusKey, component);
  log('Added focusable component:', focusKey);
};

export const removeFocusableComponent = (focusKey: string): void => {
  const component = focusableComponents.get(focusKey);
  
  if (component && currentFocusKey === focusKey) {
    // Auto restore focus if enabled
    if (component.autoRestoreFocus) {
      const nextFocusKey = findNextFocusableComponent(focusKey);
      if (nextFocusKey) {
        setFocus(nextFocusKey);
      } else {
        currentFocusKey = ROOT_FOCUS_KEY;
      }
    } else {
      currentFocusKey = ROOT_FOCUS_KEY;
    }
  }
  
  focusableComponents.delete(focusKey);
  log('Removed focusable component:', focusKey);
};

const findNextFocusableComponent = (excludeFocusKey: string): string | null => {
  let result: string | null = null;
  focusableComponents.forEach((component, focusKey) => {
    if (focusKey !== excludeFocusKey && component.focusable && !result) {
      result = focusKey;
    }
  });
  return result;
};

export const updateFocusableComponent = (focusKey: string, updates: any): void => {
  const component = focusableComponents.get(focusKey);
  if (component) {
    Object.assign(component, updates);
    log('Updated focusable component:', focusKey, updates);
  }
};

export const updateAllLayouts = (): void => {
  // Force layout recalculation - useful when DOM changes
  log('Updated all layouts');
};

export const getFocusableComponent = (focusKey: string) => {
  return focusableComponents.get(focusKey);
};

export const updateRtl = (rtl: boolean): void => {
  config.rtl = rtl;
  log('Updated RTL setting:', rtl);
};
