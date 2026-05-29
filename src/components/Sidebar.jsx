import { useState } from "react";
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
import ConfirmModal from "./ConfirmModal";
import { useToast } from "../context/ToastContext";
import { useSettings } from "../context/SettingsContext";
import "./Sidebar.css";

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
  const { openSettings } = useSettings();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const performLogout = () => {
    setSigningOut(true);
    try {
      sessionStorage.clear();
      localStorage.removeItem("momentum.session");
      localStorage.removeItem("momentum.auth");
      localStorage.removeItem("momentum.token");
    } catch {
      // storage may be unavailable (private mode) — safe to ignore
    }

    setLogoutOpen(false);
    toast.success("Signed out — see you soon.");
    navigate("/login", { replace: true });
    setSigningOut(false);
  };

  return (
    <>
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
          <button
            className="sidebar__link"
            id="btn-settings"
            type="button"
            onClick={openSettings}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
          <button
            className="sidebar__link sidebar__link--logout"
            id="btn-logout"
            type="button"
            onClick={() => setLogoutOpen(true)}
          >
            <LogOut size={20} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <ConfirmModal
        open={logoutOpen}
        variant="danger"
        icon={<LogOut size={22} />}
        title="Log out of Momentum?"
        message="You'll need to sign in again to access your habits and progress."
        confirmLabel="Log out"
        cancelLabel="Stay signed in"
        busy={signingOut}
        onCancel={() => !signingOut && setLogoutOpen(false)}
        onConfirm={performLogout}
      />
    </>
  );
}

export default Sidebar;
