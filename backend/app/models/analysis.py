"""SQLAlchemy ORM Model for Persistent Analysis Records."""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import Column, DateTime, Float, JSON, String, Text

from app.core.database import Base


class AnalysisRecord(Base):
    """Represents a persistent regulatory comparison and compliance mapping analysis."""

    __tablename__ = "analyses"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    status = Column(String(32), nullable=False, default="processing", index=True)  # complete, processing, failed
    mode = Column(String(32), nullable=False, default="dynamic")  # precomputed, dynamic

    # Documents Used
    previous_document_id = Column(String(128), nullable=False, index=True)
    current_document_id = Column(String(128), nullable=False, index=True)
    previous_document_title = Column(String(512), nullable=False)
    current_document_title = Column(String(512), nullable=False)
    previous_document_filename = Column(String(255), nullable=True)
    current_document_filename = Column(String(255), nullable=True)

    # Optional Company Policy
    company_policy_document_id = Column(String(128), nullable=True, index=True)
    company_policy_document_title = Column(String(512), nullable=True)
    company_policy_document_filename = Column(String(255), nullable=True)

    # Lifecycle Timestamps & User Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Float, default=0.0, nullable=True)
    created_by = Column(String(128), default="Zahid Hamdule", nullable=True)
    error_message = Column(Text, nullable=True)

    # Structured Summaries (JSON)
    overview_summary = Column(JSON, nullable=True)
    policy_summary = Column(JSON, nullable=True)

    # Complete Reopening Data Payloads (JSON)
    changes_data = Column(JSON, nullable=True)
    policy_mappings_data = Column(JSON, nullable=True)
    processed_clauses_data = Column(JSON, nullable=True)
    ai_insights_data = Column(JSON, nullable=True)

    def to_dict(self) -> Dict[str, Any]:
        """Convert model record to dictionary representation."""
        return {
            "id": self.id,
            "title": self.title,
            "status": self.status,
            "mode": self.mode,
            "previous_document_id": self.previous_document_id,
            "current_document_id": self.current_document_id,
            "previous_document_title": self.previous_document_title,
            "current_document_title": self.current_document_title,
            "previous_document_filename": self.previous_document_filename,
            "current_document_filename": self.current_document_filename,
            "company_policy_document_id": self.company_policy_document_id,
            "company_policy_document_title": self.company_policy_document_title,
            "company_policy_document_filename": self.company_policy_document_filename,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "duration_seconds": self.duration_seconds,
            "created_by": self.created_by,
            "error_message": self.error_message,
            "overview_summary": self.overview_summary or {},
            "policy_summary": self.policy_summary or {},
        }
