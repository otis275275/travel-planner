import { Link } from "react-router-dom";

export function Logo({
  light = false,
  to = "/",
}: {
  light?: boolean;
  to?: string;
}) {
  return (
    <Link to={to} className={`logo ${light ? "logo-light" : ""}`}>
      <span className="logo-mark">
        <span />
      </span>
      <strong>Triply</strong>
    </Link>
  );
}
