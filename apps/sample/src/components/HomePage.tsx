import { Button, Row, Screen, Section } from '@smart-tv/ui';
import React from 'react';
import { MOVIE } from '../data/movie';

const HomePage: React.FC = () => {

  return (
    <Screen className='w-[calc(100vw-100px)]'>
      <Section className=''>
        <div className="text-white text-3xl font-bold">Welcome to the Home Page</div>
        <Row forceFocus gap={16} className="mt-8">
          {
            MOVIE.map((movie) => (
              <Button
                key={`BUTTON_${movie.id}`}
                focusKey={`BUTTON_${movie.id}`}
                className="flex-1 min-w-[200px] rounded-lg text-white border-2 border-transparent hover:border-white/20 transition-all duration-150"
                active='border-white/40'
                // onFocus={(layout) => {
                //   layout.node.scrollIntoView({
                //     behavior: "smooth",
                //     block: "center",
                //     inline: "center", // "start" sometimes causes offset issues
                //   });
                // }}
                >
                <img src={movie.backdrop_path} alt={movie.original_title} className="object-cover rounded-lg" />
              </Button>
            ))
          }

        </Row>
      </Section>
    </Screen>
  );
};

export default HomePage;