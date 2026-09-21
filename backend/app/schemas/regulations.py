"""Regulatory Document Library Pydantic Schemas.

Exposes structured metadata derived from precomputed catalog and acquisition datasets.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class RegulationStage(BaseModel):
    """Stage in regulatory document ingestion and NLP pipeline."""

    name: str = Field(description="Stage name e.g. Document Ingestion, Text Extraction")
    status: str = Field(default="completed", description="Status e.g. completed, processing, pending")
    timestamp: Optional[str] = Field(default=None, description="Stage completion or start timestamp")


class RegulationProcessingStatus(BaseModel):
    """Detailed multi-stage processing status for document."""

    status: str = Field(default="Processed", description="Overall status: Processed, Processing, Pending, Failed")
    progress_percent: int = Field(default=100, description="Processing completion percentage (0-100)")
    stages: List[RegulationStage] = Field(default_factory=list, description="Ordered processing stages")


class RegulationSection(BaseModel):
    """Chapter or section structure within a regulatory document."""

    section_id: str = Field(description="Section or chapter identifier e.g. Chapter I, Section 3.2")
    title: str = Field(description="Section heading or title")
    clause_count: int = Field(default=0, description="Number of clauses contained in this section")
    provisions: List[str] = Field(default_factory=list, description="Provision IDs in this section")


class RelatedDocumentItem(BaseModel):
    """Related regulatory document or amendment relationship."""

    document_id: str = Field(description="Identifier of related document")
    title: str = Field(description="Title of related document")
    relation_type: str = Field(description="Relationship: Previous Version, Current Version, Amendment, Companion Direction")
    regulator: str = Field(default="RBI", description="Regulatory authority")
    year: Optional[str] = Field(default=None, description="Promulgation year")
    document_type: Optional[str] = Field(default="Master Direction", description="Document type")


class RegulatoryDocument(BaseModel):
    """Regulatory document metadata schema."""

    document_id: str = Field(description="Unique regulatory document identifier")
    filename: str = Field(description="PDF filename")
    title: str = Field(description="Cleaned regulatory title or title candidate")
    title_candidate: Optional[str] = Field(default=None, description="Raw extracted title candidate from header text")
    regulator: str = Field(default="Reserve Bank of India (RBI)", description="Full regulatory authority name")
    regulator_code: str = Field(default="RBI", description="Short regulatory code (e.g. RBI, SEBI, IRDAI)")
    category: str = Field(default="General Banking", description="Regulatory domain classification category")
    version_year: str = Field(default="2025", description="Promulgation or revision year")
    effective_date: Optional[str] = Field(default="Apr 1, 2025", description="Formatted effective enforcement date")
    status: str = Field(default="Processed", description="Ingestion status (Processed, Processing, Pending, Failed)")
    source_page: Optional[str] = Field(default=None, description="Acquisition category source or stream")
    source_page_url: Optional[str] = Field(default=None, description="Original regulatory portal URL")
    pdf_url: Optional[str] = Field(default=None, description="Official PDF download URL")
    document_type: Optional[str] = Field(default="Master Direction", description="Regulatory classification type")
    clause_count: int = Field(default=0, description="Total segmented regulatory clauses")
    total_words: int = Field(default=0, description="Total word count of document body")
    total_pages: Optional[int] = Field(default=1, description="Estimated or parsed document page count")
    language: str = Field(default="English", description="Document language")
    source: str = Field(default="RBI Official Website", description="Source repository or regulatory body portal")
    notification_numbers: Optional[str] = Field(default=None, description="Extracted circular and notification references")
    dates_found: Optional[str] = Field(default=None, description="Extracted promulgation and update dates")
    description: Optional[str] = Field(default=None, description="Expository summary or introductory extract")
    file_size_bytes: Optional[int] = Field(default=None, description="Filesize in bytes")
    sha256: Optional[str] = Field(default=None, description="Cryptographic SHA-256 hash of PDF")
    is_verified_baseline: Optional[bool] = Field(default=False, description="Flag indicating verified core baseline PSL corpus")
    processing_status: Optional[RegulationProcessingStatus] = Field(default=None, description="Detailed stage checklist")
    sections: Optional[List[RegulationSection]] = Field(default=None, description="Structured chapters/sections")
    related_documents: Optional[List[RelatedDocumentItem]] = Field(default=None, description="Cross-referenced documents")


class RegulationsMetrics(BaseModel):
    """Aggregate summary metrics across all indexed regulatory documents."""

    total_documents: int = Field(description="Total indexed and uploaded regulatory documents")
    regulatory_authorities_count: int = Field(description="Count of distinct regulatory bodies")
    regulatory_authorities: List[str] = Field(description="List of regulatory authorities")
    document_categories_count: int = Field(description="Count of unique classification categories")
    document_categories: List[str] = Field(description="List of document categories")
    processed_count: int = Field(description="Count of documents fully processed and ready for analysis")
    processing_count: int = Field(description="Count of documents currently in ingestion or NLP processing")
    failed_count: int = Field(default=0, description="Count of failed document ingestions")


class RegulationFilters(BaseModel):
    """Available filter options for dropdown selectors."""

    regulators: List[str] = Field(description="Available regulator codes")
    categories: List[str] = Field(description="Available category options")
    statuses: List[str] = Field(description="Available processing statuses")
    years: List[str] = Field(description="Available version years")


class RegulationListResponse(BaseModel):
    """Paginated list response schema for regulatory documents with metrics and filters."""

    total: int = Field(description="Total matching regulatory documents in repository")
    returned: int = Field(description="Number of documents returned in current page")
    limit: int = Field(description="Page size limit")
    offset: int = Field(description="Page offset")
    page: int = Field(default=1, description="1-indexed current page number")
    page_size: int = Field(default=50, description="Number of items per page")
    total_pages: int = Field(default=1, description="Total calculated pages")
    metrics: Optional[RegulationsMetrics] = Field(default=None, description="Summary dashboard metrics")
    filters: Optional[RegulationFilters] = Field(default=None, description="Available filter categories")
    documents: List[RegulatoryDocument] = Field(description="List of regulatory documents")

