"""Tests for arbitrary PDF and DOCX document ingestion and runtime repository."""

import io
import zipfile
from fastapi.testclient import TestClient
import pytest

from app.main import app
from app.dependencies import get_document_upload_service, get_regulation_service


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def sample_pdf_bytes():
    """Generate in-memory valid PDF bytes with extractable text."""
    try:
        import pymupdf
        doc = pymupdf.open()
        page = doc.new_page()
        page.insert_text(
            (50, 72),
            "Reserve Bank of India Master Direction - Know Your Customer (KYC) Direction, 2016.\n"
            "Clause 1: Every Regulated Entity shall conduct customer identification procedure.\n"
            "Clause 2: Periodic updation shall be carried out at least once in every two years for high risk customers.",
        )
        pdf_bytes = doc.tobytes()
        doc.close()
        return pdf_bytes
    except Exception:
        # Fallback to minimal PDF binary
        return (
            b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
            b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
            b"3 0 obj<</Type/Page/Parent 2 0 R/Contents 4 0 R>>endobj\n"
            b"4 0 obj<</Length 180>>stream\nBT /F1 12 Tf 50 700 Td (Reserve Bank of India Master Direction - Know Your Customer KYC Direction, 2016. Clause 1: Every Regulated Entity shall conduct customer identification procedure.) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000174 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n400\n%%EOF"
        )


@pytest.fixture
def sample_docx_bytes():
    """Generate in-memory valid DOCX bytes with extractable text."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        doc_xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
            "<w:body>"
            "<w:p><w:r><w:t>Master Policy on KYC and Customer Due Diligence 2024</w:t></w:r></w:p>"
            "<w:p><w:r><w:t>Section 1: General Requirements. Regulated entities shall verify identity using Aadhaar or passport.</w:t></w:r></w:p>"
            "<w:p><w:r><w:t>Section 2: High risk accounts require annual compliance re-certification.</w:t></w:r></w:p>"
            "</w:body>"
            "</w:document>"
        )
        z.writestr("word/document.xml", doc_xml)
        z.writestr("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>')
    return buf.getvalue()



def test_upload_valid_pdf(client, sample_pdf_bytes):
    """Test uploading a valid PDF document."""
    files = {"file": ("KYC_Master_Directions_2016.pdf", sample_pdf_bytes, "application/pdf")}
    response = client.post("/api/documents/upload", files=files)

    assert response.status_code == 200
    data = response.json()
    assert data["document_id"].startswith("doc_custom_")
    assert data["filename"] == "KYC_Master_Directions_2016.pdf"
    assert data["file_type"] == "PDF"
    assert data["source"] == "uploaded"
    assert data["page_count"] == 1
    assert data["word_count"] > 10
    assert "Know Your Customer" in data["extracted_text"]
    assert "Clause 1" in data["extracted_text"]


def test_upload_valid_docx(client, sample_docx_bytes):
    """Test uploading a valid DOCX document."""
    files = {
        "file": (
            "Internal_KYC_Policy_2024.docx",
            sample_docx_bytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
    }
    response = client.post("/api/documents/upload", files=files)

    assert response.status_code == 200
    data = response.json()
    assert data["document_id"].startswith("doc_custom_")
    assert data["filename"] == "Internal_KYC_Policy_2024.docx"
    assert data["file_type"] == "DOCX"
    assert data["source"] == "uploaded"
    assert data["word_count"] > 10
    assert "Customer Due Diligence" in data["extracted_text"]
    assert "Section 1" in data["extracted_text"]


def test_upload_invalid_file_extension(client):
    """Test uploading an unsupported file format returns 400."""
    files = {"file": ("unsupported_script.py", b"print('hello world')", "text/plain")}
    response = client.post("/api/documents/upload", files=files)

    assert response.status_code == 400
    data = response.json()
    assert "Unsupported file format" in data["detail"]


def test_upload_empty_file(client):
    """Test uploading an empty file (0 bytes) returns 400."""
    files = {"file": ("empty_document.pdf", b"", "application/pdf")}
    response = client.post("/api/documents/upload", files=files)

    assert response.status_code == 400
    data = response.json()
    assert "empty" in data["detail"].lower()


def test_uploaded_document_retrieval_and_regulation_service_resolution(client, sample_pdf_bytes):
    """Test that uploaded document can be retrieved from upload service and resolved by RegulationService."""
    # 1. Upload document
    files = {"file": ("KYC_Direction_2016.pdf", sample_pdf_bytes, "application/pdf")}
    upload_res = client.post("/api/documents/upload", files=files)
    assert upload_res.status_code == 200
    doc_id = upload_res.json()["document_id"]

    # 2. Retrieve via GET /api/documents/uploaded/{document_id}
    get_res = client.get(f"/api/documents/uploaded/{doc_id}")
    assert get_res.status_code == 200
    assert get_res.json()["document_id"] == doc_id

    # 3. Check resolution in RegulationService
    reg_service = get_regulation_service()
    resolved_doc = reg_service.get_document_by_id(doc_id)
    assert resolved_doc is not None
    assert resolved_doc.document_id == doc_id
    assert resolved_doc.filename == "KYC_Direction_2016.pdf"
    assert resolved_doc.source_page == "uploaded"


def test_existing_catalog_document_lookup_intact(client):
    """Test that existing catalog documents (e.g. PSL 2020 & 2025) are still resolved correctly."""
    # Existing PSL 2020 baseline
    res_2020 = client.get("/api/regulations/rbi_psl_2020_official")
    assert res_2020.status_code == 200
    assert res_2020.json()["document_id"] == "rbi_psl_2020_official"

    # Existing PSL 2025 target
    res_2025 = client.get("/api/regulations/rbi_a8d0f9a98495")
    assert res_2025.status_code == 200
    assert res_2025.json()["document_id"] == "rbi_a8d0f9a98495"


def test_create_analysis_with_uploaded_document_resolves_without_404(client, sample_pdf_bytes):
    """Test that creating an analysis with uploaded document IDs resolves documents cleanly."""
    # Upload baseline doc
    files_prev = {"file": ("KYC_2016.pdf", sample_pdf_bytes, "application/pdf")}
    res_prev = client.post("/api/documents/upload", files=files_prev)
    prev_id = res_prev.json()["document_id"]

    # Upload target doc
    files_curr = {"file": ("KYC_2023.pdf", sample_pdf_bytes, "application/pdf")}
    res_curr = client.post("/api/documents/upload", files=files_curr)
    curr_id = res_curr.json()["document_id"]

    # Call POST /api/analysis
    res_analysis = client.post(
        "/api/analysis",
        json={
            "previous_document_id": prev_id,
            "current_document_id": curr_id,
            "company_policy_document_id": None,
        },
    )

    # Must NOT return 404 "document not found"
    assert res_analysis.status_code == 200
    data = res_analysis.json()
    assert data["previous_document_id"] == prev_id
    assert data["current_document_id"] == curr_id
    assert data["status"] in ("unsupported_precomputed_pair", "pending", "processing", "complete")


def test_existing_psl_analysis_still_functional(client):
    """Regression test: Ensure existing PSL 2020 -> 2025 precomputed analysis flow is 100% intact."""
    # 1. Create analysis for PSL precomputed pair
    create_res = client.post(
        "/api/analysis",
        json={
            "previous_document_id": "rbi_psl_2020_official",
            "current_document_id": "rbi_a8d0f9a98495",
            "company_policy_document_id": None,
        },
    )
    assert create_res.status_code == 200
    assert create_res.json()["analysis_id"] == "psl-2020-2025"
    assert create_res.json()["status"] == "complete"

    # 2. Get status
    status_res = client.get("/api/analysis/psl-2020-2025/status")
    assert status_res.status_code == 200
    assert status_res.json()["progress"] == 100

    # 3. Get results
    results_res = client.get("/api/analysis/psl-2020-2025/results")
    assert results_res.status_code == 200
    assert results_res.json()["analysis_id"] == "psl-2020-2025"
    assert results_res.json()["overview"]["total_records"] == 63

