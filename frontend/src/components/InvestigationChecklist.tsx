import React, { useState } from 'react';
import { ClipboardCheck, CheckSquare, Square, ExternalLink } from 'lucide-react';

const DEFAULT_CHECKLIST_ITEMS = [
  { id: '1', task: 'Verify domain registration age & WHOIS registrant record', critical: true },
  { id: '2', task: 'Inspect SSL/TLS certificate issuer and Subject Alternative Names (SAN)', critical: false },
  { id: '3', task: 'Cross-reference domain/IP against Threat Intelligence IOC feeds', critical: true },
  { id: '4', task: 'Check for typosquatting / IDN homograph character substitution', critical: false },
  { id: '5', task: 'Confirm whether corporate or banking credentials were requested', critical: true },
  { id: '6', task: 'Review URL parameters for open-redirect or token passing', critical: false },
  { id: '7', task: 'Determine if DNS A record maps to known bulletproof hosting/cloud proxy', critical: true },
  { id: '8', task: 'Trigger perimeter firewall / EDR domain block rule if confirmed phishing', critical: true },
];

export const InvestigationChecklist: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    '1': true,
    '3': true,
  });

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPct = Math.round((completedCount / DEFAULT_CHECKLIST_ITEMS.length) * 100);

  return (
    <div className="cyber-card p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">SOC Analyst Investigation Checklist</h3>
            <p className="text-xs text-slate-400">Standard operational triage playbook for suspicious URLs</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-bold text-cyan-400">
            {completedCount}/{DEFAULT_CHECKLIST_ITEMS.length} Completed ({progressPct}%)
          </span>
          <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {DEFAULT_CHECKLIST_ITEMS.map((item) => {
          const isChecked = !!checkedItems[item.id];
          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer select-none ${
                isChecked
                  ? 'bg-cyan-950/20 border-cyan-500/30 text-slate-200'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                )}
                <span className={`text-xs sm:text-sm font-medium ${isChecked ? 'line-through text-slate-400' : ''}`}>
                  {item.task}
                </span>
              </div>
              {item.critical && (
                <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 ml-2 flex-shrink-0">
                  Critical
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
