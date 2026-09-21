"""Tests for NLP Explorer API Endpoints and Inspection Services."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_nlp_documents():
    """Verify GET /api/nlp-explorer/documents returns available documents."""
    response = client.get("/api/nlp-explorer/documents")
    assert response.status_code == 200
    docs = response.json()
    assert isinstance(docs, list)
    assert len(docs) > 0
    assert "document_id" in docs[0]
    assert "title" in docs[0]
    assert "regulator" in docs[0]


def test_list_document_clauses():
    """Verify GET /api/nlp-explorer/documents/{id}/clauses returns ordered clauses."""
    # First get a document
    doc_res = client.get("/api/nlp-explorer/documents")
    docs = doc_res.json()
    doc_id = docs[0]["document_id"]

    response = client.get(f"/api/nlp-explorer/documents/{doc_id}/clauses")
    assert response.status_code == 200
    clauses = response.json()
    assert isinstance(clauses, list)
    assert len(clauses) > 0
    assert "clause_id" in clauses[0]
    assert "title" in clauses[0]


def test_get_clause_nlp_explorer_comprehensive():
    """Verify GET /api/nlp-explorer/clauses/{clause_id} returns all 5 NLP dimensions."""
    response = client.get("/api/nlp-explorer/clauses/3.2.1")
    assert response.status_code == 200
    data = response.json()
    assert data["clause_id"] == "3.2.1"
    assert "metadata" in data
    assert "tokens" in data
    assert len(data["tokens"]) > 0
    assert "token" in data["tokens"][0]
    assert "lemma" in data["tokens"][0]
    assert "pos_tag" in data["tokens"][0]

    assert "dependencies" in data
    assert len(data["dependencies"]) > 0
    assert "dep" in data["dependencies"][0]

    assert "entities" in data
    assert isinstance(data["entities"], list)

    assert "classification" in data
    assert data["classification"]["clause_type"] in [
        "OBLIGATION", "PROHIBITION", "PERMISSION", "EXCEPTION", "DEFINITION",
        "PROCEDURE", "REPORTING", "PENALTY", "REFERENCE", "INFORMATION"
    ]
    assert data["classification"]["modality"] in ["MANDATORY", "RECOMMENDED", "DISCRETIONARY", "PROHIBITIVE"]

    assert "requirement" in data
    assert "action" in data["requirement"]
    assert "subject" in data["requirement"]

    assert "raw_json" in data


def test_get_granular_sub_endpoints():
    """Verify individual sub-endpoints for tokens, dependencies, entities, classification, requirements."""
    clause_id = "3.2.1"

    res_tok = client.get(f"/api/nlp-explorer/clauses/{clause_id}/tokens")
    assert res_tok.status_code == 200
    assert isinstance(res_tok.json(), list)

    res_dep = client.get(f"/api/nlp-explorer/clauses/{clause_id}/dependencies")
    assert res_dep.status_code == 200
    assert isinstance(res_dep.json(), list)

    res_ent = client.get(f"/api/nlp-explorer/clauses/{clause_id}/entities")
    assert res_ent.status_code == 200
    assert isinstance(res_ent.json(), list)

    res_cls = client.get(f"/api/nlp-explorer/clauses/{clause_id}/classification")
    assert res_cls.status_code == 200
    assert "clause_type" in res_cls.json()

    res_req = client.get(f"/api/nlp-explorer/clauses/{clause_id}/requirements")
    assert res_req.status_code == 200
    assert "action" in res_req.json()
