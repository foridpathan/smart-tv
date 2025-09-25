export type Fetcher<T> = (...args: any[]) => Promise<T>

export const defaultFetcher: Fetcher<any> = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init)
  if (!res.ok) throw new Error(`Fetch error: ${res.status} ${res.statusText}`)
  return res.json()
}
