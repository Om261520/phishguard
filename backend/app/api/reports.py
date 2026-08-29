from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import ReportGenerateRequest
from app.services.scan_service import ScanService
from app.services.report_generator import ReportGenerator

router = APIRouter(prefix="/reports", tags=["Security Reports"])


@router.post("")
def generate_report(req: ReportGenerateRequest, db: Session = Depends(get_db)):
    """Generate a structured security analysis report payload."""
    scan = ScanService.get_scan_by_id(db, req.scan_id)
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan record #{req.scan_id} not found."
        )

    signature = req.analyst_signature or "PhishGuard Automated SOC Agent"
    json_report = ReportGenerator.generate_json_report(scan, analyst_signature=signature)
    return json_report


@router.get("/{scan_id}/export")
def export_report(
    scan_id: int,
    format: str = Query("json", description="Export format: json or html"),
    db: Session = Depends(get_db)
):
    """Export formatted security report as downloadable JSON or printable executive HTML."""
    scan = ScanService.get_scan_by_id(db, scan_id)
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan record #{scan_id} not found."
        )

    if format.lower() == "html":
        html_content = ReportGenerator.generate_html_report(scan)
        return HTMLResponse(content=html_content, status_code=200)
    
    # Default JSON export
    json_data = ReportGenerator.generate_json_report(scan)
    return json_data
