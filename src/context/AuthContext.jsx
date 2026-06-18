import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  loginUser as apiLogin,
  registerUser as apiRegister,
  getProfile as apiGetProfile,
} from "../services/auth";
import { TOKEN_KEY } from "../services/api";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import { googleAuth as apiGoogleAuth } from "../services/auth";

const USER_KEY = "momentum.user";

const AuthContext = createContext(null);

/** Read the persisted session from localStorage (used to seed initial state). */
function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // Seed synchronously from storage so a refresh doesn't flash the login page.
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(readStoredToken);
  // `loading` covers the one-time startup check that re-validates the token.
  const [loading, setLoading] = useState(Boolean(readStoredToken()));

  const persist = useCallback((nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    try {
      if (nextToken) {
        localStorage.setItem(TOKEN_KEY, nextToken);
        localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    } catch {
      // storage unavailable (private mode) — in-memory state still works
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch {
      // Ignore firebase sign out errors
    }
    persist(null, null);
  }, [persist]);

  // On mount (and whenever a token exists), confirm it's still valid by
  // hitting /profile. An expired/invalid token logs the user out cleanly.
  useEffect(() => {
    // No token → nothing to validate. `loading` was already seeded to false
    // from storage on mount, so there's no state to flip here.
    if (!token) return;

    const controller = new AbortController();
    (async () => {
      try {
        const profile = await apiGetProfile({ signal: controller.signal });
        // Refresh the cached user with the server's source of truth.
        setUser((prev) => ({ ...prev, ...profile }));
        try {
          localStorage.setItem(
            USER_KEY,
            JSON.stringify({ ...readStoredUser(), ...profile })
          );
        } catch {
          /* ignore */
        }
      } catch (err) {
        if (err?.name === "AbortError") return;
        // 401 (expired/invalid) → drop the session. Network errors are left
        // alone so the app still works offline with the cached user.
        if (err?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
    // Only re-run when the token identity changes (login/logout).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = useCallback(
    async (credentials) => {
      const data = await apiLogin(credentials);
      const { token: jwt, ...userData } = data;
      persist(userData, jwt);
      return userData;
    },
    [persist]
  );

  const register = useCallback(
    async (details) => {
      const data = await apiRegister(details);
      const { token: jwt, ...userData } = data;
      persist(userData, jwt);
      return userData;
    },
    [persist]
  );

  const loginWithGoogle = useCallback(async () => {
    if (!auth) {
      throw new Error("Firebase is not configured");
    }
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();

    const data = await apiGoogleAuth(idToken);
    const { token: jwt, ...userData } = data;
    persist(userData, jwt);
    return userData;
  }, [persist]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      loginWithGoogle,
      logout,
    }),
    [user, token, loading, login, register, loginWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
