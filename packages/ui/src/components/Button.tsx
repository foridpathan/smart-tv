
// TV remote-friendly button
export const TVButton = ({ label, onClick }: {
  label: string;
  onClick?: () => void;
}) => {
  // TODO: Add focus/remote click logic
  return (
    <button tabIndex={0} className="tv-button" onClick={onClick}>
      {label}
    </button>
  );
};
