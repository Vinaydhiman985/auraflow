import React, { useState, useEffect, useRef } from 'react';
import { useHabits } from '../context/HabitContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  BookOpen, 
  Coffee, 
  Sparkles,
  Zap
} from 'lucide-react';

const MODES = {
  FOCUS: { label: 'Focus Session', time: 25 * 60, icon: BookOpen, color: 'brand' },
  SHORT: { label: 'Short Break', time: 5 * 60, icon: Coffee, color: 'emerald' },
  LONG: { label: 'Long Break', time: 15 * 60, icon: Sparkles, color: 'sky' },
};

const Pomodoro = () => {
  const { habits, logStudySession, studySessions } = useHabits();
  
  const [mode, setMode] = useState('FOCUS');
  const [timeLeft, setTimeLeft] = useState(MODES.FOCUS.time);
  const [isActive, setIsActive] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('General Study');

  const timerRef = useRef(null);

  // Play synthetic chime sound using HTML5 Web Audio API (completely assets-free, pure magic!)
  const playSynthesizedChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Simple sweet dual-tone chime
      const playTone = (freq, start, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        
        osc.start(start);
        osc.stop(start + duration);
      };

      // F-Major chord ding!
      playTone(349.23, audioCtx.currentTime, 0.4); // F4
      playTone(440.00, audioCtx.currentTime + 0.15, 0.6); // A4
      playTone(523.25, audioCtx.currentTime + 0.3, 0.8); // C5
    } catch (e) {
      console.warn("Web Audio API is blocked or unsupported.", e);
    }
  };

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer expired!
            clearInterval(timerRef.current);
            setIsActive(false);
            playSynthesizedChime();

            if (mode === 'FOCUS') {
              // Log focus study session to context
              const durationMins = Math.round(MODES[mode].time / 60);
              logStudySession(selectedSubject, durationMins, 1);
            }
            
            // Switch mode automatically to help flow
            if (mode === 'FOCUS') {
              setMode('SHORT');
              return MODES.SHORT.time;
            } else {
              setMode('FOCUS');
              return MODES.FOCUS.time;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, mode, selectedSubject]);

  // Mode switcher
  const handleModeChange = (newMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].time);
  };

  // Toggle play/pause
  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  // Reset timer
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].time);
  };

  // Format MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calculate SVG Circle values
  const totalTime = MODES[mode].time;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const strokeDasharray = 2 * Math.PI * 90; // r=90
  const strokeDashoffset = strokeDasharray - (progress / 100) * strokeDasharray;

  // Active color helpers
  const activeColorTheme = MODES[mode].color;
  const currentModeInfo = MODES[mode];
  const ModeIcon = currentModeInfo.icon;

  // Render stats
  const totalMinutesStudiedToday = studySessions
    .filter(s => s.date.split('T')[0] === new Date().toISOString().split('T')[0])
    .reduce((sum, s) => sum + s.duration, 0);

  const completedCyclesToday = studySessions
    .filter(s => s.date.split('T')[0] === new Date().toISOString().split('T')[0])
    .reduce((sum, s) => sum + s.pomodoroCount, 0);

  return (
    <div className="grid lg:grid-cols-3 gap-6 font-sans">
      
      {/* LEFT 2 COLS: THE CLOCK */}
      <div className="lg:col-span-2 glass-card rounded-3xl p-6 md:p-10 flex flex-col items-center justify-between min-h-[500px]">
        
        {/* Toggle Ribbon Buttons */}
        <div className="flex gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl w-full max-w-sm">
          {Object.keys(MODES).map((mKey) => {
            const m = MODES[mKey];
            const isSel = mode === mKey;
            const MIcon = m.icon;
            return (
              <button
                key={mKey}
                onClick={() => handleModeChange(mKey)}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200
                  ${isSel 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold scale-102 border border-slate-200/10' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                  }
                `}
              >
                <MIcon className="w-3.5 h-3.5" />
                <span>{m.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Circular Display Dial */}
        <div className="relative my-8 flex items-center justify-center">
          
          <svg className="w-64 h-64 md:w-72 md:h-72">
            {/* Outer track */}
            <circle
              cx="50%"
              cy="50%"
              r="90"
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Colored dial progress */}
            <circle
              cx="50%"
              cy="50%"
              r="90"
              className={`pomodoro-ring transition-all duration-300 ${
                mode === 'FOCUS' ? 'stroke-brand-500' : mode === 'SHORT' ? 'stroke-emerald-500' : 'stroke-sky-500'
              }`}
              strokeWidth="8"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Time text centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-display font-extrabold text-5xl tracking-tight leading-none">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-2.5">
              {MODES[mode].label}
            </span>
          </div>

        </div>

        {/* Controls Block */}
        <div className="flex flex-col items-center gap-6 w-full max-w-md">
          
          {/* Quick Subject Select for Focus mode */}
          {mode === 'FOCUS' && (
            <div className="w-full flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
              <BookOpen className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <div className="flex-1">
                <span className="block text-[9px] uppercase font-bold text-slate-400">Link study session to:</span>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold outline-none py-0.5 border-none cursor-pointer"
                >
                  <option value="General Study" className="dark:bg-slate-900">General Study</option>
                  {habits.map(h => (
                    <option key={h.id} value={h.title} className="dark:bg-slate-900">{h.title} ({h.category})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Play/Pause Buttons */}
          <div className="flex items-center gap-4">
            
            {/* Reset */}
            <button
              onClick={resetTimer}
              className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 transition-colors shadow-sm cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={toggleTimer}
              className={`
                h-14 w-32 flex items-center justify-center gap-2 rounded-2xl font-bold text-sm text-white transition-all shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 cursor-pointer
                ${isActive 
                  ? 'bg-amber-500 hover:bg-amber-600' 
                  : mode === 'FOCUS' 
                    ? 'bg-brand-500 hover:bg-brand-600' 
                    : mode === 'SHORT' 
                      ? 'bg-emerald-500 hover:bg-emerald-600' 
                      : 'bg-sky-500 hover:bg-sky-600'
                }
              `}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start
                </>
              )}
            </button>

            {/* Simulated Speed Button (For Quick Review/Testing!) */}
            <button
              onClick={() => setTimeLeft(3)}
              className="p-3.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 transition-colors shadow-sm cursor-pointer"
              title="Skip to End (3s left)"
            >
              <Zap className="w-5 h-5" />
            </button>

          </div>

        </div>

      </div>

      {/* RIGHT 1 COL: HISTORIC ENTRIES */}
      <div className="space-y-6">
        
        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl p-4 text-center">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Cycles Completed</span>
            <span className="font-display font-extrabold text-2xl text-brand-500 mt-2 block">{completedCyclesToday}</span>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Focus Minutes</span>
            <span className="font-display font-extrabold text-2xl text-emerald-500 mt-2 block">{totalMinutesStudiedToday}m</span>
          </div>
        </div>

        {/* History Ledger List */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <h3 className="font-display font-bold text-sm">Study Sessions Log</h3>
          
          {studySessions.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="text-xs">No sessions logged today.</p>
              <p className="text-[10px] text-slate-500 mt-1">Complete a Pomodoro to automatically record here!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {studySessions.map((session) => (
                <div 
                  key={session.id} 
                  className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs truncate leading-tight">{session.subject}</h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block mt-1">
                      {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 text-[10px] font-bold">
                      {session.duration} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Pomodoro;
