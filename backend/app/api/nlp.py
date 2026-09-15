"""NLP Processing Intelligence API Router."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_nlp_service
from app.schemas.nlp import (
    ClassificationStatistics,
    EntityStatistics,
    ModelEvaluationListResponse,
    NLPClauseDetail,
    NLPOverview,
    NLPProcessingStatus,
    RequirementCoverage,
)
from app.services.nlp_service import NLPService

router = APIRouter(
    prefix="/analysis/psl-2020-2025/nlp",
    tags=["NLP Processing Intelligence"],
)


@router.get(
    "/overview",
    response_model=NLPOverview,
    summary="Get NLP Pipeline Overview Statistics",
    description="Retrieve holistic NLP metrics across clause segmentation, domain NER, classification, and requirement extraction.",
)
async def get_nlp_overview(
    nlp_service: NLPService = Depends(get_nlp_service),
) -> NLPOverview:
    """Retrieve precomputed high-level statistics across all NLP pipeline artifacts."""
    return nlp_service.get_nlp_overview()


@router.get(
    "/entities",
    response_model=EntityStatistics,
    summary="Get Domain NER Statistics",
    description="Retrieve domain entity frequencies, ranked categories, and clause coverage from NER annotations.",
)
async def get_domain_ner_statistics(
    nlp_service: NLPService = Depends(get_nlp_service),
) -> EntityStatistics:
    """Retrieve aggregated domain entity extraction frequencies."""
    return nlp_service.get_entity_statistics()


@router.get(
    "/classification",
    response_model=ClassificationStatistics,
    summary="Get Clause Classification Distribution & Validation",
    description="Retrieve label breakdown from LLM-assisted annotations and accuracy from human-audited validation subset.",
)
async def get_clause_classification(
    nlp_service: NLPService = Depends(get_nlp_service),
) -> ClassificationStatistics:
    """Retrieve clause classification distribution and human audit validation accuracy."""
    return nlp_service.get_classification_statistics()


@router.get(
    "/requirements/coverage",
    response_model=RequirementCoverage,
    summary="Get Requirement Extraction Coverage",
    description="Retrieve obligation extraction rates for subjects, actions, modals, deadlines, and durations.",
)
async def get_requirement_coverage(
    nlp_service: NLPService = Depends(get_nlp_service),
) -> RequirementCoverage:
    """Retrieve structured requirement coverage metrics and regulatory function distribution."""
    return nlp_service.get_requirement_coverage()


@router.get(
    "/evaluation",
    response_model=ModelEvaluationListResponse,
    summary="Get Classifier Model Evaluation Metrics",
    description="Retrieve 5-fold cross-validation precision, recall, and F1 scores for TF-IDF and semantic classifiers.",
)
async def get_classifier_evaluation(
    nlp_service: NLPService = Depends(get_nlp_service),
) -> ModelEvaluationListResponse:
    """Retrieve cross-validation evaluation summaries for both classifier architectures."""
    return nlp_service.get_model_evaluations()


@router.get(
    "/clauses/{clause_id}",
    response_model=NLPClauseDetail,
    summary="Get Single Clause NLP Detail",
    description="Retrieve tokenization, domain entity mentions, and extracted requirements for a specific clause.",
)
async def get_clause_nlp_detail(
    clause_id: str,
    nlp_service: NLPService = Depends(get_nlp_service),
) -> NLPClauseDetail:
    """Retrieve granular NLP annotations for a specific clause by clause_id."""
    detail = nlp_service.get_clause_nlp_detail(clause_id=clause_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clause '{clause_id}' not found in NLP annotation datasets.",
        )
    return detail


@router.get(
    "/status",
    response_model=NLPProcessingStatus,
    summary="Get NLP Pipeline Status",
    description="Retrieve execution state and verified artifact existence across all 12 pipeline stages.",
)
async def get_pipeline_status(
    nlp_service: NLPService = Depends(get_nlp_service),
) -> NLPProcessingStatus:
    """Retrieve execution mode and stage verification report for the precomputed pipeline."""
    return nlp_service.get_pipeline_status()
