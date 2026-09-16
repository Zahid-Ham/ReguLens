"""ReguLens FastAPI Application Entry Point.

Configures application lifecycle, CORS middleware for React/Vite development,
custom exception handling, and API routing.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import api_router
from app.config import get_settings
from app.core.database import init_db
from app.core.exceptions import DataCorruptedError, DataFileNotFoundError, ReguLensException
from app.dependencies import get_analysis_history_service

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager to initialize SQLite database tables and seed baseline analysis."""
    try:
        init_db()
        history_svc = get_analysis_history_service()
        history_svc.seed_canonical_psl_analysis()
    except Exception as e:
        print(f"[ReguLens Lifespan] Database startup warning: {e}")
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Explainable NLP-based framework for regulatory requirement extraction, semantic change detection, and compliance gap analysis.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS for local React/Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Custom Exception Handlers
# =============================================================================

@app.exception_handler(DataFileNotFoundError)
async def data_file_not_found_handler(request: Request, exc: DataFileNotFoundError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "error": "DataArtifactNotFound",
            "message": exc.message,
            "artifact": exc.artifact_name,
            "path": exc.file_path,
        },
    )


@app.exception_handler(DataCorruptedError)
async def data_corrupted_handler(request: Request, exc: DataCorruptedError):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "DataArtifactCorrupted",
            "message": exc.message,
            "path": exc.file_path,
        },
    )


@app.exception_handler(ReguLensException)
async def regulens_exception_handler(request: Request, exc: ReguLensException):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "ReguLensInternalError",
            "message": exc.message,
        },
    )


# =============================================================================
# Route Registration
# =============================================================================

app.include_router(api_router)


@app.get("/", tags=["Root"])
async def root():
    """Root entry point providing basic service metadata and documentation links."""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "docs": "/docs",
        "health": "/api/health",
    }
