
// TV video player component
export const VideoPlayer = ({ src, controls }: {
  src: string;
  controls?: boolean;
}) => {
  // TODO: Add TV remote control support
  return <video src={src} controls={controls} className="tv-video-player" />;
};
