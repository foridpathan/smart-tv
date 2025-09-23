export const cn = (
  ...parts: Array<string | false | null | undefined | Record<string, any>>
) => {
  const classes: string[] = [];
  parts.forEach((p) => {
    if (!p) return;
    if (typeof p === "string") {
      classes.push(p);
      return;
    }
    if (typeof p === "object") {
      Object.keys(p).forEach((k) => p[k] && classes.push(k));
    }
  });
  return classes.join(" ");
};
