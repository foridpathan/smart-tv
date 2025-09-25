import { Button, Grid, Screen, Section } from '@smart-tv/ui';
import { MOVIE } from '../data/movie';

const Movies = () => {
    const EXTENT_MOVIE =[...MOVIE, ...MOVIE, ...MOVIE, ...MOVIE, ...MOVIE, ...MOVIE, ...MOVIE];
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
                            EXTENT_MOVIE.map((movie, i) => (
                                <Button
                                    key={`GRID_1${movie.id}-${i}`}
                                    focusKey={`GRID_1${movie.id}-${i}`}
                                    className="flex-1 rounded-lg text-white border-2 border-transparent hover:border-white/20 transition-all duration-150"
                                    active='border-white/40'
                                    payload={movie}
                                >
                                    <img src={movie.backdrop_path} alt={movie.original_title} className="object-cover rounded-lg" />
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