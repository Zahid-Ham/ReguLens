"""Analysis Creation and Processing Jobs API Router."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_analysis_job_service, get_nlp_service
from app.schemas.analysis_job import (
    AnalysisCreateRequest,
    AnalysisCreateResponse,
    AnalysisResultsResponse,
    AnalysisStatusResponse,
    DocumentClausesResponse,
    ProcessedClauseNLP,
)
from app.services.analysis_job_service import AnalysisJobService
from app.services.nlp_service import NLPService

router = APIRouter(prefix="/analysis", tags=["Analysis Workflow & Jobs"])


@router.post(
    "",
    response_model=AnalysisCreateResponse,
    status_code=status.HTTP_200_OK,
    summary="Create or Map Regulatory Analysis Job",
    description="Initiate a regulatory comparison between a baseline and target document, mapping to verified precomputed artifacts.",
)
async def create_analysis(
    request: AnalysisCreateRequest,
    job_service: AnalysisJobService = Depends(get_analysis_job_service),
) -> AnalysisCreateResponse:
    """Validate requested document pair and return mapped analysis job descriptor."""
    return job_service.create_or_map_job(request=request)


@router.get(
    "/{analysis_id}/status",
    response_model=AnalysisStatusResponse,
    summary="Get Analysis Job Execution Status",
    description="Retrieve processing state, completion percentage, and verified pipeline stages for an analysis job.",
)
async def get_analysis_status(
    analysis_id: str,
    job_service: AnalysisJobService = Depends(get_analysis_job_service),
) -> AnalysisStatusResponse:
    """Retrieve current processing status and stage completion report."""
    job_status = job_service.get_job_status(analysis_id=analysis_id)
    if not job_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis job with id '{analysis_id}' not found.",
        )
    return job_status


@router.get(
    "/{analysis_id}/nlp/documents/{document_role}/clauses",
    response_model=DocumentClausesResponse,
    summary="Get All Processed Clauses for a Document",
    description="Retrieve all processed clauses with complete NLP annotations for post-completion explorer.",
)
async def get_document_clauses(
    analysis_id: str,
    document_role: str,
    job_service: AnalysisJobService = Depends(get_analysis_job_service),
) -> DocumentClausesResponse:
    """Retrieve all processed clauses for 'previous' or 'current' document."""
    if document_role not in ("previous", "current"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="document_role must be either 'previous' or 'current'.",
        )
    res = job_service.get_document_clauses(analysis_id=analysis_id, document_role=document_role)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clauses for analysis '{analysis_id}' and role '{document_role}' not found.",
        )
    return res


@router.get(
    "/{analysis_id}/nlp/clauses/{document_role}/{clause_index}",
    response_model=ProcessedClauseNLP,
    summary="Get Granular Processed Clause NLP Detail",
    description="Retrieve single clause NLP annotations by 1-based clause index.",
)
async def get_clause_detail(
    analysis_id: str,
    document_role: str,
    clause_index: int,
    job_service: AnalysisJobService = Depends(get_analysis_job_service),
) -> ProcessedClauseNLP:
    """Retrieve single clause NLP annotations by 1-based index."""
    if document_role not in ("previous", "current"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="document_role must be either 'previous' or 'current'.",
        )
    res = job_service.get_clause_detail(analysis_id=analysis_id, document_role=document_role, clause_index=clause_index)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clause at index {clause_index} for analysis '{analysis_id}' not found.",
        )
    return res


@router.get(
    "/{analysis_id}/nlp/clauses/{clause_id}",
    summary="Get Granular Processed Clause NLP Detail by Clause ID",
    description="Retrieve single clause NLP annotations by clause ID for precomputed or dynamic analysis.",
)
async def get_clause_nlp_detail_by_id(
    analysis_id: str,
    clause_id: str,
    job_service: AnalysisJobService = Depends(get_analysis_job_service),
    nlp_service: NLPService = Depends(get_nlp_service),
):
    """Retrieve single clause NLP annotations by clause ID."""
    clean_id = analysis_id.strip()
    if clean_id in ("psl-2020-2025", job_service.PRECOMPUTED_ANALYSIS_ID):
        detail = nlp_service.get_clause_nlp_detail(clause_id=clause_id)
        if detail:
            return detail

    cl = job_service.get_clause_by_clause_id(analysis_id=clean_id, clause_id=clause_id)
    if not cl:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clause '{clause_id}' for analysis '{analysis_id}' not found.",
        )
    return cl


@router.get(
    "/{analysis_id}/results",
    response_model=AnalysisResultsResponse,
    summary="Get Complete Analysis Results Payload",
    description="Retrieve aggregated change overview, summary metrics, methodology definitions, and drill-down links for completed analysis.",
)
async def get_analysis_results(
    analysis_id: str,
    job_service: AnalysisJobService = Depends(get_analysis_job_service),
) -> AnalysisResultsResponse:
    """Retrieve full analysis summary and links to granular change records."""
    results = job_service.get_job_results(analysis_id=analysis_id)
    if not results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis results for '{analysis_id}' not found or job is not yet completed.",
        )
    return results

