"""Dynamic Comparison Service and Pipeline Tests.

Tests the dynamic regulatory comparison engine across:
1. Synthetic document pairs testing modality shifts (may -> shall), deadline/duration/monetary parameters,
   and unchanged clauses.
2. Administrative date change distinction (low materiality).
3. Added and removed clause candidate detection for unmatched clauses.
4. Real uploaded document comparison through FastAPI endpoints.
5. Verification of dynamic query endpoints (overview, changes, single change, clause detail).
6. PSL 2020 vs 2025 precomputed regression validation.
"""

import io
from fastapi.testclient import TestClient
import fitz  # PyMuPDF
import pytest

from app.main import app
from app.services.dynamic_comparison_service import DynamicComparisonService
from app.services.dynamic_nlp_pipeline import DynamicNLPPipeline


@pytest.fixture
def client():
    return TestClient(app)


def _create_simple_pdf_bytes(text: str) -> bytes:
    """Helper creating minimal in-memory PDF file."""
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), text, fontsize=11)
    buf = io.BytesIO()
    doc.save(buf)
    doc.close()
    return buf.getvalue()


# =============================================================================
# 1. Synthetic Document Comparison Unit Tests
# =============================================================================


def test_synthetic_document_comparison():
    """Test dynamic comparison service on synthetic regulatory clauses."""
    nlp_pipeline = DynamicNLPPipeline()
    comp_service = DynamicComparisonService()

    prev_text = """
1.1. Regulated entities may verify customer identity within 15 days of account opening.

1.2. Banks shall retain customer transaction records for a period of 5 years.

1.3. Every regulated entity shall appoint a Chief Compliance Officer.

1.4. Updated as on November 06, 2024.
"""

    curr_text = """
1.1. Regulated entities shall verify customer identity within 30 days of account opening.

1.2. Banks shall retain customer transaction records for a period of 7 years.

1.3. Every regulated entity shall appoint a Chief Compliance Officer.

1.4. Updated as on August 14, 2025.
"""


    prev_nlp = nlp_pipeline.process_document("doc_synth_prev", prev_text)
    curr_nlp = nlp_pipeline.process_document("doc_synth_curr", curr_text)


    analysis_id, overview, changes = comp_service.compare_documents(
        previous_document_id="doc_synth_prev",
        current_document_id="doc_synth_curr",
        previous_nlp=prev_nlp,
        current_nlp=curr_nlp,
        previous_title="Synthetic Baseline 2024",
        current_title="Synthetic Updated 2025",
    )

    assert analysis_id.startswith("analysis_")
    assert analysis_id != "psl-2020-2025"
    assert overview.total_records == len(changes)
    assert len(changes) >= 4

    # Locate Change 1: 1.1 (may -> shall, 15 -> 30 days)
    chg_1_1 = next(
        (c for c in changes if "15 days" in (c.previous_clause_text or "") or "30 days" in (c.current_clause_text or "")),
        None,
    )
    assert chg_1_1 is not None
    assert chg_1_1.final_change_type in ["MODIFIED", "SUBSTANTIVE_CHANGE"]
    assert chg_1_1.final_materiality == "HIGH"
    assert chg_1_1.modality_direction == "STRENGTHENED"
    assert "MODALITY" in chg_1_1.change_dimension
    assert "DEADLINE" in chg_1_1.change_dimension
    assert any("modality" in r.lower() or "shall" in r.lower() for r in chg_1_1.materiality_reasons)

    # Locate Change 2: 1.2 (5 -> 7 years)
    chg_1_2 = next(
        (c for c in changes if "5 years" in (c.previous_clause_text or "") or "7 years" in (c.current_clause_text or "")),
        None,
    )
    assert chg_1_2 is not None
    assert chg_1_2.final_change_type in ["MODIFIED", "SUBSTANTIVE_CHANGE"]
    assert chg_1_2.final_materiality == "HIGH"
    assert "DURATION" in chg_1_2.change_dimension
    assert any("duration" in r.lower() or "year" in r.lower() for r in chg_1_2.materiality_reasons)

    # Locate Change 3: 1.3 (Chief Compliance Officer - Unchanged)
    chg_1_3 = next(
        (c for c in changes if "Chief Compliance Officer" in (c.current_clause_text or "")),
        None,
    )
    assert chg_1_3 is not None
    assert chg_1_3.final_change_type == "UNCHANGED"
    assert chg_1_3.final_materiality == "LOW"

    # Locate Change 4: Administrative date update ("Updated as on...")
    chg_admin = next(
        (c for c in changes if "Updated as on" in (c.current_clause_text or "")),
        None,
    )
    assert chg_admin is not None
    assert chg_admin.final_change_type == "ADMINISTRATIVE_CHANGE"
    assert chg_admin.final_materiality == "LOW"


def test_monetary_and_percentage_shifts():
    """Test parameter shift detection for monetary amounts and percentages."""
    nlp_pipeline = DynamicNLPPipeline()
    comp_service = DynamicComparisonService()

    prev_text = "Scheduled commercial banks shall allocate 10% of ANBC or ₹50,000 whichever is higher."
    curr_text = "Scheduled commercial banks shall allocate 15% of ANBC or ₹1,00,000 whichever is higher."

    prev_nlp = nlp_pipeline.process_document("doc_mon_prev", prev_text)
    curr_nlp = nlp_pipeline.process_document("doc_mon_curr", curr_text)

    _, overview, changes = comp_service.compare_documents(
        "doc_mon_prev", "doc_mon_curr", prev_nlp, curr_nlp
    )

    assert len(changes) == 1
    rec = changes[0]
    assert rec.final_change_type == "MODIFIED"
    assert rec.final_materiality == "HIGH"
    assert "PERCENTAGE" in rec.change_dimension
    assert "MONETARY_VALUE" in rec.change_dimension
    assert any("10%" in r or "15%" in r or "percentage" in r.lower() for r in rec.materiality_reasons)
    assert any("50,000" in r or "1,00,000" in r or "monetary" in r.lower() for r in rec.materiality_reasons)


def test_added_and_removed_clause_candidates():
    """Test candidate detection for clauses added in current or removed from baseline."""
    nlp_pipeline = DynamicNLPPipeline()
    comp_service = DynamicComparisonService()

    prev_text = """
2.1. Old legacy reporting requirement that is completely deprecated.
2.2. Standard general regulatory principle.
"""
    curr_text = """
2.2. Standard general regulatory principle.
2.3. Brand new artificial intelligence governance framework requirement.
"""

    prev_nlp = nlp_pipeline.process_document("doc_diff_prev", prev_text)
    curr_nlp = nlp_pipeline.process_document("doc_diff_curr", curr_text)

    _, overview, changes = comp_service.compare_documents(
        "doc_diff_prev", "doc_diff_curr", prev_nlp, curr_nlp
    )

    types = [c.final_change_type for c in changes]
    assert "REMOVED" in types or "REMOVED_CANDIDATE" in types
    assert "ADDED" in types or "ADDED_CANDIDATE" in types
    assert "UNCHANGED" in types


# =============================================================================
# 2. End-to-End API Dynamic Comparison with Uploaded Documents
# =============================================================================


def test_end_to_end_uploaded_pdf_dynamic_comparison(client):
    """Test full upload -> dynamic NLP -> dynamic comparison -> results retrieval flow."""
    # 1. Upload Baseline PDF
    prev_pdf = _create_simple_pdf_bytes(
        "1.1. Payment aggregators may submit quarterly statements within 10 days.\n"
        "1.2. Minimum net worth shall be ₹15 crore."
    )
    up_prev_res = client.post(
        "/api/documents/upload",
        files={"file": ("prev_regulation.pdf", prev_pdf, "application/pdf")},
    )
    assert up_prev_res.status_code == 200
    prev_doc_id = up_prev_res.json()["document_id"]
    assert prev_doc_id.startswith("doc_custom_")

    # 2. Upload Target PDF
    curr_pdf = _create_simple_pdf_bytes(
        "1.1. Payment aggregators shall submit quarterly statements within 20 days.\n"
        "1.2. Minimum net worth shall be ₹25 crore."
    )
    up_curr_res = client.post(
        "/api/documents/upload",
        files={"file": ("curr_regulation.pdf", curr_pdf, "application/pdf")},
    )
    assert up_curr_res.status_code == 200
    curr_doc_id = up_curr_res.json()["document_id"]
    assert curr_doc_id.startswith("doc_custom_")

    # 3. Create/Run Dynamic Analysis Job
    analysis_create_res = client.post(
        "/api/analysis",
        json={
            "previous_document_id": prev_doc_id,
            "current_document_id": curr_doc_id,
        },
    )
    assert analysis_create_res.status_code == 200
    create_data = analysis_create_res.json()
    analysis_id = create_data["analysis_id"]

    assert analysis_id.startswith("analysis_")
    assert analysis_id != "psl-2020-2025"
    assert create_data["status"] in ("processing", "complete")
    assert create_data["mode"] == "dynamic"

    # 4. Check Status Endpoint
    status_res = client.get(f"/api/analysis/{analysis_id}/status")
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["analysis_id"] == analysis_id
    assert status_data["status"] in ("processing", "complete")
    assert len(status_data["stages"]) == 12

    # 5. Check Results Payload Endpoint
    results_res = client.get(f"/api/analysis/{analysis_id}/results")
    assert results_res.status_code == 200
    results_data = results_res.json()
    assert results_data["analysis_id"] == analysis_id
    assert results_data["mode"] == "dynamic"
    assert results_data["summary_metrics"]["total_records"] >= 2
    assert results_data["summary_metrics"]["high_materiality"] >= 1

    # 6. Check Changes List Endpoint
    changes_res = client.get(f"/api/analysis/{analysis_id}/changes")
    assert changes_res.status_code == 200
    changes_data = changes_res.json()
    assert changes_data["total"] >= 2
    assert len(changes_data["changes"]) >= 2

    # Verify change fields
    first_change = changes_data["changes"][0]
    assert first_change["change_id"]
    assert first_change["alignment_score"] is not None
    assert first_change["final_materiality"] in ["HIGH", "MEDIUM", "LOW"]
    assert len(first_change["materiality_reasons"]) > 0

    # 7. Check Single Change Detail Endpoint
    single_change_res = client.get(
        f"/api/analysis/{analysis_id}/changes/{first_change['change_id']}"
    )
    assert single_change_res.status_code == 200
    single_data = single_change_res.json()
    assert single_data["change_id"] == first_change["change_id"]

    # 8. Check Clause Detail Endpoint
    if first_change.get("new_clause_id"):
        clause_res = client.get(
            f"/api/analysis/{analysis_id}/clauses/current/{first_change['new_clause_id']}"
        )
        assert clause_res.status_code == 200
        clause_data = clause_res.json()
        assert clause_data["clause_id"] == first_change["new_clause_id"]
        assert clause_data["clause_text"]


# =============================================================================
# 3. PSL 2020 vs 2025 Precomputed Regression Verification
# =============================================================================


def test_psl_precomputed_regression(client):
    """Verify that comparing PSL 2020 and 2025 strictly returns verified precomputed artifacts."""
    # 1. Create analysis with PSL precomputed pair
    create_res = client.post(
        "/api/analysis",
        json={
            "previous_document_id": "rbi_psl_2020_official",
            "current_document_id": "rbi_a8d0f9a98495",
        },
    )
    assert create_res.status_code == 200
    create_data = create_res.json()
    assert create_data["analysis_id"] == "psl-2020-2025"
    assert create_data["mode"] == "precomputed"

    # 2. Check overview endpoint
    overview_res = client.get("/api/analysis/psl-2020-2025")
    assert overview_res.status_code == 200
    overview = overview_res.json()

    # Exact verified totals
    assert overview["total_records"] == 63
    assert overview["substantive_changes"] == 31
    assert overview["administrative_changes"] == 4
    assert overview["wording_only"] == 7
    assert overview["added_candidates"] == 7
    assert overview["removed_candidates"] == 12
    assert overview["unchanged"] == 2
    assert overview["high_materiality"] == 50
    assert overview["low_materiality"] == 13

    # 3. Check changes list endpoint
    changes_res = client.get("/api/analysis/psl-2020-2025/changes?limit=100")
    assert changes_res.status_code == 200
    changes_data = changes_res.json()
    assert changes_data["total"] == 63
    assert len(changes_data["changes"]) == 63
