export type Fetcher<T> = (...args: any[]) => Promise<T>

// Options for the XHR-based fetcher. This provides similar flexibility to fetch + some XHR-only features
export interface XhrOptions {
  method?: string
  headers?: Record<string, string>
  body?: any
  responseType?: '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text'
  timeout?: number // milliseconds
  withCredentials?: boolean
  // progress callbacks
  onUploadProgress?: (sent: number, total?: number) => void
  onDownloadProgress?: (loaded: number, total?: number) => void
  // optional AbortSignal to cancel the request
  signal?: AbortSignal | null
}

// A powerful, XHR-based fetcher that mirrors the Fetcher<T> signature.
// Usage: xhrFetcher<T>(url, options) -> Promise<T>
export const xhrFetcher: Fetcher<any> = (input: string, options: XhrOptions = {}) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    const method = (options.method || 'GET').toUpperCase()
    const url = input

    // Configure responseType if provided
    if (options.responseType) xhr.responseType = options.responseType as XMLHttpRequestResponseType

    xhr.open(method, url, true)

    // Credentials
    if (options.withCredentials) xhr.withCredentials = true

    // Timeout
    if (options.timeout && options.timeout > 0) xhr.timeout = options.timeout

    // Set headers
    const headers = options.headers || {}
    Object.keys(headers).forEach((k) => {
      try {
        xhr.setRequestHeader(k, headers[k])
      } catch (e) {
        // some headers are restricted; ignore failures
      }
    })

    // Progress events
    if (xhr.upload && options.onUploadProgress) {
      xhr.upload.onprogress = (ev) => {
        options.onUploadProgress!(ev.loaded, ev.lengthComputable ? ev.total : undefined)
      }
    }

    if (options.onDownloadProgress) {
      xhr.onprogress = (ev) => {
        options.onDownloadProgress!(ev.loaded, ev.lengthComputable ? ev.total : undefined)
      }
    }

    // Abort handling
    let aborted = false
    const onAbort = () => {
      aborted = true
      try { xhr.abort() } catch (e) {}
      reject(new DOMException('Aborted', 'AbortError'))
    }

    if (options.signal) {
      if (options.signal.aborted) return onAbort()
      const listener = () => onAbort()
      options.signal.addEventListener('abort', listener, { once: true })
      // ensure we remove listener on settle
      const cleanup = () => options.signal && options.signal.removeEventListener('abort', listener)
      xhr.addEventListener('loadend', cleanup)
    }

    xhr.onload = () => {
      if (aborted) return
      const status = xhr.status === 1223 ? 204 : xhr.status // IE bugfix; defensive
      // treat 0 as success for file:// or some local cases when response exists
      const ok = (status >= 200 && status < 300) || status === 0

      if (!ok) {
        const statusText = xhr.statusText || 'Error'
        reject(new Error(`XHR error: ${status} ${statusText}`))
        return
      }

      // Build a Fetch-like Response object so callers can use .json(), .text(), etc.
      const rawResponseText = typeof xhr.responseText === 'string' ? xhr.responseText : ''
      const parseJsonSafe = () => {
        try {
          // prefer xhr.response if responseType === 'json'
          if (xhr.responseType === 'json' && typeof xhr.response !== 'string') return xhr.response
          return rawResponseText ? JSON.parse(rawResponseText) : null
        } catch (err) {
          throw err
        }
      }

      const headerStr = xhr.getAllResponseHeaders()
      const headersMap: Record<string, string> = {}
      headerStr.trim().split(/\r?\n/).forEach((line) => {
        const idx = line.indexOf(':')
        if (idx > -1) {
          const key = line.slice(0, idx).trim().toLowerCase()
          const val = line.slice(idx + 1).trim()
          headersMap[key] = val
        }
      })

      const responseLike = {
        ok,
        status,
        statusText: xhr.statusText || '',
        headers: {
          get: (k: string) => headersMap[k.toLowerCase()] || null,
          // simple helpers if needed
          has: (k: string) => Object.prototype.hasOwnProperty.call(headersMap, k.toLowerCase()),
        },
        url,
        // body helpers
        json: async () => parseJsonSafe(),
        text: async () => rawResponseText,
        arrayBuffer: async () => (xhr.responseType === 'arraybuffer' ? xhr.response : Promise.resolve(new ArrayBuffer(0))),
        blob: async () => (xhr.responseType === 'blob' ? xhr.response : Promise.resolve(new Blob())),
        // attach the raw response for advanced users
        raw: xhr.response,
      }

      resolve(responseLike)
    }

    xhr.onerror = () => {
      if (aborted) return
      reject(new Error('Network error'))
    }

    xhr.ontimeout = () => {
      reject(new Error('Timeout'))
    }

    // Send body. If it's a plain object and content-type not set, try JSON
    let body = options.body
    if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof ArrayBuffer) && !(body instanceof Blob)) {
      if (!('Content-Type' in headers) && !(headers as any)['content-type']) {
        try {
          xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8')
        } catch (e) {}
      }
      body = JSON.stringify(body)
    }

    try {
      xhr.send(body)
    } catch (err) {
      reject(err)
    }
  })
}

// Export a friendly default name and keep backward compatibility
export const tvFetch: Fetcher<any> = xhrFetcher
