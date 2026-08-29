import React, { useState } from 'react';
import { scanService } from '../services/api';
import { ScanCompareResponse } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { RiskGauge } from '../components/RiskGauge';
import {
  GitCompare,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Scale,
  Sparkles,
} from 'lucide-react';

export const ComparePage: React.FC = () => {
  const [urlA, setUrlA] = useState<string>('https://paypal.com/signin');
  const [urlB, setUrlB] = useState<string>('http://paypal-security-update-account.com/login');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<ScanCompareResponse | null>(null);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlA.trim() || !urlB.trim()) {
      setError('Please provide two valid URLs for comparative analysis.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await scanService.compareUrls(urlA.trim(), urlB.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to complete URL comparison.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
          <GitCompare className="w-8 h-8 text-cyan-400" />
          <span>Side-by-Side URL Threat Comparison</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform comparative differential forensics to detect typosquatting, brand spoofing, and entropy variations.
        </p>
      </div>

      {/* Inputs Form Card */}
      <div className="cyber-card p-6 sm:p-8 space-y-6">
        <form onSubmit={handleCompare} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* URL A Input */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Baseline URL A (e.g. Official Domain)
              </label>
              <input
                type="text"
                value={urlA}
                onChange={(e) => setUrlA(e.target.value)}
                placeholder="https://official-brand.com"
                className="w-full bg-[#090d16] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>

            {/* URL B Input */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Suspect URL B (e.g. Lookalike / Phish)
              </label>
              <input
                type="text"
                value={urlB}
                onChange={(e) => setUrlB(e.target.value)}
                placeholder="http://brand-security-login.xyz"
                className="w-full bg-[#090d16] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !urlA.trim() || !urlB.trim()}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Comparing Indicators...
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4" />
                  Execute Differential Comparison
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Comparison Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Delta Banner */}
          <div className="cyber-card p-6 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/20 border-cyan-500/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Differential Threat Assessment</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Risk Delta: <strong className="text-amber-400 font-mono">{result.risk_delta} pts</strong> • 
                    Safer Target: <strong className="text-emerald-400 font-mono ml-1">{result.safer_url}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dual Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target A Card */}
            <div className="cyber-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold uppercase text-cyan-400">Target A Analysis</span>
                <RiskBadge verdict={result.scan_a.classification} size="md" />
              </div>
              <div className="font-mono text-xs text-slate-200 bg-slate-900 p-3 rounded-lg break-all border border-slate-800">
                {result.scan_a.url}
              </div>
              <div className="flex justify-center py-2">
                <RiskGauge score={result.scan_a.risk_score} classification={result.scan_a.classification} size={150} />
              </div>
              <div className="text-xs text-slate-400 space-y-1 font-mono">
                <div>ML Phish Prob: <strong className="text-slate-200">{(result.scan_a.ml_probability * 100).toFixed(1)}%</strong></div>
                <div>Rule Engine Score: <strong className="text-slate-200">{result.scan_a.rule_score}/100</strong></div>
              </div>
            </div>

            {/* Target B Card */}
            <div className="cyber-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold uppercase text-rose-400">Target B Analysis</span>
                <RiskBadge verdict={result.scan_b.classification} size="md" />
              </div>
              <div className="font-mono text-xs text-slate-200 bg-slate-900 p-3 rounded-lg break-all border border-slate-800">
                {result.scan_b.url}
              </div>
              <div className="flex justify-center py-2">
                <RiskGauge score={result.scan_b.risk_score} classification={result.scan_b.classification} size={150} />
              </div>
              <div className="text-xs text-slate-400 space-y-1 font-mono">
                <div>ML Phish Prob: <strong className="text-slate-200">{(result.scan_b.ml_probability * 100).toFixed(1)}%</strong></div>
                <div>Rule Engine Score: <strong className="text-slate-200">{result.scan_b.rule_score}/100</strong></div>
              </div>
            </div>
          </div>

          {/* Comparative Feature Matrix Table */}
          <div className="cyber-card p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Comparative Feature Differential Matrix</h3>
              <p className="text-xs text-slate-400">Granular divergence across structural and lexical vectors</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase text-slate-400 tracking-wider font-mono">
                    <th className="pb-3 px-3">Vector / Feature</th>
                    <th className="pb-3 px-3">Target A Value</th>
                    <th className="pb-3 px-3">Target B Value</th>
                    <th className="pb-3 px-3 text-right">Risk Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {result.feature_diffs.map((diff, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-cyan-400 capitalize">
                        {diff.feature.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-3 text-slate-200">
                        {String(diff.value_a)}
                      </td>
                      <td className="py-3 px-3 text-slate-200">
                        {String(diff.value_b)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {diff.verdict === 'EQUAL' ? (
                          <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            Identical
                          </span>
                        ) : diff.verdict === 'B_RISKIER' ? (
                          <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                            B Significantly Higher Risk
                          </span>
                        ) : diff.verdict === 'A_RISKIER' ? (
                          <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold">
                            A Higher Risk
                          </span>
                        ) : (
                          <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
                            Divergent
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
