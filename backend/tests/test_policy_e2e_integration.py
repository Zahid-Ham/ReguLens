"""End-to-end integration test for dynamic regulatory comparison and company policy mapping."""

import io
import time
import pytest
from fastapi.testclient import TestClient
import fitz  # PyMuPDF
from app.main import app


def _create_pdf_bytes(title: str, paragraphs: list[str]) -> bytes:
    """Generate a clean test PDF in memory using PyMuPDF."""
    doc = fitz.open()
    page = doc.new_page()
    full_text = f"{title}\n\n" + "\n\n".join(paragraphs)
    page.insert_text((50, 72), full_text, fontsize=10)
    buf = io.BytesIO()
    doc.save(buf)
    doc.close()
    return buf.getvalue()


def test_e2e_dynamic_company_policy_mapping():
    """Test full upload -> dynamic NLP -> comparison -> policy mapping -> evidence retrieval lifecycle."""
    with TestClient(app) as client:
        # 1. Create Previous Regulation PDF
        prev_pdf = _create_pdf_bytes(
            "Master Direction - Know Your Customer (KYC) Direction, 2024",
            [
                "Section 1.1: Scope and Applicability\nThese Directions shall apply to all Regulated Entities.",
                "Section 3.2: Periodic Review of Customer Profiles\nRegulated Entities shall carry out periodic review of high-risk customers every 24 months.",
                "Section 5.1: Maintenance of Records\nAll customer account and transaction records shall be preserved for a minimum period of 5 years.",
                "Section 6.1: Reporting of Exceptions\nExceptions shall be reported to the Compliance Officer within 14 days.",
                "Section 7.1: Enhanced Due Diligence\nEnhanced due diligence shall apply to transactions exceeding Rs. 10,00,000.",
            ],
        )

        # 2. Create Current Regulation PDF (with tightened rules)
        curr_pdf = _create_pdf_bytes(
            "Master Direction - Know Your Customer (KYC) Direction, 2025",
            [
                "Section 1.1: Scope and Applicability\nThese Directions shall apply to all Regulated Entities.",
                "Section 3.2: Periodic Review of Customer Profiles\nRegulated Entities shall carry out periodic review of high-risk customers every 12 months.",
                "Section 5.1: Maintenance of Records\nAll customer account and transaction records shall be preserved for a minimum period of 5 years.",
                "Section 6.1: Reporting of Exceptions\nMaterial compliance exceptions shall be reported to the Compliance Officer within 7 days.",
                "Section 7.1: Enhanced Due Diligence\nEnhanced due diligence shall apply to transactions exceeding Rs. 5,00,000.",
                "Section 8.1: Transaction Monitoring\nRegulated Entities shall implement automated real-time transaction monitoring systems for suspicious activity.",
            ],
        )

        # 3. Create Aarohan Company Policy PDF (which is still aligned with 2024 rules)
        policy_pdf = _create_pdf_bytes(
            "Aarohan Internal Compliance and KYC Policy 2024",
            [
                "Policy 1.1: Purpose\nThis document sets out Aarohan's internal customer due diligence procedures.",
                "Policy 3.2: Customer Due Diligence Review Frequency\nHigh-risk customer profiles must undergo periodic review every 24 months by branch compliance staff.",
                "Policy 5.1: Record Retention\nThe company shall preserve all transaction and identification records for at least 5 years.",
                "Policy 6.1: Exception Escalation Timeline\nIdentified compliance exceptions shall be escalated to the Principal Officer within 15 days.",
                "Policy 7.1: Monetary Threshold for Enhanced Verification\nEnhanced due diligence is conducted for individual transactions exceeding Rs. 10,00,000.",
                "Policy 8.1: Transaction Monitoring Procedures\nPeriodic transaction reviews will be performed by risk operations teams on a monthly basis.",
            ],
        )

        # 4. Upload all 3 documents
        up_prev = client.post(
            "/api/documents/upload",
            files={"file": ("Prev_KYC_2024.pdf", prev_pdf, "application/pdf")},
        )
        assert up_prev.status_code == 200
        prev_doc_id = up_prev.json()["document_id"]

        up_curr = client.post(
            "/api/documents/upload",
            files={"file": ("Curr_KYC_2025.pdf", curr_pdf, "application/pdf")},
        )
        assert up_curr.status_code == 200
        curr_doc_id = up_curr.json()["document_id"]

        up_pol = client.post(
            "/api/documents/upload",
            files={"file": ("Aarohan_Policy.pdf", policy_pdf, "application/pdf")},
        )
        assert up_pol.status_code == 200
        pol_doc_id = up_pol.json()["document_id"]

        # 5. Launch Analysis Job with Company Policy
        job_res = client.post(
            "/api/analysis",
            json={
                "previous_document_id": prev_doc_id,
                "current_document_id": curr_doc_id,
                "company_policy_document_id": pol_doc_id,
            },
        )
        assert job_res.status_code == 200
        analysis_id = job_res.json()["analysis_id"]

        # 6. Poll for completion
        max_retries = 30
        completed = False
        for _ in range(max_retries):
            status_res = client.get(f"/api/analysis/{analysis_id}/status")
            if status_res.status_code == 200 and status_res.json().get("status") in ("complete", "completed"):
                completed = True
                break
            time.sleep(1)

        assert completed, "Analysis job did not reach complete state within timeout"

        # 7. Query Policy Mapping Endpoint
        map_res = client.get(f"/api/analysis/{analysis_id}/policy-mapping")
        assert map_res.status_code == 200
        data = map_res.json()

        assert data["has_policy"] is True
        summary = data["summary"]
        assert summary["total_regulatory_requirements"] >= 2
        assert summary["mapped_to_policy"] >= 1
        assert summary["policy_gaps"] >= 1
        assert len(data["mappings"]) >= 2

        # Verify specific deterministic findings
        mappings = data["mappings"]
        dur_gap = next((m for m in mappings if "12 months" in m["regulatory_evidence"]["clause_text"]), None)
        assert dur_gap is not None
        assert dur_gap["compliance_status"] == "NON_COMPLIANT"
        assert dur_gap["severity"] == "HIGH"
        assert "DURATION" in dur_gap["gap_type"]

        # 8. Single evidence record retrieval
        rec_id = dur_gap["mapping_id"]
        rec_res = client.get(f"/api/analysis/{analysis_id}/policy-mapping/{rec_id}")
        assert rec_res.status_code == 200
        rec_data = rec_res.json()
        assert rec_data["mapping_id"] == rec_id
        assert rec_data["regulatory_evidence"]["clause_text"] == dur_gap["regulatory_evidence"]["clause_text"]
        assert rec_data["policy_evidence"]["clause_text"] == dur_gap["policy_evidence"]["clause_text"]

        # 9. Summary endpoint retrieval
        sum_res = client.get(f"/api/analysis/{analysis_id}/policy-mapping/summary")
        assert sum_res.status_code == 200
        assert sum_res.json()["total_regulatory_requirements"] == summary["total_regulatory_requirements"]
