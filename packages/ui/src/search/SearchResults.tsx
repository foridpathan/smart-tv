
// TV search results list
export const SearchResults = ({ results, onSelect }: {
  results: string[];
  onSelect?: (result: string) => void;
}) => {
  // TODO: Add remote navigation for results
  return (
    <ul className="tv-search-results">
      {results.map(result => (
        <li key={result} tabIndex={0} onClick={() => onSelect?.(result)}>{result}</li>
      ))}
    </ul>
  );
};
