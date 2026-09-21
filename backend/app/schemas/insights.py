"""Pydantic Schemas for ReguLens Global Insights Dashboard (/insights).

Defines structured models for aggregated regulatory intelligence across all
completed persistent analyses, including KPI metrics, time-series trends,
change distributions, compliance risk rankings, policy impact areas,
high-impact changes, NLP-derived themes, and evidence-grounded AI brief.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class InsightsKPICards(BaseModel):
    """Aggregate KPI metrics across all completed analyses with period deltas."""

    total_analyses: int = Field(default=0, description="Total count of completed analyses.")
    total_analyses_delta: Optional[str] = Field(default="+0% vs. previous period", description="Period-over-period delta.")
    
    regulatory_changes: int = Field(default=0, description="Aggregate regulatory changes across completed analyses.")
    regulatory_changes_delta: Optional[str] = Field(default="+0% vs. previous period", description="Period-over-period delta.")
    
    potential_gaps: int = Field(default=0, description="Aggregate non-compliant + partial-match gaps across mapped policies.")
    potential_gaps_delta: Optional[str] = Field(default="+0% vs. previous period", description="Period-over-period delta.")
    
    substantive_changes: int = Field(default=0, description="Aggregate substantive regulatory modifications.")
    substantive_changes_delta: Optional[str] = Field(default="+0% vs. previous period", description="Period-over-period delta.")
    
    policies_mapped: int = Field(default=0, description="Number of analyses with active policy mappings.")
    policies_mapped_delta: Optional[str] = Field(default="+0% vs. previous period", description="Period-over-period delta.")
    
    policy_coverage_pct: float = Field(default=0.0, description="Overall policy compliance coverage rate (0-100).")
    policy_coverage_delta: Optional[str] = Field(default="+0% vs. previous period", description="Period-over-period delta.")


class TrendPoint(BaseModel):
    """Single time-bucketed point in the regulatory changes trend series."""

    period: str = Field(..., description="Bucket label (e.g., 'Jan', 'Feb', 'Sep 2026', 'W38 2026').")
    timestamp: Optional[str] = Field(default=None, description="ISO timestamp of the bucket start.")
    substantive: int = Field(default=0, description="Substantive changes count in this period.")
    administrative: int = Field(default=0, description="Administrative changes count in this period.")
    wording_only: int = Field(default=0, description="Wording-only changes count in this period.")
    added_candidate: int = Field(default=0, description="NLP-assisted Added candidate count in this period.")
    removed_candidate: int = Field(default=0, description="NLP-assisted Removed candidate count in this period.")
    total: int = Field(default=0, description="Total regulatory changes in this period.")


class ChangeDistributionItem(BaseModel):
    """Category breakdown item for change type distribution donut chart."""

    type: str = Field(..., description="Category label (e.g. Substantive, Administrative, Wording Only, Added (Candidate), Removed (Candidate)).")
    count: int = Field(default=0, description="Total changes of this type.")
    percentage: float = Field(default=0.0, description="Percentage of total changes (0-100).")
    color: str = Field(default="#1E4333", description="Color token for chart visualization.")


class ChangeDistribution(BaseModel):
    """Aggregated change type distribution model."""

    total_changes: int = Field(default=0, description="Total aggregate regulatory changes.")
    items: List[ChangeDistributionItem] = Field(default_factory=list, description="Categorized change slices.")


class ComplianceRiskArea(BaseModel):
    """Ranked high-risk compliance domain derived from policy mapping gap details."""

    risk_area: str = Field(..., description="Domain name (e.g. Customer Due Diligence, Reporting Requirements, Priority Sector Targets).")
    potential_gaps: int = Field(default=0, description="Number of potential compliance gaps in this area.")
    high_impact: int = Field(default=0, description="Number of high-impact/severity gaps in this area.")
    percentage: float = Field(default=0.0, description="Relative percentage compared to total gaps.")
    bar_color: str = Field(default="#F87171", description="Visual bar accent color.")


class FrequentlyAffectedPolicyArea(BaseModel):
    """Internal policy sections or provisions repeatedly impacted across analyses."""

    policy_area: str = Field(..., description="Policy section title (e.g. Customer Verification, Periodic Review, Reporting).")
    analyses_affected: int = Field(default=0, description="Count of analyses impacting this policy section.")
    percentage: float = Field(default=0.0, description="Relative percentage indicator.")


class RecentHighImpactChange(BaseModel):
    """Compact record of a recent high-materiality regulatory modification."""

    id: str = Field(..., description="Unique record identifier.")
    change_id: str = Field(..., description="Deterministic change record ID.")
    analysis_id: str = Field(..., description="Parent analysis ID for navigation.")
    analysis_title: str = Field(..., description="Parent analysis title or regulation name.")
    provision_id: Optional[str] = Field(default=None, description="Provision or clause section number.")
    description: str = Field(..., description="Concise requirement or change summary.")
    materiality: str = Field(default="HIGH", description="Materiality classification: HIGH, MEDIUM, LOW.")
    change_type: str = Field(default="Substantive", description="Detected change type.")
    date: str = Field(..., description="Formatted date string (e.g., 'Sep 15, 2026').")


class RegulatoryTheme(BaseModel):
    """NLP-extracted recurring regulatory theme or concept across analyses."""

    theme: str = Field(..., description="Theme concept name (e.g. Customer Due Diligence, Reporting, Risk Assessment).")
    count: int = Field(default=0, description="Occurrence count across extracted requirements and changes.")
    percentage: float = Field(default=0.0, description="Relative frequency percentage.")


class RegulatorCoverageItem(BaseModel):
    """Breakdown slice for regulatory authority coverage."""

    regulator: str = Field(..., description="Regulatory body name (e.g. RBI, SEBI, IRDAI, Other).")
    analyses_count: int = Field(default=0, description="Number of analyses under this regulator.")
    percentage: float = Field(default=0.0, description="Share percentage of total analyses.")
    color: str = Field(default="#1E4333", description="Color token for chart visualization.")


class RegulatorCoverage(BaseModel):
    """Aggregate distribution across regulatory bodies."""

    total_analyses: int = Field(default=0, description="Total analyses counted.")
    primary_regulator: str = Field(default="RBI", description="Primary regulatory authority in current corpus.")
    items: List[RegulatorCoverageItem] = Field(default_factory=list, description="Breakdown items.")
    note: Optional[str] = Field(
        default="Current corpus is primarily focused on Reserve Bank of India (RBI) regulatory master directions.",
        description="Exploratory context note."
    )


class AIRegulatoryBrief(BaseModel):
    """Synthesized global advisory intelligence brief powered by Groq (openai/gpt-oss-120b)."""

    summary_text: str = Field(
        ...,
        description="Grounded 2-4 sentence executive advisory summary across all completed analyses."
    )
    key_observations: List[str] = Field(
        default_factory=list,
        description="Top 2-3 specific bulleted observations derived from the aggregated numbers."
    )
    is_advisory: bool = True
    disclaimer: str = Field(
        default="These insights are AI-generated and should be used for guidance only. Deterministic analysis results remain the source of truth.",
        description="Compliance advisory disclaimer."
    )
    model: Optional[str] = None
    generated_at: Optional[str] = None


class GlobalInsightsResponse(BaseModel):
    """Unified root response model for GET /api/insights."""

    time_range: str = Field(default="12m", description="Active time filter range: '30d', '90d', '180d', '1y'/'12m', 'all'.")
    has_data: bool = Field(default=False, description="Whether any completed analyses exist in the database.")
    kpis: InsightsKPICards = Field(default_factory=InsightsKPICards)
    changes_trend: List[TrendPoint] = Field(default_factory=list)
    trend_granularity: str = Field(default="monthly", description="Active trend granularity: 'monthly' or 'weekly'.")
    change_distribution: ChangeDistribution = Field(default_factory=ChangeDistribution)
    ai_brief: AIRegulatoryBrief = Field(
        default_factory=lambda: AIRegulatoryBrief(
            summary_text="No regulatory intelligence available yet. Run your first regulatory analysis to start building your Insights workspace."
        )
    )
    top_risk_areas: List[ComplianceRiskArea] = Field(default_factory=list)
    frequently_affected_policy_areas: List[FrequentlyAffectedPolicyArea] = Field(default_factory=list)
    recent_high_impact_changes: List[RecentHighImpactChange] = Field(default_factory=list)
    regulatory_themes: List[RegulatoryTheme] = Field(default_factory=list)
    regulator_coverage: RegulatorCoverage = Field(default_factory=RegulatorCoverage)
