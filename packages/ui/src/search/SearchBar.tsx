
// TV search bar
export const SearchBar = ({ value, onChange }: {
  value: string;
  onChange?: (v: string) => void;
}) => {
  // TODO: Add remote navigation for input
  return (
    <input type="text" value={value} onChange={e => onChange?.(e.target.value)} className="tv-search-bar" />
  );
};
