"""Global Insights Service Coordinator.

Coordinates deterministic cross-analysis aggregation, time-series bucketing,
and AI advisory brief generation for the /insights dashboard.
"""

from typing import Optional
from app.schemas.insights import AIRegulatoryBrief, GlobalInsightsResponse
from app.services.insights.insights_aggregation_service import InsightsAggregationService
from app.services.insights.insights_ai_service import InsightsAIService


class GlobalInsightsService:
    """Main coordinator service for global regulatory insights."""

    def __init__(
        self,
        aggregation_service: InsightsAggregationService,
        ai_service: InsightsAIService,
    ):
        self.aggregation_service = aggregation_service
        self.ai_service = ai_service

    async def get_global_insights(
        self,
        time_range: str = "12m",
        trend_granularity: str = "monthly",
        refresh_ai: bool = False,
    ) -> GlobalInsightsResponse:
        """Fetch complete aggregated global insights payload."""
        insights = self.aggregation_service.aggregate_global_insights(
            time_range=time_range,
            trend_granularity=trend_granularity,
        )

        if not insights.has_data:
            return insights

        # Generate or refresh AI advisory brief
        if refresh_ai or self.ai_service.api_key:
            ai_brief = await self.ai_service.generate_global_ai_brief(
                total_analyses=insights.kpis.total_analyses,
                total_changes=insights.kpis.regulatory_changes,
                potential_gaps=insights.kpis.potential_gaps,
                substantive_changes=insights.kpis.substantive_changes,
                policy_coverage_pct=insights.kpis.policy_coverage_pct,
                top_risk_areas=insights.top_risk_areas,
                regulatory_themes=insights.regulatory_themes,
            )
            insights.ai_brief = ai_brief

        return insights

    async def refresh_ai_brief(self, time_range: str = "12m") -> AIRegulatoryBrief:
        """Force regenerate fresh AI advisory brief."""
        insights = self.aggregation_service.aggregate_global_insights(time_range=time_range)
        return await self.ai_service.generate_global_ai_brief(
            total_analyses=insights.kpis.total_analyses,
            total_changes=insights.kpis.regulatory_changes,
            potential_gaps=insights.kpis.potential_gaps,
            substantive_changes=insights.kpis.substantive_changes,
            policy_coverage_pct=insights.kpis.policy_coverage_pct,
            top_risk_areas=insights.top_risk_areas,
            regulatory_themes=insights.regulatory_themes,
        )
