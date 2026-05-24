import React, { useState } from 'react';
import { useAuth, PRESET_AVATARS } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, ShieldAlert, Sparkles, Check, Moon, Sun } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || 'grad-cap');
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return;
    updateProfile(name, email, avatar);
  };

  // Hard Reset App Data
  const handleHardReset = () => {
    localStorage.removeItem('habitflow_habits');
    localStorage.removeItem('habitflow_logs');
    localStorage.removeItem('habitflow_sessions');
    localStorage.removeItem('habitflow_user');
    window.location.reload();
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 font-sans">
      
      {/* LEFT 1 COL: AVATAR PICKER */}
      <div className="glass-card rounded-3xl p-6 flex flex-col items-center">
        <h3 className="font-display font-bold text-base mb-6 self-start">Select Student Avatar</h3>
        
        {/* Selected avatar visual card */}
        <div className="h-28 w-28 rounded-full bg-slate-100 dark:bg-slate-800 p-4 border border-brand-500/20 shadow-lg relative flex items-center justify-center mb-8">
          <div 
            dangerouslySetInnerHTML={{ __html: PRESET_AVATARS.find(a => a.id === avatar)?.svg || PRESET_AVATARS[0].svg }} 
            className="w-full h-full"
          />
          <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-brand-500 text-white flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md">
            <Check className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Picker Grid */}
        <div className="grid grid-cols-4 gap-3 w-full">
          {PRESET_AVATARS.map((av) => {
            const isSel = avatar === av.id;
            return (
              <button
                key={av.id}
                onClick={() => setAvatar(av.id)}
                className={`
                  h-12 w-full p-2.5 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-300
                  ${isSel 
                    ? 'bg-brand-500/10 border-brand-500 scale-95 shadow-inner' 
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200/50 dark:border-slate-800/50 hover:border-brand-500/40 hover:scale-102'
                  }
                `}
                title={av.label}
              >
                <div dangerouslySetInnerHTML={{ __html: av.svg }} className="w-full h-full" />
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-semibold uppercase tracking-wider mt-6">
          Choose a role that represents you!
        </p>
      </div>

      {/* RIGHT 2 COLS: EDIT INFORMATION */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Profile configuration Form */}
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <h3 className="font-display font-bold text-base mb-6">Profile Settings</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Display Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:ring focus:ring-brand-500/10 rounded-xl text-sm outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-brand-500 focus:ring focus:ring-brand-500/10 rounded-xl text-sm outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/30 dark:border-slate-800/30 flex justify-end">
              <button
                type="submit"
                className="px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl text-xs transition-all shadow-md cursor-pointer"
              >
                Save Profile Updates
              </button>
            </div>

          </form>
        </div>

        {/* Theme Settings and system resets */}
        <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6">
          
          {/* Quick theme trigger toggle */}
          <div>
            <h3 className="font-display font-bold text-base mb-2">Interface Theme</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Toggle between Light and Dark visual aesthetics for optimal studying conditions.</p>
            
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 px-5 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl text-xs font-bold transition-all cursor-pointer"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Switch to Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-brand-500" />
                  <span>Switch to Dark Theme</span>
                </>
              )}
            </button>
          </div>

          {/* Hard Reset Alert Container */}
          <div className="pt-6 border-t border-slate-200/30 dark:border-slate-800/30">
            <h3 className="font-display font-bold text-base text-red-500 mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Developer & Reset Controls
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
              Hard-resetting deletes all customized habits, streaks, weekly progress records, and logs. Your dashboard will return to standard seed mock layouts.
            </p>

            {resetConfirm ? (
              <div className="flex gap-3 animate-fade-in">
                <button
                  onClick={handleHardReset}
                  className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
                >
                  Yes, Delete All Data
                </button>
                <button
                  onClick={() => setResetConfirm(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setResetConfirm(true)}
                className="px-4 py-2.5 bg-red-500/5 hover:bg-red-500/10 text-red-500 border border-red-500/10 rounded-xl text-xs font-semibold cursor-pointer transition-all"
              >
                Reset Application Data
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;
