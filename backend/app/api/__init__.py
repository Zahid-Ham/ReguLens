"""API Routers Package."""

from fastapi import APIRouter
from app.api.analyses import router as analyses_router
from app.api.analysis import router as analysis_router
from app.api.analysis_jobs import router as analysis_jobs_router
from app.api.documents import router as documents_router
from app.api.health import router as health_router
from app.api.insights import router as insights_router
from app.api.nlp import router as nlp_router
from app.api.policy_mapping import router as policy_mapping_router
from app.api.regulations import router as regulations_router

api_router = APIRouter(prefix="/api")
api_router.include_router(health_router)
api_router.include_router(documents_router)
api_router.include_router(regulations_router)
api_router.include_router(analyses_router)
api_router.include_router(analysis_router)
api_router.include_router(analysis_jobs_router)
api_router.include_router(insights_router)
api_router.include_router(policy_mapping_router)
api_router.include_router(nlp_router)

__all__ = [
    "api_router",
    "health_router",
    "documents_router",
    "regulations_router",
    "analyses_router",
    "analysis_router",
    "analysis_jobs_router",
    "insights_router",
    "policy_mapping_router",
    "nlp_router",
]






