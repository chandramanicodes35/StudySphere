import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, ArrowLeft } from 'lucide-react';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const { signup, loading, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!username.trim() || !email.trim() || !password.trim()) {
      return setValidationError('Please fill in all registration fields.');
    }

    if (username.trim().length < 3) {
      return setValidationError('Username must be at least 3 characters.');
    }

    if (password.trim().length < 6) {
      return setValidationError('Password must be at least 6 characters.');
    }

    try {
      await signup(username.trim(), email.trim(), password.trim());
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      {/* Dynamic ambient blobs */}
      <div className="absolute top-[10%] left-[10%] w-[35%] h-[35%] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[35%] h-[35%] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Return back option */}
      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Landing
      </Link>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative flex flex-col gap-6 shadow-2xl">
        {/* Header Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">Create Account</h2>
          <p className="text-xs text-slate-400 text-center">Join StudySphere to build study habits and succeed together.</p>
        </div>

        {/* Action Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Display Alerts */}
          {(validationError || authError) && (
            <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
              {validationError || authError}
            </div>
          )}

          {/* Username inputs */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="studymaster"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-dark-700/60 border border-slate-800/80 hover:border-slate-700 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Email inputs */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-700/60 border border-slate-800/80 hover:border-slate-700 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Password inputs */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-700/60 border border-slate-800/80 hover:border-slate-700 focus:border-indigo-500 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 mt-2 py-3 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white font-semibold text-sm shadow-lg shadow-indigo-500/10 transition-colors"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Sign Up
              </>
            )}
          </button>
        </form>

        {/* Footer Redirect */}
        <p className="text-xs text-slate-500 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
