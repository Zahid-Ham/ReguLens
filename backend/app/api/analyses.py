"""Analysis History and Persistence API Router."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies import get_analysis_history_service
from app.schemas.analysis_history import (
    AnalysisDetailResponse,
    AnalysisHistoryItem,
    AnalysisHistoryListResponse,
)
from app.services.analysis_history_service import AnalysisHistoryService

router = APIRouter(prefix="/analyses", tags=["Analysis History & Persistence"])


@router.get(
    "",
    response_model=AnalysisHistoryListResponse,
    summary="List Historical Analyses",
    description="Retrieve paginated list of persistent regulatory comparison and compliance mapping analyses with search and filtering.",
)
async def list_analyses(
    search: Optional[str] = Query(
        default=None,
        description="Search term matching analysis title, document titles, or analysis ID",
    ),
    status: Optional[str] = Query(
        default=None,
        description="Filter by execution status: 'complete', 'processing', 'failed', or 'all'",
    ),
    date_filter: Optional[str] = Query(
        default=None,
        description="Filter by relative date range: 'today', '7days', '30days', or 'all'",
    ),
    document_type: Optional[str] = Query(
        default=None,
        description="Filter by document type or keyword in document titles",
    ),
    page: int = Query(default=1, ge=1, description="1-based page number"),
    page_size: int = Query(default=10, ge=1, le=100, description="Items per page"),
    history_service: AnalysisHistoryService = Depends(get_analysis_history_service),
) -> AnalysisHistoryListResponse:
    """Retrieve filtered and paginated analysis history rows."""
    return history_service.list_analyses(
        search=search,
        status=status,
        date_filter=date_filter,
        document_type=document_type,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{analysis_id}",
    response_model=AnalysisDetailResponse,
    summary="Get Analysis Detail",
    description="Retrieve comprehensive metadata, document references, and summary metrics for a persistent analysis.",
)
async def get_analysis_detail(
    analysis_id: str,
    history_service: AnalysisHistoryService = Depends(get_analysis_history_service),
) -> AnalysisDetailResponse:
    """Retrieve full analysis history record."""
    clean_id = analysis_id.strip()
    record = history_service.get_analysis_by_id(clean_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis with id '{clean_id}' not found in persistence history.",
        )

    item = AnalysisHistoryItem(
        id=record.id,
        title=record.title,
        status=record.status,
        mode=record.mode,
        previous_document_id=record.previous_document_id,
        previous_document_title=record.previous_document_title,
        previous_document_filename=record.previous_document_filename,
        current_document_id=record.current_document_id,
        current_document_title=record.current_document_title,
        current_document_filename=record.current_document_filename,
        company_policy_document_id=record.company_policy_document_id,
        company_policy_document_title=record.company_policy_document_title,
        company_policy_document_filename=record.company_policy_document_filename,
        created_at=record.created_at.isoformat() if record.created_at else None,
        started_at=record.started_at.isoformat() if record.started_at else None,
        completed_at=record.completed_at.isoformat() if record.completed_at else None,
        duration_seconds=record.duration_seconds or 0.0,
        created_by=record.created_by or "Zahid Hamdule",
        error_message=record.error_message,
        overview_summary=record.overview_summary or {},
        policy_summary=record.policy_summary or {},
        is_most_recent=False,
    )

    return AnalysisDetailResponse(
        analysis=item,
        has_changes=bool(record.overview_summary or record.changes_data),
        has_policy=bool(record.company_policy_document_id),
    )


@router.delete(
    "/{analysis_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Analysis Record",
    description="Remove an analysis record from the persistent history.",
)
async def delete_analysis(
    analysis_id: str,
    history_service: AnalysisHistoryService = Depends(get_analysis_history_service),
):
    """Delete analysis by ID."""
    clean_id = analysis_id.strip()
    if clean_id == "psl-2020-2025":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete canonical PSL benchmark analysis.",
        )

    deleted = history_service.delete_analysis(clean_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis with id '{clean_id}' not found.",
        )
    return {"status": "success", "message": f"Analysis '{clean_id}' deleted successfully."}
