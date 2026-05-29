import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Users, Timer, Music, FileText, ArrowRight, Activity, Award } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const features = [
    {
      title: 'Synced Pomodoro Timer',
      desc: 'Study in structured sprint intervals synced perfectly down to the second across all room participants.',
      icon: Timer,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Real-Time Collaboration',
      desc: 'Chat instantly, see online indicators, and view active typing flags without frustrating manual page refreshes.',
      icon: Users,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Ambient Focus Streams',
      desc: 'Tune into integrated soundtracks like Lofi Beats, Forest Streams, and Cozy Rain directly in your room.',
      icon: Music,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Shared Study Notes',
      desc: 'Collaborate live on room-level notes to compile summaries, exam checklists, and shared concepts.',
      icon: FileText,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Analytics Dashboard',
      desc: 'Review weekly progress charts, log daily streaks, and watch your total cumulative focus hours grow.',
      icon: Activity,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      title: 'Active Streaks & Honors',
      desc: 'Compete on global leaderboards by earning study credentials and maintaining your daily productivity streaks.',
      icon: Award,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 relative overflow-hidden flex flex-col justify-between">
      {/* Decorative ambient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Header Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
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

        <div className="flex items-center gap-4">
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl bg-dark-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-sm font-semibold transition-all"
            >
              Enter Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2.5 text-slate-400 hover:text-white text-sm font-semibold transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/10 active:scale-95 transition-transform"
              >
                Create Account
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 flex-1 flex flex-col items-center justify-center text-center gap-8 z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen Collaborative Virtual Study Space
        </div>

        <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1]">
          Focus Together. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-indigo-500 to-emerald-400 bg-clip-text text-transparent">
            Succeed Together.
          </span>
        </h2>

        <p className="text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed">
          Break free from isolation. Create beautiful, distraction-free virtual rooms, invite classmates, track focus cycles with synchronized timers, and build long-term study habits in real time.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          <button
            onClick={handleStart}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-base font-bold shadow-xl shadow-indigo-500/15 group transition-all"
          >
            Start Studying Now
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <a
            href="#features"
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-dark-800/60 border border-slate-800/80 hover:bg-dark-700/60 text-slate-300 text-base font-semibold transition-all"
          >
            Explore Features
          </a>
        </div>

        {/* Feature Grid Section */}
        <section id="features" className="w-full py-20 mt-16 border-t border-slate-800/40">
          <div className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-3">
            <h3 className="text-3xl font-extrabold tracking-tight text-white">Engaging Productivity Features</h3>
            <p className="text-slate-400 text-sm">Designed specifically to maximize cognitive flow and keep student teams accountable.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left w-full">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="glass-card p-6 flex flex-col gap-4 border border-slate-800/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`p-3 rounded-xl border w-fit ${feature.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-white tracking-tight">{feature.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-slate-800/30 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs gap-4 z-10">
        <p>© 2026 StudySphere Co-working. All rights reserved.</p>
        <p className="flex items-center gap-1.5">
          Made for active student collaboration and daily streaks.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
