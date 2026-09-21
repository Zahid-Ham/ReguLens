"""Integration and unit tests for Regulatory Document Library API."""

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    """Create FastAPI test client."""
    with TestClient(app) as test_client:
        yield test_client


def test_list_regulations_default(client):
    """Test GET /api/regulations returns 200 and real records from catalog."""
    response = client.get("/api/regulations")
    assert response.status_code == 200
    data = response.json()

    assert "total" in data
    assert "returned" in data
    assert "limit" in data
    assert "offset" in data
    assert "documents" in data

    assert data["total"] >= 40  # 40 catalog documents + 1 verified baseline PSL 2020
    assert data["returned"] == len(data["documents"])
    assert data["limit"] == 50
    assert data["offset"] == 0

    # Ensure document fields are populated with real metadata
    first_doc = data["documents"][0]
    assert "document_id" in first_doc
    assert "filename" in first_doc
    assert "title" in first_doc
    assert "document_type" in first_doc
    assert "clause_count" in first_doc
    assert "total_words" in first_doc


def test_list_regulations_pagination(client):
    """Test pagination parameters limit and offset."""
    response = client.get("/api/regulations?limit=5&offset=0")
    assert response.status_code == 200
    data1 = response.json()
    assert data1["returned"] == 5
    assert data1["limit"] == 5
    assert data1["offset"] == 0

    response2 = client.get("/api/regulations?limit=5&offset=5")
    assert response2.status_code == 200
    data2 = response2.json()
    assert data2["returned"] == 5
    assert data2["limit"] == 5
    assert data2["offset"] == 5

    # Check distinct pages
    ids_page1 = {d["document_id"] for d in data1["documents"]}
    ids_page2 = {d["document_id"] for d in data2["documents"]}
    assert len(ids_page1.intersection(ids_page2)) == 0


def test_search_regulations_by_title_and_keywords(client):
    """Test search query filters matching documents."""
    # Search for priority sector lending
    response = client.get("/api/regulations?search=Priority Sector")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    for doc in data["documents"]:
        text_corpus = (
            f"{doc['title']} {doc.get('title_candidate') or ''} {doc['document_id']} {doc.get('notification_numbers') or ''}"
        ).lower()
        assert "priority sector" in text_corpus or "psl" in text_corpus


def test_search_regulations_by_document_id(client):
    """Test search query filters by exact document ID substring."""
    response = client.get("/api/regulations?search=rbi_a8d0f9a98495")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["documents"][0]["document_id"] == "rbi_a8d0f9a98495"
    assert data["documents"][0]["filename"] == "rbi_a8d0f9a98495.pdf"


def test_filter_by_document_type(client):
    """Test filtering by document_type query parameter."""
    response = client.get("/api/regulations?document_type=Master Directions")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    for doc in data["documents"]:
        assert "Master Directions" in doc["document_type"] or (doc["source_page"] and "master_directions" in doc["source_page"])


def test_get_psl_2025_document(client):
    """Test GET /api/regulations/rbi_a8d0f9a98495 returns PSL 2025 document with actual metadata."""
    response = client.get("/api/regulations/rbi_a8d0f9a98495")
    assert response.status_code == 200
    doc = response.json()
    assert doc["document_id"] == "rbi_a8d0f9a98495"
    assert doc["filename"] == "rbi_a8d0f9a98495.pdf"
    assert "Priority Sector Lending" in doc["title"] or "Master Direction" in doc["title"]
    assert doc["clause_count"] == 348
    assert doc["total_words"] == 13382
    assert "FIDD.CO.PSD.BC.13/04.09.001/2024-25" in doc["notification_numbers"]


def test_get_psl_2020_official_document(client):
    """Test GET /api/regulations/rbi_psl_2020_official returns verified baseline document."""
    response = client.get("/api/regulations/rbi_psl_2020_official")
    assert response.status_code == 200
    doc = response.json()
    assert doc["document_id"] == "rbi_psl_2020_official"
    assert doc["filename"] == "rbi_psl_2020_official.pdf"
    assert "Priority Sector Lending" in doc["title"]
    assert doc["clause_count"] == 60
    assert doc["total_words"] == 6512
    assert doc["is_verified_baseline"] is True


def test_get_unknown_document_returns_404(client):
    """Test GET /api/regulations/{invalid_id} returns HTTP 404."""
    response = client.get("/api/regulations/non_existent_doc_id_99999")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "not found" in data["detail"].lower()


def test_get_regulations_metrics(client):
    """Test GET /api/regulations/metrics returns real calculated totals."""
    response = client.get("/api/regulations/metrics")
    assert response.status_code == 200
    metrics = response.json()
    assert "total_documents" in metrics
    assert "regulatory_authorities_count" in metrics
    assert "document_categories_count" in metrics
    assert "processed_count" in metrics
    assert metrics["total_documents"] >= 40
    assert metrics["regulatory_authorities_count"] >= 1
    assert metrics["document_categories_count"] >= 3
    assert metrics["processed_count"] >= 40


def test_get_regulations_filters(client):
    """Test GET /api/regulations/filters returns distinct filter options."""
    response = client.get("/api/regulations/filters")
    assert response.status_code == 200
    filters = response.json()
    assert "regulators" in filters
    assert "categories" in filters
    assert "statuses" in filters
    assert "years" in filters
    assert len(filters["regulators"]) >= 1
    assert "Priority Sector Lending" in filters["categories"]


def test_psl_related_documents_link(client):
    """Test that PSL 2025 detail has PSL 2020 linked in related_documents."""
    response = client.get("/api/regulations/rbi_a8d0f9a98495")
    assert response.status_code == 200
    doc = response.json()
    assert "related_documents" in doc
    assert len(doc["related_documents"]) >= 1
    related_ids = [r["document_id"] for r in doc["related_documents"]]
    assert "rbi_psl_2020_official" in related_ids

