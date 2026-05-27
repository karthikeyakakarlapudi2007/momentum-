import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  PlusCircle,
  CalendarDays,
  ListChecks,
  Settings,
  LogOut,
  Flame,
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import "../styles/sidebar.css";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/habits", icon: ListChecks, label: "My Habits", end: true },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/calendar", icon: CalendarDays, label: "Calendar" },
  { to: "/habits/add", icon: PlusCircle, label: "Add Habit" },
];

function Sidebar() {
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    const confirmed = window.confirm("Sign out of Momentum?");
    if (!confirmed) return;

    try {
      sessionStorage.clear();
      localStorage.removeItem("momentum.session");
      localStorage.removeItem("momentum.auth");
    } catch {
      // storage may be unavailable (private mode) — safe to ignore
    }

    toast.success("Signed out — see you soon.");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar" id="main-sidebar">
      {/* Brand */}
      <div className="sidebar__brand">
        <Flame size={28} className="sidebar__brand-icon" />
        <span className="sidebar__brand-text">Momentum</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer actions */}
      <div className="sidebar__footer">
        <button className="sidebar__link" id="btn-settings" type="button">
          <Settings size={20} />
          <span>Settings</span>
        </button>
        <button
          className="sidebar__link sidebar__link--logout"
          id="btn-logout"
          type="button"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
