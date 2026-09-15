"""Company Policy Mapping and Compliance Impact API Router."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import (
    get_analysis_job_service,
    get_groq_service,
    get_policy_mapping_service,
)
from app.schemas.policy_mapping import (
    PolicyMappingRecord,
    PolicyMappingResponse,
    PolicyMappingSummary,
)
from app.services.analysis_job_service import AnalysisJobService
from app.services.compliance.groq_service import GroqService
from app.services.compliance.policy_mapping_service import PolicyMappingService

router = APIRouter(prefix="/analysis", tags=["Company Policy Mapping & Compliance Impact"])


@router.get(
    "/{analysis_id}/policy-mapping",
    response_model=PolicyMappingResponse,
    summary="Get Company Policy Mapping and Compliance Results",
    description="Retrieve all mapped regulatory requirements, compliance determinations, and parameter gap evidence against company policy.",
)
async def get_policy_mapping(
    analysis_id: str,
    job_service: AnalysisJobService = Depends(get_analysis_job_service),
) -> PolicyMappingResponse:
    """Retrieve full company policy mapping dataset and aggregate compliance metrics."""
    res = job_service.get_policy_mapping(analysis_id)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis '{analysis_id}' not found.",
        )
    return res


@router.get(
    "/{analysis_id}/policy-mapping/summary",
    response_model=PolicyMappingSummary,
    summary="Get Policy Mapping Summary Metrics",
    description="Retrieve high-level compliance coverage, gap counts, top compliance risks, and recommendations.",
)
async def get_policy_mapping_summary(
    analysis_id: str,
    job_service: AnalysisJobService = Depends(get_analysis_job_service),
) -> PolicyMappingSummary:
    """Retrieve aggregate compliance impact summary."""
    res = job_service.get_policy_mapping(analysis_id)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis '{analysis_id}' not found.",
        )
    return res.summary


@router.get(
    "/{analysis_id}/policy-mapping/{mapping_id}",
    response_model=PolicyMappingRecord,
    summary="Get Single Policy Mapping Detail with Evidence",
    description="Retrieve granular regulatory citation, company policy citation, parameter difference, and gap details.",
)
async def get_policy_mapping_record(
    analysis_id: str,
    mapping_id: str,
    job_service: AnalysisJobService = Depends(get_analysis_job_service),
) -> PolicyMappingRecord:
    """Retrieve individual mapping record by mapping_id."""
    record = job_service.get_policy_mapping_record(analysis_id, mapping_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mapping record '{mapping_id}' for analysis '{analysis_id}' not found.",
        )
    return record


@router.post(
    "/{analysis_id}/policy-mapping/insights",
    response_model=PolicyMappingSummary,
    summary="Generate Advisory AI Insights for Compliance Gaps",
    description="Generate executive summary narrative and actionable remediation guidance via Groq LLM advisory layer.",
)
async def generate_policy_insights(
    analysis_id: str,
    job_service: AnalysisJobService = Depends(get_analysis_job_service),
    groq_service: GroqService = Depends(get_groq_service),
) -> PolicyMappingSummary:
    """Generate or refresh advisory AI insights on top compliance gaps."""
    res = job_service.get_policy_mapping(analysis_id)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis '{analysis_id}' not found.",
        )

    if not res.has_policy or not res.mappings:
        return res.summary

    if groq_service.is_available:
        exec_summary, _ = await groq_service.generate_top_insights(
            policy_title=res.policy_document_title or "Company Policy",
            total_requirements=res.summary.total_regulatory_requirements,
            policy_gaps=res.summary.policy_gaps,
            top_gaps=res.summary.top_gaps,
        )
        if exec_summary:
            res.summary.executive_summary = exec_summary

    return res.summary


@router.post(
    "/{analysis_id}/policy-mapping/{mapping_id}/explain",
    response_model=PolicyMappingRecord,
    summary="Generate Advisory AI Explanation for a Specific Mapping",
    description="Generate advisory explanation and specific policy remediation instructions for a single compliance gap.",
)
async def explain_mapping_record(
    analysis_id: str,
    mapping_id: str,
    job_service: AnalysisJobService = Depends(get_analysis_job_service),
    groq_service: GroqService = Depends(get_groq_service),
) -> PolicyMappingRecord:
    """Generate natural-language explanation and remediation advice for a single record."""
    record = job_service.get_policy_mapping_record(analysis_id, mapping_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mapping record '{mapping_id}' for analysis '{analysis_id}' not found.",
        )

    if groq_service.is_available:
        ai_exp, ai_rec = await groq_service.generate_mapping_explanation(record)
        if ai_exp:
            record.ai_explanation = ai_exp
        if ai_rec:
            record.ai_recommendation = ai_rec

    return record
