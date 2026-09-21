"""NLP Explorer API Router.

Provides endpoints for granular technical NLP inspection, document selection,
clause navigation, token/lemma tables, dependency syntax graphs, domain NER,
clause classification, and structured requirement extraction.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies import get_nlp_explorer_service
from app.schemas.nlp_explorer import (
    NLPClauseClassification,
    NLPClauseExplorerResponse,
    NLPClauseItem,
    NLPDependencyNode,
    NLPDocumentItem,
    NLPDomainEntity,
    NLPExtractedRequirement,
    NLPTokenItem,
)
from app.services.nlp.nlp_explorer_service import NLPExplorerService

router = APIRouter(prefix="/nlp-explorer", tags=["NLP Technical Explorer"])


@router.get(
    "/documents",
    response_model=List[NLPDocumentItem],
    summary="List available regulatory documents for NLP exploration",
)
async def list_nlp_documents(
    service: NLPExplorerService = Depends(get_nlp_explorer_service),
) -> List[NLPDocumentItem]:
    """Retrieve all cataloged and uploaded regulatory documents with NLP artifacts."""
    return service.get_documents()


@router.get(
    "/documents/{document_id}/clauses",
    response_model=List[NLPClauseItem],
    summary="List clauses in a document for navigation",
)
async def list_document_clauses(
    document_id: str,
    search: Optional[str] = Query(default=None, description="Search query across clause text or IDs"),
    limit: int = Query(default=150, description="Max clauses to return"),
    offset: int = Query(default=0, description="Offset for pagination"),
    service: NLPExplorerService = Depends(get_nlp_explorer_service),
) -> List[NLPClauseItem]:
    """Retrieve ordered list of clauses in the selected document."""
    return service.get_document_clauses(
        document_id=document_id,
        search=search,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/clauses/{clause_id}",
    response_model=NLPClauseExplorerResponse,
    summary="Get comprehensive NLP inspection payload for a single clause",
)
async def get_clause_nlp_detail(
    clause_id: str,
    document_id: Optional[str] = Query(default=None, description="Optional parent document ID context"),
    service: NLPExplorerService = Depends(get_nlp_explorer_service),
) -> NLPClauseExplorerResponse:
    """Retrieve full linguistic tokenization, dependencies, domain NER, classification, and requirements."""
    return service.get_clause_nlp_explorer(clause_id=clause_id, document_id=document_id)


@router.get(
    "/clauses/{clause_id}/tokens",
    response_model=List[NLPTokenItem],
    summary="Get tokenization and POS tagging table",
)
async def get_clause_tokens(
    clause_id: str,
    service: NLPExplorerService = Depends(get_nlp_explorer_service),
) -> List[NLPTokenItem]:
    """Get token-level linguistic details."""
    res = service.get_clause_nlp_explorer(clause_id=clause_id)
    return res.tokens


@router.get(
    "/clauses/{clause_id}/dependencies",
    response_model=List[NLPDependencyNode],
    summary="Get syntactic dependency parse nodes",
)
async def get_clause_dependencies(
    clause_id: str,
    service: NLPExplorerService = Depends(get_nlp_explorer_service),
) -> List[NLPDependencyNode]:
    """Get dependency syntax tree nodes."""
    res = service.get_clause_nlp_explorer(clause_id=clause_id)
    return res.dependencies


@router.get(
    "/clauses/{clause_id}/entities",
    response_model=List[NLPDomainEntity],
    summary="Get domain Named Entity Recognition items",
)
async def get_clause_entities(
    clause_id: str,
    service: NLPExplorerService = Depends(get_nlp_explorer_service),
) -> List[NLPDomainEntity]:
    """Get recognized domain entity mentions."""
    res = service.get_clause_nlp_explorer(clause_id=clause_id)
    return res.entities


@router.get(
    "/clauses/{clause_id}/classification",
    response_model=NLPClauseClassification,
    summary="Get clause regulatory function classification",
)
async def get_clause_classification(
    clause_id: str,
    service: NLPExplorerService = Depends(get_nlp_explorer_service),
) -> NLPClauseClassification:
    """Get classification metadata and deontic modality."""
    res = service.get_clause_nlp_explorer(clause_id=clause_id)
    return res.classification


@router.get(
    "/clauses/{clause_id}/requirements",
    response_model=NLPExtractedRequirement,
    summary="Get structured requirement extractions",
)
async def get_clause_requirements(
    clause_id: str,
    service: NLPExplorerService = Depends(get_nlp_explorer_service),
) -> NLPExtractedRequirement:
    """Get structured requirement fields."""
    res = service.get_clause_nlp_explorer(clause_id=clause_id)
    return res.requirement
