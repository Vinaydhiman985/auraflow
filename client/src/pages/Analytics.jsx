import React, { useState } from 'react';
import { useHabits, HABIT_CATEGORIES, getFormattedDate } from '../context/HabitContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Award, 
  Activity, 
  TrendingUp, 
  Flame, 
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Analytics = () => {
  const { habits, logs, studySessions, calculateStreak } = useHabits();
  const [hoveredCell, setHoveredCell] = useState(null);

  // 1. Core overall stats
  const totalHabitsCount = habits.length;

  // Calculate overall consistency score this month
  const getOverallConsistency = () => {
    if (totalHabitsCount === 0) return 0;
    const past30Days = [];
    let totalPossibleCompletions = 0;
    let actualCompletions = 0;

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getFormattedDate(d);
      past30Days.push(dateStr);
    }

    habits.forEach(habit => {
      const habitLogs = logs[habit.id] || [];
      // Calculate possible target completions in past 30 days
      const daysCreated = Math.ceil((Date.now() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      const activeDaysCount = Math.min(daysCreated, 30);
      
      const targetPerDay = habit.targetDays / 7;
      totalPossibleCompletions += activeDaysCount * targetPerDay;

      // Count actual completions
      past30Days.forEach(dateStr => {
        if (habitLogs.includes(dateStr)) {
          actualCompletions++;
        }
      });
    });

    if (totalPossibleCompletions === 0) return 0;
    return Math.min(Math.round((actualCompletions / totalPossibleCompletions) * 100), 100);
  };

  const consistencyScore = getOverallConsistency();

  // 2. Prepare Recharts Bar Chart Data: Habit Actual completions vs Targets (past 30 days)
  const getBarChartData = () => {
    const past30Days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      past30Days.push(getFormattedDate(d));
    }

    return habits.map(habit => {
      const actualCount = (logs[habit.id] || []).filter(d => past30Days.includes(d)).length;
      // Pro-rate weekly target to monthly possible target (4.3 weeks per month)
      const targetCount = Math.round(habit.targetDays * 4.3);

      return {
        name: habit.title.substring(0, 12) + (habit.title.length > 12 ? '..' : ''),
        Actual: actualCount,
        Target: targetCount,
      };
    });
  };

  const barChartData = getBarChartData();

  // 3. Prepare Recharts Pie Chart Data: Habit categories distribution
  const getPieChartData = () => {
    const counts = {};
    habits.forEach(h => {
      counts[h.category] = (counts[h.category] || 0) + 1;
    });

    return Object.keys(counts).map(catName => {
      const catInfo = HABIT_CATEGORIES.find(c => c.name === catName) || HABIT_CATEGORIES[0];
      return {
        name: catName,
        value: counts[catName],
        color: catInfo.color.replace('bg-', '#').replace('-500', '') // approximate hex mapping
      };
    });
  };

  const pieChartData = getPieChartData();
  const PIE_COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#0ea5e9', '#a855f7'];

  // 4. Generate Rolling 365 Days Grid for Custom GitHub Heatmap
  const getHeatmapGrid = () => {
    const grid = [];
    const today = new Date();
    
    // We want to align the grid to start on a Sunday or simply show columns of 7 days
    // Let's count back 364 days so we have exactly 52 weeks (52 * 7 = 364)
    const startDate = new Date();
    startDate.setDate(today.getDate() - 363); // 52 weeks ago

    // Generate flat list of 364 days
    const flatDays = [];
    for (let i = 0; i < 364; i++) {
      const curDate = new Date(startDate);
      curDate.setDate(startDate.getDate() + i);
      const dateStr = getFormattedDate(curDate);
      
      // Calculate number of completions on this date
      const completionsCount = habits.filter(h => (logs[h.id] || []).includes(dateStr)).length;

      flatDays.push({
        date: curDate,
        dateStr,
        completions: completionsCount
      });
    }

    // Group into 52 columns (weeks), each containing 7 days
    for (let col = 0; col < 52; col++) {
      const weekDays = [];
      for (let row = 0; row < 7; row++) {
        weekDays.push(flatDays[col * 7 + row]);
      }
      grid.push({
        weekNum: col,
        days: weekDays
      });
    }

    return grid;
  };

  const heatmapGrid = getHeatmapGrid();

  // Helper to resolve Heatmap Cell Background Intensity
  const getCellColor = (count) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-900 border-slate-200/10';
    if (count === 1) return 'bg-brand-500/20 text-brand-500';
    if (count === 2) return 'bg-brand-500/40 text-brand-400';
    if (count === 3) return 'bg-brand-500/70 text-brand-300';
    return 'bg-brand-500 text-white'; // 4 or more completions
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. OVERALL METRIC TICKERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Monthly Consistency Score</span>
            <span className="font-display font-extrabold text-2xl tracking-tight mt-1 block">{consistencyScore}%</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Total Habits Tracked</span>
            <span className="font-display font-extrabold text-2xl tracking-tight mt-1 block">{totalHabitsCount} active</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Study Sessions Logged</span>
            <span className="font-display font-extrabold text-2xl tracking-tight mt-1 block">{studySessions.length} sessions</span>
          </div>
        </div>

      </div>

      {/* 2. CUSTOM GITHUB HEATMAP CALENDAR */}
      <div className="glass-card rounded-3xl p-5 md:p-6 space-y-4 overflow-hidden relative">
        <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/30 pb-3">
          <div>
            <h3 className="font-display font-bold text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-500" />
              Annual Ledger Heatmap
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">A rolling 365-day timeline showing complete days grid. Hover cells for stats.</p>
          </div>
          
          {/* Heatmap Legend */}
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Less</span>
            <div className="h-2.5 w-2.5 rounded-sm bg-slate-100 dark:bg-slate-900 border border-slate-200/10" />
            <div className="h-2.5 w-2.5 rounded-sm bg-brand-500/20" />
            <div className="h-2.5 w-2.5 rounded-sm bg-brand-500/40" />
            <div className="h-2.5 w-2.5 rounded-sm bg-brand-500/70" />
            <div className="h-2.5 w-2.5 rounded-sm bg-brand-500" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid Wrapper */}
        <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          <div className="flex gap-[3.5px] min-w-[700px] select-none py-1">
            {heatmapGrid.map((week) => (
              <div key={week.weekNum} className="flex flex-col gap-[3.5px] flex-shrink-0">
                {week.days.map((day) => (
                  <div
                    key={day.dateStr}
                    onMouseEnter={() => setHoveredCell(day)}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`
                      h-3.5 w-3.5 rounded-[3px] transition-all duration-200 cursor-pointer hover:ring-2 hover:ring-indigo-500/40 dark:hover:ring-indigo-500/60
                      ${getCellColor(day.completions)}
                    `}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Live Hover Tooltip Panel */}
        <div className="h-6 flex items-center justify-start text-xs font-semibold text-slate-400 dark:text-slate-500">
          {hoveredCell ? (
            <span className="animate-fade-in flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-brand-500" />
              {hoveredCell.completions === 0 
                ? 'No completions logged on' 
                : `${hoveredCell.completions} habit${hoveredCell.completions > 1 ? 's' : ''} completed on`
              }
              <span className="font-bold underline text-brand-500 dark:text-brand-400">
                {new Date(hoveredCell.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Hover over elements to see details</span>
          )}
        </div>

      </div>

      {/* 3. RECHARTS PLOT DIAGRAMS */}
      {totalHabitsCount === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-slate-400">
          <p className="text-sm font-semibold">No habits available for analytics. Create a habit to plot charts!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Bar Chart: Target vs Actual (30d) */}
          <div className="glass-card rounded-3xl p-5 space-y-4">
            <h4 className="font-display font-bold text-sm">Monthly completions vs Targets</h4>
            <div className="h-[250px] w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#1e293b', 
                      border: 'none', 
                      borderRadius: '8px', 
                      color: '#ffffff',
                      fontSize: '11px' 
                    }} 
                  />
                  <Bar dataKey="Actual" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Target" fill="rgba(99, 102, 241, 0.15)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Categories balance */}
          <div className="glass-card rounded-3xl p-5 space-y-4">
            <h4 className="font-display font-bold text-sm">Habit Categories Balance</h4>
            <div className="h-[250px] w-full text-xs flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: '#1e293b', 
                      border: 'none', 
                      borderRadius: '8px', 
                      color: '#ffffff',
                      fontSize: '11px' 
                    }} 
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconSize={8} 
                    iconType="circle"
                    formatter={(value) => <span className="text-slate-500 dark:text-slate-400 font-semibold text-[10px] uppercase tracking-wider">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Analytics;
