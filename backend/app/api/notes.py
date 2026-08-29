from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Scan, AnalystNote, User
from app.schemas.schemas import AnalystNoteCreate, AnalystNoteResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/notes", tags=["Analyst Notes"])


@router.post("", response_model=AnalystNoteResponse)
def add_analyst_note(
    note_data: AnalystNoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a SOC investigation note to a scan record."""
    scan = db.query(Scan).filter(Scan.id == note_data.scan_id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan record #{note_data.scan_id} not found."
        )

    clean_note = note_data.note.strip()
    if not clean_note:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Note content cannot be empty."
        )

    new_note = AnalystNote(
        scan_id=scan.id,
        user_id=current_user.id if current_user else None,
        username=current_user.username if current_user else "SOC Analyst",
        note=clean_note,
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return AnalystNoteResponse.model_validate(new_note)


@router.get("/{scan_id}", response_model=List[AnalystNoteResponse])
def get_scan_notes(scan_id: int, db: Session = Depends(get_db)):
    """Retrieve all analyst investigation notes for a scan."""
    notes = db.query(AnalystNote).filter(AnalystNote.scan_id == scan_id).order_by(AnalystNote.created_at.desc()).all()
    return [AnalystNoteResponse.model_validate(n) for n in notes]
