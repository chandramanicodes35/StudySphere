import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Trophy, Award, Flame, Clock, Users, Calendar } from 'lucide-react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState({
    topStudyTime: [],
    topStreak: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('studyTime'); // 'studyTime' or 'streak'

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/stats/leaderboard');
      setLeaderboard(response.data);
    } catch (err) {
      console.error('Fetch leaderboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const formatTime = (seconds) => {
    const hrs = (seconds / 3600).toFixed(1);
    return `${hrs} hrs`;
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 0:
        return (
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-500 flex items-center justify-center font-bold text-xs">
            🥇
          </div>
        );
      case 1:
        return (
          <div className="w-7 h-7 rounded-lg bg-slate-400/10 border border-slate-400/25 text-slate-400 flex items-center justify-center font-bold text-xs">
            🥈
          </div>
        );
      case 2:
        return (
          <div className="w-7 h-7 rounded-lg bg-amber-700/15 border border-amber-700/25 text-amber-600 flex items-center justify-center font-bold text-xs">
            🥉
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-lg bg-dark-700 border border-slate-800 text-slate-400 flex items-center justify-center font-bold text-[10px]">
            {rank + 1}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
          <span className="text-slate-400 text-xs font-semibold">Tuning Leaderboard standings...</span>
        </div>
      </div>
    );
  }

  const activeList = activeTab === 'studyTime' ? leaderboard.topStudyTime : leaderboard.topStreak;

  return (
    <div className="flex-1 min-h-screen p-8 bg-dark-900 text-slate-100 flex flex-col gap-8 relative overflow-y-auto">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800/35 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Leaderboard Console
          </h2>
          <p className="text-xs text-slate-400">View competitive co-working ranks based on cumulative focus durations and streaks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Category controls */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Toggles */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-indigo-400" /> Rank Category
            </h3>
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => setActiveTab('studyTime')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold border transition-all ${
                  activeTab === 'studyTime'
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-bold'
                    : 'bg-dark-700/20 border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4" /> Focus Time Ranks
              </button>
              <button
                onClick={() => setActiveTab('streak')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold border transition-all ${
                  activeTab === 'streak'
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-bold'
                    : 'bg-dark-700/20 border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame className="w-4 h-4" /> Daily Streak Ranks
              </button>
            </div>
          </div>

          {/* Inspirational banner */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 relative overflow-hidden flex flex-col gap-3">
            <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl"></div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Honor Criteria</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              StudySphere lists are refreshed in real-time. Completing Pomodoro focus cycles adds hours to your profile and secures your streaks!
            </p>
          </div>
        </div>

        {/* Right Side: Rank Lists */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex flex-col gap-4">
            <div className="border-b border-slate-800/35 pb-4 flex items-center justify-between">
              <h4 className="text-sm font-bold text-white tracking-tight">
                {activeTab === 'studyTime' ? 'Total Hours Studied' : 'Streaking Consistencies'}
              </h4>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Top Standings</span>
            </div>

            {activeList.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No rankings accumulated yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {activeList.map((person, index) => (
                  <div
                    key={person._id}
                    className="flex items-center justify-between bg-dark-700/30 border border-slate-850 p-3 rounded-2xl"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank Index */}
                      {getRankBadge(index)}

                      <img
                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=${person.avatar}`}
                        alt="User Profile"
                        className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/60 p-0.5"
                      />

                      <span className="text-xs font-bold text-white truncate min-w-0">
                        {person.username}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      {/* Hours */}
                      <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{formatTime(person.totalStudyTime)}</span>
                      </div>

                      {/* Streaks */}
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Flame className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{person.dailyStreak}d</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
