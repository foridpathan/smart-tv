import React from 'react'
import { InfiniteObserver, PageCursor } from '../infinite'
import { QueryClient } from '../queryClient'
import { QueryKey } from '../types'

const ClientContext = React.createContext<QueryClient | null>(null)

export function useInfiniteQuery<TItem = unknown, TPage = PageCursor<TItem>>(
  key: QueryKey,
  fetchPage: (cursor?: string | number | null) => Promise<TPage>,
  options?: { enabled?: boolean }
) {
  const client = React.useContext(ClientContext) as QueryClient
  const observerRef = React.useRef<InfiniteObserver<TItem> | null>(null)
  const [, force] = React.useReducer(s => s + 1, 0)

  if (!observerRef.current) {
    observerRef.current = new InfiniteObserver(async (cursor) => {
      const page = await fetchPage(cursor)
      return page as any
    })
  }

  const observer = observerRef.current

  React.useEffect(() => {
    if (options?.enabled === false) return
    // initial load
    if (observer.pages.length === 0) {
      observer.fetchNext().then(() => force()).catch(() => force())
    }
  }, [JSON.stringify(key)])

  const fetchNext = React.useCallback(async () => {
    await observer.fetchNext()
    force()
  }, [])

  const items = observer.getItems() as TItem[]
  const isFetching = observer.isFetching
  const hasNextPage = observer.hasNext

  return { data: items, isFetching, fetchNext, hasNextPage }
}

export function InfiniteProvider({ children, client }: { client: QueryClient; children?: React.ReactNode }) {
  return <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
}
