
// On-screen keyboard for TV
export const Keyboard = ({ onInput }: {
  onInput?: (char: string) => void;
}) => {
  // TODO: Add remote navigation for keyboard
  const keys = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9'];
  return (
    <div className="tv-keyboard">
      {keys.map(key => (
        <button key={key} tabIndex={0} onClick={() => onInput?.(key)}>{key}</button>
      ))}
    </div>
  );
};
