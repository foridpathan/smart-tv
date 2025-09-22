
// TV track selector (audio/subtitles)
export const TrackSelector = ({ tracks, onSelect }: {
  tracks: string[];
  onSelect?: (track: string) => void;
}) => {
  // TODO: Add remote navigation for track selection
  return (
    <select className="tv-track-selector" onChange={e => onSelect?.(e.target.value)}>
      {tracks.map(track => <option key={track} value={track}>{track}</option>)}
    </select>
  );
};
