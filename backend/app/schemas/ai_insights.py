"""Pydantic Schemas for ReguLens Groq AI Advisory Insights.

All models represent evidence-grounded advisory intelligence built atop deterministic NLP results.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ExecutiveComplianceSummary(BaseModel):
    """Concise executive-level summary synthesized from deterministic comparison & mapping data."""

    summary_text: str = Field(
        ...,
        description="Concise 2-3 sentence executive compliance summary grounded strictly in deterministic findings.",
    )
    key_focus_areas: List[str] = Field(
        default_factory=list,
        description="Top 2-4 high-priority regulatory or compliance focus domains (e.g. review frequency, reporting deadlines, thresholds).",
    )
    policy_coverage_pct: Optional[float] = Field(
        default=None,
        description="Deterministic policy coverage percentage if company policy was analyzed.",
    )
    substantive_changes_count: int = Field(
        default=0,
        description="Number of substantive regulatory modifications detected.",
    )
    potential_gaps_count: int = Field(
        default=0,
        description="Number of potential non-compliant compliance gaps identified.",
    )
    partial_matches_count: int = Field(
        default=0,
        description="Number of partial match compliance gaps identified.",
    )
    compliant_count: int = Field(
        default=0,
        description="Number of fully compliant requirement mappings.",
    )


class TopComplianceGapInsight(BaseModel):
    """Ranked high-priority potential compliance gap card with advisory explanation."""

    priority_rank: int = Field(
        ...,
        description="Deterministic priority ranking (1 is highest priority).",
    )
    provision_id: str = Field(
        ...,
        description="Authoritative regulatory provision or section ID (e.g., '2.1', '6.1').",
    )
    clause_id: Optional[str] = Field(
        default=None,
        description="Deterministic regulatory clause ID.",
    )
    gap_type: str = Field(
        ...,
        description="Deterministic gap classification (e.g., 'DURATION_MISMATCH', 'MODALITY_MISMATCH', 'MISSING_POLICY_COVERAGE').",
    )
    severity: str = Field(
        ...,
        description="Deterministic gap severity: HIGH, MEDIUM, or LOW.",
    )
    explanation: str = Field(
        ...,
        description="Clear, advisory explanation of why the company policy fails or partially matches the revised requirement.",
    )
    matched_policy_section: Optional[str] = Field(
        default=None,
        description="Actual mapped policy section or provision if matched (or 'Uncovered Requirement').",
    )
    matched_policy_clause_id: Optional[str] = Field(
        default=None,
        description="Deterministic policy clause ID if mapped.",
    )
    remediation_hint: Optional[str] = Field(
        default=None,
        description="Advisory guidance on how to adjust internal policy or procedure.",
    )
    evidence_id: Optional[str] = Field(
        default=None,
        description="Reference ID to the deterministic policy mapping evidence record.",
    )
    regulatory_text_snippet: Optional[str] = Field(
        default=None,
        description="Exact snippet from the regulatory requirement.",
    )
    policy_text_snippet: Optional[str] = Field(
        default=None,
        description="Exact snippet from the company policy.",
    )
    difference_summary: Optional[str] = Field(
        default=None,
        description="Deterministic difference summary (e.g., 'Policy specifies 24 months vs 12 months required').",
    )
    compliance_status: str = Field(
        default="NON_COMPLIANT",
        description="Deterministic compliance status: NON_COMPLIANT or PARTIAL_MATCH.",
    )


class PolicyRecommendation(BaseModel):
    """Actionable advisory recommendation for policy remediation grounded in deterministic gaps."""

    id: str = Field(
        ...,
        description="Unique identifier for the recommendation.",
    )
    priority: str = Field(
        ...,
        description="Action priority: High, Medium, or Low based on gap severity.",
    )
    category: str = Field(
        ...,
        description="Category: update_review_frequency, update_reporting_deadline, update_monetary_threshold, update_mandatory_language, operational_procedure, or section_review.",
    )
    affected_policy_clause: str = Field(
        ...,
        description="Real mapped policy clause or section (e.g., 'Section 4.2 - Review Frequency' or 'Uncovered Requirement').",
    )
    target_provision_id: Optional[str] = Field(
        default=None,
        description="Regulatory provision ID necessitating this change.",
    )
    recommendation: str = Field(
        ...,
        description="Actionable policy update recommendation text.",
    )
    reason: str = Field(
        ...,
        description="Grounding rationale explaining why this recommendation is needed.",
    )
    action_state: Optional[str] = Field(
        default="pending_review",
        description="Advisory action status: 'pending_review', 'in_progress', 'applied'.",
    )


class RegulatoryChangeInsight(BaseModel):
    """Advisory explanation for high-impact regulatory changes."""

    change_id: str = Field(
        ...,
        description="Deterministic change analysis record ID.",
    )
    provision_id: Optional[str] = Field(
        default=None,
        description="Regulatory provision ID.",
    )
    title: str = Field(
        ...,
        description="Descriptive title of the regulatory requirement or change.",
    )
    change_type: str = Field(
        ...,
        description="Deterministic change type: Substantive, Administrative, Wording, Added Candidate, Removed Candidate.",
    )
    materiality: str = Field(
        ...,
        description="Deterministic materiality: High, Medium, Low.",
    )
    change_dimension: Optional[str] = Field(
        default=None,
        description="Detected dimension: duration, deadline, threshold, modality, obligation, scope, wording.",
    )
    old_value: Optional[str] = Field(
        default=None,
        description="Deterministic old requirement parameter.",
    )
    new_value: Optional[str] = Field(
        default=None,
        description="Deterministic new requirement parameter.",
    )
    explanation: str = Field(
        ...,
        description="Human-readable advisory explanation of what changed and why it matters.",
    )
    impact_summary: Optional[str] = Field(
        default=None,
        description="Summary of operational or compliance impact.",
    )
    old_clause_id: Optional[str] = Field(
        default=None,
        description="Deterministic previous clause ID.",
    )
    new_clause_id: Optional[str] = Field(
        default=None,
        description="Deterministic current clause ID.",
    )


class AnalysisInsightsResponse(BaseModel):
    """Root response model for the /api/analysis/{analysis_id}/insights endpoints."""

    analysis_id: str
    status: str = Field(
        default="available",
        description="Status of advisory insights: 'available', 'unavailable', 'no_policy', 'error'.",
    )
    is_advisory: bool = True
    disclaimer: str = "Deterministic NLP remains the source of truth. Groq AI insights are strictly advisory recommendations."
    model: Optional[str] = None
    created_at: Optional[str] = None
    has_policy: bool = False
    executive_summary: Optional[ExecutiveComplianceSummary] = None
    top_gaps: List[TopComplianceGapInsight] = Field(default_factory=list)
    policy_recommendations: List[PolicyRecommendation] = Field(default_factory=list)
    key_regulatory_changes: List[RegulatoryChangeInsight] = Field(default_factory=list)
    metrics: Dict[str, Any] = Field(default_factory=dict)
    error_message: Optional[str] = None
