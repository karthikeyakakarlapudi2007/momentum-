import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import {
  createHabit as apiCreateHabit,
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
  listHabits as apiListHabits,
} from "../services/habits";
import { useAuth } from "./AuthContext";

const STORAGE_PREFIX = "momentum.habits.";

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Build a user-scoped localStorage key so each user's habits are isolated.
 * Falls back to a generic key if no user id is available.
 */
function storageKey(userId) {
  return `${STORAGE_PREFIX}${userId || "anonymous"}`;
}

const HabitsContext = createContext(null);

export function HabitsProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  // Track current user id so we know when the user changes.
  const prevUserIdRef = useRef(null);

  // ── Fetch habits from backend (or fall back to localStorage) ──
  useEffect(() => {
    const userId = user?._id;

    // If user changed (login/logout/switch), reset habits immediately.
    if (prevUserIdRef.current !== userId) {
      prevUserIdRef.current = userId;
      setHabits([]);
      setLoading(true);
    }

    if (!isAuthenticated || !userId) {
      setHabits([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        // Try backend first — this is the source of truth.
        const backendHabits = await apiListHabits({ signal: controller.signal });
        if (cancelled) return;

        // Normalize: the backend returns _id, the frontend expects id.
        const normalized = (Array.isArray(backendHabits) ? backendHabits : []).map((h) => ({
          ...h,
          id: h._id || h.id,
          name: h.name || h.title || "Untitled",
          completions: h.completions || [],
          createdAt: h.createdAt
            ? new Date(h.createdAt).toISOString().slice(0, 10)
            : today(),
          schedule: h.schedule || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          targetStreak: h.targetStreak || 30,
          targetBadge: h.targetBadge || "Champion",
          color: h.color || "#778873",
        }));

        setHabits(normalized);

        // Cache in user-scoped localStorage for offline use.
        try {
          localStorage.setItem(storageKey(userId), JSON.stringify(normalized));
        } catch { /* storage full or unavailable */ }
      } catch (err) {
        if (err?.name === "AbortError" || cancelled) return;
        // Backend unavailable — fall back to cached localStorage data.
        try {
          const cached = localStorage.getItem(storageKey(userId));
          if (cached) {
            setHabits(JSON.parse(cached));
          }
        } catch { /* ignore */ }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [user?._id, isAuthenticated]);

  // ── Persist to user-scoped localStorage whenever habits change ──
  useEffect(() => {
    const userId = user?._id;
    if (!userId || !habits.length) return;
    try {
      localStorage.setItem(storageKey(userId), JSON.stringify(habits));
    } catch { /* ignore */ }
  }, [habits, user?._id]);

  const addHabit = useCallback(async (habit) => {
    const tempId = `temp_${Date.now()}`;
    const next = {
      id: tempId,
      createdAt: today(),
      completions: [],
      schedule: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      targetStreak: 30,
      targetBadge: "Champion",
      color: "#778873",
      description: "",
      ...habit,
      title: habit.title || habit.name,
    };

    // Optimistic local update.
    setHabits((prev) => [...prev, next]);

    try {
      const response = await apiCreateHabit(next);
      // The backend returns { message, habit } — extract the habit.
      const saved = response?.habit || response;
      if (saved && (saved.id || saved._id)) {
        const remoteId = saved._id || saved.id;
        // Replace the temp id with the real MongoDB _id and merge all server fields.
        setHabits((prev) =>
          prev.map((h) =>
            h.id === tempId
              ? {
                ...h,
                ...saved,
                id: remoteId,
                name: saved.title || saved.name || next.name,
              }
              : h
          )
        );
      }
      return { habit: { ...next, id: saved?._id || saved?.id || tempId }, synced: true };
    } catch (err) {
      // Roll back the optimistic update.
      setHabits((prev) => prev.filter((h) => h.id !== tempId));
      throw err;
    }
  }, []);

  const updateHabit = useCallback(async (id, patch) => {
    // Optimistic update
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...patch } : h))
    );
    try {
      await apiUpdateHabit(id, {
        title: patch.name || patch.title,
        category: patch.category,
        streak: patch.streak,
        completed: patch.completed,
        ...patch,
      });
    } catch (_) {
      // Non-fatal
    }
  }, []);

  const deleteHabit = useCallback(async (id) => {
    // Optimistic local removal.
    setHabits((prev) => prev.filter((h) => h.id !== id));

    try {
      await apiDeleteHabit(id);
      return { synced: true };
    } catch (err) {
      return { synced: false, error: err };
    }
  }, []);

  /**
   * Toggle today's completion for a habit.
   *
   * Uses an optimistic UI update (instant response) then persists to MongoDB
   * via the backend API. On failure the optimistic update is rolled back and
   * { synced: false, error } is returned so callers can show an error message.
   */
  const toggleToday = useCallback(async (id) => {
    const t = today();

    // Capture previous state for rollback, then apply optimistic update.
    let previousHabits;
    let newCompletions;

    setHabits((prev) => {
      previousHabits = prev;
      return prev.map((h) => {
        if (h.id !== id) return h;
        const done = h.completions.includes(t);
        newCompletions = done
          ? h.completions.filter((d) => d !== t)
          : [t, ...h.completions];
        return { ...h, completions: newCompletions };
      });
    });

    // newCompletions is undefined if the habit id wasn't found
    if (newCompletions === undefined) return { synced: false };

    try {
      await apiUpdateHabit(id, { completions: newCompletions });
      return { synced: true };
    } catch (err) {
      // Roll back the optimistic update so the UI matches reality.
      setHabits(previousHabits);
      console.error("[toggleToday] Failed to persist completion:", err);
      return { synced: false, error: err };
    }
  }, []);

  const resetHabits = useCallback(() => setHabits([]), []);

  /**
   * Force-refresh habits from the backend.
   */
  const refreshHabits = useCallback(async () => {
    try {
      const backendHabits = await apiListHabits();
      const normalized = (Array.isArray(backendHabits) ? backendHabits : []).map((h) => ({
        ...h,
        id: h._id || h.id,
        name: h.name || h.title || "Untitled",
        completions: h.completions || [],
        createdAt: h.createdAt
          ? new Date(h.createdAt).toISOString().slice(0, 10)
          : today(),
        schedule: h.schedule || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        targetStreak: h.targetStreak || 30,
        targetBadge: h.targetBadge || "Champion",
        color: h.color || "#778873",
      }));
      setHabits(normalized);
    } catch { /* ignore — keep local state */ }
  }, []);

  return (
    <HabitsContext.Provider
      value={{
        habits,
        loading,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleToday,
        resetHabits,
        refreshHabits,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error("useHabits must be used inside HabitsProvider");
  return ctx;
}

export function useHabit(id) {
  const { habits } = useHabits();
  return habits.find((h) => String(h.id) === String(id));
}
