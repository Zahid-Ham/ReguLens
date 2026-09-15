"""Integration and unit tests for Analysis Creation and Job Status API."""

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    """Create FastAPI test client."""
    with TestClient(app) as test_client:
        yield test_client


def test_create_analysis_precomputed_psl_pair(client):
    """Test POST /api/analysis with PSL 2020 -> 2025 pair maps to precomputed analysis."""
    payload = {
        "previous_document_id": "rbi_psl_2020_official",
        "current_document_id": "rbi_a8d0f9a98495",
        "company_policy_document_id": None,
    }
    response = client.post("/api/analysis", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["analysis_id"] == "psl-2020-2025"
    assert data["status"] == "complete"
    assert data["mode"] == "precomputed"
    assert data["previous_document_id"] == "rbi_psl_2020_official"
    assert data["current_document_id"] == "rbi_a8d0f9a98495"
    assert data["company_policy_document_id"] is None
    assert "precomputed" in data["message"].lower()


def test_create_analysis_invalid_previous_document_returns_404(client):
    """Test POST /api/analysis with non-existent previous document returns 404."""
    payload = {
        "previous_document_id": "non_existent_doc_id_99999",
        "current_document_id": "rbi_a8d0f9a98495",
        "company_policy_document_id": None,
    }
    response = client.post("/api/analysis", json=payload)
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()
    assert "non_existent_doc_id_99999" in data["detail"]


def test_create_analysis_invalid_current_document_returns_404(client):
    """Test POST /api/analysis with non-existent current document returns 404."""
    payload = {
        "previous_document_id": "rbi_psl_2020_official",
        "current_document_id": "non_existent_target_doc_88888",
        "company_policy_document_id": None,
    }
    response = client.post("/api/analysis", json=payload)
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()
    assert "non_existent_target_doc_88888" in data["detail"]


def test_create_analysis_dynamic_arbitrary_pair(client):
    """Test POST /api/analysis with arbitrary valid documents executes dynamic comparison."""
    payload = {
        "previous_document_id": "rbi_000f2b89455b",
        "current_document_id": "rbi_026468aa5a50",
        "company_policy_document_id": "policy_internal_101",
    }
    response = client.post("/api/analysis", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] in ("processing", "complete")
    assert data["mode"] == "dynamic"
    assert data["analysis_id"].startswith("analysis_")
    assert data["previous_document_id"] == "rbi_000f2b89455b"
    assert data["current_document_id"] == "rbi_026468aa5a50"


def test_create_analysis_same_document_blocked(client):
    """Test POST /api/analysis with identical documents is rejected with 400."""
    payload = {
        "previous_document_id": "rbi_000f2b89455b",
        "current_document_id": "rbi_000f2b89455b",
        "company_policy_document_id": None,
    }
    response = client.post("/api/analysis", json=payload)
    assert response.status_code == 400
    assert "distinct" in response.json()["detail"].lower() or "identical" in response.json()["detail"].lower()


def test_dynamic_analysis_status_and_snapshots(client):
    """Test dynamic analysis status returns sequential stages, current sample tokens, POS, entities, and requirements."""
    payload = {
        "previous_document_id": "rbi_000f2b89455b",
        "current_document_id": "rbi_026468aa5a50",
        "company_policy_document_id": None,
    }
    create_res = client.post("/api/analysis", json=payload)
    assert create_res.status_code == 200
    analysis_id = create_res.json()["analysis_id"]

    status_res = client.get(f"/api/analysis/{analysis_id}/status")
    assert status_res.status_code == 200
    status_data = status_res.json()

    assert status_data["analysis_id"] == analysis_id
    assert status_data["mode"] == "dynamic"
    assert len(status_data["stages"]) == 12
    assert "document_counts" in status_data
    assert "current_sample" in status_data

    sample = status_data["current_sample"]
    if sample:
        assert "tokens" in sample
        assert "domain_entities" in sample
        assert "dependencies" in sample
        assert "classification" in sample
        if len(sample["tokens"]) > 0:
            assert "pos" in sample["tokens"][0]
            assert "lemma" in sample["tokens"][0]


def test_get_analysis_status_psl_2020_2025(client):
    """Test GET /api/analysis/{analysis_id}/status for precomputed analysis."""
    response = client.get("/api/analysis/psl-2020-2025/status")
    assert response.status_code == 200
    data = response.json()

    assert data["analysis_id"] == "psl-2020-2025"
    assert data["status"] == "complete"
    assert data["mode"] == "precomputed"
    assert data["progress"] == 100
    assert data["current_stage"] == "Analysis Complete"

    # Verify all 12 stages are present and completed
    stages = data["stages"]
    assert len(stages) == 12
    for stage in stages:
        assert stage["status"] == "completed"
        assert "name" in stage


def test_get_analysis_status_unknown_returns_404(client):
    """Test GET /api/analysis/{unknown_id}/status returns 404."""
    response = client.get("/api/analysis/unknown_job_id_99999/status")
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()


def test_get_analysis_results_psl_2020_2025(client):
    """Test GET /api/analysis/{analysis_id}/results returns aggregated change intelligence."""
    response = client.get("/api/analysis/psl-2020-2025/results")
    assert response.status_code == 200
    data = response.json()

    assert data["analysis_id"] == "psl-2020-2025"
    assert data["status"] == "complete"
    assert data["mode"] == "precomputed"

    # Verify overview payload
    overview = data["overview"]
    assert overview["total_records"] == 63
    assert overview["substantive_changes"] == 31
    assert overview["high_materiality"] == 50

    # Summary metrics
    metrics = data["summary_metrics"]
    assert metrics["total_records"] == 63
    assert metrics["substantive_changes"] == 31

    # Navigation links
    links = data["links"]
    assert "changes" in links
    assert "nlp_overview" in links


def test_get_analysis_results_unknown_returns_404(client):
    """Test GET /api/analysis/{unknown_id}/results returns 404."""
    response = client.get("/api/analysis/unknown_job_id_99999/results")
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()


def test_get_psl_document_clauses_and_detail(client):
    """Test retrieving full clause collections and granular clause detail for PSL benchmark."""
    # Previous clauses
    prev_res = client.get("/api/analysis/psl-2020-2025/nlp/documents/previous/clauses")
    assert prev_res.status_code == 200
    prev_data = prev_res.json()
    assert prev_data["document_role"] == "previous"
    assert prev_data["total_clauses"] > 0
    assert len(prev_data["clauses"]) == prev_data["total_clauses"]

    # Current clauses
    curr_res = client.get("/api/analysis/psl-2020-2025/nlp/documents/current/clauses")
    assert curr_res.status_code == 200
    curr_data = curr_res.json()
    assert curr_data["document_role"] == "current"
    assert curr_data["total_clauses"] > 0

    # Specific clause detail
    detail_res = client.get("/api/analysis/psl-2020-2025/nlp/clauses/current/1")
    assert detail_res.status_code == 200
    clause = detail_res.json()
    assert clause["clause_index"] == 1
    assert "tokens" in clause
    assert "pos_tags" in clause
    assert "clause_text" in clause


def test_get_dynamic_document_clauses_and_detail(client):
    """Test retrieving full clause collections and detail for dynamic analysis."""
    payload = {
        "previous_document_id": "rbi_000f2b89455b",
        "current_document_id": "rbi_026468aa5a50",
        "company_policy_document_id": None,
    }
    create_res = client.post("/api/analysis", json=payload)
    assert create_res.status_code == 200
    analysis_id = create_res.json()["analysis_id"]

    # Retrieve previous clauses
    prev_res = client.get(f"/api/analysis/{analysis_id}/nlp/documents/previous/clauses")
    assert prev_res.status_code == 200
    prev_data = prev_res.json()
    assert prev_data["document_role"] == "previous"
    assert prev_data["total_clauses"] > 0

    # Retrieve clause 1 detail
    detail_res = client.get(f"/api/analysis/{analysis_id}/nlp/clauses/previous/1")
    assert detail_res.status_code == 200
    clause = detail_res.json()
    assert clause["clause_index"] == 1
    assert len(clause["tokens"]) > 0

    # Test invalid role returns 400
    invalid_role = client.get(f"/api/analysis/{analysis_id}/nlp/documents/invalid_role/clauses")
    assert invalid_role.status_code == 400

    # Test out-of-range clause index returns 404
    out_of_range = client.get(f"/api/analysis/{analysis_id}/nlp/clauses/previous/99999")
    assert out_of_range.status_code == 404


