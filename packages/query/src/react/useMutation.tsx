import React from 'react'
import { QueryClient } from '../queryClient'
import { MutationOptions } from '../types'

const ClientContext = React.createContext<QueryClient | null>(null)

export function useMutation<TData = unknown, TVariables = unknown>(fn: (vars: TVariables) => Promise<TData>, options?: MutationOptions<TData, TVariables>) {
  const client = React.useContext(ClientContext) as QueryClient
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [data, setData] = React.useState<TData | undefined>(undefined)
  const [error, setError] = React.useState<unknown>(undefined)

  const mutate = React.useCallback(async (vars: TVariables) => {
    setStatus('loading')
    try {
      const res = await fn(vars)
      setData(res)
      setStatus('success')
      options?.onSuccess?.(res)
      return res
    } catch (err) {
      setError(err)
      setStatus('error')
      options?.onError?.(err)
      throw err
    }
  }, [])

  return { mutate, data, error, status }
}

export function MutationProvider({ children, client }: { client: QueryClient; children?: React.ReactNode }) {
  return <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
}

export default useMutation
