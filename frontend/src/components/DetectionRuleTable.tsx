import React, { useState } from 'react';
import { DetectionRuleItem } from '../types';
import { ShieldCheck, ShieldAlert, Filter } from 'lucide-react';
import { getSeverityBadge } from '../utils/formatters';

interface DetectionRuleTableProps {
  detections: DetectionRuleItem[];
}

export const DetectionRuleTable: React.FC<DetectionRuleTableProps> = ({ detections }) => {
  const [filterTriggeredOnly, setFilterTriggeredOnly] = useState(false);

  const displayedRules = filterTriggeredOnly
    ? detections.filter((d) => d.triggered)
    : detections;

  const triggeredCount = detections.filter((d) => d.triggered).length;

  return (
    <div className="cyber-card p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            Security Detection Rules
          </h3>
          <p className="text-xs text-slate-400">
            {triggeredCount} of {detections.length} modular heuristic rules triggered
          </p>
        </div>

        <button
          onClick={() => setFilterTriggeredOnly(!filterTriggeredOnly)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            filterTriggeredOnly
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          {filterTriggeredOnly ? 'Showing Triggered Only' : 'Show Triggered Only'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase text-slate-400 tracking-wider">
              <th className="pb-3 px-3 font-semibold">Rule ID</th>
              <th className="pb-3 px-3 font-semibold">Rule Name</th>
              <th className="pb-3 px-3 font-semibold">Status</th>
              <th className="pb-3 px-3 font-semibold">Severity</th>
              <th className="pb-3 px-3 font-semibold">Weight</th>
              <th className="pb-3 px-3 font-semibold">Description / Findings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {displayedRules.map((rule, idx) => (
              <tr
                key={rule.rule_id || idx}
                className={`transition-colors ${
                  rule.triggered
                    ? 'bg-rose-950/20 hover:bg-rose-950/30'
                    : 'hover:bg-slate-900/40'
                }`}
              >
                <td className="py-3 px-3 font-mono font-bold text-cyan-400 text-xs whitespace-nowrap">
                  {rule.rule_id}
                </td>
                <td className="py-3 px-3 font-medium text-slate-200 whitespace-nowrap">
                  {rule.rule_name}
                </td>
                <td className="py-3 px-3 whitespace-nowrap">
                  {rule.triggered ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      TRIGGERED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-800/40 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                      Passed
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 whitespace-nowrap">
                  <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold ${getSeverityBadge(rule.severity)}`}>
                    {rule.severity}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono text-xs text-amber-400 font-bold whitespace-nowrap">
                  {rule.triggered ? `+${rule.score}` : '0'}
                </td>
                <td className="py-3 px-3 text-xs text-slate-300 max-w-md leading-relaxed">
                  {rule.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
