
// TV snackbar/toast
export const Snackbar = ({ message, open }: {
  message: string;
  open: boolean;
}) => {
  // TODO: Add remote navigation for snackbar
  if (!open) return null;
  return <div className="tv-snackbar">{message}</div>;
};
