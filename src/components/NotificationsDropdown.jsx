import { useEffect, useRef } from "react";
import { Flame, Trophy, Info, Check, Trash2, Bell } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import "../styles/notifications.css";

function NotificationsDropdown({ isOpen, onClose }) {
  const {
    notifications,
    markNotifAsRead,
    markAllNotifsAsRead,
    clearNotifications,
  } = useSettings();

  const dropdownRef = useRef(null);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        // Only close if we didn't click the bell button itself
        const bellBtn = document.getElementById("btn-notifications");
        if (bellBtn && bellBtn.contains(e.target)) return;
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNotifClick = (id) => {
    markNotifAsRead(id);
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "warning":
        return <Flame size={16} className="notif-item__icon-svg notif-item__icon-svg--warning" />;
      case "milestone":
        return <Trophy size={16} className="notif-item__icon-svg notif-item__icon-svg--milestone" />;
      case "info":
      default:
        return <Info size={16} className="notif-item__icon-svg notif-item__icon-svg--info" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="notif-dropdown" ref={dropdownRef} role="dialog" aria-label="Notification Feed">
      {/* Dropdown Header */}
      <div className="notif-dropdown__header">
        <h4 className="notif-dropdown__title">Notifications</h4>
        
        {notifications.length > 0 && (
          <div className="notif-dropdown__actions">
            {unreadCount > 0 && (
              <button
                type="button"
                className="notif-action-btn"
                onClick={markAllNotifsAsRead}
                title="Mark all as read"
              >
                <Check size={14} /> <span>Read All</span>
              </button>
            )}
            <button
              type="button"
              className="notif-action-btn notif-action-btn--danger"
              onClick={clearNotifications}
              title="Clear all"
            >
              <Trash2 size={14} /> <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* Dropdown Body */}
      <div className="notif-dropdown__body">
        {notifications.length > 0 ? (
          <div className="notif-list">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`notif-item ${!n.read ? "notif-item--unread" : ""}`}
                onClick={() => handleNotifClick(n.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleNotifClick(n.id)}
              >
                {/* Visual Icon */}
                <div className={`notif-item__icon notif-item__icon--${n.type}`}>
                  {getNotifIcon(n.type)}
                </div>

                {/* Content */}
                <div className="notif-item__content">
                  <p className="notif-item__text">{n.text}</p>
                  <span className="notif-item__time">{n.time}</span>
                </div>

                {/* Unread dot */}
                {!n.read && <span className="notif-item__dot" aria-label="Unread indicator" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="notif-empty">
            <div className="notif-empty__icon">
              <Bell size={28} />
            </div>
            <p className="notif-empty__title">All Caught Up!</p>
            <p className="notif-empty__desc">
              You don't have any notifications right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsDropdown;
