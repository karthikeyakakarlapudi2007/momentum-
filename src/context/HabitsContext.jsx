import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { listHabits, createHabit as apiCreateHabit, updateHabit as apiUpdateHabit, deleteHabit as apiDeleteHabit, toggleHabit as apiToggleHabit } from "../services/habits";

const STORAGE_KEY = "momentum.habits.v3"; // bumped version to clear old seed data

const today = () => new Date().toISOString().slice(0, 10);

const HabitsContext = createContext(null);

export function HabitsProvider({ children }) {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  // On mount: fetch all habits from the backend
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    listHabits({ signal: controller.signal })
      .then((remoteHabits) => {
        if (!Array.isArray(remoteHabits)) {
          setHabits([]);
          return;
        }
        // Map backend shape to frontend shape
        const mapped = remoteHabits.map((h) => ({
          id: h._id,
          name: h.title,
          category: h.category || "General",
          color: h.color || "#7c5cfc",
          description: h.description || "",
          createdAt: h.createdAt ? h.createdAt.slice(0, 10) : today(),
          schedule: h.schedule || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          targetStreak: h.targetStreak || 30,
          targetBadge: h.targetBadge || "Champion",
          completions: h.completions || [],
        }));
        setHabits(mapped);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      })
      .catch(() => {
        // Backend unavailable — try localStorage cache
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) setHabits(JSON.parse(stored));
          else setHabits([]);
        } catch {
          setHabits([]);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  // Persist to localStorage whenever habits change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    }
  }, [habits, loading]);

  const addHabit = useCallback(async (habit) => {
    const tempId = `temp_${Date.now()}`;
    const next = {
      id: tempId,
      createdAt: today(),
      completions: [],
      schedule: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      targetStreak: 30,
      targetBadge: "Champion",
      color: "#7c5cfc",
      description: "",
      ...habit,
    };

    // Optimistic update
    setHabits((prev) => [...prev, next]);

    try {
      const saved = await apiCreateHabit({
        title: next.name || next.title,
        category: next.category,
        streak: 0,
        completed: false,
      });
      const remoteId = saved?.habit?._id || saved?._id || saved?.id;
      if (remoteId) {
        setHabits((prev) =>
          prev.map((h) => (h.id === tempId ? { ...h, id: remoteId } : h))
        );
      }
      return { habit: next, synced: true };
    } catch (err) {
      return { habit: next, synced: false, error: err };
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
      });
    } catch (_) {
      // Non-fatal
    }
  }, []);


  const deleteHabit = useCallback(async (id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    try {
      await apiDeleteHabit(id);
    } catch (_) {
      // Non-fatal
    }
  }, []);

  const toggleToday = useCallback(async (id) => {
    const t = today();
    // Optimistic update immediately for snappy UI
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const done = h.completions.includes(t);
        return {
          ...h,
          completions: done
            ? h.completions.filter((d) => d !== t)
            : [t, ...h.completions],
        };
      })
    );
    // Persist to MongoDB and sync the authoritative completions array from server
    try {
      const result = await apiToggleHabit(id);
      if (result?.habit?.completions) {
        setHabits((prev) =>
          prev.map((h) =>
            h.id === id
              ? { ...h, completions: result.habit.completions, streak: result.habit.streak }
              : h
          )
        );
      }
    } catch (_) {
      // Non-fatal — optimistic state remains
    }
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
