import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { scanService, reportService } from '../services/api';
import { ScanDetail } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { RiskGauge } from '../components/RiskGauge';
import { ExplainabilityCard } from '../components/ExplainabilityCard';
import { DetectionRuleTable } from '../components/DetectionRuleTable';
import { FeatureTable } from '../components/FeatureTable';
import { InvestigationChecklist } from '../components/InvestigationChecklist';
import { AnalystNotesCard } from '../components/AnalystNotesCard';
import { formatDateTime } from '../utils/formatters';
import {
  Shield,
  ArrowLeft,
  Download,
  Printer,
  FileCode,
  Share2,
  Copy,
  Check,
  RefreshCw,
  AlertOctagon,
} from 'lucide-react';

export const ScanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<ScanDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const fetchScanDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await scanService.getScanById(parseInt(id, 10));
        setScan(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch scan details.');
      } finally {
        setLoading(false);
      }
    };
    fetchScanDetail();
  }, [id]);

  const handleCopyUrl = () => {
    if (scan?.url) {
      navigator.clipboard.writeText(scan.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportHtml = () => {
    if (!scan) return;
    window.open(reportService.getExportUrl(scan.id, 'html'), '_blank');
  };

  const handleExportJson = () => {
    if (!scan) return;
    window.open(reportService.getExportUrl(scan.id, 'json'), '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-cyan-400 font-mono">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400" />
          <p className="text-xs uppercase tracking-widest">Loading Forensic Telemetry...</p>
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="cyber-card p-8 text-center space-y-4 max-w-lg mx-auto my-12">
        <AlertOctagon className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-100">Scan Record Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'The requested scan ID does not exist.'}</p>
        <button
          onClick={() => navigate('/history')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-all"
        >
          Return to Scan History
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Back Button & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Telemetry
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportHtml}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 text-xs font-semibold transition-all shadow-sm"
            title="Open printable HTML / PDF report"
          >
            <Printer className="w-3.5 h-3.5" />
            Executive Report (Print/PDF)
          </button>

          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 text-xs font-semibold transition-all shadow-sm"
            title="Download JSON Report Payload"
          >
            <FileCode className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Target Master Card */}
      <div className="cyber-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase text-slate-400">Incident Classification:</span>
              <RiskBadge verdict={scan.classification} size="lg" />
            </div>

            {/* Target URL with copy button */}
            <div className="flex items-center gap-2 p-3 bg-slate-900/90 border border-slate-800 rounded-lg">
              <div className="font-mono text-sm text-cyan-300 break-all select-all flex-1">
                {scan.url}
              </div>
              <button
                onClick={handleCopyUrl}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition-colors flex-shrink-0"
                title="Copy URL"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-slate-400 pt-1">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase">Target Domain</span>
                <span className="font-bold text-slate-200">{scan.domain || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase">Protocol</span>
                <span className="font-bold uppercase text-slate-200">{scan.protocol}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase">Scan Timestamp</span>
                <span className="font-bold text-slate-200">{formatDateTime(scan.timestamp)}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase">Incident ID</span>
                <span className="font-bold text-cyan-400">#PG-{scan.id.toString().padStart(6, '0')}</span>
              </div>
            </div>
          </div>

          {/* Radial Risk Gauge */}
          <div className="flex flex-col items-center justify-center">
            <RiskGauge score={scan.risk_score} classification={scan.classification} size={180} />
          </div>
        </div>

        {/* Executive Summary & Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Executive Threat Summary
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {scan.executive_summary}
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 border-l-4 border-cyan-500 rounded-r-lg space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Actionable SOC Recommendation
            </h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              {scan.recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Explainable AI Analysis */}
      {scan.explainable_analysis && (
        <ExplainabilityCard analysis={scan.explainable_analysis} />
      )}

      {/* Detection Rules Table */}
      <DetectionRuleTable detections={scan.detections} />

      {/* Extracted Features Table */}
      <FeatureTable features={scan.features} />

      {/* SOC Analyst Playbook & Investigation Notes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InvestigationChecklist />
        <AnalystNotesCard scanId={scan.id} initialNotes={scan.notes} />
      </div>
    </div>
  );
};
