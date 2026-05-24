import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, PRESET_AVATARS } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';
import { 
  Home, 
  CheckSquare, 
  ListTodo, // Representing the Task Planner!
  BarChart2, 
  Timer, 
  User, 
  FileText, 
  LogOut, 
  Sun, 
  Moon,
  Menu,
  X
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Find user's active avatar SVG
  const userAvatarObj = PRESET_AVATARS.find(a => a.id === user?.avatar) || PRESET_AVATARS[0];

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'My Habits', path: '/habits', icon: CheckSquare },
    { name: 'Task Planner', path: '/tasks', icon: ListTodo }, // Added!
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Pomodoro', path: '/pomodoro', icon: Timer },
    { name: 'Monthly Report', path: '/report', icon: FileText },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 font-sans">
      
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border-r border-slate-200/50 dark:border-slate-800/50 p-6 flex-shrink-0 z-30 transition-all duration-300">
        
        {/* Brand Logo */}
        <div className="mb-8 cursor-pointer group" onClick={() => navigate('/dashboard')}>
          <Logo />
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group
                  ${isActive 
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                    : 'text-slate-600 hover:text-brand-500 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:text-brand-400 dark:hover:bg-slate-900/40'
                  }
                `}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-3">
          <div className="flex items-center gap-3 cursor-pointer p-1 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-900/50" onClick={() => navigate('/profile')}>
            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 p-2 shadow-inner border border-slate-200/20">
              <div dangerouslySetInnerHTML={{ __html: userAvatarObj.svg }} className="w-full h-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-tight">{user?.name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate leading-none mt-1">{user?.email}</p>
            </div>
          </div>

          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl font-medium text-sm text-red-500 hover:bg-red-500/5 dark:hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* 2. TOP BANNER HEADER */}
        <header className="flex h-16 w-full items-center justify-between px-6 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md border-b border-slate-200/30 dark:border-slate-800/30 z-20">
          
          {/* Welcome Greeting */}
          <div>
            <h2 className="text-sm md:text-base font-semibold leading-tight">
              {location.pathname === '/dashboard' ? `Hey, ${user?.name?.split(' ')[0]}! 👋` : navigation.find(n => n.path === location.pathname)?.name || 'AuraFlow'}
            </h2>
            <p className="hidden md:block text-[11px] text-slate-400 dark:text-slate-500">
              {location.pathname === '/dashboard' ? 'Ready to win today\'s streaks?' : 'Your study tracker companion'}
            </p>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-3">
            
            {/* Dark Mode Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shadow-sm cursor-pointer"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            {/* Mobile-only Avatar Link */}
            <div 
              className="md:hidden h-8 w-8 rounded-full bg-white dark:bg-slate-900 p-1.5 border border-slate-200/50 dark:border-slate-800/50 cursor-pointer"
              onClick={() => navigate('/profile')}
            >
              <div dangerouslySetInnerHTML={{ __html: userAvatarObj.svg }} className="w-full h-full" />
            </div>

            {/* Mobile-only Logout */}
            <button
              onClick={logout}
              className="md:hidden flex items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 hover:bg-red-500/5 text-red-500 shadow-sm cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 3. CONTENT AREA */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-24 md:pb-8 bg-slate-50/50 dark:bg-slate-950/40 relative">
          <div className="max-w-6xl mx-auto w-full animate-slide-up">
            {children}
          </div>
        </main>

        {/* 4. MOBILE BOTTOM DRAWER NAV */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200/40 dark:border-slate-800/40 flex items-center justify-around px-4 z-40">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-all duration-200
                  ${isActive 
                    ? 'text-brand-500 dark:text-brand-400 scale-105' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                  }
                `}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span>{item.name.split(' ')[isActive ? 0 : 0]}</span>
              </NavLink>
            );
          })}
        </nav>

      </div>
    </div>
  );
};

export default Layout;
