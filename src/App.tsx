import { useEffect } from 'react';
import HomePage from './components/HomePage';
import { destroy, init, setKeyMap } from './spatial-navigation';

function App() {
  useEffect(() => {
    // Initialize spatial navigation for Smart TV
    init({
      debug: true, // Set to true for development
      visualDebug: false,
      throttle: 100, // Reduce for better performance on slower TVs
      useGetBoundingClientRect: false, // Better compatibility with old browsers
      shouldFocusDOMNode: false, // Don't use native DOM focus
      rtl: false,
      distanceCalculationMethod: 'corners'
    });

    // Set custom key mapping for different TV remotes
    // These are common key codes for Smart TV remotes
    setKeyMap({
      left: [37, 4, 21], // Arrow left, Samsung left, LG left
      up: [38, 19, 23], // Arrow up, Samsung up, LG up  
      right: [39, 5, 22], // Arrow right, Samsung right, LG right
      down: [40, 20, 24], // Arrow down, Samsung down, LG down
      enter: [13, 23, 66] // Enter, Samsung enter, LG enter
    });

    return () => {
      // Cleanup on unmount
      destroy();
    };
  }, []);

  return (
    <div className="tv-main">
      <HomePage />
    </div>
  );
}

export default App;
