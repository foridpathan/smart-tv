import { useContext, useEffect, useRef, useState } from 'react';
import {
    addFocusableComponent,
    generateId,
    getCurrentFocusKey,
    getFocusableComponent,
    log,
    removeFocusableComponent,
    updateFocusableComponent
} from './SpatialNavigation';
import { UseFocusableConfig, UseFocusableResult } from './types';
import { FocusContext } from './useFocusContext';

export const useFocusable = (config: UseFocusableConfig = {}): UseFocusableResult => {
  const {
    focusable = true,
    saveLastFocusedChild = true,
    trackChildren = false,
    autoRestoreFocus = true,
    forceFocus = false,
    isFocusBoundary = false,
    focusBoundaryDirections,
    focusKey: providedFocusKey,
    preferredChildFocusKey,
    onEnterPress,
    onEnterRelease,
    onArrowPress,
    onArrowRelease,
    onFocus,
    onBlur,
    extraProps
  } = config;

  const ref = useRef<HTMLElement>(null);
  const [focused, setFocused] = useState(false);
  const [hasFocusedChild, setHasFocusedChild] = useState(false);
  const parentFocusKey = useContext(FocusContext);
  
  const focusKey = providedFocusKey || useRef(generateId()).current;

  const focusSelf = () => {
    const component = {
      ref,
      focusable,
      focused,
      setFocused,
      hasFocusedChild,
      setHasFocusedChild,
      saveLastFocusedChild,
      trackChildren,
      autoRestoreFocus,
      forceFocus,
      isFocusBoundary,
      focusBoundaryDirections,
      preferredChildFocusKey,
      onEnterPress,
      onEnterRelease,
      onArrowPress,
      onArrowRelease,
      onFocus,
      onBlur,
      extraProps,
      parentFocusKey
    };

    updateFocusableComponent(focusKey, component);
    
    // Set current component as focused
    setFocused(true);
    
    // Update parent to have focused child if tracking is enabled
    if (parentFocusKey && trackChildren && typeof parentFocusKey === 'string') {
      const parentComponent = getFocusableComponent(parentFocusKey);
      if (parentComponent?.setHasFocusedChild) {
        parentComponent.setHasFocusedChild(true);
      }
    }

    log('Focusing self:', focusKey);
  };

  useEffect(() => {
    const component = {
      ref,
      focusable,
      focused,
      setFocused,
      hasFocusedChild,
      setHasFocusedChild,
      saveLastFocusedChild,
      trackChildren,
      autoRestoreFocus,
      forceFocus,
      isFocusBoundary,
      focusBoundaryDirections,
      preferredChildFocusKey,
      onEnterPress,
      onEnterRelease,
      onArrowPress,
      onArrowRelease,
      onFocus,
      onBlur,
      extraProps,
      parentFocusKey
    };

    addFocusableComponent(focusKey, component);

    return () => {
      removeFocusableComponent(focusKey);
    };
  }, [focusKey]);

  useEffect(() => {
    const component = {
      ref,
      focusable,
      focused,
      setFocused,
      hasFocusedChild,
      setHasFocusedChild,
      saveLastFocusedChild,
      trackChildren,
      autoRestoreFocus,
      forceFocus,
      isFocusBoundary,
      focusBoundaryDirections,
      preferredChildFocusKey,
      onEnterPress,
      onEnterRelease,
      onArrowPress,
      onArrowRelease,
      onFocus,
      onBlur,
      extraProps,
      parentFocusKey
    };

    updateFocusableComponent(focusKey, component);
  }, [
    focusKey,
    focusable,
    focused,
    hasFocusedChild,
    saveLastFocusedChild,
    trackChildren,
    autoRestoreFocus,
    forceFocus,
    isFocusBoundary,
    focusBoundaryDirections,
    preferredChildFocusKey,
    onEnterPress,
    onEnterRelease,
    onArrowPress,
    onArrowRelease,
    onFocus,
    onBlur,
    extraProps,
    parentFocusKey
  ]);

  // Check if this component is currently focused
  useEffect(() => {
    const currentFocus = getCurrentFocusKey();
    const isFocused = currentFocus === focusKey;
    
    if (isFocused !== focused) {
      setFocused(isFocused);
    }
  }, [focusKey]);

  // Update focused state when the global focus changes
  useEffect(() => {
    const checkFocus = () => {
      const currentFocus = getCurrentFocusKey();
      const isFocused = currentFocus === focusKey;
      
      if (isFocused !== focused) {
        setFocused(isFocused);
      }
    };

    // Check focus periodically (or on events)
    const interval = setInterval(checkFocus, 100);
    
    return () => clearInterval(interval);
  }, [focusKey, focused]);

  return {
    ref,
    focusSelf,
    focused,
    hasFocusedChild,
    focusKey
  };
};

// Helper function to get focusable component
// const getFocusableComponent = (focusKey: string) => {
//   // This would be implemented in SpatialNavigation.ts
//   return null;
// };
