import React from 'react';
import { FocusContext, useFocusable } from '../spatial-navigation';

interface ContentItem {
  id: string;
  title: string;
  image: string;
  year: number;
  rating: string;
  genre: string;
}

interface ContentSectionProps {
  title: string;
  focusKey: string;
  items: ContentItem[];
}

const ContentSection: React.FC<ContentSectionProps> = ({ title, focusKey, items }) => {
  const { ref, focusKey: sectionFocusKey } = useFocusable({
    focusKey,
    trackChildren: true
  });

  return (
    <FocusContext.Provider value={sectionFocusKey}>
      <section ref={ref} className="tv-section">
        <h2 className="tv-title">{title}</h2>
        <div className="tv-grid tv-grid-4">
          {items.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </FocusContext.Provider>
  );
};

interface ContentCardProps {
  item: ContentItem;
}

const ContentCard: React.FC<ContentCardProps> = ({ item }) => {
  const { ref, focused } = useFocusable({
    focusKey: `CARD_${item.id}`,
    onEnterPress: () => {
      console.log(`Selected: ${item.title}`);
      // Here you would implement content selection logic
    }
  });

  return (
    <div
      ref={ref}
      className={`tv-card ${focused ? 'tv-card-focused' : ''}`}
    >
      <div className="tv-poster-container">
        <img
          src={item.image}
          alt={item.title}
          className="tv-poster"
          loading="lazy"
          onError={(e) => {
            // Fallback for failed image loads
            (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`
              <svg width="300" height="450" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#374151"/>
                <text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" text-anchor="middle">${item.title}</text>
              </svg>
            `)}`;
          }}
        />
      </div>
      <div className="mt-3">
        <h3 className="font-semibold text-white truncate">{item.title}</h3>
        <div className="flex justify-between items-center mt-1">
          <span className="text-gray-400 text-sm">{item.year}</span>
          <span className="text-yellow-400 text-sm">★ {item.rating}</span>
        </div>
        <p className="text-gray-500 text-xs mt-1">{item.genre}</p>
      </div>
    </div>
  );
};

export default ContentSection;
