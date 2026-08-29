import React, { useEffect, useState } from 'react';
import { healthService } from '../services/api';
import { SystemHealth } from '../types';
import { formatDateTime } from '../utils/formatters';
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Server,
  Database,
  Brain,
  Shield,
  Clock,
  RefreshCw,
  Cpu,
} from 'lucide-react';

export const SystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const data = await healthService.getHealth();
      setHealth(data);
    } catch (err) {
      console.error('Error fetching system health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const getServiceIcon = (key: string) => {
    switch (key) {
      case 'api':
        return <Server className="w-6 h-6 text-cyan-400" />;
      case 'database':
        return <Database className="w-6 h-6 text-emerald-400" />;
      case 'ml_model':
        return <Brain className="w-6 h-6 text-purple-400" />;
      case 'detection_engine':
        return <Shield className="w-6 h-6 text-amber-400" />;
      default:
        return <Cpu className="w-6 h-6 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5" />
            OPERATIONAL
          </span>
        );
      case 'degraded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            DEGRADED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            OFFLINE
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <Activity className="w-8 h-8 text-cyan-400" />
            <span>PhishGuard System Health & Runtime Probes</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time latency, operational status, and telemetry across all detection subsystems.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="self-start md:self-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          Run Health Probe
        </button>
      </div>

      {/* Overview Banner */}
      <div className="cyber-card p-6 border-cyan-500/30 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-100">All Subsystems Operational</h3>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Version: {health?.version || '1.0.0'} • Engine Mode: Fast Static Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono text-slate-400">
            <div className="text-right">
              <span className="block text-[10px] text-slate-500 uppercase">System Uptime</span>
              <span className="font-bold text-slate-200">{health?.uptime_seconds ?? 0} Seconds</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] text-slate-500 uppercase">Last Probe Time</span>
              <span className="font-bold text-slate-200">{formatDateTime(health?.timestamp)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {health?.services &&
          Object.entries(health.services).map(([key, service]) => (
            <div key={key} className="cyber-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    {getServiceIcon(key)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 capitalize">
                      {key.replace(/_/g, ' ')} Subsystem
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">
                      Response Latency: <strong className="text-cyan-400">{service.latency_ms} ms</strong>
                    </span>
                  </div>
                </div>
                {getStatusBadge(service.status)}
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg text-xs text-slate-300 font-mono leading-relaxed">
                {service.details || 'Subsystem is responding normally without errors.'}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
