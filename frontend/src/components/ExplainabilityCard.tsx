import React from 'react';
import { ExplainableAnalysis } from '../types';
import { Sparkles, Brain, Scale, AlertCircle, CheckCircle } from 'lucide-react';
import { getSeverityBadge } from '../utils/formatters';

interface ExplainabilityCardProps {
  analysis?: ExplainableAnalysis;
}

export const ExplainabilityCard: React.FC<ExplainabilityCardProps> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="cyber-card p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Explainable AI & Threat Breakdown</h3>
            <p className="text-xs text-slate-400">Auditable risk rationale and contributing factor attribution</p>
          </div>
        </div>
      </div>

      {/* Model & Rule Dual Engine Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-purple-400" />
              Random Forest ML Inference
            </span>
            <span className="text-xs font-mono font-bold text-purple-400">
              {(analysis.phishing_probability * 100).toFixed(1)}% Phish
            </span>
          </div>
          {/* Dual probability bar */}
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${analysis.benign_probability * 100}%` }}
              title={`Benign: ${(analysis.benign_probability * 100).toFixed(1)}%`}
            />
            <div
              className="bg-rose-500 transition-all duration-500"
              style={{ width: `${analysis.phishing_probability * 100}%` }}
              title={`Phishing: ${(analysis.phishing_probability * 100).toFixed(1)}%`}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5 font-mono">
            <span className="text-emerald-400">Benign: {(analysis.benign_probability * 100).toFixed(1)}%</span>
            <span className="text-rose-400">Phishing: {(analysis.phishing_probability * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-cyan-400" />
              Rule-Based Risk Score
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {analysis.rule_risk_score} / 100
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(analysis.rule_risk_score, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
            <span>Modular Rule Coverage</span>
            <span className="text-slate-300 font-mono">Weight: 45%</span>
          </div>
        </div>
      </div>

      {/* Why is this URL flagged? Bullet list */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          Detected Threat Reasoning & Behavioral Indicators
        </h4>
        <div className="space-y-2">
          {analysis.reasons.map((reason, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg text-sm text-slate-300"
            >
              <div className="mt-0.5 text-cyan-400 font-mono text-xs font-bold px-1.5 py-0.5 bg-cyan-500/10 rounded">
                0{idx + 1}
              </div>
              <span className="flex-1 leading-relaxed">{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contributing Factors Weighted List */}
      {analysis.contributing_factors && analysis.contributing_factors.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            Quantified Scoring Contributions
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {analysis.contributing_factors.map((factor, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800/60 rounded-md"
              >
                <span className="text-xs text-slate-200 truncate pr-2 font-medium">{factor.factor}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${getSeverityBadge(factor.category)}`}>
                  +{factor.score} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
