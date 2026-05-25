import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Flame, TrendingUp, Calendar, AlertCircle, Trash2, Edit3 } from "lucide-react";
import Button from "../components/Button";
import "../styles/habitdetails.css";

function HabitDetails() {
  const { id } = useParams();

  return (
    <div className="habit-details animate-fade-in">
      <Link to="/dashboard" className="habit-details__back mb-6 flex items-center gap-2 text-primary hover-white transition-colors">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

      <div className="grid grid-cols-3 gap-8 items-start">
        <div className="col-span-2 flex flex-col gap-6">
          <div className="prose-card flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Mindfulness</span>
                <span className="text-dim">•</span>
                <span className="text-xs text-dim">Active for 45 days</span>
              </div>
              <h1 className="text-3xl font-extrabold">Morning Meditation</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm"><Edit3 size={16} /></Button>
              <Button variant="secondary" size="sm" className="text-danger"><Trash2 size={16} /></Button>
            </div>
          </div>

          <div className="prose-card">
            <h3 className="mb-6 flex items-center gap-2"><TrendingUp size={20} className="text-primary" /> Progress Insights</h3>
            <div className="fake-chart flex items-end justify-between gap-2 h-48 bg-dark-700 p-6 rounded-xl border border-glass">
               {[20, 45, 30, 80, 50, 60, 95, 40, 70, 85].map((h, i) => (
                 <div key={i} className="flex-1 bg-primary rounded-t-sm opacity-60 hover:opacity-100 transition-opacity" style={{ height: `${h}%` }}></div>
               ))}
            </div>
            <p className="mt-4 text-sm text-dim">Your consistency increased by 15% this week. Keep hitting those morning sessions!</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
           <div className="prose-card text-center">
              <div className="w-16 h-16 bg-primary-glow rounded-full flex items-center justify-center mx-auto mb-4">
                 <Flame size={32} className="text-primary" />
              </div>
              <h2 className="text-4xl font-black mb-1">12</h2>
              <p className="text-muted text-sm uppercase font-bold">Current Streak</p>
           </div>

           <div className="prose-card">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Calendar size={16} /> Schedule</h3>
              <div className="flex flex-col gap-3">
                 {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => (
                   <div key={d} className="flex items-center justify-between text-sm">
                      <span className="text-muted">{d}</span>
                      <span className="font-bold">6:00 AM</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="p-6 rounded-2xl bg-warning bg-opacity-10 border border-warning border-opacity-20 flex gap-4">
             <AlertCircle size={24} className="text-warning shrink-0" />
             <p className="text-xs text-warning font-medium leading-relaxed">
               You missed your session yesterday. Don't break the streak twice!
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}

export default HabitDetails;
