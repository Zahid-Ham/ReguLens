"""Tests for the dynamic NLP pipeline on uploaded regulatory documents."""

import io
import zipfile
from fastapi.testclient import TestClient
import pytest

from app.main import app
from app.services.dynamic_nlp_pipeline import DynamicNLPPipeline


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def kyc_pdf_bytes():
    """Generate in-memory PDF with realistic regulatory provisions and dates."""
    try:
        import pymupdf

        doc = pymupdf.open()
        page = doc.new_page()
        page.insert_text(
            (50, 72),
            "Reserve Bank of India Master Direction - Know Your Customer (KYC) Direction, 2016.\n"
            "Promulgated on May 26, 2004 and updated as on September 04, 2020.\n\n"
            "Section 1: General Requirements.\n"
            "1.1 Regulated entities shall conduct customer identification procedure for all new accounts.\n\n"
            "1.2 Commercial Banks shall not open anonymous or fictitious accounts.\n\n"
            "1.3 Urban Co-operative Banks shall submit the quarterly compliance return within 15 days from the end of the quarter.\n\n"
            "1.4 Regulated entities may verify identity using digital KYC or Aadhaar e-KYC at their discretion.\n\n"
            "1.5 Provided that where simplified KYC is applied, the account balance shall not exceed Rs. 50,000.",
        )
        pdf_bytes = doc.tobytes()
        doc.close()
        return pdf_bytes
    except Exception:
        return b"%PDF-1.4 sample"


@pytest.fixture
def sample_docx_bytes():
    """Generate in-memory DOCX with regulatory provisions."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        doc_xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
            "<w:body>"
            "<w:p><w:r><w:t>Chapter I: Internal Compliance Policy</w:t></w:r></w:p>"
            "<w:p><w:r><w:t>1. Every Regulated Entity shall appoint a Principal Officer under PMLA.</w:t></w:r></w:p>"
            "<w:p><w:r><w:t>2. Banks shall submit the STR report to FIU-IND within 7 days.</w:t></w:r></w:p>"
            "</w:body>"
            "</w:document>"
        )
        z.writestr("word/document.xml", doc_xml)
        z.writestr("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>')
    return buf.getvalue()


def test_dynamic_nlp_pipeline_on_uploaded_pdf(client, kyc_pdf_bytes):
    """Test full dynamic NLP execution on uploaded PDF document."""
    # 1. Upload PDF
    files = {"file": ("KYC_Directions_2016.pdf", kyc_pdf_bytes, "application/pdf")}
    upload_res = client.post("/api/documents/upload", files=files)
    assert upload_res.status_code == 200
    doc_id = upload_res.json()["document_id"]

    # 2. Run Dynamic NLP
    nlp_res = client.post(f"/api/documents/{doc_id}/nlp")
    assert nlp_res.status_code == 200
    data = nlp_res.json()

    assert data["document_id"] == doc_id
    assert data["status"] == "completed"

    stats = data["statistics"]
    assert stats["total_clauses"] >= 4
    assert stats["total_words"] > 30
    assert stats["clauses_with_entities"] >= 2
    assert stats["total_entity_mentions"] >= 4
    assert stats["requirement_like_clauses"] >= 2

    # Check clauses
    clauses = data["clauses"]
    assert len(clauses) >= 4

    # Verify linguistic tokens, lemmas, POS, dependencies
    c1 = clauses[0]
    assert len(c1["tokens"]) > 0
    assert len(c1["lemmas"]) == len(c1["tokens"])
    assert len(c1["pos_tags"]) == len(c1["tokens"])
    assert len(c1["dependencies"]) == len(c1["tokens"])

    # Verify retrieved via GET
    get_res = client.get(f"/api/documents/{doc_id}/nlp")
    assert get_res.status_code == 200
    assert get_res.json()["document_id"] == doc_id


def test_dynamic_nlp_pipeline_on_uploaded_docx(client, sample_docx_bytes):
    """Test full dynamic NLP execution on uploaded DOCX document."""
    files = {
        "file": (
            "AML_Policy.docx",
            sample_docx_bytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
    }
    upload_res = client.post("/api/documents/upload", files=files)
    assert upload_res.status_code == 200
    doc_id = upload_res.json()["document_id"]

    nlp_res = client.post(f"/api/documents/{doc_id}/nlp")
    assert nlp_res.status_code == 200
    data = nlp_res.json()

    assert data["statistics"]["total_clauses"] >= 2
    assert data["statistics"]["total_entity_mentions"] >= 2


def test_domain_ner_and_date_guardrails():
    """Unit test for domain NER and May date vs permission guardrail."""
    pipeline = DynamicNLPPipeline()

    text = (
        "Reserve Bank of India issued directions on May 26, 2004. "
        "Commercial Banks shall submit the return within 15 days. "
        "The minimum threshold is 7.5 per cent and fine is Rs. 50,000 under Banking Regulation Act, 1949."
    )
    entities = pipeline.extract_domain_entities(text)
    labels = {e.label for e in entities}

    assert "REGULATOR" in labels
    assert "DATE" in labels
    assert "REGULATED_ENTITY" in labels
    assert "DEADLINE" in labels
    assert "THRESHOLD" in labels
    assert "MONETARY_VALUE" in labels
    assert "ACT" in labels

    # Confirm "May 26, 2004" is matched as DATE
    date_entities = [e for e in entities if e.label == "DATE"]
    assert any("May 26, 2004" in e.text for e in date_entities)


def test_clause_classification_labels():
    """Verify classification identifies obligation, prohibition, reporting, permission, and exception."""
    pipeline = DynamicNLPPipeline()
    nlp = pipeline.get_nlp()

    # Obligation
    text_ob = "Regulated entities shall verify customer identity."
    doc_ob = nlp(text_ob)
    ent_ob = pipeline.extract_domain_entities(text_ob)
    res_ob = pipeline.classify_clause(text_ob, doc_ob, ent_ob)
    assert res_ob.label == "OBLIGATION"

    # Prohibition
    text_proh = "Banks shall not open anonymous accounts."
    doc_proh = nlp(text_proh)
    ent_proh = pipeline.extract_domain_entities(text_proh)
    res_proh = pipeline.classify_clause(text_proh, doc_proh, ent_proh)
    assert res_proh.label == "PROHIBITION"

    # Reporting
    text_rep = "Urban Co-operative Banks shall submit the quarterly return within 15 days."
    doc_rep = nlp(text_rep)
    ent_rep = pipeline.extract_domain_entities(text_rep)
    res_rep = pipeline.classify_clause(text_rep, doc_rep, ent_rep)
    assert res_rep.label == "REPORTING"

    # Permission (true modal may)
    text_perm = "Regulated entities may accept alternate documents at their discretion."
    doc_perm = nlp(text_perm)
    ent_perm = pipeline.extract_domain_entities(text_perm)
    res_perm = pipeline.classify_clause(text_perm, doc_perm, ent_perm)
    assert res_perm.label == "PERMISSION"

    # Date with "May" should NOT trigger PERMISSION
    text_date = "The circular was issued on May 26, 2004 for general information."
    doc_date = nlp(text_date)
    ent_date = pipeline.extract_domain_entities(text_date)
    res_date = pipeline.classify_clause(text_date, doc_date, ent_date)
    assert res_date.label != "PERMISSION"
    assert res_date.label == "INFORMATION"


def test_structured_requirement_extraction():
    """Verify requirement extraction extracts subject, modality, action, object, deadline."""
    pipeline = DynamicNLPPipeline()
    nlp = pipeline.get_nlp()

    text = "Regulated entities shall submit the compliance report within 15 days."
    doc = nlp(text)
    entities = pipeline.extract_domain_entities(text)
    classification = pipeline.classify_clause(text, doc, entities)
    req = pipeline.extract_requirement(text, doc, classification, entities)

    assert req is not None
    assert req.subject is not None
    assert "entities" in req.subject.lower() or "regulated" in req.subject.lower()
    assert req.modality == "shall"
    assert req.action == "submit"
    assert req.deadline == "within 15 days"


def test_get_document_nlp_before_processing_returns_404(client, kyc_pdf_bytes):
    """Test GET /api/documents/{id}/nlp before processing returns 404 with helpful message."""
    files = {"file": ("unprocessed.pdf", kyc_pdf_bytes, "application/pdf")}
    upload_res = client.post("/api/documents/upload", files=files)
    doc_id = upload_res.json()["document_id"]

    get_res = client.get(f"/api/documents/{doc_id}/nlp")
    assert get_res.status_code == 404
    assert "not been executed yet" in get_res.json()["detail"].lower()


def test_nlp_on_unknown_document_returns_404(client):
    """Test POST /api/documents/{unknown_id}/nlp returns 404."""
    res = client.post("/api/documents/doc_custom_non_existent_9999/nlp")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_psl_precomputed_endpoints_regression(client):
    """Regression test: Ensure existing precomputed PSL NLP endpoints and analysis remain intact."""
    # 1. Precomputed PSL NLP overview
    res_nlp = client.get("/api/analysis/psl-2020-2025/nlp/overview")
    assert res_nlp.status_code == 200
    assert res_nlp.json()["total_regulatory_clauses"] >= 5800

    # 2. PSL change results
    res_psl = client.get("/api/analysis/psl-2020-2025/results")
    assert res_psl.status_code == 200
    assert res_psl.json()["overview"]["total_records"] == 63

