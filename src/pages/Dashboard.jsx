import { Link } from "react-router-dom";
import {
  Flame,
  CheckCircle2,
  Circle,
  TrendingUp,
  Plus,
  Calendar as CalendarIcon,
  Zap,
  Target,
} from "lucide-react";
import Button from "../components/Button";
import { useHabits } from "../context/HabitsContext";
import { currentStreak, isCompletedToday } from "../utils/habitStats";
import "../styles/dashboard.css";

function Dashboard() {
  const { habits, toggleToday } = useHabits();

  const completedCount = habits.filter(isCompletedToday).length;
  const totalCount = habits.length;
  const progress = totalCount
    ? Math.round((completedCount / totalCount) * 100)
    : 0;
  const topStreak = habits.reduce(
    (max, h) => Math.max(max, currentStreak(h)),
    0
  );

  return (
    <div className="dashboard animate-fade-in">
      <header className="dashboard__header flex items-center justify-between mb-8">
        <div>
          <h1 className="dashboard__title">Master Your Day 👋</h1>
          <p className="text-muted">
            You have {totalCount - completedCount} habits left to complete today.
          </p>
        </div>
        <Link to="/habits/add">
          <Button variant="primary" size="md">
            <Plus size={18} /> New Habit
          </Button>
        </Link>
      </header>

      <div className="dashboard__grid mb-12">
        <div className="stat-card">
          <div className="stat-card__icon purple">
            <Zap size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-label">Top Streak</span>
            <h2 className="stat-value">{topStreak} Days</h2>
          </div>
          <div className="stat-card__pill">Live</div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon blue">
            <Target size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-label">Daily Progress</span>
            <h2 className="stat-value">{progress}%</h2>
          </div>
          <div className="stat-card__progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon cyan">
            <CalendarIcon size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-label">Active Habits</span>
            <h2 className="stat-value">{totalCount}</h2>
          </div>
          <div className="stat-card__pill">On track</div>
        </div>
      </div>

      <section className="dashboard__habits">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Today's Focus</h2>
          <span className="text-dim text-sm">
            {completedCount}/{totalCount} completed
          </span>
        </div>

        <div className="habit-list flex flex-col gap-3">
          {habits.map((habit) => {
            const done = isCompletedToday(habit);
            const streak = currentStreak(habit);
            return (
              <div
                key={habit.id}
                className={`habit-item ${done ? "completed" : ""}`}
              >
                <button
                  className="habit-checkbox"
                  style={{ "--accent": habit.color }}
                  onClick={() => toggleToday(habit.id)}
                  aria-label={done ? "Mark not done" : "Mark done"}
                >
                  {done ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>

                <Link to={`/habits/${habit.id}`} className="habit-info">
                  <div className="flex items-center gap-3">
                    <h3 className="habit-name">{habit.name}</h3>
                    <span
                      className="habit-badge"
                      style={{
                        backgroundColor: `${habit.color}15`,
                        color: habit.color,
                      }}
                    >
                      {habit.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Flame size={14} className="text-warning" />
                    <span className="text-xs text-muted">
                      {streak} day streak
                    </span>
                  </div>
                </Link>

                <Link to={`/habits/${habit.id}`} className="habit-actions">
                  <TrendingUp size={18} className="text-dim hover:text-white pointer" />
                </Link>
              </div>
            );
          })}

          {!habits.length && (
            <div className="empty-state">
              <p className="text-muted">
                No habits yet — create your first one to start building momentum.
              </p>
              <Link to="/habits/add">
                <Button variant="primary" size="md">
                  <Plus size={16} /> Add Habit
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
