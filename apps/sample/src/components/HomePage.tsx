import { Button, Row, Screen, Section } from '@smart-tv/ui';
import React, { useState } from 'react';
import { MOVIE } from '../data/movie';

const HomePage: React.FC = () => {
  const [selectedData, setSelectedData] = useState({})

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
        <div className="flex flex-col">
          <div className="text-white text-3xl font-bold">Welcome to the Home Page</div>
          <Row
            forceFocus
            gap={16}
            className="mt-8"
            scrollProps={{ behavior: 'smooth', block: 'nearest', inline: 'end' }}
          >
            {
              MOVIE.map((movie) => (
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
    </Screen>
  );
};

export default HomePage;