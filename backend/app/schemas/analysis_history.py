"""Pydantic Schemas for Analysis History and Persistent Records."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AnalysisHistoryItem(BaseModel):
    """Lightweight summary record for the Analysis History table and overview drawer."""

    id: str = Field(description="Unique analysis identifier (e.g. psl-2020-2025 or AN-2026-0916-001)")
    title: str = Field(description="User-friendly title of the regulatory comparison")
    status: str = Field(description="Analysis status: 'complete', 'processing', 'failed'")
    mode: str = Field(description="Analysis mode: 'precomputed' or 'dynamic'")

    # Regulatory Pair
    previous_document_id: str
    previous_document_title: str
    previous_document_filename: Optional[str] = None
    current_document_id: str
    current_document_title: str
    current_document_filename: Optional[str] = None

    # Company Policy
    company_policy_document_id: Optional[str] = None
    company_policy_document_title: Optional[str] = None
    company_policy_document_filename: Optional[str] = None

    # Metadata & Timestamps
    created_at: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    duration_seconds: Optional[float] = 0.0
    created_by: Optional[str] = "Zahid Hamdule"
    error_message: Optional[str] = None

    # Structured Summaries
    overview_summary: Dict[str, Any] = Field(default_factory=dict)
    policy_summary: Dict[str, Any] = Field(default_factory=dict)

    is_most_recent: bool = False


class AnalysisHistoryListResponse(BaseModel):
    """Paginated list of historical analyses with search and filter metadata."""

    total: int
    page: int
    page_size: int
    total_pages: int
    analyses: List[AnalysisHistoryItem]


class AnalysisDetailResponse(BaseModel):
    """Full detail of a persistent analysis record."""

    analysis: AnalysisHistoryItem
    has_changes: bool = True
    has_policy: bool = False
