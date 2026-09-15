"""Data Repository Service.

Provides a unified, modular interface to locate and lazily load existing
precomputed ReguLens datasets and artifacts from the backend/data directory.
Does not hardcode Colab paths or fabricate data.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd
from app.config import Settings, get_settings
from app.core.exceptions import DataCorruptedError, DataFileNotFoundError


class DataRepository:
    """Repository service responsible for locating and loading backend data artifacts."""

    def __init__(self, settings: Optional[Settings] = None) -> None:
        self.settings = settings or get_settings()
        self.data_dir: Path = self.settings.DATA_DIR.resolve()

    def _resolve_file(self, relative_path: str, artifact_name: str) -> Path:
        """Resolve a relative file path within the data directory, verifying existence."""
        target_path = (self.data_dir / relative_path).resolve()
        if not target_path.is_file():
            raise DataFileNotFoundError(
                file_path=str(target_path),
                artifact_name=artifact_name,
            )
        return target_path

    # =========================================================================
    # Final Processed Intelligence & Summaries
    # =========================================================================

    def get_psl_change_intelligence(self) -> pd.DataFrame:
        """Load the 63-record PSL Regulatory Change Intelligence dataset.

        Artifact: data/final/regulens_psl_regulatory_change_intelligence_v2.csv
        """
        path = self._resolve_file(
            "final/regulens_psl_regulatory_change_intelligence_v2.csv",
            "PSL Regulatory Change Intelligence v2",
        )
        try:
            return pd.read_csv(path)
        except Exception as e:
            raise DataCorruptedError(str(path), str(e)) from e

    def get_psl_change_summary(self) -> Dict[str, Any]:
        """Load the precomputed PSL change intelligence summary JSON.

        Artifact: data/final/regulens_psl_regulatory_change_intelligence_summary_v2.json
        """
        path = self._resolve_file(
            "final/regulens_psl_regulatory_change_intelligence_summary_v2.json",
            "PSL Regulatory Change Summary v2",
        )
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            raise DataCorruptedError(str(path), str(e)) from e

    def get_structured_requirements(self) -> pd.DataFrame:
        """Load the extracted obligation and structured requirement dataset.

        Artifact: data/final/regulens_structured_requirements_v3.csv
        """
        path = self._resolve_file(
            "final/regulens_structured_requirements_v3.csv",
            "Structured Requirements v3",
        )
        try:
            return pd.read_csv(path)
        except Exception as e:
            raise DataCorruptedError(str(path), str(e)) from e

    # =========================================================================
    # Processed Clauses & NLP Annotations
    # =========================================================================

    def get_regulatory_clauses(self) -> pd.DataFrame:
        """Load the complete segmented regulatory clause corpus.

        Artifact: data/processed/clauses/regulatory_clauses.csv
        """
        path = self._resolve_file(
            "processed/clauses/regulatory_clauses.csv",
            "Regulatory Clauses",
        )
        try:
            return pd.read_csv(path)
        except Exception as e:
            raise DataCorruptedError(str(path), str(e)) from e

    def get_psl_2020_clauses(self) -> pd.DataFrame:
        """Load segmented clauses for RBI PSL Guidelines 2020.

        Artifact: data/processed/clauses/psl_version_comparison/psl_2020_main_clauses_v3.csv
        """
        path = self._resolve_file(
            "processed/clauses/psl_version_comparison/psl_2020_main_clauses_v3.csv",
            "PSL 2020 Main Clauses v3",
        )
        try:
            return pd.read_csv(path)
        except Exception as e:
            raise DataCorruptedError(str(path), str(e)) from e

    def get_psl_2025_clauses(self) -> pd.DataFrame:
        """Load segmented clauses for RBI PSL Guidelines 2025.

        Artifact: data/processed/clauses/psl_version_comparison/psl_2025_main_clauses_v3.csv
        """
        path = self._resolve_file(
            "processed/clauses/psl_version_comparison/psl_2025_main_clauses_v3.csv",
            "PSL 2025 Main Clauses v3",
        )
        try:
            return pd.read_csv(path)
        except Exception as e:
            raise DataCorruptedError(str(path), str(e)) from e

    def get_domain_ner_annotations(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Load domain-specific financial NER annotations from JSONL.

        Artifact: data/processed/clauses/nlp_annotations/enhanced_domain_ner_annotations.jsonl
        """
        path = self._resolve_file(
            "processed/clauses/nlp_annotations/enhanced_domain_ner_annotations.jsonl",
            "Enhanced Domain NER Annotations",
        )
        records: List[Dict[str, Any]] = []
        try:
            with open(path, "r", encoding="utf-8") as f:
                for idx, line in enumerate(f):
                    if limit is not None and idx >= limit:
                        break
                    line_clean = line.strip()
                    if line_clean:
                        records.append(json.loads(line_clean))
            return records
        except Exception as e:
            raise DataCorruptedError(str(path), str(e)) from e

    # =========================================================================
    # Catalog & Metadata
    # =========================================================================

    def get_document_catalog(self) -> pd.DataFrame:
        """Load the master document catalog.

        Artifact: data/processed/document_catalog.csv
        """
        path = self._resolve_file(
            "processed/document_catalog.csv",
            "Document Catalog",
        )
        try:
            return pd.read_csv(path)
        except Exception as e:
            raise DataCorruptedError(str(path), str(e)) from e

    def get_acquisition_metadata(self) -> pd.DataFrame:
        """Load raw document acquisition metadata.

        Artifact: data/processed/acquisition_metadata.csv
        """
        path = self._resolve_file(
            "processed/acquisition_metadata.csv",
            "Acquisition Metadata",
        )
        try:
            return pd.read_csv(path)
        except Exception as e:
            raise DataCorruptedError(str(path), str(e)) from e

    def get_silver_classification_dataset(self) -> pd.DataFrame:
        """Load the silver clause classification dataset.

        Artifact: data/annotations/regulens_silver_classification_dataset.csv
        """
        path = self._resolve_file(
            "annotations/regulens_silver_classification_dataset.csv",
            "Silver Classification Dataset",
        )
        try:
            return pd.read_csv(path)
        except Exception as e:
            raise DataCorruptedError(str(path), str(e)) from e

    def get_llm_annotations(self) -> pd.DataFrame:
        """Load the 300 LLM-assisted clause annotations dataset.

        Artifact: data/annotations/validated/regulens_llm_annotations_300.csv
        """
        path = self._resolve_file(
            "annotations/validated/regulens_llm_annotations_300.csv",
            "LLM Annotations 300",
        )
        try:
            return pd.read_csv(path)
        except Exception as e:
            raise DataCorruptedError(str(path), str(e)) from e

    def get_human_audit(self) -> pd.DataFrame:
        """Load the 50-sample human-audited validation subset.

        Artifact: data/annotations/validated/regulens_human_audit_50.csv
        """
        path = self._resolve_file(
            "annotations/validated/regulens_human_audit_50.csv",
            "Human Audit 50",
        )
        try:
            return pd.read_csv(path)
        except Exception as e:
            raise DataCorruptedError(str(path), str(e)) from e

    # =========================================================================
    # Model Evaluation Metrics & Coverage
    # =========================================================================

    def get_tfidf_cv_summary(self) -> pd.DataFrame:
        """Load cross-validation evaluation summary for TF-IDF + Logistic Regression.

        Artifact: data/metrics/regulens_tfidf_logistic_cv_summary.csv
        """
        path = self._resolve_file(
            "metrics/regulens_tfidf_logistic_cv_summary.csv",
            "TF-IDF Logistic CV Summary",
        )
        try:
            return pd.read_csv(path)
        except Exception as e:
            raise DataCorruptedError(str(path), str(e)) from e

    def get_semantic_cv_summary(self) -> pd.DataFrame:
        """Load cross-validation evaluation summary for Sentence Transformer classifier.

        Artifact: data/metrics/regulens_semantic_classifier_cv_summary.csv
        """
        path = self._resolve_file(
            "metrics/regulens_semantic_classifier_cv_summary.csv",
            "Semantic Classifier CV Summary",
        )
        try:
            return pd.read_csv(path)
        except Exception as e:
            raise DataCorruptedError(str(path), str(e)) from e

    def get_semantic_classifier_cv_summary(self) -> pd.DataFrame:
        """Alias for get_semantic_cv_summary."""
        return self.get_semantic_cv_summary()


    def get_obligation_coverage(self) -> Dict[str, Any]:
        """Load obligation extraction v3 coverage statistics JSON.

        Artifact: data/metrics/regulens_obligation_extraction_v3_coverage.json
        """
        path = self._resolve_file(
            "metrics/regulens_obligation_extraction_v3_coverage.json",
            "Obligation Extraction Coverage",
        )
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            raise DataCorruptedError(str(path), str(e)) from e

    # =========================================================================
    # Raw Documents & Verification
    # =========================================================================

    def get_raw_pdf_path(self, filename: str) -> Path:
        """Resolve path to a raw official RBI regulatory PDF."""
        return self._resolve_file(f"raw/rbi/pdfs/{filename}", f"Raw PDF: {filename}")

    def verify_data_integrity(self) -> Dict[str, bool]:
        """Verify presence of all expected key artifacts without loading full payloads."""
        key_files = {
            "psl_change_intelligence_csv": "final/regulens_psl_regulatory_change_intelligence_v2.csv",
            "psl_change_summary_json": "final/regulens_psl_regulatory_change_intelligence_summary_v2.json",
            "structured_requirements_csv": "final/regulens_structured_requirements_v3.csv",
            "regulatory_clauses_csv": "processed/clauses/regulatory_clauses.csv",
            "psl_2020_clauses_csv": "processed/clauses/psl_version_comparison/psl_2020_main_clauses_v3.csv",
            "psl_2025_clauses_csv": "processed/clauses/psl_version_comparison/psl_2025_main_clauses_v3.csv",
            "domain_ner_annotations_jsonl": "processed/clauses/nlp_annotations/enhanced_domain_ner_annotations.jsonl",
            "document_catalog_csv": "processed/document_catalog.csv",
            "acquisition_metadata_csv": "processed/acquisition_metadata.csv",
            "silver_classification_csv": "annotations/regulens_silver_classification_dataset.csv",
            "llm_annotations_300": "annotations/validated/regulens_llm_annotations_300.csv",
            "human_audit_50": "annotations/validated/regulens_human_audit_50.csv",
            "tfidf_cv_summary": "metrics/regulens_tfidf_logistic_cv_summary.csv",
            "semantic_cv_summary": "metrics/regulens_semantic_classifier_cv_summary.csv",
            "obligation_coverage_json": "metrics/regulens_obligation_extraction_v3_coverage.json",
            "raw_pdf_2020": "raw/rbi/pdfs/rbi_psl_2020_official.pdf",
            "raw_pdf_2025": "raw/rbi/pdfs/rbi_psl_2025.pdf",
        }
        return {key: (self.data_dir / rel_path).is_file() for key, rel_path in key_files.items()}

