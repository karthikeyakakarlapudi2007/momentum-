import { Search, Bell, User } from "lucide-react";
import "../styles/navbar.css";

function Navbar() {
  return (
    <header className="navbar" id="main-navbar">
      <div className="navbar__search">
        <Search size={18} className="navbar__search-icon" />
        <input
          type="text"
          className="navbar__search-input"
          placeholder="Search habits..."
          aria-label="Search habits"
        />
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
