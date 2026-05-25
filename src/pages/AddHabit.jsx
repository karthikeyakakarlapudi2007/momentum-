import { useState } from "react";
import { Plus, Target, Clock, Calendar, Check } from "lucide-react";
import Button from "../components/Button";
import "../styles/addhabit.css";

const categories = ["Mindfulness", "Fitness", "Learning", "Health", "Social", "Work"];
const frequencies = ["Daily", "Weekly", "Custom"];

function AddHabit() {
  const [activeFreq, setActiveFreq] = useState("Daily");

  return (
    <div className="add-habit animate-fade-in">
      <header className="mb-8">
        <h1 className="dashboard__title">Create New Habit</h1>
        <p className="text-muted">Define your goal and set your rhythm.</p>
      </header>

      <div className="add-habit__container grid grid-cols-2 gap-12">
        <form className="flex flex-col gap-6">
          <div className="login__input-group">
            <label>Habit Name</label>
            <div className="input-wrapper">
              <Target size={18} className="input-icon" />
              <input type="text" placeholder="e.g. Read for 30 mins" />
            </div>
          </div>

          <div className="login__input-group">
            <label>Category</label>
            <div className="add-habit__chips flex flex-wrap gap-2">
              {categories.map(c => (
                <div key={c} className="chip">{c}</div>
              ))}
            </div>
          </div>

          <div className="login__input-group">
            <label>Frequency</label>
            <div className="flex gap-4">
              {frequencies.map(f => (
                <button 
                  key={f}
                  type="button"
                  onClick={() => setActiveFreq(f)}
                  className={`freq-btn ${activeFreq === f ? 'active' : ''}`}
                >
                  {f === 'Daily' && <Clock size={16} />}
                  {f === 'Weekly' && <Calendar size={16} />}
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Button variant="primary" size="lg" className="w-full">
               <Plus size={20} /> Create Habit
            </Button>
          </div>
        </form>

        <div className="add-habit__preview prose-card flex flex-col items-center justify-center text-center">
          <div className="preview-icon mb-4"><Sparkles size={32} /></div>
          <h3 className="mb-2">Consistency is Key</h3>
          <p className="text-sm text-dim">Small actions, repeated every day, lead to massive results over time.</p>
          <div className="mt-8 p-4 bg-dark-700 border border-glass rounded-lg w-full">
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary">Your New Habit</span>
                <Check size={14} className="text-success" />
             </div>
             <p className="text-sm font-bold">New Habit Preview</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkles({ size }) {
  return <div className="text-primary"><Target size={size} /></div>;
}

export default AddHabit;
