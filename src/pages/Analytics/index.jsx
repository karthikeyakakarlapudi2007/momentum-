import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  CheckCircle2,
  BarChart3,
  Download,
} from "lucide-react";
import { useHabits } from "../../context/HabitsContext";
import {
  currentStreak,
  longestStreak,
  rateLastNDays,
  lastNDays,
  trendLastNDays,
} from "../../utils/habitStats";
import "./Analytics.css";

const CATEGORY_COLORS = {
  "Health & Wellness": "#a855f7",
  Health: "#06b6d4",
  Fitness: "#ef4444",
  Learning: "#3b82f6",
  Work: "#10b981",
  Mindfulness: "#a855f7",
  Personal: "#f59e0b",
  Social: "#f97316",
};

function colorFor(category) {
  return CATEGORY_COLORS[category] || "#7c5cfc";
}

function Analytics() {
  const { habits } = useHabits();
  const [range, setRange] = useState("Weekly");
  const days = range === "Weekly" ? 7 : 30;

  const stats = useMemo(() => {
    if (!habits.length) {
      return {
        avgRate: 0,
        bestStreak: 0,
        bestStreakHabit: null,
        doneCount: 0,
        totalCount: 0,
        weekly: Array.from({ length: 7 }, (_, i) => ({
          day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i],
          pct: 0,
        })),
        categories: [],
      };
    }

    const rates = habits.map((h) => rateLastNDays(h, days));
    const avgRate = rates.reduce((s, r) => s + r, 0) / rates.length;

    let bestStreak = 0;
    let bestStreakHabit = null;
    habits.forEach((h) => {
      const s = longestStreak(h);
      if (s > bestStreak) {
        bestStreak = s;
        bestStreakHabit = h;
      }
    });

    let doneCount = 0;
    let totalCount = 0;
    habits.forEach((h) => {
      const ds = lastNDays(h, days);
      ds.forEach((d) => {
        if (!d.pending) {
          totalCount++;
          if (d.done) doneCount++;
        }
      });
    });

    const weekTotals = [0, 0, 0, 0, 0, 0, 0];
    const weekCounts = [0, 0, 0, 0, 0, 0, 0];
    habits.forEach((h) => {
      const ds = lastNDays(h, days);
      ds.forEach((d) => {
        if (d.pending) return;
        const dow = new Date(d.iso).getDay();
        weekCounts[dow]++;
        if (d.done) weekTotals[dow]++;
      });
    });
    const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekly = weekday.map((day, i) => ({
      day,
      pct: weekCounts[i] ? Math.round((weekTotals[i] / weekCounts[i]) * 100) : 0,
    }));

    const catMap = new Map();
    habits.forEach((h) => {
      catMap.set(h.category, (catMap.get(h.category) || 0) + 1);
    });
    const totalHabits = habits.length;
    const categories = Array.from(catMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        pct: Math.round((count / totalHabits) * 100),
        color: colorFor(name),
      }))
      .sort((a, b) => b.count - a.count);

    return {
      avgRate: Math.round(avgRate * 10) / 10,
      bestStreak,
      bestStreakHabit,
      doneCount,
      totalCount,
      weekly,
      categories,
    };
  }, [habits, days]);

  const donutDash = useMemo(() => {
    const r = 56;
    const circumference = 2 * Math.PI * r;
    let acc = 0;
    return stats.categories.map((c) => {
      const dash = (c.pct / 100) * circumference;
      const segment = {
        ...c,
        dash,
        offset: -acc,
        circumference,
      };
      acc += dash;
      return segment;
    });
  }, [stats.categories]);

  const exportCsv = () => {
    const rows = [
      ["Habit", "Category", `${range} Rate %`, "Current Streak", "Longest Streak", "Trend"],
      ...habits.map((h) => [
        h.name,
        h.category,
        rateLastNDays(h, days),
        currentStreak(h),
        longestStreak(h),
        trendLastNDays(h, days),
      ]),
    ];
    const csv = rows
      .map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `momentum-habits-${range.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="analytics-page animate-fade-in">
      <header className="analytics-page__head">
        <div>
          <h1 className="analytics-page__title">Performance Analytics</h1>
          <p className="text-muted">
            Analyze your consistency and growth over time.
          </p>
        </div>

        <div className="range-toggle">
          {["Weekly", "Monthly"].map((opt) => (
            <button
              key={opt}
              className={`range-toggle__btn ${range === opt ? "is-active" : ""}`}
              onClick={() => setRange(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </header>

      <section className="analytics-stats">
        <div className="ana-stat">
          <div className="ana-stat__head">
            <span className="ana-stat__label">Avg. Consistency</span>
            <BarChart3 size={16} className="ana-stat__icon" />
          </div>
          <h2 className="ana-stat__value">
            {stats.avgRate}
            <small>%</small>
            {stats.avgRate >= 50 && (
              <span className="ana-stat__delta">+{Math.round(stats.avgRate / 20)}%</span>
            )}
          </h2>
        </div>

        <div className="ana-stat">
          <div className="ana-stat__head">
            <span className="ana-stat__label">Best Streak</span>
            <Flame size={16} className="ana-stat__icon ana-stat__icon--warning" />
          </div>
          <h2 className="ana-stat__value">
            {stats.bestStreak}
            <small>days</small>
          </h2>
          {stats.bestStreakHabit && (
            <Link
              to={`/habits/${stats.bestStreakHabit.id}`}
              className="ana-stat__sub"
            >
              Achieved in {stats.bestStreakHabit.name}
            </Link>
          )}
        </div>

        <div className="ana-stat">
          <div className="ana-stat__head">
            <span className="ana-stat__label">Completion Rate</span>
            <CheckCircle2 size={16} className="ana-stat__icon ana-stat__icon--success" />
          </div>
          <h2 className="ana-stat__value">
            {stats.doneCount}
            <small>/ {stats.totalCount}</small>
          </h2>
          <div className="ana-stat__bar">
            <div
              className="ana-stat__bar-fill"
              style={{
                width: `${stats.totalCount ? (stats.doneCount / stats.totalCount) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </section>

      <section className="analytics-mid">
        <div className="card card--padded">
          <div className="card__head">
            <h3 className="card__title">{range} Performance</h3>
            <span className="card__sub">Avg completion by day of week</span>
          </div>

          <div className="ana-chart">
            {stats.weekly.map((d) => (
              <div key={d.day} className="ana-chart__col">
                <div className="ana-chart__track">
                  <div
                    className="ana-chart__fill"
                    style={{ height: `${d.pct}%` }}
                    title={`${d.day}: ${d.pct}%`}
                  />
                </div>
                <span className="ana-chart__label">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card card--padded">
          <div className="card__head">
            <h3 className="card__title">Category Breakdown</h3>
          </div>

          <div className="donut">
            <svg viewBox="0 0 140 140" className="donut__svg">
              <circle
                cx="70"
                cy="70"
                r="56"
                fill="none"
                stroke="var(--bg-dark-700)"
                strokeWidth="14"
              />
              {donutDash.map((seg) => (
                <circle
                  key={seg.name}
                  cx="70"
                  cy="70"
                  r="56"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="14"
                  strokeDasharray={`${seg.dash} ${seg.circumference}`}
                  strokeDashoffset={seg.offset}
                  transform="rotate(-90 70 70)"
                  strokeLinecap="butt"
                />
              ))}
              <text
                x="70"
                y="66"
                textAnchor="middle"
                className="donut__num"
              >
                {habits.length}
              </text>
              <text
                x="70"
                y="84"
                textAnchor="middle"
                className="donut__sub"
              >
                Active
              </text>
            </svg>

            <ul className="donut-legend">
              {stats.categories.map((c) => (
                <li key={c.name}>
                  <span
                    className="donut-legend__dot"
                    style={{ background: c.color }}
                  />
                  <span className="donut-legend__name">{c.name}</span>
                  <span className="donut-legend__pct">{c.pct}%</span>
                </li>
              ))}
              {!stats.categories.length && (
                <li className="donut-legend__empty">No habits yet</li>
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="card card--padded">
        <div className="card__head">
          <h3 className="card__title">Habit Consistency Report</h3>
          <button
            className="export-btn"
            onClick={exportCsv}
            disabled={!habits.length}
          >
            <Download size={14} /> Export Data
          </button>
        </div>

        <div className="report-table">
          <div className="report-table__head">
            <span>Habit Name</span>
            <span>Category</span>
            <span>Last 7 Days</span>
            <span>{range} Rate</span>
            <span className="text-right">Trend</span>
          </div>

          {habits.map((habit) => {
            const week = lastNDays(habit, 7);
            const rate = rateLastNDays(habit, days);
            const trend = trendLastNDays(habit, days);
            return (
              <Link
                key={habit.id}
                to={`/habits/${habit.id}`}
                className="report-row"
              >
                <span className="report-row__name">
                  <span
                    className="report-row__icon"
                    style={{
                      background: `${colorFor(habit.category)}22`,
                      color: colorFor(habit.category),
                    }}
                  >
                    <Flame size={14} />
                  </span>
                  {habit.name}
                </span>

                <span>
                  <span
                    className="report-row__chip"
                    style={{
                      background: `${colorFor(habit.category)}1a`,
                      color: colorFor(habit.category),
                    }}
                  >
                    {habit.category}
                  </span>
                </span>

                <span className="report-row__dots">
                  {week.map((d, i) => (
                    <span
                      key={`${d.iso}-${i}`}
                      className={`mini-bar mini-bar--${
                        d.pending ? "pending" : d.done ? "done" : "miss"
                      }`}
                      title={`${d.iso}: ${d.pending ? "Not started" : d.done ? "Done" : "Missed"}`}
                    />
                  ))}
                </span>

                <span className="report-row__rate">
                  <strong>{rate}%</strong>
                </span>

                <span className={`report-row__trend trend--${trend}`}>
                  {trend === "up" && <TrendingUp size={16} />}
                  {trend === "down" && <TrendingDown size={16} />}
                  {trend === "flat" && <Minus size={16} />}
                </span>
              </Link>
            );
          })}

          {!habits.length && (
            <div className="report-row report-row--empty">
              No habits to analyze yet.{" "}
              <Link to="/habits/add" className="text-primary">
                Create your first habit
              </Link>
              .
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Analytics;
