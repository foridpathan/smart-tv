import { MediaProvider, PlayerControls, PlaylistState, VideoPlayer } from '@smart-tv/player';
import { Screen } from '@smart-tv/ui';
import { useCallback, useState } from 'react';

// Sample video sources for testing - moved outside component to prevent recreation
const videoSources = [
    {
        src: "https://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8",
        poster: "https://storage.googleapis.com/shaka-demo-assets/angel-one/poster.jpg",
        title: "Angel One (HLS)"
    },
    {
        src: "https://storage.googleapis.com/shaka-demo-assets/sintel/dash.mpd",
        poster: "https://storage.googleapis.com/shaka-demo-assets/sintel/poster.jpg",
        title: "Sintel (DASH)"
    },
    {
        src: "https://storage.googleapis.com/shaka-demo-assets/big-buck-bunny/index.m3u8",
        poster: "https://storage.googleapis.com/shaka-demo-assets/big-buck-bunny/poster.jpg",
        title: "Big Buck Bunny (HLS)"
    }
];
const playlistState: PlaylistState = {
    currentItemId: 'video-1',
    rails: [
        {
            id: 'queue',
            title: 'Up Next',
            type: 'related',
            items: [
                {
                    id: 'video-1',
                    title: 'Next Video',
                    description: 'This video will play next',
                    thumbnail: 'https://image.tmdb.org/t/p/original/ldLhsXf6sCFPi0FIIGgMT0njaZg.jpg',
                    duration: 1800, // 30 minutes
                    url: '/videos/video1.mp4',
                    type: 'video'
                }
            ]
        },
        {
            id: 'queue2',
            title: 'Up Next',
            type: 'related',
            items: [
                {
                    id: 'video-1',
                    title: 'Next Video',
                    description: 'This video will play next',
                    thumbnail: 'https://image.tmdb.org/t/p/original/ldLhsXf6sCFPi0FIIGgMT0njaZg.jpg',
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

const Activity = () => {
    const [currentVideo, setCurrentVideo] = useState(0);

    const handleVideoChange = useCallback((index: number) => {
        setCurrentVideo(index);
    }, []);

    const handlePlayerLoad = useCallback(() => {
        console.log(`${videoSources[currentVideo].title} loaded successfully`);
    }, [currentVideo, videoSources]);

    const handlePlayerError = useCallback((error: Error) => {
        console.error(`Player error for ${videoSources[currentVideo].title}:`, error);
    }, [currentVideo, videoSources]);

    return (
        <Screen>
            <div className="min-h-screen bg-gray-900 text-white">
                {/* Header */}
                <div className="p-4 bg-gray-800 border-b border-gray-700">
                    <h1 className="text-2xl font-bold mb-2">Smart TV Player Demo</h1>
                    <p className="text-gray-300">
                        Currently playing: {videoSources[currentVideo].title}
                    </p>
                </div>

                {/* Video Player */}
                <MediaProvider>
                    <div className="relative w-full h-[70vh] bg-black">
                        <VideoPlayer
                            key={currentVideo} // Force re-render when video changes
                            src={videoSources[currentVideo].src}
                            autoPlay={true}
                            muted={false}
                            poster={videoSources[currentVideo].poster}
                            className="w-full h-full"
                            onLoadedData={handlePlayerLoad}
                            onError={handlePlayerError}
                        />
                        <PlayerControls
                            className=""
                            style={{}}
                            playlist={{
                                state: playlistState,
                                config: { autoPlay: true },
                                callbacks: {
                                    onItemPlay: (item) => {
                                        console.log('Playing:', item.title);
                                        // Handle video change
                                    }
                                }
                            }}
                        />
                        {/* <div className="flex flex-col absolute bottom-4 left-4 right-4">
                            <div className="flex justify-between gap-4">
                                <div className="">
                                    <PlayButton className='w-8' />
                                </div>
                                <div className="flex">
                                    <AudioTrack />
                                    <VideoTrack />
                                </div>
                            </div>
                            <div className=" flex-1">
                                <SeekBar className='w-full' />
                            </div>
                        </div> */}
                    </div>
                </MediaProvider>

                {/* Video Selection */}
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Select Video</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {videoSources.map((video, index) => (
                            <div
                                key={index}
                                className={`
                                    p-4 rounded-lg border-2 cursor-pointer transition-all
                                    ${currentVideo === index
                                        ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                                        : 'border-gray-600 hover:border-gray-400 bg-gray-800'
                                    }
                                `}
                                onClick={() => handleVideoChange(index)}
                            >
                                <img
                                    src={video.poster}
                                    alt={video.title}
                                    className="w-full h-24 object-cover rounded mb-2"
                                />
                                <h3 className="font-medium text-sm">{video.title}</h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    {video.src.includes('.m3u8') ? 'HLS Stream' : 'DASH Stream'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Instructions */}
                <div className="p-6 bg-gray-800 mt-4">
                    <h2 className="text-lg font-semibold mb-3">Controls</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div>
                            <h3 className="font-medium text-blue-400 mb-2">Remote Control / Keyboard</h3>
                            <ul className="space-y-1 text-gray-300">
                                <li>• Arrow Keys: Navigate between controls</li>
                                <li>• Enter/OK: Select/Activate control</li>
                                <li>• Space: Play/Pause toggle</li>
                                <li>• Left/Right (on seek bar): Seek backward/forward</li>
                                <li>• Up/Down (on volume): Adjust volume</li>
                                <li>• Escape/Back: Close menus</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-green-400 mb-2">Features</h3>
                            <ul className="space-y-1 text-gray-300">
                                <li>• ✅ Adaptive bitrate streaming</li>
                                <li>• ✅ Multiple audio languages</li>
                                <li>• ✅ Subtitle support</li>
                                <li>• ✅ Quality selection</li>
                                <li>• ✅ Picture-in-Picture</li>
                                <li>• ✅ Fullscreen mode</li>
                                <li>• ✅ Smart TV focus management</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Screen>
    );
};

export default Activity;