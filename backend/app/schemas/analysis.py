"""Pydantic schemas for Regulatory Change Intelligence API."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AnalysisOverview(BaseModel):
    """Overview metadata and summary statistics for regulatory comparison analysis."""

    analysis_id: str = Field(..., description="Unique identifier for regulatory analysis comparison")
    previous_document_id: str = Field(..., description="ID of baseline regulatory document (PSL 2020)")
    current_document_id: str = Field(..., description="ID of updated regulatory document (PSL 2025)")
    previous_document_title: str = Field(..., description="Official title of baseline document")
    current_document_title: str = Field(..., description="Official title of updated document")

    # Change Breakdown from V2 Summary Artifact
    total_records: int = Field(..., description="Total mapped provision pairs and candidate clauses")
    substantive_changes: int = Field(..., description="Number of substantive regulatory changes detected")
    administrative_changes: int = Field(..., description="Number of administrative/metadata changes")
    wording_only: int = Field(..., description="Provisions with wording or stylistic adjustments without legal shift")
    added_candidates: int = Field(
        ...,
        description="Candidate novel provisions in updated regulation requiring review (not legally confirmed additions)",
    )
    removed_candidates: int = Field(
        ...,
        description="Candidate retired provisions from baseline regulation requiring review (not legally confirmed removals)",
    )
    unchanged: int = Field(..., description="Identical provisions across both regulatory versions")

    # Materiality Breakdown from V2 Summary Artifact
    high_materiality: int = Field(..., description="Provisions assessed with high regulatory impact/materiality")
    medium_materiality: int = Field(..., description="Provisions assessed with medium materiality")
    low_materiality: int = Field(..., description="Provisions assessed with low regulatory impact")

    # Shift Dimensions derived from deterministic change detection
    modality_changes: int = Field(..., description="Clauses with modality shifts (e.g. shall/must/may/recommend)")
    monetary_changes: int = Field(..., description="Clauses with monetary limit/threshold alterations")
    percentage_changes: int = Field(..., description="Clauses with percentage or target ratio changes")
    duration_changes: int = Field(..., description="Clauses with duration or validity period changes")
    deadline_changes: int = Field(..., description="Clauses with reporting deadline shifts")
    date_changes: int = Field(..., description="Clauses with effective dates or transition timeline updates")

    methodology_notes: Dict[str, str] = Field(
        default_factory=dict,
        description="Methodology and audit trail definitions for AI transparency",
    )


class RegulatoryShift(BaseModel):
    """Single dimension shift within a regulatory change."""

    dimension: str = Field(..., description="Dimension category (e.g. MONETARY_VALUE, DATE, MODALITY, PERCENTAGE)")
    old: List[Any] = Field(default_factory=list, description="Values present in baseline regulation")
    new: List[Any] = Field(default_factory=list, description="Values present in updated regulation")


class ChangeRecord(BaseModel):
    """Detailed record of a regulatory provision comparison and change intelligence."""

    change_id: str = Field(..., description="Unique change record identifier (e.g. CHG_0001)")
    old_clause_id: Optional[str] = Field(None, description="Clause ID in baseline document (null if added candidate)")
    old_provision_id: Optional[str] = Field(None, description="Provision section identifier in baseline document")
    new_clause_id: Optional[str] = Field(None, description="Clause ID in updated document (null if removed candidate)")
    new_provision_id: Optional[str] = Field(None, description="Provision section identifier in updated document")

    alignment_score: Optional[float] = Field(None, description="Composite semantic and structural alignment score")
    semantic_similarity: Optional[float] = Field(None, description="Sentence transformer cosine similarity")
    tfidf_similarity: Optional[float] = Field(None, description="TF-IDF n-gram lexical similarity")

    change_type: str = Field(..., description="Raw change classification (MODIFIED, REMOVED, WORDING_ONLY, ADDED, UNCHANGED)")
    change_dimension: Optional[str] = Field(None, description="Identified change dimensions (e.g. DATE, MODALITY, MONETARY_VALUE)")
    materiality: str = Field(..., description="Raw materiality score (HIGH, LOW)")

    old_modality: Optional[str] = Field(None, description="Baseline deontic modality (e.g. OBLIGATION, PERMISSION)")
    new_modality: Optional[str] = Field(None, description="Updated deontic modality")
    modality_direction: Optional[str] = Field(None, description="Modality strength shift (STRENGTHENED, RELAXED, UNCHANGED)")

    regulatory_changes: List[RegulatoryShift] = Field(
        default_factory=list,
        description="Structured parameter shifts extracted by NLP pipeline",
    )
    explanation: Optional[str] = Field(None, description="Preliminary explainability text")
    materiality_reasons: List[str] = Field(
        default_factory=list,
        description="Deterministic explainable reasons justifying the materiality classification",
    )
    alignment_method: Optional[str] = Field(
        None,
        description="Method used for clause alignment: same_provision, structural, semantic, lexical, hybrid, unmatched",
    )

    old_clause_text: Optional[str] = Field(None, description="Full text of baseline clause")
    new_clause_text: Optional[str] = Field(None, description="Full text of updated clause")

    @property
    def previous_clause_text(self) -> Optional[str]:
        return self.old_clause_text

    @property
    def current_clause_text(self) -> Optional[str]:
        return self.new_clause_text

    final_change_type: str = Field(
        ...,
        description="Final calibrated change type (MODIFIED, REMOVED, WORDING_ONLY, ADDED, ADMINISTRATIVE_CHANGE, UNCHANGED)",
    )

    final_category: str = Field(
        ...,
        description="Final categorized impact (SUBSTANTIVE_REGULATORY_CHANGE, REGULATORY_STRUCTURE, WORDING_CHANGE, DOCUMENT_METADATA, NO_CHANGE)",
    )
    final_materiality: str = Field(..., description="Final materiality assessment (HIGH, MEDIUM, LOW)")
    final_explanation: Optional[str] = Field(None, description="Detailed audit-ready explanation of regulatory modification")



class ChangeListResponse(BaseModel):
    """Paginated list response for regulatory changes."""

    total: int = Field(..., description="Total matching change records in dataset")
    returned: int = Field(..., description="Number of change records in current page")
    limit: int = Field(..., description="Page size limit applied")
    offset: int = Field(..., description="Page offset applied")
    changes: List[ChangeRecord] = Field(..., description="List of regulatory change records")


class ClauseDetail(BaseModel):
    """Granular segmented clause record from specific regulatory version."""

    version: str = Field(..., description="Regulatory version (PSL_2020 or PSL_2025)")
    clause_id: str = Field(..., description="Unique clause identifier")
    page: Optional[int] = Field(None, description="Original PDF page number")
    provision_id: Optional[str] = Field(None, description="Section or paragraph number")
    section_level: Optional[int] = Field(None, description="Hierarchical section level")
    content_mode: Optional[str] = Field(None, description="Content mode (e.g. MAIN, TABLE, ANNEX)")
    clause_text: str = Field(..., description="Full text content of the segmented clause")
    char_length: Optional[int] = Field(None, description="Character count")
    word_count: Optional[int] = Field(None, description="Word count")


class RequirementRecord(BaseModel):
    """Structured regulatory requirement / obligation extracted by NLP pipeline."""

    document_id: str = Field(..., description="Source regulatory document ID")
    filename: Optional[str] = Field(None, description="Source PDF filename")
    source_page: Optional[str] = Field(None, description="Origin page classification")
    pdf_url: Optional[str] = Field(None, description="URL to official PDF")
    page_number: Optional[int] = Field(None, description="Page number of requirement")
    clause_id: str = Field(..., description="Unique clause ID from segmentation")
    clause_level: Optional[int] = Field(None, description="Clause hierarchy level")
    clause_text: str = Field(..., description="Original text of the requirement")
    character_count: Optional[int] = Field(None, description="Character count")
    word_count: Optional[int] = Field(None, description="Word count")
    regulatory_function: Optional[str] = Field(
        None,
        description="Extracted function: OBLIGATION, PROHIBITION, PERMISSION, INFORMATION",
    )
    subject: Optional[str] = Field(None, description="Regulated entity / subject")
    modality: Optional[str] = Field(None, description="Deontic keyword (e.g. shall, must, may, prohibited)")
    action: Optional[str] = Field(None, description="Mandated or restricted regulatory action")
    deadline: Optional[str] = Field(None, description="Extracted compliance deadline")
    duration: Optional[str] = Field(None, description="Extracted compliance timeframe/duration")


class RequirementListResponse(BaseModel):
    """Paginated list response for structured regulatory requirements."""

    total: int = Field(..., description="Total matching requirement records")
    returned: int = Field(..., description="Number of requirements returned in this page")
    limit: int = Field(..., description="Page size limit applied")
    offset: int = Field(..., description="Page offset applied")
    requirements: List[RequirementRecord] = Field(..., description="List of structured requirements")
