import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History as HistoryIcon, Clock, ArrowRight, Timer, Users, Calendar, Sparkles } from 'lucide-react';

const History = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/stats/dashboard');
      setActivities(response.data.recentActivities || []);
    } catch (err) {
      console.error('Fetch history error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Format activity action badges beautifully
  const getActionBadge = (action) => {
    switch (action) {
      case 'complete_focus':
        return (
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-semibold">
            Sprint Completed
          </span>
        );
      case 'start_focus':
        return (
          <span className="text-[10px] bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2.5 py-0.5 rounded-full font-semibold">
            Sprint Started
          </span>
        );
      case 'complete_break':
        return (
          <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-full font-semibold">
            Rest Done
          </span>
        );
      case 'start_break':
        return (
          <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-full font-semibold">
            Rest Started
          </span>
        );
      case 'join':
        return (
          <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2.5 py-0.5 rounded-full font-semibold">
            Room Join
          </span>
        );
      case 'leave':
        return (
          <span className="text-[10px] bg-dark-600/40 border border-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-semibold">
            Room Exit
          </span>
        );
      default:
        return (
          <span className="text-[10px] bg-dark-700 border border-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-semibold">
            Activity
          </span>
        );
    }
  };

  const formatActivityDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatActivityTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
          <span className="text-slate-400 text-xs font-semibold">Compiling Audit Timeline...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen p-8 bg-dark-900 text-slate-100 flex flex-col gap-8 relative overflow-y-auto">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800/35 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            History Console
          </h2>
          <p className="text-xs text-slate-400">Review chronological co-working events, Pomodoro intervals, and milestones.</p>
        </div>
      </div>

      <div className="max-w-4xl w-full flex flex-col gap-6">
        {activities.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-500 text-xs">
            No chronological activities found. Jump into a co-working space to generate records!
          </div>
        ) : (
          <div className="flex flex-col relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-[1px] before:bg-slate-800/80 gap-6">
            {activities.map((act) => (
              <div key={act._id} className="flex gap-4 relative items-start group">
                {/* Timeline dot */}
                <div className="w-12 h-12 rounded-2xl bg-dark-800 border border-slate-850 flex items-center justify-center shrink-0 z-10 group-hover:border-indigo-500 transition-colors shadow-md shadow-dark-900/50">
                  <Calendar className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </div>

                {/* Event details card */}
                <div className="flex-1 glass-card p-5 border border-slate-800/40 hover:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
                  <div className="flex flex-col gap-1 min-w-0 pr-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-white tracking-tight">
                        {act.room?.name || 'Study Room'}
                      </span>
                      <span className="text-[9px] bg-dark-700 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                        #{act.room?.code || 'STUDY'}
                      </span>
                      {getActionBadge(act.action)}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">
                      {act.description}
                    </p>
                  </div>

                  {/* Timestamps */}
                  <div className="flex sm:flex-col items-center sm:items-end text-slate-500 text-[10px] font-medium gap-2 sm:gap-0.5 shrink-0 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/20 sm:border-transparent">
                    <span className="flex items-center gap-0.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5" /> {formatActivityTime(act.createdAt)}
                    </span>
                    <span>{formatActivityDate(act.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
