from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database.session import get_db
from app.models.models import Scan, Detection
from app.schemas.schemas import (
    DashboardStatsResponse, CategoryDistribution, TimeSeriesDataPoint,
    TopTriggeredRule, ScanSummary
)

router = APIRouter(prefix="/dashboard", tags=["Analyst Dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Retrieve comprehensive cybersecurity metrics and chart aggregations for the SOC dashboard."""
    scans = db.query(Scan).all()
    total_scanned = len(scans)

    if total_scanned == 0:
        return DashboardStatsResponse(
            total_scanned=0,
            safe_count=0,
            suspicious_count=0,
            phishing_count=0,
            avg_risk_score=0.0,
            high_risk_count=0,
            classification_distribution=[
                CategoryDistribution(name="Safe", value=0, color="#10b981"),
                CategoryDistribution(name="Suspicious", value=0, color="#f59e0b"),
                CategoryDistribution(name="Phishing", value=0, color="#ef4444")
            ],
            risk_distribution=[
                CategoryDistribution(name="Low (0-29)", value=0, color="#10b981"),
                CategoryDistribution(name="Medium (30-59)", value=0, color="#f59e0b"),
                CategoryDistribution(name="High (60-79)", value=0, color="#f97316"),
                CategoryDistribution(name="Critical (80-100)", value=0, color="#ef4444")
            ],
            scans_over_time=[],
            top_triggered_rules=[],
            recent_scans=[]
        )

    safe_count = sum(1 for s in scans if s.classification == "SAFE")
    suspicious_count = sum(1 for s in scans if s.classification == "SUSPICIOUS")
    phishing_count = sum(1 for s in scans if s.classification == "PHISHING")
    avg_risk_score = round(sum(s.risk_score for s in scans) / total_scanned, 1)
    high_risk_count = sum(1 for s in scans if s.risk_score >= 60)

    # Classification Donut
    class_dist = [
        CategoryDistribution(name="Safe", value=safe_count, color="#10b981"),
        CategoryDistribution(name="Suspicious", value=suspicious_count, color="#f59e0b"),
        CategoryDistribution(name="Phishing", value=phishing_count, color="#ef4444")
    ]

    # Risk Tier Bar Chart
    low_risk = sum(1 for s in scans if s.risk_score < 30)
    med_risk = sum(1 for s in scans if 30 <= s.risk_score < 60)
    high_risk = sum(1 for s in scans if 60 <= s.risk_score < 80)
    crit_risk = sum(1 for s in scans if s.risk_score >= 80)

    risk_dist = [
        CategoryDistribution(name="Low (0-29)", value=low_risk, color="#10b981"),
        CategoryDistribution(name="Medium (30-59)", value=med_risk, color="#f59e0b"),
        CategoryDistribution(name="High (60-79)", value=high_risk, color="#f97316"),
        CategoryDistribution(name="Critical (80-100)", value=crit_risk, color="#ef4444")
    ]

    # Scans over time (last 7 days grouped)
    now = datetime.now(timezone.utc)
    time_series = []
    for i in range(6, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        day_label = day_start.strftime("%b %d")
        
        day_scans = []
        for s in scans:
            if s.timestamp:
                ts = s.timestamp if s.timestamp.tzinfo else s.timestamp.replace(tzinfo=timezone.utc)
                if (day_start <= ts < day_end) or (i == 0 and ts >= day_start):
                    day_scans.append(s)
        
        time_series.append(TimeSeriesDataPoint(
            date=day_label,
            safe=sum(1 for s in day_scans if s.classification == "SAFE"),
            suspicious=sum(1 for s in day_scans if s.classification == "SUSPICIOUS"),
            phishing=sum(1 for s in day_scans if s.classification == "PHISHING"),
            total=len(day_scans)
        ))

    # Top Triggered Rules
    rule_counts = (
        db.query(
            Detection.rule_id,
            Detection.rule_name,
            Detection.severity,
            func.count(Detection.id).label("count")
        )
        .filter(Detection.triggered == True)
        .group_by(Detection.rule_id, Detection.rule_name, Detection.severity)
        .order_by(desc("count"))
        .limit(6)
        .all()
    )

    top_rules = [
        TopTriggeredRule(
            rule_id=r.rule_id,
            rule_name=r.rule_name,
            count=r.count,
            severity=r.severity
        ) for r in rule_counts
    ]

    # Recent scans (latest 6)
    recent = (
        db.query(Scan)
        .order_by(desc(Scan.timestamp))
        .limit(6)
        .all()
    )
    recent_items = [ScanSummary.model_validate(s) for s in recent]

    return DashboardStatsResponse(
        total_scanned=total_scanned,
        safe_count=safe_count,
        suspicious_count=suspicious_count,
        phishing_count=phishing_count,
        avg_risk_score=avg_risk_score,
        high_risk_count=high_risk_count,
        classification_distribution=class_dist,
        risk_distribution=risk_dist,
        scans_over_time=time_series,
        top_triggered_rules=top_rules,
        recent_scans=recent_items
    )
