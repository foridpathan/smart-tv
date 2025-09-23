
import React, { forwardRef } from 'react';
import { useFocusable, UseFocusableConfig } from '../hooks';

type CardProps = {
  title: string;
  image: string;
  onSelect?: () => void;
  className?: string;
  focusKey?: string;
} & Partial<UseFocusableConfig>;

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { title, image, onSelect, className = '', focusKey, ...rest },
  ref
) {
  const { ref: innerRef, focusSelf, focused } = useFocusable({ focusKey, focusable: true, ...rest } as UseFocusableConfig);

  React.useImperativeHandle(ref, () => innerRef.current, [innerRef]);

  return (
    <div
      ref={innerRef as any}
      tabIndex={0}
      className={`tv-card ${className} ${focused ? 'focused' : ''}`}
      onClick={onSelect}
    >
      <img src={image} alt={title} />
      <div>{title}</div>
    </div>
  );
});

Card.displayName = 'Card';
