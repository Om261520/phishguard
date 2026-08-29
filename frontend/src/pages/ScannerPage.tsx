import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { scanService } from '../services/api';
import { ScanDetail } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { RiskGauge } from '../components/RiskGauge';
import { ExplainabilityCard } from '../components/ExplainabilityCard';
import {
  Shield,
  Search,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  Lock,
  RefreshCw,
  ExternalLink,
  Info,
  ListPlus,
  Play,
  CheckCircle2,
  AlertOctagon,
  FileText,
} from 'lucide-react';

const PRESET_URLS = [
  { label: 'Legitimate Google', url: 'https://www.google.com/search?q=cybersecurity+defense', type: 'safe' },
  { label: 'Legitimate GitHub', url: 'https://github.com/login', type: 'safe' },
  { label: 'PayPal Impersonation', url: 'http://paypal-security-update-account.com/login', type: 'phish' },
  { label: 'IP Credential Stealer', url: 'http://192.168.1.105/verify-password.php', type: 'phish' },
  { label: 'High Entropy DGA Malware', url: 'https://xk98qwz71mnpl0a8s7d6f5.biz/auth/gate', type: 'phish' },
  { label: 'Chase Subdomain Spoof', url: 'http://chase.online.verify.banking-update.xyz/signin', type: 'phish' },
  { label: 'Crypto Wallet Drainer', url: 'https://metamask-security-airdrop-claim.io/connect', type: 'phish' },
  { label: 'Open Redirect Bypass', url: 'https://legit-portal.com/redirect?url=http://malicious-payload.net', type: 'suspicious' },
];

export const ScannerPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const [url, setUrl] = useState<string>('');
  const [batchInput, setBatchInput] = useState<string>(
    'https://www.google.com/finance\nhttp://paypal-security-update-account.com/login\nhttp://192.168.1.105/verify-password.php\nhttps://github.com/explore'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<ScanDetail | null>(null);
  const [batchResults, setBatchResults] = useState<ScanDetail[]>([]);
  const [batchProgress, setBatchProgress] = useState<number>(0);

  // Check if URL passed from Dashboard
  useEffect(() => {
    if (location.state && (location.state as any).targetUrl) {
      const target = (location.state as any).targetUrl;
      setUrl(target);
      executeScan(target);
    }
  }, [location.state]);

  const executeScan = async (targetUrl: string) => {
    if (!targetUrl.trim()) {
      setError('Please enter a valid URL to analyze.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await scanService.scanUrl(targetUrl.trim());
      setResult(data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          'Failed to complete static analysis. Please check URL syntax and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBatchScan = async () => {
    const urls = batchInput
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (urls.length === 0) {
      setError('Please enter at least one URL for batch inspection.');
      return;
    }

    setLoading(true);
    setError('');
    setBatchResults([]);
    setBatchProgress(0);

    const completed: ScanDetail[] = [];
    for (let i = 0; i < urls.length; i++) {
      try {
        const data = await scanService.scanUrl(urls[i]);
        completed.push(data);
        setBatchResults([...completed]);
      } catch (err) {
        console.error('Batch scan error for URL:', urls[i], err);
      }
      setBatchProgress(Math.round(((i + 1) / urls.length) * 100));
    }

    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeScan(url);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            <span>AI-Powered URL Security Scanner</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Perform multi-layered static threat analysis combining 12 security heuristics and Random Forest machine learning classification.
          </p>
        </div>

        {/* Single / Batch Mode Switcher */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'single'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Single URL Scan
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'batch'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListPlus className="w-3.5 h-3.5" />
            Batch Scanner
          </button>
        </div>
      </div>

      {/* Main Single URL Input Card */}
      {activeTab === 'single' ? (
        <div className="cyber-card p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2">
                Target URL Analysis Input
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter a URL for security analysis (e.g., https://paypal-security-verification.com/login)..."
                  className="w-full bg-[#090d16] border border-slate-700/80 rounded-xl pl-12 pr-4 py-4 text-sm sm:text-base text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Preset Attack Sample Quick Buttons */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                Quick Test Pre-Configured Samples (1-Click Run):
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_URLS.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => {
                      setUrl(sample.url);
                      executeScan(sample.url);
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all font-mono flex items-center gap-1.5 ${
                      sample.type === 'safe'
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 hover:border-emerald-500'
                        : sample.type === 'suspicious'
                        ? 'bg-amber-950/20 border-amber-500/30 text-amber-300 hover:border-amber-500'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-300 hover:border-rose-500'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        sample.type === 'safe'
                          ? 'bg-emerald-400'
                          : sample.type === 'suspicious'
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                    />
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Strictly non-invasive static feature analysis</span>
              </div>

              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing Features...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Analyze URL
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Batch Scanner Card */
        <div className="cyber-card p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Batch URL Forensic Queue (One URL per line)
            </label>
            <textarea
              rows={5}
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder="https://example.com/one\nhttps://example.com/two"
              className="w-full bg-[#090d16] border border-slate-700/80 rounded-xl p-4 text-xs sm:text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              disabled={loading}
            />
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Executing Batch Pipeline ({batchProgress}%)</span>
                <span>{batchResults.length} analyzed</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${batchProgress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleBatchScan}
              disabled={loading || !batchInput.trim()}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Batch Scan...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Execute Batch Scan
                </>
              )}
            </button>
          </div>

          {/* Batch Results Table */}
          {batchResults.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-800 animate-fadeIn">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
                Batch Forensic Results ({batchResults.length})
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Target URL</th>
                      <th className="p-3">Verdict</th>
                      <th className="p-3">Risk Score</th>
                      <th className="p-3">ML Probability</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-[#090d16]/60">
                    {batchResults.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-900/50">
                        <td className="p-3 text-slate-200 max-w-xs truncate">{r.url}</td>
                        <td className="p-3">
                          <RiskBadge verdict={r.classification} size="sm" />
                        </td>
                        <td className="p-3 font-bold text-cyan-400">{r.risk_score}/100</td>
                        <td className="p-3 text-slate-300">{(r.ml_probability * 100).toFixed(1)}%</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => navigate(`/scan/${r.id}`)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                          >
                            Inspect
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mandatory Cybersecurity Disclaimer Banner */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-amber-200/90 leading-relaxed">
          <strong className="text-amber-400 font-bold uppercase tracking-wider block">
            IMPORTANT SECURITY NOTICE
          </strong>
          PhishGuard performs zero-interaction static analysis. A "Safe" result does NOT guarantee that a website is completely safe.
          Always verify suspicious domains independently using multiple threat intelligence sources before trusting credentials.
        </div>
      </div>

      {/* Single Analysis Results Display */}
      {result && activeTab === 'single' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Verdict Overview Card */}
          <div className="cyber-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono uppercase text-slate-400">Security Verdict:</span>
                  <RiskBadge verdict={result.classification} size="lg" />
                </div>
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg font-mono text-sm text-cyan-300 break-all select-all">
                  {result.url}
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400">
                  <div><strong>Domain:</strong> {result.domain || 'N/A'}</div>
                  <div><strong>Protocol:</strong> <span className="uppercase text-slate-300">{result.protocol}</span></div>
                  <div><strong>Scan ID:</strong> #{result.id}</div>
                </div>
              </div>

              {/* Radial Risk Gauge */}
              <div className="flex flex-col items-center justify-center">
                <RiskGauge score={result.risk_score} classification={result.classification} size={170} />
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="p-4 bg-slate-900/70 border-l-4 border-cyan-500 rounded-r-lg space-y-1">
              <strong className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
                SOC Analyst Recommendation
              </strong>
              <p className="text-sm text-slate-200 font-sans leading-relaxed">
                {result.recommendation}
              </p>
            </div>

            {/* Full Report Link CTA */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => navigate(`/scan/${result.id}`)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
              >
                Deep-Dive Security Investigation
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Explainable AI Component */}
          {result.explainable_analysis && (
            <ExplainabilityCard analysis={result.explainable_analysis} />
          )}
        </div>
      )}
    </div>
  );
};
