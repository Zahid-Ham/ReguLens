"""Dynamic Regulatory Document Comparison Service.

Performs comparative analysis between baseline and updated regulatory documents:
1. Hybrid clause alignment (provision identity, lexical TF-IDF, semantic similarity, structural signals)
2. Fine-grained change detection across 13 regulatory dimensions
3. Deontic modality shift tracking (STRENGTHENED, RELAXED, UNCHANGED)
4. Parameter difference extraction (deadlines, durations, monetary values, thresholds, dates)
5. Administrative date change vs substantive shift distinction
6. Deterministic explainable materiality classification (HIGH, MEDIUM, LOW)
7. Runtime analysis job storage and drill-down serving
"""

from datetime import datetime, timezone
import difflib
import math
import re
from typing import Any, Dict, List, Optional, Set, Tuple
import uuid

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.schemas.analysis import (
    AnalysisOverview,
    ChangeListResponse,
    ChangeRecord,
    ClauseDetail,
    RegulatoryShift,
)
from app.schemas.dynamic_nlp import DynamicClauseNLP, DynamicNLPResponse


class DynamicComparisonService:
    """Service managing dynamic pairwise comparison of processed regulatory documents."""

    def __init__(self) -> None:
        # Runtime store: analysis_id -> { "overview": AnalysisOverview, "changes": List[ChangeRecord], ... }
        self._analysis_store: Dict[str, Dict[str, Any]] = {}

    # =========================================================================
    # 1. Similarity & Alignment Helpers
    # =========================================================================

    def _normalize_provision(self, prov: Optional[str]) -> Optional[str]:
        """Normalize provision identifier (e.g. '1.1.' -> '1.1', '(a)' -> 'a')."""
        if not prov:
            return None
        clean = prov.strip().lower()
        clean = re.sub(r"[\(\)\[\]\{\}\.\:\s]", "", clean)
        return clean if clean else None

    def _compute_tfidf_similarities(
        self, prev_texts: List[str], curr_texts: List[str]
    ) -> np.ndarray:
        """Compute pairwise cosine similarity matrix using TF-IDF n-grams."""
        if not prev_texts or not curr_texts:
            return np.zeros((len(prev_texts), len(curr_texts)))

        try:
            vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
            all_texts = prev_texts + curr_texts
            tfidf_matrix = vectorizer.fit_transform(all_texts)
            prev_matrix = tfidf_matrix[: len(prev_texts)]
            curr_matrix = tfidf_matrix[len(prev_texts) :]
            sim_matrix = cosine_similarity(prev_matrix, curr_matrix)
            return sim_matrix
        except Exception:
            # Fallback simple word overlap
            matrix = np.zeros((len(prev_texts), len(curr_texts)))
            for i, pt in enumerate(prev_texts):
                p_set = set(pt.lower().split())
                for j, ct in enumerate(curr_texts):
                    c_set = set(ct.lower().split())
                    if p_set or c_set:
                        overlap = len(p_set & c_set) / max(1, len(p_set | c_set))
                        matrix[i, j] = overlap
            return matrix

    def _compute_semantic_similarities(
        self, prev_clauses: List[DynamicClauseNLP], curr_clauses: List[DynamicClauseNLP]
    ) -> np.ndarray:
        """Compute semantic similarity matrix using token/lemma overlap and length ratios."""
        matrix = np.zeros((len(prev_clauses), len(curr_clauses)))
        for i, pc in enumerate(prev_clauses):
            p_lemmas = set(pc.lemmas) if pc.lemmas else set(pc.clause_text.lower().split())
            p_len = len(pc.clause_text)
            for j, cc in enumerate(curr_clauses):
                c_lemmas = set(cc.lemmas) if cc.lemmas else set(cc.clause_text.lower().split())
                c_len = len(cc.clause_text)

                if p_lemmas or c_lemmas:
                    jaccard = len(p_lemmas & c_lemmas) / max(1, len(p_lemmas | c_lemmas))
                else:
                    jaccard = 0.0

                len_ratio = min(p_len, c_len) / max(1, max(p_len, c_len))
                matrix[i, j] = 0.7 * jaccard + 0.3 * len_ratio
        return matrix

    # =========================================================================
    # 2. Hybrid Alignment Algorithm
    # =========================================================================

    def align_clauses(
        self,
        prev_clauses: List[DynamicClauseNLP],
        curr_clauses: List[DynamicClauseNLP],
    ) -> List[Tuple[Optional[DynamicClauseNLP], Optional[DynamicClauseNLP], float, float, float, str]]:
        """Align previous and current clauses using hybrid multi-signal matching."""
        prev_texts = [p.clause_text for p in prev_clauses]
        curr_texts = [c.clause_text for c in curr_clauses]

        tfidf_sim = self._compute_tfidf_similarities(prev_texts, curr_texts)
        sem_sim = self._compute_semantic_similarities(prev_clauses, curr_clauses)

        num_prev = len(prev_clauses)
        num_curr = len(curr_clauses)

        # Candidate alignment pairs
        candidate_matches: List[Tuple[float, int, int, str]] = []

        for p_idx, p in enumerate(prev_clauses):
            p_norm_prov = self._normalize_provision(p.provision_id)
            for c_idx, c in enumerate(curr_clauses):
                c_norm_prov = self._normalize_provision(c.provision_id)

                t_score = float(tfidf_sim[p_idx, c_idx])
                s_score = float(sem_sim[p_idx, c_idx])

                # Position closeness (0.0 to 1.0)
                p_rel = p_idx / max(1, num_prev)
                c_rel = c_idx / max(1, num_curr)
                pos_score = max(0.0, 1.0 - abs(p_rel - c_rel) * 1.5)

                same_function = 1.0 if p.classification.label == c.classification.label else 0.0

                # Determine if provision match
                is_prov_match = bool(p_norm_prov and c_norm_prov and p_norm_prov == c_norm_prov)

                if is_prov_match:
                    composite_score = 0.5 + 0.3 * s_score + 0.2 * t_score
                    method = "same_provision"
                else:
                    composite_score = 0.45 * s_score + 0.35 * t_score + 0.1 * same_function + 0.1 * pos_score
                    if t_score > 0.75 and s_score > 0.75:
                        method = "hybrid"
                    elif s_score >= t_score:
                        method = "semantic"
                    else:
                        method = "lexical"

                # Filter threshold
                min_threshold = 0.30 if is_prov_match else 0.42
                if composite_score >= min_threshold:
                    candidate_matches.append((composite_score, p_idx, c_idx, method))

        # Sort candidates by score descending
        candidate_matches.sort(key=lambda x: -x[0])

        assigned_prev: Set[int] = set()
        assigned_curr: Set[int] = set()
        aligned_pairs: List[Tuple[Optional[DynamicClauseNLP], Optional[DynamicClauseNLP], float, float, float, str]] = []

        for score, p_idx, c_idx, method in candidate_matches:
            if p_idx not in assigned_prev and c_idx not in assigned_curr:
                assigned_prev.add(p_idx)
                assigned_curr.add(c_idx)
                t_score = float(tfidf_sim[p_idx, c_idx])
                s_score = float(sem_sim[p_idx, c_idx])
                aligned_pairs.append((
                    prev_clauses[p_idx],
                    curr_clauses[c_idx],
                    round(score, 4),
                    round(s_score, 4),
                    round(t_score, 4),
                    method,
                ))

        # Add unmatched previous clauses (POSSIBLE_REMOVED)
        for p_idx, p in enumerate(prev_clauses):
            if p_idx not in assigned_prev:
                aligned_pairs.append((p, None, 0.0, 0.0, 0.0, "unmatched"))

        # Add unmatched current clauses (POSSIBLE_ADDED)
        for c_idx, c in enumerate(curr_clauses):
            if c_idx not in assigned_curr:
                aligned_pairs.append((None, c, 0.0, 0.0, 0.0, "unmatched"))

        return aligned_pairs

    # =========================================================================
    # 3. Change Detection & Materiality Scoring
    # =========================================================================

    def _extract_entity_values_by_label(self, clause: DynamicClauseNLP, label: str) -> List[str]:
        """Extract matched entity texts for a given domain label with regex fallback."""
        ents = [e.text.strip() for e in clause.entities if e.label == label]
        if ents:
            return ents

        text = clause.clause_text
        if label == "PERCENTAGE":
            return re.findall(r"\b\d+(?:\.\d+)?%", text)
        elif label == "MONETARY_VALUE":
            return re.findall(
                r"(?:₹|rs\.?|inr|usd|\$)\s*[\d,]+(?:\.\d+)?(?:\s*(?:crore|lakh|million|billion|k))?",
                text,
                re.IGNORECASE,
            )
        elif label in ("DURATION", "DEADLINE"):
            return re.findall(
                r"\b\d+\s*(?:day|month|year|week|hour|quarter|working day|calendar day)s?\b",
                text,
                re.IGNORECASE,
            )
        elif label == "DATE":
            return re.findall(
                r"\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember))\s+\d{1,2},?\s+\d{4}\b|\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
                text,
                re.IGNORECASE,
            )
        return []

    def _determine_modality_direction(
        self, old_mod: Optional[str], new_mod: Optional[str]
    ) -> Optional[str]:
        """Determine shift in deontic obligation strength."""
        if not old_mod and not new_mod:
            return None
        if not old_mod or not new_mod:
            return "MODIFIED"

        old_m = old_mod.lower().strip()
        new_m = new_mod.lower().strip()

        if old_m == new_m:
            return "UNCHANGED"

        # Strengthening patterns
        if "shall not" in new_m or "must not" in new_m:
            return "STRENGTHENED"
        if ("may" in old_m or "should" in old_m or "can" in old_m) and ("shall" in new_m or "must" in new_m):
            return "STRENGTHENED"

        # Relaxing patterns
        if ("shall not" in old_m or "must not" in old_m) and ("shall" in new_m or "may" in new_m):
            return "RELAXED"
        if ("shall" in old_m or "must" in old_m) and ("may" in new_m or "can" in new_m or "should" in new_m):
            return "RELAXED"

        return "MODIFIED"

    def compare_clause_pair(
        self,
        change_idx: int,
        p_clause: Optional[DynamicClauseNLP],
        c_clause: Optional[DynamicClauseNLP],
        alignment_score: float,
        semantic_similarity: float,
        tfidf_similarity: float,
        alignment_method: str,
    ) -> ChangeRecord:
        """Compare an aligned clause pair and generate an explainable ChangeRecord."""
        change_id = f"CHG_{change_idx:04d}"

        # 1. Unmatched - Added Candidate
        if p_clause is None and c_clause is not None:
            mat = "HIGH" if c_clause.classification.label in ("OBLIGATION", "PROHIBITION", "REPORTING") else "MEDIUM"
            reasons = ["New regulatory provision introduced in updated document (candidate addition)."]
            return ChangeRecord(
                change_id=change_id,
                old_clause_id=None,
                old_provision_id=None,
                new_clause_id=c_clause.clause_id,
                new_provision_id=c_clause.provision_id,
                alignment_score=0.0,
                semantic_similarity=0.0,
                tfidf_similarity=0.0,
                alignment_method=alignment_method,
                change_type="ADDED",
                change_dimension="STRUCTURE",
                materiality=mat,
                materiality_reasons=reasons,
                old_modality=None,
                new_modality=c_clause.requirement.modality if c_clause.requirement else None,
                modality_direction=None,
                regulatory_changes=[],
                explanation="Candidate novel provision introduced in updated regulation requiring legal review.",
                old_clause_text=None,
                new_clause_text=c_clause.clause_text,
                final_change_type="ADDED",
                final_category="REGULATORY_STRUCTURE",
                final_materiality=mat,
                final_explanation="New regulatory requirement candidate introduced in revised framework.",
            )

        # 2. Unmatched - Removed Candidate
        if p_clause is not None and c_clause is None:
            mat = "HIGH" if p_clause.classification.label in ("OBLIGATION", "PROHIBITION", "REPORTING") else "MEDIUM"
            reasons = ["Baseline regulatory provision not detected in updated document (candidate removal)."]
            return ChangeRecord(
                change_id=change_id,
                old_clause_id=p_clause.clause_id,
                old_provision_id=p_clause.provision_id,
                new_clause_id=None,
                new_provision_id=None,
                alignment_score=0.0,
                semantic_similarity=0.0,
                tfidf_similarity=0.0,
                alignment_method=alignment_method,
                change_type="REMOVED",
                change_dimension="STRUCTURE",
                materiality=mat,
                materiality_reasons=reasons,
                old_modality=p_clause.requirement.modality if p_clause.requirement else None,
                new_modality=None,
                modality_direction=None,
                regulatory_changes=[],
                explanation="Candidate retired provision from baseline regulation omitted in revised framework.",
                old_clause_text=p_clause.clause_text,
                new_clause_text=None,
                final_change_type="REMOVED",
                final_category="REGULATORY_STRUCTURE",
                final_materiality=mat,
                final_explanation="Baseline regulatory provision candidate omitted or retired in revised version.",
            )

        # 3. Aligned Pair Comparison
        p_text = p_clause.clause_text.strip()
        c_text = c_clause.clause_text.strip()

        # Identical text
        if p_text == c_text:
            return ChangeRecord(
                change_id=change_id,
                old_clause_id=p_clause.clause_id,
                old_provision_id=p_clause.provision_id,
                new_clause_id=c_clause.clause_id,
                new_provision_id=c_clause.provision_id,
                alignment_score=alignment_score,
                semantic_similarity=semantic_similarity,
                tfidf_similarity=tfidf_similarity,
                alignment_method=alignment_method,
                change_type="UNCHANGED",
                change_dimension=None,
                materiality="LOW",
                materiality_reasons=["Identical regulatory provision text and parameters preserved across versions."],
                old_modality=p_clause.requirement.modality if p_clause.requirement else None,
                new_modality=c_clause.requirement.modality if c_clause.requirement else None,
                modality_direction="UNCHANGED",
                regulatory_changes=[],
                explanation="Provision is textually and semantically identical across regulatory versions.",
                old_clause_text=p_text,
                new_clause_text=c_text,
                final_change_type="UNCHANGED",
                final_category="NO_CHANGE",
                final_materiality="LOW",
                final_explanation="No regulatory modification detected; text matches baseline exactly.",
            )

        # Differences exist - compare dimensions
        dimensions: List[str] = []
        shifts: List[RegulatoryShift] = []
        materiality_reasons: List[str] = []
        is_high_materiality = False
        is_substantive = False

        # A. Modality check
        old_mod = p_clause.requirement.modality if p_clause.requirement else None
        new_mod = c_clause.requirement.modality if c_clause.requirement else None
        mod_dir = self._determine_modality_direction(old_mod, new_mod)

        if mod_dir and mod_dir != "UNCHANGED":
            dimensions.append("MODALITY")
            shifts.append(RegulatoryShift(dimension="MODALITY", old=[old_mod] if old_mod else [], new=[new_mod] if new_mod else []))
            materiality_reasons.append(f"Deontic modality shifted from '{old_mod}' to '{new_mod}' ({mod_dir}).")
            is_high_materiality = True
            is_substantive = True

        # B. Parameter shifts via domain entities & regex fallbacks
        for ent_label in ("DEADLINE", "DURATION", "MONETARY_VALUE", "PERCENTAGE", "THRESHOLD", "DATE"):
            p_ents = self._extract_entity_values_by_label(p_clause, ent_label)
            c_ents = self._extract_entity_values_by_label(c_clause, ent_label)

            if p_ents != c_ents and (p_ents or c_ents):
                dimensions.append(ent_label)
                shifts.append(RegulatoryShift(dimension=ent_label, old=p_ents, new=c_ents))

                if ent_label in ("DEADLINE", "DURATION", "MONETARY_VALUE", "PERCENTAGE", "THRESHOLD"):
                    is_high_materiality = True
                    is_substantive = True
                    materiality_reasons.append(
                        f"Regulatory {ent_label.lower()} parameter modified: {p_ents or 'None'} -> {c_ents or 'None'}."
                    )

        # C. Subject / Action / Object shifts
        p_req = p_clause.requirement
        c_req = c_clause.requirement
        if p_req and c_req:
            if p_req.action and c_req.action and p_req.action.lower() != c_req.action.lower():
                dimensions.append("ACTION")
                shifts.append(RegulatoryShift(dimension="ACTION", old=[p_req.action], new=[c_req.action]))
                materiality_reasons.append(f"Prescribed action verb shifted from '{p_req.action}' to '{c_req.action}'.")
                is_substantive = True

            if p_req.subject and c_req.subject and p_req.subject.lower() != c_req.subject.lower():
                dimensions.append("SUBJECT")
                shifts.append(RegulatoryShift(dimension="SUBJECT", old=[p_req.subject], new=[c_req.subject]))
                is_substantive = True

        # D. Function shift
        if p_clause.classification.label != c_clause.classification.label:
            dimensions.append("REGULATORY_FUNCTION")
            shifts.append(
                RegulatoryShift(
                    dimension="REGULATORY_FUNCTION",
                    old=[p_clause.classification.label],
                    new=[c_clause.classification.label],
                )
            )
            materiality_reasons.append(
                f"Regulatory function reclassified from {p_clause.classification.label} to {c_clause.classification.label}."
            )
            is_substantive = True

        # E. Administrative Date vs Substantive Change determination
        # If ONLY 'DATE' changed and text contains administrative headers ("Updated as on", "Promulgated on")
        is_pure_admin_date = (
            set(dimensions) == {"DATE"}
            and not is_substantive
            and (
                p_clause.classification.label == "INFORMATION"
                or re.search(r"\b(updated as on|promulgated on|dated|circular no|notification no)\b", p_text.lower())
            )
        )

        if is_pure_admin_date:
            final_change_type = "ADMINISTRATIVE_CHANGE"
            final_category = "DOCUMENT_METADATA"
            final_materiality = "LOW"
            materiality_reasons.append("Administrative date/reference update without substantive obligation change.")
            explanation = "Administrative date or reference update without substantive obligation change."
        elif is_substantive or is_high_materiality:
            final_change_type = "MODIFIED"
            final_category = "SUBSTANTIVE_REGULATORY_CHANGE"
            final_materiality = "HIGH"
            explanation = (
                "; ".join(materiality_reasons)
                if materiality_reasons
                else "Substantive modification detected in regulatory provision content."
            )
        else:
            # Wording adjustments
            dimensions.append("WORDING")
            final_change_type = "WORDING_ONLY"
            final_category = "WORDING_CHANGE"
            final_materiality = "LOW"
            materiality_reasons.append("Stylistic or wording adjustments without alteration to mandatory legal parameters.")
            explanation = "Stylistic or wording adjustments without alteration to mandatory legal parameters."

        dim_str = "; ".join(dimensions) if dimensions else "WORDING"

        return ChangeRecord(
            change_id=change_id,
            old_clause_id=p_clause.clause_id,
            old_provision_id=p_clause.provision_id,
            new_clause_id=c_clause.clause_id,
            new_provision_id=c_clause.provision_id,
            alignment_score=alignment_score,
            semantic_similarity=semantic_similarity,
            tfidf_similarity=tfidf_similarity,
            alignment_method=alignment_method,
            change_type="MODIFIED" if final_change_type in ("MODIFIED", "ADMINISTRATIVE_CHANGE") else final_change_type,
            change_dimension=dim_str,
            materiality=final_materiality,
            materiality_reasons=materiality_reasons,
            old_modality=old_mod,
            new_modality=new_mod,
            modality_direction=mod_dir,
            regulatory_changes=shifts,
            explanation=explanation,
            old_clause_text=p_text,
            new_clause_text=c_text,
            final_change_type=final_change_type,
            final_category=final_category,
            final_materiality=final_materiality,
            final_explanation=explanation,
        )

    # =========================================================================
    # 4. Full Document Comparison & Overview Generation
    # =========================================================================

    def compare_documents(
        self,
        previous_document_id: str,
        current_document_id: str,
        previous_nlp: DynamicNLPResponse,
        current_nlp: DynamicNLPResponse,
        previous_title: Optional[str] = None,
        current_title: Optional[str] = None,
    ) -> Tuple[str, AnalysisOverview, List[ChangeRecord]]:
        """Run full comparative analysis between two processed NLP documents and register result in store."""
        prev_clauses = previous_nlp.clauses
        curr_clauses = current_nlp.clauses

        p_title = previous_title or f"Document {previous_document_id}"
        c_title = current_title or f"Document {current_document_id}"

        aligned_pairs = self.align_clauses(prev_clauses, curr_clauses)

        changes: List[ChangeRecord] = []
        for idx, (p_c, c_c, align_score, sem_sim, tfidf_sim, method) in enumerate(aligned_pairs, start=1):
            record = self.compare_clause_pair(
                change_idx=idx,
                p_clause=p_c,
                c_clause=c_c,
                alignment_score=align_score,
                semantic_similarity=sem_sim,
                tfidf_similarity=tfidf_sim,
                alignment_method=method,
            )
            changes.append(record)

        # Compute overview metrics
        substantive_count = sum(1 for c in changes if c.final_category == "SUBSTANTIVE_REGULATORY_CHANGE")
        admin_count = sum(1 for c in changes if c.final_change_type == "ADMINISTRATIVE_CHANGE")
        wording_count = sum(1 for c in changes if c.final_change_type == "WORDING_ONLY")
        added_count = sum(1 for c in changes if c.final_change_type == "ADDED")
        removed_count = sum(1 for c in changes if c.final_change_type == "REMOVED")
        unchanged_count = sum(1 for c in changes if c.final_change_type == "UNCHANGED")

        high_mat = sum(1 for c in changes if c.final_materiality == "HIGH")
        med_mat = sum(1 for c in changes if c.final_materiality == "MEDIUM")
        low_mat = sum(1 for c in changes if c.final_materiality == "LOW")

        modality_shifts = sum(1 for c in changes if "MODALITY" in (c.change_dimension or ""))
        monetary_shifts = sum(1 for c in changes if "MONETARY_VALUE" in (c.change_dimension or ""))
        percentage_shifts = sum(1 for c in changes if "PERCENTAGE" in (c.change_dimension or ""))
        duration_shifts = sum(1 for c in changes if "DURATION" in (c.change_dimension or ""))
        deadline_shifts = sum(1 for c in changes if "DEADLINE" in (c.change_dimension or ""))
        date_shifts = sum(1 for c in changes if "DATE" in (c.change_dimension or ""))

        analysis_id = f"analysis_{uuid.uuid4().hex[:12]}"

        overview = AnalysisOverview(
            analysis_id=analysis_id,
            previous_document_id=previous_document_id,
            current_document_id=current_document_id,
            previous_document_title=p_title,
            current_document_title=c_title,
            total_records=len(changes),
            substantive_changes=substantive_count,
            administrative_changes=admin_count,
            wording_only=wording_count,
            added_candidates=added_count,
            removed_candidates=removed_count,
            unchanged=unchanged_count,
            high_materiality=high_mat,
            medium_materiality=med_mat,
            low_materiality=low_mat,
            modality_changes=modality_shifts,
            monetary_changes=monetary_shifts,
            percentage_changes=percentage_shifts,
            duration_changes=duration_shifts,
            deadline_changes=deadline_shifts,
            date_changes=date_shifts,
            methodology_notes={
                "alignment_engine": "Hybrid (Provision Identity + TF-IDF Lexical + Semantic Token Alignment)",
                "materiality_scoring": "Deterministic explainable parameter impact assessment",
                "deontic_modality": "Linguistic modal auxiliary extraction with strength shift calibration",
            },
        )

        # Register in store
        self._analysis_store[analysis_id] = {
            "analysis_id": analysis_id,
            "overview": overview,
            "changes": changes,
            "previous_clauses": {c.clause_id: c for c in prev_clauses},
            "current_clauses": {c.clause_id: c for c in curr_clauses},
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        return analysis_id, overview, changes

    def _hydrate_from_db_if_needed(self, analysis_id: str) -> None:
        """Hydrate analysis from SQLite if not present in memory."""
        clean_id = analysis_id.strip()
        if clean_id in self._analysis_store:
            return

        try:
            from app.core.database import SessionLocal
            from app.models.analysis import AnalysisRecord
            db = SessionLocal()
            try:
                rec = db.query(AnalysisRecord).filter(AnalysisRecord.id == clean_id).first()
                if rec and rec.overview_summary:
                    # Reconstruct AnalysisOverview
                    ov_data = rec.overview_summary
                    overview = AnalysisOverview(
                        analysis_id=rec.id,
                        previous_document_id=rec.previous_document_id or ov_data.get("previous_document_id", "prev_doc"),
                        current_document_id=rec.current_document_id or ov_data.get("current_document_id", "curr_doc"),
                        previous_document_title=rec.previous_document_title or ov_data.get("previous_document_title", "Previous Document"),
                        current_document_title=rec.current_document_title or ov_data.get("current_document_title", "Current Document"),
                        total_records=ov_data.get("total_records", 0),
                        substantive_changes=ov_data.get("substantive_changes", 0),
                        administrative_changes=ov_data.get("administrative_changes", 0),
                        wording_only=ov_data.get("wording_only", 0),
                        added_candidates=ov_data.get("added_candidates", 0),
                        removed_candidates=ov_data.get("removed_candidates", 0),
                        unchanged=ov_data.get("unchanged", 0),
                        high_materiality=ov_data.get("high_materiality", 0),
                        medium_materiality=ov_data.get("medium_materiality", 0),
                        low_materiality=ov_data.get("low_materiality", 0),
                        modality_changes=ov_data.get("modality_changes", 0),
                        monetary_changes=ov_data.get("monetary_changes", 0),
                        percentage_changes=ov_data.get("percentage_changes", 0),
                        duration_changes=ov_data.get("duration_changes", 0),
                        deadline_changes=ov_data.get("deadline_changes", 0),
                        date_changes=ov_data.get("date_changes", 0),
                        methodology_notes=ov_data.get("methodology_notes", {
                            "alignment_engine": "Hybrid (Provision Identity + TF-IDF Lexical + Semantic Token Alignment)",
                            "materiality_scoring": "Deterministic explainable parameter impact assessment",
                        }),
                    )


                    changes_list = []
                    raw_changes = rec.changes_data
                    if isinstance(raw_changes, list):
                        for c_dict in raw_changes:
                            if isinstance(c_dict, dict):
                                try:
                                    changes_list.append(ChangeRecord(**c_dict))
                                except Exception:
                                    pass

                    self._analysis_store[clean_id] = {
                        "analysis_id": clean_id,
                        "overview": overview,
                        "changes": changes_list,
                        "previous_clauses": {},
                        "current_clauses": {},
                        "created_at": rec.created_at.isoformat() if rec.created_at else None,
                    }
            finally:
                db.close()
        except Exception as e:
            print(f"[DynamicComparisonService] Hydration warning: {e}")

    def get_analysis_overview(self, analysis_id: str) -> Optional[AnalysisOverview]:
        """Retrieve overview for a dynamic analysis job."""
        self._hydrate_from_db_if_needed(analysis_id)
        rec = self._analysis_store.get(analysis_id.strip())
        return rec["overview"] if rec else None

    def get_analysis_changes(
        self,
        analysis_id: str,
        change_type: Optional[str] = None,
        category: Optional[str] = None,
        materiality: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[ChangeRecord], int]:
        """Query and paginate changes for a dynamic analysis job."""
        self._hydrate_from_db_if_needed(analysis_id)
        rec = self._analysis_store.get(analysis_id.strip())
        if not rec:
            return [], 0

        changes: List[ChangeRecord] = rec["changes"]

        if change_type and change_type.strip() and change_type.strip().lower() != "all":
            ctype = change_type.strip().upper()
            changes = [c for c in changes if c.final_change_type == ctype or c.change_type == ctype]

        if category and category.strip() and category.strip().lower() != "all":
            cat = category.strip().upper()
            changes = [c for c in changes if c.final_category == cat]

        if materiality and materiality.strip() and materiality.strip().lower() != "all":
            mat = materiality.strip().upper()
            changes = [c for c in changes if c.final_materiality == mat or c.materiality == mat]

        total = len(changes)
        paginated = changes[offset : offset + limit]
        return paginated, total

    def get_analysis_change(self, analysis_id: str, change_id: str) -> Optional[ChangeRecord]:
        """Retrieve single change record by change_id."""
        self._hydrate_from_db_if_needed(analysis_id)
        rec = self._analysis_store.get(analysis_id.strip())
        if not rec:
            return None
        for c in rec["changes"]:
            if c.change_id == change_id.strip():
                return c
        return None

    def get_analysis_clause(
        self, analysis_id: str, version: str, clause_id: str
    ) -> Optional[ClauseDetail]:
        """Retrieve individual clause detail for a dynamic analysis."""
        rec = self._analysis_store.get(analysis_id.strip())
        if not rec:
            return None

        clean_ver = version.strip().lower()
        clean_cid = clause_id.strip()

        if "2020" in clean_ver or "prev" in clean_ver or "old" in clean_ver or "baseline" in clean_ver:
            clause_obj: Optional[DynamicClauseNLP] = rec["previous_clauses"].get(clean_cid)
        else:
            clause_obj: Optional[DynamicClauseNLP] = rec["current_clauses"].get(clean_cid)

        if not clause_obj:
            return None

        return ClauseDetail(
            version=version,
            clause_id=clause_obj.clause_id,
            page=clause_obj.source_page,
            provision_id=clause_obj.provision_id,
            section_level=clause_obj.section_level,
            content_mode="MAIN",
            clause_text=clause_obj.clause_text,
            char_length=clause_obj.character_count,
            word_count=clause_obj.word_count,
        )
