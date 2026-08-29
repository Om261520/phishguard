import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  History,
  GitCompare,
  Radio,
  Zap,
  Activity,
  FileCode,
  Lock,
} from 'lucide-react';
import { cn } from '../utils/formatters';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'URL Scanner', path: '/scanner', icon: ShieldCheck, badge: 'Core' },
  { name: 'Scan History', path: '/history', icon: History },
  { name: 'URL Comparison', path: '/compare', icon: GitCompare },
  { name: 'Threat Intel', path: '/threat-intelligence', icon: Radio, badge: 'Live' },
  { name: 'Attack Simulations', path: '/simulations', icon: Zap },
  { name: 'System Health', path: '/system-health', icon: Activity },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0a0f19] flex flex-col justify-between py-6 px-3 min-h-[calc(100vh-4rem)] flex-shrink-0">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">
            SOC ANALYST MODULES
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group',
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            'w-4 h-4 transition-transform group-hover:scale-110',
                            isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                          )}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase',
                            isActive
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'bg-slate-800 text-slate-400'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Documentation Section */}
        <div>
          <p className="px-3 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">
            DEVELOPER & API
          </p>
          <nav className="space-y-1">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 transition-all border border-transparent group"
            >
              <div className="flex items-center gap-3">
                <FileCode className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                <span>FastAPI Swagger UI</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-800 text-slate-400">
                REST
              </span>
            </a>
          </nav>
        </div>
      </div>

      {/* Safety Notice Footer Card */}
      <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2 text-slate-400 text-[11px]">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <Lock className="w-3.5 h-3.5" />
          <span>Zero-Interaction Mode</span>
        </div>
        <p className="leading-relaxed text-slate-400">
          All analysis is strictly static & non-invasive. No outbound requests are sent to destination IPs.
        </p>
      </div>
    </aside>
  );
};
