import { tvFetch, useInfiniteQuery } from '@smart-tv/query';
import { Button, Row, Screen, Section } from '@smart-tv/ui';
import React, { useCallback, useState } from 'react';
import { MOVIE } from '../data/movie';

const HomePage: React.FC = () => {
  const [selectedData, setSelectedData] = useState({})
  // pagination is driven by the API cursor and the hook; avoid local page state to prevent races
  const ref = React.useRef(null);
  const pageRef = React.useRef<number>(1)
  const totalRef = React.useRef<number | undefined>(undefined)
  const perPageRef = React.useRef<number | undefined>(undefined)

  // example adapter for jsonfakery-style pagination
  const jsonFakeryMapPage = useCallback((raw: any, cursor?: string | number | null) => {
    // map raw API response to { items, nextCursor }
    // cursor is the page number passed in the fetch URL (or undefined for first page)
    if (!raw) return null
    const items = raw.data ?? raw.list ?? raw.items ?? raw.results ?? []

  const total = typeof raw.total === 'number' ? raw.total : undefined
  const currentPage = pageRef.current
  // determine per-page count (fix from first page to avoid variance)
  const detectedPerPage = raw.per_page ?? raw.page_size ?? raw.limit ?? (items.length || 0)
  if (!perPageRef.current) perPageRef.current = detectedPerPage
  const perPage = perPageRef.current ?? detectedPerPage

  // consumed items across pages up to current
  const consumed = ((currentPage - 1) * perPage) + items.length

    let nextPage: number | null = null
    if (typeof total === 'number') {
      totalRef.current = total
      nextPage = consumed < total ? currentPage + 1 : null
    } else {
      // if total unknown, assume there is another page only if we got full page of items
      nextPage = items.length === perPage && perPage > 0 ? currentPage + 1 : null
    }

    // update pageRef for diagnostics (no re-render)
    pageRef.current = nextPage

    return { items, nextCursor: nextPage }
  }, [])
  
  const getHasNext = useCallback((pages: any[]) => {
    const last = pages[pages.length - 1]
    if (!last) return true
    // explicit null means no more pages
    if (last.nextCursor === null) return false
    // undefined means unknown; allow one more fetch
    if (last.nextCursor === undefined) return true
    return true
  }, [])

  const { data, isFetching, fetchNext, hasNextPage } = useInfiniteQuery(['movies-infinite'], async (cursor) => {
    const url = 'https://content-prod.services.toffeelive.com/toffee/bn/dhk/smart-tv/rail/generic/editorial-dynamic/48d7456f06d4db0ea467fd6b1da362e0?page=' + (cursor ?? 1)
    const res = await tvFetch(url).then(r => r.json())
    return res
  }, { mapPage: jsonFakeryMapPage, getHasNext })

  if (isFetching && (!data || data.length === 0)) {
    return (
      <Screen>
        <Section className="flex items-center justify-center h-full">
          <div className="text-white text-3xl font-bold">Loading...</div>
        </Section>
      </Screen>
    )
  }

  return (
    <Screen>
      <Section
        viewOnly
        className={`h-[calc(100vh-150px)] flex items-center justify-center relative bg-cover bg-center`}
        style={{ backgroundImage: `url(${(selectedData as any).backdrop_path})` }}
      >
        <div className="flex flex-col">
          <div className="text-white text-5xl font-bold">Selected Movie</div>
          <div className="text-white text-2xl mt-4">{(selectedData as any).original_title}</div>
          <div className="text-white text-lg mt-2 max-w-2xl text-center">{(selectedData as any).overview}</div>
        </div>
      </Section>
      <Section className='h-[240px] overflow-hidden -mt-24 relative z-10'>
        <div className="flex flex-col" ref={ref}>
          <div className="text-white text-3xl font-bold">Welcome to the Home Page</div>
          <Row
            forceFocus
            gap={16}
            className=""
            scrollProps={{ behavior: 'smooth', block: 'nearest', inline: 'end' }}
            virtualize={{ enabled: true, itemSize: 320, buffer: 2 }}
            ref={ref}
            infinite={{
              fetchNext: async () => {
                if (hasNextPage && !isFetching) await fetchNext()
              },
              hasNext: (data && data.length > 0) ? (typeof totalRef.current === 'number' ? data.length < totalRef.current : hasNextPage) : hasNextPage,
            }}>
            {
              data && data.length > 0 && (data as any[]).map((movie: any) => (
                <Button
                  key={`BUTTON_1${movie.id}`}
                  focusKey={`BUTTON_1${movie.id}`}
                  className="flex-1 min-w-[300px] rounded-lg text-white border-2 border-transparent hover:border-white/20 transition-all duration-150"
                  active='border-white/40'
                  onFocus={(layout, data, p) => {
                    setSelectedData(data)
                  }}
                  onEnterPress={(data) => setSelectedData(data)}
                  payload={movie}
                >
                  <img src={"https://assets-prod.services.toffeelive.com/f_webp,w_700,q_85/" + movie?.images?.[0]?.path} alt={movie.title} className="object-cover rounded-lg" />
                </Button>
              ))
            }
          </Row>
        </div>
        <div className="flex flex-col">
          <div className="text-white text-3xl font-bold">Welcome to the Home Page</div>
          <Row
            gap={16}
            className="mt-8"
            scrollProps={{ behavior: 'smooth', block: 'nearest', inline: 'end' }}
            virtualize={{ enabled: true, itemSize: 320, buffer: 2 }}
          >
            {
              MOVIE.map((movie) => (
                <Button
                  key={`BUTTON_2${movie.id}`}
                  focusKey={`BUTTON_2${movie.id}`}
                  className="flex-1 min-w-[300px] rounded-lg text-white border-2 border-transparent hover:border-white/20 transition-all duration-150"
                  active='border-white/40'
                  onFocus={(layout, data, p) => {
                    setSelectedData(data)
                  }}
                  onEnterPress={(data) => setSelectedData(data)}
                  payload={movie}
                >
                  <img src={movie.backdrop_path} alt={movie.original_title} className="object-cover rounded-lg" />
                </Button>
              ))
            }
          </Row>
        </div>
        <div className="flex flex-col">
          <div className="text-white text-3xl font-bold">Welcome to the Home Page</div>
          <Row
            gap={16}
            className="mt-8"
            scrollProps={{ behavior: 'smooth', block: 'nearest', inline: 'end' }}
            virtualize={{ enabled: true, itemSize: 320, buffer: 2 }}
          >
            {
              MOVIE.map((movie) => (
                <Button
                  key={`BUTTON_3${movie.id}`}
                  focusKey={`BUTTON_3${movie.id}`}
                  className="flex-1 min-w-[300px] rounded-lg text-white border-2 border-transparent hover:border-white/20 transition-all duration-150"
                  active='border-white/40'
                  onFocus={(layout, data, p) => {
                    setSelectedData(data)
                  }}
                  onEnterPress={(data) => setSelectedData(data)}
                  payload={movie}
                >
                  <img src={movie.backdrop_path} alt={movie.original_title} className="object-cover rounded-lg" />
                </Button>
              ))
            }
          </Row>
        </div>
      </Section>
    </Screen >
  );
};

export default HomePage;