export function Avatar({
  label,
  color = "green",
  src,
}: {
  label: string;
  color?: string;
  src?: string | null;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={label}
        className={`avatar avatar-${color}`}
        style={{ objectFit: "cover", display: "inline-block" }}
      />
    );
  }
  return <span className={`avatar avatar-${color}`}>{label}</span>;
}

