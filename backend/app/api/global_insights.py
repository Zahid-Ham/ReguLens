"""Global Insights API Router.

Exposes endpoints providing aggregated cross-analysis regulatory intelligence,
KPI metrics, time-series trends, change distributions, compliance risk rankings,
policy impact areas, high-impact changes, NLP-derived themes, and evidence-grounded AI brief.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query

from app.dependencies import get_global_insights_service
from app.schemas.insights import (
    AIRegulatoryBrief,
    ChangeDistribution,
    ComplianceRiskArea,
    FrequentlyAffectedPolicyArea,
    GlobalInsightsResponse,
    InsightsKPICards,
    RecentHighImpactChange,
    RegulatorCoverage,
    RegulatoryTheme,
    TrendPoint,
)
from app.services.insights.insights_service import GlobalInsightsService

router = APIRouter(prefix="/insights", tags=["Global Regulatory Insights"])


@router.get(
    "",
    response_model=GlobalInsightsResponse,
    summary="Get aggregated global regulatory insights across all analyses",
)
async def get_global_insights(
    time_range: str = Query(default="12m", description="Time filter: '30d', '90d', '180d', '1y'/'12m', 'all'"),
    trend_granularity: str = Query(default="monthly", description="Trend series granularity: 'monthly' or 'weekly'"),
    refresh_ai: bool = Query(default=False, description="Force re-generation of AI advisory brief"),
    service: GlobalInsightsService = Depends(get_global_insights_service),
) -> GlobalInsightsResponse:
    """Retrieve full aggregated global intelligence payload."""
    return await service.get_global_insights(
        time_range=time_range,
        trend_granularity=trend_granularity,
        refresh_ai=refresh_ai,
    )


@router.post(
    "/ai-brief",
    response_model=AIRegulatoryBrief,
    summary="Regenerate evidence-grounded AI regulatory intelligence brief",
)
async def refresh_ai_brief(
    time_range: str = Query(default="12m", description="Time filter range"),
    service: GlobalInsightsService = Depends(get_global_insights_service),
) -> AIRegulatoryBrief:
    """Regenerate fresh AI advisory brief based on current persisted data."""
    return await service.refresh_ai_brief(time_range=time_range)


@router.get(
    "/overview",
    response_model=InsightsKPICards,
    summary="Get aggregated KPI metric cards",
)
async def get_insights_kpis(
    time_range: str = Query(default="12m"),
    service: GlobalInsightsService = Depends(get_global_insights_service),
) -> InsightsKPICards:
    """Get KPI metrics."""
    data = await service.get_global_insights(time_range=time_range)
    return data.kpis


@router.get(
    "/trends",
    response_model=List[TrendPoint],
    summary="Get time-series regulatory changes trend",
)
async def get_insights_trends(
    time_range: str = Query(default="12m"),
    trend_granularity: str = Query(default="monthly"),
    service: GlobalInsightsService = Depends(get_global_insights_service),
) -> List[TrendPoint]:
    """Get time-series trend data points."""
    data = await service.get_global_insights(time_range=time_range, trend_granularity=trend_granularity)
    return data.changes_trend


@router.get(
    "/change-distribution",
    response_model=ChangeDistribution,
    summary="Get aggregate change type breakdown",
)
async def get_change_distribution(
    time_range: str = Query(default="12m"),
    service: GlobalInsightsService = Depends(get_global_insights_service),
) -> ChangeDistribution:
    """Get change distribution data."""
    data = await service.get_global_insights(time_range=time_range)
    return data.change_distribution


@router.get(
    "/risk-areas",
    response_model=List[ComplianceRiskArea],
    summary="Get top compliance risk areas",
)
async def get_risk_areas(
    time_range: str = Query(default="12m"),
    service: GlobalInsightsService = Depends(get_global_insights_service),
) -> List[ComplianceRiskArea]:
    """Get ranked compliance risk areas."""
    data = await service.get_global_insights(time_range=time_range)
    return data.top_risk_areas


@router.get(
    "/policy-areas",
    response_model=List[FrequentlyAffectedPolicyArea],
    summary="Get frequently affected policy areas",
)
async def get_policy_areas(
    time_range: str = Query(default="12m"),
    service: GlobalInsightsService = Depends(get_global_insights_service),
) -> List[FrequentlyAffectedPolicyArea]:
    """Get frequently affected policy sections."""
    data = await service.get_global_insights(time_range=time_range)
    return data.frequently_affected_policy_areas


@router.get(
    "/recent-changes",
    response_model=List[RecentHighImpactChange],
    summary="Get recent high-impact regulatory changes",
)
async def get_recent_changes(
    time_range: str = Query(default="12m"),
    service: GlobalInsightsService = Depends(get_global_insights_service),
) -> List[RecentHighImpactChange]:
    """Get recent high-impact changes."""
    data = await service.get_global_insights(time_range=time_range)
    return data.recent_high_impact_changes


@router.get(
    "/regulatory-themes",
    response_model=List[RegulatoryTheme],
    summary="Get NLP-extracted regulatory themes",
)
async def get_regulatory_themes(
    time_range: str = Query(default="12m"),
    service: GlobalInsightsService = Depends(get_global_insights_service),
) -> List[RegulatoryTheme]:
    """Get NLP-extracted themes."""
    data = await service.get_global_insights(time_range=time_range)
    return data.regulatory_themes


@router.get(
    "/regulator-coverage",
    response_model=RegulatorCoverage,
    summary="Get analysis coverage across regulatory authorities",
)
async def get_regulator_coverage(
    time_range: str = Query(default="12m"),
    service: GlobalInsightsService = Depends(get_global_insights_service),
) -> RegulatorCoverage:
    """Get regulator coverage breakdown."""
    data = await service.get_global_insights(time_range=time_range)
    return data.regulator_coverage
