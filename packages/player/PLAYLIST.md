# Smart TV Player - Playlist Feature

A flexible, YouTube-style playlist system for the Smart TV Player with multiple content rails, dynamic loading, focus navigation, **DRM support**, and **auto-play functionality**.

## Features

✨ **Multiple Rail Types**
- Queue (up next videos)
- Related content
- Recommendations
- Watch history
- Custom playlists

🎯 **Smart Navigation**
- TV remote-friendly focus navigation
- Keyboard shortcuts
- Touch/mouse support

📱 **Responsive Design**
- Adapts to different screen sizes
- Configurable layouts
- Accessible design

🔄 **Dynamic Content**
- Lazy loading support
- Real-time updates
- Progress tracking

🔐 **DRM Protection**
- Widevine support
- PlayReady support
- ClearKey support
- Per-item DRM configuration
- Global DRM fallback
- DRM error handling

▶️ **Auto-Play Features**
- Configurable countdown timer
- Next video preview
- Auto-play cancellation
- Custom navigation logic
- Seamless transitions

⚡ **Performance Optimized**
- React.memo for components
- Context splitting to prevent re-renders
- Efficient state management
- Content preloading

## Basic Usage

### 1. Simple Playlist Integration

```tsx
import React from 'react';
import { 
  VideoPlayer, 
  PlayerControls, 
  PlaylistProvider,
  type PlaylistState 
} from '@smart-tv/player';

const MyVideoPlayer = () => {
  const playlistState: PlaylistState = {
    currentItemId: 'video-1',
    rails: [
      {
        id: 'queue',
        title: 'Up Next',
        type: 'queue',
        items: [
          {
            id: 'video-1',
            title: 'Next Video',
            description: 'This video will play next',
            thumbnail: '/thumbnails/video1.jpg',
            duration: 1800, // 30 minutes
            url: '/videos/video1.mp4',
            type: 'video'
          }
        ]
      }
    ],
    isVisible: false,
    expandedRails: [],
    activeRail: 'queue'
  };

  return (
    <PlaylistProvider initialState={playlistState}>
      <VideoPlayer src="/current-video.mp4">
        <PlayerControls 
          playlist={{
            state: playlistState,
            config: { showThumbnails: true },
            callbacks: {
              onItemPlay: (item) => {
                console.log('Playing:', item.title);
                // Handle video change
              }
            }
          }}
        />
      </VideoPlayer>
    </PlaylistProvider>
  );
};
```

### 2. Advanced Configuration

```tsx
import React, { useState } from 'react';
import { 
  PlaylistProvider,
  usePlaylistActions,
  type PlaylistConfig,
  type PlaylistCallbacks
} from '@smart-tv/player';

// Comprehensive playlist configuration
const playlistConfig: PlaylistConfig = {
  showThumbnails: true,      // Show video thumbnails
  showDuration: true,        // Show video duration
  showProgress: true,        // Show watch progress
  maxRailHeight: 400,        // Max height for scrollable rails
  itemsPerRow: 1,           // Items per row (single column for TV)
  autoPlay: true,           // Auto-play next video
  loop: false,              // Loop playlist
  shuffle: false,           // Shuffle playback
  saveHistory: true         // Save watch history
};

// Playlist event callbacks
const playlistCallbacks: PlaylistCallbacks = {
  onItemSelect: (item) => {
    console.log('Item selected:', item.title);
  },
  
  onItemPlay: (item) => {
    console.log('Playing:', item.title);
    // Update video source
    setCurrentVideo(item.url);
    // Update analytics
    trackVideoPlay(item.id);
  },
  
  onRailExpand: (railId) => {
    console.log('Rail expanded:', railId);
    // Load more content if needed
  },
  
  onLoadMore: async (railId) => {
    // Fetch more content from API
    const response = await fetch(`/api/playlist/${railId}/more`);
    const newItems = await response.json();
    return newItems;
  }
};

const AdvancedPlaylistExample = () => {
  const [currentVideo, setCurrentVideo] = useState('/default.mp4');

  return (
    <PlaylistProvider config={playlistConfig} callbacks={playlistCallbacks}>
      <VideoPlayer src={currentVideo}>
        <PlayerControls showPlaylist={true} />
      </VideoPlayer>
    </PlaylistProvider>
  );
};
```

## Rail Types

### Queue Rail
```tsx
const queueRail: PlaylistRail = {
  id: 'queue',
  title: 'Up Next',
  type: 'queue',
  priority: 1,           // High priority (shows first)
  isCollapsible: false,  // Always visible
  items: [
    {
      id: 'next-1',
      title: 'Next Video',
      url: '/videos/next.mp4',
      duration: 1800,
      isActive: true      // Currently playing
    }
  ]
};
```

### Related Content Rail
```tsx
const relatedRail: PlaylistRail = {
  id: 'related',
  title: 'Related Videos',
  type: 'related',
  priority: 2,
  isCollapsible: true,
  maxVisible: 4,         // Show 4 items, expand for more
  items: [
    {
      id: 'related-1',
      title: 'Similar Content',
      description: 'Related to current video',
      thumbnail: '/thumbs/related.jpg',
      duration: 2400,
      url: '/videos/related.mp4',
      type: 'video'
    }
  ]
};
```

### Recommendations Rail
```tsx
const recommendationsRail: PlaylistRail = {
  id: 'recommendations',
  title: 'Recommended for You',
  type: 'recommendations',
  priority: 3,
  isCollapsible: true,
  maxVisible: 6,
  items: [
    {
      id: 'rec-1',
      title: 'Personalized Recommendation',
      description: 'Based on your viewing history',
      thumbnail: '/thumbs/recommendation.jpg',
      duration: 3600,
      url: '/videos/recommendation.mp4',
      type: 'video',
      metadata: {
        confidence: 0.9,
        reason: 'Similar to previously watched content'
      }
    }
  ]
};
```

### History Rail
```tsx
const historyRail: PlaylistRail = {
  id: 'history',
  title: 'Continue Watching',
  type: 'history',
  priority: 4,
  isCollapsible: true,
  items: [
    {
      id: 'history-1',
      title: 'Previously Watched',
      description: 'Resume where you left off',
      thumbnail: '/thumbs/history.jpg',
      duration: 2700,
      url: '/videos/history.mp4',
      type: 'video',
      progress: 45,      // 45% watched
      metadata: {
        lastWatched: '2024-01-15T10:30:00Z',
        device: 'smart-tv'
      }
    }
  ]
};
```

## Programmatic Control

### Adding Content Dynamically

```tsx
import { usePlaylistActions } from '@smart-tv/player';

const PlaylistManager = () => {
  const { addRail, addItem, setCurrentItem, removeItem } = usePlaylistActions();

  const handleAddToQueue = (videoData) => {
    const newItem: PlaylistItem = {
      id: `queue-${Date.now()}`,
      title: videoData.title,
      description: videoData.description,
      thumbnail: videoData.thumbnail,
      duration: videoData.duration,
      url: videoData.url,
      type: 'video'
    };

    addItem('queue', newItem);
  };

  const handleCreateCustomPlaylist = (name: string) => {
    const customRail: PlaylistRail = {
      id: `custom-${Date.now()}`,
      title: name,
      type: 'custom',
      priority: 0,
      isCollapsible: true,
      items: []
    };

    addRail(customRail);
  };

  const handlePlayNext = (itemId: string) => {
    setCurrentItem(itemId);
  };

  return (
    <div className="playlist-controls">
      <button onClick={() => handleAddToQueue(selectedVideo)}>
        Add to Queue
      </button>
      <button onClick={() => handleCreateCustomPlaylist('My Playlist')}>
        Create Playlist
      </button>
      <button onClick={() => handlePlayNext('video-123')}>
        Play Next
      </button>
    </div>
  );
};
```

### Reading Playlist State

```tsx
import { usePlaylistState, usePlaylistHelpers } from '@smart-tv/player';

const PlaylistInfo = () => {
  const state = usePlaylistState();
  const { getCurrentItem, getActiveRail } = usePlaylistHelpers();

  const currentItem = getCurrentItem();
  const activeRail = getActiveRail();
  const totalItems = state.rails.reduce((sum, rail) => sum + rail.items.length, 0);

  return (
    <div className="playlist-info">
      <p>Currently Playing: {currentItem?.title}</p>
      <p>Active Rail: {activeRail?.title}</p>
      <p>Total Items: {totalItems}</p>
      <p>Playlist Visible: {state.isVisible ? 'Yes' : 'No'}</p>
    </div>
  );
};
```

## Styling & Customization

### CSS Classes
The playlist components use CSS classes with the `player-` prefix:

```css
/* Playlist container */
.playlist-container {
  /* Custom styles */
}

/* Rail headers */
.playlist-rail-header {
  /* Rail title styling */
}

/* Playlist items */
.playlist-item {
  /* Item container */
}

.playlist-item-thumbnail {
  /* Thumbnail styling */
}

.playlist-item-title {
  /* Title styling */
}

.playlist-item-description {
  /* Description styling */
}

/* Focus states for TV navigation */
.playlist-item:focus {
  /* Focused item styling */
}
```

### Custom Styling Example

```tsx
const StyledPlaylist = () => {
  return (
    <PlayerControls
      className="custom-player-controls"
      playlist={{
        state: playlistState,
        config: {
          ...playlistConfig,
          itemsPerRow: 2,  // Two columns
          maxRailHeight: 300
        }
      }}
    />
  );
};
```

## Focus Navigation

The playlist is fully navigable with TV remote controls:

- **Arrow Keys**: Navigate between items
- **Enter**: Play selected item
- **Escape**: Close playlist
- **Tab**: Navigate between rails and controls

### Custom Focus Keys

```tsx
<PlayerControls
  focusKey="main-player"
  playlist={{
    state: playlistState,
    callbacks: {
      onItemSelect: (item) => {
        // Handle focus events
        announceToScreenReader(`Selected: ${item.title}`);
      }
    }
  }}
/>
```

## Performance Tips

1. **Lazy Loading**: Use `onLoadMore` for large playlists
2. **Virtualization**: Consider virtual scrolling for very long lists
3. **Memoization**: Components are already memoized, but ensure callback stability
4. **Image Optimization**: Use optimized thumbnails
5. **Debouncing**: Debounce search and filter operations

```tsx
const optimizedCallbacks = useMemo(() => ({
  onItemPlay: useCallback((item) => {
    // Stable callback reference
    handleVideoChange(item);
  }, [handleVideoChange]),
  
  onLoadMore: useCallback(async (railId) => {
    // Debounced loading
    return await debouncedLoadMore(railId);
  }, [debouncedLoadMore])
}), [handleVideoChange, debouncedLoadMore]);
```

## API Reference

### Types

```typescript
interface PlaylistItem {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  url: string;
  type?: 'video' | 'audio';
  metadata?: Record<string, any>;
  isActive?: boolean;
  progress?: number; // 0-100
}

interface PlaylistRail {
  id: string;
  title: string;
  type: 'queue' | 'related' | 'recommendations' | 'history' | 'custom';
  items: PlaylistItem[];
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  maxVisible?: number;
  priority?: number;
}

interface PlaylistState {
  currentItemId?: string;
  rails: PlaylistRail[];
  isVisible: boolean;
  expandedRails: string[];
  activeRail?: string;
}

interface PlaylistConfig {
  showThumbnails?: boolean;
  showDuration?: boolean;
  showProgress?: boolean;
  maxRailHeight?: number;
  itemsPerRow?: number;
  autoPlay?: boolean;
  loop?: boolean;
  shuffle?: boolean;
  saveHistory?: boolean;
}
```

### Hooks

- `usePlaylist()`: Complete playlist context
- `usePlaylistState()`: Read-only state access
- `usePlaylistActions()`: State modification functions
- `usePlaylistHelpers()`: Utility functions

This playlist system provides a complete, flexible solution for organizing and displaying video content in a YouTube-style interface, optimized for smart TV navigation and performance.

## DRM Protection

### Per-Item DRM Configuration

```tsx
const drmProtectedItem: PlaylistItem = {
  id: 'premium-movie',
  title: 'Premium Movie',
  url: 'https://cdn.example.com/premium-movie.mp4',
  drm: {
    servers: {
      'com.widevine.alpha': 'https://widevine-license-server.com/license',
      'com.microsoft.playready': 'https://playready-license-server.com/license',
      'org.w3.clearkey': 'https://clearkey-license-server.com/license'
    },
    advanced: {
      'com.widevine.alpha': {
        headers: {
          'Authorization': 'Bearer your-token',
          'X-Custom-Header': 'custom-value'
        }
      }
    },
    clearKeys: {
      '0123456789abcdef': 'fedcba9876543210'
    }
  }
};
```

### Global DRM Configuration

```tsx
const playlistConfig: PlaylistConfig = {
  globalDrm: {
    servers: {
      'com.widevine.alpha': 'https://default-widevine-server.com/license'
    },
    advanced: {
      'com.widevine.alpha': {
        headers: {
          'Authorization': 'Bearer default-token'
        }
      }
    }
  },
  drmFallback: true, // Try without DRM if DRM fails
  // ... other config
};
```

### DRM Error Handling

```tsx
const playlistCallbacks: PlaylistCallbacks = {
  onDrmError: (item, error) => {
    console.error('DRM error:', error);
    
    // Show user-friendly error message
    showErrorMessage('Content protection error. Please try again.');
    
    // Try fallback strategy
    if (playlistConfig.drmFallback) {
      // Attempt to play without DRM
      playWithoutDrm(item);
    } else {
      // Skip to next item
      playNext();
    }
  }
};
```

## Auto-Play Configuration

### Basic Auto-Play Setup

```tsx
const playlistConfig: PlaylistConfig = {
  autoPlay: true,
  autoPlayDelay: 10, // 10 seconds countdown
  autoPlayCountdown: true, // Show countdown UI
  preloadNext: true, // Preload next item
  preloadCount: 2, // Preload 2 items ahead
};
```

### Advanced Auto-Play Callbacks

```tsx
const playlistCallbacks: PlaylistCallbacks = {
  onItemEnd: (item) => {
    console.log('Video ended:', item.title);
    // Auto-play logic will trigger here
  },
  
  onAutoPlayStart: (nextItem, countdown) => {
    // Show custom countdown UI
    showAutoPlayNotification(nextItem, countdown);
  },
  
  onAutoPlayCancel: (nextItem) => {
    // User cancelled auto-play
    hideAutoPlayNotification();
  },
  
  // Custom navigation logic
  onGetNextItem: (currentItemId) => {
    // Implement custom logic for determining next item
    // e.g., based on user preferences, content ratings, etc.
    return getPersonalizedNextItem(currentItemId);
  }
};
```

### Auto-Play UI Component

The `AutoPlayCountdown` component provides a YouTube-style countdown experience:

```tsx
import { AutoPlayCountdown } from '@smart-tv/player';

// The component is automatically shown when auto-play is triggered
// You can also use it independently:

<AutoPlayCountdown
  nextItem={nextItem}
  countdown={10}
  onCancel={() => console.log('Auto-play cancelled')}
  onConfirm={() => console.log('Playing next item')}
  focusKey="custom-autoplay"
/>
```

## Quality Management

### Multiple Quality Levels

```tsx
const videoWithQualities: PlaylistItem = {
  id: 'multi-quality-video',
  title: 'Multi-Quality Video',
  url: 'https://example.com/video-auto.m3u8', // Master playlist
  qualities: [
    {
      url: 'https://example.com/video-4k.mp4',
      label: '4K',
      width: 3840,
      height: 2160,
      bandwidth: 25000000
    },
    {
      url: 'https://example.com/video-1080p.mp4',
      label: '1080p',
      width: 1920,
      height: 1080,
      bandwidth: 5000000
    },
    {
      url: 'https://example.com/video-720p.mp4',
      label: '720p',
      width: 1280,
      height: 720,
      bandwidth: 2500000
    }
  ]
};
```

### Quality Selection

```tsx
const playlistConfig: PlaylistConfig = {
  preferredQuality: 'auto', // 'auto', 'highest', 'lowest', or specific label
  adaptiveStreaming: true, // Enable adaptive bitrate streaming
};

const playlistCallbacks: PlaylistCallbacks = {
  onQualityChange: (item, quality) => {
    console.log(`Quality changed to ${quality} for "${item.title}"`);
    // Update UI indicators
  }
};
```

## Subtitle Support

### Adding Subtitles to Playlist Items

```tsx
const videoWithSubtitles: PlaylistItem = {
  id: 'video-with-subs',
  title: 'Video with Subtitles',
  url: 'https://example.com/video.mp4',
  subtitles: [
    {
      url: 'https://example.com/subtitles/en.vtt',
      language: 'en',
      label: 'English',
      isDefault: true
    },
    {
      url: 'https://example.com/subtitles/es.vtt',
      language: 'es',
      label: 'Español'
    },
    {
      url: 'https://example.com/subtitles/fr.vtt',
      language: 'fr',
      label: 'Français'
    }
  ]
};
```

## Complete Integration Example

```tsx
import React, { useState } from 'react';
import { 
  VideoPlayer, 
  PlayerControls, 
  PlaylistProvider 
} from '@smart-tv/player';

const AdvancedVideoPlayer = () => {
  const [currentVideo, setCurrentVideo] = useState({
    url: 'https://example.com/current.mp4',
    drm: undefined
  });

  const playlistState = {
    currentItemId: 'video-1',
    rails: [/* your rails */],
    isVisible: false,
    expandedRails: ['queue'],
    autoPlayEnabled: true,
    autoPlayCountdown: 0,
    nextItemId: undefined
  };

  const playlistConfig = {
    autoPlay: true,
    autoPlayDelay: 10,
    autoPlayCountdown: true,
    globalDrm: {
      servers: {
        'com.widevine.alpha': 'https://default-license-server.com'
      }
    },
    drmFallback: true,
    preloadNext: true
  };

  const playlistCallbacks = {
    onItemPlay: (item) => {
      setCurrentVideo({
        url: item.url,
        drm: item.drm
      });
    },
    
    onDrmError: (item, error) => {
      console.error('DRM Error:', error);
      // Handle DRM errors gracefully
    },
    
    onAutoPlayStart: (nextItem, countdown) => {
      // Show notification
      console.log(`Auto-playing "${nextItem.title}" in ${countdown}s`);
    }
  };

  return (
    <PlaylistProvider
      initialState={playlistState}
      config={playlistConfig}
      callbacks={playlistCallbacks}
    >
      <VideoPlayer
        src={currentVideo.url}
        drm={currentVideo.drm}
        autoPlay
      >
        <PlayerControls
          showPlaylist={true}
          playlist={{
            state: playlistState,
            config: playlistConfig,
            callbacks: playlistCallbacks
          }}
        />
      </VideoPlayer>
    </PlaylistProvider>
  );
};
```

This comprehensive playlist system now supports enterprise-grade DRM protection, intelligent auto-play functionality, and flexible quality management while maintaining the smooth user experience expected on smart TV platforms.
