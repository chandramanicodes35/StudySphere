import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  History,
  Trophy,
  User,
  LogOut,
  Sparkles,
  Flame,
  Clock
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'History Logs', path: '/history', icon: History },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Profile & Settings', path: '/profile', icon: User },
  ];

  // Helper to display study hours nicely (e.g. 2.4 hrs)
  const formatStudyHours = (seconds) => {
    return (seconds / 3600).toFixed(1);
  };

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 min-h-screen flex flex-col justify-between py-6 px-4 shrink-0">
      <div className="flex flex-col gap-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-xl font-bold text-white">S</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
              StudySphere <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            </h1>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Co-working Space</span>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 bg-dark-700/40 border border-slate-800/50 p-3.5 rounded-2xl relative overflow-hidden">
          {/* Decorative blur */}
          <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl"></div>
          
          <img
            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.avatar}`}
            alt="User Avatar"
            className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/60 p-1"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-white truncate">{user.username}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-0.5 text-xs text-amber-400 font-medium">
                <Flame className="w-3.5 h-3.5 fill-amber-400" /> {user.dailyStreak}d
              </span>
              <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
              <span className="flex items-center gap-0.5 text-xs text-indigo-400 font-medium">
                <Clock className="w-3.5 h-3.5" /> {formatStudyHours(user.totalStudyTime)}h
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/10 to-indigo-600/5 border-l-2 border-indigo-500 text-indigo-400 font-semibold'
                    : 'text-slate-400 hover:bg-dark-700/30 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="px-2">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
