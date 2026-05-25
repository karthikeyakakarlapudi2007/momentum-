import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  PlusCircle,
  CalendarDays,
  Settings,
  LogOut,
  Flame,
} from "lucide-react";
import "../styles/sidebar.css";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/habits/add", icon: PlusCircle, label: "Add Habit" },
  { to: "/calendar", icon: CalendarDays, label: "Calendar" },
];

function Sidebar() {
  return (
    <aside className="sidebar" id="main-sidebar">
      {/* Brand */}
      <div className="sidebar__brand">
        <Flame size={28} className="sidebar__brand-icon" />
        <span className="sidebar__brand-text">Momentum</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
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
        <button className="sidebar__link" id="btn-settings">
          <Settings size={20} />
          <span>Settings</span>
        </button>
        <button className="sidebar__link" id="btn-logout">
          <LogOut size={20} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
