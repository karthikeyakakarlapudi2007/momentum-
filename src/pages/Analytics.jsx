import { BarChart3, TrendingUp, Target, Award, ArrowUpRight } from "lucide-react";
import "../styles/analytics.css";

function Analytics() {
  const stats = [
    { label: "Completion Rate", value: "84%", icon: TrendingUp, color: "purple", trend: "+4%" },
    { label: "Monthly Streak", value: "18 Days", icon: Award, color: "blue", trend: "Target: 20" },
    { label: "Active Habits", value: "8", icon: Target, color: "cyan", trend: "Stable" },
    { label: "Check-ins", value: "142", icon: BarChart3, color: "red", trend: "+12" },
  ];

  return (
    <div className="analytics animate-fade-in">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="dashboard__title">Analytics</h1>
          <p className="text-muted">Tracking your consistency and growth patterns.</p>
        </div>
      </header>

      <div className="analytics__grid mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-card__icon ${stat.color}`}><stat.icon size={20} /></div>
            <div className="stat-card__content">
              <span className="stat-label">{stat.label}</span>
              <h2 className="stat-value">{stat.value}</h2>
            </div>
            <div className="analytics__trend">{stat.trend}</div>
          </div>
        ))}
      </div>

      <div className="analytics__charts flex flex-col gap-6">
        <div className="analytics__card prose-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg">Weekly Performance</h3>
            <button className="text-xs text-primary flex items-center gap-1">Details <ArrowUpRight size={14} /></button>
          </div>
          <div className="fake-chart flex items-end justify-between gap-2 h-40">
            {[40, 70, 55, 90, 65, 80, 100].map((h, i) => (
              <div key={i} className="chart-bar-wrapper flex-1 flex flex-col items-center">
                <div className="chart-bar" style={{ height: `${h}%` }}></div>
                <span className="text-xs text-dim mt-2">{['M','T','W','T','F','S','S'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
           <div className="analytics__card prose-card">
             <h3 className="text-lg mb-4">Top Performer</h3>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-primary-glow flex items-center justify-center text-primary">🧘</div>
                <div>
                  <h4 className="font-bold">Meditation</h4>
                  <p className="text-xs text-muted">98% Consistency</p>
                </div>
             </div>
           </div>
           <div className="analytics__card prose-card">
             <h3 className="text-lg mb-4">Focus Area</h3>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded bg-secondary-glow flex items-center justify-center text-secondary">📚</div>
                <div>
                  <h4 className="font-bold">Reading</h4>
                  <p className="text-xs text-muted">62% Consistency</p>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
