import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import {
  updateProfile as apiUpdateProfile,
} from "../services/auth";

const SettingsContext = createContext(null);

const THEME_KEY     = "momentum.settings.theme";
const PREFS_KEY     = "momentum.settings.prefs";
const NOTIF_KEY     = "momentum.settings.notifications";

// ─── Safe defaults (never shown — overwritten from AuthContext on mount) ──────
const EMPTY_PROFILE = {
  name:         "",
  email:        "",
  avatarColor:  "#7c5cfc",
  age:          "",
  mobile:       "",
  location:     "",
  bio:          "",
  profilePicture: "",
};

const DEFAULT_PREFS = {
  soundEnabled:  true,
  weeklyDigest:  false,
};

const DEFAULT_NOTIFICATIONS = [
  {
    id:   1,
    text: "Don't break your streak! 'Morning Meditation' is still pending for today.",
    time: "2 hours ago",
    read: false,
    type: "warning",
  },
  {
    id:   2,
    text: "Congratulations! You achieved the 'Mindful Master' badge for a 12-day meditation streak.",
    time: "1 day ago",
    read: false,
    type: "milestone",
  },
  {
    id:   3,
    text: "Weekly consistency report is ready. You hit 84% last week!",
    time: "3 days ago",
    read: true,
    type: "info",
  },
];

export function SettingsProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  // ── Theme ──────────────────────────────────────────────────────────────────
  const [theme, setThemeState] = useState(() => {
    try   { return localStorage.getItem(THEME_KEY) || "system"; }
    catch { return "system"; }
  });

  // ── Profile — seeded from AuthContext user, never from hardcoded defaults ──
  const [profile, setProfileState] = useState(EMPTY_PROFILE);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError,   setProfileError]   = useState("");

  // Whenever the authenticated user changes (login / logout / token refresh),
  // push their data straight into the profile state.
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setProfileState(EMPTY_PROFILE);
      return;
    }

    setProfileState({
      name:           user.name           || "",
      email:          user.email          || "",
      avatarColor:    user.avatarColor    || "#7c5cfc",
      age:            user.age            ?? "",
      mobile:         user.mobile         || "",
      location:       user.location       || "",
      bio:            user.bio            || "",
      profilePicture: user.profilePicture || "",
    });
  }, [user, isAuthenticated]);

  // ── Prefs ──────────────────────────────────────────────────────────────────
  const [prefs, setPrefsState] = useState(() => {
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_PREFS;
    } catch { return DEFAULT_PREFS; }
  });

  // ── Notifications ──────────────────────────────────────────────────────────
  const [notifications, setNotificationsState] = useState(() => {
    try {
      const stored = localStorage.getItem(NOTIF_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_NOTIFICATIONS;
    } catch { return DEFAULT_NOTIFICATIONS; }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ── Apply theme to the DOM ─────────────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (t) => {
      let active = t;
      if (t === "system") {
        active = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      root.setAttribute("data-theme", active);
    };
    applyTheme(theme);

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handle = () => applyTheme("system");
      mq.addEventListener    ? mq.addEventListener("change", handle)
                             : mq.addListener(handle);
      return () =>
        mq.removeEventListener ? mq.removeEventListener("change", handle)
                               : mq.removeListener(handle);
    }
  }, [theme]);

  // ── Setters ────────────────────────────────────────────────────────────────
  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    try { localStorage.setItem(THEME_KEY, newTheme); } catch { /* ignore */ }
  }, []);

  /**
   * updateProfile — persists changes to MongoDB via the backend API, then
   * mirrors the result into local state.  The AuthContext user object is NOT
   * mutated here because it would require re-issuing the JWT; the profile
   * state is our single source of truth for the Settings modal.
   */
  const updateProfile = useCallback(async (newProfile) => {
    setProfileLoading(true);
    setProfileError("");

    // Optimistic local update for instant UI feedback
    setProfileState((prev) => ({ ...prev, ...newProfile }));

    try {
      const saved = await apiUpdateProfile(newProfile);
      // Replace with server-confirmed values
      setProfileState({
        name:           saved.name           || "",
        email:          saved.email          || "",
        avatarColor:    saved.avatarColor    || "#7c5cfc",
        age:            saved.age            ?? "",
        mobile:         saved.mobile         || "",
        location:       saved.location       || "",
        bio:            saved.bio            || "",
        profilePicture: saved.profilePicture || "",
      });
      return { success: true };
    } catch (err) {
      const msg = err?.message || "Failed to save profile. Please try again.";
      setProfileError(msg);
      // Roll back optimistic update
      if (user) {
        setProfileState({
          name:           user.name           || "",
          email:          user.email          || "",
          avatarColor:    user.avatarColor    || "#7c5cfc",
          age:            user.age            ?? "",
          mobile:         user.mobile         || "",
          location:       user.location       || "",
          bio:            user.bio            || "",
          profilePicture: user.profilePicture || "",
        });
      }
      return { success: false, error: msg };
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  const updatePrefs = useCallback((newPrefs) => {
    setPrefsState((prev) => {
      const updated = { ...prev, ...newPrefs };
      try { localStorage.setItem(PREFS_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const markNotifAsRead = useCallback((id) => {
    setNotificationsState((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      try { localStorage.setItem(NOTIF_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const markAllNotifsAsRead = useCallback(() => {
    setNotificationsState((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      try { localStorage.setItem(NOTIF_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotificationsState([]);
    try { localStorage.setItem(NOTIF_KEY, JSON.stringify([])); } catch { /* ignore */ }
  }, []);

  const openSettings  = useCallback(() => setIsSettingsOpen(true),  []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        profile,
        profileLoading,
        profileError,
        updateProfile,
        prefs,
        updatePrefs,
        notifications,
        markNotifAsRead,
        markAllNotifsAsRead,
        clearNotifications,
        isSettingsOpen,
        openSettings,
        closeSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}
