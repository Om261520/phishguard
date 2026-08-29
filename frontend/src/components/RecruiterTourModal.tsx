import React from 'react';
import {
  Shield,
  Cpu,
  Layers,
  Database,
  Terminal,
  ExternalLink,
  Github,
  CheckCircle2,
  X,
  Sparkles,
  Award,
  Zap,
  Code2,
  BookOpen,
  Activity,
  FileCheck,
} from 'lucide-react';

interface RecruiterTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecruiterTourModal: React.FC<RecruiterTourModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c121e] border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20">
              <Award className="w-6 h-6 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  PhishGuard <span className="text-cyan-400">Engineering & Architecture Deep Dive</span>
                </h2>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold uppercase">
                  Recruiter Guide
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Full-Stack AI-Powered Cybersecurity Detection Platform by <span className="text-slate-200 font-semibold">Om Mishra</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar text-slate-200 text-sm">
          {/* Engineering Pitch & Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Detection Latency
              </div>
              <div className="text-lg font-bold font-mono text-cyan-400">&lt; 15 ms</div>
              <div className="text-[10px] text-slate-500">Zero-interaction static AST</div>
            </div>

            <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                ML Accuracy
              </div>
              <div className="text-lg font-bold font-mono text-purple-400">99.2% F1</div>
              <div className="text-[10px] text-slate-500">Random Forest Ensemble</div>
            </div>

            <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Security Rules
              </div>
              <div className="text-lg font-bold font-mono text-emerald-400">12 Modular Rules</div>
              <div className="text-[10px] text-slate-500">Heuristic Risk Scoring</div>
            </div>

            <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
              <div className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-blue-400" />
                Architecture
              </div>
              <div className="text-lg font-bold font-mono text-blue-400">Full-Stack SPA</div>
              <div className="text-[10px] text-slate-500">FastAPI + React 18 TS</div>
            </div>
          </div>

          {/* Core Technical Highlights */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Key Technical Innovations & Engineering Highlights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2">
                <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  1. Zero-Interaction Static Analysis
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Safely decomposes malicious URLs, token payloads, Shannon domain entropy, and brand signatures in memory without opening live sockets or triggering adversary honeypots.
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2">
                <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  2. Transparent Explainable AI (XAI)
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Combines machine learning probabilities (45%), heuristic rule penalty points (45%), and contextual synergy multipliers (10%) with human-readable natural language justification.
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2">
                <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  3. SOC Incident Response Triage Suite
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Includes interactive SOC playbooks, database-backed analyst investigation notes, side-by-side differential URL comparison, and attack simulation vectors.
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2">
                <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  4. Automated Executive Audit Reports
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Instant generation of structured REST API JSON payloads and printable dark/cyber executive PDF/HTML incident summaries for CISO compliance.
                </p>
              </div>
            </div>
          </div>

          {/* Tech Stack Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Technology Stack
            </h3>
            <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 uppercase block mb-1">Frontend Layer</span>
                <p className="text-slate-200 font-sans">
                  React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts Analytics
                </p>
              </div>
              <div>
                <span className="text-slate-500 uppercase block mb-1">Backend & API</span>
                <p className="text-slate-200 font-sans">
                  FastAPI (Python 3.13), Uvicorn ASGI, SQLAlchemy ORM, SQLite WAL mode, JWT Auth
                </p>
              </div>
              <div>
                <span className="text-slate-500 uppercase block mb-1">ML & Heuristics</span>
                <p className="text-slate-200 font-sans">
                  Scikit-Learn Random Forest (100 estimators), Custom 20-feature extractor, Shannon Entropy
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Navigation Shortcuts for Reviewers */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Recommended Evaluation Flow for Reviewers
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">
                  1. <strong>URL Scanner:</strong> Test one of the 5 preset attack samples or enter any URL
                </span>
                <span className="font-mono text-cyan-400">/scanner</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">
                  2. <strong>Attack Simulations:</strong> Run simulated attacks (DGA, Brand Spoof, Token Stealer)
                </span>
                <span className="font-mono text-cyan-400">/simulations</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">
                  3. <strong>Differential Compare:</strong> Inspect side-by-side divergence between authentic & spoofed URLs
                </span>
                <span className="font-mono text-cyan-400">/compare</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">
                  4. <strong>System Telemetry & Health:</strong> View live latency across ML, Database, and API subsystems
                </span>
                <span className="font-mono text-cyan-400">/health</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Links */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs">
            <a
              href="https://github.com/Om261520/phishguard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-medium"
            >
              <Github className="w-4 h-4" />
              GitHub Repository
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-medium"
            >
              <BookOpen className="w-4 h-4" />
              Interactive API Specs (Swagger)
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
          >
            Start Exploring Platform
          </button>
        </div>
      </div>
    </div>
  );
};
