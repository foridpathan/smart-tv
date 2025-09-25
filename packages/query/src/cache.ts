import { QueryKey, QueryState } from './types'

type CacheEntry = {
  key: string
  state: QueryState
  timeout?: ReturnType<typeof setTimeout>
  subscribers: Set<() => void>
}

const keyToString = (key: QueryKey) => (Array.isArray(key) ? JSON.stringify(key) : String(key))

export class QueryCache {
  private map = new Map<string, CacheEntry>()

  getEntry(key: QueryKey): CacheEntry {
    const k = keyToString(key)
    let e = this.map.get(k)
    if (!e) {
      e = {
        key: k,
        state: { status: 'idle', updatedAt: null },
        subscribers: new Set(),
      }
      this.map.set(k, e)
    }
    return e
  }

  setData(key: QueryKey, data: unknown) {
    const e = this.getEntry(key)
    e.state.data = data
    e.state.status = 'success'
    e.state.error = undefined
    e.state.updatedAt = Date.now()
    this.notify(e)
  }

  setError(key: QueryKey, error: unknown) {
    const e = this.getEntry(key)
    e.state.error = error
    e.state.status = 'error'
    e.state.updatedAt = Date.now()
    this.notify(e)
  }

  setLoading(key: QueryKey) {
    const e = this.getEntry(key)
    e.state.status = 'loading'
    this.notify(e)
  }

  subscribe(key: QueryKey, cb: () => void) {
    const e = this.getEntry(key)
    e.subscribers.add(cb)
    return () => {
      e.subscribers.delete(cb)
    }
  }

  private notify(e: CacheEntry) {
    for (const s of e.subscribers) s()
  }

  remove(key: QueryKey) {
    const k = keyToString(key)
    this.map.delete(k)
  }

  getState<T = unknown>(key: QueryKey): QueryState<T> {
    return this.getEntry(key).state as QueryState<T>
  }
}
