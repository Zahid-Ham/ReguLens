"""Integration and unit tests for Regulatory Change Intelligence API."""

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    """Create FastAPI test client."""
    with TestClient(app) as test_client:
        yield test_client


def test_analysis_overview_endpoint(client):
    """Test GET /api/analysis/psl-2020-2025 returns 200 and matches V2 summary artifact."""
    response = client.get("/api/analysis/psl-2020-2025")
    assert response.status_code == 200
    data = response.json()

    assert data["analysis_id"] == "psl-2020-2025"
    assert data["previous_document_id"] == "rbi_psl_2020_official"
    assert data["current_document_id"] == "rbi_a8d0f9a98495"

    # Verify counts match the exact V2 summary JSON artifact
    assert data["total_records"] == 63
    assert data["substantive_changes"] == 31
    assert data["administrative_changes"] == 4
    assert data["wording_only"] == 7
    assert data["added_candidates"] == 7
    assert data["removed_candidates"] == 12
    assert data["unchanged"] == 2

    assert data["high_materiality"] == 50
    assert data["medium_materiality"] == 0
    assert data["low_materiality"] == 13

    # Dimension shift counts
    assert data["modality_changes"] == 20
    assert data["monetary_changes"] == 18
    assert data["percentage_changes"] == 4
    assert data["duration_changes"] == 0
    assert data["deadline_changes"] == 1
    assert data["date_changes"] == 23

    # Transparency / methodology notes
    assert "methodology_notes" in data
    assert "added_candidates" in data["methodology_notes"]
    assert "removed_candidates" in data["methodology_notes"]
    assert "materiality_assessment" in data["methodology_notes"]


def test_list_psl_changes_default(client):
    """Test GET /api/analysis/psl-2020-2025/changes returns full paginated list."""
    response = client.get("/api/analysis/psl-2020-2025/changes")
    assert response.status_code == 200
    data = response.json()

    assert data["total"] == 63
    assert data["returned"] == 50
    assert data["limit"] == 50
    assert data["offset"] == 0
    assert len(data["changes"]) == 50

    first = data["changes"][0]
    assert first["change_id"] == "CHG_0001"
    assert first["old_clause_id"] == "PSL_2020_0001"
    assert first["new_clause_id"] == "PSL_2025_0001"
    assert first["final_change_type"] == "WORDING_ONLY"
    assert first["final_materiality"] == "LOW"


def test_list_psl_changes_pagination(client):
    """Test pagination on changes endpoint."""
    response = client.get("/api/analysis/psl-2020-2025/changes?limit=10&offset=50")
    assert response.status_code == 200
    data = response.json()

    assert data["total"] == 63
    assert data["returned"] == 10
    assert data["limit"] == 10
    assert data["offset"] == 50
    assert len(data["changes"]) == 10

    # Test final page offset 55 with limit 10
    response_last = client.get("/api/analysis/psl-2020-2025/changes?limit=10&offset=55")
    assert response_last.status_code == 200
    data_last = response_last.json()
    assert data_last["total"] == 63
    assert data_last["returned"] == 8  # 63 - 55 = 8 remaining
    assert len(data_last["changes"]) == 8



def test_filter_changes_by_type(client):
    """Test filtering changes by change_type query parameter."""
    response = client.get("/api/analysis/psl-2020-2025/changes?change_type=REMOVED")
    assert response.status_code == 200
    data = response.json()

    assert data["total"] == 12
    for c in data["changes"]:
        assert c["final_change_type"] == "REMOVED" or c["change_type"] == "REMOVED"
        assert c["new_clause_id"] is None
        assert c["old_clause_id"] is not None


def test_filter_changes_by_category_and_materiality(client):
    """Test filtering changes by category and materiality."""
    response = client.get(
        "/api/analysis/psl-2020-2025/changes?category=SUBSTANTIVE_REGULATORY_CHANGE&materiality=HIGH"
    )
    assert response.status_code == 200
    data = response.json()

    assert data["total"] == 31
    for c in data["changes"]:
        assert c["final_category"] == "SUBSTANTIVE_REGULATORY_CHANGE"
        assert c["final_materiality"] == "HIGH"


def test_get_single_change_by_id(client):
    """Test GET /api/analysis/psl-2020-2025/changes/{change_id} for existing record."""
    response = client.get("/api/analysis/psl-2020-2025/changes/CHG_0001")
    assert response.status_code == 200
    c = response.json()

    assert c["change_id"] == "CHG_0001"
    assert c["old_clause_id"] == "PSL_2020_0001"
    assert c["new_clause_id"] == "PSL_2025_0001"
    assert c["old_provision_id"] == "1.1"
    assert c["new_provision_id"] == "1.1"
    assert "Directions shall be called" in c["old_clause_text"]
    assert "Directions shall be called" in c["new_clause_text"]


def test_get_unknown_change_returns_404(client):
    """Test GET /api/analysis/psl-2020-2025/changes/{invalid_id} returns 404."""
    response = client.get("/api/analysis/psl-2020-2025/changes/CHG_9999")
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()


def test_get_psl_2020_clause(client):
    """Test GET /api/analysis/psl-2020-2025/clauses/2020/{clause_id}."""
    response = client.get("/api/analysis/psl-2020-2025/clauses/2020/PSL_2020_0001")
    assert response.status_code == 200
    clause = response.json()

    assert clause["version"] == "PSL_2020"
    assert clause["clause_id"] == "PSL_2020_0001"
    assert clause["page"] == 3
    assert clause["provision_id"] == "1.1"
    assert clause["section_level"] == 1
    assert clause["word_count"] == 20
    assert "Directions, 2020" in clause["clause_text"]


def test_get_psl_2025_clause(client):
    """Test GET /api/analysis/psl-2020-2025/clauses/2025/{clause_id}."""
    response = client.get("/api/analysis/psl-2020-2025/clauses/2025/PSL_2025_0001")
    assert response.status_code == 200
    clause = response.json()

    assert clause["version"] == "PSL_2025"
    assert clause["clause_id"] == "PSL_2025_0001"
    assert clause["page"] == 4
    assert clause["provision_id"] == "1.1"
    assert clause["section_level"] == 1
    assert clause["word_count"] == 20
    assert "Directions, 2025" in clause["clause_text"]


def test_get_clause_invalid_version_returns_400(client):
    """Test GET /api/analysis/psl-2020-2025/clauses/{invalid_ver}/{id} returns 400."""
    response = client.get("/api/analysis/psl-2020-2025/clauses/1999/PSL_2020_0001")
    assert response.status_code == 400


def test_get_unknown_clause_returns_404(client):
    """Test GET /api/analysis/psl-2020-2025/clauses/2020/{unknown_id} returns 404."""
    response = client.get("/api/analysis/psl-2020-2025/clauses/2020/NON_EXISTENT_CLAUSE")
    assert response.status_code == 404


def test_list_requirements_endpoint(client):
    """Test GET /api/analysis/psl-2020-2025/requirements returns extracted obligations."""
    response = client.get("/api/analysis/psl-2020-2025/requirements?limit=10")
    assert response.status_code == 200
    data = response.json()

    assert data["total"] == 5842
    assert data["returned"] == 10
    assert len(data["requirements"]) == 10

    first = data["requirements"][0]
    assert "document_id" in first
    assert "clause_id" in first
    assert "clause_text" in first
    assert "regulatory_function" in first


def test_filter_requirements_by_function(client):
    """Test filtering requirements by function (e.g. OBLIGATION)."""
    response = client.get("/api/analysis/psl-2020-2025/requirements?function=OBLIGATION&limit=5")
    assert response.status_code == 200
    data = response.json()

    assert data["total"] == 1042
    assert data["returned"] == 5
    for r in data["requirements"]:
        assert r["regulatory_function"] == "OBLIGATION"
