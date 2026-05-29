import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RoomProvider, useRoom } from '../context/RoomContext';
import { useAuth } from '../context/AuthContext';
import MusicPlayer from '../components/MusicPlayer';
import {
  Play,
  Pause,
  RotateCcw,
  Send,
  Users,
  FileText,
  MessageSquare,
  Volume2,
  Copy,
  Check,
  ChevronLeft,
  Flame,
  Volume1
} from 'lucide-react';

// Wrap the main Room Details component in the RoomProvider
const RoomDetailsWrapper = () => {
  const { code } = useParams();
  return (
    <RoomProvider>
      <RoomDetails code={code} />
    </RoomProvider>
  );
};

const RoomDetails = ({ code }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    room,
    participants,
    timerState,
    chatMessages,
    typingUsers,
    notes,
    loading,
    error,
    enterRoom,
    leaveRoom,
    startTimer,
    pauseTimer,
    resetTimer,
    sendMessage,
    setTypingState,
    updateNotes,
  } = useRoom();

  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'notes'
  
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load room on mount
  useEffect(() => {
    if (code) {
      enterRoom(code).catch((err) => {
        console.error(err);
        alert('Could not join this study room.');
        navigate('/dashboard');
      });
    }
  }, [code]);

  // Keep chat scrolled to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Chat typing handler with debounce
  const handleChatChange = (e) => {
    setChatInput(e.target.value);
    
    // Set user as typing
    setTypingState(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTypingState(false);
    }, 1500);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    sendMessage(chatInput.trim());
    setChatInput('');
    setTypingState(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  // Convert seconds remaining to MM:SS format
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExitRoom = async () => {
    if (confirm('Are you sure you want to leave this study room?')) {
      await leaveRoom();
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-3">
          <span className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
          <span className="text-slate-400 text-xs font-semibold">Tuning into Room Waves...</span>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-dark-900 p-8">
        <div className="glass-panel p-8 rounded-2xl max-w-md text-center flex flex-col gap-4">
          <h3 className="text-lg font-bold text-rose-400">Study Room Alert</h3>
          <p className="text-slate-400 text-sm">{error || 'Room not found.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-2 py-2 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isOwner = room.owner?._id === user?._id || room.owner === user?._id;

  return (
    <div className="flex-1 min-h-screen bg-dark-900 text-slate-100 flex flex-col gap-6 p-6 h-screen overflow-hidden">
      {/* 1. Header Workspace Panel */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-dark-800/40 border border-slate-800/50 p-4 rounded-2xl gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleExitRoom}
            className="p-2.5 rounded-xl bg-dark-700/60 border border-slate-700/40 hover:bg-dark-600 text-slate-400 hover:text-white shrink-0 active:scale-95 transition-transform"
            title="Leave Study Room"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white truncate">{room.name}</h2>
            <p className="text-xs text-slate-400 truncate max-w-sm">{room.description || 'Virtual study space'}</p>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-3 w-full sm:w-auto self-stretch sm:self-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2 bg-dark-700/50 border border-slate-700/30 px-3 py-2 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Room Code</span>
            <span className="text-sm font-mono font-bold text-white tracking-widest">{room.code}</span>
            <button
              onClick={handleCopyCode}
              className="p-1 rounded bg-dark-800 border border-slate-700/50 hover:bg-dark-600 text-slate-400 hover:text-white transition-colors"
              title="Copy Code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            onClick={handleExitRoom}
            className="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white text-xs font-semibold active:scale-95 transition-all"
          >
            Exit Workspace
          </button>
        </div>
      </header>

      {/* 2. Main Content Board */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
        {/* Left Side: Pomodoro, Sound Player, Notes / Chat */}
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
            {/* Pomodoro Timer Sync Card */}
            <div className={`glass-panel p-6 rounded-3xl border flex flex-col items-center justify-between gap-4 relative overflow-hidden transition-all duration-300 ${
              timerState.isRunning 
                ? (timerState.type === 'focus' ? 'border-emerald-500/30' : 'border-indigo-500/30') 
                : 'border-slate-800/80'
            }`}>
              {/* Dynamic glowing radial filter */}
              {timerState.isRunning && (
                <div className={`absolute -inset-10 opacity-30 rounded-full blur-[80px] pointer-events-none transition-all duration-500 ${
                  timerState.type === 'focus' ? 'bg-emerald-500/15' : 'bg-indigo-500/15'
                }`}></div>
              )}

              {/* Status Header */}
              <div className="flex items-center justify-between w-full z-10">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${
                  timerState.type === 'focus' 
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                    : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                }`}>
                  {timerState.type === 'focus' ? 'Focus Interval' : 'Rest Cycle'}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {timerState.isRunning ? 'Synchronized Clock' : 'Timer Idle'}
                </span>
              </div>

              {/* Time display */}
              <div className="flex flex-col items-center z-10">
                <h3 className={`text-5xl font-mono font-extrabold tracking-widest select-none transition-all duration-300 ${
                  timerState.isRunning 
                    ? (timerState.type === 'focus' ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]') 
                    : 'text-white'
                }`}>
                  {formatTimer(timerState.secondsRemaining)}
                </h3>
                <span className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wide">
                  {timerState.type === 'focus' ? 'Keep concentrating' : 'Unwind and breathe'}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 w-full z-10">
                {isOwner ? (
                  <>
                    {timerState.isRunning ? (
                      <button
                        onClick={pauseTimer}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-dark-700/60 border border-slate-700/50 hover:bg-dark-600 hover:text-white text-slate-300 text-xs font-semibold active:scale-95 transition-transform"
                      >
                        <Pause className="w-4 h-4" /> Pause
                      </button>
                    ) : (
                      <button
                        onClick={() => startTimer(timerState.secondsRemaining, timerState.type)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-xs font-bold active:scale-95 transition-transform ${
                          timerState.type === 'focus' 
                            ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/10' 
                            : 'bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/10'
                        }`}
                      >
                        <Play className="w-4 h-4 fill-white" /> Start
                      </button>
                    )}
                    <button
                      onClick={() => resetTimer(1500, 'focus')}
                      className="p-2.5 rounded-xl bg-dark-700/60 border border-slate-700/50 hover:bg-dark-600 text-slate-400 hover:text-white active:scale-95 transition-transform"
                      title="Reset Timer to 25m Focus"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="w-full text-center py-2.5 text-xs text-slate-400 bg-dark-700/30 border border-slate-800/40 rounded-xl font-medium">
                    🔒 Host controls co-working countdown
                  </div>
                )}
              </div>

              {/* Preset Shortcuts (Owner Only) */}
              {isOwner && (
                <div className="flex items-center gap-1.5 w-full mt-1 z-10 shrink-0">
                  <button
                    onClick={() => resetTimer(1500, 'focus')}
                    disabled={timerState.isRunning}
                    className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg border transition-all ${
                      timerState.type === 'focus' && timerState.secondsRemaining === 1500
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-dark-700/20 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Focus (25m)
                  </button>
                  <button
                    onClick={() => resetTimer(300, 'break')}
                    disabled={timerState.isRunning}
                    className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg border transition-all ${
                      timerState.type === 'break' && timerState.secondsRemaining === 300
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                        : 'bg-dark-700/20 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Short Break (5m)
                  </button>
                </div>
              )}
            </div>

            {/* Lofi Ambient music player */}
            <MusicPlayer />
          </div>

          {/* Notes and Chat tabs container */}
          <div className="flex-1 flex flex-col bg-dark-800/40 border border-slate-800/50 rounded-3xl overflow-hidden min-h-0">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-800/35 bg-dark-800/20 shrink-0">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === 'chat'
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" /> Discussion Chat
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === 'notes'
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" /> Shared Notepad
              </button>
            </div>

            {/* Tab: Real-time Discussion Chat */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Message display lists */}
                <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-3.5">
                  {chatMessages.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-slate-500 text-xs py-8">
                      No chat messages sent. Kick off the discussion!
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      if (msg.system) {
                        return (
                          <div key={msg._id} className="w-full flex justify-center shrink-0">
                            <span className="text-[10px] text-slate-500 font-semibold bg-dark-700/30 px-3 py-1 rounded-full border border-slate-800/50">
                              📢 {msg.content}
                            </span>
                          </div>
                        );
                      }

                      const isSelf = msg.sender?._id === user?._id;
                      return (
                        <div
                          key={msg._id}
                          className={`flex items-start gap-2.5 max-w-[85%] shrink-0 ${
                            isSelf ? 'self-end flex-row-reverse' : 'self-start'
                          }`}
                        >
                          <img
                            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${msg.sender?.avatar || 'avatar-default'}`}
                            alt="Avatar"
                            className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/60 p-0.5 mt-0.5"
                          />
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className={`text-[10px] font-semibold text-slate-400 ${isSelf ? 'text-right' : ''}`}>
                              {msg.sender?.username || 'Colleague'}
                            </span>
                            <div className={`p-3 rounded-2xl text-xs leading-relaxed break-words border ${
                              isSelf
                                ? 'bg-indigo-500 border-indigo-600 text-white rounded-tr-none'
                                : 'bg-dark-700/60 border-slate-850 text-slate-200 rounded-tl-none'
                            }`}>
                              {msg.content}
                            </div>
                            <span className={`text-[9px] text-slate-500 mt-0.5 ${isSelf ? 'text-right' : ''}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Active Typing Flags bar */}
                {typingUsers.length > 0 && (
                  <div className="px-5 py-1 text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-1.5 bg-dark-800/10">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></span>
                    <span>
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is typing...' : 'are typing...'}
                    </span>
                  </div>
                )}

                {/* Input box */}
                <form onSubmit={handleSendChat} className="p-4 border-t border-slate-800/35 bg-dark-800/20 shrink-0 flex gap-2">
                  <input
                    type="text"
                    placeholder="Contribute ideas..."
                    value={chatInput}
                    onChange={handleChatChange}
                    className="flex-grow bg-dark-700/60 border border-slate-800/80 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/10 active:scale-95 transition-transform shrink-0"
                  >
                    <Send className="w-4 h-4 fill-white" />
                  </button>
                </form>
              </div>
            )}

            {/* Tab: Shared Notepad (Collaborative Sync Canvas) */}
            {activeTab === 'notes' && (
              <div className="flex-1 flex flex-col p-5 min-h-0 relative">
                <div className="absolute top-3 right-3 z-10 bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Synchronized notepad
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => updateNotes(e.target.value)}
                  placeholder="Collaborate live on room-level notes here... Write guidelines, exam reviews, or summaries. Anyone typing in the room updates this instantly!"
                  className="flex-1 w-full bg-dark-700/20 border border-slate-800/40 focus:border-indigo-500/50 rounded-2xl p-5 text-xs font-mono leading-relaxed resize-none outline-none overflow-y-auto text-slate-300"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Participant Panel */}
        <aside className="w-full lg:w-72 glass-panel p-5 rounded-3xl flex flex-col gap-5 shrink-0 min-h-0 overflow-y-auto">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" /> Co-Workers
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-bold ml-1">
                {participants.length}
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Online workspace participants</p>
          </div>

          <div className="flex flex-col gap-3">
            {participants.map((person) => {
              const isParticipantOwner = room.owner?._id === person._id || room.owner === person._id;
              const isParticipantSelf = user?._id === person._id;
              return (
                <div
                  key={person._id}
                  className="flex items-center gap-3 bg-dark-700/30 border border-slate-800/40 p-2.5 rounded-xl"
                >
                  <img
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${person.avatar}`}
                    alt="Participant Avatar"
                    className="w-9 h-9 rounded-lg bg-slate-850 border border-slate-700/60 p-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white truncate">
                        {person.username}
                      </span>
                      {isParticipantSelf && (
                        <span className="text-[8px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1 py-0.1 rounded font-bold shrink-0">
                          you
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {isParticipantOwner && (
                        <span className="text-[8px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.1 rounded font-semibold shrink-0">
                          Host
                        </span>
                      )}
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-400 font-semibold shrink-0">
                        <Flame className="w-3 h-3 fill-amber-400" /> {person.dailyStreak || 0}d streak
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default RoomDetailsWrapper;
