import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Sparkles, Goal, Volume2, Save, Check } from 'lucide-react';

const AVATAR_SEEDS = [
  'avatar-1',
  'avatar-2',
  'avatar-3',
  'avatar-4',
  'avatar-5',
  'avatar-6',
  'avatar-7',
  'avatar-8',
  'studysphere-bot',
  'creative-mind',
  'fast-learner',
  'pomodoro-ninja'
];

const Profile = () => {
  const { user, updateProfile } = useAuth();

  // Settings states
  const [username, setUsername] = useState(user?.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'avatar-1');
  const [dailyGoalHours, setDailyGoalHours] = useState(
    user?.settings?.dailyGoalSeconds ? Math.round(user.settings.dailyGoalSeconds / 3600) : 2
  );
  const [ambientVolume, setAmbientVolume] = useState(user?.settings?.ambientVolume ?? 0.5);

  // Form handlers
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');

    if (!username.trim()) {
      setSaving(false);
      return setError('Username is required.');
    }

    try {
      const dailyGoalSeconds = dailyGoalHours * 3600;
      await updateProfile(username.trim(), selectedAvatar, {
        theme: 'dark',
        dailyGoalSeconds,
        ambientVolume,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen p-8 bg-dark-900 text-slate-100 flex flex-col gap-8 relative overflow-y-auto">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800/35 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Profile Console</h2>
          <p className="text-xs text-slate-400">Customize co-working configurations, alert scales, and daily goals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Avatar selector and info card */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden group">
            {/* Background design */}
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>

            <img
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${selectedAvatar}`}
              alt="Avatar Render"
              className="w-24 h-24 rounded-2xl bg-dark-700 border border-slate-750 p-2.5 shadow-lg group-hover:scale-105 transition-transform"
            />
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{user?.username}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            </div>
            <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Student Co-Worker
            </span>
          </div>

          <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 flex flex-col gap-4">
            <h4 className="text-sm font-semibold text-slate-200">Study Streak Progress</h4>
            <div className="flex items-center justify-between bg-dark-700/30 border border-slate-800/40 p-4 rounded-2xl">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Active Streak</span>
                <p className="text-xl font-bold text-amber-500 flex items-center gap-1 mt-0.5">
                  {user?.dailyStreak || 0} Days Running
                </p>
              </div>
              <div className="p-3 bg-amber-500/15 border border-amber-500/25 rounded-2xl text-amber-500">
                🎓
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Configuration settings form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex flex-col gap-6">
            <div className="border-b border-slate-800/35 pb-4">
              <h4 className="text-sm font-bold text-white tracking-tight">Configuration Settings</h4>
              <p className="text-xs text-slate-400">Modify preferences to fit your personal studying routine</p>
            </div>

            {/* Display Alerts */}
            {error && (
              <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-1.5 font-semibold">
                <Check className="w-4 h-4" /> Account credentials and metrics saved successfully.
              </div>
            )}

            {/* Username inputs */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400">Edit Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-dark-700/60 border border-slate-800/80 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Avatar Selector Grid */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-slate-400">Select Avatar Style</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {AVATAR_SEEDS.map((seed) => {
                  const isSelected = selectedAvatar === seed;
                  return (
                    <div
                      key={seed}
                      onClick={() => setSelectedAvatar(seed)}
                      className={`p-1.5 rounded-xl cursor-pointer bg-dark-700/40 border transition-all ${
                        isSelected 
                          ? 'border-indigo-500 scale-105 bg-indigo-500/5 shadow-md shadow-indigo-500/5' 
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`}
                        alt="Dicebear Seed"
                        className="w-full h-10 object-contain rounded-md"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily study goal */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Goal className="w-4 h-4 text-indigo-400" /> Daily Target Goal
                </label>
                <span className="text-xs text-indigo-400 font-bold">{dailyGoalHours} Hours</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={dailyGoalHours}
                onChange={(e) => setDailyGoalHours(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <p className="text-[10px] text-slate-500">Determines streak achievements when study sprint clocks finish.</p>
            </div>

            {/* Volume configuration */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-indigo-400" /> Alarm Volume
                </label>
                <span className="text-xs text-indigo-400 font-bold">{Math.round(ambientVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <p className="text-[10px] text-slate-500">Volume level for bell chimes when Focus or Break timers exhaust.</p>
            </div>

            {/* Save Action */}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 mt-2 py-3 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white font-semibold text-sm shadow-lg shadow-indigo-500/10 transition-colors"
            >
              {saving ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Profile Configurations
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
