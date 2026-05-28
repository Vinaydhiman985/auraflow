import React, { useState } from 'react';
import { useHabits, HABIT_CATEGORIES, getFormattedDate } from '../context/HabitContext';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  TrendingUp,
  Flame,
  Award,
  Leaf,
  Rocket,
  PlusCircle,
  Sparkles,
  Droplet,
  Brain,
  Moon,
  Dumbbell,
  GraduationCap,
  Code,
  Calendar,
  ChevronRight
} from 'lucide-react';

const ICONS_PRESETS = [
  { name: 'GraduationCap', label: 'Study', icon: GraduationCap },
  { name: 'Code', label: 'Coding', icon: Code },
  { name: 'Dumbbell', label: 'Fitness', icon: Dumbbell },
  { name: 'BookOpen', label: 'Reading', icon: Brain },
  { name: 'Moon', label: 'Sleep', icon: Moon },
  { name: 'Sparkles', label: 'Wellness', icon: Sparkles },
];

const COLORS_PRESETS = [
  { name: 'emerald', class: 'bg-emerald-500 hover:bg-emerald-600', text: 'text-emerald-500', ring: 'ring-emerald-500/30', border: 'border-emerald-500/20', bg: 'bg-emerald-50' },
  { name: 'sky', class: 'bg-sky-500 hover:bg-sky-600', text: 'text-sky-500', ring: 'ring-sky-500/30', border: 'border-sky-500/20', bg: 'bg-sky-50' },
  { name: 'indigo', class: 'bg-indigo-500 hover:bg-indigo-600', text: 'text-indigo-500', ring: 'ring-indigo-500/30', border: 'border-indigo-500/20', bg: 'bg-indigo-50' },
  { name: 'rose', class: 'bg-rose-500 hover:bg-rose-600', text: 'text-rose-500', ring: 'ring-rose-500/30', border: 'border-rose-500/20', bg: 'bg-rose-50' },
  { name: 'amber', class: 'bg-amber-500 hover:bg-amber-600', text: 'text-amber-500', ring: 'ring-amber-500/30', border: 'border-amber-500/20', bg: 'bg-amber-50' },
];

// Helper to render preset icons dynamically
const LucideIcon = ({ name, className }) => {
  const iconMap = {
    GraduationCap,
    Code,
    Dumbbell,
    Moon,
    Sparkles,
    Droplet,
    Brain,
  };
  const IconComponent = iconMap[name] || GraduationCap;
  return <IconComponent className={className} />;
};

const Habits = () => {
  const { user } = useAuth();
  const {
    habits,
    logs,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitLog,
    calculateStreak
  } = useHabits();

  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Study');
  const [frequency, setFrequency] = useState('daily');
  const [targetDays, setTargetDays] = useState(5);
  const [color, setColor] = useState('emerald');
  const [icon, setIcon] = useState('GraduationCap');
  const [subject, setSubject] = useState('');

  // 1. STREAK CALCULATION
  let maxStreak = 0;
  habits.forEach(h => {
    const { currentStreak } = calculateStreak(h._id || h.id);
    if (currentStreak > maxStreak) maxStreak = currentStreak;
  });
  const displayStreak = maxStreak > 0 ? maxStreak : 12;

  // 2. TODAY'S PROGRESS
  const todayStr = getFormattedDate();
  const totalHabits = habits.length;
  const completedCount = habits.filter(h => {
    const hId = h._id || h.id;
    const dates = logs?.[hId] || [];
    return dates.includes(todayStr);
  }).length;

  const remainingCount = totalHabits > 0 ? totalHabits - completedCount : 3;
  const percentCompleted = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 57;
  const displayCompleted = totalHabits > 0 ? completedCount : 4;
  const displayTotal = totalHabits > 0 ? totalHabits : 7;

  // 3. WEEKLY TREND (Mon - Sun completions)
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
  const completionsByDay = weekDays.map(dateStr => {
    return habits.filter(h => {
      const hId = h._id || h.id;
      const dates = logs?.[hId] || [];
      return dates.includes(dateStr);
    }).length;
  });

  const maxCompletions = Math.max(...completionsByDay, 1);
  const barHeights = totalHabits > 0
    ? completionsByDay.map(count => `${Math.max(10, Math.round((count / maxCompletions) * 100))}%`)
    : ['40%', '60%', '50%', '80%', '90%', '100%', '20%'];

  // 4. GARDEN ARCHIVE
  let bestHabitName = "Morning Meditation";
  let bestStreak = 24;
  if (totalHabits > 0) {
    let maxStr = 0;
    habits.forEach(h => {
      const { longestStreak } = calculateStreak(h._id || h.id);
      if (longestStreak > maxStr) {
        maxStr = longestStreak;
        bestHabitName = h.title;
        bestStreak = longestStreak;
      }
    });
  }

  // Count perfect days (all habits completed) in the logged dates
  const allLoggedDates = Array.from(new Set(Object.values(logs || {}).filter(Array.isArray).flat()));
  const perfectDaysCount = allLoggedDates.filter(dateStr => {
    if (totalHabits === 0) return false;
    return habits.every(h => {
      const hId = h._id || h.id;
      const dates = logs?.[hId] || [];
      return dates.includes(dateStr);
    });
  }).length;
  const displayPerfectDays = totalHabits > 0 ? perfectDaysCount : 8;

  // Form Operations
  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Study');
    setFrequency('daily');
    setTargetDays(5);
    setColor('emerald');
    setIcon('GraduationCap');
    setSubject('');
    setIsOpen(true);
  };

  const openEditModal = (e, habit) => {
    e.stopPropagation(); // Avoid triggering completion toggle when clicking edit
    setEditingId(habit._id || habit.id);
    setTitle(habit.title);
    setCategory(habit.category);
    setFrequency(habit.frequency);
    setTargetDays(habit.targetDays);
    setColor(habit.color || 'emerald');
    setIcon(habit.icon || 'GraduationCap');
    setSubject(habit.subject || '');
    setIsOpen(true);
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation(); // Avoid triggering completion toggle
    deleteHabit(id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;

    const payload = {
      title,
      category,
      frequency,
      targetDays: Number(targetDays),
      color,
      icon,
      subject,
    };

    if (editingId) {
      updateHabit(editingId, payload);
    } else {
      addHabit(payload);
    }
    setIsOpen(false);
  };

  const getTodayDateString = () => {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div className="space-y-10 pb-16 font-sans">
      
      {/* 1. TOP BAR */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-slate-900 dark:text-white tracking-tight">
            Habit Garden
          </h2>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-1">
            Watch your daily intentions flourish.
          </p>
        </div>
        <div className="flex items-center gap-4 self-start sm:self-auto">
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 px-5 py-2.5 rounded-full shadow-sm">
            <Flame className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-500" />
            <span className="font-semibold text-sm text-emerald-800 dark:text-emerald-300">
              {displayStreak} Day Streak
            </span>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-full text-sm hover:opacity-90 active:scale-95 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Habit
          </button>
        </div>
      </header>

      {/* 2. HABIT GARDEN BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Growth Overview Hero */}
        <div className="md:col-span-8 glass-card rounded-[2rem] p-8 flex flex-col md:flex-row gap-8 items-center justify-between relative overflow-hidden">
          {/* Back glows */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          
          <div className="flex-1 space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              {getTodayDateString()}
            </span>
            <h3 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight text-slate-800 dark:text-white">
              Today's Progress
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-md leading-relaxed">
              {totalHabits > 0
                ? `You've completed ${completedCount} out of ${totalHabits} habits today. Keep going, your mind will thank you later!`
                : "You have no active habits today. Plant a new seed below to watch consistency grow!"}
            </p>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold text-primary">{percentCompleted}%</span>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Completed</span>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-800"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold text-slate-700 dark:text-slate-300">{remainingCount}</span>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Remaining</span>
              </div>
            </div>
          </div>
          
          {/* Progress Ring */}
          <div className="relative w-48 h-48 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                className="text-slate-100 dark:text-slate-800"
                cx="50%"
                cy="50%"
                fill="transparent"
                r="40%"
                stroke="currentColor"
                strokeWidth="10"
              />
              <circle
                className="text-primary transition-all duration-700 ease-out"
                cx="50%"
                cy="50%"
                fill="transparent"
                r="40%"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray="251"
                strokeDashoffset={251 - (251 * percentCompleted) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                alt="Habits Garden Growth Icon"
                className="w-20 h-20 object-contain hover:scale-105 transition-transform"
                src="/plant-growth.png"
              />
            </div>
          </div>
        </div>

        {/* Weekly Trend Card */}
        <div className="md:col-span-4 glass-card rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-display font-bold text-lg text-slate-800 dark:text-white">Weekly Trend</h4>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-primary">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-end gap-3 h-28 mt-2">
            {barHeights.map((height, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group/bar">
                {/* Tooltip on Hover */}
                <span className="opacity-0 group-hover/bar:opacity-100 absolute -translate-y-8 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded transition-opacity duration-200 pointer-events-none z-10">
                  {totalHabits > 0 ? `${completionsByDay[idx]} completed` : 'Styled'}
                </span>
                <div
                  className="w-full bg-primary/20 dark:bg-primary/10 rounded-t-lg transition-all duration-500 ease-out group-hover/bar:bg-primary"
                  style={{
                    height,
                    backgroundColor: height === '100%' ? 'rgba(0,109,62,0.8)' : undefined
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>
        </div>

      </div>

      {/* 3. HABIT GROWTH CARDS (THE GARDEN) */}
      <div className="space-y-6">
        <h3 className="font-display font-extrabold text-2xl text-slate-800 dark:text-white tracking-tight">
          Your Intentions
        </h3>

        {totalHabits === 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Seed 1 Mock Card */}
            <div className="glass-card rounded-[2rem] p-6 habit-grow-animation border-l-4 border-l-emerald-500 opacity-60">
              <div className="flex justify-between mb-6">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl flex items-center justify-center text-primary">
                  <Brain className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Streak</p>
                  <p className="font-extrabold text-lg text-primary">24 Days</p>
                </div>
              </div>
              <h5 className="font-display font-bold text-lg mb-1 text-slate-800">Morning Meditation</h5>
              <p className="text-xs text-slate-400 mb-6">10 mins mindfulness</p>
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1 bg-emerald-500 text-white rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-500/10">
                  <Check className="w-3.5 h-3.5" />
                  Bloomed
                </span>
                <span className="text-xs text-slate-400 font-semibold">7:00 AM</span>
              </div>
            </div>

            {/* Seed 2 Mock Card */}
            <div className="glass-card rounded-[2rem] p-6 habit-grow-animation border-l-4 border-l-amber-500 opacity-60">
              <div className="flex justify-between mb-6">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 rounded-2xl flex items-center justify-center text-amber-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Streak</p>
                  <p className="font-extrabold text-lg text-amber-600">8 Days</p>
                </div>
              </div>
              <h5 className="font-display font-bold text-lg mb-1 text-slate-800">Deep Reading</h5>
              <p className="text-xs text-slate-400 mb-6">20 pages minimum</p>
              <div className="flex items-center justify-between">
                <button className="px-5 py-2 border border-amber-500/30 text-amber-600 hover:bg-amber-500 hover:text-white rounded-full text-xs font-bold transition-all cursor-not-allowed">
                  Mark Done
                </button>
                <span className="text-xs text-slate-400 font-semibold">9:00 PM</span>
              </div>
            </div>

            {/* Seed 3 Mock Card */}
            <div className="glass-card rounded-[2rem] p-6 habit-grow-animation border-l-4 border-l-sky-500 opacity-60">
              <div className="flex justify-between mb-6">
                <div className="w-12 h-12 bg-sky-50 dark:bg-sky-950/20 rounded-2xl flex items-center justify-center text-sky-600">
                  <Droplet className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Streak</p>
                  <p className="font-extrabold text-lg text-sky-600">42 Days</p>
                </div>
              </div>
              <h5 className="font-display font-bold text-lg mb-1 text-slate-800">Hydration Target</h5>
              <p className="text-xs text-slate-400 mb-6">2.5 Liters daily</p>
              <div className="w-full bg-slate-100 h-2 rounded-full mb-4 overflow-hidden">
                <div className="bg-sky-500 h-full" style={{ width: '75%' }}></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-sky-600 font-extrabold">1.8 / 2.5L</span>
                <span className="text-xs text-slate-400 font-semibold">All Day</span>
              </div>
            </div>
            
            {/* New Habit Seed Trigger */}
            <div
              onClick={openAddModal}
              className="rounded-[2rem] p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 flex flex-col items-center justify-center text-slate-400 hover:text-primary transition-all cursor-pointer group"
            >
              <PlusCircle className="w-12 h-12 mb-3 text-slate-300 group-hover:text-primary group-hover:scale-105 transition-all" />
              <h4 className="font-display font-bold text-lg text-slate-700 dark:text-slate-300">Plant a New Seed</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[200px] text-center">Start a fresh habit today and watch it grow.</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map(habit => {
              const hId = habit._id || habit.id;
              const { currentStreak } = calculateStreak(hId);
              const dates = logs?.[hId] || [];
              const isCompletedToday = dates.includes(todayStr);

              // Find presets
              const colorObj = COLORS_PRESETS.find(c => c.name === habit.color) || COLORS_PRESETS[0];
              const catObj = HABIT_CATEGORIES.find(c => c.name === habit.category) || HABIT_CATEGORIES[0];

              return (
                <div
                  key={hId}
                  onClick={() => toggleHabitLog(hId)}
                  className={`glass-card rounded-[2rem] p-6 habit-grow-animation cursor-pointer border-l-4 border-l-${colorObj.name}-500 hover:shadow-md transition-all relative group`}
                  style={{ borderLeftColor: colorObj.name === 'emerald' ? '#006d3e' : undefined }}
                >
                  
                  {/* Action buttons hover overlay */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-900/90 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm z-20">
                    <button
                      onClick={(e) => openEditModal(e, habit)}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                      title="Edit Habit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, hId)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 dark:bg-red-950/20 transition-all"
                      title="Delete Habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorObj.text} bg-${colorObj.name}-50 dark:bg-${colorObj.name}-950/20`}
                      style={{
                        color: colorObj.name === 'emerald' ? '#006d3e' : undefined,
                        backgroundColor: colorObj.name === 'emerald' ? 'rgba(0,109,62,0.08)' : undefined
                      }}
                    >
                      <LucideIcon name={habit.icon} className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Streak</p>
                      <p className={`font-extrabold text-lg text-${colorObj.name}-600 dark:text-${colorObj.name}-400`}
                        style={{ color: colorObj.name === 'emerald' ? '#006d3e' : undefined }}
                      >
                        {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
                      </p>
                    </div>
                  </div>

                  <h5 className="font-display font-bold text-lg mb-1 text-slate-800 dark:text-white truncate">
                    {habit.title}
                  </h5>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 truncate">
                    {habit.subject ? `📚 ${habit.subject}` : '🌱 General intent'}
                  </p>

                  <div className="flex items-center justify-between">
                    {isCompletedToday ? (
                      <span className="px-3.5 py-1 bg-primary text-white dark:bg-emerald-600/90 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-500/10">
                        <Check className="w-3.5 h-3.5" />
                        Bloomed
                      </span>
                    ) : (
                      <button className="px-5 py-2 border border-slate-200 hover:border-primary dark:border-slate-800 text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-emerald-400 rounded-full text-xs font-bold transition-all">
                        Mark Done
                      </button>
                    )}
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                      {habit.targetDays}x / week
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Plant Seed Card inside active list */}
            <div
              onClick={openAddModal}
              className="glass-card rounded-[2rem] p-8 border-2 border-dashed border-slate-200/60 dark:border-slate-800/80 hover:border-primary/50 flex flex-col items-center justify-center text-slate-400 hover:text-primary transition-all cursor-pointer group"
            >
              <PlusCircle className="w-10 h-10 mb-3 text-slate-300 dark:text-slate-700 group-hover:text-primary group-hover:scale-105 transition-all" />
              <h4 className="font-display font-bold text-base text-slate-700 dark:text-slate-300">Plant a New Seed</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[200px] text-center">Add another habit or academic streak.</p>
            </div>

          </div>
        )}
      </div>

      {/* 4. MONTHLY SEEDLINGS BENTO SECTION */}
      <section className="mt-16 space-y-6">
        <h3 className="font-display font-extrabold text-2xl text-slate-800 dark:text-white tracking-tight">
          Garden Archive
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="glass-card rounded-[2rem] p-6 flex items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-primary flex-shrink-0">
              <Leaf className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Most Consistent</h4>
              <p className="font-display font-extrabold text-slate-800 dark:text-white text-base truncate leading-snug">
                {bestHabitName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                Streak: {bestStreak} Days
              </p>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 flex items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="w-16 h-16 rounded-full bg-sky-50 dark:bg-sky-950/20 flex items-center justify-center text-sky-600 flex-shrink-0">
              <Rocket className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Biggest Growth</h4>
              <p className="font-display font-extrabold text-slate-800 dark:text-white text-base leading-snug">
                Hydration Streaks
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                +12% Consistency
              </p>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 flex items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-600 flex-shrink-0">
              <Award className="w-8 h-8 fill-amber-100 dark:fill-amber-900/10" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Perfect Days</h4>
              <p className="font-display font-extrabold text-slate-800 dark:text-white text-base leading-snug">
                {displayPerfectDays} {displayPerfectDays === 1 ? 'Time' : 'Times'} This Month
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                All daily intentions completed
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. CREATE & EDIT DIALOG MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 animate-fade-in">
          <div
            className="fixed inset-0 bg-slate-950/45 dark:bg-slate-950/70 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200/50 dark:border-slate-800/40 max-h-[90vh] overflow-y-auto animate-scale-in">
            
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display font-extrabold text-xl text-slate-800 dark:text-white mb-6">
              {editingId ? 'Edit Intention / Habit' : 'Plant a New Habit Seed'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Habit Name *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Morning Meditation"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-emerald-500 rounded-xl text-sm outline-none transition-all dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Linked Subject or Academic Project (Optional)
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Physics II or 10 mins mindfulness"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-emerald-500 rounded-xl text-sm outline-none transition-all dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-emerald-500 rounded-xl text-sm outline-none transition-all cursor-pointer font-semibold dark:text-white"
                  >
                    {HABIT_CATEGORIES.map(cat => (
                      <option key={cat.name} value={cat.name} className="dark:bg-slate-900">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    Weekly Target (1-7 Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={targetDays}
                    onChange={(e) => setTargetDays(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-primary dark:focus:border-emerald-500 rounded-xl text-sm outline-none transition-all dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Select Icon Type
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {ICONS_PRESETS.map(item => {
                    const PresetIcon = item.icon;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setIcon(item.name)}
                        className={`h-11 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-lg
                          ${icon === item.name
                            ? 'bg-primary border-primary text-white scale-95 shadow-md shadow-emerald-500/10'
                            : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-primary/40 hover:scale-102 text-slate-500 dark:text-slate-400'
                          }`}
                        title={item.label}
                      >
                        <PresetIcon className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Garden Accent Aesthetic Color
                </label>
                <div className="flex gap-3 flex-wrap">
                  {COLORS_PRESETS.map(c => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColor(c.name)}
                      className={`h-8 w-8 rounded-full border border-white/20 relative flex items-center justify-center transition-all duration-300 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 cursor-pointer
                        ${c.class}
                        ${color === c.name ? `ring-2 ${c.ring} scale-110 shadow` : 'hover:scale-105'}`}
                      title={c.name}
                    >
                      {color === c.name && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 font-semibold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-primary hover:opacity-90 text-white font-bold text-xs cursor-pointer shadow-md transition-all shadow-emerald-500/10"
                >
                  {editingId ? 'Save Changes' : 'Plant Seed'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Habits;
