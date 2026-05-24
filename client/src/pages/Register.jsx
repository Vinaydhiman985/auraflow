import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import Logo from '../components/Logo';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    const success = register(name, email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans p-4 relative overflow-hidden">
      
      {/* Decorative background ambient glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-500/10 dark:bg-brand-500/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-pink-500/10 dark:bg-pink-500/15 blur-3xl" />

      {/* Auth Shell Grid */}
      <div className="grid md:grid-cols-2 max-w-4xl w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-800/40 relative z-10 min-h-[500px]">
        
        {/* LEFT PANEL - FORM */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <Logo iconSize="h-8 w-8" />
          </div>

          <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight mb-2">
            Join AuraFlow
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-8">
            Create an account to begin tracking study and fitness consistency.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Taylor Smith"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-brand-500 dark:focus:border-brand-500 focus:ring focus:ring-brand-500/10 rounded-xl text-sm outline-none transition-all"
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
                  placeholder="name@university.edu"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-brand-500 dark:focus:border-brand-500 focus:ring focus:ring-brand-500/10 rounded-xl text-sm outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-brand-500 dark:focus:border-brand-500 focus:ring focus:ring-brand-500/10 rounded-xl text-sm outline-none transition-all"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-medium rounded-xl text-sm transition-all shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* RIGHT PANEL - DECORATIVE GRAPHIC */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-tr from-brand-600 to-indigo-950 text-white relative font-sans">
          
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]" />
          
          <div className="relative z-10 flex justify-end">
            <span className="px-3.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold border border-white/10 uppercase tracking-widest">
              Join 1,000+ Students
            </span>
          </div>

          <div className="relative z-10 space-y-6">
            <Logo showText={false} iconSize="h-12 w-12" />
            <div>
              <blockquote className="font-display font-medium text-2xl leading-snug">
                "Small daily improvements over time lead to stunning results."
              </blockquote>
              <cite className="block mt-3 text-sm text-indigo-200 not-italic font-medium">— Robin Sharma</cite>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-indigo-200">
            <span>AuraFlow Companion</span>
            <span>v1.0</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
