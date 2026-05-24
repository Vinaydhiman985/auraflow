import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useHabits } from '../context/HabitContext';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Link as LinkIcon, 
  AlertCircle,
  CheckCircle,
  FileText,
  Filter,
  X,
  Edit
} from 'lucide-react';

const PRIORITY_THEMES = {
  high: { border: 'border-l-rose-500', bg: 'bg-rose-500/10 text-rose-500', label: 'High Priority' },
  medium: { border: 'border-l-amber-500', bg: 'bg-amber-500/10 text-amber-500', label: 'Medium Priority' },
  low: { border: 'border-l-slate-400', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400', label: 'Low Priority' }
};

const Tasks = () => {
  const { tasks, habits, addTask, updateTask, deleteTask, toggleTask } = useHabits();

  // Local UI States
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all | active | completed
  const [filterPriority, setFilterPriority] = useState('all'); // all | high | medium | low

  // Form Fields
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [linkedHabitId, setLinkedHabitId] = useState('');

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setPriority('medium');
    setDueDate(new Date().toISOString().split('T')[0]);
    setLinkedHabitId('');
    setIsOpen(true);
  };

  const openEditModal = (task) => {
    setEditingId(task.id);
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

  // Filter Logic
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && !task.completed) || 
      (filterStatus === 'completed' && task.completed);

    const matchesPriority = 
      filterPriority === 'all' || 
      task.priority === filterPriority;

    return matchesStatus && matchesPriority;
  });

  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const taskProductivityPct = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0;

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight">Task Planner</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500">Plan action items, set priorities, and link workflows with active routines.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Task
        </button>
      </div>

      {/* 2. PRODUCTIVITY STATS BANNER */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4">
          <span className="block text-[10px] uppercase font-bold text-slate-400">Total Action Items</span>
          <span className="font-display font-extrabold text-2xl mt-1 block">{totalTasksCount} items</span>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <span className="block text-[10px] uppercase font-bold text-slate-400">Completed Today</span>
          <span className="font-display font-extrabold text-2xl text-brand-500 mt-1 block">{completedTasksCount} / {totalTasksCount}</span>
        </div>
        <div className="glass-card rounded-2xl p-4 col-span-2 md:col-span-1">
          <span className="block text-[10px] uppercase font-bold text-slate-400">Task Productivity Index</span>
          <span className="font-display font-extrabold text-2xl text-emerald-500 mt-1 block">{taskProductivityPct}%</span>
        </div>
      </div>

      {/* 3. FILTERS RIBBON */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {['all', 'active', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`
                px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
                ${filterStatus === status 
                  ? 'bg-brand-500 text-white shadow-sm font-bold scale-102' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }
              `}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/30 dark:border-slate-800/30">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-transparent text-xs font-semibold outline-none py-1 border-none cursor-pointer text-slate-500"
          >
            <option value="all">All Priorities</option>
            <option value="high" className="dark:bg-slate-900">High Only</option>
            <option value="medium" className="dark:bg-slate-900">Medium Only</option>
            <option value="low" className="dark:bg-slate-900">Low Only</option>
          </select>
        </div>
      </div>

      {/* 4. TASKS LIST */}
      {filteredTasks.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-400 border-dashed">
          <p className="text-sm font-semibold">No tasks match your selected filters.</p>
          <p className="text-xs text-slate-500 mt-1">Click "Create New Task" to begin adding your action items!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => {
            const priTheme = PRIORITY_THEMES[task.priority] || PRIORITY_THEMES.medium;
            const linkedHabit = habits.find(h => h.id === task.linkedHabitId);

            return (
              <div 
                key={task.id}
                className={`
                  glass-card rounded-2xl p-4 flex items-center justify-between gap-4 border-l-[5px] transition-all duration-300
                  ${priTheme.border}
                  ${task.completed ? 'opacity-60 bg-slate-100/20 dark:bg-slate-900/10' : 'hover:translate-x-0.5'}
                `}
              >
                {/* Complete Trigger Checkbox */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`
                    h-8 w-8 flex-shrink-0 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-200
                    ${task.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-500'
                    }
                  `}
                >
                  {task.completed && <CheckCircle className="w-5 h-5" />}
                </button>

                {/* Details Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-semibold text-sm truncate leading-tight ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                      {task.title}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase ${priTheme.bg}`}>
                      {task.priority}
                    </span>
                  </div>

                  {/* Task Meta details: due date and routine connection */}
                  <div className="flex items-center gap-4 flex-wrap mt-1 text-slate-400 dark:text-slate-500 text-[10px] font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Due: {task.dueDate}
                    </span>

                    {linkedHabit && (
                      <span className="flex items-center gap-1 text-brand-500 dark:text-brand-400">
                        <LinkIcon className="w-3 h-3" />
                        Routine: {linkedHabit.title}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions deck: Edit and Delete */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(task)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-500 cursor-pointer border border-transparent hover:border-red-500/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CREATE & EDIT MODAL OVERLAY */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
          {/* Centered Modal Card */}
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200/40 dark:border-slate-800/40 max-h-[85vh] md:max-h-[90vh] overflow-y-auto animate-scale-in z-10">
            
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display font-extrabold text-xl mb-6">
              {editingId ? 'Edit Task Planner Entry' : 'Create New Action Item'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Task Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Task Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Compile Monthly Presentation Reports"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:ring focus:ring-brand-500/10 rounded-xl text-sm outline-none transition-all"
                  required
                />
              </div>

              {/* Priority & Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:ring focus:ring-brand-500/10 rounded-xl text-sm outline-none transition-all cursor-pointer font-semibold"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:ring focus:ring-brand-500/10 rounded-xl text-sm outline-none transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Habit linkage dropdown */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Link to Routine (Habit)</label>
                <div className="relative">
                  <select
                    value={linkedHabitId}
                    onChange={(e) => setLinkedHabitId(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:ring focus:ring-brand-500/10 rounded-xl text-sm outline-none transition-all cursor-pointer font-semibold"
                  >
                    <option value="">No linkage (Standalone Task)</option>
                    {habits.map(h => (
                      <option key={h.id} value={h.id} className="dark:bg-slate-900">{h.title} ({h.category})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
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
                  {editingId ? 'Save Changes' : 'Create Task'}
                </button>
              </div>

            </form>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Tasks;
