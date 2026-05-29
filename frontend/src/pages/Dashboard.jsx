import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import StudyChart from '../components/StudyChart';
import {
  Flame,
  Clock,
  CheckCircle,
  Video,
  Plus,
  ArrowRight,
  Search,
  Lock,
  Globe,
  Users
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // API loading states
  const [stats, setStats] = useState({
    totalStudyTime: 0,
    dailyStreak: 0,
    completedSessions: 0,
    activeRooms: 0,
    recentActivities: [],
    chartData: [],
  });
  const [publicRooms, setPublicRooms] = useState([]);
  const [userRooms, setUserRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms state
  const [createRoomName, setCreateRoomName] = useState('');
  const [createRoomDesc, setCreateRoomDesc] = useState('');
  const [createRoomPrivate, setCreateRoomPrivate] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [formError, setFormError] = useState('');
  const [joinError, setJoinError] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('/stats/dashboard');
      setStats(statsRes.data);

      const publicRes = await api.get('/rooms');
      setPublicRooms(publicRes.data);

      const userRoomsRes = await api.get('/rooms/user/all');
      setUserRooms(userRoomsRes.data);
    } catch (err) {
      console.error('Fetch dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Form handle: Create Room
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!createRoomName.trim()) {
      return setFormError('Room name is required.');
    }

    setCreating(true);
    try {
      const response = await api.post('/rooms', {
        name: createRoomName.trim(),
        description: createRoomDesc.trim(),
        isPrivate: createRoomPrivate,
      });
      const room = response.data;
      navigate(`/room/${room.code}`);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setCreating(false);
    }
  };

  // Form handle: Join Room
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setJoinError('');
    if (!joinCode.trim() || joinCode.length !== 6) {
      return setJoinError('Please enter a valid 6-character room code.');
    }

    setJoining(true);
    try {
      const response = await api.post('/rooms/join', {
        code: joinCode.trim().toUpperCase(),
      });
      const room = response.data;
      navigate(`/room/${room.code}`);
    } catch (err) {
      setJoinError(err.message);
    } finally {
      setJoining(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins} mins`;
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
          <span className="text-slate-400 text-xs font-semibold">Synchronizing Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen p-8 bg-dark-900 text-slate-100 flex flex-col gap-8 relative overflow-y-auto">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800/35 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Study Console</h2>
          <p className="text-xs text-slate-400">Track focus sessions, join dynamic study spaces, and build learning habits.</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 font-medium">Session Timestamp</span>
          <p className="text-sm font-semibold text-indigo-400 mt-0.5">Active</p>
        </div>
      </div>

      {/* Grid: Stat widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Daily Streak"
          value={`${stats.dailyStreak} Days`}
          icon={Flame}
          description="Keep active daily to stack streaks!"
          colorClass="text-amber-500 bg-amber-500/10 border-amber-500/20"
        />
        <StatsCard
          title="Total Study Hours"
          value={formatTime(stats.totalStudyTime)}
          icon={Clock}
          description="Cumulative focus hours"
          colorClass="text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
        />
        <StatsCard
          title="Completed Sprints"
          value={stats.completedSessions}
          icon={CheckCircle}
          description="Interval Pomodoros finished"
          colorClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
        />
        <StatsCard
          title="Active Co-working Rooms"
          value={stats.activeRooms}
          icon={Video}
          description="Joined virtual classrooms"
          colorClass="text-sky-400 bg-sky-500/10 border-sky-500/20"
        />
      </div>

      {/* Grid: Analytical charts and room codes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly focus graph */}
        <div className="lg:col-span-2">
          <StudyChart data={stats.chartData} />
        </div>

        {/* Room forms */}
        <div className="flex flex-col gap-6">
          {/* Join Room Form */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Enter Study Room</h4>
              <p className="text-xs text-slate-400">Provide a 6-character code to join colleagues instantly</p>
            </div>
            <form onSubmit={handleJoinRoom} className="flex flex-col gap-3">
              {joinError && (
                <div className="p-2.5 text-[11px] bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                  {joinError}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. STUDY1"
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-dark-700/60 border border-slate-800/80 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm uppercase font-mono tracking-widest outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={joining}
                  className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/40 text-white font-semibold text-xs flex items-center gap-1 active:scale-95 transition-transform"
                >
                  {joining ? 'Joining...' : <>Join <ArrowRight className="w-3.5 h-3.5" /></>}
                </button>
              </div>
            </form>
          </div>

          {/* Create Room Form */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Create Study Space</h4>
              <p className="text-xs text-slate-400">Generate a custom real-time virtual environment</p>
            </div>
            <form onSubmit={handleCreateRoom} className="flex flex-col gap-3">
              {formError && (
                <div className="p-2.5 text-[11px] bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                  {formError}
                </div>
              )}
              <input
                type="text"
                placeholder="Room Name (e.g. Finals Prep)"
                value={createRoomName}
                onChange={(e) => setCreateRoomName(e.target.value)}
                className="bg-dark-700/60 border border-slate-800/80 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm outline-none"
                required
              />
              <input
                type="text"
                placeholder="Brief Description (Optional)"
                value={createRoomDesc}
                onChange={(e) => setCreateRoomDesc(e.target.value)}
                className="bg-dark-700/60 border border-slate-800/80 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm outline-none"
              />
              <div className="flex items-center justify-between px-1 mt-1">
                <span className="text-xs text-slate-400 font-semibold">Make Room Private</span>
                <input
                  type="checkbox"
                  checked={createRoomPrivate}
                  onChange={(e) => setCreateRoomPrivate(e.target.checked)}
                  className="w-4 h-4 bg-dark-700 border-slate-800 rounded accent-indigo-500 cursor-pointer"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full flex items-center justify-center gap-1.5 mt-2 py-3 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/40 text-white font-semibold text-xs transition-colors"
              >
                {creating ? 'Spawning Space...' : <><Plus className="w-4 h-4" /> Create Space</>}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Directory section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User rooms directory */}
        <div className="flex flex-col gap-4">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            My Study Rooms <span className="text-xs bg-dark-700 px-2 py-0.5 rounded-full text-indigo-400">{userRooms.length}</span>
          </h3>
          {userRooms.length === 0 ? (
            <div className="glass-card p-8 text-center text-slate-500 text-xs">
              You haven't generated or joined any study channels. Start by creating a space!
            </div>
          ) : (
            <div className="flex flex-col gap-3.5 max-h-[350px] overflow-y-auto pr-1">
              {userRooms.map((rm) => (
                <div
                  key={rm._id}
                  onClick={() => navigate(`/room/${rm.code}`)}
                  className="glass-card p-4 flex items-center justify-between cursor-pointer border border-slate-800/40 hover:border-indigo-500/40"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{rm.name}</h4>
                      {rm.isPrivate ? (
                        <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      ) : (
                        <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{rm.description || 'No description added'}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md font-mono uppercase font-semibold">
                        Code: {rm.code}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] text-slate-500 font-medium">
                        <Users className="w-3 h-3" /> {rm.participants?.length || 0} active
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 transition-transform group-hover:translate-x-1" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Public directory list */}
        <div className="flex flex-col gap-4">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Public Co-working Spaces <span className="text-xs bg-dark-700 px-2 py-0.5 rounded-full text-emerald-400">{publicRooms.length}</span>
          </h3>
          {publicRooms.length === 0 ? (
            <div className="glass-card p-8 text-center text-slate-500 text-xs">
              No active public spaces currently. Sprout one above to welcome others!
            </div>
          ) : (
            <div className="flex flex-col gap-3.5 max-h-[350px] overflow-y-auto pr-1">
              {publicRooms.map((rm) => (
                <div
                  key={rm._id}
                  onClick={() => navigate(`/room/${rm.code}`)}
                  className="glass-card p-4 flex items-center justify-between cursor-pointer border border-slate-800/40 hover:border-indigo-500/40"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <h4 className="text-sm font-bold text-white truncate">{rm.name}</h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{rm.description || 'No description added'}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-mono uppercase font-semibold">
                        Code: {rm.code}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] text-slate-500 font-medium">
                        <Users className="w-3 h-3" /> {rm.participants?.length || 0} active
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
