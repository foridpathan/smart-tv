# Smart TV App

A fast, optimized Smart TV application built with React, Tailwind CSS, and Vite, featuring custom spatial navigation for TV remotes. Specifically designed for compatibility with older Smart TV browsers including Tizen and WebOS with Chromium 48+.

## 🚀 Features

- **Spatial Navigation**: Custom implementation of the Norigin Spatial Navigation library for seamless remote control navigation
- **TV-Optimized UI**: Beautiful, responsive design optimized for large TV screens
- **Old Browser Support**: Compatible with older Chromium versions (48+) found in Smart TVs
- **Performance Optimized**: Fast loading and smooth animations for older TV hardware
- **Remote Control Support**: Supports various Smart TV remote controls (Samsung, LG, etc.)
- **Accessible**: Built with accessibility in mind for screen readers and assistive technologies

## 📱 Supported Platforms

- **Samsung Tizen TVs** (2016+)
- **LG WebOS TVs** (2016+)  
- **Hisense Vidaa TVs**
- **Android TV**
- **Browser-based Set-top Boxes**
- **Any device with Chromium 48+ browser**

## 🛠 Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool optimized for TV compatibility
- **Custom Spatial Navigation** - Based on Norigin Spatial Navigation
- **PNPM** - Package manager

## 🏗 Project Structure

```
src/
├── spatial-navigation/          # Custom spatial navigation implementation
│   ├── SpatialNavigation.ts    # Core navigation logic
│   ├── useFocusable.ts         # React hook for focusable components
│   ├── useFocusContext.ts      # Context provider for focus management
│   ├── types.ts                # TypeScript definitions
│   └── index.ts                # Main exports
├── components/                  # React components
│   ├── HomePage.tsx            # Main homepage component
│   ├── Header.tsx              # Navigation header
│   ├── ContentSection.tsx      # Content grid sections
│   └── FeaturedSection.tsx     # Featured content hero
├── App.tsx                     # Main app component
├── main.tsx                    # Entry point with polyfills
└── index.css                   # Global styles and TV optimizations
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- PNPM (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-tv-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Access the app**
   - Local: http://localhost:3000/
   - Network: http://[your-ip]:3000/ (accessible from TV)

### Build for Production

```bash
pnpm build
```

The build is optimized for older browsers with:
- ES5 compilation target
- CSS targeting Chrome 48+
- Polyfills for missing features
- Minified and optimized bundles

## 🎮 Navigation

### Remote Control Support

The app supports standard TV remote controls:

- **Arrow Keys**: Navigate between focusable elements
- **Enter/OK**: Select focused element
- **Back**: Return to previous screen (when implemented)

### Supported Key Codes

- **Left**: 37, 4, 21 (Standard, Samsung, LG)
- **Up**: 38, 19, 23
- **Right**: 39, 5, 22  
- **Down**: 40, 20, 24
- **Enter**: 13, 23, 66

### Custom Remote Configuration

You can customize key mappings for specific TV models:

```typescript
import { setKeyMap } from './spatial-navigation';

setKeyMap({
  left: [37, 4, 21],    // Add your custom key codes
  up: [38, 19, 23],
  right: [39, 5, 22],
  down: [40, 20, 24],
  enter: [13, 23, 66]
});
```

## 🎨 Styling

### TV-Optimized Classes

The app includes custom Tailwind classes optimized for TV interfaces:

- `tv-focus` - Focus state styling with glow effects
- `tv-focusable` - Base focusable element styling
- `tv-card` - Content card styling
- `tv-button` - Button styling with focus states
- `tv-grid-*` - Responsive grid layouts for different screen sizes

### Focus Management

```typescript
import { useFocusable, FocusContext } from './spatial-navigation';

const MyComponent = () => {
  const { ref, focused, focusSelf } = useFocusable({
    focusKey: 'MY_COMPONENT',
    onEnterPress: () => {
      console.log('Component selected!');
    }
  });

  return (
    <div 
      ref={ref} 
      className={`tv-focusable ${focused ? 'tv-focus' : ''}`}
    >
      My Focusable Component
    </div>
  );
};
```

## 🔧 Configuration

### Spatial Navigation Config

```typescript
init({
  debug: false,                    // Enable console logging
  visualDebug: false,             // Show visual focus indicators
  throttle: 100,                  // Key repeat throttling (ms)
  useGetBoundingClientRect: false, // Use offset vs getBoundingClientRect
  shouldFocusDOMNode: false,      // Focus DOM elements
  rtl: false,                     // Right-to-left language support
  distanceCalculationMethod: 'corners' // Focus calculation method
});
```

## 📱 TV-Specific Optimizations

### Performance

- **ES5 target**: Compatible with older JavaScript engines
- **Minimal dependencies**: Reduced bundle size
- **Optimized images**: Lazy loading and fallbacks
- **Smooth animations**: Hardware-accelerated CSS transitions

### UX/UI

- **Large touch targets**: Minimum 44px for easy navigation
- **High contrast**: Visible focus indicators
- **Safe areas**: TV-safe padding to prevent overscan issues
- **Responsive grids**: Adapt to different TV resolutions

### Browser Compatibility

- **Promise polyfill**: For very old browsers
- **Array methods**: Polyfills for missing array methods
- **CSS fallbacks**: Graceful degradation for unsupported properties

## 🧪 Testing on Smart TVs

### Testing Locally

1. **Connect TV to same network**
2. **Access via network URL**: http://[your-ip]:3000/
3. **Use TV remote** to navigate

### TV Simulator

For development, you can use browser developer tools:

1. Open DevTools (F12)
2. Use Device Mode to simulate TV resolution (1920x1080)
3. Use keyboard arrow keys to simulate remote control

### Common TV Resolutions

- **HD**: 1366x768
- **Full HD**: 1920x1080  
- **4K**: 3840x2160

## 🐛 Troubleshooting

### Common Issues

**Navigation not working:**
- Check if spatial navigation is initialized
- Verify key codes match your TV remote
- Ensure components are properly focused

**Styling issues:**
- Check TV safe area margins
- Verify CSS compatibility with target browser
- Test focus indicators visibility

**Performance issues:**
- Reduce animation complexity
- Optimize images and assets
- Check for memory leaks in navigation

## 📚 Spatial Navigation API

### Core Functions

- `init(config)` - Initialize spatial navigation
- `setFocus(focusKey)` - Manually set focus
- `setKeyMap(keyMap)` - Configure remote key codes
- `destroy()` - Cleanup spatial navigation

### React Hooks

- `useFocusable(config)` - Make component focusable
- Context: `FocusContext` - Provide focus context to children

### Component Props

```typescript
interface UseFocusableConfig {
  focusKey?: string;
  focusable?: boolean;
  trackChildren?: boolean;
  isFocusBoundary?: boolean;
  onEnterPress?: () => void;
  onArrowPress?: (direction: string) => boolean;
  onFocus?: (layout, extraProps, details) => void;
  onBlur?: (layout, extraProps, details) => void;
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple TV platforms
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- [Norigin Spatial Navigation](https://github.com/NoriginMedia/Norigin-Spatial-Navigation) - Original spatial navigation library
- [React](https://reactjs.org/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Vite](https://vitejs.dev/) - Build tool

---

Built with ❤️ for Smart TV developers
