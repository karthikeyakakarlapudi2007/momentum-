import { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import "../styles/calendar.css";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Calendar() {
  const [currMonth, setCurrMonth] = useState(4); // May
  
  // Fake day generation
  const monthDays = Array.from({ length: 31 }, (_, i) => ({
    date: i + 1,
    completed: Math.random() > 0.4
  }));

  return (
    <div className="calendar animate-fade-in">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="dashboard__title">Consistency Map</h1>
          <p className="text-muted">Visualize your completion history across the month.</p>
        </div>
        <div className="calendar__nav flex items-center gap-4 bg-dark-800 p-2 rounded-lg border border-glass">
           <button onClick={() => setCurrMonth(m => Math.max(0, m - 1))} className="nav-btn"><ChevronLeft size={20} /></button>
           <span className="font-bold min-w-[120px] text-center">{months[currMonth]} 2026</span>
           <button onClick={() => setCurrMonth(m => Math.min(11, m + 1))} className="nav-btn"><ChevronRight size={20} /></button>
        </div>
      </header>

      <div className="calendar__container prose-card">
         <div className="calendar__days-grid grid grid-cols-7 mb-4">
            {days.map(d => (
              <span key={d} className="text-center text-xs font-bold text-dim uppercase tracking-widest">{d}</span>
            ))}
         </div>
         
         <div className="calendar__grid grid grid-cols-7 gap-2">
            {/* Pad empty days - assume month starts on Friday for May 2026 */}
            {[...Array(5)].map((_, i) => <div key={`empty-${i}`}></div>)}
            
            {monthDays.map(d => (
              <div key={d.date} className={`calendar-day ${d.completed ? 'completed' : ''}`}>
                 <span className="date-num">{d.date}</span>
                 {d.completed && <Check size={12} className="check-icon" />}
              </div>
            ))}
         </div>
      </div>

      <div className="mt-8 flex gap-8 justify-center">
         <div className="flex items-center gap-2 text-xs text-muted">
            <div className="w-3 h-3 rounded-sm bg-primary opacity-80"></div> Correct Check-in
         </div>
         <div className="flex items-center gap-2 text-xs text-muted">
            <div className="w-3 h-3 rounded-sm bg-dark-600"></div> Missed Day
         </div>
      </div>
    </div>
  );
}

export default Calendar;
