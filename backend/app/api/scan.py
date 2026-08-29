from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from app.database.session import get_db
from app.models.models import Scan
from app.schemas.schemas import (
    ScanCreate, ScanDetailResponse, PaginatedScansResponse, ScanSummary,
    ScanCompareRequest, ScanCompareResponse, CompareFeatureDiff
)
from app.services.scan_service import ScanService
from app.api.auth import get_current_user, require_role

router = APIRouter(prefix="", tags=["URL Scanner"])


@router.post("/scan", response_model=ScanDetailResponse)
def create_scan(
    scan_req: ScanCreate,
    db: Session = Depends(get_db)
):
    """
    Perform deep static cybersecurity analysis on a submitted URL.
    Safely extracts structural features, runs modular rule engine & ML classifier,
    and returns an explainable risk scoring verdict.
    """
    url = scan_req.url.strip()
    if not ScanService.validate_url(url):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid URL format provided. Please enter a valid HTTP/HTTPS or domain address."
        )

    try:
        result = ScanService.scan_url(db, url)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while analyzing the URL: {str(e)}"
        )


@router.get("/scan/{scan_id}", response_model=ScanDetailResponse)
def get_scan(scan_id: int, db: Session = Depends(get_db)):
    """Retrieve detailed scan result, detection rules, features, and analyst notes by ID."""
    scan = ScanService.get_scan_by_id(db, scan_id)
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan record with ID {scan_id} was not found."
        )
    return scan


@router.get("/scans", response_model=PaginatedScansResponse)
def list_scans(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query across URL and domain"),
    classification: Optional[str] = Query(None, description="Filter by SAFE, SUSPICIOUS, PHISHING"),
    sort_by: Optional[str] = Query("timestamp", description="Sort field (timestamp, risk_score)"),
    sort_order: Optional[str] = Query("desc", description="Sort order (asc, desc)"),
    db: Session = Depends(get_db)
):
    """Retrieve paginated scan history with filtering, searching, and sorting."""
    query = db.query(Scan)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter((Scan.url.ilike(search_fmt)) | (Scan.domain.ilike(search_fmt)))

    if classification and classification.upper() in ["SAFE", "SUSPICIOUS", "PHISHING"]:
        query = query.filter(Scan.classification == classification.upper())

    total = query.count()

    # Sorting
    order_column = Scan.timestamp if sort_by == "timestamp" else Scan.risk_score
    if sort_order == "asc":
        query = query.order_by(asc(order_column))
    else:
        query = query.order_by(desc(order_column))

    offset = (page - 1) * limit
    scans = query.offset(offset).limit(limit).all()

    items = [ScanSummary.model_validate(s) for s in scans]
    pages = (total + limit - 1) // limit

    return PaginatedScansResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=pages
    )


@router.post("/compare", response_model=ScanCompareResponse)
def compare_urls(compare_req: ScanCompareRequest, db: Session = Depends(get_db)):
    """
    Perform side-by-side comparative static security analysis between two URLs.
    Highlights differences in domain structure, entropy, keywords, and threat risk scores.
    """
    url_a = compare_req.url_a.strip()
    url_b = compare_req.url_b.strip()

    if not ScanService.validate_url(url_a) or not ScanService.validate_url(url_b):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="One or both URLs have an invalid format."
        )

    scan_a = ScanService.scan_url(db, url_a)
    scan_b = ScanService.scan_url(db, url_b)

    # Feature diff computation
    feature_keys = [
        "domain", "url_length", "domain_length", "subdomain_count",
        "has_ip", "has_https", "suspicious_keyword_count", "entropy",
        "brand_keyword", "url_encoding_count", "redirect_param_count"
    ]

    diffs = []
    dict_a = scan_a.extracted_features_dict or {}
    dict_b = scan_b.extracted_features_dict or {}

    for k in feature_keys:
        val_a = dict_a.get(k, "N/A")
        val_b = dict_b.get(k, "N/A")
        
        verdict = "EQUAL"
        if val_a != val_b:
            # Determine which is riskier
            if k in ["has_ip", "brand_keyword", "suspicious_keyword_count", "url_encoding_count", "redirect_param_count", "entropy", "subdomain_count", "url_length"]:
                try:
                    num_a = float(val_a)
                    num_b = float(val_b)
                    verdict = "A_RISKIER" if num_a > num_b else "B_RISKIER"
                except Exception:
                    verdict = "DIFFERENT"
            elif k == "has_https":
                verdict = "B_RISKIER" if val_a == 1 and val_b == 0 else "A_RISKIER"

        diffs.append(CompareFeatureDiff(
            feature=k,
            value_a=val_a,
            value_b=val_b,
            verdict=verdict
        ))

    risk_delta = abs(scan_a.risk_score - scan_b.risk_score)
    safer_url = scan_a.url if scan_a.risk_score <= scan_b.risk_score else scan_b.url

    return ScanCompareResponse(
        scan_a=scan_a,
        scan_b=scan_b,
        feature_diffs=diffs,
        risk_delta=risk_delta,
        safer_url=safer_url
    )
