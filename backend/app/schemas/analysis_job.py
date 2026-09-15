"""Pydantic schemas for Analysis Creation, Processing Jobs, and Sequential Clause Navigation."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.schemas.analysis import AnalysisOverview


class AnalysisCreateRequest(BaseModel):
    """Payload to initiate or map a regulatory change analysis job."""

    previous_document_id: str = Field(
        ...,
        description="ID of baseline regulatory document (e.g. 'rbi_psl_2020_official')",
    )
    current_document_id: str = Field(
        ...,
        description="ID of target/updated regulatory document (e.g. 'rbi_a8d0f9a98495')",
    )
    company_policy_document_id: Optional[str] = Field(
        default=None,
        description="Optional company policy or internal standard document ID",
    )


class AnalysisCreateResponse(BaseModel):
    """Response returned upon creating or mapping an analysis job."""

    analysis_id: str = Field(..., description="Unique or stable identifier for the analysis")
    status: str = Field(..., description="Job execution status (e.g. 'processing', 'complete')")
    previous_document_id: str = Field(..., description="Baseline regulatory document identifier")
    current_document_id: str = Field(..., description="Target regulatory document identifier")
    company_policy_document_id: Optional[str] = Field(None, description="Company policy document identifier if provided")
    mode: str = Field(..., description="Execution mode (e.g. 'precomputed', 'dynamic')")
    message: str = Field(..., description="Human-readable informational message or methodology note")


class AnalysisStage(BaseModel):
    """Pipeline processing stage status within an analysis job."""

    name: str = Field(..., description="Name of the NLP pipeline stage")
    status: str = Field(..., description="Stage execution status (e.g. 'completed', 'processing', 'pending', 'failed')")
    description: Optional[str] = Field(None, description="Stage task description")
    stage_snapshot: Optional[Dict[str, Any]] = Field(None, description="Actual data snapshot produced by this stage")


class CurrentDocumentInfo(BaseModel):
    """Metadata regarding the document currently undergoing NLP playback."""

    document_id: str = Field(..., description="Document ID")
    filename: str = Field(..., description="Human-readable file or document title")
    role: str = Field(..., description="Role: 'previous' (baseline) or 'current' (revised)")
    document_index: int = Field(..., description="1-based index (1: previous, 2: current)")
    total_documents: int = Field(default=2, description="Total active documents being processed")


class CurrentClauseInfo(BaseModel):
    """Header information for the current clause in active playback."""

    clause_id: str = Field(..., description="Unique clause ID")
    clause_index: int = Field(..., description="1-based clause index in document")
    total_clauses: int = Field(..., description="Total clauses in document")
    provision_id: Optional[str] = Field(None, description="Provision number (e.g. '3.2', '12.4')")
    clause_text: str = Field(..., description="Full text of the clause")


class ProcessedClauseNLP(BaseModel):
    """Clean, structured, reusable representation for a processed clause and its full NLP annotations."""

    clause_id: str = Field(..., description="Unique clause ID")
    clause_index: int = Field(..., description="1-based index within document")
    total_clauses: int = Field(..., description="Total clauses in document")
    provision_id: Optional[str] = Field(None, description="Provision heading/number")
    clause_text: str = Field(..., description="Complete clause string")
    highlighted_token: Optional[str] = Field(None, description="Active obligation/modal auxiliary token")
    tokens: List[Dict[str, Any]] = Field(default_factory=list, description="Word tokens with lemmas, POS, entity tags")
    lemmas: List[str] = Field(default_factory=list, description="Lemmatized words")
    pos_tags: List[str] = Field(default_factory=list, description="Part-of-Speech tags")
    domain_entities: List[Dict[str, Any]] = Field(default_factory=list, description="Domain NER mentions")
    dependencies: List[Dict[str, Any]] = Field(default_factory=list, description="Syntactic dependency links")
    classification: Optional[Dict[str, Any]] = Field(None, description="Regulatory function and confidence")
    requirement: Optional[Dict[str, Any]] = Field(None, description="Decomposed subject, modal, action, object, deadline")
    document_role: Optional[str] = Field(None, description="'previous' or 'current'")
    document_title: Optional[str] = Field(None, description="Document title")


class OverallProgressInfo(BaseModel):
    """Progress metrics across both document corpora."""

    document_clause_index: int = Field(..., description="1-based clause index in active document")
    document_clause_total: int = Field(..., description="Total clauses in active document")
    global_clause_index: int = Field(..., description="1-based cumulative index across all documents")
    global_clause_total: int = Field(..., description="Total cumulative clauses across both documents")
    percentage: int = Field(..., ge=0, le=100, description="Overall completion percentage")


class AnalysisStatusResponse(BaseModel):
    """Job status, progress, and stage report."""

    analysis_id: str = Field(..., description="Analysis identifier")
    status: str = Field(..., description="Current status (e.g. 'processing', 'complete', 'failed')")
    mode: str = Field(..., description="Execution mode (e.g. 'precomputed', 'dynamic')")
    progress: int = Field(..., ge=0, le=100, description="Completion percentage (0 - 100)")
    current_stage: str = Field(..., description="Current or final active stage name")
    stage_index: int = Field(default=0, description="0-indexed position in sequential pipeline (0 to 11)")
    total_stages: int = Field(default=12, description="Total sequential pipeline stages")
    message: str = Field(..., description="Status summary message")
    stages: List[AnalysisStage] = Field(..., description="List of all sequential pipeline stages")
    current_document: Optional[CurrentDocumentInfo] = Field(
        default=None,
        description="Active document information in sequential clause playback",
    )
    current_clause: Optional[CurrentClauseInfo] = Field(
        default=None,
        description="Active clause descriptor in sequential playback",
    )
    current_nlp: Optional[ProcessedClauseNLP] = Field(
        default=None,
        description="Complete atomic NLP annotations for the active clause",
    )
    current_sample: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Backward-compatible sample clause payload",
    )
    overall_progress: Optional[OverallProgressInfo] = Field(
        default=None,
        description="Detailed dual-document clause progression counter",
    )
    document_counts: Optional[Dict[str, int]] = Field(
        default=None,
        description="Actual processed clause counts for baseline and updated documents",
    )
    error_message: Optional[str] = Field(None, description="Error details if execution failed")


class DocumentClausesResponse(BaseModel):
    """Collection of all processed clauses and full NLP annotations for post-completion explorer."""

    analysis_id: str = Field(..., description="Analysis identifier")
    document_role: str = Field(..., description="'previous' or 'current'")
    document_id: str = Field(..., description="Target document ID")
    document_title: str = Field(..., description="Human-readable title")
    total_clauses: int = Field(..., description="Total clauses in document")
    clauses: List[ProcessedClauseNLP] = Field(..., description="List of all processed clauses with NLP details")


class AnalysisResultsResponse(BaseModel):
    """Comprehensive analysis results payload reusing real change intelligence."""

    analysis_id: str = Field(..., description="Analysis identifier")
    status: str = Field(..., description="Status of the completed analysis")
    mode: str = Field(..., description="Execution mode")
    overview: AnalysisOverview = Field(..., description="High-level analysis statistics and counts")
    summary_metrics: Dict[str, Any] = Field(..., description="Detailed metrics and breakdown values")
    methodology_notes: Dict[str, str] = Field(..., description="Transparency and audit methodology definitions")
    links: Dict[str, str] = Field(..., description="Navigation and detailed drill-down API endpoints")

