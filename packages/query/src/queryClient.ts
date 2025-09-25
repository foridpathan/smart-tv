import { QueryCache } from './cache'
import { QueryKey, QueryOptions } from './types'

type Inflight = {
  promise: Promise<unknown>
  count: number
}

export class QueryClient {
  cache = new QueryCache()
  inflight = new Map<string, Inflight>()
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

  invalidateQueries(key?: QueryKey) {
    if (!key) {
      // purge entire cache
      // naive: recreate
      this.cache = new QueryCache()
      return
    }
    this.cache.remove(key)
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
