import { createContext, useContext, useEffect, useState, useCallback } from "react";

const SettingsContext = createContext(null);

const THEME_KEY = "momentum.settings.theme";
const PROFILE_KEY = "momentum.settings.profile";
const PREFS_KEY = "momentum.settings.prefs";
const NOTIF_KEY = "momentum.settings.notifications";

const DEFAULT_PROFILE = {
  name: "Alex Carter",
  email: "alex.carter@momentum.app",
  avatarColor: "#7c5cfc",
};

const DEFAULT_PREFS = {
  soundEnabled: true,
  weeklyDigest: false,
};

const DEFAULT_NOTIFICATIONS = [
  {
    id: 1,
    text: "Don't break your streak! 'Morning Meditation' is still pending for today.",
    time: "2 hours ago",
    read: false,
    type: "warning",
  },
  {
    id: 2,
    text: "Congratulations! You achieved the 'Mindful Master' badge for a 12-day meditation streak.",
    time: "1 day ago",
    read: false,
    type: "milestone",
  },
  {
    id: 3,
    text: "Weekly consistency report is ready. You hit 84% last week!",
    time: "3 days ago",
    read: true,
    type: "info",
  },
];

export function SettingsProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      return stored || "system";
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

  const [notifications, setNotificationsState] = useState(() => {
    try {
      const stored = localStorage.getItem(NOTIF_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Set theme to DOM element and manage listeners
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

    // If system theme is selected, register list listener
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemThemeChange = () => {
        applyTheme("system");
      };

      // Compatibility check for older browsers
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

  // Update theme setting
  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_KEY, newTheme);
    } catch {
      /* ignore */
    }
  }, []);

  // Update profile setting
  const updateProfile = useCallback((newProfile) => {
    setProfileState((prev) => {
      const updated = { ...prev, ...newProfile };
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      return updated;
    });
  }, []);

  // Update other preferences
  const updatePrefs = useCallback((newPrefs) => {
    setPrefsState((prev) => {
      const updated = { ...prev, ...newPrefs };
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      return updated;
    });
  }, []);

  // Notifications callbacks
  const markNotifAsRead = useCallback((id) => {
    setNotificationsState((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      try {
        localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      return updated;
    });
  }, []);

  const markAllNotifsAsRead = useCallback(() => {
    setNotificationsState((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      try {
        localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      return updated;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotificationsState([]);
    try {
      localStorage.setItem(NOTIF_KEY, JSON.stringify([]));
    } catch {
      /* ignore */
    }
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
