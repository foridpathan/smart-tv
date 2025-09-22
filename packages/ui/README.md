# @smart-tv/ui

A React component library tailored for Smart TV applications. It provides focusable UI components,  navigation primitives, and utilities for building fast, accessible TV experiences with remote control or keyboard navigation.

This package is part of the monorepo and is intended to be consumed by apps in this repo (for example `apps/web`).

## Features

-  navigation primitives (Focusable, FocusScope)
- Provider for navigation and key handling (NavigationProvider)
- Re-usable UI primitives: Button, Card, List, Modal, Carousel, Image, Video
- Utilities and hooks: `useFocusable`, `useFocusContext`, `measureLayout`, `useTVKeyDown`
- Visual debugger for focus states

## Install

This package is designed to be used inside the monorepo. For external use, install the package after publishing or link locally.

From monorepo root (example uses pnpm):

```bash
pnpm -w install
pnpm -w build
```

In your app (workspaces):

```ts
import { NavigationProvider, Focusable, Card, Button } from '@smart-tv/ui'
```

## Quick start

Wrap your app with `NavigationProvider` and use `Focusable` or the high-level components that are focus-aware.

```tsx
import React from 'react'
import { NavigationProvider, Focusable, Button } from '@smart-tv/ui'

export default function App() {
  return (
    <NavigationProvider>
      <Focusable>
        <Button>Play</Button>
      </Focusable>
    </NavigationProvider>
  )
}
```

## Components (short list)

- Providers
  - `NavigationProvider` — main provider to enable  navigation
  - `ThemeProvider` — optional theme tokens (colors, sizes)

- Focus primitives
  - `Focusable` — low-level wrapper that registers DOM nodes with the navigation engine
  - `FocusScope` / `FocusBoundary` — for grouping and trapping focus
  - `FocusRing` — visual highlight for focused elements

- Layout & primitives
  - `View`, `Box`, `Stack`, `Row`, `Column`, `Grid`
  - `Text`, `Heading`, `Label`

- Controls & composites
  - `Button`, `IconButton`, `Toggle`, `Slider`, `List`, `ListItem`, `Card`, `Modal`, `Menu`, `Tooltip`, `Carousel`

- Media
  - `TVImage`, `Video` (focusable controls support)

- Utilities & hooks
  - `useFocusable`, `useFocusContext`, `useNavigation`, `useTVKeyDown`, `measureLayout`

## API summary

- `NavigationProvider` props:
  - `children` ReactNode
  - `debug?: boolean`
  - `keyMap?: KeyMap`
  - `throttle?: number`
  - `nativeMode?: boolean`

- `Focusable` props:
  - `focusKey?: string`
  - `focusable?: boolean`
  - `isFocusBoundary?: boolean`
  - `onFocus?(details)` / `onBlur?(details)`
  - `onEnterPress?(details)` / `onArrowPress?(direction, details)`

See the source code in `packages/navigation/src` for full engine options and `packages/ui/src` for component implementations.

## Development

- Build all packages:

```bash
pnpm -w build
```

- Start a local app (Next.js example in this repo):

```bash
pnpm --filter=apps/web dev
```

- Run tests (if added):

```bash
pnpm -w test
```

## Testing & debugging

- Use `VisualDebugger` to display focus rectangles during development.
- Add storybook stories to visualize navigation flows and focus states.

## Contributing

- Follow the monorepo conventions. Place UI component code under `packages/ui/src` and navigation engine code under `packages/navigation/src`.
- Add unit tests for navigation logic (candidate selection, focus restoration) and component behavior.

## License

MIT
