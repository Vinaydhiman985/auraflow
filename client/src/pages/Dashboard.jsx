import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHabits, getFormattedDate } from '../context/HabitContext';
import { useAuth, PRESET_AVATARS } from '../context/AuthContext';
import { 
  Flame, 
  Check, 
  Play, 
  Pause, 
  RotateCcw,
  Plus, 
  TrendingUp, 
  Calendar,
  Clock,
  ListTodo,
  CheckCircle,
  Award,
  ChevronRight,
  Smile,
  Search,
  Sparkles
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    habits, 
    logs, 
    studySessions, 
    tasks, 
    toggleHabitLog, 
    toggleTask, 
    calculateStreak 
  } = useHabits();
  const navigate = useNavigate();

  const todayStr = getFormattedDate();
  const [searchQuery, setSearchQuery] = useState('');

  // Find user's active avatar SVG
  const userAvatarObj = PRESET_AVATARS.find(a => a.id === user?.avatar) || PRESET_AVATARS[0];

  // 1. CALCULATE HABIT STATS
  const totalHabits = habits.length;
  const completedTodayList = habits.filter(habit => {
    const list = logs?.[habit._id || habit.id] || [];
    return list.includes(todayStr);
  });
  const completedTodayCount = completedTodayList.length;
  const completionPercentage = totalHabits > 0 
    ? Math.round((completedTodayCount / totalHabits) * 100) 
    : 0;

  // 2. STREAK CALCULATIONS
  let highestStreak = 0;
  habits.forEach(habit => {
    const { currentStreak } = calculateStreak(habit._id || habit.id);
    if (currentStreak > highestStreak) {
      highestStreak = currentStreak;
    }
  });

  // 3. TASK PLANNING INDEX & UPCOMING LIST
  const upcomingTasks = tasks
    .filter(t => !t.completed)
    .slice(0, 3); // Take first 3 incomplete tasks

  // 4. FUNCTIONAL COUNTDOWN TIMER (POMODORO QUICK START)
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(timerSeconds - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes(timerMinutes - 1);
          setTimerSeconds(59);
        } else {
          // Timer finished!
          setTimerActive(false);
          setTimerMinutes(25);
          setTimerSeconds(0);
          alert("Time's up! Great focus session. ⚡");
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds, timerMinutes]);

  const toggleTimer = () => {
    setTimerActive(!timerActive);
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimerMinutes(25);
    setTimerSeconds(0);
  };

  // 5. FOCUS ANALYTICS DYNAMIC WEEKLY BARS
  const getWeekDays = () => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(getFormattedDate(d));
    }
    return days;
  };

  const weekDays = getWeekDays();
  // Map study minutes on each day of this week
  const studyMinutesByDay = weekDays.map(dateStr => {
    return studySessions
      .filter(session => session.date.split('T')[0] === dateStr)
      .reduce((sum, s) => sum + s.duration, 0);
  });

  const maxMinutes = Math.max(...studyMinutesByDay, 1);
  const chartBarHeights = studySessions.length > 0
    ? studyMinutesByDay.map(mins => `${Math.max(10, Math.round((mins / maxMinutes) * 100))}%`)
    : ['40%', '75%', '90%', '60%', '45%', '30%', '20%']; // Fallback premium heights if no sessions

  // 6. MONTHLY MOOD MOSAIC (Last 21 days completed percentages)
  const getPastDays = (count = 21) => {
    const days = [];
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(getFormattedDate(d));
    }
    return days;
  };

  const past21Days = getPastDays(21);
  const completionsByPastDay = past21Days.map(dateStr => {
    if (totalHabits === 0) return 0;
    const completed = habits.filter(h => (logs?.[h._id || h.id] || []).includes(dateStr)).length;
    return Math.round((completed / totalHabits) * 100);
  });

  // Calculate overall happiness / productivity index based on completions
  const averageCompletionRate = totalHabits > 0
    ? Math.round(completionsByPastDay.reduce((sum, val) => sum + val, 0) / 21)
    : 82; // Fallback design value

  const getMoodColor = (pct) => {
    if (totalHabits === 0) {
      // Mock layout matching the Stitch visual palette
      const mockColors = [
        'bg-primary/80', 'bg-primary/40', 'bg-emerald-300', 'bg-primary/60', 'bg-primary/80', 'bg-slate-200/50', 'bg-slate-200/50',
        'bg-primary/60', 'bg-emerald-200', 'bg-primary/80', 'bg-emerald-300', 'bg-primary/60', 'bg-slate-200/50', 'bg-slate-200/50',
        'bg-sky-200', 'bg-primary/80', 'bg-primary/40', 'bg-primary/60', 'bg-primary/20', 'bg-slate-200/50', 'bg-slate-200/50'
      ];
      return mockColors[Math.floor(Math.random() * mockColors.length)];
    }
    if (pct >= 80) return 'bg-primary/80';
    if (pct >= 50) return 'bg-primary/50';
    if (pct >= 20) return 'bg-sky-200';
    return 'bg-slate-200 dark:bg-slate-800';
  };

  // 7. HABIT SEARCH FILTER
  const filteredHabits = habits.filter(h => 
    h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16 font-sans">
      
      {/* HEADER BAR */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-slate-800 dark:text-white tracking-tight">
            Good morning, {user?.name?.split(' ')[0] || 'Student'}!
          </h2>
          <span className="text-sm text-slate-400 dark:text-slate-500 italic block mt-1">
            — You're doing great today.
          </span>
        </div>
        
        {/* Search bar inside top bar */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search habits..."
              className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-full text-sm outline-none transition-all dark:text-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </header>

      {/* BENTO GRID */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* 1. Today's Habits (Span 4, Row 3 equivalent) */}
        <section className="col-span-12 lg:col-span-4 glass-card rounded-[2rem] p-6 flex flex-col min-h-[420px]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-display font-bold text-lg text-primary flex items-center gap-2">
                <Check className="w-5 h-5" /> Today's Habits
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {totalHabits > 0 ? `${completedTodayCount} of ${totalHabits} completed today` : "No habits configured"}
              </p>
            </div>
            <div className="w-12 h-12 flex-shrink-0">
              <img 
                alt="Habit Icon" 
                className="w-full h-full object-contain" 
                src="/3d-icons-sheet.png" 
                style={{ clipPath: 'inset(0 66% 66% 0)' }}
              />
            </div>
          </div>

          {/* List area */}
          <div className="space-y-4 flex-1 overflow-y-auto pr-1 scrollbar-hide">
            {totalHabits === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 gap-3">
                <p className="text-xs text-slate-400">Your garden is empty.</p>
                <button
                  onClick={() => navigate('/habits')}
                  className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-full hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-emerald-500/10"
                >
                  Create Habit
                </button>
              </div>
            ) : (
              (searchQuery ? filteredHabits : habits).map(habit => {
                const hId = habit._id || habit.id;
                const isCompletedToday = (logs?.[hId] || []).includes(todayStr);

                return (
                  <div 
                    key={hId} 
                    onClick={() => toggleHabitLog(hId)}
                    className="flex items-center justify-between group cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Check Ring */}
                      <div className="relative w-11 h-11 flex items-center justify-center flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle 
                            className="text-slate-100 dark:text-slate-800/80" 
                            cx="22" 
                            cy="22" 
                            fill="transparent" 
                            r="18" 
                            stroke="currentColor" 
                            strokeWidth="3.5"
                          />
                          <circle 
                            className="text-primary transition-all duration-300" 
                            cx="22" 
                            cy="22" 
                            fill="transparent" 
                            r="18" 
                            stroke="currentColor" 
                            strokeDasharray="113" 
                            strokeDashoffset={isCompletedToday ? 0 : 113} 
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className={`absolute transition-all duration-300 ${isCompletedToday ? 'text-primary scale-100' : 'text-slate-300 dark:text-slate-700 scale-90'}`}>
                          <Check className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className={`font-semibold text-sm leading-tight text-slate-700 dark:text-slate-200 truncate ${isCompletedToday ? 'line-through opacity-50' : ''}`}>
                          {habit.title}
                        </h4>
                        <span className="text-[10px] inline-block font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-primary border border-emerald-100/30 mt-1 capitalize">
                          {habit.category}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* 2. Task Planner Calendar (Span 5, Row 3 equivalent) */}
        <section className="col-span-12 md:col-span-7 lg:col-span-5 glass-card rounded-[2rem] p-6 flex flex-col min-h-[420px]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-display font-bold text-lg text-primary flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Task Planner
              </h3>
              
              {/* Day selection scroller mock */}
              <div className="flex gap-2.5 mt-3">
                <div className="w-10 h-12 rounded-xl bg-primary text-on-primary flex flex-col items-center justify-center shadow-lg shadow-emerald-500/20 scale-105">
                  <span className="text-[9px] uppercase font-bold tracking-wider">Today</span>
                  <span className="text-base font-extrabold">{new Date().getDate()}</span>
                </div>
                <div className="w-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-800/20 flex flex-col items-center justify-center opacity-65">
                  <span className="text-[9px] uppercase font-bold">Tom</span>
                  <span className="text-base font-extrabold">{new Date(Date.now() + 86400000).getDate()}</span>
                </div>
                <div className="w-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-800/20 flex flex-col items-center justify-center opacity-45">
                  <span className="text-[9px] uppercase font-bold">Next</span>
                  <span className="text-base font-extrabold">{new Date(Date.now() + 172800000).getDate()}</span>
                </div>
              </div>
            </div>
            
            <div className="w-12 h-12 flex-shrink-0">
              <img 
                alt="Planner Icon" 
                className="w-full h-full object-contain" 
                src="/3d-icons-sheet.png" 
                style={{ clipPath: 'inset(0 33% 66% 33%)' }}
              />
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Next 3 Tasks
            </h4>

            {upcomingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center gap-3">
                <p className="text-xs text-slate-400">All tasks completed! ⚡</p>
                <button
                  onClick={() => navigate('/tasks')}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  Manage Tasks <ChevronRight className="w-3.5 h-3.5 inline" />
                </button>
              </div>
            ) : (
              upcomingTasks.map(task => {
                const priorityColor = 
                  task.priority === 'high' ? 'bg-rose-500' :
                  task.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400';

                return (
                  <div 
                    key={task._id || task.id}
                    onClick={() => toggleTask(task._id || task.id)}
                    className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/30 border border-white/50 dark:border-slate-800/40 hover:border-primary/30 transition-all flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-1.5 h-8 ${priorityColor} rounded-full group-hover:scale-y-110 transition-transform flex-shrink-0`} />
                      <div className="min-w-0">
                        <h5 className="font-semibold text-sm text-slate-700 dark:text-slate-200 truncate group-hover:text-primary transition-colors">
                          {task.title}
                        </h5>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block mt-0.5">
                          Due: {task.dueDate} • <span className="capitalize">{task.priority}</span>
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* 3. Pomodoro Quick Start (Span 3, Row 3 equivalent) */}
        <section className="col-span-12 md:col-span-5 lg:col-span-3 glass-card rounded-[2rem] p-6 flex flex-col items-center justify-center text-center min-h-[420px]">
          <div className="w-24 h-24 mb-4">
            <img 
              alt="Pomodoro Icon" 
              className="w-full h-full object-contain drop-shadow-xl" 
              src="/3d-icons-sheet.png" 
              style={{ clipPath: 'inset(33% 33% 0 33%)' }}
            />
          </div>
          
          <h3 className="font-display font-bold text-lg text-primary">Focus Timer</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Ready for deep focus?</p>

          <div className="relative w-32 h-32 flex items-center justify-center mb-6">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle 
                className="text-slate-100 dark:text-slate-800" 
                cx="64" 
                cy="64" 
                fill="transparent" 
                r="56" 
                stroke="currentColor" 
                strokeWidth="3.5"
              />
              <circle 
                className="text-primary transition-all duration-300" 
                cx="64" 
                cy="64" 
                fill="transparent" 
                r="56" 
                stroke="currentColor" 
                strokeWidth="5"
                strokeDasharray="351.8"
                strokeDashoffset={351.8 - (351.8 * (timerMinutes * 60 + timerSeconds)) / 1500}
                strokeLinecap="round"
              />
            </svg>
            <span className="font-display font-extrabold text-2xl text-slate-800 dark:text-white tabular-nums">
              {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
            </span>
          </div>

          <div className="flex gap-2 w-full">
            <button 
              onClick={toggleTimer}
              className="flex-1 py-3 bg-primary hover:bg-emerald-600/90 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm shadow-emerald-500/10 cursor-pointer text-xs"
            >
              {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              {timerActive ? 'Pause' : 'Start'}
            </button>
            <button 
              onClick={resetTimer}
              className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-2xl transition-all cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* 4. Analytics Weekly Glance (Span 8, Row 3 equivalent) */}
        <section className="col-span-12 lg:col-span-8 glass-card rounded-[2rem] p-6 flex flex-col min-h-[360px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display font-bold text-lg text-primary flex items-center gap-2">
                <Clock className="w-5 h-5" /> Focus Analytics
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Productivity trend based on active sessions
              </p>
            </div>
            <button 
              onClick={() => navigate('/analytics')}
              className="px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/30 text-primary font-bold text-xs hover:opacity-90 transition-all cursor-pointer"
            >
              View More
            </button>
          </div>

          <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-4 h-48 mt-4">
            {chartBarHeights.map((height, idx) => (
              <div key={idx} className="flex-grow flex flex-col items-center gap-2 group/bar cursor-pointer h-full justify-end">
                <span className="opacity-0 group-hover/bar:opacity-100 absolute bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded -translate-y-12 transition-opacity z-10">
                  {studySessions.length > 0 ? `${studyMinutesByDay[idx]} mins` : 'Mock'}
                </span>
                <div className="w-full bg-secondary-container/20 dark:bg-secondary-container/10 rounded-t-xl relative h-full overflow-hidden transition-all group-hover/bar:bg-primary/20 flex flex-col justify-end">
                  <div 
                    className="absolute bottom-0 w-full bg-secondary transition-all duration-700 rounded-t-lg group-hover/bar:bg-primary"
                    style={{ height }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Monthly Mood Summary (Span 4, Row 3 equivalent) */}
        <section className="col-span-12 lg:col-span-4 glass-card rounded-[2rem] p-6 flex flex-col min-h-[360px] justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-primary flex items-center gap-2">
                <Smile className="w-5 h-5" /> Monthly Mood
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Intentions Mosaic Insights
              </p>
            </div>
            
            <div className="w-12 h-12 flex-shrink-0">
              <img 
                alt="Report Icon" 
                className="w-full h-full object-contain" 
                src="/3d-icons-sheet.png" 
                style={{ clipPath: 'inset(33% 0 0 66%)' }}
              />
            </div>
          </div>

          <div className="flex-grow flex flex-col items-center justify-center">
            {/* 3x7 Grid layout for the last 21 days */}
            <div className="grid grid-cols-7 gap-2 w-full max-w-[220px]">
              {completionsByPastDay.map((pct, idx) => (
                <div 
                  key={idx}
                  className={`w-5 h-5 rounded-md ${getMoodColor(pct)} hover:scale-115 transition-transform duration-200 cursor-pointer shadow-sm`}
                  title={`Day ${idx + 1}: ${totalHabits > 0 ? `${pct}% completion` : 'Dashboard Mock'}`}
                />
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <div className="text-3xl font-extrabold text-primary font-display">
                {averageCompletionRate}%
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mt-1">
                Overall Happiness Score
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug italic font-medium">
              "Your study habits are peaking. Keep planting fresh intentions!"
            </p>
          </div>
        </section>

      </div>

    </div>
  );
};

export default Dashboard;
