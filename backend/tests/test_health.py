"""Tests for FastAPI Health Endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Verify GET / returns basic service status."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["service"] == "ReguLens API"
    assert data["health"] == "/api/health"


def test_api_health_endpoint():
    """Verify GET /api/health returns the expected schema."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "ReguLens API"
    assert "version" in data
    assert "environment" in data


def test_api_health_integrity_endpoint():
    """Verify GET /api/health/integrity checks precomputed artifact files on disk."""
    response = client.get("/api/health/integrity")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["ok", "degraded"]
    assert "data_directory" in data
    assert "artifacts" in data
    # Key datasets must exist
    assert data["artifacts"].get("psl_change_intelligence_csv") is True
    assert data["artifacts"].get("psl_change_summary_json") is True
