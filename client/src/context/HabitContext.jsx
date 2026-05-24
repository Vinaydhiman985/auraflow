import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const HabitContext = createContext();

export const HABIT_CATEGORIES = [
  { name: 'Study', color: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500/20', hover: 'hover:bg-indigo-500/10' },
  { name: 'Coding', color: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500/20', hover: 'hover:bg-emerald-500/10' },
  { name: 'Fitness', color: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500/20', hover: 'hover:bg-rose-500/10' },
  { name: 'Reading', color: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/20', hover: 'hover:bg-amber-500/10' },
  { name: 'Sleep', color: 'bg-sky-500', text: 'text-sky-500', border: 'border-sky-500/20', hover: 'hover:bg-sky-500/10' },
  { name: 'Wellness', color: 'bg-sky-400', text: 'text-sky-400', border: 'border-sky-400/20', hover: 'hover:bg-sky-400/10' },
];

export const getFormattedDate = (date = new Date()) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const HabitProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState({});
  const [studySessions, setStudySessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Sync state with database APIs when token is valid
  useEffect(() => {
    const fetchAllData = async () => {
      if (!token || !isAuthenticated) {
        setHabits([]);
        setLogs({});
        setStudySessions([]);
        setTasks([]);
        return;
      }

      setLoadingData(true);
      const headers = { 'Authorization': `Bearer ${token}` };

      try {
        // 1. Fetch Habits
        const habitsRes = await fetch('/api/habits', { headers });
        const habitsData = await habitsRes.json();
        if (habitsData.success) setHabits(habitsData.habits);

        // 2. Fetch Completion Logs
        const logsRes = await fetch('/api/habits/logs', { headers });
        const logsData = await logsRes.json();
        if (logsData.success) setLogs(logsData.logs);

        // 3. Fetch Tasks Agenda
        const tasksRes = await fetch('/api/tasks', { headers });
        const tasksData = await tasksRes.json();
        if (tasksData.success) setTasks(tasksData.tasks);

        // 4. Fetch Study Sessions
        const sessionsRes = await fetch('/api/sessions', { headers });
        const sessionsData = await sessionsRes.json();
        if (sessionsData.success) setStudySessions(sessionsData.sessions);

      } catch (err) {
        console.error('Error fetching database routines:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchAllData();
  }, [token, isAuthenticated]);

  // Streak calculations
  const calculateStreak = (habitId, logsObj = logs) => {
    const dates = logsObj[habitId] || [];
    if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));

    const todayStr = getFormattedDate();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getFormattedDate(yesterday);

    let currentStreak = 0;
    let longestStreak = 0;
    let runningStreak = 0;

    const hasCompletedToday = uniqueDates.includes(todayStr);
    const hasCompletedYesterday = uniqueDates.includes(yesterdayStr);

    if (hasCompletedToday || hasCompletedYesterday) {
      let expectedDate = hasCompletedToday ? new Date() : yesterday;
      for (let i = 0; i < uniqueDates.length; i++) {
        const curDateStr = getFormattedDate(expectedDate);
        if (uniqueDates.includes(curDateStr)) {
          currentStreak++;
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    const sortedDatesAsc = [...new Set(dates)].map(d => new Date(d)).sort((a, b) => a - b);
    if (sortedDatesAsc.length > 0) {
      runningStreak = 1;
      longestStreak = 1;
      for (let i = 1; i < sortedDatesAsc.length; i++) {
        const diffTime = Math.abs(sortedDatesAsc[i] - sortedDatesAsc[i - 1]);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          runningStreak++;
        } else if (diffDays > 1) {
          runningStreak = 1;
        }
        if (runningStreak > longestStreak) {
          longestStreak = runningStreak;
        }
      }
    }

    return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
  };

  // 1. Habits Operations
  const addHabit = async (habitData) => {
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(habitData)
      });
      const data = await res.json();

      if (data.success) {
        setHabits(prev => [...prev, data.habit]);
        setLogs(prev => ({ ...prev, [data.habit._id]: [] }));
        toast.success('Habit added successfully!');
      } else {
        toast.error(data.message || 'Failed to create habit.');
      }
    } catch (e) {
      toast.error('Server error creating habit.');
    }
  };

  const updateHabit = async (id, updatedData) => {
    try {
      const res = await fetch(`/api/habits/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });
      const data = await res.json();

      if (data.success) {
        setHabits(prev => prev.map(h => h._id === id ? data.habit : h));
        toast.success('Habit updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update habit.');
      }
    } catch (e) {
      toast.error('Server error updating habit.');
    }
  };

  const deleteHabit = async (id) => {
    try {
      const res = await fetch(`/api/habits/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setHabits(prev => prev.filter(h => h._id !== id));
        setLogs(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        toast.success('Habit deleted.');
      } else {
        toast.error(data.message || 'Failed to delete habit.');
      }
    } catch (e) {
      toast.error('Server error deleting habit.');
    }
  };

  // 2. Logs Operations
  const toggleHabitLog = async (habitId, dateStr = getFormattedDate()) => {
    try {
      const res = await fetch(`/api/habits/${habitId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: dateStr })
      });
      const data = await res.json();

      if (data.success) {
        setLogs(prev => {
          const currentDates = prev[habitId] || [];
          let updatedDates;
          if (data.completed) {
            updatedDates = [...currentDates, dateStr];
            toast.success('Awesome! Habit completed for today 🎉');
          } else {
            updatedDates = currentDates.filter(d => d !== dateStr);
            toast.success('Habit unmarked.');
          }
          return { ...prev, [habitId]: updatedDates };
        });
        return data.completed;
      } else {
        toast.error(data.message || 'Failed to log completion.');
        return false;
      }
    } catch (e) {
      toast.error('Server error logging completion.');
      return false;
    }
  };

  // 3. Pomodoro Session Operations
  const logStudySession = async (subject, duration, pomodoros) => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subject, duration, pomodoroCount: pomodoros })
      });
      const data = await res.json();

      if (data.success) {
        setStudySessions(prev => [data.session, ...prev]);
        toast.success(`Logged ${duration} min study session!`);
      } else {
        toast.error(data.message || 'Failed to log study session.');
      }
    } catch (e) {
      toast.error('Server error logging session.');
    }
  };

  // 4. Task Planner Operations
  const addTask = async (taskData) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });
      const data = await res.json();

      if (data.success) {
        setTasks(prev => [...prev, data.task]);
        toast.success('Task added successfully!');
      } else {
        toast.error(data.message || 'Failed to create task.');
      }
    } catch (e) {
      toast.error('Server error creating task.');
    }
  };

  const updateTask = async (id, updatedData) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });
      const data = await res.json();

      if (data.success) {
        setTasks(prev => prev.map(t => t._id === id ? data.task : t));
        toast.success('Task updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update task.');
      }
    } catch (e) {
      toast.error('Server error updating task.');
    }
  };

  const deleteTask = async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setTasks(prev => prev.filter(t => t._id !== id));
        toast.success('Task deleted.');
      } else {
        toast.error(data.message || 'Failed to delete task.');
      }
    } catch (e) {
      toast.error('Server error deleting task.');
    }
  };

  const toggleTask = async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setTasks(prev => prev.map(t => t._id === id ? data.task : t));
        toast.success(data.task.completed ? 'Task completed! ⚡' : 'Task marked as active.');
      } else {
        toast.error(data.message || 'Failed to toggle task status.');
      }
    } catch (e) {
      toast.error('Server error toggling task.');
    }
  };

  const resetAllData = async () => {
    try {
      // In professional setting, data reset can be done in DB
      // For instant visual reset: delete all habits, tasks, and sessions!
      const headers = { 'Authorization': `Bearer ${token}` };
      
      habits.forEach(async (h) => {
        await fetch(`/api/habits/${h._id}`, { method: 'DELETE', headers });
      });
      tasks.forEach(async (t) => {
        await fetch(`/api/tasks/${t._id}`, { method: 'DELETE', headers });
      });

      toast.success('Workspaces database cleaned. Refreshing term flow!');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (e) {
      window.location.reload();
    }
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        logs,
        studySessions,
        tasks,
        loadingData,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitLog,
        calculateStreak,
        logStudySession,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        resetAllData,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) throw new Error('useHabits must be used within a HabitProvider');
  return context;
};
