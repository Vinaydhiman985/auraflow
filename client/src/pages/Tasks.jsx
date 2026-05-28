import React, { useState } from 'react';
import { useHabits, getFormattedDate } from '../context/HabitContext';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  X,
  Edit,
  Bolt,
  Mic,
  PlusCircle,
  HelpCircle,
  Settings,
  Sparkles,
  Check,
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

const PRIORITY_BADGES = {
  high: 'bg-rose-500/10 text-rose-500 border-rose-500/10',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/10',
  low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10'
};

const Tasks = () => {
  const { 
    tasks, 
    habits, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTask,
    logs
  } = useHabits();

  // Local UI States
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getFormattedDate());
  const [quickTitle, setQuickTitle] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(getFormattedDate());
  const [linkedHabitId, setLinkedHabitId] = useState('');

  // 1. GENERATE WEEK DAYS SCROLLER
  const getWeekDays = () => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1)); // Mon of this week
    
    const days = [];
    const weekdaysName = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = getFormattedDate(d);
      days.push({
        name: weekdaysName[i],
        dayNum: String(d.getDate()).padStart(2, '0'),
        dateStr,
        isToday: dateStr === getFormattedDate(),
        isSelected: dateStr === selectedDate
      });
    }
    return days;
  };
  const weekDays = getWeekDays();

  // 2. FILTER TASKS FOR THE SELECTED DATE
  const dateTasks = tasks.filter(t => t.dueDate === selectedDate);

  // Group tasks by priority for the dropzones
  const criticalTasks = dateTasks.filter(t => t.priority === 'high');
  const importantTasks = dateTasks.filter(t => t.priority === 'medium');
  const routineTasks = dateTasks.filter(t => t.priority === 'low');

  // 3. HTML5 DRAG & DROP LOGIC
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newPriority) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    const task = tasks.find(t => (t._id || t.id) === taskId);
    if (task) {
      updateTask(taskId, {
        title: task.title,
        priority: newPriority,
        dueDate: task.dueDate,
        linkedHabitId: task.linkedHabitId
      });
    }
  };

  // 4. TODAY'S FOCUS WIDGET STATS
  const todayStr = getFormattedDate();
  const habitsCount = habits.length;
  const completedTodayCount = habits.filter(h => {
    const list = logs?.[h._id || h.id] || [];
    return list.includes(todayStr);
  }).length;
  const habitsPercentage = habitsCount > 0 ? Math.round((completedTodayCount / habitsCount) * 100) : 70;

  // Form Operations
  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setPriority('medium');
    setDueDate(selectedDate);
    setLinkedHabitId('');
    setIsOpen(true);
  };

  const openEditModal = (e, task) => {
    e.stopPropagation();
    setEditingId(task._id || task.id);
    setTitle(task.title);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setLinkedHabitId(task.linkedHabitId || '');
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;

    const payload = {
      title,
      priority,
      dueDate,
      linkedHabitId,
    };

    if (editingId) {
      updateTask(editingId, payload);
    } else {
      addTask(payload);
    }
    setIsOpen(false);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickTitle) return;
    addTask({
      title: quickTitle,
      priority: 'medium',
      dueDate: selectedDate,
      linkedHabitId: ''
    });
    setQuickTitle('');
  };

  const getMonthYearString = () => {
    const d = new Date(selectedDate);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-8 pb-16 font-sans">

      {/* PAGE HEADER */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex-shrink-0">
            <img 
              alt="Planner Icon" 
              className="w-full h-full object-contain" 
              src="/tasks-badge.png" 
            />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl text-slate-800 dark:text-white tracking-tight">
              Task Planner
            </h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Focus on what matters today.
            </p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-full text-sm hover:opacity-90 active:scale-95 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Task
        </button>
      </header>

      {/* PLANNER GRID BENTO */}
      <div className="grid grid-cols-12 gap-6">

        {/* Main Calendar Heatmap Card (Span 8) */}
        <section className="col-span-12 lg:col-span-8 glass-card rounded-[2rem] p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <span className="font-display font-bold text-lg text-slate-800 dark:text-white">
              {getMonthYearString()}
            </span>
            <div className="flex gap-4 text-xs font-semibold text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400"></span> Critical</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Important</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Routine</span>
            </div>
          </div>

          {/* Date Selector Scroller */}
          <div className="flex justify-start md:justify-between items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {weekDays.map(day => (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDate(day.dateStr)}
                className={`flex-1 flex flex-col items-center gap-2 p-3.5 rounded-[1.5rem] min-w-[72px] transition-all cursor-pointer border
                  ${day.isSelected 
                    ? 'bg-primary text-white scale-105 shadow-md shadow-emerald-500/20 border-primary' 
                    : 'glass-card border-slate-200/40 hover:border-primary/30 text-slate-500 dark:text-slate-400 hover:scale-102'}`}
                style={{
                  backgroundColor: day.isSelected ? '#006d3e' : undefined,
                  borderColor: day.isSelected ? '#006d3e' : undefined
                }}
              >
                <span className={`text-[10px] font-bold tracking-wider ${day.isSelected ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'}`}>
                  {day.name}
                </span>
                <span className="text-lg font-extrabold">{day.dayNum}</span>
                {day.isToday && !day.isSelected && <div className="w-1 h-1 bg-primary rounded-full mt-0.5"></div>}
              </button>
            ))}
          </div>

          {/* Draggable Dropzones Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            
            {/* 1. Critical Dropzone */}
            <div 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'high')}
              className="rounded-[1.75rem] p-5 flex flex-col gap-4 min-h-[300px] border border-rose-100 dark:border-rose-950/20 bg-rose-50/40 dark:bg-rose-950/5 relative group"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm text-rose-600 dark:text-rose-400">Critical</span>
                <AlertTriangle className="w-4.5 h-4.5 text-rose-500/50" />
              </div>
              <div className="space-y-3 overflow-y-auto max-h-[280px] scrollbar-hide pr-0.5">
                {criticalTasks.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-rose-200/40 dark:border-rose-950/30 rounded-xl opacity-60">
                    <p className="text-[10px] text-rose-500 font-semibold uppercase tracking-wider">No Critical Tasks</p>
                  </div>
                ) : (
                  criticalTasks.map(t => (
                    <div
                      key={t._id || t.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, t._id || t.id)}
                      className={`p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:translate-y-[-2px] transition-all flex items-center justify-between group/item ${t.completed ? 'opacity-55' : ''}`}
                    >
                      <div className="min-w-0" onClick={() => toggleTask(t._id || t.id)}>
                        <p className={`font-semibold text-xs text-slate-800 dark:text-slate-200 truncate cursor-pointer ${t.completed ? 'line-through' : ''}`}>
                          {t.title}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button onClick={(e) => openEditModal(e, t)} className="p-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Edit className="w-3 h-3" /></button>
                        <button onClick={(e) => { e.stopPropagation(); deleteTask(t._id || t.id); }} className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-500"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2. Important Dropzone */}
            <div 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'medium')}
              className="rounded-[1.75rem] p-5 flex flex-col gap-4 min-h-[300px] border border-amber-100 dark:border-amber-950/10 bg-amber-50/20 dark:bg-amber-950/5 relative group"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm text-amber-600 dark:text-amber-400">Important</span>
                <TrendingUp className="w-4.5 h-4.5 text-amber-500/50" />
              </div>
              <div className="space-y-3 overflow-y-auto max-h-[280px] scrollbar-hide pr-0.5">
                {importantTasks.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-amber-200/40 dark:border-amber-950/20 rounded-xl opacity-60">
                    <p className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider">No Important Tasks</p>
                  </div>
                ) : (
                  importantTasks.map(t => (
                    <div
                      key={t._id || t.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, t._id || t.id)}
                      className={`p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:translate-y-[-2px] transition-all flex items-center justify-between group/item ${t.completed ? 'opacity-55' : ''}`}
                    >
                      <div className="min-w-0" onClick={() => toggleTask(t._id || t.id)}>
                        <p className={`font-semibold text-xs text-slate-800 dark:text-slate-200 truncate cursor-pointer ${t.completed ? 'line-through' : ''}`}>
                          {t.title}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button onClick={(e) => openEditModal(e, t)} className="p-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Edit className="w-3 h-3" /></button>
                        <button onClick={(e) => { e.stopPropagation(); deleteTask(t._id || t.id); }} className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-500"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. Routine Dropzone */}
            <div 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'low')}
              className="rounded-[1.75rem] p-5 flex flex-col gap-4 min-h-[300px] border border-emerald-100 dark:border-emerald-950/20 bg-emerald-50/20 dark:bg-emerald-950/5 relative group"
              style={{
                borderColor: '#e6f4ea'
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm text-primary dark:text-emerald-400">Routine</span>
                <Check className="w-4.5 h-4.5 text-primary/50" />
              </div>
              <div className="space-y-3 overflow-y-auto max-h-[280px] scrollbar-hide pr-0.5">
                {routineTasks.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-emerald-200/40 dark:border-emerald-950/20 rounded-xl opacity-60">
                    <p className="text-[10px] text-primary font-semibold uppercase tracking-wider">No Routine Tasks</p>
                  </div>
                ) : (
                  routineTasks.map(t => (
                    <div
                      key={t._id || t.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, t._id || t.id)}
                      className={`p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:translate-y-[-2px] transition-all flex items-center justify-between group/item ${t.completed ? 'opacity-55' : ''}`}
                    >
                      <div className="min-w-0" onClick={() => toggleTask(t._id || t.id)}>
                        <p className={`font-semibold text-xs text-slate-800 dark:text-slate-200 truncate cursor-pointer ${t.completed ? 'line-through' : ''}`}>
                          {t.title}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button onClick={(e) => openEditModal(e, t)} className="p-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Edit className="w-3 h-3" /></button>
                        <button onClick={(e) => { e.stopPropagation(); deleteTask(t._id || t.id); }} className="p-1 rounded bg-red-50 hover:bg-red-100 text-red-500"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Sidebar widgets panel (Span 4) */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          {/* Today's Focus Habit Percent Widget */}
          <div className="glass-card rounded-[2rem] p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">Today's Focus</h3>
                <p className="text-xs text-slate-400 mt-1">{completedTodayCount} of {habitsCount} habits done</p>
              </div>
              
              {/* Progress SVG */}
              <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle 
                    className="text-slate-100 dark:text-slate-800" 
                    cx="32" 
                    cy="32" 
                    fill="transparent" 
                    r="28" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <circle 
                    className="text-primary transition-all duration-700" 
                    cx="32" 
                    cy="32" 
                    fill="transparent" 
                    r="28" 
                    stroke="currentColor" 
                    strokeWidth="4"
                    strokeDasharray="175.9"
                    strokeDashoffset={175.9 - (175.9 * habitsPercentage) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-xs text-primary">
                  {habitsPercentage}%
                </span>
              </div>
            </div>

            {/* Micro list of today's habits */}
            <div className="space-y-3">
              {habits.slice(0, 3).map(h => {
                const dates = logs?.[h._id || h.id] || [];
                const done = dates.includes(todayStr);

                return (
                  <div key={h._id || h.id} className="flex items-center gap-3 p-3 bg-white/40 dark:bg-slate-900/35 border border-slate-100/50 rounded-2xl">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${done ? 'bg-primary border-primary text-white' : 'border-slate-300 dark:border-slate-700'}`}>
                      {done && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-xs font-semibold flex-1 truncate ${done ? 'line-through text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
                      {h.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Energy level peak chart */}
          <div className="glass-card rounded-[2rem] p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <Bolt className="w-5 h-5 text-secondary animate-pulse" />
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">Energy Peak</h3>
            </div>
            
            <div className="flex items-end justify-between h-20 gap-2 px-1">
              <div className="flex-1 bg-slate-200/50 dark:bg-slate-800 rounded-t-lg h-1/2"></div>
              <div className="flex-1 bg-secondary/35 rounded-t-lg h-[70%]"></div>
              <div className="flex-1 bg-secondary rounded-t-lg h-full"></div>
              <div className="flex-1 bg-secondary/50 rounded-t-lg h-[65%]"></div>
              <div className="flex-1 bg-slate-200/50 dark:bg-slate-800 rounded-t-lg h-[30%]"></div>
              <div className="flex-1 bg-slate-200/50 dark:bg-slate-800 rounded-t-lg h-1/2"></div>
            </div>
            
            <p className="text-xs text-center text-slate-400 dark:text-slate-500 leading-normal font-medium">
              Your focus is highest between <span className="font-bold text-slate-700 dark:text-slate-300">10:00 - 12:00</span>. Tackle your Critical tasks now!
            </p>
          </div>

          {/* Quick Task Add Input */}
          <form onSubmit={handleQuickAdd} className="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-[2rem] p-1 border border-primary/20">
            <div className="glass-card rounded-[1.8rem] p-4 flex items-center gap-3">
              <button 
                type="submit"
                className="w-8 h-8 bg-primary hover:opacity-90 text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
              <input 
                type="text" 
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="Quick task..."
                className="flex-1 bg-transparent border-none focus:ring-0 placeholder:text-slate-400 text-xs font-semibold dark:text-white outline-none"
              />
              <Mic className="w-4 h-4 text-slate-300" />
            </div>
          </form>

        </aside>

      </div>

      {/* CREATE & EDIT MODAL OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-50 animate-fade-in">
          <div 
            className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200/40 dark:border-slate-800/40 max-h-[85vh] md:max-h-[90vh] overflow-y-auto animate-scale-in z-10">
            
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display font-extrabold text-xl text-slate-850 dark:text-white mb-6">
              {editingId ? 'Edit Task Planner Entry' : 'Create New Action Item'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Task Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Compile Monthly Presentation Reports"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-primary rounded-xl text-sm outline-none transition-all dark:text-white font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-primary rounded-xl text-sm outline-none transition-all cursor-pointer font-semibold dark:text-white"
                  >
                    <option value="high">High (Critical)</option>
                    <option value="medium">Medium (Important)</option>
                    <option value="low">Low (Routine)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-primary rounded-xl text-sm outline-none transition-all font-semibold dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Link to Routine (Habit)</label>
                <select
                  value={linkedHabitId}
                  onChange={(e) => setLinkedHabitId(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-primary rounded-xl text-sm outline-none transition-all cursor-pointer font-semibold dark:text-white"
                >
                  <option value="">Standalone Task</option>
                  {habits.map(h => (
                    <option key={h._id || h.id} value={h._id || h.id} className="dark:bg-slate-900">{h.title}</option>
                  ))}
                </select>
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
                  {editingId ? 'Save Changes' : 'Create Task'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Tasks;
