import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { threatIntelService } from '../services/api';
import { ThreatIndicator } from '../types';
import { formatDateTime } from '../utils/formatters';
import {
  Radio,
  Search,
  Filter,
  ShieldAlert,
  Globe,
  Server,
  Hash,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Database,
} from 'lucide-react';

export const ThreatIntelPage: React.FC = () => {
  const navigate = useNavigate();
  const [indicators, setIndicators] = useState<ThreatIndicator[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const fetchIndicators = async () => {
    setLoading(true);
    try {
      const data = await threatIntelService.getThreatIndicators({
        search: search.trim() || undefined,
        indicator_type: typeFilter || undefined,
      });
      setIndicators(data);
    } catch (err) {
      console.error('Error fetching threat intel:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, [typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIndicators();
  };

  const getIndicatorIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'URL':
        return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'DOMAIN':
        return <Radio className="w-4 h-4 text-purple-400" />;
      case 'IP':
        return <Server className="w-4 h-4 text-orange-400" />;
      case 'HASH':
        return <Hash className="w-4 h-4 text-rose-400" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleScanIndicator = (ind: ThreatIndicator) => {
    if (ind.indicator_type === 'URL' || ind.indicator_type === 'DOMAIN') {
      navigate('/scanner', { state: { targetUrl: ind.indicator } });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <Radio className="w-8 h-8 text-cyan-400" />
            <span>Threat Intelligence Feed & IOC Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global repository of known malicious indicators of compromise (IOCs) and attack signatures.
          </p>
        </div>

        {/* DEMO DATA Banner Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full text-xs font-mono font-bold">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>SIMULATED DEMO DATA</span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="cyber-card p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search threat indicators, malicious domains, IP addresses, or SHA-256 hashes..."
              className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#090d16] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="">All IOC Types</option>
              <option value="URL">URL</option>
              <option value="DOMAIN">Domain</option>
              <option value="IP">IP Address</option>
              <option value="HASH">SHA-256 Hash</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Indicators Grid */}
      <div className="cyber-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100">
              Active IOC Stream ({indicators.length} Records)
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase text-slate-400 tracking-wider font-mono">
                <th className="pb-3 px-3">Type</th>
                <th className="pb-3 px-3">Indicator String</th>
                <th className="pb-3 px-3">Threat Category</th>
                <th className="pb-3 px-3">Confidence</th>
                <th className="pb-3 px-3">Source Attribution</th>
                <th className="pb-3 px-3">Last Seen</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-cyan-400 font-mono">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Querying Threat Intelligence Feeds...
                  </td>
                </tr>
              ) : indicators.length > 0 ? (
                indicators.map((ioc) => (
                  <tr key={ioc.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-mono font-bold text-slate-300">
                        {getIndicatorIcon(ioc.indicator_type)}
                        {ioc.indicator_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-200 max-w-sm truncate font-medium">
                      {ioc.indicator}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-semibold">
                        {ioc.threat_category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-rose-400 whitespace-nowrap">
                      {ioc.confidence}%
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono whitespace-nowrap">
                      {ioc.source}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono whitespace-nowrap">
                      {formatDateTime(ioc.last_seen)}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {(ioc.indicator_type === 'URL' || ioc.indicator_type === 'DOMAIN') && (
                        <button
                          onClick={() => handleScanIndicator(ioc)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-xs font-semibold transition-all"
                        >
                          Scan
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-500 italic">
                    No threat indicators matched your search.
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
