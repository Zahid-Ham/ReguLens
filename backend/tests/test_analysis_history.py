"""Automated Test Suite for Analysis History and Persistence Layer."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, init_db
from app.main import app
from app.models.analysis import AnalysisRecord
from app.services.analysis_history_service import AnalysisHistoryService


@pytest.fixture(scope="module")
def client():
    """Create FastAPI test client with initialized database."""
    init_db()
    history_svc = AnalysisHistoryService()
    history_svc.seed_canonical_psl_analysis()
    with TestClient(app) as test_client:
        yield test_client


def test_canonical_psl_seeded(client: TestClient):
    """Verify that canonical PSL 2020 -> 2025 analysis is seeded into persistence."""
    res = client.get("/api/analyses/psl-2020-2025")
    assert res.status_code == 200
    data = res.json()
    analysis = data["analysis"]
    assert analysis["id"] == "psl-2020-2025"
    assert analysis["status"] == "complete"
    assert analysis["mode"] == "precomputed"
    assert "Priority Sector Lending" in analysis["previous_document_title"]
    assert analysis["overview_summary"]["total_records"] == 63
    assert analysis["overview_summary"]["substantive_changes"] == 31
    assert analysis["overview_summary"]["added_candidates"] == 7
    assert analysis["overview_summary"]["removed_candidates"] == 12


def test_list_analyses_default(client: TestClient):
    """Verify GET /api/analyses returns paginated list."""
    res = client.get("/api/analyses")
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "analyses" in data
    assert data["total"] >= 1
    assert len(data["analyses"]) >= 1
    assert data["page"] == 1
    assert data["page_size"] == 10
    # First item on page 1 should be marked is_most_recent
    assert data["analyses"][0]["is_most_recent"] is True


def test_search_analyses(client: TestClient):
    """Verify search filter by title or ID."""
    res = client.get("/api/analyses?search=PSL")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1
    for a in data["analyses"]:
        matched = (
            "psl" in a["title"].lower()
            or "psl" in a["id"].lower()
            or "psl" in a["previous_document_title"].lower()
            or "psl" in a["current_document_title"].lower()
        )
        assert matched


def test_status_filter(client: TestClient):
    """Verify status filter by 'complete'."""
    res = client.get("/api/analyses?status=complete")
    assert res.status_code == 200
    data = res.json()
    for a in data["analyses"]:
        assert a["status"] == "complete"


def test_date_filter(client: TestClient):
    """Verify date filtering returns 200 with valid response structure."""
    res = client.get("/api/analyses?date_filter=30days")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data["analyses"], list)


def test_pagination(client: TestClient):
    """Verify pagination params page and page_size."""
    res = client.get("/api/analyses?page=1&page_size=2")
    assert res.status_code == 200
    data = res.json()
    assert data["page"] == 1
    assert data["page_size"] == 2
    assert len(data["analyses"]) <= 2


def test_get_analysis_not_found(client: TestClient):
    """Verify 404 for non-existent analysis."""
    res = client.get("/api/analyses/non_existent_analysis_xyz")
    assert res.status_code == 404


def test_cannot_delete_canonical_psl(client: TestClient):
    """Verify canonical PSL analysis cannot be deleted."""
    res = client.delete("/api/analyses/psl-2020-2025")
    assert res.status_code == 400


def test_dynamic_analysis_persistence_lifecycle(client: TestClient):
    """Test full lifecycle: create dynamic analysis -> persist -> query list -> query detail -> delete."""
    import pymupdf
    
    # 1. Create valid test PDF documents
    doc1 = pymupdf.open()
    p1 = doc1.new_page()
    p1.insert_text((50, 72), "Master Direction 2024. Scheduled commercial banks shall maintain 40 percent lending target.")
    pdf1_bytes = doc1.tobytes()
    doc1.close()

    doc2 = pymupdf.open()
    p2 = doc2.new_page()
    p2.insert_text((50, 72), "Master Direction 2025. Scheduled commercial banks shall maintain 45 percent lending target.")
    pdf2_bytes = doc2.tobytes()
    doc2.close()

    file1 = ("test_prev.pdf", pdf1_bytes, "application/pdf")
    file2 = ("test_curr.pdf", pdf2_bytes, "application/pdf")

    up1 = client.post("/api/documents/upload", files={"file": file1})
    assert up1.status_code == 200
    doc1_id = up1.json()["document_id"]

    up2 = client.post("/api/documents/upload", files={"file": file2})
    assert up2.status_code == 200
    doc2_id = up2.json()["document_id"]

    # 2. Create analysis
    create_res = client.post(
        "/api/analysis",
        json={
            "previous_document_id": doc1_id,
            "current_document_id": doc2_id,
        },
    )
    assert create_res.status_code == 200
    created_data = create_res.json()
    new_id = created_data["analysis_id"]

    # 3. Verify it appears in GET /api/analyses
    history_res = client.get("/api/analyses")
    assert history_res.status_code == 200
    history_items = history_res.json()["analyses"]
    found = any(a["id"] == new_id for a in history_items)
    assert found

    # 4. Verify detail
    detail_res = client.get(f"/api/analyses/{new_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()["analysis"]
    assert detail["id"] == new_id
    assert detail["previous_document_id"] == doc1_id
    assert detail["current_document_id"] == doc2_id

    # 5. Verify results endpoint loads persisted data
    results_res = client.get(f"/api/analysis/{new_id}/results")
    assert results_res.status_code == 200
    results = results_res.json()
    assert results["analysis_id"] == new_id
    assert results["status"] == "complete"

    # 6. Verify changes endpoint
    changes_res = client.get(f"/api/analysis/{new_id}/changes")
    assert changes_res.status_code == 200
    assert "changes" in changes_res.json()

    # 7. Delete dynamic analysis
    del_res = client.delete(f"/api/analyses/{new_id}")
    assert del_res.status_code == 200

    # 8. Verify deleted from history
    check_del = client.get(f"/api/analyses/{new_id}")
    assert check_del.status_code == 404
