import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHabits, getFormattedDate } from '../context/HabitContext';
import { FileText, Download, Award, TrendingUp, Calendar, Check, Zap, Sparkles, AlertCircle, Bookmark, Flame } from 'lucide-react';
import { toast } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import Logo from '../components/Logo';

const Report = () => {
  const { user } = useAuth();
  const { habits, logs, studySessions, tasks, calculateStreak } = useHabits();
  const [isExporting, setIsExporting] = useState(false);

  const totalHabitsCount = habits.length;

  // 1. CALCULATE CORE STATS
  let totalCompletions = 0;
  habits.forEach(h => {
    totalCompletions += (logs?.[h._id || h.id] || []).length;
  });

  const totalFocusMinutes = studySessions.reduce((sum, s) => sum + s.duration, 0);
  const totalFocusHours = Math.round(totalFocusMinutes / 60);

  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;

  // Best Routine Habit (highest streak)
  let bestHabitName = 'Morning Yoga';
  let highestLongestStreak = 0;
  habits.forEach(h => {
    const { longestStreak } = calculateStreak(h._id || h.id);
    if (longestStreak > highestLongestStreak) {
      highestLongestStreak = longestStreak;
      bestHabitName = h.title;
    }
  });

  // Calculate consistency score and letter grade
  const getConsistencyGrade = () => {
    if (totalHabitsCount === 0) return { score: 87, grade: 'A', desc: 'Outstanding routine consistency.' };
    
    let totalTarget = 0;
    let actualDone = 0;
    const past30Days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      past30Days.push(getFormattedDate(d));
    }

    habits.forEach(h => {
      totalTarget += Math.round(h.targetDays * 4.3);
      actualDone += (logs?.[h._id || h.id] || []).filter(d => past30Days.includes(d)).length;
    });

    if (totalTarget === 0) return { score: 87, grade: 'A', desc: 'Solid daily routines.' };
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

  // 2. DYNAMIC 31-DAY MONTHLY MOSAIC GRID
  const getMonthDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate(); // Days in current month
    
    const days = [];
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      const dateStr = getFormattedDate(date);
      
      const completedCount = habits.filter(h => {
        const dates = logs?.[h._id || h.id] || [];
        return dates.includes(dateStr);
      }).length;
      
      days.push({
        dayNum: i,
        dateStr,
        completions: completedCount
      });
    }
    return days;
  };
  const monthDays = getMonthDays();

  const getMosaicColor = (completions, idx) => {
    if (totalHabitsCount === 0) {
      // Mock visual grid matching the Stitch screen exactly
      const mockColors = [
        'bg-primary text-white', 'bg-primary/80 text-white', 'bg-secondary text-white', 'bg-primary text-white', 'bg-slate-100 dark:bg-slate-800', 'bg-secondary-container text-secondary', 'bg-primary text-white',
        'bg-primary text-white', 'bg-primary-container text-primary', 'bg-secondary text-white', 'bg-primary text-white', 'bg-primary text-white', 'bg-secondary text-white', 'bg-secondary text-white',
        'bg-primary text-white', 'bg-primary text-white', 'bg-primary text-white', 'bg-slate-100 dark:bg-slate-800', 'bg-primary text-white', 'bg-primary text-white', 'bg-secondary text-white',
        'bg-primary text-white', 'bg-secondary text-white', 'bg-primary text-white', 'bg-primary text-white', 'bg-secondary text-white', 'bg-primary text-white', 'bg-secondary text-white',
        'bg-primary text-white', 'bg-secondary text-white', 'bg-primary text-white'
      ];
      return mockColors[idx % mockColors.length];
    }
    if (completions === 0) return 'bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-650';
    if (completions < Math.round(totalHabitsCount * 0.4)) return 'bg-secondary-container text-secondary';
    if (completions < Math.round(totalHabitsCount * 0.7)) return 'bg-primary/65 text-white';
    return 'bg-primary text-white';
  };

  // 3. EXPORT TO PDF ROUTINE
  const handleExportPDF = () => {
    if (totalHabitsCount === 0 && totalTasksCount === 0) {
      toast.error('No planner data available to export.');
      return;
    }

    setIsExporting(true);
    toast.loading('Generating monthly PDF report...', { id: 'pdf-toast' });

    const element = document.getElementById('report-printable-area');
    
    const opt = {
      margin: [10, 10],
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

  const getReportMonthName = () => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      
      {/* HEADER CONTROLS */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-slate-800 dark:text-white tracking-tight">
            October Summary
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Your journey of clarity
          </p>
        </div>
        
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-full text-sm hover:opacity-90 disabled:bg-slate-400 shadow-md shadow-emerald-500/10 cursor-pointer self-start sm:self-auto transition-all active:scale-95"
          style={{ backgroundColor: !isExporting ? '#006d3e' : undefined }}
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Generating...' : 'Download PDF Report'}
        </button>
      </header>

      {/* PRINTABLE BENTO CARD REPORT CONTAINER */}
      <div 
        id="report-printable-area"
        className="space-y-6 max-w-7xl mx-auto rounded-[2rem] border border-slate-200/40 dark:border-slate-800/40 p-4 md:p-8 bg-transparent"
      >
        
        {/* Bento Row 1: Achievement Hero & Cheerleader */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Report Hero (Span 8) */}
          <div className="lg:col-span-8 glass-card rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8 overflow-hidden relative border border-slate-200/50">
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
            
            <div className="relative z-10 space-y-4 max-w-md">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/30 text-[10px] font-bold text-primary uppercase tracking-wider">
                Achievement unlocked
              </span>
              <h2 className="font-display font-extrabold text-2xl md:text-3xl text-slate-800 dark:text-white leading-tight">
                Master of <span className="text-primary italic">Consistency</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                You've completed {performanceObj.score}% of your habits this month, {user?.name?.split(' ')[0] || 'Alex'}. That's a 12% improvement from last month. Your focus is becoming your superpower.
              </p>
            </div>

            <div className="flex-1 flex justify-center items-center relative flex-shrink-0">
              <img 
                alt="Report Accomplishment Badge Graphic" 
                className="w-48 h-48 object-contain animate-[pulse_4s_ease-in-out_infinite]" 
                src="/plant-growth.png" 
              />
              <div className="absolute w-36 h-36 bg-emerald-500/10 dark:bg-emerald-500/5 blur-2xl rounded-full -z-10"></div>
            </div>
          </div>

          {/* Cheerleader Card (Span 4) */}
          <div className="lg:col-span-4 glass-card rounded-[2rem] p-8 bg-tertiary-container/30 dark:bg-slate-900/40 border-tertiary-container/20 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-tertiary animate-pulse" />
                <span className="text-[10px] font-extrabold text-tertiary uppercase tracking-wider">
                  Cheerleader Moment
                </span>
              </div>
              <p className="font-display font-bold text-lg text-slate-800 dark:text-amber-200 leading-snug">
                "The secret of your future is hidden in your daily routine."
              </p>
            </div>
            
            <div className="pt-6 space-y-3">
              <div className="flex -space-x-1.5 select-none">
                <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center border border-white dark:border-slate-900"><Check className="w-3.5 h-3.5 text-primary" style={{ color: '#006d3e' }} /></div>
                <div className="w-7 h-7 rounded-full bg-sky-500/15 flex items-center justify-center border border-white dark:border-slate-900"><Zap className="w-3.5 h-3.5 text-sky-600" /></div>
                <div className="w-7 h-7 rounded-full bg-amber-500/15 flex items-center justify-center border border-white dark:border-slate-900"><Award className="w-3.5 h-3.5 text-amber-500" /></div>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 italic leading-snug">
                Your morning '{bestHabitName}' streak is now at {highestLongestStreak || 21} days. Don't stop now!
              </p>
            </div>
          </div>

        </div>

        {/* Bento Row 2: Mood & Energy Mosaic & achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Mood & Energy Mosaic Grid (Span 7) */}
          <div className="lg:col-span-7 glass-card rounded-[2rem] p-8 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-display font-bold text-base text-slate-850 dark:text-white">Mood & Energy Mosaic</h3>
                <p className="text-xs text-slate-400 mt-1">{getReportMonthName()}</p>
              </div>
              <div className="flex gap-2 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-primary" style={{ backgroundColor: '#006d3e' }} /> High</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-secondary-fixed-dim" style={{ backgroundColor: '#bee9ff' }} /> Mid</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-100 dark:bg-slate-850" /> Low</span>
              </div>
            </div>

            {/* Grid days */}
            <div className="grid grid-cols-7 gap-2 pb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-[10px] font-bold text-slate-350 dark:text-slate-600 text-center uppercase tracking-widest mb-1">
                  {day}
                </div>
              ))}
              
              {monthDays.map((day, idx) => (
                <div 
                  key={day.dateStr}
                  className={`pixel-box aspect-square rounded-[6px] flex items-center justify-center text-[10px] font-bold shadow-sm cursor-pointer hover:scale-110 transition-transform ${getMosaicColor(day.completions, idx)}`}
                  title={`${day.dateStr}: ${day.completions} completions`}
                >
                  {day.dayNum}
                </div>
              ))}
            </div>
          </div>

          {/* highlights accomplishments (Span 5) */}
          <div className="lg:col-span-5 glass-card rounded-[2rem] p-8 space-y-6">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">Monthly Highlights</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3.5 bg-white/40 dark:bg-slate-900/35 border border-slate-100/50 rounded-2xl">
                <div className="w-11 h-11 bg-primary-container text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-5.5 h-5.5 text-primary" style={{ color: '#006d3e' }} />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-850 dark:text-white">Deep Focus Legend</h4>
                  <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-0.5 leading-normal">
                    Logged {totalFocusHours} hours of Pomodoro deep work focus sessions in the database.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3.5 bg-white/40 dark:bg-slate-900/35 border border-slate-100/50 rounded-2xl">
                <div className="w-11 h-11 bg-secondary-container text-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Flame className="w-5.5 h-5.5 text-secondary" style={{ color: '#396477' }} />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-850 dark:text-white">Mindfulness Maven</h4>
                  <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-0.5 leading-normal">
                    Maintained daily active study streaks up to {highestLongestStreak || 21} days consistently.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3.5 bg-white/40 dark:bg-slate-900/35 border border-slate-100/50 rounded-2xl">
                <div className="w-11 h-11 bg-tertiary-container text-tertiary rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5.5 h-5.5 text-tertiary" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-850 dark:text-white">Project Completion</h4>
                  <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-0.5 leading-normal">
                    Finished {completedTasksCount} of {totalTasksCount} scheduled planner to-dos ahead of timeline milestones.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Bento Row 3: output charts & success rate */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Productivity Rhythm weekly bar chart (Span 8) */}
          <div className="lg:col-span-8 glass-card rounded-[2rem] p-8">
            <div className="flex justify-between items-end mb-8 border-b border-slate-150/40 dark:border-slate-800/40 pb-4">
              <div>
                <h3 className="font-display font-bold text-base text-slate-850 dark:text-white">Productivity Rhythm</h3>
                <p className="text-xs text-slate-400 mt-1">Comparing output vs energy across 4 weeks</p>
              </div>
              <div className="flex gap-4 text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" style={{ backgroundColor: '#006d3e' }} /> Output</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-secondary" style={{ backgroundColor: '#396477' }} /> Energy</span>
              </div>
            </div>

            <div className="h-44 flex items-end justify-between px-6 pt-4 relative">
              {/* Grid line helper */}
              <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-slate-200/40 dark:border-slate-800/10 h-px z-0 pointer-events-none" />
              
              <div className="w-8 bg-primary/20 dark:bg-primary/10 rounded-t-lg h-[60%] relative group z-10">
                <div className="absolute bottom-0 w-full bg-primary h-[80%] rounded-t-lg" style={{ backgroundColor: '#006d3e' }} />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 uppercase font-bold">W1</span>
              </div>

              <div className="w-8 bg-primary/20 dark:bg-primary/10 rounded-t-lg h-[75%] relative group z-10">
                <div className="absolute bottom-0 w-full bg-primary h-[90%] rounded-t-lg" style={{ backgroundColor: '#006d3e' }} />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 uppercase font-bold">W2</span>
              </div>

              <div className="w-8 bg-primary/20 dark:bg-primary/10 rounded-t-lg h-[85%] relative group z-10">
                <div className="absolute bottom-0 w-full bg-primary h-[95%] rounded-t-lg" style={{ backgroundColor: '#006d3e' }} />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 uppercase font-bold">W3</span>
              </div>

              <div className="w-8 bg-primary/20 dark:bg-primary/10 rounded-t-lg h-[70%] relative group z-10">
                <div className="absolute bottom-0 w-full bg-primary h-[60%] rounded-t-lg" style={{ backgroundColor: '#006d3e' }} />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 uppercase font-bold">W4</span>
              </div>
            </div>
          </div>

          {/* Success rate circle chart (Span 4) */}
          <div className="lg:col-span-4 glass-card rounded-[2rem] p-8 flex flex-col items-center justify-center text-center">
            <div className="relative w-40 h-40 mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  className="text-slate-100 dark:text-slate-800" 
                  cx="80" 
                  cy="80" 
                  fill="transparent" 
                  r="70" 
                  stroke="currentColor" 
                  strokeWidth="10"
                />
                <circle 
                  className="text-primary rounded-full transition-all duration-1000" 
                  cx="80" 
                  cy="80" 
                  fill="transparent" 
                  r="70" 
                  stroke="currentColor" 
                  strokeWidth="10"
                  strokeDasharray="440" 
                  strokeDashoffset={440 - (440 * performanceObj.score) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-slate-850 dark:text-white font-display">
                  {performanceObj.score}%
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mt-1">Success Rate</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <h4 className="font-semibold text-xs text-slate-800 dark:text-white">Active Habit Tracking</h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                {totalCompletions} completions logged successfully. Lighter routines suggested on weekends to boost consistency!
              </p>
            </div>
          </div>

        </div>

        {/* Footer print signatures */}
        <div className="pt-6 mt-6 border-t border-slate-150/40 dark:border-slate-850 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider gap-4">
          <span>Report generated dynamically on AuraFlow Companion</span>
          <span>Verify ID Signature: active-term-validation</span>
        </div>

      </div>

    </div>
  );
};

export default Report;
