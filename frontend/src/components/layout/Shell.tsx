import { type ReactNode } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "../common/Logo";
import { Icon } from "../common/Icon";
import { Avatar } from "../common/Avatar";
import { Button } from "../common/Button";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { useLogoutMutation } from "../../services/authApi";
import { logout as logoutAction } from "../../store/slices/authSlice";

interface ShellProps {
  children: ReactNode;
  action?: ReactNode;
}

const navItems = [
  { icon: "home", label: "Trang chủ", path: "/trips" },
  { icon: "compass", label: "Khám phá", path: "/explore" },
  { icon: "bookmark", label: "Đặt chỗ", path: "/bookings" },
  { icon: "settings", label: "Cài đặt", path: "/settings" },
] as const;

function getInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Shell({ children, action }: ShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentPath = location.pathname;

  const user = useAppSelector((state) => state.auth.user);
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // Even if API logout fails (e.g. network issue), clear client state
    } finally {
      dispatch(logoutAction());
      navigate("/login", { replace: true });
    }
  };

  const userInitials = getInitials(user?.fullName);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo to="/trips" />
        <nav>
          {navItems.map((item, index) => {
            const isTripsSub =
              item.path === "/trips" &&
              (currentPath.startsWith("/trips") || currentPath.startsWith("/itinerary"));
            const isActive =
              currentPath === item.path ||
              (item.path === "/explore" && currentPath === "/discover") ||
              isTripsSub;

            const key = `${item.label}-${index}`;


            return (
              <NavLink
                key={key}
                to={item.path}
                className={isActive ? "active" : ""}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <Link to="/settings" className="profile" title="Cài đặt tài khoản">
            <Avatar
              label={userInitials}
              src={user?.avatarUrl}
              color="yellow"
            />
            <span>
              <strong>{user?.fullName || "Người dùng"}</strong>
              <small>{user?.email || "Chưa có email"}</small>
            </span>
            <Icon name="chevron" size={15} />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="logout-button"
            style={{
              marginTop: "8px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "8px",
              color: "var(--danger)",
              background: "transparent",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            title="Đăng xuất khỏi hệ thống"
          >
            <Icon name="logout" size={16} />
            <span>{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
          </button>
        </div>
      </aside>

      <main className="app-main">
        <header className="mobile-bar">
          <Logo to="/trips" />
          <Button variant="ghost" icon="menu">
            Menu
          </Button>
        </header>
        {action && <div className="floating-action">{action}</div>}
        {children}
      </main>
    </div>
  );
}
