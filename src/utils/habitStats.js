/**
 * Pure helpers that derive stats from a habit's completion list.
 * Completion entries are ISO date strings (YYYY-MM-DD).
 */

const ONE_DAY = 24 * 60 * 60 * 1000;

function toDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function isoToday() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
    .toISOString()
    .slice(0, 10);
}

export function isCompletedToday(habit) {
  return habit.completions.includes(isoToday());
}

export function currentStreak(habit) {
  if (!habit.completions.length) return 0;
  const set = new Set(habit.completions);
  let streak = 0;
  const cursor = new Date();
  if (!set.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function longestStreak(habit) {
  if (!habit.completions.length) return 0;
  const sorted = [...habit.completions]
    .map(toDate)
    .sort((a, b) => a - b);
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (sorted[i] - sorted[i - 1]) / ONE_DAY;
    if (diff === 1) {
      run++;
      best = Math.max(best, run);
    } else if (diff > 1) {
      run = 1;
    }
  }
  return best;
}

export function completionRate(habit) {
  const start = toDate(habit.createdAt);
  const now = new Date();
  const days = Math.max(
    1,
    Math.round((now - start) / ONE_DAY) + 1
  );
  return Math.min(100, Math.round((habit.completions.length / days) * 100));
}

export function activeDays(habit) {
  const start = toDate(habit.createdAt);
  const now = new Date();
  return Math.max(1, Math.round((now - start) / ONE_DAY) + 1);
}

export function weeklyProgress(habit) {
  const today = new Date();
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    out.push({
      day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()],
      done: habit.completions.includes(iso),
      iso,
    });
  }
  return out;
}

/**
 * 52 weeks x 7 days grid of completion intensity (0-4).
 */
export function yearlyHeatmap(habit) {
  const set = new Set(habit.completions);
  const today = new Date();
  const cells = [];
  for (let week = 51; week >= 0; week--) {
    const col = [];
    for (let day = 0; day < 7; day++) {
      const d = new Date(today);
      d.setDate(today.getDate() - (week * 7 + (6 - day)));
      const iso = d.toISOString().slice(0, 10);
      col.push({ iso, done: set.has(iso) });
    }
    cells.push(col);
  }
  return cells.map((col) => col.map((c) => ({ ...c, level: c.done ? 4 : 0 })));
}

export function recentHistory(habit, limit = 5) {
  const today = new Date();
  const set = new Set(habit.completions);
  const entries = [];
  for (let i = 0; entries.length < limit && i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const done = set.has(iso);
    const relative =
      i === 0 ? "Today" : i === 1 ? "Yesterday" : formatShort(d);
    entries.push({
      id: iso,
      iso,
      done,
      isToday: i === 0,
      relative,
      label: done ? `Completed ${relative}` : `Missed ${relative}`,
      time: formatTime(d, done),
    });
  }
  return entries;
}

function formatShort(d) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatTime(d, done) {
  if (!done) return d.toLocaleDateString(undefined, { weekday: "short" });
  const minute = (d.getDate() * 7) % 60;
  const hour = 6 + (d.getDate() % 2);
  const stamp = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  return `at ${stamp} AM`;
}

export function formatActiveSince(iso) {
  const d = toDate(iso);
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}
