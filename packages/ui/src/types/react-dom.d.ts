// minimal react-dom types for build-time only (prevents needing @types/react-dom in devDeps)
declare module 'react-dom' {
  import * as React from 'react';
  export function createPortal(children: React.ReactNode, container: Element | DocumentFragment | null): React.ReactPortal;
}
