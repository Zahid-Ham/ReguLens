"""Regulatory Document Library API Router."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies import get_regulation_service
from app.schemas.regulations import RegulationListResponse, RegulatoryDocument
from app.services.regulation_service import RegulationService

router = APIRouter(prefix="/regulations", tags=["Regulations Library"])


@router.get(
    "",
    response_model=RegulationListResponse,
    summary="List and Search Regulatory Documents",
    description="Retrieve a paginated list of indexed regulatory directions, guidelines, and circulars with optional search and type filtering.",
)
async def list_regulations(
    search: Optional[str] = Query(
        default=None,
        description="Case-insensitive search query across document IDs, titles, notification numbers, and dates",
    ),
    document_type: Optional[str] = Query(
        default=None,
        description="Filter by regulatory document type (e.g. 'Master Directions', 'Supervisory Returns')",
    ),
    limit: int = Query(
        default=50,
        ge=1,
        le=200,
        description="Maximum number of documents to return per page",
    ),
    offset: int = Query(
        default=0,
        ge=0,
        description="Number of documents to skip before returning results",
    ),
    reg_service: RegulationService = Depends(get_regulation_service),
) -> RegulationListResponse:
    """List regulatory documents matching query and pagination parameters."""
    docs, total = reg_service.get_all_documents(
        search=search,
        document_type=document_type,
        limit=limit,
        offset=offset,
    )

    return RegulationListResponse(
        total=total,
        returned=len(docs),
        limit=limit,
        offset=offset,
        documents=docs,
    )


@router.get(
    "/{document_id}",
    response_model=RegulatoryDocument,
    summary="Get Regulatory Document Metadata",
    description="Retrieve detailed metadata for a specific regulatory document by its unique identifier.",
)
async def get_regulation(
    document_id: str,
    reg_service: RegulationService = Depends(get_regulation_service),
) -> RegulatoryDocument:
    """Retrieve single regulatory document metadata by document_id."""
    doc = reg_service.get_document_by_id(document_id=document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Regulatory document with id '{document_id}' not found in library repository.",
        )
    return doc
