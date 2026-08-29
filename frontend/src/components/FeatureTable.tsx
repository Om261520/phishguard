import React from 'react';
import { FeatureItem } from '../types';
import { Layers, Info } from 'lucide-react';

interface FeatureTableProps {
  features: FeatureItem[];
}

export const FeatureTable: React.FC<FeatureTableProps> = ({ features }) => {
  return (
    <div className="cyber-card p-6 space-y-4">
      <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-100">Extracted URL Features</h3>
          <p className="text-xs text-slate-400">Static structural and cryptographic URL parameters</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase text-slate-400 tracking-wider">
              <th className="pb-3 px-3 font-semibold">Feature Key</th>
              <th className="pb-3 px-3 font-semibold">Extracted Value</th>
              <th className="pb-3 px-3 font-semibold">Cybersecurity Significance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {features.map((feat, idx) => (
              <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-cyan-400 text-xs whitespace-nowrap">
                  {feat.feature_name}
                </td>
                <td className="py-2.5 px-3 text-xs text-slate-200 font-bold max-w-[200px] truncate">
                  {feat.feature_value}
                </td>
                <td className="py-2.5 px-3 font-sans text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span>{feat.significance || 'Standard statistical indicator'}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
