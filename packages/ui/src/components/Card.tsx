
// TV Card component, focusable
export const Card = ({ title, image, onSelect }: {
  title: string;
  image: string;
  onSelect?: () => void;
}) => {
  // TODO: Add focus/remote select logic
  return (
    <div tabIndex={0} className="tv-card" onClick={onSelect}>
      <img src={image} alt={title} />
      <div>{title}</div>
    </div>
  );
};
