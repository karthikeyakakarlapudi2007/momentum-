import { Search, Bell, User, X } from "lucide-react";
import { useSearch } from "../context/SearchContext";
import "../styles/navbar.css";

function Navbar() {
  const { query, setQuery, clear } = useSearch();

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

      <div className="navbar__actions">
        <button className="navbar__icon-btn" aria-label="Notifications" id="btn-notifications">
          <Bell size={20} />
          <span className="navbar__badge">3</span>
        </button>
        <button className="navbar__icon-btn navbar__avatar" aria-label="User profile" id="btn-profile">
          <User size={20} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
