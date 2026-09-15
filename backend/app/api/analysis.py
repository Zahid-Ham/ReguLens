"""Regulatory Change Intelligence API Router."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies import get_analysis_service, get_dynamic_comparison_service
from app.schemas.analysis import (
    AnalysisOverview,
    ChangeListResponse,
    ChangeRecord,
    ClauseDetail,
    RequirementListResponse,
)
from app.services.analysis_service import AnalysisService
from app.services.dynamic_comparison_service import DynamicComparisonService

router = APIRouter(prefix="/analysis", tags=["Regulatory Change Intelligence"])


def _is_psl_analysis(analysis_id: str) -> bool:
    clean = analysis_id.strip().lower()
    return clean in ["psl-2020-2025", "psl_2020_2025", "psl2020-2025"]


@router.get(
    "/{analysis_id}",
    response_model=AnalysisOverview,
    summary="Get Analysis Overview",
    description="Retrieve high-level analysis statistics, change breakdowns, and methodology notes for any regulatory comparison (PSL or dynamic).",
)
async def get_analysis_overview(
    analysis_id: str,
    analysis_service: AnalysisService = Depends(get_analysis_service),
    dynamic_comparison_service: DynamicComparisonService = Depends(
        get_dynamic_comparison_service
    ),
) -> AnalysisOverview:
    """Retrieve summary and change metrics for specified analysis ID."""
    if _is_psl_analysis(analysis_id):
        return analysis_service.get_analysis_overview()

    overview = dynamic_comparison_service.get_analysis_overview(analysis_id=analysis_id)
    if not overview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis '{analysis_id}' not found.",
        )
    return overview


@router.get(
    "/{analysis_id}/changes",
    response_model=ChangeListResponse,
    summary="List Regulatory Changes",
    description="Query and filter mapped clause comparisons and regulatory change intelligence for any regulatory analysis.",
)
async def list_analysis_changes(
    analysis_id: str,
    change_type: Optional[str] = Query(
        default=None,
        description="Filter by change type (e.g. MODIFIED, REMOVED, WORDING_ONLY, ADDED, ADMINISTRATIVE_CHANGE, UNCHANGED)",
    ),
    category: Optional[str] = Query(
        default=None,
        description="Filter by category (e.g. SUBSTANTIVE_REGULATORY_CHANGE, REGULATORY_STRUCTURE, WORDING_CHANGE, DOCUMENT_METADATA)",
    ),
    materiality: Optional[str] = Query(
        default=None,
        description="Filter by materiality (e.g. HIGH, MEDIUM, LOW)",
    ),
    limit: int = Query(
        default=50,
        ge=1,
        le=1000,
        description="Maximum number of change records to return per page",
    ),
    offset: int = Query(
        default=0,
        ge=0,
        description="Number of change records to skip before returning results",
    ),
    analysis_service: AnalysisService = Depends(get_analysis_service),
    dynamic_comparison_service: DynamicComparisonService = Depends(
        get_dynamic_comparison_service
    ),
) -> ChangeListResponse:
    """List regulatory change records matching query filters and pagination."""
    if _is_psl_analysis(analysis_id):
        changes, total = analysis_service.get_all_changes(
            change_type=change_type,
            category=category,
            materiality=materiality,
            limit=limit,
            offset=offset,
        )
    else:
        changes, total = dynamic_comparison_service.get_analysis_changes(
            analysis_id=analysis_id,
            change_type=change_type,
            category=category,
            materiality=materiality,
            limit=limit,
            offset=offset,
        )
        if total == 0 and not dynamic_comparison_service.get_analysis_overview(analysis_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Analysis '{analysis_id}' not found.",
            )

    return ChangeListResponse(
        total=total,
        returned=len(changes),
        limit=limit,
        offset=offset,
        changes=changes,
    )


@router.get(
    "/{analysis_id}/changes/{change_id}",
    response_model=ChangeRecord,
    summary="Get Single Change Record",
    description="Retrieve detailed change intelligence and explainability for a specific change record by ID.",
)
async def get_analysis_change(
    analysis_id: str,
    change_id: str,
    analysis_service: AnalysisService = Depends(get_analysis_service),
    dynamic_comparison_service: DynamicComparisonService = Depends(
        get_dynamic_comparison_service
    ),
) -> ChangeRecord:
    """Retrieve single regulatory change intelligence record."""
    if _is_psl_analysis(analysis_id):
        change = analysis_service.get_change_by_id(change_id=change_id)
    else:
        change = dynamic_comparison_service.get_analysis_change(
            analysis_id=analysis_id, change_id=change_id
        )

    if not change:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Change record '{change_id}' not found in analysis '{analysis_id}'.",
        )
    return change


@router.get(
    "/{analysis_id}/clauses/{version}/{clause_id}",
    response_model=ClauseDetail,
    summary="Get Specific Version Clause Detail",
    description="Retrieve segmented clause text and metadata from the specified regulatory version.",
)
async def get_analysis_clause(
    analysis_id: str,
    version: str,
    clause_id: str,
    analysis_service: AnalysisService = Depends(get_analysis_service),
    dynamic_comparison_service: DynamicComparisonService = Depends(
        get_dynamic_comparison_service
    ),
) -> ClauseDetail:
    """Retrieve granular clause record by regulatory version and clause_id."""
    clean_ver = version.strip()

    if _is_psl_analysis(analysis_id):
        if clean_ver not in ["2020", "2025", "PSL_2020", "PSL_2025"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid version '{version}'. Expected '2020' or '2025'.",
            )
        clause = analysis_service.get_clause_by_id(version=clean_ver, clause_id=clause_id)
    else:
        clause = dynamic_comparison_service.get_analysis_clause(
            analysis_id=analysis_id, version=clean_ver, clause_id=clause_id
        )

    if not clause:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clause '{clause_id}' not found for version '{clean_ver}' in analysis '{analysis_id}'.",
        )
    return clause


@router.get(
    "/{analysis_id}/requirements",
    response_model=RequirementListResponse,
    summary="List Structured Regulatory Requirements",
    description="Query extracted obligations, prohibitions, permissions, and informational requirements from the NLP pipeline.",
)
async def list_analysis_requirements(
    analysis_id: str,
    document_id: Optional[str] = Query(
        default=None,
        description="Filter requirements by source document ID",
    ),
    function: Optional[str] = Query(
        default=None,
        description="Filter by regulatory function: OBLIGATION, PROHIBITION, PERMISSION, INFORMATION",
    ),
    limit: int = Query(
        default=50,
        ge=1,
        le=200,
        description="Maximum number of requirement records to return per page",
    ),
    offset: int = Query(
        default=0,
        ge=0,
        description="Number of requirement records to skip before returning results",
    ),
    analysis_service: AnalysisService = Depends(get_analysis_service),
) -> RequirementListResponse:
    """List extracted regulatory requirements matching query filters."""
    reqs, total = analysis_service.get_requirements(
        document_id=document_id,
        function=function,
        limit=limit,
        offset=offset,
    )

    return RequirementListResponse(
        total=total,
        returned=len(reqs),
        limit=limit,
        offset=offset,
        requirements=reqs,
    )

