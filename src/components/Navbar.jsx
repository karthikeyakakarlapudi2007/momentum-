import { useState } from "react";
import { Search, Bell, X } from "lucide-react";
import { useSearch } from "../context/SearchContext";
import { useSettings } from "../context/SettingsContext";
import NotificationsDropdown from "./NotificationsDropdown";
import "./Navbar.css";

function Navbar() {
  const { query, setQuery, clear } = useSearch();
  const { profile, openSettings, notifications } = useSettings();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getInitials = (fullName) => {
    if (!fullName) return "?";
    return fullName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="navbar" id="main-navbar">
      <div className="navbar__search">
        <Search size={18} className="navbar__search-icon" />
        <input
          type="text"
          className="navbar__search-input"
          placeholder="Search habits by name or category..."
          aria-label="Search habits"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className="navbar__search-clear"
            onClick={clear}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="navbar__actions" style={{ position: "relative" }}>
        <button
          className={`navbar__icon-btn ${isNotifOpen ? "is-active" : ""}`}
          aria-label="Notifications"
          id="btn-notifications"
          onClick={() => setIsNotifOpen(!isNotifOpen)}
        >
          <Bell size={20} />
          {unreadCount > 0 && <span className="navbar__badge">{unreadCount}</span>}
        </button>
        
        <NotificationsDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

        <button
          className="navbar__icon-btn navbar__avatar"
          aria-label="User profile"
          id="btn-profile"
          style={{ background: profile.avatarColor }}
          onClick={openSettings}
        >
          {getInitials(profile.name)}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
