import { tvFetch, useQuery } from '@smart-tv/query';
import { Card, CardContent, CardFooter, Row, Screen, Section } from '@smart-tv/ui';

const Drama = () => {
    const { data } = useQuery(['dramas'], async () => {
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
                <div className="text-white text-5xl font-bold flex items-center justify-center h-full">Dramas Page</div>
                <div>
                    <Row
                        forceFocus
                        gap={16}
                        className="py-6"
                        scrollProps={{ behavior: 'smooth', block: 'nearest', inline: 'end' }}
                        virtualize={{ enabled: true, itemSize: 320, buffer: 2 }}
                    >
                        {data && data?.list && data?.list.length > 0 && data.list.map((drama, i) => (
                            <Card className="w-72 flex-shrink-0 transition-transform duration-200" active='scale-105' key={`DRAMA_${drama.id}-${i}`} focusKey={`DRAMA_${drama.id}-${i}`} payload={drama}>
                                <>
                                    <CardContent>
                                        <img src={"https://assets-prod.services.toffeelive.com/f_webp,w_700,q_85/" + drama?.images?.[0]?.path} alt={drama.title} className="object-cover rounded-lg" />
                                    </CardContent>
                                    <CardFooter className="mt-2 text-white" active='text-yellow-400'>
                                        <h1>{drama.title}</h1>
                                    </CardFooter>
                                </>
                            </Card>
                        ))}
                    </Row>
                </div>
            </Section>
        </Screen>
    );
};

export default Drama;