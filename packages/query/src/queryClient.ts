import { QueryCache } from './cache'
import { QueryKey, QueryOptions } from './types'

type Inflight = {
  promise: Promise<unknown>
  count: number
}

export class QueryClient {
  cache = new QueryCache()
  inflight = new Map<string, Inflight>()
  // map of active queries -> array of refetch callbacks
  private active = new Map<string, Set<() => void>>()
  // track whether we have a global window focus listener
  private focusListenerAttached = false
  // concrete default options type to avoid complex generic Required<> mismatch
  defaultOptions: {
    staleTime: number
    cacheTime: number
    retry: number
    initialData: unknown
    enabled: boolean
    keepPreviousData: boolean
    select?: (data: any) => any
  } = {
    staleTime: 0,
    cacheTime: 1000 * 60 * 5,
    retry: 0,
    initialData: undefined,
    enabled: true,
    keepPreviousData: false,
    select: (d: any) => d,
  }

  constructor(options?: Partial<QueryOptions>) {
    this.defaultOptions = { ...this.defaultOptions, ...options }
  }

  private keyToString(key: QueryKey) {
    return Array.isArray(key) ? JSON.stringify(key) : String(key)
  }

  // register an active query so it can be invalidated/refetched
  registerActive(key: QueryKey, refetch: () => void, options?: QueryOptions) {
    const k = this.keyToString(key)
    let set = this.active.get(k)
    if (!set) {
      set = new Set()
      this.active.set(k, set)
    }
    set.add(refetch)

    // attach global focus listener lazily when any query opts-in
    if (options?.refetchOnWindowFocus && !this.focusListenerAttached && typeof window !== 'undefined') {
      this.focusListenerAttached = true
      window.addEventListener('focus', this.handleWindowFocus)
    }
  }

  unregisterActive(key: QueryKey, refetch: () => void) {
    const k = this.keyToString(key)
    const set = this.active.get(k)
    if (!set) return
    set.delete(refetch)
    if (set.size === 0) this.active.delete(k)
  }

  private handleWindowFocus = () => {
    for (const [key, set] of this.active) {
      // naive: call all registered refetches; each hook will decide if it should refetch
      for (const r of set) r()
    }
  }

  async fetchQuery<T = unknown>(key: QueryKey, fetcher: () => Promise<T>, options?: QueryOptions) {
    const opt = { ...this.defaultOptions, ...(options || {}) }
    const k = this.keyToString(key)

    const state = this.cache.getState<T>(key)
    if (state.status === 'success' && state.updatedAt && Date.now() - state.updatedAt < opt.staleTime) {
      return state.data as T
    }

    const existing = this.inflight.get(k)
    if (existing) {
      existing.count++
      try {
        const v = await existing.promise
        return v as T
      } finally {
        existing.count--
        if (existing.count === 0) this.inflight.delete(k)
      }
    }

    this.cache.setLoading(key)

    const promise = (async () => {
      let attempts = 0
      while (true) {
        try {
          const data = await fetcher()
          this.cache.setData(key, data)
          return data
        } catch (err) {
          attempts++
          if (attempts > opt.retry) {
            this.cache.setError(key, err)
            throw err
          }
        }
      }
    })()

    this.inflight.set(k, { promise, count: 1 })

    try {
      const res = await promise
      // schedule cache garbage collection using cacheTime
      if (opt.cacheTime > 0) {
        const entry = this.cache.getEntry(key as any) as any
        if (entry.timeout) clearTimeout(entry.timeout)
        entry.timeout = setTimeout(() => {
          this.cache.remove(key)
        }, opt.cacheTime)
      }
      return res as T
    } finally {
      const inf = this.inflight.get(k)
      if (inf) {
        inf.count--
        if (inf.count === 0) this.inflight.delete(k)
      }
    }
  }

  // invalidate queries. If refetch = true, active queries matching the key will refetch
  invalidateQueries(key?: QueryKey, opts?: { refetch?: boolean }) {
    if (!key) {
      // purge entire cache
      this.cache = new QueryCache()
      if (opts?.refetch) {
        for (const set of this.active.values()) for (const r of set) r()
      }
      return
    }

    const k = this.keyToString(key)
    this.cache.remove(key)
    if (opts?.refetch) {
      const set = this.active.get(k)
      if (set) for (const r of set) r()
    }
  }

  getQueryData<T = unknown>(key: QueryKey) {
    return this.cache.getState<T>(key).data
  }

  setQueryData<T = unknown>(key: QueryKey, updater: T | ((old?: T) => T)) {
    const old = this.getQueryData<T>(key)
    const newData = typeof updater === 'function' ? (updater as any)(old) : updater
    this.cache.setData(key, newData)
  }
}

export const defaultClient = new QueryClient()
