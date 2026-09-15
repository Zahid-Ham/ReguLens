"""Company Policy Mapping Service.

Performs structured semantic candidate retrieval, constraint comparison (duration, deadline,
monetary threshold, deontic modality), deterministic compliance status calculation, and
evidence citation extraction between regulatory requirements and company policies.
"""

import re
import uuid
from typing import Dict, List, Optional, Set, Tuple

import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.schemas.analysis import ChangeRecord
from app.schemas.dynamic_nlp import DynamicClauseNLP
from app.schemas.policy_mapping import (
    ComplianceGapHighlight,
    ParameterMismatch,
    PolicyEvidence,
    PolicyMappingRecord,
    PolicyMappingResponse,
    PolicyMappingSummary,
    PolicyRecommendationHighlight,
    PolicyRequirementItem,
    RegulatoryEvidence,
    RegulatoryRequirementItem,
)
from app.services.compliance.policy_nlp_service import PolicyNLPService


class PolicyMappingService:
    """Service to map regulatory requirements against company policy provisions."""

    def __init__(self, policy_nlp_service: Optional[PolicyNLPService] = None) -> None:
        self.policy_nlp_service = policy_nlp_service or PolicyNLPService()
        self._embedding_model: Optional[SentenceTransformer] = None
        self._analysis_policy_store: Dict[str, PolicyMappingResponse] = {}

    def _get_embedding_model(self) -> SentenceTransformer:
        """Lazy load sentence transformer."""
        if self._embedding_model is None:
            self._embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        return self._embedding_model

    def _normalize_duration_to_months(self, duration_str: Optional[str]) -> Optional[int]:
        """Convert duration string into integer months for strictness comparison."""
        if not duration_str:
            return None
        m = re.search(r"(\d+)\s*(month|year|day|week)s?", duration_str, re.IGNORECASE)
        if not m:
            return None
        val = int(m.group(1))
        unit = m.group(2).lower()
        if unit == "year":
            return val * 12
        if unit == "month":
            return val
        if unit == "day":
            return round(val / 30)
        if unit == "week":
            return round(val / 4.33)
        return None

    def _normalize_deadline_to_days(self, deadline_str: Optional[str]) -> Optional[int]:
        """Convert deadline string into integer days."""
        if not deadline_str:
            return None
        m = re.search(r"(\d+)\s*(day|hour|business\s+day|week|month)s?", deadline_str, re.IGNORECASE)
        if not m:
            return None
        val = int(m.group(1))
        unit = m.group(2).lower()
        if "hour" in unit:
            return max(1, round(val / 24))
        if "day" in unit:
            return val
        if "week" in unit:
            return val * 7
        if "month" in unit:
            return val * 30
        return None

    def _normalize_money(self, money_str: Optional[str]) -> Optional[int]:
        """Convert monetary string into integer Rupees."""
        if not money_str:
            return None
        # Remove currency prefixes like Rs., INR, ₹
        clean = re.sub(r"(?i)\b(?:rs\.?|inr|₹)\b|\b(?:rs\.)", "", money_str)
        clean = clean.replace(",", "").strip()
        m = re.search(r"(\d+(?:\.\d+)?)\s*(lakh|crore|thousand|k)?", clean, re.IGNORECASE)
        if not m:
            return None
        val = float(m.group(1))
        multiplier = m.group(2)
        if multiplier:
            mult_lower = multiplier.lower()
            if "lakh" in mult_lower:
                val *= 100000
            elif "crore" in mult_lower:
                val *= 10000000
            elif "thousand" in mult_lower or "k" in mult_lower:
                val *= 1000
        return int(val)

    def _get_modality_strength(self, modality_str: Optional[str]) -> int:
        """Return numeric obligation force score: 3 (Must/Shall), 2 (Should), 1 (May), -1 (Must not)."""
        if not modality_str:
            return 2
        m = modality_str.lower().strip()
        if "not" in m or "prohibit" in m or "forbidden" in m:
            return -1
        if m in ("shall", "must", "mandatory", "required", "will"):
            return 3
        if m in ("should", "recommended", "advised"):
            return 2
        if m in ("may", "permitted", "can", "optional", "discretionary"):
            return 1
        return 2

    def select_regulatory_requirements(
        self,
        current_document_id: str,
        current_clauses: List[DynamicClauseNLP],
        changes: Optional[List[ChangeRecord]] = None,
    ) -> List[RegulatoryRequirementItem]:
        """Select actual requirement-bearing clauses from current regulation."""
        items: List[RegulatoryRequirementItem] = []
        change_map = {}
        if changes:
            for c in changes:
                cid = c.new_clause_id or c.old_clause_id
                if cid:
                    change_map[cid] = c

        for idx, clause in enumerate(current_clauses):
            text = clause.clause_text.strip()
            # Filter out short metadata, dates, or non-requirement headings
            if len(text.split()) < 5:
                continue
            if re.match(r"^(?:page\s+\d+|published\s+on|\d{1,2}\s+[A-Za-z]+\s+\d{4})", text, re.IGNORECASE):
                continue

            func = clause.classification.label if clause.classification else "OBLIGATION"
            req = clause.requirement
            change = change_map.get(clause.clause_id)

            # Check if this is a requirement-bearing clause
            is_substantive_or_added = change and (
                change.final_category == "SUBSTANTIVE_REGULATORY_CHANGE" or
                change.final_change_type in ("MODIFIED", "ADDED")
            )
            has_explicit_obligation = func in ("OBLIGATION", "PROHIBITION", "REPORTING", "PROCEDURE")
            has_modal = bool(req and req.modality) or bool(
                re.search(r"\b(shall|must|required|prohibited|may not)\b", text, re.IGNORECASE)
            )

            if not (is_substantive_or_added or (has_explicit_obligation and has_modal)):
                continue

            change_type = change.final_change_type if change else "UNCHANGED"
            change_cat = change.final_category if change else None
            materiality = change.final_materiality if change else "LOW"

            duration = self.policy_nlp_service.extract_duration(text) or (req.duration if req else None)
            deadline = self.policy_nlp_service.extract_deadline(text) or (req.deadline if req else None)
            monetary = self.policy_nlp_service.extract_monetary_value(text)

            prov_id = clause.provision_id or (change.new_provision_id if change else None) or f"Provision {idx+1}"

            items.append(
                RegulatoryRequirementItem(
                    requirement_id=f"reg_req_{idx+1}",
                    document_id=current_document_id,
                    clause_id=clause.clause_id,
                    provision_id=prov_id,
                    clause_text=text,
                    change_type=change_type,
                    change_category=change_cat,
                    materiality=materiality,
                    regulatory_function=func,
                    subject=req.subject if req else None,
                    modality=req.modality if req else "shall",
                    action=req.action if req else None,
                    object=req.object if req else None,
                    deadline=deadline,
                    duration=duration,
                    monetary_value=monetary,
                    threshold=None,
                    condition=None,
                    entities=[e.text for e in clause.entities],
                )
            )

        return items

    def evaluate_compliance(
        self,
        reg_req: RegulatoryRequirementItem,
        pol_req: Optional[PolicyRequirementItem],
        similarity: float,
    ) -> Tuple[str, str, Optional[str], str, List[ParameterMismatch]]:
        """Evaluate deterministic compliance status, severity, gap type, gap description, and parameter mismatches."""
        if not pol_req or similarity < 0.32:
            return (
                "NO_MATCH_FOUND",
                "MEDIUM",
                "NO_MATCH_FOUND",
                "No relevant policy provision found covering this regulatory requirement.",
                [],
            )

        mismatches: List[ParameterMismatch] = []
        is_non_compliant = False
        is_partial = False

        r_text = reg_req.clause_text.lower()
        p_text = pol_req.policy_clause_text.lower()

        # 1. Duration / Review frequency / Retention comparison
        r_dur_months = self._normalize_duration_to_months(reg_req.duration or self.policy_nlp_service.extract_duration(reg_req.clause_text))
        p_dur_months = self._normalize_duration_to_months(pol_req.duration or self.policy_nlp_service.extract_duration(pol_req.policy_clause_text))

        if r_dur_months and p_dur_months:
            is_retention = "retention" in r_text or "retain" in r_text or "preserve" in r_text
            if is_retention:
                # Retention: policy must retain for at least as long as regulation
                if p_dur_months < r_dur_months:
                    is_non_compliant = True
                    mismatches.append(
                        ParameterMismatch(
                            dimension="DURATION",
                            regulatory_value=reg_req.duration or f"{r_dur_months} months",
                            policy_value=pol_req.duration or f"{p_dur_months} months",
                            description=f"Record retention period mismatch: {reg_req.duration or f'{r_dur_months} months'} vs {pol_req.duration or f'{p_dur_months} months'}.",
                            severity="HIGH",
                        )
                    )
            else:
                # Review frequency: review must happen at least as frequently (duration <= required)
                if p_dur_months > r_dur_months:
                    is_non_compliant = True
                    mismatches.append(
                        ParameterMismatch(
                            dimension="DURATION",
                            regulatory_value=reg_req.duration or f"{r_dur_months} months",
                            policy_value=pol_req.duration or f"{p_dur_months} months",
                            description=f"Review frequency mismatch: {reg_req.duration or f'{r_dur_months} months'} required vs {pol_req.duration or f'{p_dur_months} months'} in policy.",
                            severity="HIGH",
                        )
                    )

        # 2. Deadline comparison (e.g. reporting within 7 days vs 15 days)
        r_dead_days = self._normalize_deadline_to_days(reg_req.deadline or self.policy_nlp_service.extract_deadline(reg_req.clause_text))
        p_dead_days = self._normalize_deadline_to_days(pol_req.deadline or self.policy_nlp_service.extract_deadline(pol_req.policy_clause_text))

        if r_dead_days and p_dead_days and p_dead_days > r_dead_days:
            is_non_compliant = True
            mismatches.append(
                ParameterMismatch(
                    dimension="DEADLINE",
                    regulatory_value=reg_req.deadline or f"{r_dead_days} days",
                    policy_value=pol_req.deadline or f"{p_dead_days} days",
                    description=f"Reporting deadline mismatch: {reg_req.deadline or f'{r_dead_days} days'} vs {pol_req.deadline or f'{p_dead_days} days'}.",
                    severity="HIGH",
                )
            )

        # 3. Monetary threshold comparison (e.g. EDD threshold Rs. 5,00,000 vs 10,00,000)
        r_money = self._normalize_money(reg_req.monetary_value or self.policy_nlp_service.extract_monetary_value(reg_req.clause_text))
        p_money = self._normalize_money(pol_req.monetary_value or self.policy_nlp_service.extract_monetary_value(pol_req.policy_clause_text))

        if r_money and p_money and p_money > r_money:
            is_non_compliant = True
            mismatches.append(
                ParameterMismatch(
                    dimension="MONETARY_THRESHOLD",
                    regulatory_value=reg_req.monetary_value or f"Rs. {r_money:,}",
                    policy_value=pol_req.monetary_value or f"Rs. {p_money:,}",
                    description=f"Monetary threshold mismatch: {reg_req.monetary_value or f'Rs. {r_money:,}'} vs {pol_req.monetary_value or f'Rs. {p_money:,}'}.",
                    severity="HIGH",
                )
            )

        # 4. Modality obligation force check (shall vs may)
        r_strength = self._get_modality_strength(reg_req.modality)
        p_strength = self._get_modality_strength(pol_req.modality)

        if r_strength == 3 and p_strength == 1:
            is_non_compliant = True
            mismatches.append(
                ParameterMismatch(
                    dimension="MODALITY",
                    regulatory_value="shall / mandatory",
                    policy_value="may / discretionary",
                    description="Mandatory regulatory obligation reduced to discretionary permission in policy.",
                    severity="HIGH",
                )
            )
        elif r_strength == -1 and p_strength >= 1:
            is_non_compliant = True
            mismatches.append(
                ParameterMismatch(
                    dimension="MODALITY",
                    regulatory_value="must not / prohibited",
                    policy_value="permitted",
                    description="Regulatory prohibition is permitted under company policy.",
                    severity="HIGH",
                )
            )

        # 5. Specific operational elements (e.g. real-time monitoring vs periodic)
        if "real-time" in r_text or "real time" in r_text:
            if "real-time" not in p_text and "real time" not in p_text and ("periodic" in p_text or "risk basis" in p_text):
                is_partial = True
                mismatches.append(
                    ParameterMismatch(
                        dimension="MISSING_ELEMENT",
                        regulatory_value="real-time transaction monitoring",
                        policy_value="periodic monitoring",
                        description="Policy lacks explicit real-time transaction monitoring specification.",
                        severity="MEDIUM",
                    )
                )

        # Determine final status
        if is_non_compliant:
            status = "NON_COMPLIANT"
            severity = "HIGH"
            gap_type = mismatches[0].dimension + "_MISMATCH" if mismatches else "POLICY_GAP"
            gap_details = mismatches[0].description if mismatches else "Policy does not meet prescribed regulatory constraints."
        elif is_partial or (similarity < 0.48 and len(mismatches) == 0):
            status = "PARTIAL_MATCH"
            severity = "MEDIUM"
            gap_type = "PARTIAL_ALIGNMENT"
            gap_details = mismatches[0].description if mismatches else "Policy partially aligns with requirement; review recommended."
        else:
            status = "COMPLIANT"
            severity = "NONE"
            gap_type = None
            gap_details = "Fully aligned with policy provisions."

        return status, severity, gap_type, gap_details, mismatches

    def map_policy_to_regulations(
        self,
        analysis_id: str,
        current_document_id: str,
        current_document_title: str,
        current_clauses: List[DynamicClauseNLP],
        policy_document_id: Optional[str],
        policy_document_title: Optional[str],
        policy_clauses: List[DynamicClauseNLP],
        changes: Optional[List[ChangeRecord]] = None,
    ) -> PolicyMappingResponse:
        """Execute two-stage semantic alignment and structured compliance evaluation."""
        if not policy_document_id or not policy_clauses:
            # Empty response when no policy document is provided
            empty_summary = PolicyMappingSummary(
                total_regulatory_requirements=0,
                mapped_to_policy=0,
                coverage_percentage=0,
                policy_gaps=0,
                partial_matches=0,
                no_match_found=0,
                compliant_count=0,
                high_severity_gaps=0,
                top_gaps=[],
                top_recommendations=[],
                executive_summary="No company policy document was uploaded for compliance gap alignment.",
            )
            resp = PolicyMappingResponse(
                analysis_id=analysis_id,
                has_policy=False,
                policy_document_id=None,
                policy_document_title=None,
                summary=empty_summary,
                mappings=[],
            )
            self._analysis_policy_store[analysis_id] = resp
            return resp

        # 1. Select requirement-bearing regulatory items
        reg_requirements = self.select_regulatory_requirements(
            current_document_id=current_document_id,
            current_clauses=current_clauses,
            changes=changes,
        )

        # 2. Extract structured policy requirement items
        policy_requirements = self.policy_nlp_service.process_policy_clauses(
            document_id=policy_document_id,
            clauses=policy_clauses,
        )

        if not reg_requirements or not policy_requirements:
            empty_summary = PolicyMappingSummary(
                total_regulatory_requirements=len(reg_requirements),
                mapped_to_policy=0,
                coverage_percentage=0,
                policy_gaps=0,
                partial_matches=0,
                no_match_found=len(reg_requirements),
                compliant_count=0,
                high_severity_gaps=0,
                top_gaps=[],
                top_recommendations=[],
                executive_summary="Unable to extract requirements for policy comparison.",
            )
            resp = PolicyMappingResponse(
                analysis_id=analysis_id,
                has_policy=True,
                policy_document_id=policy_document_id,
                policy_document_title=policy_document_title,
                summary=empty_summary,
                mappings=[],
            )
            self._analysis_policy_store[analysis_id] = resp
            return resp

        # 3. Two-stage semantic candidate retrieval
        reg_texts = [r.clause_text for r in reg_requirements]
        pol_texts = [p.policy_clause_text for p in policy_requirements]

        embed_model = self._get_embedding_model()
        reg_embeddings = embed_model.encode(reg_texts, convert_to_numpy=True, normalize_embeddings=True)
        pol_embeddings = embed_model.encode(pol_texts, convert_to_numpy=True, normalize_embeddings=True)

        sem_sim_matrix = cosine_similarity(reg_embeddings, pol_embeddings)

        # TF-IDF matrix for lexical overlap
        tfidf_vec = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        combined_corpus = reg_texts + pol_texts
        try:
            tfidf_mat = tfidf_vec.fit_transform(combined_corpus)
            reg_tfidf = tfidf_mat[: len(reg_texts)]
            pol_tfidf = tfidf_mat[len(reg_texts) :]
            tfidf_sim_matrix = cosine_similarity(reg_tfidf, pol_tfidf)
        except Exception:
            tfidf_sim_matrix = np.zeros_like(sem_sim_matrix)

        mappings: List[PolicyMappingRecord] = []
        top_gaps: List[ComplianceGapHighlight] = []
        top_recs: List[PolicyRecommendationHighlight] = []

        compliant_count = 0
        gap_count = 0
        partial_count = 0
        no_match_count = 0

        for r_idx, reg_req in enumerate(reg_requirements):
            # Compute composite candidate retrieval score
            scores = []
            for p_idx, pol_req in enumerate(policy_requirements):
                s_score = float(sem_sim_matrix[r_idx, p_idx])
                t_score = float(tfidf_sim_matrix[r_idx, p_idx])

                # Check entity and keyword overlap
                r_ents = set(e.lower() for e in reg_req.entities)
                p_ents = set(e.lower() for e in pol_req.entities)
                ent_overlap = len(r_ents.intersection(p_ents)) * 0.08

                # Check provision reference overlap (e.g. "3.2" in policy section)
                prov_bonus = 0.0
                if reg_req.provision_id and pol_req.section_id:
                    clean_prov = re.sub(r"[^\d\.]", "", reg_req.provision_id)
                    clean_sec = re.sub(r"[^\d\.]", "", pol_req.section_id)
                    if clean_prov and clean_sec and clean_prov == clean_sec:
                        prov_bonus = 0.25

                composite = 0.55 * s_score + 0.25 * t_score + ent_overlap + prov_bonus
                scores.append((composite, s_score, p_idx))

            scores.sort(key=lambda x: -x[0])
            best_composite, best_sem, best_p_idx = scores[0]

            matched_policy = policy_requirements[best_p_idx] if best_composite >= 0.32 else None
            similarity_val = round(max(best_sem, best_composite * 0.9), 3) if matched_policy else 0.0

            # 4. Deterministic compliance evaluation
            status, severity, gap_type, gap_details, mismatches = self.evaluate_compliance(
                reg_req=reg_req,
                pol_req=matched_policy,
                similarity=similarity_val,
            )

            # Citations
            reg_evidence = RegulatoryEvidence(
                document_id=current_document_id,
                document_title=current_document_title,
                provision_id=reg_req.provision_id,
                clause_id=reg_req.clause_id,
                clause_text=reg_req.clause_text,
            )

            pol_evidence = (
                PolicyEvidence(
                    document_id=policy_document_id,
                    document_title=policy_document_title or "Company Policy",
                    section_id=matched_policy.section_id,
                    section_title=matched_policy.section_title,
                    clause_id=matched_policy.policy_clause_id,
                    clause_text=matched_policy.policy_clause_text,
                )
                if matched_policy
                else None
            )

            rec_item = PolicyMappingRecord(
                mapping_id=f"map_{uuid.uuid4().hex[:8]}",
                regulatory_requirement=reg_req,
                regulatory_evidence=reg_evidence,
                matched_policy_requirement=matched_policy,
                policy_evidence=pol_evidence,
                semantic_similarity=similarity_val,
                compliance_status=status,
                severity=severity,
                gap_type=gap_type,
                gap_details=gap_details,
                mismatches=mismatches,
                ai_explanation=None,
                ai_recommendation=None,
            )
            mappings.append(rec_item)

            if status == "COMPLIANT":
                compliant_count += 1
            elif status == "NON_COMPLIANT":
                gap_count += 1
                if len(top_gaps) < 5:
                    top_gaps.append(
                        ComplianceGapHighlight(
                            mapping_id=rec_item.mapping_id,
                            provision_id=reg_req.provision_id,
                            title=f"{reg_req.provision_id or 'Requirement'} — {gap_type.replace('_', ' ').title() if gap_type else 'Policy Gap'}",
                            severity=severity,
                            gap_type=gap_type or "POLICY_GAP",
                            description=gap_details,
                        )
                    )
                if len(top_recs) < 5:
                    top_recs.append(
                        PolicyRecommendationHighlight(
                            mapping_id=rec_item.mapping_id,
                            provision_id=reg_req.provision_id,
                            policy_section=matched_policy.section_id if matched_policy else "Internal Policy",
                            recommendation=f"Update {matched_policy.section_id or 'policy'} to align with {reg_req.provision_id or 'regulation'}: {gap_details}",
                        )
                    )
            elif status == "PARTIAL_MATCH":
                partial_count += 1
                if len(top_gaps) < 5:
                    top_gaps.append(
                        ComplianceGapHighlight(
                            mapping_id=rec_item.mapping_id,
                            provision_id=reg_req.provision_id,
                            title=f"{reg_req.provision_id or 'Requirement'} — Partial Alignment",
                            severity=severity,
                            gap_type="PARTIAL_ALIGNMENT",
                            description=gap_details,
                        )
                    )
            elif status == "NO_MATCH_FOUND":
                no_match_count += 1

        total_reqs = len(reg_requirements)
        mapped_count = compliant_count + gap_count + partial_count
        coverage_pct = round((mapped_count / total_reqs) * 100) if total_reqs > 0 else 0

        summary = PolicyMappingSummary(
            total_regulatory_requirements=total_reqs,
            mapped_to_policy=mapped_count,
            coverage_percentage=coverage_pct,
            policy_gaps=gap_count,
            partial_matches=partial_count,
            no_match_found=no_match_count,
            compliant_count=compliant_count,
            high_severity_gaps=sum(1 for m in mappings if m.severity == "HIGH"),
            top_gaps=top_gaps,
            top_recommendations=top_recs,
            executive_summary=(
                f"Evaluated {total_reqs} regulatory requirements against {policy_document_title or 'Company Policy'}. "
                f"Identified {gap_count} policy gaps requiring amendment and {partial_count} partial alignments."
            ),
        )

        response = PolicyMappingResponse(
            analysis_id=analysis_id,
            has_policy=True,
            policy_document_id=policy_document_id,
            policy_document_title=policy_document_title,
            summary=summary,
            mappings=mappings,
        )
        self._analysis_policy_store[analysis_id] = response
        return response

    def get_policy_mapping(self, analysis_id: str) -> Optional[PolicyMappingResponse]:
        """Retrieve stored policy mapping response for an analysis job."""
        return self._analysis_policy_store.get(analysis_id.strip())

    def get_policy_mapping_record(self, analysis_id: str, mapping_id: str) -> Optional[PolicyMappingRecord]:
        """Retrieve specific mapping record by ID."""
        resp = self.get_policy_mapping(analysis_id)
        if not resp:
            return None
        for m in resp.mappings:
            if m.mapping_id == mapping_id.strip():
                return m
        return None
