
// TV volume control
export const VolumeControl = ({ value, onChange }: {
  value: number;
  onChange?: (v: number) => void;
}) => {
  // TODO: Add remote volume logic
  return (
    <input type="range" min={0} max={100} value={value} onChange={e => onChange?.(Number(e.target.value))} className="tv-volume-control" />
  );
};
