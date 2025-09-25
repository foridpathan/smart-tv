import { tvFetch, useQuery } from '@smart-tv/query';
import { Button, Grid, Screen, Section } from '@smart-tv/ui';

const Movies = () => {
    const { data } = useQuery(['movies'], async () => {
        // simulate network delay
        const res = await tvFetch('https://content-prod.services.toffeelive.com/toffee/bn/dhk/smart-tv/rail/generic/editorial-dynamic/48d7456f06d4db0ea467fd6b1da362e0').then(r => r.json())
        return res;
    }, {
        refetchOnWindowFocus: true,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    return (
        <Screen>
            <Section>
                <div className="text-white text-5xl font-bold flex items-center justify-center h-full">Movies Page</div>
                <div >
                    <Grid
                        columns={4}
                        virtualize={{ enabled: true, itemSize: 320, buffer: 2, debug: true, preserveFocus: true }}
                        forceFocus
                    >
                        {
                            data && data?.list && data?.list.length > 0 && data.list.map((movie, i) => (
                                <Button
                                    key={`GRID_1${movie.id}-${i}`}
                                    focusKey={`GRID_1${movie.id}-${i}`}
                                    className="flex-1 rounded-lg text-white border-2 border-transparent hover:border-white/20 transition-all duration-150"
                                    active='border-white/40'
                                    payload={movie}
                                >
                                    <img src={"https://assets-prod.services.toffeelive.com/f_webp,w_700,q_85/" + movie?.images?.[0]?.path} alt={movie.title} className="object-cover rounded-lg" />
                                </Button>
                            ))
                        }
                    </Grid>
                </div>
            </Section>
        </Screen>
    );
};

export default Movies;