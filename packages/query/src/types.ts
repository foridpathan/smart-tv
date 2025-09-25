export type QueryKey = string | readonly unknown[]

export type QueryState<T = unknown> = {
  data?: T
  error?: unknown
  status: 'idle' | 'loading' | 'success' | 'error'
  updatedAt: number | null
}

export type QueryOptions<T = unknown> = {
  staleTime?: number
  cacheTime?: number
  retry?: number
  initialData?: T
  enabled?: boolean
  select?: (data: any) => T
  keepPreviousData?: boolean
  // automatically refetch when window gains focus
  refetchOnWindowFocus?: boolean
  // refetch on mount if data is stale
  refetchOnMount?: boolean
  // refetch on network reconnect (not implemented yet)
  refetchOnReconnect?: boolean
}

export type MutationOptions<TData = unknown, TVariables = unknown> = {
  onSuccess?: (data: TData) => void
  onError?: (err: unknown) => void
}
