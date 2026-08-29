import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.schemas.schemas import ScanDetailResponse


class ReportGenerator:
    @staticmethod
    def generate_json_report(scan: ScanDetailResponse, analyst_signature: str = "PhishGuard SOC Agent") -> Dict[str, Any]:
        """Generate structured JSON security analysis report."""
        return {
            "report_metadata": {
                "report_id": f"REP-PG-{scan.id:06d}",
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "analyst_signature": analyst_signature,
                "tool": "PhishGuard AI-Powered URL Detection Engine v1.0"
            },
            "target": {
                "scan_id": scan.id,
                "url": scan.url,
                "domain": scan.domain,
                "protocol": scan.protocol,
                "scan_timestamp": scan.timestamp.isoformat() if scan.timestamp else ""
            },
            "security_assessment": {
                "verdict": scan.classification,
                "composite_risk_score": scan.risk_score,
                "rule_engine_score": scan.rule_score,
                "ml_phishing_probability": scan.ml_probability,
                "ml_benign_probability": round(1.0 - scan.ml_probability, 4),
                "executive_summary": scan.executive_summary,
                "recommended_actions": scan.recommendation
            },
            "explainable_indicators": scan.explainable_analysis.model_dump() if scan.explainable_analysis else {},
            "triggered_rules": [d.model_dump() for d in scan.detections if d.triggered],
            "all_evaluated_rules": [d.model_dump() for d in scan.detections],
            "extracted_features": [f.model_dump() for f in scan.features],
            "analyst_investigation_notes": [n.model_dump() for n in scan.notes]
        }

    @staticmethod
    def generate_html_report(scan: ScanDetailResponse, analyst_signature: str = "PhishGuard SOC Agent") -> str:
        """Generate an executive, printable HTML report with dark/cyber styling."""
        triggered = [d for d in scan.detections if d.triggered]
        notes = scan.notes
        
        status_color = "#10b981" if scan.classification == "SAFE" else ("#f59e0b" if scan.classification == "SUSPICIOUS" else "#ef4444")
        
        rules_html = "".join([
            f"""
            <tr style="border-bottom: 1px solid #334155;">
                <td style="padding: 10px; font-weight: bold; color: #38bdf8;">{d.rule_id}</td>
                <td style="padding: 10px; color: #f1f5f9;">{d.rule_name}</td>
                <td style="padding: 10px;"><span style="background: rgba(239,68,68,0.2); color: #f87171; padding: 2px 8px; border-radius: 4px; font-size: 11px;">{d.severity}</span></td>
                <td style="padding: 10px; color: #fbbf24;">+{d.score}</td>
                <td style="padding: 10px; color: #94a3b8; font-size: 13px;">{d.description}</td>
            </tr>
            """ for d in triggered
        ]) if triggered else "<tr><td colspan='5' style='padding: 15px; color: #94a3b8; text-align: center;'>No security rules were triggered.</td></tr>"

        features_html = "".join([
            f"""
            <tr style="border-bottom: 1px solid #334155;">
                <td style="padding: 8px 10px; font-family: monospace; color: #38bdf8;">{f.feature_name}</td>
                <td style="padding: 8px 10px; font-family: monospace; color: #f1f5f9;">{f.feature_value}</td>
                <td style="padding: 8px 10px; color: #94a3b8; font-size: 12px;">{f.significance or 'Standard metric'}</td>
            </tr>
            """ for f in scan.features
        ])

        notes_html = "".join([
            f"""
            <div style="background: #1e293b; border-left: 3px solid #38bdf8; padding: 12px; margin-bottom: 10px; border-radius: 4px;">
                <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;"><strong>{n.username}</strong> • {n.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}</div>
                <div style="color: #f1f5f9; font-size: 14px;">{n.note}</div>
            </div>
            """ for n in notes
        ]) if notes else "<p style='color: #64748b; font-style: italic;'>No analyst investigation notes recorded.</p>"

        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>PhishGuard Security Analysis Report - #{scan.id}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            margin: 0;
            padding: 30px;
            line-height: 1.5;
        }}
        .container {{
            max-width: 900px;
            margin: 0 auto;
            background-color: #1e293b;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
            border: 1px solid #334155;
        }}
        .header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #334155;
            padding-bottom: 20px;
            margin-bottom: 25px;
        }}
        .badge {{
            display: inline-block;
            padding: 6px 16px;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 0.05em;
            background-color: {status_color};
            color: #ffffff;
        }}
        .card {{
            background-color: #0f172a;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
        }}
        h1, h2, h3 {{
            margin-top: 0;
            color: #f8fafc;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }}
        th {{
            background-color: #1e293b;
            padding: 10px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #94a3b8;
            border-bottom: 2px solid #334155;
        }}
        .kpi-grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 25px;
        }}
        .kpi-box {{
            background: #0f172a;
            border: 1px solid #334155;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }}
        .kpi-val {{
            font-size: 24px;
            font-weight: 700;
            color: #38bdf8;
        }}
        .kpi-lbl {{
            font-size: 11px;
            text-transform: uppercase;
            color: #94a3b8;
            margin-top: 4px;
        }}
        @media print {{
            body {{ background-color: #ffffff; color: #0f172a; }}
            .container {{ background-color: #ffffff; border: none; box-shadow: none; padding: 0; }}
            .card, .kpi-box {{ background-color: #f8fafc; border: 1px solid #cbd5e1; }}
            th {{ background-color: #f1f5f9; color: #475569; }}
            .kpi-val {{ color: #0284c7; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1 style="margin: 0; font-size: 24px; display: flex; align-items: center; gap: 8px;">
                    🛡️ PhishGuard Security Analysis Report
                </h1>
                <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">
                    Report ID: REP-PG-{scan.id:06d} • Generated: {datetime.now(timezone.utc).strftime('%B %d, %Y %H:%M UTC')}
                </div>
            </div>
            <div>
                <span class="badge">{scan.classification}</span>
            </div>
        </div>

        <div class="kpi-grid">
            <div class="kpi-box">
                <div class="kpi-val" style="color: {status_color};">{scan.risk_score} / 100</div>
                <div class="kpi-lbl">Risk Score</div>
            </div>
            <div class="kpi-box">
                <div class="kpi-val">{scan.classification}</div>
                <div class="kpi-lbl">Verdict</div>
            </div>
            <div class="kpi-box">
                <div class="kpi-val">{scan.ml_probability * 100:.1f}%</div>
                <div class="kpi-lbl">ML Phish Prob</div>
            </div>
            <div class="kpi-box">
                <div class="kpi-val">{len(triggered)}</div>
                <div class="kpi-lbl">Rules Triggered</div>
            </div>
        </div>

        <div class="card">
            <h3 style="color: #38bdf8; font-size: 16px; margin-bottom: 10px;">Target Information</h3>
            <div style="font-family: monospace; word-break: break-all; background: #020617; padding: 12px; border-radius: 6px; border: 1px solid #1e293b; color: #38bdf8;">
                {scan.url}
            </div>
            <div style="display: flex; gap: 30px; margin-top: 15px; font-size: 13px; color: #cbd5e1;">
                <div><strong>Domain:</strong> {scan.domain or 'N/A'}</div>
                <div><strong>Protocol:</strong> {scan.protocol.upper()}</div>
                <div><strong>Scan Date:</strong> {scan.timestamp.strftime('%Y-%m-%d %H:%M UTC') if scan.timestamp else 'N/A'}</div>
            </div>
        </div>

        <div class="card">
            <h3 style="color: #38bdf8; font-size: 16px; margin-bottom: 10px;">Executive Summary</h3>
            <p style="color: #e2e8f0; font-size: 14px; margin-bottom: 12px;">{scan.executive_summary}</p>
            <div style="background: rgba(56, 189, 248, 0.1); border-left: 4px solid #38bdf8; padding: 12px; border-radius: 4px;">
                <strong style="color: #38bdf8; font-size: 13px;">Actionable Recommendation:</strong>
                <div style="color: #f1f5f9; font-size: 13px; margin-top: 4px;">{scan.recommendation}</div>
            </div>
        </div>

        <div class="card">
            <h3 style="color: #38bdf8; font-size: 16px; margin-bottom: 15px;">Triggered Detection Rules ({len(triggered)})</h3>
            <table>
                <thead>
                    <tr>
                        <th>Rule ID</th>
                        <th>Rule Name</th>
                        <th>Severity</th>
                        <th>Score</th>
                        <th>Explanation</th>
                    </tr>
                </thead>
                <tbody>
                    {rules_html}
                </tbody>
            </table>
        </div>

        <div class="card">
            <h3 style="color: #38bdf8; font-size: 16px; margin-bottom: 15px;">Extracted Static Features ({len(scan.features)})</h3>
            <table>
                <thead>
                    <tr>
                        <th>Feature</th>
                        <th>Extracted Value</th>
                        <th>Risk Significance</th>
                    </tr>
                </thead>
                <tbody>
                    {features_html}
                </tbody>
            </table>
        </div>

        <div class="card">
            <h3 style="color: #38bdf8; font-size: 16px; margin-bottom: 15px;">Analyst Notes & Audit Trail</h3>
            {notes_html}
        </div>

        <div style="text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; border-top: 1px solid #334155; padding-top: 15px;">
            Confidential Security Intelligence Report • Generated by PhishGuard Platform • Analyst: {analyst_signature}
        </div>
    </div>
</body>
</html>
        """
