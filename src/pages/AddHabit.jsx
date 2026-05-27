import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Target,
  Clock,
  Calendar as CalendarIcon,
  ChevronDown,
  Sparkles,
  Bell,
  FileText,
  Flame,
  X,
  Loader2,
} from "lucide-react";
import Button from "../components/Button";
import { useHabits } from "../context/HabitsContext";
import { useToast } from "../context/ToastContext";
import "../styles/addhabit.css";

const CATEGORIES = [
  { name: "Mindfulness", color: "#a855f7" },
  { name: "Fitness", color: "#ef4444" },
  { name: "Learning", color: "#3b82f6" },
  { name: "Health", color: "#06b6d4" },
  { name: "Productivity", color: "#10b981" },
  { name: "Social", color: "#f59e0b" },
  { name: "Creative", color: "#ec4899" },
  { name: "Finance", color: "#84cc16" },
];

const FREQUENCIES = [
  { id: "daily", label: "Daily", icon: Clock, days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  { id: "weekly", label: "Weekly", icon: CalendarIcon, days: ["Mon"] },
  { id: "custom", label: "Custom", icon: Sparkles, days: [] },
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function AddHabit() {
  const navigate = useNavigate();
  const { addHabit } = useHabits();
  const toast = useToast();

  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [frequencyId, setFrequencyId] = useState("daily");
  const [customDays, setCustomDays] = useState(["Mon", "Wed", "Fri"]);
  const [goal, setGoal] = useState("");
  const [reminderTime, setReminderTime] = useState("08:00");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const frequency = useMemo(
    () => FREQUENCIES.find((f) => f.id === frequencyId),
    [frequencyId]
  );

  const scheduleDays = useMemo(() => {
    if (frequencyId === "custom") return customDays;
    return frequency.days;
  }, [frequencyId, customDays, frequency]);

  const previewTitle = name.trim() || "Your Habit Title";
  const previewNote =
    notes.trim() ||
    "Small actions, repeated every day, lead to massive results over time.";

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = "Give your habit a name.";
    if (name.trim().length > 60) next.name = "Keep the name under 60 characters.";
    if (goal && goal.trim().length > 80) next.goal = "Goal must be under 80 characters.";
    if (frequencyId === "custom" && customDays.length === 0)
      next.frequency = "Pick at least one day.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await addHabit({
        name: name.trim(),
        description: notes.trim() || `Build the habit of ${name.trim().toLowerCase()}.`,
        category: category.name,
        color: category.color,
        schedule: scheduleDays,
        goal: goal.trim(),
        reminderTime: reminderEnabled ? reminderTime : "",
        notes: notes.trim(),
        frequency: frequencyId,
      });

      if (result?.synced === false) {
        toast.success(`"${name.trim()}" added — saved locally (backend unavailable).`);
      } else {
        toast.success(`"${name.trim()}" added to your habits.`);
      }
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.message || "Couldn't create habit. Try again.");
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;
    navigate(-1);
  };

  const toggleCustomDay = (day) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="add-habit animate-fade-in">
      <header className="add-habit__header">
        <div>
          <h1 className="add-habit__title">Create New Habit</h1>
          <p className="add-habit__subtitle">
            Define your goal, set a rhythm, and start building momentum.
          </p>
        </div>
        <button
          type="button"
          className="add-habit__close"
          onClick={handleCancel}
          aria-label="Close and return"
        >
          <X size={18} />
        </button>
      </header>

      <div className="add-habit__layout">
        {/* ---------------- FORM ---------------- */}
        <form
          className="add-habit__form"
          onSubmit={handleSubmit}
          noValidate
          aria-busy={submitting}
        >
          {/* Habit name */}
          <section className="form-card">
            <label htmlFor="habit-name" className="form-card__label">
              Habit Name <span className="form-card__required">*</span>
            </label>
            <div className={`input-shell ${errors.name ? "input-shell--error" : ""}`}>
              <Target size={18} className="input-shell__icon" />
              <input
                id="habit-name"
                type="text"
                className="input-shell__input"
                placeholder="e.g. Read for 30 minutes"
                value={name}
                maxLength={60}
                autoComplete="off"
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                }}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "habit-name-error" : undefined}
              />
              <span className="input-shell__count">{name.length}/60</span>
            </div>
            {errors.name && (
              <span id="habit-name-error" className="form-card__error">
                {errors.name}
              </span>
            )}
          </section>

          {/* Category */}
          <section className="form-card">
            <label className="form-card__label">Category</label>
            <div className={`dropdown ${categoryOpen ? "dropdown--open" : ""}`}>
              <button
                type="button"
                className="dropdown__trigger"
                onClick={() => setCategoryOpen((p) => !p)}
                aria-haspopup="listbox"
                aria-expanded={categoryOpen}
              >
                <span className="dropdown__value">
                  <span
                    className="dropdown__swatch"
                    style={{ background: category.color }}
                    aria-hidden="true"
                  />
                  {category.name}
                </span>
                <ChevronDown
                  size={18}
                  className={`dropdown__caret ${categoryOpen ? "dropdown__caret--up" : ""}`}
                />
              </button>

              {categoryOpen && (
                <ul className="dropdown__menu" role="listbox">
                  {CATEGORIES.map((c) => (
                    <li key={c.name}>
                      <button
                        type="button"
                        className={`dropdown__option ${
                          category.name === c.name ? "dropdown__option--active" : ""
                        }`}
                        onClick={() => {
                          setCategory(c);
                          setCategoryOpen(false);
                        }}
                        role="option"
                        aria-selected={category.name === c.name}
                      >
                        <span
                          className="dropdown__swatch"
                          style={{ background: c.color }}
                          aria-hidden="true"
                        />
                        {c.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Frequency */}
          <section className="form-card">
            <label className="form-card__label">Frequency</label>
            <div className="freq-grid" role="radiogroup" aria-label="Frequency">
              {FREQUENCIES.map((f) => {
                const Icon = f.icon;
                const active = f.id === frequencyId;
                return (
                  <button
                    key={f.id}
                    type="button"
                    className={`freq-tile ${active ? "freq-tile--active" : ""}`}
                    onClick={() => setFrequencyId(f.id)}
                    role="radio"
                    aria-checked={active}
                  >
                    <Icon size={18} />
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>

            {frequencyId === "custom" && (
              <div className="weekday-row" role="group" aria-label="Pick days of the week">
                {WEEKDAYS.map((d) => {
                  const active = customDays.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      className={`weekday-pill ${active ? "weekday-pill--active" : ""}`}
                      onClick={() => toggleCustomDay(d)}
                      aria-pressed={active}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            )}
            {errors.frequency && (
              <span className="form-card__error">{errors.frequency}</span>
            )}
          </section>

          {/* Goal */}
          <section className="form-card">
            <label htmlFor="habit-goal" className="form-card__label">
              Goal
            </label>
            <div className={`input-shell ${errors.goal ? "input-shell--error" : ""}`}>
              <Flame size={18} className="input-shell__icon" />
              <input
                id="habit-goal"
                type="text"
                className="input-shell__input"
                placeholder="e.g. 30 pages / 10,000 steps / 1 hour"
                value={goal}
                maxLength={80}
                onChange={(e) => {
                  setGoal(e.target.value);
                  if (errors.goal) setErrors((p) => ({ ...p, goal: undefined }));
                }}
              />
            </div>
            {errors.goal && <span className="form-card__error">{errors.goal}</span>}
            <p className="form-card__hint">
              A measurable target keeps you honest. Skip if it's a yes/no habit.
            </p>
          </section>

          {/* Reminder */}
          <section className="form-card">
            <div className="form-card__row">
              <label htmlFor="habit-reminder" className="form-card__label form-card__label--inline">
                <Bell size={14} /> Reminder Time
              </label>
              <label className="switch" aria-label="Toggle reminder">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                />
                <span className="switch__track">
                  <span className="switch__thumb" />
                </span>
              </label>
            </div>
            <div
              className={`input-shell ${!reminderEnabled ? "input-shell--disabled" : ""}`}
            >
              <Clock size={18} className="input-shell__icon" />
              <input
                id="habit-reminder"
                type="time"
                className="input-shell__input input-shell__input--time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                disabled={!reminderEnabled}
              />
            </div>
          </section>

          {/* Notes */}
          <section className="form-card">
            <label htmlFor="habit-notes" className="form-card__label">
              <FileText size={14} /> Notes / Description
            </label>
            <textarea
              id="habit-notes"
              className="form-card__textarea"
              placeholder="Why does this habit matter to you? Add any context, motivation, or tracking notes."
              rows={4}
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="form-card__counter">{notes.length}/500</div>
          </section>

          {/* Actions */}
          <div className="add-habit__actions">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              aria-disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="spin" /> Creating…
                </>
              ) : (
                <>
                  <Plus size={18} /> Create Habit
                </>
              )}
            </Button>
          </div>
        </form>

        {/* ---------------- PREVIEW ---------------- */}
        <aside className="add-habit__preview" aria-label="Habit preview">
          <div className="preview-card">
            <div className="preview-card__top">
              <span className="preview-card__tag">Live Preview</span>
              <Sparkles size={16} className="preview-card__sparkle" />
            </div>

            <div
              className="preview-card__icon"
              style={{
                background: `${category.color}1a`,
                color: category.color,
                boxShadow: `0 0 36px ${category.color}33`,
              }}
            >
              <Target size={30} />
            </div>

            <div className="preview-card__badge" style={{ color: category.color }}>
              {category.name}
            </div>
            <h3 className="preview-card__title">{previewTitle}</h3>
            <p className="preview-card__note">{previewNote}</p>

            <div className="preview-card__meta">
              <div className="preview-meta">
                <span className="preview-meta__label">Frequency</span>
                <span className="preview-meta__value">
                  {frequency.label}
                  {frequencyId === "custom" && customDays.length > 0 && (
                    <> · {customDays.length}d/wk</>
                  )}
                </span>
              </div>
              <div className="preview-meta">
                <span className="preview-meta__label">Reminder</span>
                <span className="preview-meta__value">
                  {reminderEnabled ? reminderTime : "Off"}
                </span>
              </div>
              <div className="preview-meta">
                <span className="preview-meta__label">Goal</span>
                <span className="preview-meta__value">
                  {goal.trim() || "—"}
                </span>
              </div>
            </div>

            <div className="preview-card__schedule">
              {WEEKDAYS.map((d) => (
                <span
                  key={d}
                  className={`preview-day ${
                    scheduleDays.includes(d) ? "preview-day--on" : ""
                  }`}
                  style={
                    scheduleDays.includes(d)
                      ? { background: category.color, color: "#fff" }
                      : undefined
                  }
                >
                  {d[0]}
                </span>
              ))}
            </div>
          </div>

          <div className="motivation-card">
            <Flame size={18} className="motivation-card__icon" />
            <div>
              <div className="motivation-card__title">You've got this.</div>
              <p className="motivation-card__text">
                Showing up daily, even imperfectly, beats a perfect plan you never start.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default AddHabit;
