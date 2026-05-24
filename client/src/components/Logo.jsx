import React from 'react';

const Logo = ({ className = '', iconSize = 'h-9 w-9', showText = true, textClass = '' }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Dynamic vector SVG logo mark */}
      <svg 
        className={`${iconSize} transition-transform duration-300`} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Accent Gradient - Soft lighter skyblue and deep professional blue */}
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" /> {/* Sky-600 */}
            <stop offset="50%" stopColor="#38bdf8" /> {/* Sky-400 */}
            <stop offset="100%" stopColor="#7dd3fc" /> {/* Sky-300 */}
          </linearGradient>
          
          {/* Ambient Glow Backdrop Gradient */}
          <linearGradient id="glow-grad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Ambient shadow glow background circle */}
        <circle cx="50" cy="50" r="44" fill="url(#glow-grad)" />

        {/* Stylized outer loop representing complete habit/routine cycles */}
        <path 
          d="M25 50 C25 35, 38 25, 50 25 C65 25, 75 35, 75 50 C75 65, 62 75, 50 75 C35 75, 25 65, 25 50 Z" 
          stroke="url(#logo-grad)" 
          strokeWidth="7" 
          strokeLinecap="round" 
          strokeDasharray="220"
          strokeDashoffset="15"
        />

        {/* Inner dynamic upward chevron vector representing professional growth and streaks */}
        <path 
          d="M38 58 L50 44 L62 58" 
          stroke="url(#logo-grad)" 
          strokeWidth="7" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Sparkle dot representing active flow state */}
        <circle cx="50" cy="35" r="4.5" fill="#38bdf8" />
      </svg>

      {/* Premium brand title */}
      {showText && (
        <div className={`flex flex-col ${textClass}`}>
          <h1 className="font-display font-extrabold text-lg leading-none tracking-tight">
            <span className="bg-gradient-to-r from-sky-500 to-indigo-400 bg-clip-text text-transparent dark:from-sky-400 dark:to-indigo-300">Aura</span>
            <span className="text-slate-800 dark:text-white">Flow</span>
          </h1>
          <span className="text-[8px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-1.5 leading-none">
            WORKSPACE PLANNER
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
