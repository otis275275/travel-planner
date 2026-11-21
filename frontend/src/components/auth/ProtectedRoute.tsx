import { Navigate, Outlet } from "react-router-dom";
import { Shell } from "../layout/Shell";
import { useGetMeQuery } from "../../services/authApi";
import { useAppSelector } from "../../store/hooks";

export function ProtectedRoute() {
  //these 2 lines can re-render this component
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const { isLoading } = useGetMeQuery();

  // If still checking authentication status on initial load, show a loading placeholder
  if (isLoading && !isInitialized) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center", color: "var(--muted)" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <p>Đang tải thông tin tài khoản...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}
