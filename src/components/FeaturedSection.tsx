import React from 'react';
import { useFocusable } from '../spatial-navigation';

const FeaturedSection: React.FC = () => {
  const { ref, focused } = useFocusable({
    focusKey: 'FEATURED_CONTENT',
    onEnterPress: () => {
      console.log('Playing featured content');
      // Here you would implement play logic
    }
  });

  return (
    <section className="tv-section">
      <div
        ref={ref}
        className={`relative bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-8 mb-8 overflow-hidden ${
          focused ? 'tv-focus' : ''
        }`}
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url("https://via.placeholder.com/1920x1080/1e40af/ffffff?text=Featured+Content")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '400px'
        }}
      >
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-5xl font-bold text-white mb-4">
            Amazing Adventure
          </h1>
          <p className="text-xl text-gray-200 mb-6 leading-relaxed">
            Join our heroes on an incredible journey through uncharted territories. 
            Experience breathtaking visuals and heart-pounding action in this 
            critically acclaimed masterpiece.
          </p>
          <div className="flex items-center space-x-6 mb-6">
            <span className="bg-yellow-500 text-black px-3 py-1 rounded font-bold">
              ★ 8.9
            </span>
            <span className="text-gray-300">2024</span>
            <span className="text-gray-300">2h 30m</span>
            <span className="text-gray-300">Action, Adventure</span>
          </div>
          <div className="flex space-x-4">
            <PlayButton />
            <InfoButton />
          </div>
        </div>
      </div>
    </section>
  );
};

const PlayButton: React.FC = () => {
  const { ref, focused } = useFocusable({
    focusKey: 'FEATURED_PLAY',
    onEnterPress: () => {
      console.log('Playing featured content');
    }
  });

  return (
    <button
      ref={ref}
      className={`flex items-center space-x-2 bg-white text-black px-8 py-3 rounded-lg font-bold text-lg tv-focusable ${
        focused ? 'tv-focus' : ''
      }`}
    >
      <PlayIcon />
      <span>Play</span>
    </button>
  );
};

const InfoButton: React.FC = () => {
  const { ref, focused } = useFocusable({
    focusKey: 'FEATURED_INFO',
    onEnterPress: () => {
      console.log('Showing more info');
    }
  });

  return (
    <button
      ref={ref}
      className={`flex items-center space-x-2 bg-gray-600 bg-opacity-70 text-white px-8 py-3 rounded-lg font-bold text-lg tv-focusable ${
        focused ? 'tv-focus' : ''
      }`}
    >
      <InfoIcon />
      <span>More Info</span>
    </button>
  );
};

const PlayIcon: React.FC = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

const InfoIcon: React.FC = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);

export default FeaturedSection;
