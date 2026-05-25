import { Link } from "react-router-dom";
import { Flame, CheckCircle2, Circle, TrendingUp, Plus, Calendar as CalendarIcon, Zap, Target } from "lucide-react";
import Button from "../components/Button";
import "../styles/dashboard.css";

const sampleHabits = [
  { id: 1, name: "Morning Meditation", streak: 12, completed: true, category: "Mindfulness", color: "#a855f7" },
  { id: 2, name: "Read 30 Minutes", streak: 8, completed: false, category: "Learning", color: "#3b82f6" },
  { id: 3, name: "Morning Workout", streak: 5, completed: true, category: "Fitness", color: "#ef4444" },
  { id: 4, name: "Drink Water", streak: 20, completed: false, category: "Health", color: "#06b6d4" },
];

function Dashboard() {
  const completedCount = sampleHabits.filter((h) => h.completed).length;
  const totalCount = sampleHabits.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="dashboard animate-fade-in">
      <header className="dashboard__header flex items-center justify-between mb-8">
        <div>
          <h1 className="dashboard__title">Master Your Day 👋</h1>
          <p className="text-muted">You have {totalCount - completedCount} habits left to complete today.</p>
        </div>
        <Link to="/habits/add">
          <Button variant="primary" size="md">
            <Plus size={18} /> New Habit
          </Button>
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="dashboard__grid mb-12">
        <div className="stat-card">
          <div className="stat-card__icon purple"><Zap size={20} /></div>
          <div className="stat-card__content">
            <span className="stat-label">Current Streak</span>
            <h2 className="stat-value">14 Days</h2>
          </div>
          <div className="stat-card__pill">+2 today</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card__icon blue"><Target size={20} /></div>
          <div className="stat-card__content">
            <span className="stat-label">Daily Progress</span>
            <h2 className="stat-value">{progress}%</h2>
          </div>
          <div className="stat-card__progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon cyan"><CalendarIcon size={20} /></div>
          <div className="stat-card__content">
            <span className="stat-label">Yearly Goal</span>
            <h2 className="stat-value">85%</h2>
          </div>
          <div className="stat-card__pill">On track</div>
        </div>
      </div>

      {/* Habits Section */}
      <section className="dashboard__habits">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Today's Focus</h2>
          <span className="text-dim text-sm">{completedCount}/{totalCount} completed</span>
        </div>

        <div className="habit-list flex flex-col gap-3">
          {sampleHabits.map((habit) => (
            <div key={habit.id} className={`habit-item ${habit.completed ? 'completed' : ''}`}>
              <button 
                className="habit-checkbox"
                style={{ '--accent': habit.color }}
              >
                {habit.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>
              
              <Link to={`/habits/${habit.id}`} className="habit-info">
                <div className="flex items-center gap-3">
                  <h3 className="habit-name">{habit.name}</h3>
                  <span className="habit-badge" style={{ backgroundColor: `${habit.color}15`, color: habit.color }}>
                    {habit.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Flame size={14} className="text-warning" />
                  <span className="text-xs text-muted">{habit.streak} day streak</span>
                </div>
              </Link>

              <div className="habit-actions">
                <TrendingUp size={18} className="text-dim hover:text-white pointer" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
