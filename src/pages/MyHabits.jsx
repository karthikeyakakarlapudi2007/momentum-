import { Link } from "react-router-dom";
import { Flame, Plus, ChevronRight, Target } from "lucide-react";
import Button from "../components/Button";
import { useHabits } from "../context/HabitsContext";
import {
  currentStreak,
  completionRate,
  isCompletedToday,
} from "../utils/habitStats";
import "../styles/myhabits.css";

function MyHabits() {
  const { habits } = useHabits();

  return (
    <div className="my-habits animate-fade-in">
      <header className="my-habits__header">
        <div>
          <h1 className="dashboard__title">My Habits</h1>
          <p className="text-muted">
            {habits.length
              ? `Manage and track your ${habits.length} active habit${habits.length === 1 ? "" : "s"}.`
              : "You haven't created any habits yet."}
          </p>
        </div>
        <Link to="/habits/add">
          <Button variant="primary" size="md">
            <Plus size={18} /> New Habit
          </Button>
        </Link>
      </header>

      {habits.length === 0 ? (
        <div className="empty-state">
          <Target size={32} className="text-dim" />
          <p className="text-muted">
            Create your first habit to start building momentum.
          </p>
          <Link to="/habits/add">
            <Button variant="primary" size="md">
              <Plus size={16} /> Add Habit
            </Button>
          </Link>
        </div>
      ) : (
        <div className="my-habits__grid">
          {habits.map((habit) => {
            const streak = currentStreak(habit);
            const rate = completionRate(habit);
            const done = isCompletedToday(habit);
            return (
              <Link
                key={habit.id}
                to={`/habits/${habit.id}`}
                className="habit-card"
                style={{ "--accent": habit.color }}
              >
                <div className="habit-card__head">
                  <span
                    className="habit-card__badge"
                    style={{
                      backgroundColor: `${habit.color}1f`,
                      color: habit.color,
                    }}
                  >
                    {habit.category}
                  </span>
                  {done && (
                    <span className="habit-card__pill">Done today</span>
                  )}
                </div>

                <h3 className="habit-card__name">{habit.name}</h3>
                <p className="habit-card__desc">{habit.description}</p>

                <div className="habit-card__stats">
                  <div className="habit-card__stat">
                    <Flame size={14} className="text-warning" />
                    <span>
                      <strong>{streak}</strong> day streak
                    </span>
                  </div>
                  <div className="habit-card__stat">
                    <span>
                      <strong>{rate}%</strong> consistency
                    </span>
                  </div>
                </div>

                <div className="habit-card__footer">
                  <span>View details</span>
                  <ChevronRight size={16} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyHabits;
