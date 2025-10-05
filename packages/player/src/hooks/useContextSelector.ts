import React, { useContext, useEffect, useRef, useState } from 'react';

// Generic context selector hook to prevent unnecessary re-renders
export function useContextSelector<T, U>(
  context: React.Context<T>,
  selector: (value: T) => U,
  equalityFn?: (a: U, b: U) => boolean
): U {
  const contextValue = useContext(context);
  
  if (contextValue === null || contextValue === undefined) {
    throw new Error('useContextSelector must be used within the appropriate Provider');
  }

  const [selectedValue, setSelectedValue] = useState(() => selector(contextValue));
  const selectorRef = useRef(selector);
  const equalityRef = useRef(equalityFn || Object.is);
  const selectedValueRef = useRef(selectedValue);

  // Update refs
  selectorRef.current = selector;
  equalityRef.current = equalityFn || Object.is;

  useEffect(() => {
    const newValue = selectorRef.current(contextValue);
    
    if (!equalityRef.current(selectedValueRef.current, newValue)) {
      selectedValueRef.current = newValue;
      setSelectedValue(newValue);
    }
  }, [contextValue]);

  return selectedValue;
}

// Specialized equality functions for common use cases
export const shallowEqualArray = <T>(a: T[], b: T[]): boolean => {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
};

export const timeBasedEquality = (a: number, b: number): boolean => {
  // Only update if time difference is significant (more than 0.1 seconds)
  return Math.abs(a - b) < 0.1;
};
