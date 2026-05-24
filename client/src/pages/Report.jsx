import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHabits, HABIT_CATEGORIES } from '../context/HabitContext';
import { FileText, Download, Award, TrendingUp, Calendar, ListTodo } from 'lucide-react';
import { toast } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import Logo from '../components/Logo';

const Report = () => {
  const { user } = useAuth();
  const { habits, logs, studySessions, tasks, calculateStreak } = useHabits();
  const [isExporting, setIsExporting] = useState(false);

  const totalHabitsCount = habits.length;

  // Total absolute completions logged
  let totalCompletions = 0;
  habits.forEach(h => {
    totalCompletions += (logs[h.id] || []).length;
  });

  // Total study minutes logged
  const totalMinutesStudied = studySessions.reduce((sum, s) => sum + s.duration, 0);
  const totalSessionsCount = studySessions.length;

  // Task Planner analytics
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const taskCompliancePct = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0;

  // Best Routine Habit (highest longest streak)
  let bestHabitTitle = 'None';
  let highestLongestStreak = 0;
  habits.forEach(h => {
    const { longestStreak } = calculateStreak(h.id);
    if (longestStreak > highestLongestStreak) {
      highestLongestStreak = longestStreak;
      bestHabitTitle = h.title;
    }
  });

  // Calculate consistency score and letter grade
  const getConsistencyGrade = () => {
    if (totalHabitsCount === 0) return { score: 0, grade: 'N/A', desc: 'No active routines.' };
    
    let totalTarget = 0;
    let actualDone = 0;
    const past30Days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      past30Days.push(d.toISOString().split('T')[0]);
    }

    habits.forEach(h => {
      totalTarget += Math.round(h.targetDays * 4.3);
      actualDone += (logs[h.id] || []).filter(d => past30Days.includes(d)).length;
    });

    if (totalTarget === 0) return { score: 0, grade: 'F', desc: 'Routines inactive.' };
    const score = Math.min(Math.round((actualDone / totalTarget) * 100), 100);

    let grade = 'F';
    let desc = 'Needs routine tuning';
    if (score >= 90) {
      grade = 'A+';
      desc = 'Exceptional alignment! Outstanding routine consistency.';
    } else if (score >= 80) {
      grade = 'A';
      desc = 'Honors efficiency. Solid routine adherence.';
    } else if (score >= 70) {
      grade = 'B';
      desc = 'Consistent flow. Balanced daily routines.';
    } else if (score >= 50) {
      grade = 'C';
      desc = 'Variable outcomes. Routines require refinement.';
    }

    return { score, grade, desc };
  };

  const performanceObj = getConsistencyGrade();

  // Export HTML Panel to PDF using html2pdf.js!
  const handleExportPDF = () => {
    if (totalHabitsCount === 0 && totalTasksCount === 0) {
      toast.error('No planner data available to export.');
      return;
    }

    setIsExporting(true);
    toast.loading('Generating monthly PDF report...', { id: 'pdf-toast' });

    const element = document.getElementById('report-printable-area');
    
    const opt = {
      margin: [15, 15],
      filename: `auraflow_${user?.name?.toLowerCase().replace(/\s+/g, '_')}_report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => {
        setIsExporting(false);
        toast.success('PDF report exported successfully! 📂', { id: 'pdf-toast' });
      })
      .catch((err) => {
        setIsExporting(false);
        toast.error('Failed to export PDF.', { id: 'pdf-toast' });
        console.error(err);
      });
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER CONTROL BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight">Performance Reports</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500">Review monthly summaries and export clean PDF report cards.</p>
        </div>
        
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-400 text-white font-bold rounded-2xl text-sm transition-all shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export to PDF'}
        </button>
      </div>

      {/* REPORT PRINTABLE SHEET CONTAINER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 md:p-10 shadow-lg relative overflow-hidden" id="report-printable-area">
        
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-500 via-indigo-600 to-sky-400" />
        
        {/* A4 REPORT WRAPPER */}
        <div className="space-y-8 text-slate-800 dark:text-slate-100">
          
          {/* Header block */}
          <div className="flex items-start justify-between gap-6 flex-wrap pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
            <div>
              <div className="flex items-center gap-2">
                <Logo showText={false} iconSize="h-7 w-7" />
                <span className="font-display font-bold tracking-wide text-lg text-slate-900 dark:text-white">AuraFlow</span>
              </div>
              <h1 className="font-display font-extrabold text-2xl tracking-tight mt-3 text-slate-900 dark:text-white">
                Monthly Productivity Ledger
              </h1>
              <p className="text-xs font-semibold text-indigo-500 mt-1 uppercase tracking-wider">Evaluation Cycle: Rolling 30 Days</p>
            </div>
            
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/20 text-xs font-semibold">
                <Calendar className="w-3.5 h-3.5 text-brand-500" />
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-medium">Username: {user?.name}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Session ID: {user?.id}</p>
            </div>
          </div>

          {/* Upper Metrics Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Grade card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-brand-600/5 border border-brand-500/10 flex flex-col justify-between h-[150px]">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 font-sans">Routine Consistency</span>
                <span className="font-display font-black text-4xl text-brand-500 mt-2 block">{performanceObj.score}%</span>
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-500" />
                  Routine Grade: {performanceObj.grade}
                </span>
              </div>
            </div>

            {/* Task Compliance score card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-brand-600/5 border border-emerald-500/10 flex flex-col justify-between h-[150px]">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 font-sans">Task Planner Compliance</span>
                <span className="font-display font-black text-4xl text-emerald-500 mt-2 block">{taskCompliancePct}%</span>
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                  <ListTodo className="w-3.5 h-3.5 text-emerald-500" />
                  Completed {completedTasksCount} of {totalTasksCount} tasks
                </span>
              </div>
            </div>

            {/* Evaluation summaries */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 flex flex-col justify-between h-[150px]">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Evaluation Statement</span>
                <span className="font-display font-extrabold text-sm text-slate-900 dark:text-white mt-2 block flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  {performanceObj.desc}
                </span>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed font-medium">
                  Compliance factors daily routine logging alongside individual priority task completions over this active monthly cycle.
                </p>
              </div>
            </div>

          </div>

          {/* Cumulative Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-slate-200/40 dark:border-slate-800/40">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-xl">
              <span className="block text-[9px] uppercase font-bold text-slate-400">Routine Check-offs</span>
              <span className="font-display font-extrabold text-lg text-indigo-500 block mt-1">{totalCompletions} logged</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-xl">
              <span className="block text-[9px] uppercase font-bold text-slate-400">Pomodoros Logged</span>
              <span className="font-display font-extrabold text-lg text-emerald-500 block mt-1">{totalSessionsCount} cycles</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-xl">
              <span className="block text-[9px] uppercase font-bold text-slate-400">Minutes Studied</span>
              <span className="font-display font-extrabold text-lg text-rose-500 block mt-1">{totalMinutesStudied} mins</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-xl">
              <span className="block text-[9px] uppercase font-bold text-slate-400">Best Routine Streak</span>
              <span className="font-display font-extrabold text-lg text-amber-500 block mt-1 truncate" title={bestHabitTitle}>
                {bestHabitTitle === 'None' ? 'N/A' : `${highestLongestStreak} days`}
              </span>
            </div>
          </div>

          {/* Category-wise Breakdown Table */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-sm tracking-tight text-slate-900 dark:text-white">Aesthetic Categories Balance</h3>
            
            <div className="overflow-x-auto border border-slate-200/40 dark:border-slate-800/40 rounded-2xl bg-white dark:bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Tracked Routines</th>
                    <th className="px-4 py-3 text-right">Completions logged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/30 font-medium">
                  {HABIT_CATEGORIES.map(cat => {
                    const trackedInCat = habits.filter(h => h.category === cat.name);
                    const count = trackedInCat.length;
                    
                    let completionsInCat = 0;
                    trackedInCat.forEach(h => {
                      completionsInCat += (logs[h.id] || []).length;
                    });

                    return (
                      <tr key={cat.name}>
                        <td className="px-4 py-3.5 flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${cat.color}`} />
                          <span className="font-semibold">{cat.name}</span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 dark:text-slate-500">{count} active routine{count !== 1 ? 's' : ''}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-brand-500">{completionsInCat} logged</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance analysis signature */}
          <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider gap-4">
            <span>Report generated in-browser on AuraFlow</span>
            <span>Verify Signature: active-term-validation</span>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Report;
