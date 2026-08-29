import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  ShieldAlert,
  Server,
  Key,
  Globe,
  Radio,
  ArrowRight,
  Info,
  Layers,
} from 'lucide-react';

interface SimulationScenario {
  id: string;
  title: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  url: string;
  description: string;
  keyIndicators: string[];
  expectedVerdict: 'SAFE' | 'SUSPICIOUS' | 'PHISHING';
}

const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'sim-1',
    title: 'Legitimate Web Resource',
    category: 'Baseline Benign',
    severity: 'LOW',
    url: 'https://en.wikipedia.org/wiki/Computer_security',
    description: 'Standard legitimate domain with proper HTTPS protocol, standard entropy, zero credential harvesting tokens, and reputable top-level domain.',
    keyIndicators: ['Reputable domain', 'Valid HTTPS protocol', 'Zero suspicious auth keywords', 'Standard character entropy'],
    expectedVerdict: 'SAFE',
  },
  {
    id: 'sim-2',
    title: 'Long Suspicious Authentication URL',
    category: 'Obfuscation & Staging',
    severity: 'HIGH',
    url: 'http://secure-login-portal-verification-update.example.com/step1/auth/session/token?client_id=892348923&redirect=account',
    description: 'Excessively long URL structure (>75 chars) packed with multiple authentication terms and open-redirect parameters.',
    keyIndicators: ['Excessive URL length', 'Multiple auth keywords (login, verify, secure, token)', 'Open redirect parameter', 'Insecure plaintext HTTP'],
    expectedVerdict: 'SUSPICIOUS',
  },
  {
    id: 'sim-3',
    title: 'IP-Based Credential Stealer',
    category: 'Direct IP Infrastructure',
    severity: 'CRITICAL',
    url: 'http://192.168.1.105/bank-login-verify.php?session=984321',
    description: 'Bypasses DNS domain reputation filters by hosting credential harvesting scripts directly on a raw IPv4 address.',
    keyIndicators: ['Raw IPv4 host address', 'Sensitive login keyword in path', 'Insecure HTTP connection', 'Credential submission script'],
    expectedVerdict: 'PHISHING',
  },
  {
    id: 'sim-4',
    title: 'Brand Impersonation / Spoofing',
    category: 'Targeted Social Engineering',
    severity: 'CRITICAL',
    url: 'http://paypal-security-update-account.com/login',
    description: 'Hyphenated domain mimicking a reputable payment provider combined with security keywords to deceive users.',
    keyIndicators: ['Brand name spoofing (PayPal)', 'Hyphen-separated lookalike domain', 'Credential harvesting path (/login)', 'High rule weight contribution'],
    expectedVerdict: 'PHISHING',
  },
  {
    id: 'sim-5',
    title: 'Credential Harvesting Pattern',
    category: 'Phishing Kit Architecture',
    severity: 'CRITICAL',
    url: 'https://appleid-support-security-recovery.xyz/auth/signin',
    description: 'Employs abused low-cost TLD (.xyz) with nested brand terms and multiple high-confidence credential keywords.',
    keyIndicators: ['Low-reputation TLD (.xyz)', 'Multiple credential keywords (signin, recovery, security)', 'Brand impersonation (AppleID)', 'High ML classification probability'],
    expectedVerdict: 'PHISHING',
  },
  {
    id: 'sim-6',
    title: 'Randomized DGA Domain',
    category: 'Algorithmic Domain Generation (DGA)',
    severity: 'HIGH',
    url: 'https://xk98qwz71mnpl0a8s7d6f5.biz/gate/auth/891/index.html',
    description: 'High Shannon entropy domain generated algorithmically by botnet infrastructure to evade blocklists.',
    keyIndicators: ['High Shannon character entropy (>3.8)', 'High numeric/alphanumeric density', 'Gate/auth staging path', 'DGA signature pattern'],
    expectedVerdict: 'SUSPICIOUS',
  },
];

export const SimulationsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRunSimulation = (url: string) => {
    navigate('/scanner', { state: { targetUrl: url } });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
          <Zap className="w-8 h-8 text-cyan-400" />
          <span>Interactive Attack Vector Simulations</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Simulate real-world phishing scenarios and observe how PhishGuard decomposes each structural threat vector.
        </p>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-start gap-3 text-xs text-cyan-200">
        <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-cyan-300 block font-bold mb-1">SAFE LAB ENVIRONMENT</strong>
          All simulation URLs are strictly evaluated via static feature analysis and do not connect to live servers. Click
          <strong> "Launch Threat Analysis"</strong> on any scenario to test the full end-to-end detection pipeline.
        </div>
      </div>

      {/* Simulation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SIMULATION_SCENARIOS.map((sim) => (
          <div key={sim.id} className="cyber-card p-6 flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  {sim.category}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                    sim.expectedVerdict === 'SAFE'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : sim.expectedVerdict === 'SUSPICIOUS'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  Expected: {sim.expectedVerdict}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                {sim.title}
              </h3>

              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-slate-300 break-all select-all">
                {sim.url}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {sim.description}
              </p>

              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block">
                  Simulated Threat Signals:
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {sim.keyIndicators.map((ind, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>{ind}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <button
                onClick={() => handleRunSimulation(sim.url)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 text-xs font-bold transition-all shadow-sm group-hover:shadow-cyan-500/20"
              >
                <Zap className="w-4 h-4" />
                Launch Threat Analysis
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
