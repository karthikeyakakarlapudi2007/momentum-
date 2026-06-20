import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  User,
  Mail,
  Sun,
  Moon,
  Monitor,
  Volume2,
  VolumeX,
  Bell,
  Trash2,
  Check,
  ShieldAlert,
  Phone,
  MapPin,
  Calendar,
  AlignLeft,
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { useHabits } from "../context/HabitsContext";
import { useToast } from "../context/ToastContext";
import "./SettingsModal.css";

const AVATAR_COLORS = [
  { name: "Sage", value: "#778873" },
  { name: "Clay", value: "#C58F82" },
  { name: "Dusty Blue", value: "#8AA2B8" },
  { name: "Sand", value: "#D0B89B" },
  { name: "Lavender", value: "#9BA3B0" },
  { name: "Olive", value: "#9AA685" },
];

function SettingsModal() {
  const {
    theme,
    setTheme,
    profile,
    profileLoading,
    profileError,
    updateProfile,
    prefs,
    updatePrefs,
    closeSettings,
  } = useSettings();

  const { resetHabits } = useHabits();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile form state — seeded from profile, kept in sync whenever profile changes
  const [profileName, setProfileName]         = useState(profile.name);
  const [profileEmail, setProfileEmail]       = useState(profile.email);
  const [avatarColor, setAvatarColor]         = useState(profile.avatarColor);
  const [profileAge, setProfileAge]           = useState(profile.age ?? "");
  const [profileMobile, setProfileMobile]     = useState(profile.mobile || "");
  const [profileLocation, setProfileLocation] = useState(profile.location || "");
  const [profileBio, setProfileBio]           = useState(profile.bio || "");

  // Danger zone state
  const [confirmReset, setConfirmReset] = useState(false);

  // Keep form in sync whenever the authenticated profile changes
  // (e.g. on login, or after a successful save that comes back from the server).
  useEffect(() => {
    setProfileName(profile.name || "");
    setProfileEmail(profile.email || "");
    setAvatarColor(profile.avatarColor || "#778873");
    setProfileAge(profile.age ?? "");
    setProfileMobile(profile.mobile || "");
    setProfileLocation(profile.location || "");
    setProfileBio(profile.bio || "");
  }, [profile]);

  const modalRef = useRef(null);

  // Trap focus and body scroll lock when settings is mounted
  useEffect(() => {
    const lastFocused = document.activeElement;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeSettings();
      } else if (e.key === "Tab") {
        const focusableElements = modalRef.current?.querySelectorAll(
          "button:not([disabled]), input:not([disabled]), select:not([disabled])"
        );
        if (!focusableElements || focusableElements.length === 0) return;
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      lastFocused?.focus?.();
    };
  }, [closeSettings]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const result = await updateProfile({
      name:        profileName,
      email:       profileEmail,
      avatarColor: avatarColor,
      age:         profileAge ? parseInt(profileAge, 10) : null,
      mobile:      profileMobile,
      location:    profileLocation,
      bio:         profileBio,
    });
    if (result?.success === false) {
      toast.error(result.error || "Failed to save profile.");
    } else {
      toast.success("Profile saved successfully!");
    }
  };

  const handleResetData = () => {
    resetHabits();
    toast.success("All habits have been reset to default seeds.");
    setConfirmReset(false);
  };

  const getInitials = (fullName) => {
    if (!fullName) return "?";
    return fullName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeSettings();
    }
  };

  return createPortal(
    <div
      className="settings-overlay modal-overlay"
      onMouseDown={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        {/* Close Button */}
        <button
          type="button"
          className="settings-modal__close"
          onClick={closeSettings}
          aria-label="Close settings"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <header className="settings-modal__header">
          <h2 id="settings-title" className="settings-modal__title">
            Settings & Preferences
          </h2>
          <p className="settings-modal__subtitle">
            Manage your profile, theme, and application preferences.
          </p>
        </header>

        {/* Modal Layout */}
        <div className="settings-modal__container">
          {/* Tabs Sidebar */}
          <aside className="settings-modal__sidebar">
            <button
              className={`settings-modal__tab-btn ${
                activeTab === "profile" ? "is-active" : ""
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <User size={16} />
              <span>My Profile</span>
            </button>
            <button
              className={`settings-modal__tab-btn ${
                activeTab === "appearance" ? "is-active" : ""
              }`}
              onClick={() => setActiveTab("appearance")}
            >
              <Sun size={16} />
              <span>Appearance</span>
            </button>
            <button
              className={`settings-modal__tab-btn ${
                activeTab === "preferences" ? "is-active" : ""
              }`}
              onClick={() => setActiveTab("preferences")}
            >
              <Bell size={16} />
              <span>Preferences</span>
            </button>
            <button
              className={`settings-modal__tab-btn settings-modal__tab-btn--danger ${
                activeTab === "danger" ? "is-active" : ""
              }`}
              onClick={() => setActiveTab("danger")}
            >
              <Trash2 size={16} />
              <span>Danger Zone</span>
            </button>
          </aside>

          {/* Tabs Content */}
          <main className="settings-modal__content">
            {/* Tab: PROFILE */}
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="settings-panel">
                <h3 className="settings-panel__title">Profile Details</h3>
                
                {/* Live Initials Preview */}
                <div className="avatar-preview-container">
                  <div
                    className="avatar-preview-circle"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {getInitials(profileName)}
                  </div>
                  <div className="avatar-preview-info">
                    <h4>Avatar Preview</h4>
                    <p>Will be displayed in your navbar</p>
                  </div>
                </div>

                <div className="settings-input-group">
                  <label htmlFor="settings-name">Full Name</label>
                  <div className="input-wrapper">
                    <User size={16} className="input-icon" />
                    <input
                      id="settings-name"
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Your Name"
                      required
                    />
                  </div>
                </div>

                <div className="settings-input-group">
                  <label htmlFor="settings-email">Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input
                      id="settings-email"
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="settings-form-row">
                  <div className="settings-input-group">
                    <label htmlFor="settings-age">Age</label>
                    <div className="input-wrapper">
                      <Calendar size={16} className="input-icon" />
                      <input
                        id="settings-age"
                        type="number"
                        min="1"
                        max="120"
                        value={profileAge}
                        onChange={(e) => setProfileAge(e.target.value)}
                        placeholder="Age"
                      />
                    </div>
                  </div>

                  <div className="settings-input-group">
                    <label htmlFor="settings-mobile">Mobile No.</label>
                    <div className="input-wrapper">
                      <Phone size={16} className="input-icon" />
                      <input
                        id="settings-mobile"
                        type="tel"
                        value={profileMobile}
                        onChange={(e) => setProfileMobile(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </div>

                <div className="settings-input-group">
                  <label htmlFor="settings-location">Location</label>
                  <div className="input-wrapper">
                    <MapPin size={16} className="input-icon" />
                    <input
                      id="settings-location"
                      type="text"
                      value={profileLocation}
                      onChange={(e) => setProfileLocation(e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="settings-input-group">
                  <label htmlFor="settings-bio">Bio</label>
                  <div className="input-wrapper input-wrapper--textarea">
                    <AlignLeft size={16} className="input-icon input-icon--textarea" />
                    <textarea
                      id="settings-bio"
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows="3"
                    />
                  </div>
                </div>

                <div className="settings-input-group">
                  <label>Avatar Color</label>
                  <div className="color-swatches">
                    {AVATAR_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        className={`color-swatch ${
                          avatarColor === c.value ? "is-selected" : ""
                        }`}
                        style={{ backgroundColor: c.value }}
                        onClick={() => setAvatarColor(c.value)}
                        title={c.name}
                      >
                        {avatarColor === c.value && <Check size={12} />}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="settings-save-btn"
                  disabled={profileLoading}
                >
                  {profileLoading ? "Saving…" : "Save Profile Changes"}
                </button>

                {profileError && (
                  <p style={{ color: "var(--danger, #e74c3c)", fontSize: "0.8rem", marginTop: 8 }}>
                    ⚠️ {profileError}
                  </p>
                )}
              </form>
            )}

            {/* Tab: APPEARANCE */}
            {activeTab === "appearance" && (
              <div className="settings-panel animate-fade-in">
                <h3 className="settings-panel__title">App Theme</h3>
                <p className="settings-panel__desc">
                  Select how Momentum looks on your screen.
                </p>

                <div className="theme-selector-grid">
                  {/* Light Mode */}
                  <button
                    type="button"
                    className={`theme-card ${theme === "light" ? "is-selected" : ""}`}
                    onClick={() => setTheme("light")}
                  >
                    <div className="theme-card__icon theme-card__icon--light">
                      <Sun size={24} />
                    </div>
                    <div className="theme-card__label">Light Mode</div>
                  </button>

                  {/* Dark Mode */}
                  <button
                    type="button"
                    className={`theme-card ${theme === "dark" ? "is-selected" : ""}`}
                    onClick={() => setTheme("dark")}
                  >
                    <div className="theme-card__icon theme-card__icon--dark">
                      <Moon size={24} />
                    </div>
                    <div className="theme-card__label">Dark Mode</div>
                  </button>

                  {/* System Mode */}
                  <button
                    type="button"
                    className={`theme-card ${theme === "system" ? "is-selected" : ""}`}
                    onClick={() => setTheme("system")}
                  >
                    <div className="theme-card__icon theme-card__icon--system">
                      <Monitor size={24} />
                    </div>
                    <div className="theme-card__label">System Default</div>
                  </button>
                </div>
              </div>
            )}

            {/* Tab: PREFERENCES */}
            {activeTab === "preferences" && (
              <div className="settings-panel animate-fade-in">
                <h3 className="settings-panel__title">App Preferences</h3>
                <p className="settings-panel__desc">
                  Toggle alerts, updates, sounds, and daily notifications.
                </p>

                <div className="preference-list">
                  {/* Sound FX Toggle */}
                  <div className="preference-item">
                    <div className="preference-item__icon">
                      {prefs.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </div>
                    <div className="preference-item__info">
                      <div className="preference-item__label">Sound Effects</div>
                      <div className="preference-item__sub">
                        Play sound notifications when habit checklists are ticked.
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`preference-toggle ${
                        prefs.soundEnabled ? "is-active" : ""
                      }`}
                      onClick={() =>
                        updatePrefs({ soundEnabled: !prefs.soundEnabled })
                      }
                      aria-label="Toggle sound effects"
                    >
                      <span className="preference-toggle__knob"></span>
                    </button>
                  </div>

                  {/* Weekly Digest Toggle */}
                  <div className="preference-item">
                    <div className="preference-item__icon">
                      <Mail size={20} />
                    </div>
                    <div className="preference-item__info">
                      <div className="preference-item__label">Weekly Performance Summary</div>
                      <div className="preference-item__sub">
                        Receive a visual email report of your consistency percentages.
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`preference-toggle ${
                        prefs.weeklyDigest ? "is-active" : ""
                      }`}
                      onClick={() =>
                        updatePrefs({ weeklyDigest: !prefs.weeklyDigest })
                      }
                      aria-label="Toggle weekly digest"
                    >
                      <span className="preference-toggle__knob"></span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: DANGER ZONE */}
            {activeTab === "danger" && (
              <div className="settings-panel settings-panel--danger animate-fade-in">
                <h3 className="settings-panel__title settings-panel__title--danger">
                  Danger Zone
                </h3>
                <p className="settings-panel__desc">
                  Be careful. These operations are irreversible and permanent.
                </p>

                <div className="danger-action-card">
                  <div className="danger-action-card__content">
                    <h4>Reset Habit Tracker Data</h4>
                    <p>
                      Wipes all habits, histories, streak calculations, and resets to seed habits.
                    </p>
                  </div>

                  {!confirmReset ? (
                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => setConfirmReset(true)}
                    >
                      <ShieldAlert size={16} /> Reset Tracker Data
                    </button>
                  ) : (
                    <div className="danger-confirm-flow">
                      <p className="danger-confirm-msg">
                        Are you sure you want to reset everything?
                      </p>
                      <div className="danger-confirm-actions">
                        <button
                          type="button"
                          className="settings-modal__btn--ghost modal__btn--ghost"
                          onClick={() => setConfirmReset(false)}
                          style={{ padding: "8px 12px", fontSize: "0.8rem", flex: "none" }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="danger-btn danger-btn--confirm"
                          onClick={handleResetData}
                        >
                          Confirm Reset
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default SettingsModal;
