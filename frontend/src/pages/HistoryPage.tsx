import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scanService } from '../services/api';
import { PaginatedScans, ThreatVerdict } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { formatDateTime } from '../utils/formatters';
import {
  History,
  Search,
  Filter,
  ArrowUpDown,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PaginatedScans | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [classification, setClassification] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('timestamp');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  const fetchScans = async () => {
    setLoading(true);
    try {
      const res = await scanService.getScans({
        page,
        limit: 10,
        search: search.trim() || undefined,
        classification: classification || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setData(res);
    } catch (err) {
      console.error('Error loading scans history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [page, classification, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchScans();
  };

  const handleExportCsv = () => {
    if (!data || !data.items.length) return;
    const headers = ['ID', 'URL', 'Domain', 'Classification', 'Risk Score', 'ML Probability', 'Timestamp'];
    const rows = data.items.map((s) => [
      s.id,
      `"${s.url.replace(/"/g, '""')}"`,
      s.domain || '',
      s.classification,
      s.risk_score,
      s.ml_probability,
      s.timestamp,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `phishguard_scans_page_${page}.csv`);
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <History className="w-8 h-8 text-cyan-400" />
            <span>Scan Telemetry History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete audit trail of submitted URLs, heuristic evaluations, and risk classifications.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={!data?.items?.length}
          className="self-start md:self-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="cyber-card p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by URL or Domain..."
              className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Classification Filter */}
          <div>
            <select
              value={classification}
              onChange={(e) => {
                setClassification(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="">All Classifications</option>
              <option value="SAFE">Safe Only</option>
              <option value="SUSPICIOUS">Suspicious Only</option>
              <option value="PHISHING">Phishing Only</option>
            </select>
          </div>

          {/* Sort By Field */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="timestamp">Sort by Date</option>
              <option value="risk_score">Sort by Risk Score</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex gap-2">
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setPage(1);
              }}
              className="flex-1 bg-[#090d16] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="desc">Descending (High/Newest)</option>
              <option value="asc">Ascending (Low/Oldest)</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* History Table Card */}
      <div className="cyber-card p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase text-slate-400 tracking-wider">
                <th className="pb-3 px-3 font-semibold">Incident ID</th>
                <th className="pb-3 px-3 font-semibold">Target URL / Domain</th>
                <th className="pb-3 px-3 font-semibold">Classification</th>
                <th className="pb-3 px-3 font-semibold">Risk Index</th>
                <th className="pb-3 px-3 font-semibold">ML Phish Prob</th>
                <th className="pb-3 px-3 font-semibold">Timestamp</th>
                <th className="pb-3 px-3 font-semibold text-right">Investigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-cyan-400 font-mono">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Querying Telemetry Database...
                  </td>
                </tr>
              ) : data?.items && data.items.length > 0 ? (
                data.items.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-3 font-mono text-xs font-bold text-cyan-400">
                      #PG-{scan.id.toString().padStart(6, '0')}
                    </td>
                    <td className="py-3 px-3 max-w-sm">
                      <div className="font-mono text-xs text-slate-200 truncate font-medium">
                        {scan.url}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {scan.domain || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <RiskBadge verdict={scan.classification} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-xs whitespace-nowrap">
                      <span className={scan.risk_score >= 60 ? 'text-rose-400' : (scan.risk_score >= 30 ? 'text-amber-400' : 'text-emerald-400')}>
                        {scan.risk_score} / 100
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-300 whitespace-nowrap">
                      {(scan.ml_probability * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-400 font-mono whitespace-nowrap">
                      {formatDateTime(scan.timestamp)}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/scan/${scan.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-xs font-semibold transition-all"
                      >
                        Inspect
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-500 italic">
                    No scans matching the selected filters were found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400 font-mono">
            <div>
              Showing {((page - 1) * data.limit) + 1} - {Math.min(page * data.limit, data.total)} of {data.total} Scans
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-bold text-slate-200">
                {page} / {data.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, data.pages))}
                disabled={page >= data.pages}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
