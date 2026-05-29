import { createContext, useContext, useState, useCallback } from "react";
import { loginUser, registerUser } from "../services/auth";

const AUTH_KEY = "momentum.auth.user";

const AuthContext = createContext(null);

function loadUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser({ email, password });
      // Backend returns { _id, name, email, message }
      const userData = { _id: data._id, name: data.name, email: data.email };
      localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err?.message || "Login failed. Please try again.";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await registerUser({ name, email, password });
      const userData = { _id: data._id, name: data.name, email: data.email };
      localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err?.message || "Registration failed. Please try again.";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export default AuthContext;
