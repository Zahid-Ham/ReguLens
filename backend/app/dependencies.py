"""FastAPI Dependency Providers."""

from functools import lru_cache
from fastapi import Depends

from app.config import Settings, get_settings
from app.services.analysis_history_service import AnalysisHistoryService
from app.services.analysis_job_service import AnalysisJobService
from app.services.analysis_service import AnalysisService
from app.services.data_repository import DataRepository
from app.services.document_upload_service import DocumentUploadService
from app.services.compliance.groq_insights_service import GroqInsightsService
from app.services.compliance.groq_service import GroqService
from app.services.compliance.policy_mapping_service import PolicyMappingService
from app.services.compliance.policy_nlp_service import PolicyNLPService
from app.services.dynamic_comparison_service import DynamicComparisonService
from app.services.dynamic_nlp_pipeline import DynamicNLPPipeline
from app.services.nlp_service import NLPService
from app.services.regulation_service import RegulationService


@lru_cache()
def get_groq_insights_service() -> GroqInsightsService:
    """Provide a cached GroqInsightsService instance for evidence-grounded advisory intelligence."""
    return GroqInsightsService()



@lru_cache()
def get_analysis_history_service() -> AnalysisHistoryService:
    """Provide a cached AnalysisHistoryService instance for database persistence."""
    return AnalysisHistoryService()


@lru_cache()
def get_data_repository() -> DataRepository:
    """Provide a cached DataRepository singleton instance."""
    settings = get_settings()
    return DataRepository(settings=settings)


@lru_cache()
def get_document_upload_service() -> DocumentUploadService:
    """Provide a cached DocumentUploadService singleton instance for runtime uploaded documents."""
    return DocumentUploadService()


@lru_cache()
def get_dynamic_nlp_pipeline() -> DynamicNLPPipeline:
    """Provide a cached DynamicNLPPipeline singleton instance for live document NLP operations."""
    return DynamicNLPPipeline()


@lru_cache()
def get_dynamic_comparison_service() -> DynamicComparisonService:
    """Provide a cached DynamicComparisonService singleton instance for pairwise document comparison."""
    return DynamicComparisonService()


@lru_cache()
def get_policy_nlp_service() -> PolicyNLPService:
    """Provide a cached PolicyNLPService instance."""
    return PolicyNLPService()


@lru_cache()
def get_policy_mapping_service() -> PolicyMappingService:
    """Provide a cached PolicyMappingService instance."""
    return PolicyMappingService(policy_nlp_service=get_policy_nlp_service())


@lru_cache()
def get_groq_service() -> GroqService:
    """Provide a cached GroqService instance."""
    return GroqService()


@lru_cache()
def get_regulation_service() -> RegulationService:
    """Provide a cached RegulationService instance."""
    return RegulationService(
        data_repo=get_data_repository(),
        upload_service=get_document_upload_service(),
    )


@lru_cache()
def get_analysis_service() -> AnalysisService:
    """Provide a cached AnalysisService instance."""
    return AnalysisService(data_repo=get_data_repository())


@lru_cache()
def get_nlp_service() -> NLPService:
    """Provide a cached NLPService instance."""
    return NLPService(data_repo=get_data_repository())


@lru_cache()
def get_analysis_job_service() -> AnalysisJobService:
    """Provide a cached AnalysisJobService instance."""
    return AnalysisJobService(
        data_repo=get_data_repository(),
        regulation_service=get_regulation_service(),
        analysis_service=get_analysis_service(),
        upload_service=get_document_upload_service(),
        dynamic_nlp_pipeline=get_dynamic_nlp_pipeline(),
        dynamic_comparison_service=get_dynamic_comparison_service(),
        policy_mapping_service=get_policy_mapping_service(),
        history_service=get_analysis_history_service(),
    )
