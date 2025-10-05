export type PageCursor<TPage = any> = {
  items: TPage[]
  nextCursor?: string | number | null
}

export type MapPageFn<TPage> = (raw: any, cursor?: string | number | null) => PageCursor<TPage> | null

export class InfiniteObserver<TPage = any> {
  pages: PageCursor<TPage>[] = []
  isFetching = false
  hasNext = true
  private fetchedCursors = new Set<string>()

  // fetchPage may return a raw API page object; mapPage allows consumer to provide normalization
  constructor(
    private fetchPage: (cursor?: string | number | null) => Promise<any>,
    private mapPage?: MapPageFn<TPage>
  ) {}

  private normalizePage(raw: any, _cursor?: string | number | null): PageCursor<TPage> | null {
    if (!raw) return null
    if (this.mapPage) return this.mapPage(raw, _cursor)

    // If the consumer didn't provide a mapper, be strict and accept only PageCursor-shaped responses
    // Accept either raw as an array (items) or an object with `items` array and optional `nextCursor`
    if (Array.isArray(raw)) return { items: raw as TPage[], nextCursor: undefined }

    if (raw && Array.isArray(raw.items)) {
      // preserve nextCursor if explicitly provided; undefined means unknown
      return { items: raw.items as TPage[], nextCursor: raw.nextCursor }
    }

    // nothing we can do generically without a mapper
    return null
  }

  async fetchNext() {
    if (this.isFetching || !this.hasNext) return
    this.isFetching = true
    try {
      const last = this.pages[this.pages.length - 1]
      const cursor = last ? last.nextCursor : undefined
      const cursorKey = String(cursor ?? '__start__')
      // defensive guard: if we've already fetched this cursor, stop to avoid infinite loops
      if (this.fetchedCursors.has(cursorKey)) {
        this.hasNext = false
        return
      }
      const raw = await this.fetchPage(cursor)
      const page = this.normalizePage(raw)
      if (!page) {
        // The response shape wasn't understood; stop auto-pagination. Consumer should provide mapPage.
        this.hasNext = false
        return
      }
      // mark cursor as fetched
      this.fetchedCursors.add(cursorKey)
      this.pages.push(page)
      // if page.nextCursor is explicitly null => no more pages
      if (page.nextCursor === null) this.hasNext = false
    } finally {
      this.isFetching = false
    }
  }

  reset() {
    this.pages = []
    this.hasNext = true
  }

  getItems(): TPage[] {
    // Use reduce instead of flatMap for Chrome 30+ compatibility
    return this.pages.reduce<TPage[]>((acc, p) => acc.concat(p.items), [])
  }
}
