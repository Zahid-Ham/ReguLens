"""Backend Unit and Integration Tests for Groq AI Advisory Insights."""

from datetime import datetime, timezone
import json
import unittest.mock
from unittest.mock import AsyncMock, patch
import pytest
from fastapi.testclient import TestClient

from app.core.database import SessionLocal
from app.main import app
from app.models.analysis import AnalysisRecord
from app.schemas.ai_insights import AnalysisInsightsResponse
from app.services.compliance.groq_insights_service import (
    EvidencePackageBuilder,
    GroqInsightsService,
)


@pytest.fixture
def client():
    """Create FastAPI test client with lifespan context."""
    with TestClient(app) as test_client:
        yield test_client


def test_evidence_package_builder_deterministic_selection():
    """Verify evidence builder ranks and selects top gaps and changes deterministically."""
    mock_mappings = [
        {
            "mapping_id": "map-1",
            "compliance_status": "COMPLIANT",
            "gap_severity": "LOW",
            "regulatory_requirement": {"provision_id": "1.1", "clause_id": "c1", "title": "Obj"},
            "matched_policy_requirement": {"section_id": "Sec 1", "clause_id": "p1"},
        },
        {
            "mapping_id": "map-2",
            "compliance_status": "NON_COMPLIANT",
            "gap_severity": "HIGH",
            "gap_details": "Review frequency is 24 months vs 12 months required",
            "parameter_mismatches": [{"field": "duration", "expected": "12 months", "found": "24 months"}],
            "regulatory_requirement": {"provision_id": "6.1", "clause_id": "c2", "title": "Annual Review"},
            "matched_policy_requirement": {"section_id": "Sec 4.2", "clause_id": "p2"},
        },
        {
            "mapping_id": "map-3",
            "compliance_status": "PARTIAL_MATCH",
            "gap_severity": "MEDIUM",
            "gap_details": "Quarterly timeline missing mandatory verification",
            "parameter_mismatches": [],
            "regulatory_requirement": {"provision_id": "3.2", "clause_id": "c3", "title": "Reporting"},
            "matched_policy_requirement": {"section_id": "Sec 2.1", "clause_id": "p3"},
        },
    ]

    mock_changes = [
        {
            "change_id": "chg-1",
            "provision_id": "6.1",
            "title": "Annual Review Mandate",
            "change_type": "Substantive",
            "materiality": "High",
            "dimension": "duration",
            "old_value": "24 months",
            "new_value": "12 months",
        },
        {
            "change_id": "chg-2",
            "provision_id": "1.1",
            "title": "Wording clarity",
            "change_type": "Wording",
            "materiality": "Low",
        },
    ]

    pkg = EvidencePackageBuilder.build_evidence_package(
        analysis_id="test-analysis",
        title="Test Analysis",
        overview_summary={"total_records": 2, "substantive_changes": 1},
        policy_summary={"policy_coverage_pct": 66.7, "non_compliant_count": 1, "partial_match_count": 1, "compliant_count": 1},
        changes=mock_changes,
        mappings=mock_mappings,
        has_policy=True,
    )

    assert pkg["has_policy"] is True
    assert len(pkg["top_gaps"]) == 2  # Non-compliant and Partial match (compliant excluded)
    assert pkg["top_gaps"][0]["compliance_status"] == "NON_COMPLIANT"
    assert pkg["top_gaps"][0]["provision_id"] == "6.1"
    assert len(pkg["key_changes"]) == 2
    assert pkg["key_changes"][0]["materiality"] == "High"


def test_groq_unavailable_deterministic_fallback():
    """Verify graceful fallback generation when GROQ_API_KEY is unset or unavailable."""
    service = GroqInsightsService()
    service.api_key = ""  # Unset key

    evidence = {
        "analysis_id": "test-fallback",
        "analysis_title": "Fallback Test",
        "has_policy": True,
        "overview_metrics": {"total_changes": 10, "substantive_changes": 4},
        "policy_metrics": {"coverage_pct": 75.0, "non_compliant_count": 2, "partial_match_count": 1, "compliant_count": 7},
        "top_gaps": [
            {
                "priority_rank": 1,
                "provision_id": "4.1",
                "clause_id": "cl-41",
                "title": "Quarterly Reporting",
                "gap_type": "DEADLINE_MISMATCH",
                "compliance_status": "NON_COMPLIANT",
                "gap_severity": "HIGH",
                "gap_details": "Reporting deadline shortened from 30 days to 15 days",
                "matched_policy_section": "Sec 3.1",
                "matched_policy_clause_id": "pol-cl-1",
                "regulatory_snippet": "Entities must report within 15 days.",
                "policy_snippet": "Reports submitted within 30 days.",
                "evidence_id": "map-41",
            }
        ],
        "key_changes": [
            {
                "change_id": "chg-41",
                "provision_id": "4.1",
                "title": "Deadline revision",
                "change_type": "Substantive",
                "materiality": "High",
                "dimension": "deadline",
                "old_value": "30 days",
                "new_value": "15 days",
                "summary": "Deadline shortened",
            }
        ],
    }

    res = service._build_deterministic_fallback(evidence)
    assert isinstance(res, AnalysisInsightsResponse)
    assert res.is_advisory is True
    assert "source of truth" in res.disclaimer
    assert len(res.top_gaps) == 1
    assert res.top_gaps[0].compliance_status == "NON_COMPLIANT"
    assert res.top_gaps[0].provision_id == "4.1"
    assert len(res.policy_recommendations) == 1
    assert res.policy_recommendations[0].affected_policy_clause == "Sec 3.1"
    assert len(res.key_regulatory_changes) == 1


def test_no_policy_analysis_insights():
    """Verify insights behavior when analysis has no mapped company policy."""
    service = GroqInsightsService()
    service.api_key = ""

    evidence = {
        "analysis_id": "test-no-policy",
        "analysis_title": "Regulatory Only Analysis",
        "has_policy": False,
        "overview_metrics": {"total_changes": 15, "substantive_changes": 6, "added_candidates": 2, "removed_candidates": 1},
        "top_gaps": [],
        "key_changes": [
            {
                "change_id": "chg-1",
                "provision_id": "2.1",
                "title": "Scope Expansion",
                "change_type": "Substantive",
                "materiality": "High",
                "dimension": "obligation",
            }
        ],
    }

    res = service._build_deterministic_fallback(evidence)
    assert res.has_policy is False
    assert len(res.top_gaps) == 0
    assert len(res.policy_recommendations) == 0
    assert len(res.key_regulatory_changes) == 1
    assert "company policy" in res.executive_summary.summary_text.lower()


@pytest.mark.anyio
async def test_groq_mocked_structured_generation_preserves_compliance_status():
    """Verify that Groq structured output cannot override deterministic status or invent clause citations."""
    service = GroqInsightsService()
    service.api_key = "mock_groq_api_key"

    mock_llm_json = {
        "executive_summary": {
            "summary_text": "Executive advisory briefing on regulatory changes and policy alignment.",
            "key_focus_areas": ["Verification Audits", "Timeline Shortening"],
        },
        "gap_explanations": [
            {
                "priority_rank": 1,
                "explanation": "Internal policy review schedule of 24 months conflicts with revised 12-month requirement.",
                "remediation_hint": "Revise policy section 4.2 to specify annual (12-month) reviews.",
            }
        ],
        "policy_recommendations": [
            {
                "priority": "High",
                "category": "update_review_frequency",
                "affected_policy_clause": "Sec 4.2",
                "target_provision_id": "6.1",
                "recommendation": "Update annual review cycle to 12 months.",
                "reason": "Required by revised PSL Provision 6.1.",
            }
        ],
        "change_explanations": [
            {
                "change_id": "chg-61",
                "explanation": "Shortened maximum review cycle from 24 to 12 months.",
                "impact_summary": "Requires biannual internal audit cycle adjustments.",
            }
        ],
    }

    mock_mappings = [
        {
            "mapping_id": "map-psl-61",
            "compliance_status": "NON_COMPLIANT",
            "gap_severity": "HIGH",
            "gap_type": "DURATION_MISMATCH",
            "gap_details": "24 months vs 12 months",
            "regulatory_requirement": {
                "provision_id": "6.1",
                "clause_id": "psl_2025_c61",
                "title": "Review Frequency",
            },
            "matched_policy_requirement": {
                "section_id": "Sec 4.2",
                "clause_id": "pol_c42",
            },
            "regulatory_evidence": {"clause_text": "Mandatory 12-month review."},
            "policy_evidence": {"clause_text": "Reviews conducted every 24 months."},
        }
    ]

    mock_changes = [
        {
            "change_id": "chg-61",
            "provision_id": "6.1",
            "title": "Review Frequency Shift",
            "change_type": "Substantive",
            "materiality": "High",
            "dimension": "duration",
            "old_value": "24 months",
            "new_value": "12 months",
            "summary": "Review cycle shortened",
        }
    ]

    mock_resp = unittest.mock.MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "choices": [
            {
                "message": {
                    "content": json.dumps(mock_llm_json),
                }
            }
        ]
    }

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_resp
        res = await service.generate_advisory_insights(
            analysis_id="test-mock-groq",
            title="Mock Groq Test",
            overview_summary={"total_records": 63, "substantive_changes": 31},
            policy_summary={"policy_coverage_pct": 87.0, "non_compliant_count": 4, "partial_match_count": 8, "compliant_count": 49},
            changes=mock_changes,
            mappings=mock_mappings,
            has_policy=True,
        )

        assert res.status == "available"
        assert res.has_policy is True
        assert res.executive_summary.summary_text == mock_llm_json["executive_summary"]["summary_text"]
        assert len(res.top_gaps) == 1
        # Crucial check: deterministic compliance status is preserved as NON_COMPLIANT
        assert res.top_gaps[0].compliance_status == "NON_COMPLIANT"
        assert res.top_gaps[0].provision_id == "6.1"
        assert res.top_gaps[0].explanation == mock_llm_json["gap_explanations"][0]["explanation"]
        assert len(res.policy_recommendations) == 1
        assert res.policy_recommendations[0].affected_policy_clause == "Sec 4.2"


def test_api_get_canonical_psl_insights(client):
    """Verify GET /api/analysis/psl-2020-2025/insights returns valid persisted or generated insights."""
    response = client.get("/api/analysis/psl-2020-2025/insights")
    assert response.status_code == 200
    data = response.json()
    assert data["analysis_id"] == "psl-2020-2025"
    assert data["is_advisory"] is True
    assert "source of truth" in data["disclaimer"].lower()
    assert data["executive_summary"] is not None
    assert len(data["key_regulatory_changes"]) > 0


def test_api_policy_enabled_analysis_insights(client):
    """Verify insights on an analysis with a mapped company policy returns gaps and recommendations."""
    db = SessionLocal()
    try:
        # Create a policy-enabled test analysis record
        test_rec = AnalysisRecord(
            id="test-policy-analysis-1",
            title="Test Policy Enabled Analysis",
            status="complete",
            mode="dynamic",
            previous_document_id="doc_prev",
            current_document_id="doc_curr",
            previous_document_title="Prev Document",
            current_document_title="Curr Document",
            company_policy_document_id="policy_doc_1",
            company_policy_document_title="Internal Lending Policy",
            created_at=datetime.now(timezone.utc),
            overview_summary={"total_records": 10, "substantive_changes": 4},
            policy_summary={"policy_coverage_pct": 75.0, "non_compliant_count": 2, "partial_match_count": 1, "compliant_count": 5},
            changes_data=[
                {
                    "change_id": "chg-test-1",
                    "provision_id": "3.1",
                    "title": "Review Timeline",
                    "change_type": "Substantive",
                    "materiality": "High",
                    "dimension": "duration",
                    "old_value": "24m",
                    "new_value": "12m",
                }
            ],
            policy_mappings_data=[
                {
                    "mapping_id": "map-test-1",
                    "compliance_status": "NON_COMPLIANT",
                    "gap_severity": "HIGH",
                    "gap_type": "DURATION_MISMATCH",
                    "gap_details": "Review is 24m vs 12m required",
                    "regulatory_requirement": {"provision_id": "3.1", "clause_id": "c1", "title": "Review Timeline"},
                    "matched_policy_requirement": {"section_id": "Section 4.1", "clause_id": "p1"},
                    "regulatory_evidence": {"clause_text": "Must be reviewed every 12 months."},
                    "policy_evidence": {"clause_text": "Policy requires 24 month reviews."},
                }
            ],
        )
        db.merge(test_rec)
        db.commit()
    finally:
        db.close()

    response = client.get("/api/analysis/test-policy-analysis-1/insights")
    assert response.status_code == 200
    data = response.json()
    assert data["has_policy"] is True
    assert len(data["top_gaps"]) == 1
    assert data["top_gaps"][0]["provision_id"] == "3.1"
    assert data["top_gaps"][0]["compliance_status"] == "NON_COMPLIANT"
    assert len(data["policy_recommendations"]) == 1
    assert data["policy_recommendations"][0]["affected_policy_clause"] == "Section 4.1"

    # Test single insight detail endpoint
    detail_res = client.get("/api/analysis/test-policy-analysis-1/insights/1")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["type"] == "top_gap"
    assert detail_data["item"]["priority_rank"] == 1


def test_api_refresh_insights_endpoint(client):
    """Verify POST /api/analysis/psl-2020-2025/insights/refresh forces refresh and persists."""
    response = client.post("/api/analysis/psl-2020-2025/insights/refresh")
    assert response.status_code == 200
    data = response.json()
    assert data["analysis_id"] == "psl-2020-2025"
    assert data["status"] in ("available", "unavailable")


def test_api_get_insights_unknown_analysis_returns_404(client):
    """Verify 404 is returned for non-existent analysis."""
    response = client.get("/api/analysis/non-existent-analysis-id-xyz/insights")
    assert response.status_code == 404
