"""Health Check Pydantic Schemas."""

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """System health check response schema."""

    status: str = Field(default="ok", description="Overall API service health status")
    service: str = Field(default="ReguLens API", description="Service identifier")
    version: str = Field(default="0.1.0", description="Application release version")
    environment: str = Field(default="development", description="Current deployment environment")


class DataIntegrityResponse(BaseModel):
    """Response schema summarizing data artifact availability on disk."""

    status: str = Field(default="ok")
    data_directory: str = Field(description="Resolved local path to data directory")
    artifacts: dict[str, bool] = Field(description="Mapping of artifact keys to file existence booleans")
