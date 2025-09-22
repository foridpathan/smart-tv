
// TV tooltip
export const Tooltip = ({ message, visible }: {
  message: string;
  visible: boolean;
}) => {
  // TODO: Add remote navigation for tooltip
  if (!visible) return null;
  return <span className="tv-tooltip">{message}</span>;
};
