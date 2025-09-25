# Example

Create a `QueryClient` and use `useQuery` in your React tree.

```tsx
import React from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@stv/query'

const client = new QueryClient({
  staleTime: 1000 * 10,
  cacheTime: 1000 * 60,
})

function Movies() {
  const { data, status, error, refetch } = useQuery(['movies'], () => fetch('/api/movies').then(r=>r.json()), { staleTime: 5000 })
  if (status === 'loading') return <div>Loading</div>
  if (status === 'error') return <div>Error: {String(error)}</div>
  return <div>{JSON.stringify(data)}</div>
}

function App() {
  return (
    <QueryClientProvider client={client}>
      <Movies />
    </QueryClientProvider>
  )
}
```
