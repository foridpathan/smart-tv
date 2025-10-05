// Utility functions for React memo optimization

/**
 * Shallow comparison function for React.memo
 * Only compares primitive values and function references
 */
export function shallowEqual<T extends Record<string, any>>(
  prevProps: T,
  nextProps: T
): boolean {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Comparison function that ignores function props for better memo performance
 * Use this when functions are frequently recreated but don't affect rendering
 */
export function compareIgnoringFunctions<T extends Record<string, any>>(
  prevProps: T,
  nextProps: T
): boolean {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  // Get non-function keys
  const prevNonFunctionKeys = prevKeys.filter(key => typeof prevProps[key] !== 'function');
  const nextNonFunctionKeys = nextKeys.filter(key => typeof nextProps[key] !== 'function');

  if (prevNonFunctionKeys.length !== nextNonFunctionKeys.length) {
    return false;
  }

  for (const key of prevNonFunctionKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Comparison function for track-related components
 * Optimizes for track arrays and common player props
 */
export function compareTrackProps<T extends Record<string, any>>(
  prevProps: T,
  nextProps: T
): boolean {
  // First check non-array, non-function props
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    const prevValue = prevProps[key];
    const nextValue = nextProps[key];

    // Skip function comparisons (they change frequently)
    if (typeof prevValue === 'function' || typeof nextValue === 'function') {
      continue;
    }

    // For arrays (like tracks), do shallow comparison
    if (Array.isArray(prevValue) && Array.isArray(nextValue)) {
      if (prevValue.length !== nextValue.length) {
        return false;
      }
      for (let i = 0; i < prevValue.length; i++) {
        if (prevValue[i] !== nextValue[i]) {
          return false;
        }
      }
      continue;
    }

    // Regular equality check
    if (prevValue !== nextValue) {
      return false;
    }
  }

  return true;
}
