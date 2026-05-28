import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
const API_URL = import.meta.env.VITE_API_URL || 'https://auraflow-backend-l0ya.onrender.com';

const AuthContext = createContext();

export const PRESET_AVATARS = [
  { id: 'grad-cap', label: 'Scholar', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-indigo-500"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/><path d="M21.5 12v6"/></svg>` },
  { id: 'laptop', label: 'Coder', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-emerald-500"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="20" x2="22" y2="20"/><line x1="12" y1="17" x2="12" y2="20"/></svg>` },
  { id: 'book', label: 'Reader', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-amber-500"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>` },
  { id: 'brain', label: 'Thinker', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-pink-500"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-4.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-4.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2z"/></svg>` },
  { id: 'dumbbell', label: 'Athlete', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-rose-500"><path d="M6.5 6.5h11M6.5 17.5h11M18 10h3M3 10h3M18 14h3M3 14h3M6.5 6.5v11M17.5 6.5v11M8.5 10h7M8.5 14h7"/></svg>` },
  { id: 'heart', label: 'Wellness', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-red-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>` },
  { id: 'coffee', label: 'Energetic', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-amber-700"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>` },
  { id: 'medal', label: 'Achiever', svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-yellow-500"><path d="M12 2v10"/><path d="M18.4 7.6c.8.8.8 2 0 2.8L12 16.8 5.6 10.4c-.8-.8-.8-2 0-2.8L12 1.2z"/><circle cx="12" cy="18" r="4"/></svg>` },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('habitflow_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const logoutSilent = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('habitflow_token');
  };

  const handleRefresh = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setToken(data.accessToken);
        localStorage.setItem('habitflow_token', data.accessToken);
        const profileRes = await fetch(`${API_URL}/api/user/profile`, {
          headers: { 'Authorization': `Bearer ${data.accessToken}` }
        });
        const profileData = await profileRes.json();
        if (profileData.success) {
          setUser(profileData.user);
          setIsAuthenticated(true);
        } else {
          logoutSilent();
        }
      } else {
        logoutSilent();
      }
    } catch (err) {
      logoutSilent();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await fetch(`${API_URL}/api/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setUser(data.user);
            setIsAuthenticated(true);
            setLoading(false);
          } else {
            await handleRefresh();
          }
        } catch (err) {
          await handleRefresh();
        }
      } else {
        await handleRefresh();
      }
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.accessToken);
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('habitflow_token', data.accessToken);
        toast.success(`Welcome back, ${data.user.name}! 👋`);
        return true;
      } else {
        toast.error(data.message || 'Invalid email or password.');
        return false;
      }
    } catch (error) {
      toast.error('Unable to connect to auth server.');
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.accessToken);
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('habitflow_token', data.accessToken);
        toast.success('Account created! Welcome to AuraFlow 🎉');
        return true;
      } else {
        toast.error(data.message || 'Failed to create account.');
        return false;
      }
    } catch (error) {
      toast.error('Unable to connect to auth server.');
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, { method: 'POST' });
    } catch (e) {}
    finally {
      logoutSilent();
      toast.success('Logged out successfully.');
    }
  };

  const updateProfile = async (name, email, avatar) => {
    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, avatar }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        toast.success('Profile updated successfully!');
        return true;
      } else {
        toast.error(data.message || 'Failed to update profile.');
        return false;
      }
    } catch (error) {
      toast.error('Server error updating profile.');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
