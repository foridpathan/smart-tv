import React from 'react'
import { InfiniteObserver, PageCursor } from '../infinite'
import { QueryClient } from '../queryClient'
import { QueryKey } from '../types'
import { QueryClientProvider, useClient } from './useQuery'

export type InfiniteQueryOptions<TItem = unknown> = {
  enabled?: boolean
  staleTime?: number
  mapPage?: (raw: any, cursor?: string | number | null) => PageCursor<TItem> | null
  getHasNext?: (pages: PageCursor<TItem>[]) => boolean
}

export function useInfiniteQuery<TItem = unknown, TPage = PageCursor<TItem>>(
  key: QueryKey,
  fetchPage: (cursor?: string | number | null) => Promise<TPage>,
  options?: InfiniteQueryOptions<TItem>
) {
  const client = useClient()
  const observerRef = React.useRef<InfiniteObserver<TItem> | null>(null)
  const [, force] = React.useReducer(s => s + 1, 0)

  // initialize observer once and hydrate from cache if available
  if (!observerRef.current) {
  observerRef.current = new InfiniteObserver(async (cursor) => {
      // use client.fetchQuery to benefit from inflight dedupe and cache
      const page = await client.fetchQuery(
        [...(Array.isArray(key) ? key : [key]), 'infinite', cursor ?? 'null'],
        () => fetchPage(cursor),
        { staleTime: options?.staleTime }
      )
      return page as any
  }, options?.mapPage)

    // if cached combined items exist, hydrate observer.pages from cache
    const cached = client.getQueryData<{ items: TItem[]; nextCursor?: any }[]>(Array.isArray(key) ? [...key, 'infinite-pages'] : [key, 'infinite-pages'])
    if (cached && Array.isArray(cached)) {
      observerRef.current.pages = cached as any
    }
  }

  const observer = observerRef.current

  React.useEffect(() => {
    if (options?.enabled === false) return
    // initial load
    if (observer.pages.length === 0) {
      observer.fetchNext().then(() => {
        // persist pages to client cache so revisiting can read without network if within cacheTime
        client.setQueryData(Array.isArray(key) ? [...key, 'infinite-pages'] : [key, 'infinite-pages'], observer.pages as any)
        force()
      }).catch(() => force())
    }
  }, [JSON.stringify(key)])

  const fetchNext = React.useCallback(async () => {
    await observer.fetchNext()
    // update cached pages after fetching
    client.setQueryData(Array.isArray(key) ? [...key, 'infinite-pages'] : [key, 'infinite-pages'], observer.pages as any)
    force()
  }, [JSON.stringify(key)])

  const items = observer.getItems() as TItem[]
  const isFetching = observer.isFetching
  const hasNextPage = options?.getHasNext ? options.getHasNext(observer.pages as any) : observer.hasNext

  return { data: items, isFetching, fetchNext, hasNextPage }
}

export function InfiniteProvider({ children, client }: { client: QueryClient; children?: React.ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
