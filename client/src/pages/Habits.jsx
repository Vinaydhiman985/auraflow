import React, { useState } from 'react';
import { useHabits, HABIT_CATEGORIES } from '../context/HabitContext';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  Code,
  Dumbbell,
  BookOpen,
  Moon,
  Sparkle,
  GraduationCap
} from 'lucide-react';

const ICONS_PRESETS = [
  { name: 'GraduationCap', label: 'Study', char: '🎓' },
  { name: 'Code', label: 'Coding', char: '💻' },
  { name: 'Dumbbell', label: 'Fitness', char: '🏋️' },
  { name: 'BookOpen', label: 'Reading', char: '📖' },
  { name: 'Moon', label: 'Sleep', char: '🌙' },
  { name: 'Sparkles', label: 'Wellness', char: '✨' },
];

const COLORS_PRESETS = [
  { name: 'indigo', class: 'bg-indigo-500 hover:bg-indigo-600', text: 'text-indigo-500', ring: 'ring-indigo-500/30' },
  { name: 'emerald', class: 'bg-emerald-500 hover:bg-emerald-600', text: 'text-emerald-500', ring: 'ring-emerald-500/30' },
  { name: 'rose', class: 'bg-rose-500 hover:bg-rose-600', text: 'text-rose-500', ring: 'ring-rose-500/30' },
  { name: 'amber', class: 'bg-amber-500 hover:bg-amber-600', text: 'text-amber-500', ring: 'ring-amber-500/30' },
  { name: 'sky', class: 'bg-sky-500 hover:bg-sky-600', text: 'text-sky-500', ring: 'ring-sky-500/30' },
  { name: 'sky-light', class: 'bg-sky-300 hover:bg-sky-400', text: 'text-sky-400', ring: 'ring-sky-300/30' }, // Replaced purple with light skyblue!
];

// Local Icon Lookup
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

const Habits = () => {
  const { habits, addHabit, updateHabit, deleteHabit, calculateStreak } = useHabits();

  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Study');
  const [frequency, setFrequency] = useState('daily');
  const [targetDays, setTargetDays] = useState(5);
  const [color, setColor] = useState('indigo');
  const [icon, setIcon] = useState('GraduationCap');
  const [subject, setSubject] = useState('');

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Study');
    setFrequency('daily');
    setTargetDays(5);
    setColor('indigo');
    setIcon('GraduationCap');
    setSubject('');
    setIsOpen(true);
  };

  const openEditModal = (habit) => {
    setEditingId(habit.id);
    setTitle(habit.title);
    setCategory(habit.category);
    setFrequency(habit.frequency);
    setTargetDays(habit.targetDays);
    setColor(habit.color);
    setIcon(habit.icon);
    setSubject(habit.subject || '');
    setIsOpen(true);
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

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight">Manage Habits</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500">Configure habits, linked academic subjects, targets, and design aesthetics.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Habit
        </button>
      </div>

      {/* Grid List */}
      {habits.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 border-dashed">
          <div className="h-16 w-14 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-3xl">
            🌱
          </div>
          <div>
            <h4 className="font-semibold text-lg">Your garden is empty</h4>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-sm">Every long journey begins with a single step. Create a new habit to start tracking your progress!</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Habit
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map(habit => {
            const { longestStreak } = calculateStreak(habit.id);
            const catObj = HABIT_CATEGORIES.find(c => c.name === habit.category) || HABIT_CATEGORIES[0];
            const colorObj = COLORS_PRESETS.find(c => c.name === habit.color) || COLORS_PRESETS[0];

            return (
              <div
                key={habit.id}
                className="glass-card rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/40 flex flex-col justify-between h-[230px] group"
              >
                {/* Upper Deck */}
                <div>
                  <div className="flex items-start justify-between gap-4">
                    {/* Icon Bubble */}
                    <div className={`h-11 w-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center ${colorObj.text} shadow-sm group-hover:scale-105 transition-transform`}>
                      <LucideIcon name={habit.icon} className="w-5 h-5" />
                    </div>

                    {/* Action Cards Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(habit)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
                        title="Edit Habit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-500 cursor-pointer border border-transparent hover:border-red-500/10 transition-all"
                        title="Delete Habit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Info */}
                  <div className="mt-4 space-y-1">
                    <h3 className="font-semibold text-base truncate group-hover:text-brand-500 transition-colors">
                      {habit.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${catObj.border} ${catObj.text} bg-white dark:bg-slate-900`}>
                        {habit.category}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                        {habit.targetDays}x / week
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lower Deck - Streak Stats and Subject */}
                <div className="mt-6 pt-3 border-t border-slate-200/30 dark:border-slate-800/30 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-medium font-sans">
                  <div className="truncate pr-4">
                    {habit.subject ? (
                      <span className="truncate block max-w-[150px] leading-tight">📚 {habit.subject}</span>
                    ) : (
                      <span className="leading-tight">🌱 General routine</span>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1">
                    <span>Longest streak:</span>
                    <span className={`font-display font-extrabold ${colorObj.text} text-sm leading-none`}>{longestStreak}d</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CREATE & EDIT MODAL OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-50 animate-fade-in">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
          {/* Absolutely Centered Modal Card */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200/40 dark:border-slate-800/40 max-h-[90vh] overflow-y-auto animate-scale-in">

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <h3 className="font-display font-extrabold text-xl mb-6">
              {editingId ? 'Edit Habit / Routine' : 'Create New Habit / Routine'}
            </h3>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Title input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Habit Name *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Reading Lecture Slides"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:ring focus:ring-brand-500/10 rounded-xl text-sm outline-none transition-all"
                  required
                />
              </div>

              {/* Linked Subject input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Linked Subject / Project (Optional)</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Physics II or Q3 Presentation"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:ring focus:ring-brand-500/10 rounded-xl text-sm outline-none transition-all"
                />
              </div>

              {/* Grid 2-col category & days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:ring focus:ring-brand-500/10 rounded-xl text-sm outline-none transition-all cursor-pointer font-medium"
                  >
                    {HABIT_CATEGORIES.map(cat => (
                      <option key={cat.name} value={cat.name} className="dark:bg-slate-900">{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Weekly Target (1-7)</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={targetDays}
                    onChange={(e) => setTargetDays(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:ring focus:ring-brand-500/10 rounded-xl text-sm outline-none transition-all"
                  />
                </div>

              </div>

              {/* Icon selector Bubble Grid */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Select Icon</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {ICONS_PRESETS.map(item => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setIcon(item.name)}
                      className={`
                        h-11 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-lg
                        ${icon === item.name
                          ? 'bg-brand-500 border-brand-500 text-white scale-95 shadow-md shadow-brand-500/10'
                          : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-brand-500/40 hover:scale-102'
                        }
                      `}
                      title={item.label}
                    >
                      <LucideIcon name={item.name} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color selector Bubble Grid */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Accent Aesthetic Color</label>
                <div className="flex gap-3 flex-wrap">
                  {COLORS_PRESETS.map(c => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColor(c.name)}
                      className={`
                        h-8 w-8 rounded-full border border-white/20 relative flex items-center justify-center transition-all duration-300 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 cursor-pointer
                        ${c.class}
                        ${color === c.name ? `ring-2 ${c.ring} scale-110 shadow` : 'hover:scale-105'}
                      `}
                      title={c.name}
                    >
                      {color === c.name && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200/30 dark:border-slate-800/30 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 font-semibold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs cursor-pointer shadow-md transition-all"
                >
                  {editingId ? 'Save Changes' : 'Add Habit'}
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
