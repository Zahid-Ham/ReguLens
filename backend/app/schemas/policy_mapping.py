"""Pydantic Schemas for Company Policy Mapping, Compliance Impact, and Evidence Models."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ParameterMismatch(BaseModel):
    """Specific field or constraint mismatch between regulatory requirement and policy."""

    dimension: str = Field(description="Parameter dimension (e.g. DURATION, DEADLINE, MONETARY_THRESHOLD, MODALITY, ACTION, MISSING_ELEMENT)")
    regulatory_value: Optional[str] = Field(default=None, description="Prescribed value in regulation")
    policy_value: Optional[str] = Field(default=None, description="Actual value in company policy")
    description: str = Field(description="Human-readable explanation of the discrepancy")
    severity: str = Field(default="MEDIUM", description="Discrepancy severity: HIGH, MEDIUM, LOW")


class RegulatoryRequirementItem(BaseModel):
    """Structured regulatory obligation or constraint extracted from current regulation."""

    requirement_id: str = Field(description="Unique requirement identifier")
    document_id: str = Field(description="Source regulatory document ID")
    clause_id: str = Field(description="Regulatory clause ID")
    provision_id: Optional[str] = Field(default=None, description="Provision number (e.g. 3.2, 6.1)")
    clause_text: str = Field(description="Complete regulatory clause text")
    change_type: str = Field(default="MODIFIED", description="Comparison change type: MODIFIED, ADDED, WORDING_ONLY, UNCHANGED")
    change_category: Optional[str] = Field(default=None, description="Substantive, Structural, Wording, etc.")
    materiality: str = Field(default="LOW", description="Materiality classification: HIGH, MEDIUM, LOW")
    regulatory_function: str = Field(default="OBLIGATION", description="Function label: OBLIGATION, PROHIBITION, REPORTING, PROCEDURE, PERMISSION")
    subject: Optional[str] = Field(default=None, description="Regulated subject / duty holder")
    modality: Optional[str] = Field(default=None, description="Modal auxiliary (e.g. shall, must, may)")
    action: Optional[str] = Field(default=None, description="Operative requirement action verb")
    object: Optional[str] = Field(default=None, description="Target object of requirement")
    deadline: Optional[str] = Field(default=None, description="Extracted compliance deadline")
    duration: Optional[str] = Field(default=None, description="Extracted review frequency or period duration")
    monetary_value: Optional[str] = Field(default=None, description="Extracted monetary amount")
    threshold: Optional[str] = Field(default=None, description="Extracted threshold parameter")
    condition: Optional[str] = Field(default=None, description="Applicable conditional scope")
    entities: List[str] = Field(default_factory=list, description="Extracted domain entity keywords")


class PolicyRequirementItem(BaseModel):
    """Structured policy provision extracted from uploaded company policy."""

    policy_clause_id: str = Field(description="Unique policy clause identifier")
    policy_document_id: str = Field(description="Company policy document ID")
    section_id: Optional[str] = Field(default=None, description="Policy section or heading number (e.g. Policy 3.2)")
    section_title: Optional[str] = Field(default=None, description="Section heading title")
    policy_clause_text: str = Field(description="Complete policy clause text")
    subject: Optional[str] = Field(default=None, description="Policy actor or target group")
    modality: Optional[str] = Field(default=None, description="Policy obligation force (must, shall, will, may)")
    action: Optional[str] = Field(default=None, description="Prescribed internal action verb")
    object: Optional[str] = Field(default=None, description="Target object of internal action")
    deadline: Optional[str] = Field(default=None, description="Internal policy deadline")
    duration: Optional[str] = Field(default=None, description="Internal review frequency or retention duration")
    monetary_value: Optional[str] = Field(default=None, description="Internal monetary limit or threshold")
    threshold: Optional[str] = Field(default=None, description="Internal threshold parameter")
    condition: Optional[str] = Field(default=None, description="Policy applicability condition")
    entities: List[str] = Field(default_factory=list, description="Extracted policy entity keywords")


class RegulatoryEvidence(BaseModel):
    """Verifiable citation for regulatory requirement."""

    document_id: str = Field(description="Regulatory document ID")
    document_title: str = Field(description="Regulatory document title or filename")
    provision_id: Optional[str] = Field(default=None, description="Provision number")
    clause_id: str = Field(description="Clause ID")
    clause_text: str = Field(description="Exact verbatim regulatory text")


class PolicyEvidence(BaseModel):
    """Verifiable citation for company policy provision."""

    document_id: str = Field(description="Company policy document ID")
    document_title: str = Field(description="Company policy document title or filename")
    section_id: Optional[str] = Field(default=None, description="Section number or identifier")
    section_title: Optional[str] = Field(default=None, description="Section name")
    clause_id: str = Field(description="Policy clause ID")
    clause_text: str = Field(description="Exact verbatim company policy text")


class PolicyMappingRecord(BaseModel):
    """Individual alignment and compliance evaluation between a regulatory requirement and company policy."""

    mapping_id: str = Field(description="Unique mapping record ID")
    regulatory_requirement: RegulatoryRequirementItem = Field(description="Source regulatory requirement")
    regulatory_evidence: RegulatoryEvidence = Field(description="Verifiable regulatory citation")
    matched_policy_requirement: Optional[PolicyRequirementItem] = Field(default=None, description="Matched company policy provision if found")
    policy_evidence: Optional[PolicyEvidence] = Field(default=None, description="Verifiable policy citation if found")
    semantic_similarity: float = Field(default=0.0, description="Semantic similarity score (0.0 to 1.0)")
    compliance_status: str = Field(description="Compliance determination: COMPLIANT, PARTIAL_MATCH, NON_COMPLIANT, NO_MATCH_FOUND")
    severity: str = Field(default="NONE", description="Gap severity: HIGH, MEDIUM, LOW, NONE")
    gap_type: Optional[str] = Field(default=None, description="Categorical gap identifier (e.g. DURATION_MISMATCH, DEADLINE_MISMATCH)")
    gap_details: str = Field(description="Human-readable summary of gap or alignment status")
    mismatches: List[ParameterMismatch] = Field(default_factory=list, description="Detailed list of specific constraint discrepancies")
    ai_explanation: Optional[str] = Field(default=None, description="Advisory AI natural language explanation")
    ai_recommendation: Optional[str] = Field(default=None, description="Advisory AI remediation recommendation")


class ComplianceGapHighlight(BaseModel):
    """High-priority compliance gap summary item for executive panel."""

    mapping_id: str = Field(description="Associated mapping record ID")
    provision_id: Optional[str] = Field(default=None, description="Regulatory provision ID")
    title: str = Field(description="Descriptive gap title")
    severity: str = Field(description="Severity rating (HIGH, MEDIUM, LOW)")
    gap_type: str = Field(description="Gap type")
    description: str = Field(description="Concise description of the policy gap")


class PolicyRecommendationHighlight(BaseModel):
    """Actionable policy remediation recommendation for executive panel."""

    mapping_id: str = Field(description="Associated mapping record ID")
    provision_id: Optional[str] = Field(default=None, description="Regulatory provision ID")
    policy_section: Optional[str] = Field(default=None, description="Target policy section to amend")
    recommendation: str = Field(description="Actionable remediation guidance")


class PolicyMappingSummary(BaseModel):
    """Aggregate summary metrics and executive highlights for Company Policy Mapping."""

    total_regulatory_requirements: int = Field(default=0, description="Total enforceable regulatory requirements extracted from regulation")
    mapped_to_policy: int = Field(default=0, description="Count of requirements successfully mapped to policy provisions")
    coverage_percentage: int = Field(default=0, description="Percentage of requirements mapped to company policy")
    policy_gaps: int = Field(default=0, description="Count of non-compliant requirements requiring policy update")
    partial_matches: int = Field(default=0, description="Count of partially aligned requirements needing review")
    no_match_found: int = Field(default=0, description="Count of requirements with no corresponding policy clause")
    compliant_count: int = Field(default=0, description="Count of fully compliant requirements")
    high_severity_gaps: int = Field(default=0, description="Count of high-severity compliance gaps")
    top_gaps: List[ComplianceGapHighlight] = Field(default_factory=list, description="Top detected compliance gaps")
    top_recommendations: List[PolicyRecommendationHighlight] = Field(default_factory=list, description="Top policy remediation recommendations")
    executive_summary: Optional[str] = Field(default=None, description="Executive narrative summary of policy alignment")


class PolicyMappingResponse(BaseModel):
    """Complete API response payload for Company Policy Mapping & Compliance Impact."""

    analysis_id: str = Field(description="Analysis job identifier")
    has_policy: bool = Field(default=True, description="Indicates whether a company policy was uploaded and analyzed")
    policy_document_id: Optional[str] = Field(default=None, description="Company policy document ID")
    policy_document_title: Optional[str] = Field(default=None, description="Company policy document title or filename")
    summary: PolicyMappingSummary = Field(description="Aggregate mapping metrics and highlights")
    mappings: List[PolicyMappingRecord] = Field(default_factory=list, description="Granular requirement mapping records")
