import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHabits, getFormattedDate, HABIT_CATEGORIES } from '../context/HabitContext';
import { 
  Flame, 
  CheckCircle, 
  Calendar, 
  Clock, 
  Award, 
  Plus, 
  Sparkles,
  ArrowRight,
  Code,
  Dumbbell,
  BookOpen,
  Moon,
  Sparkle,
  GraduationCap,
  ListTodo,
  CheckCircle2
} from 'lucide-react';


// Dynamic Icon Lookup
const LucideIcon = ({ name, className }) => {
  const iconMap = {
    Code: Code,
    Dumbbell: Dumbbell,
    BookOpen: BookOpen,
    Moon: Moon,
    Sparkles: Sparkle,
    GraduationCap: GraduationCap
  };
  const IconComponent = iconMap[name] || GraduationCap;
  return <IconComponent className={className} />;
};

const PRIORITY_BADGES = {
  high: 'bg-rose-500/10 text-rose-500 border-rose-500/10',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/10',
  low: 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200/10'
};

const Dashboard = () => {
  const { habits, logs, studySessions, tasks, toggleHabitLog, toggleTask, calculateStreak } = useHabits();
  const navigate = useNavigate();

  const todayStr = getFormattedDate();

  // 1. Calculate Habit Stats
  const activeHabitsCount = habits.length;
  
  const completedTodayList = habits.filter(habit => {
    const list = logs[habit.id] || [];
    return list.includes(todayStr);
  });
  
  const completedTodayCount = completedTodayList.length;
  const completionPercentage = activeHabitsCount > 0 
    ? Math.round((completedTodayCount / activeHabitsCount) * 100) 
    : 0;

  // Highest Current Streak
  let highestStreak = 0;
  habits.forEach(habit => {
    const { currentStreak } = calculateStreak(habit.id);
    if (currentStreak > highestStreak) {
      highestStreak = currentStreak;
    }
  });

  // Calculate study minutes today
  const studyMinutesToday = studySessions
    .filter(session => {
      const sessDate = session.date.split('T')[0];
      return sessDate === todayStr;
    })
    .reduce((sum, session) => sum + session.duration, 0);

  // 2. Calculate Task Planner Stats
  const todayTasks = tasks.filter(t => t.dueDate === todayStr);
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const totalTasksCount = tasks.length;
  const taskProductivityPct = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0;

  // Generate past 7 days list
  const getPastSevenDays = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      const dateStr = getFormattedDate(d);
      const dayCompletions = habits.filter(h => (logs[h.id] || []).includes(dateStr)).length;
      const pct = habits.length > 0 ? (dayCompletions / habits.length) * 100 : 0;

      days.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 1),
        dayNum: d.getDate(),
        dateStr,
        isToday: dateStr === todayStr,
        completionPct: pct
      });
    }
    return days;
  };
  const pastSevenDays = getPastSevenDays();

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. WELCOME HERO CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-700 p-6 md:p-8 text-white shadow-xl shadow-brand-500/10">
        <div className="absolute top-0 right-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-8 left-1/3 w-48 h-48 rounded-full bg-indigo-500/20 blur-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider border border-white/10">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
              Focus Mode Active
            </span>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight">
              Keep the Flow Active!
            </h1>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Your overall consistency score this week is stellar. You have completed {completedTodayCount} of {activeHabitsCount} daily routines!
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/habits')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs transition-all shadow-sm border border-white/15 cursor-pointer"
            >
              Manage Habits
            </button>
            <button
              onClick={() => navigate('/tasks')}
              className="flex items-center gap-2 px-5 py-3 bg-white text-brand-600 hover:bg-slate-50 font-bold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Routine Score */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Routine Progress</span>
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500 dark:text-brand-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-display font-extrabold text-3xl tracking-tight">{completionPercentage}%</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">{completedTodayCount} of {activeHabitsCount} completed</p>
          </div>
        </div>

        {/* Task Score */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Task Completion</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ListTodo className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-display font-extrabold text-3xl tracking-tight">{taskProductivityPct}%</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">{completedTasksCount} of {totalTasksCount} tasks done</p>
          </div>
        </div>

        {/* Max Active Streak */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Streak</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-display font-extrabold text-3xl tracking-tight">{highestStreak} <span className="text-sm font-medium text-slate-400">days</span></span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">Consecutive completions</p>
          </div>
        </div>

        {/* Focus Hours */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Focus Today</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-display font-extrabold text-3xl tracking-tight">{studyMinutesToday} <span className="text-sm font-medium text-slate-400">mins</span></span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">Logged from timers</p>
          </div>
        </div>

      </div>

      {/* 3. MAIN SECTION GRID */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Column: Habits checklist */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg">Today's Habits & Routines</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">Check off routines. Streaks will update live.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-slate-500">
                {completedTodayCount} of {activeHabitsCount} done
              </span>
            </div>

            {activeHabitsCount === 0 ? (
              <div className="glass-card rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-4 border-dashed">
                <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-900 border flex items-center justify-center text-2xl">🌱</div>
                <div>
                  <h4 className="font-semibold text-base">No habits tracked yet</h4>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs">Create custom routine habits to start logging consistency.</p>
                </div>
                <button
                  onClick={() => navigate('/habits')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Habit
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {habits.map(habit => {
                  const isCompletedToday = (logs[habit.id] || []).includes(todayStr);
                  const { currentStreak } = calculateStreak(habit.id);
                  const catObj = HABIT_CATEGORIES.find(c => c.name === habit.category) || HABIT_CATEGORIES[0];
                  
                  // Safe color mapping
                  const colorsList = [
                    { name: 'indigo', text: 'text-indigo-500' },
                    { name: 'emerald', text: 'text-emerald-500' },
                    { name: 'rose', text: 'text-rose-500' },
                    { name: 'amber', text: 'text-amber-500' },
                    { name: 'sky', text: 'text-sky-500' },
                    { name: 'sky-light', text: 'text-sky-400' }
                  ];
                  const activeColorText = colorsList.find(c => c.name === habit.color)?.text || 'text-indigo-500';

                  return (
                    <div 
                      key={habit.id}
                      className={`
                        glass-card rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-300 border
                        ${isCompletedToday 
                          ? 'opacity-65 bg-slate-100/20 dark:bg-slate-900/10 border-slate-200/20 dark:border-slate-800/10' 
                          : 'hover:border-brand-500/30 hover:translate-x-0.5'
                        }
                      `}
                    >
                      <button
                        onClick={() => toggleHabitLog(habit.id)}
                        className={`
                          h-9 w-9 flex-shrink-0 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-300
                          ${isCompletedToday
                            ? 'bg-emerald-500 border-emerald-500 text-white scale-95 shadow-md shadow-emerald-500/10'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:scale-105'
                          }
                        `}
                      >
                        <CheckCircle className={`w-5 h-5 transition-transform duration-300 ${isCompletedToday ? 'scale-100' : 'scale-0'}`} />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-semibold text-sm truncate leading-tight ${isCompletedToday ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                            {habit.title}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${catObj.border} ${catObj.text} bg-white dark:bg-slate-900`}>
                            {habit.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate mt-1">
                          {habit.subject ? `Subject: ${habit.subject}` : 'General Routine'}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 dark:bg-amber-500/5 text-amber-500 border border-amber-500/10">
                          <Flame className={`w-3.5 h-3.5 ${currentStreak > 0 ? 'fill-current animate-pulse' : ''}`} />
                          <span className="text-xs font-bold font-display">{currentStreak}</span>
                        </div>
                        <div className={`h-8 w-8 rounded-xl p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200/20 ${activeColorText} flex items-center justify-center`}>
                          <LucideIcon name={habit.icon} className="w-4 h-4" />
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Today's Task Agenda & Calendar Ribbon */}
        <div className="space-y-6">
          
          {/* Today's Task Agenda */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/30 pb-3">
              <h3 className="font-display font-bold text-sm flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-brand-500" />
                Today's Task Agenda
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">To-Dos</span>
            </div>

            {todayTasks.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <p className="text-xs">No tasks due today.</p>
                <button
                  onClick={() => navigate('/tasks')}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-500 hover:underline cursor-pointer"
                >
                  Go to Task Planner <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayTasks.map(task => (
                  <div 
                    key={task.id}
                    className={`
                      p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-xl flex items-start gap-3 transition-all
                      ${task.completed ? 'opacity-50' : ''}
                    `}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="mt-0.5 flex-shrink-0 cursor-pointer text-slate-400 hover:text-brand-500"
                    >
                      <CheckCircle2 className={`w-4.5 h-4.5 ${task.completed ? 'text-emerald-500 fill-emerald-500/10' : ''}`} />
                    </button>
                    
                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs font-semibold leading-tight truncate ${task.completed ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </h4>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase mt-1 border ${PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calendar Ribbon Card */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/30 dark:border-slate-800/30 pb-3">
              <h3 className="font-display font-bold text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-500" />
                Weekly Ledger
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-semibold">Ledger</span>
            </div>
            
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {pastSevenDays.map(day => (
                <div 
                  key={day.dateStr}
                  className={`
                    flex flex-col items-center p-1 sm:p-2 rounded-xl border text-center transition-all duration-300
                    ${day.isToday 
                      ? 'bg-brand-500/10 border-brand-500 text-brand-500' 
                      : 'bg-white dark:bg-slate-900 border-slate-200/30 dark:border-slate-800/30'
                    }
                  `}
                >
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{day.name}</span>
                  <span className="font-display font-extrabold text-sm mt-1">{day.dayNum}</span>
                  
                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${day.completionPct === 100 ? 'bg-emerald-500' : 'bg-brand-500'}`} 
                      style={{ width: `${day.completionPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
