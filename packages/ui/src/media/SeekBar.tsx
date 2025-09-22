
// TV seek bar for video
export const SeekBar = ({ value, onSeek }: {
  value: number;
  onSeek?: (v: number) => void;
}) => {
  // TODO: Add remote seek logic
  return (
    <input type="range" min={0} max={100} value={value} onChange={e => onSeek?.(Number(e.target.value))} className="tv-seek-bar" />
  );
};
