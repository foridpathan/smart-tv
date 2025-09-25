import React from 'react'
import { QueryClient } from '../queryClient'
import { QueryKey, QueryOptions } from '../types'

const ClientContext = React.createContext<QueryClient | null>(null)

export const QueryClientProvider: React.FC<{ client: QueryClient; children?: React.ReactNode }> = ({ client, children }) => {
  return <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
}

export function useClient() {
  const c = React.useContext(ClientContext)
  if (!c) throw new Error('QueryClientProvider missing')
  return c
}

export function useQuery<T = unknown>(key: QueryKey, fetcher: () => Promise<T>, options?: QueryOptions<T>) {
  const client = useClient()
  const resolvedOptions = { ...client.defaultOptions, ...(options || {}) } as Required<QueryOptions<T>>
  const cached = client.cache.getState<T>(key)
  const initial = cached.data ?? resolvedOptions.initialData
  const [data, setData] = React.useState<T | undefined>(initial)
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>(cached.status)
  const [error, setError] = React.useState<unknown | undefined>(cached.error)
  // stable refetch callback used for registration
  const fetchRef = React.useRef<() => void>(() => {})

  React.useEffect(() => {
    const unsub = client.cache.subscribe(key, () => {
      const s = client.cache.getState<T>(key)
      setStatus(s.status)
      setError(s.error)
      setData(s.data)
    })

    const doFetch = () => {
      const s = client.cache.getState<T>(key)
      const isStale = !s.updatedAt || Date.now() - s.updatedAt > resolvedOptions.staleTime
      if (s.status === 'idle' || isStale) {
        if (!resolvedOptions.keepPreviousData) setData(undefined)
        client.fetchQuery<T>(key, fetcher, resolvedOptions).catch(() => {})
      } else {
        if (resolvedOptions.select && s.data !== undefined) setData(resolvedOptions.select(s.data))
      }
    }

    fetchRef.current = () => {
      // called by client on invalidate or focus; respect options
      if (resolvedOptions.enabled) {
        // refetchOnMount/WindowFocus behavior: let the hook decide whether to refetch
        doFetch()
      }
    }

    // register active so invalidate/refocus can call us
    client.registerActive(key, () => fetchRef.current(), options)

    let shouldFetch = resolvedOptions.enabled !== false
    if (shouldFetch) {
      const s = client.cache.getState<T>(key)
      const isStale = !s.updatedAt || Date.now() - s.updatedAt > resolvedOptions.staleTime
      const shouldRefetchOnMount = resolvedOptions.refetchOnMount ?? true
      if (s.status === 'idle' || (isStale && shouldRefetchOnMount)) {
        // keep previous data if asked
        if (!resolvedOptions.keepPreviousData) setData(undefined)
        client.fetchQuery<T>(key, fetcher, resolvedOptions).catch(() => {})
      } else {
        if (resolvedOptions.select && s.data !== undefined) setData(resolvedOptions.select(s.data))
      }
    }

    return () => {
      unsub()
      client.unregisterActive(key, () => fetchRef.current())
    }
  }, [client, JSON.stringify(key)])

  const refetch = React.useCallback(() => client.fetchQuery<T>(key, fetcher, resolvedOptions), [client, JSON.stringify(key)])

  return { data: resolvedOptions.select ? (data as any ? resolvedOptions.select(data) : data) : data, error, status, refetch }
}

export default useQuery
