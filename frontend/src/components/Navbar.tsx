import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Activity, User, LogOut, Search, Award, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { RecruiterTourModal } from './RecruiterTourModal';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showTour, setShowTour] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-slate-800 bg-[#0c121e]/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  Phish<span className="text-cyan-400">Guard</span>
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded font-bold">
                  SOC v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider font-mono hidden sm:block">
                AI-POWERED PHISHING DETECTION PLATFORM
              </p>
            </div>
          </Link>
        </div>

        {/* Recruiter / Architecture Deep Dive Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTour(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
          >
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Engineering & Architecture Deep Dive</span>
            <span className="sm:hidden">Architecture</span>
          </button>
        </div>

        {/* Right User & Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/scanner')}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500 hover:text-slate-950 transition-all shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            Scan URL
          </button>

        {isAuthenticated ? (
          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-200">{user?.username}</div>
              <div className="text-[10px] font-mono uppercase text-cyan-400">{user?.role}</div>
            </div>

            <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
              <User className="w-4 h-4" />
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all"
          >
            Log In
          </Link>
        )}
      </div>
    </header>

    <RecruiterTourModal isOpen={showTour} onClose={() => setShowTour(false)} />
    </>
  );
};
