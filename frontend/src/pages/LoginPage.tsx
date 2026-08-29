import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Lock,
  User,
  ArrowRight,
  AlertTriangle,
  UserCheck,
  Check,
} from 'lucide-react';

import { PhishGuardLogo } from '../components/PhishGuardLogo';

const DEMO_ACCOUNTS = [
  { role: 'Admin', username: 'admin', pass: 'Admin@123', desc: 'Full System Control & User Management' },
  { role: 'Analyst', username: 'analyst', pass: 'Analyst@123', desc: 'Scan URLs, Triage Incidents & Add Notes' },
  { role: 'Viewer', username: 'viewer', pass: 'Viewer@123', desc: 'Read-only Access to Dashboards & Reports' },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('analyst');
  const [password, setPassword] = useState('Analyst@123');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoAccount = (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex justify-center mb-1">
            <PhishGuardLogo size="xl" showGlow={true} />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Phish<span className="text-cyan-400">Guard</span> SOC Portal
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to access AI-powered phishing URL detection & security intelligence
          </p>
        </div>

        {/* Login Box */}
        <div className="cyber-card p-6 sm:p-8 space-y-6 border-slate-800">
          {/* Instant Access Banner */}
          <button
            type="button"
            onClick={() => {
              login('analyst', 'Analyst@123').then(() => navigate('/'));
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:via-blue-500/30 hover:to-purple-500/30 border border-cyan-500/50 text-cyan-300 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 transition-all hover:scale-[1.01]"
          >
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>⚡ Instant Guest Access (1-Click Enter)</span>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[10px] font-mono text-slate-500 uppercase">or sign in with credentials</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Analyst Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full bg-[#090d16] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-[#090d16] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Preset Demo Accounts */}
          <div className="space-y-2.5 pt-4 border-t border-slate-800">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
              1-Click Demo Accounts:
            </span>
            <div className="space-y-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleSelectDemoAccount(acc.username, acc.pass)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                    username === acc.username
                      ? 'bg-cyan-950/30 border-cyan-500/40 text-slate-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                      <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                      {acc.role} ({acc.username})
                    </div>
                    <div className="text-[10px] text-slate-400">{acc.desc}</div>
                  </div>
                  {username === acc.username && (
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
