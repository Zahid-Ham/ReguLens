"""AI Advisory Insights API Router.

Exposes endpoints to retrieve and refresh evidence-grounded AI advisory intelligence
built atop deterministic regulatory changes and company policy mappings.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import (
    get_analysis_history_service,
    get_analysis_service,
    get_data_repository,
    get_groq_insights_service,
    get_policy_mapping_service,
)
from app.schemas.ai_insights import AnalysisInsightsResponse
from app.services.analysis_history_service import AnalysisHistoryService
from app.services.analysis_service import AnalysisService
from app.services.compliance.groq_insights_service import GroqInsightsService
from app.services.compliance.policy_mapping_service import PolicyMappingService
from app.services.data_repository import DataRepository

router = APIRouter(prefix="/analysis", tags=["AI Advisory Insights"])


async def _resolve_and_generate_insights(
    analysis_id: str,
    force_refresh: bool,
    history_service: AnalysisHistoryService,
    groq_insights_service: GroqInsightsService,
    data_repo: DataRepository,
    policy_mapping_service: PolicyMappingService,
    analysis_service: AnalysisService,
) -> AnalysisInsightsResponse:
    """Helper to fetch or generate advisory insights for an analysis."""
    clean_id = analysis_id.strip()
    record = history_service.get_analysis_by_id(clean_id)

    if not record and clean_id == "psl-2020-2025":
        # Ensure seed exists
        history_service.seed_canonical_psl_analysis()
        record = history_service.get_analysis_by_id(clean_id)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis with id '{clean_id}' not found.",
        )

    # Return cached insights if available, valid, and refresh not forced
    if not force_refresh and isinstance(record.ai_insights_data, dict):
        try:
            cached = AnalysisInsightsResponse(**record.ai_insights_data)
            if cached.key_regulatory_changes or not (record.overview_summary or record.changes_data):
                return cached
        except Exception:
            # If cached schema evolved or is invalid, regenerate gracefully
            pass



    # Resolve changes and mappings data
    changes_list = []
    overview_summary = record.overview_summary or {}
    mappings_list = []
    policy_summary = record.policy_summary or {}
    has_policy = bool(record.company_policy_document_id or record.policy_mappings_data)

    if clean_id == "psl-2020-2025":
        try:
            changes_objs, _ = analysis_service.get_all_changes(limit=1000)
            changes_list = [c.model_dump() for c in changes_objs]
            overview_obj = analysis_service.get_analysis_overview()
            overview_summary = overview_obj.model_dump()
        except Exception as e:
            print(f"[Insights] Canonical PSL changes loading warning: {e}")
            changes_list = record.changes_data or []

        mappings_list = record.policy_mappings_data or []
        policy_summary = record.policy_summary or {}
        has_policy = bool(record.company_policy_document_id or record.policy_mappings_data)
    else:
        changes_list = record.changes_data or []
        mappings_list = record.policy_mappings_data or []
        policy_summary = record.policy_summary or {}
        has_policy = bool(record.company_policy_document_id or record.policy_mappings_data)



    insights_response = await groq_insights_service.generate_advisory_insights(
        analysis_id=clean_id,
        title=record.title,
        overview_summary=overview_summary,
        policy_summary=policy_summary if has_policy else None,
        changes=changes_list,
        mappings=mappings_list,
        has_policy=has_policy,
    )

    # Persist in SQLite
    history_service.save_analysis_insights(clean_id, insights_response.model_dump())

    return insights_response


@router.get(
    "/{analysis_id}/insights",
    response_model=AnalysisInsightsResponse,
    summary="Get AI Advisory Insights for Analysis",
    description="Retrieve persisted or generated evidence-grounded AI advisory insights for an analysis.",
)
async def get_analysis_insights(
    analysis_id: str,
    history_service: AnalysisHistoryService = Depends(get_analysis_history_service),
    groq_insights_service: GroqInsightsService = Depends(get_groq_insights_service),
    data_repo: DataRepository = Depends(get_data_repository),
    policy_mapping_service: PolicyMappingService = Depends(get_policy_mapping_service),
    analysis_service: AnalysisService = Depends(get_analysis_service),
) -> AnalysisInsightsResponse:
    """Retrieve evidence-grounded AI advisory insights with persistence caching."""
    return await _resolve_and_generate_insights(
        analysis_id=analysis_id,
        force_refresh=False,
        history_service=history_service,
        groq_insights_service=groq_insights_service,
        data_repo=data_repo,
        policy_mapping_service=policy_mapping_service,
        analysis_service=analysis_service,
    )


@router.post(
    "/{analysis_id}/insights/refresh",
    response_model=AnalysisInsightsResponse,
    summary="Refresh AI Advisory Insights",
    description="Regenerate advisory insights for an analysis and update SQLite persistence.",
)
async def refresh_analysis_insights(
    analysis_id: str,
    history_service: AnalysisHistoryService = Depends(get_analysis_history_service),
    groq_insights_service: GroqInsightsService = Depends(get_groq_insights_service),
    data_repo: DataRepository = Depends(get_data_repository),
    policy_mapping_service: PolicyMappingService = Depends(get_policy_mapping_service),
    analysis_service: AnalysisService = Depends(get_analysis_service),
) -> AnalysisInsightsResponse:
    """Regenerate and persist fresh advisory insights."""
    return await _resolve_and_generate_insights(
        analysis_id=analysis_id,
        force_refresh=True,
        history_service=history_service,
        groq_insights_service=groq_insights_service,
        data_repo=data_repo,
        policy_mapping_service=policy_mapping_service,
        analysis_service=analysis_service,
    )


@router.get(
    "/{analysis_id}/insights/{insight_id}",
    summary="Get Specific Insight Detail",
    description="Retrieve a single insight with associated deterministic evidence references.",
)
async def get_single_insight_detail(
    analysis_id: str,
    insight_id: str,
    history_service: AnalysisHistoryService = Depends(get_analysis_history_service),
    groq_insights_service: GroqInsightsService = Depends(get_groq_insights_service),
    data_repo: DataRepository = Depends(get_data_repository),
    policy_mapping_service: PolicyMappingService = Depends(get_policy_mapping_service),
    analysis_service: AnalysisService = Depends(get_analysis_service),
):
    """Retrieve single insight detail by item ID or rank."""
    insights = await _resolve_and_generate_insights(
        analysis_id=analysis_id,
        force_refresh=False,
        history_service=history_service,
        groq_insights_service=groq_insights_service,
        data_repo=data_repo,
        policy_mapping_service=policy_mapping_service,
        analysis_service=analysis_service,
    )


    clean_item_id = insight_id.strip().lower()

    # Search in top gaps
    for g in insights.top_gaps:
        if (
            str(g.priority_rank) == clean_item_id
            or str(g.provision_id).lower() == clean_item_id
            or str(g.clause_id).lower() == clean_item_id
            or str(g.evidence_id).lower() == clean_item_id
        ):
            return {"type": "top_gap", "item": g}

    # Search in policy recommendations
    for r in insights.policy_recommendations:
        if r.id.lower() == clean_item_id or (r.target_provision_id and r.target_provision_id.lower() == clean_item_id):
            return {"type": "policy_recommendation", "item": r}

    # Search in regulatory changes
    for c in insights.key_regulatory_changes:
        if c.change_id.lower() == clean_item_id or (c.provision_id and c.provision_id.lower() == clean_item_id):
            return {"type": "regulatory_change", "item": c}

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Insight item with id '{insight_id}' not found for analysis '{analysis_id}'.",
    )
