import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X as XIcon,
  Circle,
  CheckCircle2,
  Plus,
  Flame,
  Zap,
} from "lucide-react";
import { useHabits } from "../../context/HabitsContext";
import { currentStreak, isCompletedToday } from "../../utils/habitStats";
import "./Calendar.css";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const QUOTES = [
  "Consistency is the playground of the unimaginative, but the foundation of the elite.",
  "Small habits, repeated daily, build extraordinary lives.",
  "Discipline is the bridge between goals and accomplishment.",
  "You don't rise to the level of your goals — you fall to the level of your systems.",
];

function isoOf(year, month, day) {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function Calendar() {
  const { habits, toggleToday } = useHabits();

  const now = new Date();
  const [view, setView] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });
  const [selectedIso, setSelectedIso] = useState(null);

  const todayIso = isoOf(now.getFullYear(), now.getMonth(), now.getDate());

  const completionSet = useMemo(() => {
    const map = new Map();
    habits.forEach((h) => {
      h.completions.forEach((iso) => {
        if (!map.has(iso)) map.set(iso, new Set());
        map.get(iso).add(h.id);
      });
    });
    return map;
  }, [habits]);

  const monthData = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const lastDay = new Date(view.year, view.month + 1, 0).getDate();
    const leadDays = first.getDay();
    const cells = [];

    for (let i = leadDays; i > 0; i--) {
      const d = new Date(view.year, view.month, 1 - i);
      cells.push({
        date: d.getDate(),
        iso: isoOf(d.getFullYear(), d.getMonth(), d.getDate()),
        outside: true,
      });
    }
    for (let day = 1; day <= lastDay; day++) {
      cells.push({
        date: day,
        iso: isoOf(view.year, view.month, day),
        outside: false,
      });
    }
    while (cells.length % 7 !== 0) {
      const next = cells.length - (leadDays + lastDay) + 1;
      const d = new Date(view.year, view.month + 1, next);
      cells.push({
        date: d.getDate(),
        iso: isoOf(d.getFullYear(), d.getMonth(), d.getDate()),
        outside: true,
      });
    }

    return cells.map((c) => {
      const doneSet = completionSet.get(c.iso) || new Set();
      const activeOnDay = habits.filter((h) => h.createdAt <= c.iso);
      const total = activeOnDay.length;
      const done = activeOnDay.filter((h) => doneSet.has(h.id)).length;
      const pct = total ? Math.round((done / total) * 100) : 0;
      return { ...c, done, total, pct, activeHabits: activeOnDay };
    });
  }, [view, habits, completionSet]);

  const monthRate = useMemo(() => {
    const inMonth = monthData.filter(
      (c) => !c.outside && c.iso <= todayIso && c.total > 0
    );
    if (!inMonth.length) return 0;
    const total = inMonth.reduce((s, c) => s + c.total, 0);
    const done = inMonth.reduce((s, c) => s + c.done, 0);
    return total ? Math.round((done / total) * 100) : 0;
  }, [monthData, todayIso]);

  const intensityCounts = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0];
    monthData
      .filter((c) => !c.outside)
      .forEach((c) => {
        if (c.pct === 0) buckets[0]++;
        else if (c.pct < 30) buckets[1]++;
        else if (c.pct < 60) buckets[2]++;
        else if (c.pct < 90) buckets[3]++;
        else buckets[4]++;
      });
    return buckets;
  }, [monthData]);

  const focusHabits = useMemo(
    () =>
      [...habits]
        .sort((a, b) => currentStreak(b) - currentStreak(a))
        .slice(0, 3),
    [habits]
  );

  const quote = QUOTES[view.month % QUOTES.length];

  const goToMonth = (delta) => {
    setView((v) => {
      const next = new Date(v.year, v.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
    setSelectedIso(null);
  };

  const goToToday = () => {
    setView({ year: now.getFullYear(), month: now.getMonth() });
    setSelectedIso(todayIso);
  };

  const selectedDay = selectedIso
    ? monthData.find((c) => c.iso === selectedIso)
    : null;
  const selectedDone = selectedIso ? completionSet.get(selectedIso) : null;

  return (
    <div className="calendar-page animate-fade-in">
      <div className="calendar-page__crumbs">
        <Link to="/dashboard">Dashboard</Link>
        <ChevronRight size={14} />
        <span>Calendar</span>
        <ChevronRight size={14} />
        <span className="active">Monthly View</span>
      </div>

      <div className="calendar-layout">
        <section className="calendar-main">
          <header className="calendar-main__head">
            <div>
              <h1 className="calendar-main__title">
                {months[view.month]} {view.year}
              </h1>
              <p className="text-muted">
                You've maintained a <strong>{monthRate}%</strong> consistency rate
                this month.
              </p>
            </div>
            <div className="calendar-main__nav">
              <button
                className="cal-nav-btn"
                onClick={() => goToMonth(-1)}
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>
              <button className="cal-today-btn" onClick={goToToday}>
                Today
              </button>
              <button
                className="cal-nav-btn"
                onClick={() => goToMonth(1)}
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </header>

          <div className="cal-grid">
            <div className="cal-grid__weekdays">
              {weekdays.map((d) => (
                <span key={d}>{d.toUpperCase()}</span>
              ))}
            </div>

            <div className="cal-grid__days">
              {monthData.map((cell) => {
                const isToday = cell.iso === todayIso;
                const isSelected = cell.iso === selectedIso;
                const isFuture = cell.iso > todayIso;
                return (
                  <button
                    key={cell.iso}
                    onClick={() => setSelectedIso(cell.iso)}
                    className={[
                      "cal-day",
                      cell.outside && "cal-day--outside",
                      isToday && "cal-day--today",
                      isSelected && "cal-day--selected",
                      isFuture && "cal-day--future",
                      cell.pct === 100 && "cal-day--full",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="cal-day__top">
                      <span className="cal-day__num">{cell.date}</span>
                      {isToday && <span className="cal-day__chip">TODAY</span>}
                      {!isToday && !isFuture && cell.pct === 100 && (
                        <span className="cal-day__dot cal-day__dot--success" />
                      )}
                      {!isToday && !isFuture && cell.total > 0 && cell.pct === 0 && !cell.outside && (
                        <XIcon size={12} className="cal-day__x" />
                      )}
                    </div>

                    {!cell.outside && !isFuture && cell.total > 0 && (
                      <>
                        {cell.pct === 100 && (
                          <span className="cal-day__label cal-day__label--success">
                            100% DONE
                          </span>
                        )}
                        {cell.pct > 0 && cell.pct < 100 && (
                          <span className="cal-day__label">
                            {cell.done}/{cell.total} COMPLETED
                          </span>
                        )}
                        <div className="cal-day__bar">
                          <div
                            className="cal-day__bar-fill"
                            style={{ width: `${cell.pct}%` }}
                          />
                        </div>
                      </>
                    )}

                    {!cell.outside && !isFuture && cell.total === 0 && (
                      <span className="cal-day__label cal-day__label--muted">
                        No habits yet
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="calendar-side">
          <div className="side-card">
            <div className="side-card__head">
              <h3>Activity Intensity</h3>
            </div>
            <div className="intensity-grid">
              {intensityCounts.map((count, level) => (
                <div key={level} className="intensity-bucket">
                  {Array.from({ length: Math.max(count, 1) }).map((_, i) => (
                    <span
                      key={i}
                      className={`intensity-cell intensity-cell--${level}`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="intensity-legend">
              <span>LESS</span>
              <div className="intensity-legend__cells">
                {[0, 1, 2, 3, 4].map((l) => (
                  <span
                    key={l}
                    className={`intensity-cell intensity-cell--${l}`}
                  />
                ))}
              </div>
              <span>MORE</span>
            </div>
          </div>

          <div className="side-card">
            <div className="side-card__head">
              <h3>Focus Habits</h3>
              <Link to="/habits" className="side-card__more">
                View All
              </Link>
            </div>
            <ul className="focus-list">
              {focusHabits.map((h) => {
                const done = isCompletedToday(h);
                const streak = currentStreak(h);
                return (
                  <li key={h.id} className="focus-item">
                    <Link to={`/habits/${h.id}`} className="focus-item__info">
                      <span
                        className="focus-item__dot"
                        style={{ background: `${h.color}22`, color: h.color }}
                      >
                        <Flame size={14} />
                      </span>
                      <div>
                        <p className="focus-item__name">{h.name}</p>
                        <span className="focus-item__sub">
                          Streak: {streak} days
                        </span>
                      </div>
                    </Link>
                    <button
                      className={`focus-item__toggle ${done ? "is-done" : ""}`}
                      onClick={() => toggleToday(h.id)}
                      aria-label={done ? "Mark not done" : "Mark done today"}
                    >
                      {done ? (
                        <CheckCircle2 size={18} />
                      ) : streak === 0 ? (
                        <XIcon size={18} />
                      ) : (
                        <Circle size={18} />
                      )}
                    </button>
                  </li>
                );
              })}
              {!focusHabits.length && (
                <li className="focus-item focus-item--empty">
                  No habits yet — add one to get started.
                </li>
              )}
            </ul>
          </div>

          <div className="quote-card">
            <Zap size={20} className="quote-card__icon" />
            <p>&ldquo;{quote}&rdquo;</p>
          </div>
        </aside>
      </div>

      {selectedDay && (
        <div
          className="day-sheet"
          onClick={(e) => e.target === e.currentTarget && setSelectedIso(null)}
        >
          <div className="day-sheet__panel">
            <div className="day-sheet__head">
              <div>
                <h3>
                  {new Date(selectedDay.iso).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <p className="text-muted">
                  {selectedDay.iso > todayIso
                    ? `${selectedDay.total} habit${selectedDay.total === 1 ? "" : "s"} scheduled`
                    : selectedDay.total === 0
                      ? "No habits were tracked on this day"
                      : selectedDay.iso === todayIso
                        ? `${selectedDay.done}/${selectedDay.total} done so far today`
                        : `${selectedDay.done}/${selectedDay.total} habits completed`}
                </p>
              </div>
              <button
                className="cal-nav-btn"
                onClick={() => setSelectedIso(null)}
                aria-label="Close"
              >
                <XIcon size={16} />
              </button>
            </div>
            <ul className="day-sheet__list">
              {selectedDay.activeHabits.length === 0 && (
                <li className="focus-item focus-item--empty">
                  No habits were active on this date yet.
                </li>
              )}
              {selectedDay.activeHabits.map((h) => {
                const done = selectedDone?.has(h.id);
                const isFuture = selectedDay.iso > todayIso;
                const isToday = selectedDay.iso === todayIso;
                return (
                  <li key={h.id} className="day-sheet__item">
                    <span
                      className="focus-item__dot"
                      style={{ background: `${h.color}22`, color: h.color }}
                    >
                      <Flame size={12} />
                    </span>
                    <span className="day-sheet__item-name">{h.name}</span>

                    {isFuture ? (
                      <span className="day-sheet__badge day-sheet__badge--pending">
                        Upcoming
                      </span>
                    ) : done ? (
                      <span className="day-sheet__badge day-sheet__badge--done">
                        <Check size={12} /> Done
                      </span>
                    ) : isToday ? (
                      <button
                        className="day-sheet__action"
                        onClick={() => toggleToday(h.id)}
                      >
                        <Check size={12} /> Mark Done
                      </button>
                    ) : (
                      <span className="day-sheet__badge">
                        <XIcon size={12} /> Missed
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <Link to="/habits/add" className="fab" aria-label="Add habit">
        <Plus size={22} />
      </Link>
    </div>
  );
}

export default Calendar;
