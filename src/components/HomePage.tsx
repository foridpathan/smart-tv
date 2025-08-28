import React, { useEffect } from 'react';
import { FocusContext, setFocus, useFocusable } from '../spatial-navigation';

const HomePage: React.FC = () => {
  const { ref, focusKey } = useFocusable({
    focusKey: 'HOME_PAGE',
    trackChildren: true,
    isFocusBoundary: false
  });

  useEffect(() => {
    // Set initial focus to the first navigation item
    const timer = setTimeout(() => {
      setFocus('NAV_HOME');
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref as React.RefObject<HTMLDivElement>} className="tv-container">
        {/* Side Navigation */}
        <SideNavigation />
        
        {/* Main Content Area */}
        <MainContent />
      </div>
    </FocusContext.Provider>
  );
};

// Side Navigation Component
const SideNavigation: React.FC = () => {
  const navigationItems = [
    { id: 'HOME', icon: '🏠', label: 'DevX', isLogo: true },
    { id: 'VIDEO', icon: '📺', label: '' },
    { id: 'APPS', icon: '⚪', label: '' },
    { id: 'TV', icon: '📺', label: '' },
    { id: 'SETTINGS', icon: '⚙️', label: '' }
  ];

  return (
    <nav className="tv-sidebar">
      {navigationItems.map((item) => (
        <NavigationItem 
          key={item.id} 
          item={item}
        />
      ))}
    </nav>
  );
};

// Navigation Item Component
interface NavItem {
  id: string;
  icon: string;
  label: string;
  isLogo?: boolean;
}

interface NavigationItemProps {
  item: NavItem;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ item }) => {
  const { ref, focused } = useFocusable({
    focusKey: `NAV_${item.id}`,
    onEnterPress: () => {
      console.log(`Selected navigation: ${item.id}`);
    }
  });

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`tv-nav-item ${focused ? 'tv-nav-item-focused' : ''} ${item.isLogo ? 'tv-nav-logo' : ''}`}
    >
      <span className="tv-nav-icon">{item.icon}</span>
      {item.label && <span className="tv-nav-label">{item.label}</span>}
    </div>
  );
};

// Main Content Component
const MainContent: React.FC = () => {
  return (
    <main className="tv-main-content">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Plugin Grid */}
      <PluginGrid />
    </main>
  );
};

// Hero Section Component
const HeroSection: React.FC = () => {
  const { ref, focused } = useFocusable({
    focusKey: 'HERO_SECTION',
    onEnterPress: () => {
      console.log('Hero section selected');
    }
  });

  return (
    <section 
      ref={ref as React.RefObject<HTMLElement>}
      className={`tv-hero ${focused ? 'tv-hero-focused' : ''}`}
    >
      <div className="tv-hero-content">
        <div className="tv-hero-logo">
          <span className="tv-logo-text">PETFLIX</span>
        </div>
        <div className="tv-hero-title">
          <h1>Me:</h1>
          <h2>Native Player</h2>
          <p>Plugin for CTV Apps</p>
        </div>
      </div>
      <div className="tv-hero-image">
        {/* Duck image placeholder */}
        <div className="tv-duck-container">
          <div className="tv-duck">🦆</div>
          <div className="tv-duck-title">DUCKDEVIL</div>
        </div>
      </div>
    </section>
  );
};

// Plugin Grid Component
const PluginGrid: React.FC = () => {
  const plugins = [
    { id: 'SAMSUNG', name: 'SAMSUNG', logo: 'https://img.icons8.com/color/48/samsung.png' },
    { id: 'LG', name: 'LG', logo: 'https://img.icons8.com/color/48/lg.png' },
    { id: 'ANDROID_TV', name: 'androidtv', logo: 'https://img.icons8.com/color/48/android-os.png' },
    { id: 'ROKU', name: 'ROKU', logo: 'https://img.icons8.com/color/48/roku.png' }
  ];

  return (
    <section className="tv-plugin-section">
      <h3 className="tv-section-title">Ready-Made Player Plugins</h3>
      <div className="tv-plugin-grid">
        {plugins.map((plugin) => (
          <PluginCard key={plugin.id} plugin={plugin} />
        ))}
      </div>
    </section>
  );
};

// Plugin Card Component
interface Plugin {
  id: string;
  name: string;
  logo: string;
}

interface PluginCardProps {
  plugin: Plugin;
}

const PluginCard: React.FC<PluginCardProps> = ({ plugin }) => {
  const { ref, focused } = useFocusable({
    focusKey: `PLUGIN_${plugin.id}`,
    onEnterPress: () => {
      console.log(`Selected plugin: ${plugin.name}`);
    }
  });

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`tv-plugin-card ${focused ? 'tv-plugin-card-focused' : ''}`}
    >
      <div className="tv-plugin-content">
        <img 
          src={plugin.logo} 
          alt={plugin.name}
          className="tv-plugin-logo"
          onError={(e) => {
            // Fallback for failed image loads
            (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`
              <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#374151"/>
                <text x="50%" y="50%" font-family="Arial" font-size="12" fill="white" text-anchor="middle">${plugin.name}</text>
              </svg>
            `)}`;
          }}
        />
        <span className="tv-plugin-name">{plugin.name}</span>
      </div>
      {plugin.id === 'LG' && (
        <div className="tv-special-badge">
          <span className="tv-badge-text">WhatsApp Web</span>
        </div>
      )}
    </div>
  );
};

export default HomePage;
