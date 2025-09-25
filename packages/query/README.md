# @stv/query

A tiny, dependency-free query client optimized for smart TV apps.

Features
- Simple caching with staleTime and cacheTime
- Deduped requests
- Fetcher using native fetch only (no axios)
- React hooks: useQuery, useMutation
- Small and tree-shakeable

Quick example

```tsx
import { QueryClient, QueryClientProvider, useQuery } from '@stv/query'

const client = new QueryClient()

function App() {
  return <QueryClientProvider client={client}><MyApp/></QueryClientProvider>
}

function Movies() {
  const { data, error, status, refetch } = useQuery(['movies'], () => fetch('/api/movies').then(r=>r.json()))
}
```

See API docs in the source files.
