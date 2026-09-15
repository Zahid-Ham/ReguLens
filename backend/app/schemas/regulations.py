"""Regulatory Document Library Pydantic Schemas.

Exposes structured metadata derived from precomputed catalog and acquisition datasets.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class RegulatoryDocument(BaseModel):
    """Regulatory document metadata schema."""

    document_id: str = Field(description="Unique regulatory document identifier")
    filename: str = Field(description="PDF filename")
    title: str = Field(description="Cleaned regulatory title or title candidate")
    title_candidate: Optional[str] = Field(default=None, description="Raw extracted title candidate from header text")
    source_page: Optional[str] = Field(default=None, description="Acquisition category source or stream")
    source_page_url: Optional[str] = Field(default=None, description="Original RBI source portal URL")
    pdf_url: Optional[str] = Field(default=None, description="Official PDF download URL")
    document_type: Optional[str] = Field(default=None, description="Regulatory classification type")
    clause_count: int = Field(default=0, description="Total segmented regulatory clauses")
    total_words: int = Field(default=0, description="Total word count of document body")
    notification_numbers: Optional[str] = Field(default=None, description="Extracted circular and notification references")
    dates_found: Optional[str] = Field(default=None, description="Extracted promulgation and update dates")
    file_size_bytes: Optional[int] = Field(default=None, description="Filesize in bytes")
    sha256: Optional[str] = Field(default=None, description="Cryptographic SHA-256 hash of PDF")
    is_verified_baseline: Optional[bool] = Field(default=False, description="Flag indicating verified core baseline PSL corpus")


class RegulationListResponse(BaseModel):
    """Paginated list response schema for regulatory documents."""

    total: int = Field(description="Total matching regulatory documents in repository")
    returned: int = Field(description="Number of documents returned in current page")
    limit: int = Field(description="Page size limit")
    offset: int = Field(description="Page offset")
    documents: List[RegulatoryDocument] = Field(description="List of regulatory documents")
