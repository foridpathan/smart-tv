import {
    PlayerControls,
    PlaylistProvider,
    usePlaylistActions,
    usePlaylistHelpers,
    VideoPlayer,
    type PlaylistCallbacks,
    type PlaylistConfig,
    type PlaylistItemType as PlaylistItem,
    type PlaylistRailType as PlaylistRail,
    type PlaylistState
} from '@smart-tv/player';
import React, { useState } from 'react';

// Example playlist data with DRM support
const createSamplePlaylistRails = (): PlaylistRail[] => [
  {
    id: 'queue',
    title: 'Up Next',
    type: 'queue',
    priority: 1,
    isCollapsible: false,
    items: [
      {
        id: 'video-1',
        title: 'Premium Movie - DRM Protected',
        description: 'High-quality DRM protected content',
        thumbnail: 'https://example.com/thumb1.jpg',
        duration: 3600, // 1 hour
        url: 'https://example.com/protected-video1.mp4',
        type: 'video',
        isActive: false,
        progress: 0,
        // DRM configuration for this specific item
        drm: {
          servers: {
            'com.widevine.alpha': 'https://widevine-proxy.appspot.com/proxy',
            'com.microsoft.playready': 'https://test.playready.microsoft.com/service/rightsmanager.asmx',
            'org.w3.clearkey': 'https://example.com/clearkey-license'
          },
          advanced: {
            'com.widevine.alpha': {
              headers: {
                'X-AxDRM-Message': 'your-license-key'
              }
            }
          }
        },
        // Subtitle tracks
        subtitles: [
          {
            url: 'https://example.com/subs/en.vtt',
            language: 'en',
            label: 'English',
            isDefault: true
          },
          {
            url: 'https://example.com/subs/es.vtt',
            language: 'es',
            label: 'Español'
          }
        ],
        // Available quality levels
        qualities: [
          {
            url: 'https://example.com/video1-4k.mp4',
            label: '4K',
            width: 3840,
            height: 2160,
            bandwidth: 25000000
          },
          {
            url: 'https://example.com/video1-1080p.mp4',
            label: '1080p',
            width: 1920,
            height: 1080,
            bandwidth: 5000000
          }
        ]
      },
      {
        id: 'video-2',
        title: 'Free Content - No DRM',
        description: 'Freely accessible video content',
        thumbnail: 'https://example.com/thumb2.jpg',
        duration: 2700, // 45 minutes
        url: 'https://example.com/free-video2.mp4',
        type: 'video',
        isActive: false,
        progress: 25,
        // No DRM configuration - will use global DRM if available
        subtitles: [
          {
            url: 'https://example.com/subs/video2-en.vtt',
            language: 'en',
            label: 'English'
          }
        ]
      },
    ]
  },
  {
    id: 'related',
    title: 'Related Videos',
    type: 'related',
    priority: 2,
    isCollapsible: true,
    maxVisible: 4,
    items: [
      {
        id: 'related-1',
        title: 'Similar Content: Nature Photography',
        description: 'Stunning wildlife photography techniques',
        thumbnail: 'https://example.com/related1.jpg',
        duration: 1800,
        url: 'https://example.com/related1.mp4',
        type: 'video'
      },
      {
        id: 'related-2',
        title: 'Behind the Scenes',
        description: 'How this documentary was made',
        thumbnail: 'https://example.com/related2.jpg',
        duration: 900,
        url: 'https://example.com/related2.mp4',
        type: 'video'
      },
      {
        id: 'related-3',
        title: 'Director\'s Commentary',
        description: 'Insights from the director',
        thumbnail: 'https://example.com/related3.jpg',
        duration: 2400,
        url: 'https://example.com/related3.mp4',
        type: 'video'
      },
      {
        id: 'related-4',
        title: 'Extended Footage',
        description: 'Scenes that didn\'t make the final cut',
        thumbnail: 'https://example.com/related4.jpg',
        duration: 1200,
        url: 'https://example.com/related4.mp4',
        type: 'video'
      },
      {
        id: 'related-5',
        title: 'Soundtrack & Music',
        description: 'The music behind the documentary',
        thumbnail: 'https://example.com/related5.jpg',
        duration: 600,
        url: 'https://example.com/related5.mp4',
        type: 'audio'
      },
    ]
  },
  {
    id: 'recommendations',
    title: 'Recommended for You',
    type: 'recommendations',
    priority: 3,
    isCollapsible: true,
    maxVisible: 6,
    items: [
      {
        id: 'rec-1',
        title: 'Ocean Mysteries',
        description: 'Dive deep into ocean exploration',
        thumbnail: 'https://example.com/rec1.jpg',
        duration: 4200,
        url: 'https://example.com/rec1.mp4',
        type: 'video'
      },
      {
        id: 'rec-2',
        title: 'Space Exploration',
        description: 'Journey to the stars and beyond',
        thumbnail: 'https://example.com/rec2.jpg',
        duration: 3900,
        url: 'https://example.com/rec2.mp4',
        type: 'video'
      },
    ]
  },
  {
    id: 'history',
    title: 'Watch History',
    type: 'history',
    priority: 4,
    isCollapsible: true,
    maxVisible: 3,
    items: [
      {
        id: 'history-1',
        title: 'Previously Watched: Mountain Climbing',
        description: 'Adventures in mountain climbing',
        thumbnail: 'https://example.com/history1.jpg',
        duration: 2100,
        url: 'https://example.com/history1.mp4',
        type: 'video',
        progress: 100 // Fully watched
      },
      {
        id: 'history-2',
        title: 'Partially Watched: City Life',
        description: 'Urban exploration and city culture',
        thumbnail: 'https://example.com/history2.jpg',
        duration: 1800,
        url: 'https://example.com/history2.mp4',
        type: 'video',
        progress: 60 // 60% watched
      },
    ]
  }
];

// Enhanced playlist configuration with DRM and auto-play
const playlistConfig: PlaylistConfig = {
  showThumbnails: true,
  showDuration: true,
  showProgress: true,
  maxRailHeight: 400,
  itemsPerRow: 1, // Single column for better focus navigation
  autoPlay: true,
  autoPlayDelay: 10, // 10 seconds countdown before auto-play
  autoPlayCountdown: true, // Show countdown timer
  loop: false,
  shuffle: false,
  saveHistory: true,
  // Global DRM configuration (applied to items without specific DRM)
  globalDrm: {
    servers: {
      'com.widevine.alpha': 'https://default-widevine-server.com/license',
    },
    advanced: {
      'com.widevine.alpha': {
        headers: {
          'Authorization': 'Bearer your-default-token'
        }
      }
    }
  },
  drmFallback: true, // Try to play without DRM if DRM fails
  preferredQuality: 'auto', // Auto-select quality based on bandwidth
  adaptiveStreaming: true,
  preloadNext: true, // Preload the next item for smoother transitions
  preloadCount: 2, // Preload 2 items ahead
};

// Main component with playlist integration
const VideoPlayerWithPlaylist: React.FC = () => {
  const [currentVideoUrl, setCurrentVideoUrl] = useState('https://example.com/current-video.mp4');
  const [showPlaylist, setShowPlaylist] = useState(false);

  // Initialize playlist state
  const initialPlaylistState: PlaylistState = {
    currentItemId: 'video-1',
    rails: createSamplePlaylistRails(),
    isVisible: false,
    expandedRails: ['queue'], // Queue is expanded by default
    activeRail: 'queue',
  };

  // Enhanced playlist callbacks with DRM and auto-play support
  const playlistCallbacks: PlaylistCallbacks = {
    onItemSelect: (item: PlaylistItem) => {
      console.log('Item selected:', item.title);
    },
    
    onItemPlay: (item: PlaylistItem) => {
      console.log('Playing item:', item.title);
      setCurrentVideoUrl(item.url);
      
      // Handle DRM content
      if (item.drm) {
        console.log('Setting up DRM for:', item.title);
        // Configure DRM for the media player
      }
      
      // Update current item in playlist state
    },
    
    onItemEnd: (item: PlaylistItem) => {
      console.log('Item ended:', item.title);
      // Save progress, update analytics, etc.
    },
    
    onAutoPlayStart: (nextItem: PlaylistItem, countdown: number) => {
      console.log(`Auto-playing "${nextItem.title}" in ${countdown} seconds`);
      // Show notification or update UI
    },
    
    onAutoPlayCancel: (nextItem: PlaylistItem) => {
      console.log('Auto-play cancelled for:', nextItem.title);
      // User cancelled auto-play
    },
    
    onDrmError: (item: PlaylistItem, error: Error) => {
      console.error('DRM error for item:', item.title, error);
      // Handle DRM failures - maybe try fallback or show error message
      
      if (playlistConfig.drmFallback) {
        console.log('Attempting to play without DRM...');
        // Try to play the item without DRM protection
      }
    },
    
    onQualityChange: (item: PlaylistItem, quality: string) => {
      console.log(`Quality changed to ${quality} for:`, item.title);
    },
    
    onRailExpand: (railId: string) => {
      console.log('Rail expanded:', railId);
    },
    
    onRailCollapse: (railId: string) => {
      console.log('Rail collapsed:', railId);
    },
    
    onLoadMore: async (railId: string) => {
      console.log('Loading more items for rail:', railId);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return new items with potential DRM content
      return [
        {
          id: `${railId}-new-${Date.now()}`,
          title: 'Dynamically Loaded DRM Content',
          description: 'This item was loaded on demand with DRM protection',
          thumbnail: 'https://example.com/dynamic.jpg',
          duration: 1500,
          url: 'https://example.com/dynamic-drm.mp4',
          type: 'video' as const,
          drm: {
            servers: {
              'com.widevine.alpha': 'https://dynamic-content-license-server.com/license'
            }
          }
        }
      ];
    },
    
    // Navigation callbacks for auto-play logic
    onGetNextItem: (currentItemId: string) => {
      // Custom logic to determine next item
      // This could consider user preferences, content ratings, etc.
      console.log('Getting next item for:', currentItemId);
      return undefined; // Return undefined to use default logic
    },
    
    onGetPreviousItem: (currentItemId: string) => {
      // Custom logic to determine previous item
      console.log('Getting previous item for:', currentItemId);
      return undefined; // Return undefined to use default logic
    }
  };

  return (
    <PlaylistProvider
      initialState={initialPlaylistState}
      config={playlistConfig}
      callbacks={playlistCallbacks}
    >
      <div className="relative w-full h-screen bg-black">
        {/* Video Player */}
        <VideoPlayer
          src={currentVideoUrl}
          className="w-full h-full"
          autoPlay
        >
          {/* Player Controls with Playlist Integration */}
          <PlayerControls
            showOnHover={true}
            autoHide={true}
            autoHideDelay={4000}
            showPlaylist={showPlaylist}
            playlist={{
              state: initialPlaylistState,
              config: playlistConfig,
              callbacks: playlistCallbacks
            }}
          />
        </VideoPlayer>
      </div>
    </PlaylistProvider>
  );
};

// Usage Example with Custom Playlist Management
const PlaylistExample: React.FC = () => {
  return (
    <div className="app">
      <h1>Smart TV Player with YouTube-style Playlist</h1>
      <VideoPlayerWithPlaylist />
    </div>
  );
};

// Advanced example showing programmatic playlist management
const AdvancedPlaylistExample: React.FC = () => {
  const PlaylistManager: React.FC = () => {
    const { 
      addRail, 
      addItem, 
      setCurrentItem, 
      setVisibility
    } = usePlaylistActions();
    
    const { getCurrentItem, getRailById } = usePlaylistHelpers();

    const handleAddToQueue = () => {
      const newItem: PlaylistItem = {
        id: `queue-item-${Date.now()}`,
        title: 'User Added Video',
        description: 'Added programmatically to the queue',
        thumbnail: 'https://example.com/user-added.jpg',
        duration: 1800,
        url: 'https://example.com/user-video.mp4',
        type: 'video'
      };

      addItem('queue', newItem);
    };

    const handleCreateCustomPlaylist = () => {
      const customRail: PlaylistRail = {
        id: 'custom-playlist',
        title: 'My Custom Playlist',
        type: 'custom',
        priority: 0, // High priority
        isCollapsible: true,
        items: [
          {
            id: 'custom-1',
            title: 'Custom Video 1',
            description: 'First video in custom playlist',
            thumbnail: 'https://example.com/custom1.jpg',
            duration: 2400,
            url: 'https://example.com/custom1.mp4',
            type: 'video'
          }
        ]
      };

      addRail(customRail);
    };

    return (
      <div className="playlist-controls p-4 bg-gray-100">
        <h3 className="text-lg font-semibold mb-4">Playlist Management</h3>
        
        <div className="space-y-2">
          <button 
            onClick={handleAddToQueue}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add to Queue
          </button>
          
          <button 
            onClick={handleCreateCustomPlaylist}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Create Custom Playlist
          </button>
          
          <button 
            onClick={() => setVisibility(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Show Playlist
          </button>
        </div>
      </div>
    );
  };

  return (
    <PlaylistProvider>
      <div>
        <PlaylistManager />
        <VideoPlayerWithPlaylist />
      </div>
    </PlaylistProvider>
  );
};

export {
    AdvancedPlaylistExample,
    createSamplePlaylistRails,
    playlistConfig, PlaylistExample, VideoPlayerWithPlaylist
};

