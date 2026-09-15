"""Health and System Status API Endpoints."""

from fastapi import APIRouter, Depends
from app.config import Settings, get_settings
from app.dependencies import get_data_repository
from app.schemas.health import DataIntegrityResponse, HealthResponse
from app.services.data_repository import DataRepository

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse, summary="Service Health Check")
async def get_health(settings: Settings = Depends(get_settings)) -> HealthResponse:
    """Return service status, version, and current environment."""
    return HealthResponse(
        status="ok",
        service=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.APP_ENV,
    )


@router.get("/health/integrity", response_model=DataIntegrityResponse, summary="Data Repository Artifacts Check")
async def get_data_integrity(
    data_repo: DataRepository = Depends(get_data_repository),
) -> DataIntegrityResponse:
    """Verify the presence of all precomputed datasets and artifacts on disk."""
    integrity = data_repo.verify_data_integrity()
    return DataIntegrityResponse(
        status="ok" if all(integrity.values()) else "degraded",
        data_directory=str(data_repo.data_dir),
        artifacts=integrity,
    )
