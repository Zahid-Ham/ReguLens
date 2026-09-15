"""Integration and unit tests for NLP Processing Intelligence API."""

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    """Create FastAPI test client."""
    with TestClient(app) as test_client:
        yield test_client


def test_nlp_overview_endpoint(client):
    """Test GET /api/analysis/psl-2020-2025/nlp/overview returns 200 and real statistics."""
    response = client.get("/api/analysis/psl-2020-2025/nlp/overview")
    assert response.status_code == 200
    data = response.json()

    assert data["total_regulatory_clauses"] == 5842
    assert data["clauses_with_domain_entities"] == 2456
    assert data["total_domain_entity_mentions"] == 7445

    # Entity counts
    assert "REGULATORY_INSTRUMENT" in data["domain_entity_counts"]
    assert data["domain_entity_counts"]["REGULATORY_INSTRUMENT"] == 1713
    assert data["domain_entity_counts"]["DATE"] == 1542
    assert data["domain_entity_counts"]["REGULATOR"] == 1011

    # Requirement coverage counts
    assert data["requirement_like_clauses"] == 1756
    assert data["extracted_subjects"] == 2009
    assert data["extracted_actions"] == 2144
    assert data["regulatory_modality_count"] == 2177
    assert data["deadline_count"] == 139
    assert data["duration_count"] == 357

    # Classification distribution and validation accuracy
    assert data["classification_validation_accuracy"] == 0.88
    assert "INFORMATION" in data["classification_distribution"]
    assert data["classification_distribution"]["INFORMATION"] == 54

    # Pipeline stages
    assert len(data["pipeline_stages"]) == 12
    assert "Document Processing" in data["pipeline_stages"]
    assert "Clause Segmentation" in data["pipeline_stages"]
    assert "Domain NER" in data["pipeline_stages"]
    assert "Materiality Assessment" in data["pipeline_stages"]


def test_domain_ner_statistics_endpoint(client):
    """Test GET /api/analysis/psl-2020-2025/nlp/entities returns ranked entity metrics."""
    response = client.get("/api/analysis/psl-2020-2025/nlp/entities")
    assert response.status_code == 200
    data = response.json()

    assert data["total_mentions"] == 7445
    assert data["total_clauses_annotated"] == 5842
    assert data["clauses_with_entities"] == 2456

    stats = data["entity_statistics"]
    assert len(stats) >= 10

    # Ensure sorted by count descending
    counts = [item["count"] for item in stats]
    assert counts == sorted(counts, reverse=True)

    first = stats[0]
    assert first["entity_type"] == "REGULATORY_INSTRUMENT"
    assert first["count"] == 1713
    assert first["percentage"] > 20.0


def test_clause_classification_endpoint(client):
    """Test GET /api/analysis/psl-2020-2025/nlp/classification returns distribution and validation."""
    response = client.get("/api/analysis/psl-2020-2025/nlp/classification")
    assert response.status_code == 200
    data = response.json()

    assert data["total_annotated"] == 300
    assert "LLM-assisted annotation" in data["dataset_type"]
    assert len(data["distribution"]) == 10

    # Top class is INFORMATION
    assert data["distribution"][0]["label"] == "INFORMATION"
    assert data["distribution"][0]["count"] == 54

    # Human audit validation metrics
    validation = data["validation"]
    assert validation["audit_size"] == 50
    assert validation["agreements"] == 44
    assert validation["validated_accuracy"] == 0.88
    assert "Human-audited validation subset" in validation["audit_subset_description"]


def test_requirement_coverage_endpoint(client):
    """Test GET /api/analysis/psl-2020-2025/nlp/requirements/coverage returns coverage metrics."""
    response = client.get("/api/analysis/psl-2020-2025/nlp/requirements/coverage")
    assert response.status_code == 200
    data = response.json()

    assert data["total_clauses"] == 5842
    assert data["requirement_like"] == 1756
    assert data["subject_extracted"] == 2009
    assert data["action_extracted"] == 2144
    assert data["modal_detected"] == 2177
    assert data["deadline_detected"] == 139
    assert data["duration_detected"] == 357

    # Percentages
    pcts = data["coverage_percentages"]
    assert pcts["requirement_like_pct"] == 30.06
    assert pcts["subject_extracted_pct"] == 34.39

    # Function distribution
    fns = data["regulatory_function_distribution"]
    assert fns["INFORMATION"] == 4086
    assert fns["OBLIGATION"] == 1042
    assert fns["PERMISSION"] == 497
    assert fns["PROHIBITION"] == 217


def test_classifier_evaluation_endpoint(client):
    """Test GET /api/analysis/psl-2020-2025/nlp/evaluation returns 5-fold CV metrics for both models."""
    response = client.get("/api/analysis/psl-2020-2025/nlp/evaluation")
    assert response.status_code == 200
    data = response.json()

    assert len(data["models"]) == 2

    # Model 1: TF-IDF
    tfidf_model = data["models"][0]
    assert "TF-IDF" in tfidf_model["model_name"]
    assert tfidf_model["cv_folds"] == 5
    assert tfidf_model["metrics"]["accuracy"]["mean"] == 0.52
    assert "f1_macro" in tfidf_model["metrics"]

    # Model 2: Semantic Classifier
    sem_model = data["models"][1]
    assert "Sentence Transformer" in sem_model["model_name"]
    assert sem_model["cv_folds"] == 5
    assert sem_model["metrics"]["accuracy"]["mean"] == 0.4433


def test_clause_nlp_detail_existing(client):
    """Test GET /api/analysis/psl-2020-2025/nlp/clauses/{clause_id} for real clause."""
    response = client.get("/api/analysis/psl-2020-2025/nlp/clauses/rbi_6b7a5215284a_p1_c1")
    assert response.status_code == 200
    clause = response.json()

    assert clause["clause_id"] == "rbi_6b7a5215284a_p1_c1"
    assert "ANNEX I" in clause["clause_text"]
    assert clause["tokens"] is not None
    assert len(clause["tokens"]) > 0
    assert len(clause["domain_entities"]) >= 1
    assert clause["regulatory_function"] == "INFORMATION"


def test_clause_nlp_detail_unknown_returns_404(client):
    """Test GET /api/analysis/psl-2020-2025/nlp/clauses/{unknown_id} returns 404."""
    response = client.get("/api/analysis/psl-2020-2025/nlp/clauses/non_existent_nlp_clause_99999")
    assert response.status_code == 404
    data = response.json()
    assert "not found" in data["detail"].lower()


def test_nlp_processing_status(client):
    """Test GET /api/analysis/psl-2020-2025/nlp/status returns precomputed complete state."""
    response = client.get("/api/analysis/psl-2020-2025/nlp/status")
    assert response.status_code == 200
    status_data = response.json()

    assert status_data["analysis_id"] == "psl-2020-2025"
    assert status_data["mode"] == "precomputed"
    assert status_data["status"] == "complete"
    assert len(status_data["stages"]) == 12

    for stage in status_data["stages"]:
        assert stage["status"] == "completed"
        assert stage["artifact_exists"] is True


def test_regression_existing_endpoints(client):
    """Verify existing health, regulations, and change analysis endpoints still function."""
    # Health
    r_health = client.get("/api/health")
    assert r_health.status_code == 200

    # Regulations
    r_regs = client.get("/api/regulations?limit=2")
    assert r_regs.status_code == 200
    assert r_regs.json()["total"] >= 40

    # Analysis Overview
    r_overview = client.get("/api/analysis/psl-2020-2025")
    assert r_overview.status_code == 200
    assert r_overview.json()["total_records"] == 63
