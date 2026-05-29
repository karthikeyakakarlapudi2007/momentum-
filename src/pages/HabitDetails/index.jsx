import { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Flame,
  Pencil,
  Share2,
  Trash2,
  CheckCircle2,
  XCircle,
  Target,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import Button from "../../components/Button";
import { useHabit, useHabits } from "../../context/HabitsContext";
import {
  currentStreak,
  longestStreak,
  completionRate,
  weeklyProgress,
  yearlyHeatmap,
  recentHistory,
  isCompletedToday,
  activeDays,
  formatActiveSince,
} from "../../utils/habitStats";
import "./HabitDetails.css";

function HabitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const habit = useHabit(id);
  const { toggleToday, deleteHabit } = useHabits();

  const [toast, setToast] = useState("");
  const [showAllHistory, setShowAllHistory] = useState(false);

  const stats = useMemo(() => {
    if (!habit) return null;
    return {
      current: currentStreak(habit),
      longest: longestStreak(habit),
      rate: completionRate(habit),
      week: weeklyProgress(habit),
      heatmap: yearlyHeatmap(habit),
      history: recentHistory(habit, showAllHistory ? 20 : 5),
      days: activeDays(habit),
      doneToday: isCompletedToday(habit),
    };
  }, [habit, showAllHistory]);

  if (!habit) {
    return (
      <div className="habit-details animate-fade-in">
        <Link to="/dashboard" className="habit-details__back">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="card card--padded" style={{ marginTop: 16 }}>
          <h2 className="card__title">Habit not found</h2>
          <p className="card__sub">
            The habit you're looking for doesn't exist or was deleted.
          </p>
        </div>
      </div>
    );
  }

  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(""), 2200);
  };

  const handleMarkDone = () => {
    toggleToday(habit.id);
    showToast(stats.doneToday ? "Marked as not done" : "Nice — logged for today!");
  };

  const handleEdit = () => {
    navigate(`/habits/${habit.id}/edit`);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard");
    } catch {
      showToast("Couldn't copy link");
    }
  };

  const handleDelete = () => {
    const ok = window.confirm(
      `Delete "${habit.name}"? This can't be undone.`
    );
    if (!ok) return;
    deleteHabit(habit.id);
    navigate("/dashboard");
  };

  const maxBar = Math.max(...stats.week.map((d) => (d.done ? 100 : 25)), 1);

  const daysToGo = Math.max(0, (habit.targetStreak || 0) - stats.current);

  return (
    <div className="habit-details animate-fade-in">
      <Link to="/dashboard" className="habit-details__back">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <header className="habit-hero">
        <div className="habit-hero__left">
          <div className="habit-hero__meta">
            <span className="habit-hero__category">{habit.category}</span>
            <span className="habit-hero__dot">•</span>
            <span className="habit-hero__since">
              Active since {formatActiveSince(habit.createdAt)}
            </span>
          </div>
          <h1 className="habit-hero__title">{habit.name}</h1>
          <p className="habit-hero__desc">{habit.description}</p>
        </div>

        <div className="habit-hero__right">
          <div className="habit-hero__icons">
            <button
              className="icon-btn"
              aria-label="Edit habit"
              onClick={handleEdit}
              title="Edit habit"
            >
              <Pencil size={16} />
            </button>
            <button
              className="icon-btn"
              aria-label="Share habit"
              onClick={handleShare}
              title="Copy share link"
            >
              <Share2 size={16} />
            </button>
            <button
              className="icon-btn icon-btn--danger"
              aria-label="Delete habit"
              onClick={handleDelete}
              title="Delete habit"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <Button
            variant="primary"
            size="md"
            className={`mark-done-btn ${stats.doneToday ? "is-done" : ""}`}
            onClick={handleMarkDone}
          >
            {stats.doneToday ? (
              <>
                <RotateCcw size={16} /> Done Today
              </>
            ) : (
              <>
                <CheckCircle2 size={16} /> Mark Today Done
              </>
            )}
          </Button>
        </div>
      </header>

      <section className="habit-stats">
        <div className="habit-stat">
          <span className="habit-stat__label">Current Streak</span>
          <h2 className="habit-stat__value habit-stat__value--accent">
            {stats.current}
            <small>Days</small>
          </h2>
          <span className="habit-stat__sub habit-stat__sub--success">
            {stats.current >= stats.longest && stats.current > 0
              ? "Best performance this month"
              : "Keep it going!"}
          </span>
        </div>

        <div className="habit-stat habit-stat--with-icon">
          <div>
            <span className="habit-stat__label">Longest Streak</span>
            <h2 className="habit-stat__value">
              {stats.longest}
              <small>Days</small>
            </h2>
          </div>
          <div className="habit-stat__flame">
            <Flame size={28} />
          </div>
        </div>

        <div className="habit-stat">
          <span className="habit-stat__label">Next Target</span>
          <h2 className="habit-stat__value">
            {habit.targetStreak}
            <small>Days</small>
          </h2>
          <span className="habit-stat__sub">
            <Target size={12} /> {daysToGo} days to go for{" "}
            <em>{habit.targetBadge}</em> badge
          </span>
        </div>

        <div className="habit-stat">
          <span className="habit-stat__label">Completion Rate</span>
          <h2 className="habit-stat__value">
            {stats.rate}
            <small>%</small>
          </h2>
          <div className="habit-stat__bar">
            <div
              className="habit-stat__bar-fill"
              style={{ width: `${stats.rate}%` }}
            />
          </div>
        </div>
      </section>

      <section className="card card--padded">
        <div className="card__head">
          <div>
            <h3 className="card__title">Yearly Activity</h3>
            <p className="card__sub">
              Track your consistency across the last 12 months
            </p>
          </div>
          <div className="heatmap__legend">
            <span>Less</span>
            <span className="heatmap__cell heatmap__cell--0" />
            <span className="heatmap__cell heatmap__cell--1" />
            <span className="heatmap__cell heatmap__cell--2" />
            <span className="heatmap__cell heatmap__cell--3" />
            <span className="heatmap__cell heatmap__cell--4" />
            <span>More</span>
          </div>
        </div>

        <div className="heatmap">
          {stats.heatmap.map((col, week) => (
            <div key={week} className="heatmap__col">
              {col.map((c) => (
                <span
                  key={c.iso}
                  title={`${c.iso} — ${c.done ? "Done" : "Missed"}`}
                  className={`heatmap__cell heatmap__cell--${c.level}`}
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="habit-bottom">
        <div className="card card--padded habit-bottom__weekly">
          <div className="card__head">
            <h3 className="card__title">Weekly Progress</h3>
            <button className="pill-btn" onClick={() => showToast("Showing last 7 days")}>
              <TrendingUp size={14} /> Last 7 Days
            </button>
          </div>

          <div className="bar-chart">
            {stats.week.map((d, i) => {
              const value = d.done ? 100 : 25;
              return (
                <div key={`${d.iso}-${i}`} className="bar-chart__col">
                  <div className="bar-chart__track">
                    <div
                      className={`bar-chart__fill ${d.done ? "" : "is-missed"}`}
                      style={{ height: `${(value / maxBar) * 100}%` }}
                      title={`${d.iso} — ${d.done ? "Done" : "Missed"}`}
                    />
                  </div>
                  <span className="bar-chart__label">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card card--padded habit-bottom__history">
          <div className="card__head">
            <h3 className="card__title">Recent History</h3>
          </div>

          <ul className="history-list">
            {stats.history.map((entry) => (
              <li
                key={entry.id}
                className={`history-item ${entry.isToday ? "history-item--today" : ""}`}
              >
                <span
                  className={`history-item__icon history-item__icon--${
                    entry.done ? "done" : "missed"
                  }`}
                >
                  {entry.done ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <XCircle size={16} />
                  )}
                </span>
                <div className="history-item__text">
                  <p className="history-item__label">
                    {entry.label}
                    {entry.isToday && (
                      <span className="history-item__chip">Today</span>
                    )}
                  </p>
                  <span className="history-item__date">{entry.time}</span>
                </div>
              </li>
            ))}
          </ul>

          <button
            className="history-list__more"
            onClick={() => setShowAllHistory((s) => !s)}
          >
            {showAllHistory ? "Show Less" : "View Full History"}
          </button>
        </div>
      </section>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default HabitDetails;
