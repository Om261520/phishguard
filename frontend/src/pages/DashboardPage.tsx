import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/api';
import { DashboardStats } from '../types';
import { StatCard } from '../components/StatCard';
import { RiskBadge } from '../components/RiskBadge';
import { formatDateTime } from '../utils/formatters';
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Flame,
  Activity,
  ArrowRight,
  TrendingUp,
  Search,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quickUrl, setQuickUrl] = useState<string>('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;
    navigate('/scanner', { state: { targetUrl: quickUrl.trim() } });
  };

  return (
    <div className="space-y-8">
      {/* Header & Quick Scan Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <span>SOC Security Dashboard</span>
            <span className="text-xs px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full font-mono">
              Live Telemetry
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time phishing detection telemetry, ML model classifications, and heuristic threat indicators.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="self-start md:self-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* Quick URL Scanner Banner */}
      <div className="cyber-card p-6 border-cyan-500/30 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/20">
        <form onSubmit={handleQuickScan} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              placeholder="Enter suspicious URL for instant static security analysis (e.g. paypal-verify-account.com)..."
              className="w-full bg-[#090d16] border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex-shrink-0"
          >
            <Shield className="w-4 h-4" />
            Analyze URL
          </button>
        </form>
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Scans"
          value={stats?.total_scanned ?? 0}
          icon={Activity}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/10"
          subtitle="Analyzed endpoints"
        />
        <StatCard
          title="Safe URLs"
          value={stats?.safe_count ?? 0}
          icon={ShieldCheck}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
          subtitle="Clean structural profile"
        />
        <StatCard
          title="Suspicious"
          value={stats?.suspicious_count ?? 0}
          icon={AlertTriangle}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
          subtitle="Anomalous signals"
        />
        <StatCard
          title="Phishing URLs"
          value={stats?.phishing_count ?? 0}
          icon={ShieldAlert}
          iconColor="text-rose-400"
          iconBg="bg-rose-500/10"
          subtitle="Active threat vectors"
        />
        <StatCard
          title="Avg Risk Score"
          value={`${stats?.avg_risk_score ?? 0}/100`}
          icon={TrendingUp}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10"
          subtitle="Across all telemetry"
        />
        <StatCard
          title="High Risk Alerts"
          value={stats?.high_risk_count ?? 0}
          icon={Flame}
          iconColor="text-orange-400"
          iconBg="bg-orange-500/10"
          subtitle="Score >= 60"
        />
      </div>

      {/* Charts Grid 1: Line Chart & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scans Over Time Line Chart (2 Cols) */}
        <div className="cyber-card p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-100">Scan Activity Over Time</h3>
              <p className="text-xs text-slate-400">Daily breakdown of Safe, Suspicious, and Phishing classifications</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Safe
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Suspicious
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Phishing
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.scans_over_time || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Line type="monotone" dataKey="safe" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 3 }} />
                <Line type="monotone" dataKey="suspicious" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 3 }} />
                <Line type="monotone" dataKey="phishing" stroke="#f43f5e" strokeWidth={2.5} dot={{ fill: '#f43f5e', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Classification Donut Chart (1 Col) */}
        <div className="cyber-card p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-100">Verdict Distribution</h3>
            <p className="text-xs text-slate-400">Proportion of security classifications</p>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.classification_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats?.classification_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-slate-100">{stats?.total_scanned ?? 0}</span>
              <span className="text-[10px] uppercase font-mono text-slate-400">Total Scanned</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono">
            {stats?.classification_distribution.map((c) => (
              <div key={c.name} className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <div className="font-bold" style={{ color: c.color }}>{c.value}</div>
                <div className="text-[10px] text-slate-400">{c.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Grid 2: Risk Tier Distribution & Top Triggered Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Bar Chart */}
        <div className="cyber-card p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-100">Risk Score Tier Distribution</h3>
            <p className="text-xs text-slate-400">Scans categorized by multi-factor threat index</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.risk_distribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stats?.risk_distribution.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Triggered Rules */}
        <div className="cyber-card p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-100">Top Triggered Security Rules</h3>
            <p className="text-xs text-slate-400">Most frequent heuristic detection triggers</p>
          </div>

          <div className="space-y-3">
            {stats?.top_triggered_rules && stats.top_triggered_rules.length > 0 ? (
              stats.top_triggered_rules.map((rule) => (
                <div key={rule.rule_id} className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-400">{rule.rule_id}</span>
                      <span className="text-xs font-medium text-slate-200">{rule.rule_name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      Severity: <span className="text-amber-400">{rule.severity}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-rose-400 px-2 py-0.5 bg-rose-500/10 rounded border border-rose-500/20">
                      {rule.count} {rule.count === 1 ? 'Hit' : 'Hits'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-8">
                No security rules triggered yet. Run sample scans to populate data.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="cyber-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100">Recent Telemetry & Investigations</h3>
            <p className="text-xs text-slate-400">Latest URL security analyses recorded in database</p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            View All Scans
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase text-slate-400 tracking-wider">
                <th className="pb-3 px-3 font-semibold">Target URL / Domain</th>
                <th className="pb-3 px-3 font-semibold">Classification</th>
                <th className="pb-3 px-3 font-semibold">Risk Score</th>
                <th className="pb-3 px-3 font-semibold">ML Phish Prob</th>
                <th className="pb-3 px-3 font-semibold">Timestamp</th>
                <th className="pb-3 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stats?.recent_scans && stats.recent_scans.length > 0 ? (
                stats.recent_scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-mono text-xs text-slate-200 max-w-sm truncate font-medium">
                        {scan.url}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {scan.domain || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge verdict={scan.classification} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-xs">
                      <span className={scan.risk_score >= 60 ? 'text-rose-400' : (scan.risk_score >= 30 ? 'text-amber-400' : 'text-emerald-400')}>
                        {scan.risk_score} / 100
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-300">
                      {(scan.ml_probability * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-400 font-mono">
                      {formatDateTime(scan.timestamp)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/scan/${scan.id}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-xs font-semibold transition-all"
                      >
                        Inspect
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-500 italic">
                    No scan telemetry available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
