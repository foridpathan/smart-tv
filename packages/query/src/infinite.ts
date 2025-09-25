export type PageCursor<TPage = any> = {
  items: TPage[]
  nextCursor?: string | number | null
}

export class InfiniteObserver<TPage = any> {
  pages: PageCursor<TPage>[] = []
  isFetching = false
  hasNext = true

  constructor(private fetchPage: (cursor?: string | number | null) => Promise<PageCursor<TPage>>) {}

  async fetchNext() {
    if (this.isFetching || !this.hasNext) return
    this.isFetching = true
    try {
      const last = this.pages[this.pages.length - 1]
      const cursor = last ? last.nextCursor : undefined
      const page = await this.fetchPage(cursor)
      if (!page) {
        this.hasNext = false
        return
      }
      this.pages.push(page)
      if (!page.nextCursor) this.hasNext = false
    } finally {
      this.isFetching = false
    }
  }

  reset() {
    this.pages = []
    this.hasNext = true
  }

  getItems() {
    return this.pages.flatMap(p => p.items)
  }
}
