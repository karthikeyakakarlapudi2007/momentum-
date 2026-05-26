import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Target, Clock, Calendar, Check } from "lucide-react";
import Button from "../components/Button";
import { useHabits } from "../context/HabitsContext";
import "../styles/addhabit.css";

const categories = [
  { name: "Mindfulness", color: "#a855f7" },
  { name: "Fitness", color: "#ef4444" },
  { name: "Learning", color: "#3b82f6" },
  { name: "Health", color: "#06b6d4" },
  { name: "Social", color: "#f59e0b" },
  { name: "Work", color: "#10b981" },
];
const frequencies = ["Daily", "Weekly", "Custom"];

function AddHabit() {
  const navigate = useNavigate();
  const { addHabit } = useHabits();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [activeFreq, setActiveFreq] = useState("Daily");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give your habit a name first.");
      return;
    }
    const schedule =
      activeFreq === "Weekly"
        ? ["Mon"]
        : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    addHabit({
      name: name.trim(),
      description: description.trim() || `Build the habit of ${name.trim().toLowerCase()}.`,
      category: category.name,
      color: category.color,
      schedule,
    });
    navigate("/dashboard");
  };

  return (
    <div className="add-habit animate-fade-in">
      <header className="mb-8">
        <h1 className="dashboard__title">Create New Habit</h1>
        <p className="text-muted">Define your goal and set your rhythm.</p>
      </header>

      <div className="add-habit__container grid grid-cols-2 gap-12">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="login__input-group">
            <label>Habit Name</label>
            <div className="input-wrapper">
              <Target size={18} className="input-icon" />
              <input
                type="text"
                placeholder="e.g. Read for 30 mins"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
              />
            </div>
            {error && (
              <span style={{ color: "var(--danger)", fontSize: 12 }}>
                {error}
              </span>
            )}
          </div>

          <div className="login__input-group">
            <label>Description (optional)</label>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Why this matters to you"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="login__input-group">
            <label>Category</label>
            <div className="add-habit__chips flex flex-wrap gap-2">
              {categories.map((c) => (
                <div
                  key={c.name}
                  className={`chip ${category.name === c.name ? "chip--active" : ""}`}
                  onClick={() => setCategory(c)}
                  style={
                    category.name === c.name
                      ? { borderColor: c.color, color: c.color }
                      : undefined
                  }
                >
                  {c.name}
                </div>
              ))}
            </div>
          </div>

          <div className="login__input-group">
            <label>Frequency</label>
            <div className="flex gap-4">
              {frequencies.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFreq(f)}
                  className={`freq-btn ${activeFreq === f ? "active" : ""}`}
                >
                  {f === "Daily" && <Clock size={16} />}
                  {f === "Weekly" && <Calendar size={16} />}
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Button variant="primary" size="lg" className="w-full" type="submit">
              <Plus size={20} /> Create Habit
            </Button>
          </div>
        </form>

        <div className="add-habit__preview prose-card flex flex-col items-center justify-center text-center">
          <div className="preview-icon mb-4" style={{ color: category.color }}>
            <Target size={32} />
          </div>
          <h3 className="mb-2">{name || "Consistency is Key"}</h3>
          <p className="text-sm text-dim">
            {description ||
              "Small actions, repeated every day, lead to massive results over time."}
          </p>
          <div className="mt-8 p-4 bg-dark-700 border border-glass rounded-lg w-full">
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-xs font-bold"
                style={{ color: category.color }}
              >
                {category.name}
              </span>
              <Check size={14} className="text-success" />
            </div>
            <p className="text-sm font-bold">
              {name || "New Habit Preview"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddHabit;
