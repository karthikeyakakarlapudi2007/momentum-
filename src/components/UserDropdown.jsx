import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, Settings as SettingsIcon, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import "./UserDropdown.css";

function UserDropdown({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { profile, openSettings } = useSettings();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !e.target.closest("#btn-profile")
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate("/login");
  };

  const handleSettings = () => {
    onClose();
    openSettings();
  };

  const getInitials = (fullName) => {
    if (!fullName) return "?";
    return fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  };

  const displayName = user?.name || profile?.name || "User";
  const displayEmail = user?.email || "user@example.com";
  const profilePic = user?.profilePicture;

  return (
    <div className="user-dropdown animate-fade-in" ref={dropdownRef}>
      <div className="user-dropdown__header">
        <div className="user-dropdown__avatar" style={{ background: profilePic ? "transparent" : profile?.avatarColor || "var(--primary)" }}>
          {profilePic ? (
            <img src={profilePic} alt={displayName} className="user-dropdown__img" />
          ) : (
            getInitials(displayName)
          )}
        </div>
        <div className="user-dropdown__info">
          <p className="user-dropdown__name">{displayName}</p>
          <p className="user-dropdown__email">{displayEmail}</p>
        </div>
      </div>
      
      <div className="user-dropdown__divider"></div>
      
      <div className="user-dropdown__actions">
        <Link to="/dashboard" className="user-dropdown__item" onClick={onClose}>
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </Link>
        <Link to="/profile" className="user-dropdown__item" onClick={onClose}>
          <User size={16} />
          <span>Profile</span>
        </Link>
        <button type="button" className="user-dropdown__item" onClick={handleSettings}>
          <SettingsIcon size={16} />
          <span>Settings</span>
        </button>
      </div>

      <div className="user-dropdown__divider"></div>

      <div className="user-dropdown__actions">
        <button type="button" className="user-dropdown__item danger" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}

export default UserDropdown;
