"""Analysis History and Persistence Service.

Manages persistent storage, lifecycle status updates, search, filtering,
and retrieval of regulatory comparison and compliance mapping analyses in SQLite/PostgreSQL.
"""

from datetime import datetime, timedelta, timezone
import json
import math
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import or_, desc
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.analysis import AnalysisRecord
from app.schemas.analysis_history import (
    AnalysisDetailResponse,
    AnalysisHistoryItem,
    AnalysisHistoryListResponse,
)


class AnalysisHistoryService:
    """Service handling database persistence and historical queries for regulatory analyses."""

    def __init__(self, session_factory=SessionLocal):
        self.session_factory = session_factory

    def seed_canonical_psl_analysis(self) -> None:
        """Ensure canonical PSL 2020 -> 2025 analysis exists in SQLite database on startup."""
        db: Session = self.session_factory()
        try:
            existing = db.query(AnalysisRecord).filter(AnalysisRecord.id == "psl-2020-2025").first()
            if not existing:
                psl_record = AnalysisRecord(
                    id="psl-2020-2025",
                    title="PSL Framework Update",
                    status="complete",
                    mode="precomputed",
                    previous_document_id="rbi_psl_2020_official",
                    current_document_id="rbi_a8d0f9a98495",
                    previous_document_title="Reserve Bank of India (Priority Sector Lending - Targets and Classification) Directions, 2020",
                    current_document_title="Master Directions - Reserve Bank of India (Priority Sector Lending – Targets and Classification) Directions, 2025",
                    previous_document_filename="rbi_psl_2020_official.pdf",
                    current_document_filename="rbi_psl_2025.pdf",
                    company_policy_document_id=None,
                    company_policy_document_title=None,
                    company_policy_document_filename=None,
                    created_at=datetime(2025, 9, 14, 16, 10, 0, tzinfo=timezone.utc),
                    started_at=datetime(2025, 9, 14, 16, 10, 0, tzinfo=timezone.utc),
                    completed_at=datetime(2025, 9, 14, 16, 11, 45, tzinfo=timezone.utc),
                    duration_seconds=105.0,
                    created_by="Zahid Hamdule",
                    error_message=None,
                    overview_summary={
                        "total_records": 63,
                        "substantive_changes": 31,
                        "administrative_changes": 4,
                        "wording_only": 7,
                        "added_candidates": 7,
                        "removed_candidates": 12,
                        "unchanged": 2,
                        "high_materiality": 31,
                        "medium_materiality": 11,
                        "low_materiality": 21,
                    },
                    policy_summary={},
                )
                db.add(psl_record)
                db.commit()
        except Exception as e:
            db.rollback()
            print(f"[AnalysisHistoryService] Warning: Failed to seed canonical PSL analysis: {e}")
        finally:
            db.close()

    def create_or_init_analysis(
        self,
        analysis_id: str,
        title: str,
        previous_document_id: str,
        current_document_id: str,
        previous_document_title: str,
        current_document_title: str,
        previous_document_filename: Optional[str] = None,
        current_document_filename: Optional[str] = None,
        company_policy_document_id: Optional[str] = None,
        company_policy_document_title: Optional[str] = None,
        company_policy_document_filename: Optional[str] = None,
        mode: str = "dynamic",
        created_by: str = "Zahid Hamdule",
    ) -> AnalysisRecord:
        """Create or initialize an analysis in 'processing' status in the database."""
        db: Session = self.session_factory()
        try:
            record = db.query(AnalysisRecord).filter(AnalysisRecord.id == analysis_id).first()
            now = datetime.now(timezone.utc)
            if not record:
                record = AnalysisRecord(
                    id=analysis_id,
                    title=title,
                    status="processing",
                    mode=mode,
                    previous_document_id=previous_document_id,
                    current_document_id=current_document_id,
                    previous_document_title=previous_document_title,
                    current_document_title=current_document_title,
                    previous_document_filename=previous_document_filename,
                    current_document_filename=current_document_filename,
                    company_policy_document_id=company_policy_document_id,
                    company_policy_document_title=company_policy_document_title,
                    company_policy_document_filename=company_policy_document_filename,
                    created_at=now,
                    started_at=now,
                    created_by=created_by,
                    overview_summary={},
                    policy_summary={},
                )
                db.add(record)
            else:
                record.status = "processing"
                record.title = title
                record.previous_document_title = previous_document_title
                record.current_document_title = current_document_title
                record.company_policy_document_id = company_policy_document_id
                record.company_policy_document_title = company_policy_document_title
                record.created_at = now
                record.started_at = now
                record.completed_at = None

            db.commit()
            db.refresh(record)
            return record
        finally:
            db.close()

    def update_analysis_complete(
        self,
        analysis_id: str,
        overview_summary: Dict[str, Any],
        policy_summary: Optional[Dict[str, Any]] = None,
        changes_data: Optional[List[Dict[str, Any]]] = None,
        policy_mappings_data: Optional[List[Dict[str, Any]]] = None,
        duration_seconds: Optional[float] = None,
    ) -> Optional[AnalysisRecord]:
        """Mark analysis as complete and persist structured summary and raw change/policy payloads."""
        db: Session = self.session_factory()
        try:
            record = db.query(AnalysisRecord).filter(AnalysisRecord.id == analysis_id).first()
            if not record:
                return None

            now = datetime.now(timezone.utc)
            record.status = "complete"
            record.completed_at = now
            if duration_seconds is not None:
                record.duration_seconds = duration_seconds
            elif record.started_at:
                # Calculate elapsed
                diff = now - record.started_at.replace(tzinfo=timezone.utc) if record.started_at.tzinfo is None else now - record.started_at
                record.duration_seconds = max(1.0, round(diff.total_seconds(), 1))

            record.overview_summary = overview_summary or {}
            record.policy_summary = policy_summary or {}
            if changes_data is not None:
                record.changes_data = changes_data
            if policy_mappings_data is not None:
                record.policy_mappings_data = policy_mappings_data

            db.commit()
            db.refresh(record)
            return record
        finally:
            db.close()

    def update_analysis_failed(self, analysis_id: str, error_message: str) -> Optional[AnalysisRecord]:
        """Mark analysis as failed with error metadata."""
        db: Session = self.session_factory()
        try:
            record = db.query(AnalysisRecord).filter(AnalysisRecord.id == analysis_id).first()
            if not record:
                return None

            record.status = "failed"
            record.error_message = error_message
            record.completed_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(record)
            return record
        finally:
            db.close()

    def get_analysis_by_id(self, analysis_id: str) -> Optional[AnalysisRecord]:
        """Retrieve single persistent analysis record by ID."""
        db: Session = self.session_factory()
        try:
            return db.query(AnalysisRecord).filter(AnalysisRecord.id == analysis_id).first()
        finally:
            db.close()

    def delete_analysis(self, analysis_id: str) -> bool:
        """Delete an analysis record from SQLite."""
        db: Session = self.session_factory()
        try:
            record = db.query(AnalysisRecord).filter(AnalysisRecord.id == analysis_id).first()
            if not record:
                return False
            db.delete(record)
            db.commit()
            return True
        finally:
            db.close()

    def list_analyses(
        self,
        search: Optional[str] = None,
        status: Optional[str] = None,
        date_filter: Optional[str] = None,
        document_type: Optional[str] = None,
        page: int = 1,
        page_size: int = 10,
    ) -> AnalysisHistoryListResponse:
        """Query and paginate persistent analyses with search and multi-facet filtering."""
        db: Session = self.session_factory()
        try:
            query = db.query(AnalysisRecord)

            # Search filter
            if search and search.strip():
                term = f"%{search.strip().lower()}%"
                query = query.filter(
                    or_(
                        AnalysisRecord.title.ilike(term),
                        AnalysisRecord.id.ilike(term),
                        AnalysisRecord.previous_document_title.ilike(term),
                        AnalysisRecord.current_document_title.ilike(term),
                        AnalysisRecord.company_policy_document_title.ilike(term),
                    )
                )

            # Status filter
            if status and status.strip().lower() not in ("all", "all statuses", ""):
                clean_status = status.strip().lower()
                query = query.filter(AnalysisRecord.status == clean_status)

            # Date filter
            if date_filter and date_filter.strip().lower() not in ("all", "all dates", ""):
                clean_date = date_filter.strip().lower()
                now = datetime.now(timezone.utc)
                if clean_date in ("today", "24h", "24 hours"):
                    since = now - timedelta(days=1)
                    query = query.filter(AnalysisRecord.created_at >= since)
                elif clean_date in ("7days", "7 days", "last 7 days"):
                    since = now - timedelta(days=7)
                    query = query.filter(AnalysisRecord.created_at >= since)
                elif clean_date in ("30days", "30 days", "last 30 days"):
                    since = now - timedelta(days=30)
                    query = query.filter(AnalysisRecord.created_at >= since)

            # Document Type filter
            if document_type and document_type.strip().lower() not in ("all", "all document types", "all types", ""):
                doc_term = f"%{document_type.strip().lower()}%"
                query = query.filter(
                    or_(
                        AnalysisRecord.previous_document_title.ilike(doc_term),
                        AnalysisRecord.current_document_title.ilike(doc_term),
                        AnalysisRecord.company_policy_document_title.ilike(doc_term),
                    )
                )

            # Count total matching
            total = query.count()

            # Order by newest first
            query = query.order_by(desc(AnalysisRecord.created_at))

            # Pagination
            page = max(1, page)
            page_size = max(1, min(100, page_size))
            offset = (page - 1) * page_size
            total_pages = max(1, math.ceil(total / page_size)) if total > 0 else 1

            records = query.offset(offset).limit(page_size).all()

            # Convert to schema items
            items: List[AnalysisHistoryItem] = []
            for idx, r in enumerate(records):
                is_recent = page == 1 and idx == 0
                items.append(
                    AnalysisHistoryItem(
                        id=r.id,
                        title=r.title,
                        status=r.status,
                        mode=r.mode,
                        previous_document_id=r.previous_document_id,
                        previous_document_title=r.previous_document_title,
                        previous_document_filename=r.previous_document_filename,
                        current_document_id=r.current_document_id,
                        current_document_title=r.current_document_title,
                        current_document_filename=r.current_document_filename,
                        company_policy_document_id=r.company_policy_document_id,
                        company_policy_document_title=r.company_policy_document_title,
                        company_policy_document_filename=r.company_policy_document_filename,
                        created_at=r.created_at.isoformat() if r.created_at else None,
                        started_at=r.started_at.isoformat() if r.started_at else None,
                        completed_at=r.completed_at.isoformat() if r.completed_at else None,
                        duration_seconds=r.duration_seconds or 0.0,
                        created_by=r.created_by or "Zahid Hamdule",
                        error_message=r.error_message,
                        overview_summary=r.overview_summary or {},
                        policy_summary=r.policy_summary or {},
                        is_most_recent=is_recent,
                    )
                )

            return AnalysisHistoryListResponse(
                total=total,
                page=page,
                page_size=page_size,
                total_pages=total_pages,
                analyses=items,
            )
        finally:
            db.close()

    def get_analysis_insights(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve persisted AI advisory insights for an analysis record."""
        db: Session = self.session_factory()
        try:
            record = db.query(AnalysisRecord).filter(AnalysisRecord.id == analysis_id).first()
            if not record or not record.ai_insights_data:
                return None
            return record.ai_insights_data
        finally:
            db.close()

    def save_analysis_insights(self, analysis_id: str, insights_data: Dict[str, Any]) -> bool:
        """Persist generated AI advisory insights for an analysis record."""
        db: Session = self.session_factory()
        try:
            record = db.query(AnalysisRecord).filter(AnalysisRecord.id == analysis_id).first()
            if not record:
                return False
            record.ai_insights_data = insights_data
            db.commit()
            return True
        finally:
            db.close()

