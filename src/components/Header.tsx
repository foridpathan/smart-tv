import React from 'react';
import { FocusContext, useFocusable } from '../spatial-navigation';

const Header: React.FC = () => {
  const { ref, focusKey } = useFocusable({
    focusKey: 'HEADER',
    trackChildren: true
  });

  return (
    <FocusContext.Provider value={focusKey}>
      <header ref={ref} className="tv-nav">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold text-white">SmartTV App</h1>
          <Navigation />
        </div>
      </header>
    </FocusContext.Provider>
  );
};

const Navigation: React.FC = () => {
  const navItems = [
    { key: 'HOME', label: 'Home' },
    { key: 'MOVIES', label: 'Movies' },
    { key: 'TV_SHOWS', label: 'TV Shows' },
    { key: 'SPORTS', label: 'Sports' },
    { key: 'NEWS', label: 'News' },
    { key: 'SETTINGS', label: 'Settings' }
  ];

  return (
    <nav className="flex space-x-4">
      {navItems.map((item) => (
        <NavItem key={item.key} focusKey={`NAV_${item.key}`} label={item.label} />
      ))}
    </nav>
  );
};

interface NavItemProps {
  focusKey: string;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ focusKey, label }) => {
  const { ref, focused } = useFocusable({
    focusKey,
    onEnterPress: () => {
      console.log(`Navigating to ${label}`);
      // Here you would implement navigation logic
    }
  });

  return (
    <button
      ref={ref}
      className={`tv-nav-item ${focused ? 'tv-nav-item-focused' : ''}`}
    >
      {label}
    </button>
  );
};

export default Header;
