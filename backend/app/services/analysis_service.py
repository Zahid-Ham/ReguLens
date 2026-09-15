"""Analysis Service.

Provides domain logic, query filtering, and lazy loading for the PSL 2020 vs 2025
Regulatory Change Intelligence datasets, granular clause comparative views,
and structured regulatory requirement extractions.
"""

import json
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd
from app.schemas.analysis import (
    AnalysisOverview,
    ChangeRecord,
    ClauseDetail,
    RegulatoryShift,
    RequirementRecord,
)
from app.services.data_repository import DataRepository


class AnalysisService:
    """Service responsible for loading and querying change intelligence and requirements."""

    def __init__(self, data_repo: DataRepository) -> None:
        self.data_repo = data_repo
        self._overview_cache: Optional[AnalysisOverview] = None
        self._changes_cache: Optional[List[ChangeRecord]] = None
        self._changes_by_id: Optional[Dict[str, ChangeRecord]] = None
        self._psl_2020_clauses_cache: Optional[Dict[str, ClauseDetail]] = None
        self._psl_2025_clauses_cache: Optional[Dict[str, ClauseDetail]] = None
        self._requirements_cache: Optional[List[RequirementRecord]] = None

    # =========================================================================
    # Helpers
    # =========================================================================

    def _clean_str(self, val: Any) -> Optional[str]:
        """Convert NaN / float nulls to clean trimmed strings or None."""
        if val is None or pd.isna(val):
            return None
        s = str(val).strip()
        return s if s and s.lower() != "nan" else None

    def _clean_float(self, val: Any) -> Optional[float]:
        """Convert NaN / nulls to float or None."""
        if val is None or pd.isna(val):
            return None
        try:
            return float(val)
        except (ValueError, TypeError):
            return None

    def _clean_int(self, val: Any) -> Optional[int]:
        """Convert NaN / nulls to int or None."""
        if val is None or pd.isna(val):
            return None
        try:
            return int(float(val))
        except (ValueError, TypeError):
            return None

    def _clean_provision_id(self, val: Any) -> Optional[str]:
        """Convert provision IDs (e.g. 1.1, 2.0) to clean string representations."""
        if val is None or pd.isna(val):
            return None
        s = str(val).strip()
        if s.endswith(".0"):
            return s[:-2]
        return s

    # =========================================================================
    # Analysis Overview
    # =========================================================================

    def get_analysis_overview(self) -> AnalysisOverview:
        """Load and compute analysis overview from precomputed summary JSON and change dataset."""
        if self._overview_cache is not None:
            return self._overview_cache

        # 1. Load exact summary stats from the V2 summary artifact
        summary = self.data_repo.get_psl_change_summary()

        total_records = int(summary.get("total_records", 63))
        substantive_changes = int(summary.get("substantive_modified", 31))
        administrative_changes = int(summary.get("administrative_changes", 4))
        wording_only = int(summary.get("wording_only", 7))
        added_candidates = int(summary.get("added_candidates", 7))
        removed_candidates = int(summary.get("removed_candidates", 12))
        unchanged = int(summary.get("unchanged", 2))

        high_materiality = int(summary.get("high_materiality", 50))
        medium_materiality = int(summary.get("medium_materiality", 0))
        low_materiality = int(summary.get("low_materiality", 13))

        # 2. Derive dimension shift counts from change intelligence dataset
        df_chg = self.data_repo.get_psl_change_intelligence()

        def _count_dimension(keyword: str) -> int:
            return int(
                df_chg["change_dimension"]
                .astype(str)
                .str.contains(keyword, case=False, na=False)
                .sum()
            )

        modality_changes = _count_dimension("MODALITY")
        monetary_changes = _count_dimension("MONETARY")
        percentage_changes = _count_dimension("PERCENTAGE")
        duration_changes = _count_dimension("DURATION")
        deadline_changes = _count_dimension("DEADLINE")
        date_changes = _count_dimension("DATE")

        methodology_notes = {
            "added_candidates": (
                "Identified novel provisions in updated 2025 directions requiring review "
                "(not legally confirmed additions)"
            ),
            "removed_candidates": (
                "Identified retired provisions from baseline 2020 directions requiring review "
                "(not legally confirmed removals)"
            ),
            "materiality_assessment": (
                "Deterministic NLP materiality evaluation based on deontic modality shifts and regulatory parameter modifications"
            ),
            "alignment_methodology": (
                "Hybrid sentence-transformer semantic embedding alignment combined with lexical TF-IDF matching"
            ),
        }

        self._overview_cache = AnalysisOverview(
            analysis_id="psl-2020-2025",
            previous_document_id="rbi_psl_2020_official",
            current_document_id="rbi_a8d0f9a98495",
            previous_document_title="Reserve Bank of India (Priority Sector Lending - Targets and Classification) Directions, 2020",
            current_document_title="Master Directions - Reserve Bank of India (Priority Sector Lending – Targets and Classification) Directions, 2025",
            total_records=total_records,
            substantive_changes=substantive_changes,
            administrative_changes=administrative_changes,
            wording_only=wording_only,
            added_candidates=added_candidates,
            removed_candidates=removed_candidates,
            unchanged=unchanged,
            high_materiality=high_materiality,
            medium_materiality=medium_materiality,
            low_materiality=low_materiality,
            modality_changes=modality_changes,
            monetary_changes=monetary_changes,
            percentage_changes=percentage_changes,
            duration_changes=duration_changes,
            deadline_changes=deadline_changes,
            date_changes=date_changes,
            methodology_notes=methodology_notes,
        )
        return self._overview_cache

    # =========================================================================
    # Change Intelligence Records
    # =========================================================================

    def _load_changes(self) -> List[ChangeRecord]:
        """Load and cache change intelligence dataset into structured models."""
        if self._changes_cache is not None:
            return self._changes_cache

        df = self.data_repo.get_psl_change_intelligence()
        records: List[ChangeRecord] = []
        lookup_map: Dict[str, ChangeRecord] = {}

        for idx, row in df.iterrows():
            change_id = f"CHG_{idx + 1:04d}"

            # Parse structured regulatory shifts JSON
            reg_changes_raw = row.get("regulatory_changes")
            parsed_shifts: List[RegulatoryShift] = []
            if pd.notna(reg_changes_raw) and isinstance(reg_changes_raw, str):
                try:
                    shifts_json = json.loads(reg_changes_raw)
                    if isinstance(shifts_json, list):
                        for s in shifts_json:
                            if isinstance(s, dict) and "dimension" in s:
                                parsed_shifts.append(
                                    RegulatoryShift(
                                        dimension=str(s["dimension"]),
                                        old=s.get("old", []) if isinstance(s.get("old"), list) else [s.get("old")],
                                        new=s.get("new", []) if isinstance(s.get("new"), list) else [s.get("new")],
                                    )
                                )
                except Exception:
                    parsed_shifts = []

            old_clause_id = self._clean_str(row.get("old_clause_id"))
            new_clause_id = self._clean_str(row.get("new_clause_id"))

            record = ChangeRecord(
                change_id=change_id,
                old_clause_id=old_clause_id,
                old_provision_id=self._clean_provision_id(row.get("old_provision_id")),
                new_clause_id=new_clause_id,
                new_provision_id=self._clean_provision_id(row.get("new_provision_id")),
                alignment_score=self._clean_float(row.get("alignment_score")),
                semantic_similarity=self._clean_float(row.get("semantic_similarity")),
                tfidf_similarity=self._clean_float(row.get("tfidf_similarity")),
                change_type=str(row["change_type"]).strip(),
                change_dimension=self._clean_str(row.get("change_dimension")),
                materiality=str(row["materiality"]).strip(),
                old_modality=self._clean_str(row.get("old_modality")),
                new_modality=self._clean_str(row.get("new_modality")),
                modality_direction=self._clean_str(row.get("modality_direction")),
                regulatory_changes=parsed_shifts,
                explanation=self._clean_str(row.get("explanation")),
                old_clause_text=self._clean_str(row.get("old_clause_text")),
                new_clause_text=self._clean_str(row.get("new_clause_text")),
                final_change_type=str(row["final_change_type"]).strip(),
                final_category=str(row["final_category"]).strip(),
                final_materiality=str(row["final_materiality"]).strip(),
                final_explanation=self._clean_str(row.get("final_explanation")),
            )

            records.append(record)
            lookup_map[change_id.lower()] = record
            lookup_map[str(idx + 1)] = record
            if old_clause_id:
                lookup_map[old_clause_id.lower()] = record
            if new_clause_id:
                lookup_map[new_clause_id.lower()] = record

        self._changes_cache = records
        self._changes_by_id = lookup_map
        return self._changes_cache

    def get_all_changes(
        self,
        change_type: Optional[str] = None,
        category: Optional[str] = None,
        materiality: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[ChangeRecord], int]:
        """Query and filter change intelligence records with pagination."""
        changes = self._load_changes()

        filtered = changes

        # Filter by Change Type (matches either final_change_type or raw change_type)
        if change_type and change_type.strip():
            ctype_norm = change_type.strip().lower()
            filtered = [
                c
                for c in filtered
                if ctype_norm in c.final_change_type.lower() or ctype_norm in c.change_type.lower()
            ]

        # Filter by Category
        if category and category.strip():
            cat_norm = category.strip().lower()
            filtered = [c for c in filtered if cat_norm in c.final_category.lower()]

        # Filter by Materiality
        if materiality and materiality.strip():
            mat_norm = materiality.strip().lower()
            filtered = [
                c
                for c in filtered
                if mat_norm in c.final_materiality.lower() or mat_norm in c.materiality.lower()
            ]

        total = len(filtered)
        paginated = filtered[offset : offset + limit]
        return paginated, total

    def get_change_by_id(self, change_id: str) -> Optional[ChangeRecord]:
        """Retrieve a single change record by change_id, index, or clause identifier."""
        self._load_changes()
        if not self._changes_by_id:
            return None
        return self._changes_by_id.get(change_id.strip().lower())

    # =========================================================================
    # Granular Clause Details
    # =========================================================================

    def _load_clauses(self, version: str) -> Dict[str, ClauseDetail]:
        """Load and cache segmented clauses for a specific regulatory version."""
        norm_ver = version.strip().lower()

        if "2020" in norm_ver:
            if self._psl_2020_clauses_cache is not None:
                return self._psl_2020_clauses_cache
            df = self.data_repo.get_psl_2020_clauses()
            ver_label = "PSL_2020"
        elif "2025" in norm_ver:
            if self._psl_2025_clauses_cache is not None:
                return self._psl_2025_clauses_cache
            df = self.data_repo.get_psl_2025_clauses()
            ver_label = "PSL_2025"
        else:
            return {}

        clause_map: Dict[str, ClauseDetail] = {}
        for _, row in df.iterrows():
            cid = str(row["clause_id"]).strip()
            detail = ClauseDetail(
                version=ver_label,
                clause_id=cid,
                page=self._clean_int(row.get("page")),
                provision_id=self._clean_provision_id(row.get("provision_id")),
                section_level=self._clean_int(row.get("section_level")),
                content_mode=self._clean_str(row.get("content_mode")),
                clause_text=str(row.get("clause_text", "")).strip(),
                char_length=self._clean_int(row.get("char_length")),
                word_count=self._clean_int(row.get("word_count")),
            )
            clause_map[cid.lower()] = detail

        if "2020" in norm_ver:
            self._psl_2020_clauses_cache = clause_map
        else:
            self._psl_2025_clauses_cache = clause_map

        return clause_map

    def get_clause_by_id(self, version: str, clause_id: str) -> Optional[ClauseDetail]:
        """Retrieve clause detail by version ('2020' or '2025') and clause_id."""
        clauses_dict = self._load_clauses(version)
        return clauses_dict.get(clause_id.strip().lower())

    # =========================================================================
    # Structured Requirements Lookup
    # =========================================================================

    def _load_requirements(self) -> List[RequirementRecord]:
        """Load and cache structured requirements dataset."""
        if self._requirements_cache is not None:
            return self._requirements_cache

        df = self.data_repo.get_structured_requirements()
        records: List[RequirementRecord] = []

        for _, row in df.iterrows():
            records.append(
                RequirementRecord(
                    document_id=str(row["document_id"]).strip(),
                    filename=self._clean_str(row.get("filename")),
                    source_page=self._clean_str(row.get("source_page")),
                    pdf_url=self._clean_str(row.get("pdf_url")),
                    page_number=self._clean_int(row.get("page_number")),
                    clause_id=str(row["clause_id"]).strip(),
                    clause_level=self._clean_int(row.get("clause_level")),
                    clause_text=str(row.get("clause_text", "")).strip(),
                    character_count=self._clean_int(row.get("character_count")),
                    word_count=self._clean_int(row.get("word_count")),
                    regulatory_function=self._clean_str(row.get("regulatory_function")),
                    subject=self._clean_str(row.get("subject")),
                    modality=self._clean_str(row.get("modality")),
                    action=self._clean_str(row.get("action")),
                    deadline=self._clean_str(row.get("deadline")),
                    duration=self._clean_str(row.get("duration")),
                )
            )

        self._requirements_cache = records
        return self._requirements_cache

    def get_requirements(
        self,
        document_id: Optional[str] = None,
        function: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[RequirementRecord], int]:
        """Query and filter structured regulatory requirements with pagination."""
        reqs = self._load_requirements()
        filtered = reqs

        if document_id and document_id.strip():
            doc_norm = document_id.strip().lower()
            filtered = [r for r in filtered if doc_norm in r.document_id.lower()]

        if function and function.strip():
            fn_norm = function.strip().lower()
            filtered = [
                r
                for r in filtered
                if r.regulatory_function and fn_norm in r.regulatory_function.lower()
            ]

        total = len(filtered)
        paginated = filtered[offset : offset + limit]
        return paginated, total
