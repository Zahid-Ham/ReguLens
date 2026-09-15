"""Tests for DataRepository Service."""

import pytest
from app.services.data_repository import DataRepository
from app.core.exceptions import DataFileNotFoundError


def test_data_repository_integrity():
    """Verify that all core precomputed artifacts exist on disk."""
    repo = DataRepository()
    integrity = repo.verify_data_integrity()

    assert integrity["psl_change_intelligence_csv"] is True
    assert integrity["psl_change_summary_json"] is True
    assert integrity["structured_requirements_csv"] is True
    assert integrity["regulatory_clauses_csv"] is True
    assert integrity["psl_2020_clauses_csv"] is True
    assert integrity["psl_2025_clauses_csv"] is True


def test_data_repository_psl_change_intelligence():
    """Verify lazy loading of the 63-record PSL change intelligence dataset."""
    repo = DataRepository()
    df = repo.get_psl_change_intelligence()

    assert df is not None
    assert len(df) == 63
    # Check expected columns exist in real Colab dataset
    assert "old_provision" in df.columns or "provision" in df.columns or "change_type" in df.columns


def test_data_repository_psl_change_summary():
    """Verify lazy loading of the PSL change summary JSON."""
    repo = DataRepository()
    summary = repo.get_psl_change_summary()

    assert summary is not None
    assert isinstance(summary, dict)


def test_data_repository_missing_file_raises():
    """Verify that missing files raise a clean DataFileNotFoundError."""
    repo = DataRepository()
    with pytest.raises(DataFileNotFoundError) as exc_info:
        repo._resolve_file("non_existent_dataset.csv", "Non-Existent Artifact")

    assert "not found" in str(exc_info.value)
