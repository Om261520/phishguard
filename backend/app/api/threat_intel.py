from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.models.models import ThreatIndicator
from app.schemas.schemas import ThreatIndicatorItem

router = APIRouter(prefix="/threat-intelligence", tags=["Threat Intelligence"])


@router.get("", response_model=List[ThreatIndicatorItem])
def get_threat_indicators(
    search: Optional[str] = Query(None, description="Search indicator or category"),
    indicator_type: Optional[str] = Query(None, description="Filter by type (URL, DOMAIN, IP, HASH)"),
    db: Session = Depends(get_db)
):
    """
    Retrieve threat intelligence indicators (IOCs) from the PhishGuard Threat Network.
    All records are clearly attributed with threat category and confidence metrics.
    """
    query = db.query(ThreatIndicator)

    if indicator_type and indicator_type.upper() in ["URL", "DOMAIN", "IP", "HASH"]:
        query = query.filter(ThreatIndicator.indicator_type == indicator_type.upper())

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (ThreatIndicator.indicator.ilike(search_fmt)) |
            (ThreatIndicator.threat_category.ilike(search_fmt)) |
            (ThreatIndicator.source.ilike(search_fmt))
        )

    indicators = query.order_by(desc(ThreatIndicator.confidence), desc(ThreatIndicator.last_seen)).all()
    return [ThreatIndicatorItem.model_validate(i) for i in indicators]
