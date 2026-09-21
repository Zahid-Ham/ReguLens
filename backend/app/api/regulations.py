"""Regulatory Document Library API Router."""

from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse

from app.dependencies import get_data_repository, get_regulation_service
from app.schemas.regulations import (
    RegulationFilters,
    RegulationListResponse,
    RegulationsMetrics,
    RegulatoryDocument,
)
from app.services.data_repository import DataRepository
from app.services.regulation_service import RegulationService

router = APIRouter(prefix="/regulations", tags=["Regulations Library"])


@router.get(
    "/metrics",
    response_model=RegulationsMetrics,
    summary="Get Regulations Dashboard Metrics",
    description="Retrieve live aggregate metrics across indexed regulatory documents.",
)
async def get_regulations_metrics(
    reg_service: RegulationService = Depends(get_regulation_service),
) -> RegulationsMetrics:
    """Retrieve aggregate document statistics."""
    return reg_service.get_metrics()


@router.get(
    "/filters",
    response_model=RegulationFilters,
    summary="Get Available Regulation Filter Options",
    description="Retrieve available categories, regulators, and years for dropdown filters.",
)
async def get_regulations_filters(
    reg_service: RegulationService = Depends(get_regulation_service),
) -> RegulationFilters:
    """Retrieve filter categories."""
    return reg_service.get_filters()


@router.get(
    "",
    response_model=RegulationListResponse,
    summary="List and Search Regulatory Documents",
    description="Retrieve a paginated list of indexed regulatory directions with search, regulator, category, status, and sort filters.",
)
async def list_regulations(
    search: Optional[str] = Query(
        default=None,
        description="Search query across document IDs, titles, notification numbers, and text excerpts",
    ),
    document_type: Optional[str] = Query(
        default=None,
        description="Filter by regulatory document type (e.g. 'Master Direction', 'Guidelines')",
    ),
    regulator: Optional[str] = Query(
        default=None,
        description="Filter by regulatory authority (e.g. 'RBI', 'SEBI', 'IRDAI')",
    ),
    category: Optional[str] = Query(
        default=None,
        description="Filter by domain category (e.g. 'Priority Sector Lending', 'KYC / AML')",
    ),
    status_filter: Optional[str] = Query(
        default=None,
        alias="status",
        description="Filter by processing status (e.g. 'Processed', 'Processing', 'Pending')",
    ),
    year: Optional[str] = Query(
        default=None,
        description="Filter by version/promulgation year",
    ),
    sort: Optional[str] = Query(
        default="date_desc",
        description="Sort ordering: date_desc, date_asc, name_asc, name_desc, clauses_desc",
    ),
    page: int = Query(
        default=1,
        ge=1,
        description="1-indexed page number",
    ),
    page_size: int = Query(
        default=50,
        ge=1,
        le=100,
        description="Number of items per page",
    ),
    limit: Optional[int] = Query(
        default=50,
        ge=1,
        le=200,
        description="Backward-compatible limit",
    ),
    offset: Optional[int] = Query(
        default=0,
        ge=0,
        description="Backward-compatible offset",
    ),
    reg_service: RegulationService = Depends(get_regulation_service),
) -> RegulationListResponse:
    """List regulatory documents matching query, filter, and pagination parameters."""
    # Handle backward-compatible limit/offset vs page/page_size
    actual_limit = limit if limit is not None else page_size
    actual_offset = offset if offset is not None else ((page - 1) * page_size)
    actual_page = (actual_offset // actual_limit) + 1 if actual_limit > 0 else page

    docs, total = reg_service.get_all_documents(
        search=search,
        document_type=document_type,
        regulator=regulator,
        category=category,
        status=status_filter,
        year=year,
        sort=sort,
        limit=actual_limit,
        offset=actual_offset,
    )

    total_pages = max(1, (total + actual_limit - 1) // actual_limit) if actual_limit > 0 else 1

    return RegulationListResponse(
        total=total,
        returned=len(docs),
        limit=actual_limit,
        offset=actual_offset,
        page=actual_page,
        page_size=actual_limit,
        total_pages=total_pages,
        metrics=reg_service.get_metrics(),
        filters=reg_service.get_filters(),
        documents=docs,
    )


@router.get(
    "/{document_id}",
    response_model=RegulatoryDocument,
    summary="Get Regulatory Document Metadata & Sections",
    description="Retrieve detailed metadata, processing stages, and chapters for a specific regulatory document.",
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


@router.get(
    "/{document_id}/download",
    summary="Download Regulatory Document Source PDF",
    description="Download the original official PDF document if locally available.",
)
async def download_regulation(
    document_id: str,
    reg_service: RegulationService = Depends(get_regulation_service),
    data_repo: DataRepository = Depends(get_data_repository),
):
    """Serve regulatory PDF file for local download."""
    doc = reg_service.get_document_by_id(document_id=document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{document_id}' not found.",
        )

    # Attempt locating local file
    filename = doc.filename
    try:
        raw_pdf = data_repo.get_raw_pdf_path(filename)
        if raw_pdf.is_file():
            return FileResponse(
                path=str(raw_pdf),
                filename=filename,
                media_type="application/pdf",
            )
    except Exception:
        pass

    # If direct local file is not found, redirect or notify
    if doc.pdf_url:
        return {"download_url": doc.pdf_url, "document_id": doc.document_id, "filename": doc.filename}

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"PDF source binary for '{document_id}' is not stored locally.",
    )

