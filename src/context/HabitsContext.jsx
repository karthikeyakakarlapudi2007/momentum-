import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createHabit as apiCreateHabit } from "../services/habits";

const STORAGE_KEY = "momentum.habits.v2";

const today = () => new Date().toISOString().slice(0, 10);

const seedHabits = [
  {
    id: 1,
    name: "Morning Meditation",
    category: "Health & Wellness",
    color: "#a855f7",
    description:
      "Daily 15-minute mindfulness session to improve focus and mental clarity for the upcoming workday.",
    createdAt: "2024-01-15",
    schedule: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    targetStreak: 50,
    targetBadge: "Mindful Master",
    completions: seedCompletions({ rate: 0.94, recentStreak: 12 }),
  },
  {
    id: 2,
    name: "Read 30 Minutes",
    category: "Learning",
    color: "#3b82f6",
    description: "Read non-fiction or technical books for at least 30 minutes a day.",
    createdAt: "2024-03-02",
    schedule: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    targetStreak: 30,
    targetBadge: "Bookworm",
    completions: seedCompletions({ rate: 0.72, recentStreak: 6 }),
  },
  {
    id: 3,
    name: "Morning Workout",
    category: "Fitness",
    color: "#ef4444",
    description: "30-minute workout to build strength and endurance.",
    createdAt: "2024-05-10",
    schedule: ["Mon", "Wed", "Fri"],
    targetStreak: 20,
    targetBadge: "Iron Will",
    completions: seedCompletions({ rate: 0.55, recentStreak: 3 }),
  },
  {
    id: 4,
    name: "Drink Water",
    category: "Health",
    color: "#06b6d4",
    description: "Drink 8 glasses of water throughout the day.",
    createdAt: "2024-02-20",
    schedule: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    targetStreak: 60,
    targetBadge: "Hydration Hero",
    completions: seedCompletions({ rate: 0.88, recentStreak: 9 }),
  },
];

/**
 * Build a realistic completions list.
 *   - The most recent `recentStreak` days are all marked done (today included),
 *     so the UI never opens on an empty/missed-only history.
 *   - Older days use a deterministic pseudo-random spread at the given `rate`.
 */
function seedCompletions({ rate, recentStreak }) {
  const out = [];
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const iso = d.toISOString().slice(0, 10);

    if (i < recentStreak) {
      out.push(iso);
      continue;
    }

    const seed = ((i * 9301 + 49297) % 233280) / 233280;
    if (seed < rate) out.push(iso);
  }
  return out;
}

const HabitsContext = createContext(null);

export function HabitsProvider({ children }) {
  const [habits, setHabits] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (_) {}
    return seedHabits;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  const addHabit = useCallback(async (habit) => {
    const next = {
      id: Date.now(),
      createdAt: today(),
      completions: [],
      schedule: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      targetStreak: 30,
      targetBadge: "Champion",
      color: "#7c5cfc",
      goal: "",
      reminderTime: "",
      notes: "",
      ...habit,
    };

    setHabits((prev) => [...prev, next]);

    try {
      const saved = await apiCreateHabit(next);
      if (saved && (saved.id || saved._id)) {
        const remoteId = saved.id || saved._id;
        setHabits((prev) =>
          prev.map((h) => (h.id === next.id ? { ...h, ...saved, id: remoteId } : h))
        );
      }
      return { habit: next, synced: true };
    } catch (err) {
      return { habit: next, synced: false, error: err };
    }
  }, []);

  const updateHabit = useCallback((id, patch) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...patch } : h))
    );
  }, []);

  const deleteHabit = useCallback((id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const toggleToday = useCallback((id) => {
    const t = today();
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
  }, []);

  const resetHabits = useCallback(() => setHabits(seedHabits), []);

  return (
    <HabitsContext.Provider
      value={{
        habits,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleToday,
        resetHabits,
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
