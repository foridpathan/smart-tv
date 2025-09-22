
// TV player controls (play/pause, etc.)
export const PlayerControls = ({ onPlay, onPause }: {
  onPlay?: () => void;
  onPause?: () => void;
}) => {
  // TODO: Add remote navigation for controls
  return (
    <div className="tv-player-controls">
      <button tabIndex={0} onClick={onPlay}>Play</button>
      <button tabIndex={0} onClick={onPause}>Pause</button>
    </div>
  );
};
