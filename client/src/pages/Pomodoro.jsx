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
  Zap,
  Volume2,
  TreePine,
  Keyboard,
  Waves,
  PlayCircle,
  PauseCircle,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  HelpCircle,
  Disc,
  Disc3
} from 'lucide-react';

const MODES = {
  FOCUS: { label: 'Time to Focus', time: 25 * 60, icon: BookOpen, color: 'primary' },
  SHORT: { label: 'Short Break', time: 5 * 60, icon: Coffee, color: 'secondary' },
  LONG: { label: 'Long Break', time: 15 * 60, icon: Sparkles, color: 'tertiary' },
};

const Pomodoro = () => {
  const { habits, logStudySession, studySessions } = useHabits();
  
  const [mode, setMode] = useState('FOCUS');
  const [timeLeft, setTimeLeft] = useState(MODES.FOCUS.time);
  const [isActive, setIsActive] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('General Study');

  // Focus Music states
  const [playingTrack, setPlayingTrack] = useState(null); // null | rainforest | keys | sea

  // Deep work switches
  const [autoDnd, setAutoDnd] = useState(true);
  const [blocker, setBlocker] = useState(true);
  const [strictMode, setStrictMode] = useState(false);

  const timerRef = useRef(null);

  // Play synthetic chime sound using HTML5 Web Audio API
  const playSynthesizedChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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

      // F-Major chord chime!
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
            clearInterval(timerRef.current);
            setIsActive(false);
            playSynthesizedChime();

            if (mode === 'FOCUS') {
              const durationMins = Math.round(MODES[mode].time / 60);
              logStudySession(selectedSubject, durationMins, 1);
            }
            
            // Switch mode automatically
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

  const handleModeChange = (newMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].time);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].time);
  };

  const skipTimer = () => {
    // Skip to last 3 seconds for quick testing/logging
    setIsActive(true);
    setTimeLeft(3);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Toggle ambient music tracks
  const handleMusicPlay = (track) => {
    if (playingTrack === track) {
      setPlayingTrack(null);
    } else {
      setPlayingTrack(track);
      // Play a quick soft water synth sweep for feedback
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(track === 'rainforest' ? 180 : track === 'keys' ? 220 : 150, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } catch (e) {}
    }
  };

  const getDndSwitchIcon = (val) => {
    return val ? (
      <ToggleRight className="w-9 h-9 text-primary cursor-pointer transition-all" style={{ color: '#006d3e' }} />
    ) : (
      <ToggleLeft className="w-9 h-9 text-slate-350 cursor-pointer transition-all" />
    );
  };

  // Today's focus sessions count
  const todayStr = new Date().toISOString().split('T')[0];
  const loggedSessionsToday = studySessions.filter(s => s.date.split('T')[0] === todayStr);

  return (
    <div className="space-y-10 pb-16 font-sans">
      
      {/* HEADER */}
      <header className="flex justify-between items-center w-full">
        <div className="flex items-center gap-4">
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-slate-800 dark:text-white tracking-tight">
            Focus Space
          </h2>
          <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[11px] font-bold tracking-wide uppercase">
            Deep Work Active
          </span>
        </div>
        
        {/* Toggle Mode Ribbon in Header */}
        <div className="flex gap-1.5 p-1 bg-white/50 dark:bg-slate-900/60 border border-slate-200/50 rounded-2xl">
          {Object.keys(MODES).map((mKey) => {
            const m = MODES[mKey];
            return (
              <button
                key={mKey}
                onClick={() => handleModeChange(mKey)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200
                  ${mode === mKey 
                    ? 'bg-primary text-white shadow-sm font-bold scale-102' 
                    : 'text-slate-400 hover:text-slate-650'}`}
                style={{ backgroundColor: mode === mKey ? '#006d3e' : undefined }}
              >
                {m.label.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </header>

      {/* CORE COLUMNS */}
      <div className="grid grid-cols-12 gap-6">

        {/* Central Timer Bento Card (Span 8) */}
        <section className="col-span-12 lg:col-span-8 glass-panel rounded-[2rem] p-8 md:p-12 flex flex-col items-center justify-center min-h-[520px] relative overflow-hidden group shadow-sm border border-slate-200/40">
          
          {/* Ambient Breathing Background Glow */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className={`timer-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full blur-[80px] opacity-15 transition-colors duration-700
              ${mode === 'FOCUS' ? 'bg-primary' : mode === 'SHORT' ? 'bg-secondary' : 'bg-tertiary'}`}
              style={{
                backgroundColor: mode === 'FOCUS' ? '#006d3e' : undefined,
                animation: isActive ? 'pulse-breathe 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            
            {/* Core Sprout/Timer Icon */}
            <div className="mb-6 w-28 h-28 hover:scale-105 transition-transform cursor-pointer active:scale-95 flex-shrink-0">
              <img 
                alt="3D Pomodoro Timer Sprout Icon" 
                className="w-full h-full object-contain" 
                src="/3d-icons-sheet.png" 
                style={{ clipPath: 'inset(33% 33% 0 33%)' }}
              />
            </div>

            {/* Timer Display */}
            <div className="text-center mb-8">
              <h3 className="font-display font-extrabold text-7xl md:text-8xl leading-none text-primary font-bold tracking-tighter tabular-nums drop-shadow-sm"
                style={{ color: '#006d3e' }}
              >
                {formatTime(timeLeft)}
              </h3>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-4 tracking-[0.2em] uppercase">
                {MODES[mode].label}
              </p>
            </div>

            {/* Quick Habit Select connection */}
            {mode === 'FOCUS' && (
              <div className="mb-8 w-full max-w-sm flex items-center gap-3 px-4 py-2.5 bg-white/40 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm">
                <BookOpen className="w-4.5 h-4.5 text-primary flex-shrink-0" style={{ color: '#006d3e' }} />
                <div className="flex-1 min-w-0">
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Subject routine linkage:</span>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold outline-none py-0.5 border-none cursor-pointer dark:text-white"
                  >
                    <option value="General Study" className="dark:bg-slate-900">General Study</option>
                    {habits.map(h => (
                      <option key={h._id || h.id} value={h.title} className="dark:bg-slate-900">{h.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Controls Bar */}
            <div className="flex items-center gap-4">
              <button 
                onClick={resetTimer}
                className="w-14 h-14 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 transition-all cursor-pointer shadow-sm"
                title="Reset Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button 
                onClick={toggleTimer}
                className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                style={{ backgroundColor: '#006d3e' }}
              >
                {isActive ? <Pause className="w-8 h-8 fill-white" /> : <Play className="w-8 h-8 fill-white translate-x-0.5" />}
              </button>
              <button 
                onClick={skipTimer}
                className="w-14 h-14 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-primary hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all cursor-pointer shadow-sm"
                style={{ color: '#006d3e' }}
                title="Skip to End"
              >
                <Zap className="w-5 h-5 fill-current" />
              </button>
            </div>

          </div>
        </section>

        {/* Focus Music and Deep Work Settings Sidebar (Span 4) */}
        <section className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          {/* Focus Music Card */}
          <div className="glass-panel rounded-[2rem] p-6 flex flex-col gap-4 border border-slate-200/40">
            <div className="flex justify-between items-center">
              <h4 className="font-display font-bold text-base text-slate-850 dark:text-white">Focus Music</h4>
              <Disc3 className={`w-5 h-5 text-primary ${playingTrack ? 'animate-spin' : ''}`} style={{ color: '#006d3e' }} />
            </div>
            
            <div className="flex flex-col gap-3">
              {/* Rainforest track */}
              <div 
                onClick={() => handleMusicPlay('rainforest')}
                className={`flex items-center justify-between p-3.5 border rounded-2xl cursor-pointer transition-all
                  ${playingTrack === 'rainforest' 
                    ? 'bg-primary-container border-primary/20 text-primary shadow-sm' 
                    : 'bg-white/40 dark:bg-slate-900/30 border-slate-100 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3">
                  <TreePine className="w-5 h-5 flex-shrink-0 text-primary" style={{ color: '#006d3e' }} />
                  <div>
                    <p className="text-xs font-semibold">Rainforest Ambience</p>
                    <p className="text-[9px] text-slate-400">Lush green white noise</p>
                  </div>
                </div>
                {playingTrack === 'rainforest' ? <PauseCircle className="w-5 h-5 text-primary" style={{ color: '#006d3e' }} /> : <PlayCircle className="w-5 h-5 text-slate-400" />}
              </div>

              {/* Keys track */}
              <div 
                onClick={() => handleMusicPlay('keys')}
                className={`flex items-center justify-between p-3.5 border rounded-2xl cursor-pointer transition-all
                  ${playingTrack === 'keys' 
                    ? 'bg-primary-container border-primary/20 text-primary shadow-sm' 
                    : 'bg-white/40 dark:bg-slate-900/30 border-slate-100 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3">
                  <Keyboard className="w-5 h-5 flex-shrink-0 text-primary" style={{ color: '#006d3e' }} />
                  <div>
                    <p className="text-xs font-semibold">Soft Mechanical Keys</p>
                    <p className="text-[9px] text-slate-400">Coffee shop vibes</p>
                  </div>
                </div>
                {playingTrack === 'keys' ? <PauseCircle className="w-5 h-5 text-primary" style={{ color: '#006d3e' }} /> : <PlayCircle className="w-5 h-5 text-slate-400" />}
              </div>

              {/* Ocean track */}
              <div 
                onClick={() => handleMusicPlay('sea')}
                className={`flex items-center justify-between p-3.5 border rounded-2xl cursor-pointer transition-all
                  ${playingTrack === 'sea' 
                    ? 'bg-primary-container border-primary/20 text-primary shadow-sm' 
                    : 'bg-white/40 dark:bg-slate-900/30 border-slate-100 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3">
                  <Waves className="w-5 h-5 flex-shrink-0 text-primary" style={{ color: '#006d3e' }} />
                  <div>
                    <p className="text-xs font-semibold">Deep Sea Frequencies</p>
                    <p className="text-[9px] text-slate-400">Binaural beats 40Hz</p>
                  </div>
                </div>
                {playingTrack === 'sea' ? <PauseCircle className="w-5 h-5 text-primary" style={{ color: '#006d3e' }} /> : <PlayCircle className="w-5 h-5 text-slate-400" />}
              </div>

            </div>
          </div>

          {/* Deep work toggles */}
          <div className="glass-panel rounded-[2rem] p-6 flex flex-col gap-4 border border-slate-200/40">
            <h4 className="font-display font-bold text-base text-slate-850 dark:text-white">Deep Work Mode</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-350">Auto-DND Mode</span>
                <div onClick={() => setAutoDnd(!autoDnd)} className="cursor-pointer">
                  {getDndSwitchIcon(autoDnd)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-350">Website Blocker</span>
                <div onClick={() => setBlocker(!blocker)} className="cursor-pointer">
                  {getDndSwitchIcon(blocker)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-350">Strict Mode</span>
                <div onClick={() => setStrictMode(!strictMode)} className="cursor-pointer">
                  {getDndSwitchIcon(strictMode)}
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* 12. Bottom Timeline focus log (Span 12) */}
        <section className="col-span-12 glass-panel rounded-[2rem] p-8 border border-slate-200/40 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h4 className="font-display font-bold text-base text-slate-800 dark:text-white">Daily Focus Journey</h4>
              <p className="text-xs text-slate-400 mt-1">
                {loggedSessionsToday.length} sessions completed today
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" style={{ backgroundColor: '#006d3e' }} /> Focus</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-secondary" style={{ backgroundColor: '#396477' }} /> Break</span>
            </div>
          </div>

          {/* Timeline scroller */}
          <div className="flex items-center gap-4 h-24 overflow-x-auto pb-4 scrollbar-hide py-1">
            {loggedSessionsToday.length === 0 ? (
              <div className="w-full flex items-center justify-center text-xs text-slate-450 italic">
                No focus cycles logged yet today. Complete a session to populate!
              </div>
            ) : (
              loggedSessionsToday.map((session, idx) => (
                <React.Fragment key={session._id || session.id}>
                  {/* Focus Cycle Box */}
                  <div className="flex-shrink-0 w-28 h-full bg-primary/10 border border-primary/20 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                    <span className="text-[9px] text-primary font-bold uppercase tracking-wider" style={{ color: '#006d3e' }}>
                      {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <CheckCircle className="w-4 h-4 text-primary my-1" style={{ color: '#006d3e' }} />
                    <span className="text-[10px] text-primary font-bold truncate max-w-[80px]" style={{ color: '#006d3e' }}>
                      {session.subject}
                    </span>
                  </div>

                  {/* Rest Break box */}
                  <div className="flex-shrink-0 w-12 h-full bg-secondary/10 border border-secondary/20 rounded-xl flex items-center justify-center">
                    <Coffee className="w-4.5 h-4.5 text-secondary animate-pulse" style={{ color: '#396477' }} />
                  </div>
                </React.Fragment>
              ))
            )}
            
            {/* Active cycle box */}
            {isActive && (
              <div className="flex-shrink-0 w-32 h-full bg-primary border-4 border-white/80 dark:border-slate-800/80 rounded-2xl flex flex-col items-center justify-center shadow-lg animate-pulse"
                style={{ backgroundColor: '#006d3e' }}
              >
                <span className="text-[9px] text-white font-bold tracking-widest uppercase">NOW</span>
                <Disc className="w-4 h-4 text-white animate-spin my-1" />
                <span className="text-[10px] text-white font-bold">Focus Active</span>
              </div>
            )}
          </div>
        </section>

      </div>

      <style>{`
        @keyframes pulse-breathe {
          0%, 100% { transform: scale(1) translate(-50%, -50%); opacity: 0.15; }
          50% { transform: scale(1.08) translate(-50%, -50%); opacity: 0.28; }
        }
      `}</style>

    </div>
  );
};

export default Pomodoro;
