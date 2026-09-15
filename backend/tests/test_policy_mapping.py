"""Tests for Company Policy Mapping, Compliance Impact, and Evidence Extraction."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.dynamic_nlp import DynamicClauseNLP, ClassificationResult, ExtractedRequirement
from app.services.compliance.policy_nlp_service import PolicyNLPService
from app.services.compliance.policy_mapping_service import PolicyMappingService


@pytest.fixture
def client():
    """Create FastAPI test client."""
    with TestClient(app) as test_client:
        yield test_client


def test_policy_nlp_service_extraction():
    """Test policy NLP service extracts structured sections, modalities, and parameters."""
    service = PolicyNLPService()
    text = "Policy 3.2: Customer Due Diligence\nHigh-risk customers must undergo review every 24 months."
    sec_id, sec_title = service.extract_section_info(text, 0)
    assert sec_id == "Policy 3.2"
    assert "Customer Due Diligence" in (sec_title or "")

    dur = service.extract_duration(text)
    assert dur == "24 months"

    text_money = "Threshold: Enhanced due diligence applies for transactions exceeding Rs. 10,00,000."
    money = service.extract_monetary_value(text_money)
    assert "10,00,000" in money

    text_deadline = "All suspicious exceptions must be reported to the Compliance Officer within 15 days."
    deadline = service.extract_deadline(text_deadline)
    assert "within 15 days" in deadline


def test_deterministic_constraint_mismatches():
    """Test specific compliance gap rules: duration, deadline, monetary threshold, and modality."""
    mapping_service = PolicyMappingService()

    # 1. Review Frequency Duration Mismatch (12 months required vs 24 months in policy)
    reg_req = mapping_service.select_regulatory_requirements(
        current_document_id="reg_test",
        current_clauses=[
            DynamicClauseNLP(
                clause_id="c_1",
                provision_id="3.2",
                clause_text="High-risk customers shall be reviewed every 12 months.",
                classification=ClassificationResult(label="OBLIGATION", confidence=0.95),
                requirement=ExtractedRequirement(subject="Banks", modality="shall", action="reviewed", duration="12 months"),
            )
        ],
    )[0]

    pol_req = mapping_service.policy_nlp_service.process_policy_clauses(
        document_id="pol_test",
        clauses=[
            DynamicClauseNLP(
                clause_id="p_1",
                clause_text="Policy 3.2: High-risk customers must undergo review every 24 months.",
                classification=ClassificationResult(label="OBLIGATION", confidence=0.95),
                requirement=ExtractedRequirement(subject="Institution", modality="must", action="review", duration="24 months"),
            )
        ],
    )[0]

    status, severity, gap_type, gap_desc, mismatches = mapping_service.evaluate_compliance(
        reg_req=reg_req,
        pol_req=pol_req,
        similarity=0.85,
    )
    assert status == "NON_COMPLIANT"
    assert severity == "HIGH"
    assert "DURATION" in (gap_type or "")
    assert len(mismatches) == 1
    assert mismatches[0].dimension == "DURATION"

    # 2. Deadline Mismatch (7 days required vs 15 days in policy)
    reg_deadline = mapping_service.select_regulatory_requirements(
        current_document_id="reg_test",
        current_clauses=[
            DynamicClauseNLP(
                clause_id="c_2",
                provision_id="6.1",
                clause_text="Reporting of material compliance exceptions shall be completed within 7 days.",
                classification=ClassificationResult(label="OBLIGATION", confidence=0.95),
                requirement=ExtractedRequirement(subject="Banks", modality="shall", action="reporting", deadline="within 7 days"),
            )
        ],
    )[0]

    pol_deadline = mapping_service.policy_nlp_service.process_policy_clauses(
        document_id="pol_test",
        clauses=[
            DynamicClauseNLP(
                clause_id="p_2",
                clause_text="Policy 6.1: Exceptions shall be escalated within 15 days.",
                classification=ClassificationResult(label="OBLIGATION", confidence=0.95),
                requirement=ExtractedRequirement(subject="Staff", modality="shall", action="escalated", deadline="within 15 days"),
            )
        ],
    )[0]

    status_d, sev_d, gap_type_d, _, mismatches_d = mapping_service.evaluate_compliance(
        reg_req=reg_deadline,
        pol_req=pol_deadline,
        similarity=0.80,
    )
    assert status_d == "NON_COMPLIANT"
    assert "DEADLINE" in (gap_type_d or "")

    # 3. Monetary Threshold Mismatch (Rs. 5,00,000 required vs Rs. 10,00,000 policy)
    reg_money = mapping_service.select_regulatory_requirements(
        current_document_id="reg_test",
        current_clauses=[
            DynamicClauseNLP(
                clause_id="c_3",
                provision_id="7.1",
                clause_text="Enhanced due diligence shall apply to transactions exceeding Rs. 5,00,000.",
                classification=ClassificationResult(label="OBLIGATION", confidence=0.95),
                requirement=ExtractedRequirement(subject="Banks", modality="shall", action="apply"),
            )
        ],
    )[0]

    pol_money = mapping_service.policy_nlp_service.process_policy_clauses(
        document_id="pol_test",
        clauses=[
            DynamicClauseNLP(
                clause_id="p_3",
                clause_text="Policy 7.1: Enhanced due diligence is conducted for transactions above Rs. 10,00,000.",
                classification=ClassificationResult(label="OBLIGATION", confidence=0.95),
                requirement=ExtractedRequirement(subject="Institution", modality="is conducted", action="conducted"),
            )
        ],
    )[0]

    status_m, _, gap_type_m, _, mismatches_m = mapping_service.evaluate_compliance(
        reg_req=reg_money,
        pol_req=pol_money,
        similarity=0.82,
    )
    assert status_m == "NON_COMPLIANT"
    assert "MONETARY" in (gap_type_m or "")

    # 4. Modality Mismatch (shall mandatory vs may discretionary)
    reg_modal = mapping_service.select_regulatory_requirements(
        current_document_id="reg_test",
        current_clauses=[
            DynamicClauseNLP(
                clause_id="c_4",
                provision_id="2.2",
                clause_text="Entities shall verify beneficial ownership for all high-risk accounts.",
                classification=ClassificationResult(label="OBLIGATION", confidence=0.95),
                requirement=ExtractedRequirement(subject="Entities", modality="shall", action="verify"),
            )
        ],
    )[0]

    pol_modal = mapping_service.policy_nlp_service.process_policy_clauses(
        document_id="pol_test",
        clauses=[
            DynamicClauseNLP(
                clause_id="p_4",
                clause_text="Policy 2.2: The business unit may verify beneficial ownership at its discretion.",
                classification=ClassificationResult(label="PERMISSION", confidence=0.95),
                requirement=ExtractedRequirement(subject="Business unit", modality="may", action="verify"),
            )
        ],
    )[0]

    status_mod, _, gap_type_mod, _, _ = mapping_service.evaluate_compliance(
        reg_req=reg_modal,
        pol_req=pol_modal,
        similarity=0.78,
    )
    assert status_mod == "NON_COMPLIANT"
    assert "MODALITY" in (gap_type_mod or "")


def test_requirement_selection_excludes_informational_clauses():
    """Verify that purely informational, heading, or definition clauses without enforceable actions are excluded."""
    mapping_service = PolicyMappingService()

    clauses = [
        # Pure definition / heading
        DynamicClauseNLP(
            clause_id="c_info_1",
            provision_id="1.1",
            clause_text="Master Direction - Know Your Customer (KYC) Direction, 2016.",
            classification=ClassificationResult(label="DEFINITION", confidence=0.90),
            requirement=None,
        ),
        # Pure reference
        DynamicClauseNLP(
            clause_id="c_info_2",
            provision_id="1.2",
            clause_text="In exercise of powers conferred by Section 35A of the Banking Regulation Act, 1949.",
            classification=ClassificationResult(label="PERMISSION", confidence=0.50),
            requirement=None,
        ),
        # Real obligation requirement
        DynamicClauseNLP(
            clause_id="c_req_1",
            provision_id="4.1",
            clause_text="Regulated Entities shall carry out customer due diligence prior to opening any account.",
            classification=ClassificationResult(label="OBLIGATION", confidence=0.98),
            requirement=ExtractedRequirement(subject="Regulated Entities", modality="shall", action="carry out CDD"),
        ),
    ]

    selected = mapping_service.select_regulatory_requirements(
        current_document_id="reg_sample",
        current_clauses=clauses,
    )

    assert len(selected) == 1
    assert selected[0].clause_id == "c_req_1"
    assert "Regulated Entities shall carry out" in selected[0].clause_text


def test_compliant_and_partial_and_no_match_determinations():
    """Verify compliant match, partial match, and no match classifications."""
    mapping_service = PolicyMappingService()

    # 1. Compliant match: Requirements and constraints align
    reg_comp = mapping_service.select_regulatory_requirements(
        current_document_id="reg_test",
        current_clauses=[
            DynamicClauseNLP(
                clause_id="c_comp",
                provision_id="5.1",
                clause_text="Transaction records shall be preserved for a minimum period of 5 years.",
                classification=ClassificationResult(label="OBLIGATION", confidence=0.95),
                requirement=ExtractedRequirement(subject="Entities", modality="shall", action="preserved", duration="5 years"),
            )
        ],
    )[0]

    pol_comp = mapping_service.policy_nlp_service.process_policy_clauses(
        document_id="pol_test",
        clauses=[
            DynamicClauseNLP(
                clause_id="p_comp",
                clause_text="Policy 5.1: The institution shall maintain all transaction records for at least 5 years.",
                classification=ClassificationResult(label="OBLIGATION", confidence=0.95),
                requirement=ExtractedRequirement(subject="Institution", modality="shall", action="maintain", duration="5 years"),
            )
        ],
    )[0]

    status_c, sev_c, _, _, _ = mapping_service.evaluate_compliance(reg_comp, pol_comp, similarity=0.88)
    assert status_c == "COMPLIANT"
    assert sev_c in ("NONE", "LOW")

    # 2. Partial match: Semantic topic aligns, but policy is less specific
    reg_part = mapping_service.select_regulatory_requirements(
        current_document_id="reg_test",
        current_clauses=[
            DynamicClauseNLP(
                clause_id="c_part",
                provision_id="8.1",
                clause_text="Regulated Entities shall implement automated real-time transaction monitoring systems.",
                classification=ClassificationResult(label="OBLIGATION", confidence=0.95),
                requirement=ExtractedRequirement(subject="Entities", modality="shall", action="implement automated real-time monitoring"),
            )
        ],
    )[0]

    pol_part = mapping_service.policy_nlp_service.process_policy_clauses(
        document_id="pol_test",
        clauses=[
            DynamicClauseNLP(
                clause_id="p_part",
                clause_text="Policy 8.1: Periodic transaction reviews will be performed by risk operations teams.",
                classification=ClassificationResult(label="OBLIGATION", confidence=0.95),
                requirement=ExtractedRequirement(subject="Teams", modality="will", action="performed"),
            )
        ],
    )[0]

    status_p, sev_p, gap_type_p, _, _ = mapping_service.evaluate_compliance(reg_part, pol_part, similarity=0.62)
    assert status_p == "PARTIAL_MATCH"
    assert sev_p in ("MEDIUM", "HIGH")
    assert gap_type_p in ("PARTIAL_ALIGNMENT", "POLICY_LESS_SPECIFIC", "PARTIAL_MATCH")


def test_no_policy_analysis_returns_empty_mapping(client):
    """Test policy mapping endpoint returns clean has_policy=False when no company policy was uploaded."""
    payload = {
        "previous_document_id": "rbi_000f2b89455b",
        "current_document_id": "rbi_026468aa5a50",
        "company_policy_document_id": None,
    }
    create_res = client.post("/api/analysis", json=payload)
    assert create_res.status_code == 200
    analysis_id = create_res.json()["analysis_id"]

    res = client.get(f"/api/analysis/{analysis_id}/policy-mapping")
    assert res.status_code == 200
    data = res.json()
    assert data["has_policy"] is False
    assert data["summary"]["total_regulatory_requirements"] == 0
    assert len(data["mappings"]) == 0

