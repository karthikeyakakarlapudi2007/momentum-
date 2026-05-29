import { createContext, useContext, useEffect, useState, useCallback } from "react";

const SettingsContext = createContext(null);

const THEME_KEY = "momentum.settings.theme";
const PROFILE_KEY = "momentum.settings.profile";
const PREFS_KEY = "momentum.settings.prefs";
const NOTIF_KEY = "momentum.settings.notifications.v2"; // bumped to clear fake notifications

const DEFAULT_PROFILE = {
  name: "",
  email: "",
  avatarColor: "#7c5cfc",
  age: "",
  mobile: "",
  location: "",
  bio: "",
};

const DEFAULT_PREFS = {
  soundEnabled: true,
  weeklyDigest: false,
};

export function SettingsProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || "system";
    } catch {
      return "system";
    }
  });

  const [profile, setProfileState] = useState(() => {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [prefs, setPrefsState] = useState(() => {
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  });

  // Always start with empty notifications — no hardcoded fake ones
  const [notifications, setNotificationsState] = useState(() => {
    try {
      const stored = localStorage.getItem(NOTIF_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (themeValue) => {
      let activeTheme = themeValue;
      if (themeValue === "system") {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        activeTheme = systemPrefersDark ? "dark" : "light";
      }
      root.setAttribute("data-theme", activeTheme);
    };

    applyTheme(theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemThemeChange = () => applyTheme("system");

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleSystemThemeChange);
      } else {
        mediaQuery.addListener(handleSystemThemeChange);
      }

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener("change", handleSystemThemeChange);
        } else {
          mediaQuery.removeListener(handleSystemThemeChange);
        }
      };
    }
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    try { localStorage.setItem(THEME_KEY, newTheme); } catch { /* ignore */ }
  }, []);

  const updateProfile = useCallback((newProfile) => {
    setProfileState((prev) => {
      const updated = { ...prev, ...newProfile };
      try { localStorage.setItem(PROFILE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

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

  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        profile,
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
