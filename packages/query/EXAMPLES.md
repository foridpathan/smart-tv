# @stv/query Examples

This document demonstrates how to use the small, dependency-free query client included in this monorepo. It covers basic setup, `useQuery`, `useMutation`, `useInfiniteQuery` (infinite loading for TV), cache management, and tips for virtualization.

## 1. Setup

Wrap your app with `QueryClientProvider` and create a `QueryClient`.

```tsx
import React from 'react'
import { QueryClient, QueryClientProvider } from '@stv/query'

const client = new QueryClient({ staleTime: 1000 * 10, cacheTime: 1000 * 60 })

export default function App() {
  return (
    <QueryClientProvider client={client}>
      <YourApp />
    </QueryClientProvider>
  )
}
```

## 2. Basic fetching with `useQuery`

```tsx
import { useQuery } from '@stv/query'

function Movies() {
  const { data, status, error, refetch } = useQuery(['movies'], () => fetch('/api/movies').then(r => r.json()), {
    staleTime: 5000,
    retry: 1,
    initialData: [],
    enabled: true,
    keepPreviousData: true,
    select: (d: any) => d.items // optional selector
  })

  if (status === 'loading') return <div>Loading</div>
  if (status === 'error') return <div>Error: {String(error)}</div>
  return (
    <div>
      {JSON.stringify(data)}
      <button onClick={() => refetch()}>Refetch</button>
    </div>
  )
}
```

Notes
- `staleTime` controls when cached data is considered fresh.
- `cacheTime` controls when the cache entry is evicted from memory.
- `select` is useful to map raw API payloads to the shape the UI needs.

## 3. Mutations with `useMutation`

```tsx
import { useMutation, defaultClient } from '@stv/query'

function AddFavorite() {
  const { mutate, status } = useMutation(async (movie) => {
    const res = await fetch('/api/favorites', { method: 'POST', body: JSON.stringify(movie) })
    return res.json()
  }, {
    onSuccess: (data) => {
      // update cache manually after a successful mutation
      defaultClient.setQueryData(['favorites'], (old = []) => [data, ...old])
    }
  })

  return <button onClick={() => mutate({ id: 1 })}>Add</button>
}
```

## 4. Infinite loading (`useInfiniteQuery`)

Ideal for smart TV vertical/horizontal lists that load more data as the user navigates.

### API shape expected
The `useInfiniteQuery` hook expects a `fetchPage(cursor?)` function that returns a page object with `items` and an optional `nextCursor`.

```ts
type Page = { items: Movie[]; nextCursor?: string | null }
```

### Example

```tsx
import { useInfiniteQuery } from '@stv/query'

function MoviesList() {
  const { data, isFetching, fetchNext, hasNextPage } = useInfiniteQuery(['movies-infinite'], async (cursor) => {
    const url = '/api/movies?pageCursor=' + (cursor ?? '')
    return fetch(url).then(r => r.json())
  })

  return (
    <div>
      {data.map((m: any) => <div key={m.id}>{m.title}</div>)}
      {isFetching && <div>Loading more...</div>}
      {hasNextPage && <button onClick={() => fetchNext()}>Load more</button>}
    </div>
  )
}
```

### Virtualization integration tips (smart TV)
- Use a windowing/virtualization list (keep DOM nodes small).
- Trigger `fetchNext()` when the virtual scroller approaches the end (e.g., index >= total - 12).
- Preload next page early for smoother navigation.

## 5. Cache utilities

```ts
import { defaultClient } from '@stv/query'

// read
const data = defaultClient.getQueryData(['movies'])

// update
defaultClient.setQueryData(['movies'], (old = []) => [...old, newItem])

// invalidate
defaultClient.invalidateQueries(['movies'])
```

## 6. Performance tips for Smart TV
- Keep `staleTime` short enough to stay fresh but long enough to avoid frequent network requests.
- Use `select` to return light-weight data to components.
- Limit in-memory pages in `InfiniteObserver` if device memory is constrained (I can add an option to cap pages).
- Use prefetching when the user is near the end of the visible list.

## 7. Extending
- If you need optimistic updates, we can add `mutate` options to apply optimistic cache updates and rollback on error.
- We can add persistence (IndexedDB or localStorage) for offline support.

---

If you want, I can now:
- Add a demo page in `apps/sample` showing `useInfiniteQuery` with virtualization.
- Add page-capping option to `InfiniteObserver`.
- Add tests for infinite loading behavior.

Which one should I implement next?
