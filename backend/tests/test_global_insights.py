"""Tests for Global Insights API and Aggregation Services."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.analysis_history_service import AnalysisHistoryService

client = TestClient(app)


def test_global_insights_endpoint_status():
    """Verify that GET /api/insights returns 200 with structured payload."""
    response = client.get("/api/insights")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert "changes_trend" in data
    assert "change_distribution" in data
    assert "ai_brief" in data
    assert "top_risk_areas" in data
    assert "frequently_affected_policy_areas" in data
    assert "recent_high_impact_changes" in data
    assert "regulatory_themes" in data
    assert "regulator_coverage" in data


def test_global_insights_with_psl_seeded():
    """Verify that seeded analyses populate real aggregate numbers."""
    history_service = AnalysisHistoryService()
    history_service.seed_canonical_psl_analysis()

    response = client.get("/api/insights?time_range=all")
    assert response.status_code == 200
    data = response.json()
    assert data["has_data"] is True
    assert data["kpis"]["total_analyses"] >= 1
    assert data["kpis"]["regulatory_changes"] >= 60
    assert len(data["change_distribution"]["items"]) == 5
    assert len(data["regulator_coverage"]["items"]) >= 1
    assert data["regulator_coverage"]["primary_regulator"] == "RBI"


def test_global_insights_granular_endpoints():
    """Verify individual sub-endpoints return correct types."""
    res_kpis = client.get("/api/insights/overview")
    assert res_kpis.status_code == 200
    assert "total_analyses" in res_kpis.json()

    res_trends = client.get("/api/insights/trends")
    assert res_trends.status_code == 200
    assert isinstance(res_trends.json(), list)

    res_dist = client.get("/api/insights/change-distribution")
    assert res_dist.status_code == 200
    assert "items" in res_dist.json()

    res_risks = client.get("/api/insights/risk-areas")
    assert res_risks.status_code == 200
    assert isinstance(res_risks.json(), list)

    res_policies = client.get("/api/insights/policy-areas")
    assert res_policies.status_code == 200
    assert isinstance(res_policies.json(), list)

    res_changes = client.get("/api/insights/recent-changes")
    assert res_changes.status_code == 200
    assert isinstance(res_changes.json(), list)

    res_themes = client.get("/api/insights/regulatory-themes")
    assert res_themes.status_code == 200
    assert isinstance(res_themes.json(), list)

    res_coverage = client.get("/api/insights/regulator-coverage")
    assert res_coverage.status_code == 200
    assert "primary_regulator" in res_coverage.json()


def test_global_insights_ai_brief_post():
    """Verify POST /api/insights/ai-brief regenerates advisory brief."""
    response = client.post("/api/insights/ai-brief")
    assert response.status_code == 200
    brief = response.json()
    assert "summary_text" in brief
    assert brief["is_advisory"] is True
    assert "disclaimer" in brief
