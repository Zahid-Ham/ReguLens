"""Groq AI Advisory Insights Service.

Generates evidence-grounded executive summaries, prioritized compliance gap explanations,
actionable policy remediation recommendations, and key regulatory change insights
using the configured Groq LLM model.

Architectural Guarantees:
1. Deterministic NLP remains authoritative for compliance status, materiality, gap detection,
   and extracted parameters.
2. Groq acts purely as an advisory synthesis layer.
3. Fallback synthesis is fully functional even if Groq is unavailable or key is missing.
4. Single-batch generation to minimize API latency and token cost.
"""

from datetime import datetime, timezone
import json
import os
from typing import Any, Dict, List, Optional
import httpx

from app.schemas.ai_insights import (
    AnalysisInsightsResponse,
    ExecutiveComplianceSummary,
    PolicyRecommendation,
    RegulatoryChangeInsight,
    TopComplianceGapInsight,
)


class EvidencePackageBuilder:
    """Builds clean, deterministic, grounded evidence packages for LLM advisory synthesis."""

    @staticmethod
    def select_top_compliance_gaps(
        mappings: List[Dict[str, Any]],
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        """Deterministically filter and rank top compliance gaps."""
        gaps = [
            m for m in mappings
            if m.get("compliance_status") in ("NON_COMPLIANT", "PARTIAL_MATCH")
        ]

        def gap_sort_key(item: Dict[str, Any]):
            status_weight = 0 if item.get("compliance_status") == "NON_COMPLIANT" else 1
            sev = (item.get("gap_severity") or "LOW").upper()
            sev_weight = 0 if sev == "HIGH" else (1 if sev == "MEDIUM" else 2)
            has_mismatch = 0 if item.get("parameter_mismatches") else 1
            return (status_weight, sev_weight, has_mismatch)

        gaps.sort(key=gap_sort_key)
        return gaps[:limit]

    @staticmethod
    def select_key_changes(
        changes: List[Dict[str, Any]],
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        """Deterministically filter and rank top high-materiality regulatory changes."""
        def change_sort_key(item: Dict[str, Any]):
            mat = (item.get("materiality") or "LOW").upper()
            mat_weight = 0 if mat == "HIGH" else (1 if mat == "MEDIUM" else 2)
            ctype = (item.get("change_type") or "").upper()
            type_weight = 0 if "SUBSTANTIVE" in ctype else (
                1 if "ADDED" in ctype else (2 if "REMOVED" in ctype else 3)
            )
            return (mat_weight, type_weight)

        sorted_changes = sorted(changes, key=change_sort_key)
        return sorted_changes[:limit]

    @classmethod
    def build_evidence_package(
        cls,
        analysis_id: str,
        title: str,
        overview_summary: Dict[str, Any],
        policy_summary: Optional[Dict[str, Any]],
        changes: List[Dict[str, Any]],
        mappings: List[Dict[str, Any]],
        has_policy: bool,
    ) -> Dict[str, Any]:
        """Construct structured evidence payload containing only authoritative deterministic fields."""
        top_gaps = cls.select_top_compliance_gaps(mappings, limit=5) if has_policy else []
        top_changes = cls.select_key_changes(changes, limit=5)

        # Build clean minimal representations
        gap_evidence = []
        for idx, g in enumerate(top_gaps, start=1):
            reg_req = g.get("regulatory_requirement", {}) or {}
            pol_req = g.get("matched_policy_requirement") or {}
            reg_ev = g.get("regulatory_evidence", {}) or {}
            pol_ev = g.get("policy_evidence") or {}

            gap_evidence.append({
                "priority_rank": idx,
                "provision_id": reg_req.get("provision_id", "General"),
                "clause_id": reg_req.get("clause_id"),
                "title": reg_req.get("title") or g.get("gap_details", "Compliance Gap"),
                "gap_type": g.get("gap_type", "MISMATCH"),
                "compliance_status": g.get("compliance_status", "NON_COMPLIANT"),
                "gap_severity": g.get("gap_severity", "HIGH"),
                "gap_details": g.get("gap_details", ""),
                "parameter_mismatches": g.get("parameter_mismatches", []),
                "matched_policy_section": pol_req.get("section_id") if pol_req else "Uncovered Requirement",
                "matched_policy_clause_id": pol_req.get("clause_id") if pol_req else None,
                "regulatory_snippet": (reg_ev.get("clause_text") or "")[:220],
                "policy_snippet": (pol_ev.get("clause_text") or "No matching internal policy provision.")[:220] if pol_ev else "No matching internal policy provision.",
                "evidence_id": g.get("mapping_id", f"map-{idx}"),
            })

        change_evidence = []
        for c in top_changes:
            change_evidence.append({
                "change_id": c.get("change_id") or c.get("id"),
                "provision_id": c.get("provision_id") or c.get("clause_id", "General"),
                "title": c.get("title") or c.get("headline") or "Regulatory Requirement Revision",
                "change_type": c.get("change_type", "Substantive"),
                "materiality": c.get("materiality", "High"),
                "dimension": c.get("dimension") or c.get("change_dimension", "obligation"),
                "old_clause_id": c.get("old_clause_id"),
                "new_clause_id": c.get("new_clause_id"),
                "old_value": c.get("old_value") or c.get("previous_value"),
                "new_value": c.get("new_value") or c.get("current_value"),
                "summary": c.get("summary") or c.get("description", ""),
            })

        return {
            "analysis_id": analysis_id,
            "analysis_title": title,
            "has_policy": has_policy,
            "overview_metrics": {
                "total_changes": overview_summary.get("total_records", len(changes)),
                "substantive_changes": overview_summary.get("substantive_changes", 0),
                "administrative_changes": overview_summary.get("administrative_changes", 0),
                "wording_changes": overview_summary.get("wording_only", 0),
                "added_candidates": overview_summary.get("added_candidates", 0),
                "removed_candidates": overview_summary.get("removed_candidates", 0),
                "high_materiality": overview_summary.get("high_materiality", 0),
            },
            "policy_metrics": {
                "coverage_pct": policy_summary.get("policy_coverage_pct", 0) if policy_summary else 0,
                "compliant_count": policy_summary.get("compliant_count", 0) if policy_summary else 0,
                "partial_match_count": policy_summary.get("partial_match_count", 0) if policy_summary else 0,
                "non_compliant_count": policy_summary.get("non_compliant_count", 0) if policy_summary else 0,
                "total_gaps": (policy_summary.get("non_compliant_count", 0) + policy_summary.get("partial_match_count", 0)) if policy_summary else 0,
            } if has_policy else {},
            "top_gaps": gap_evidence,
            "key_changes": change_evidence,
        }


class GroqInsightsService:
    """Service to generate evidence-grounded advisory insights via Groq API or deterministic fallback."""

    GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

    def __init__(self) -> None:
        self.api_key = os.getenv("GROQ_API_KEY", "").strip()
        self.model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b").strip()

    @property
    def is_available(self) -> bool:
        """Check if a non-empty Groq API key is configured."""
        return bool(self.api_key)

    def _build_deterministic_fallback(
        self,
        evidence: Dict[str, Any],
        is_groq_error: bool = False,
    ) -> AnalysisInsightsResponse:
        """Construct grounded advisory response deterministically without LLM calls."""
        overview = evidence["overview_metrics"]
        pol_metrics = evidence.get("policy_metrics", {})
        has_policy = evidence.get("has_policy", False)

        sub_cnt = overview.get("substantive_changes", 0)
        tot_cnt = overview.get("total_changes", 0)

        # Build fallback executive summary
        focus_areas = ["Mandatory Scope Alignment", "Review & Monitoring Cycles", "Reporting Deadlines"]
        if has_policy:
            gaps_cnt = pol_metrics.get("non_compliant_count", 0)
            partials_cnt = pol_metrics.get("partial_match_count", 0)
            cov = pol_metrics.get("coverage_pct", 0)
            summary_text = (
                f"ReguLens identified {sub_cnt} substantive regulatory modifications across {tot_cnt} total changes. "
                f"{gaps_cnt} potential compliance gaps and {partials_cnt} partial matches were detected across internal company policies, "
                f"achieving {cov}% overall regulatory coverage. Highest-priority remediation involves review frequencies, mandatory verification, and reporting timelines."
            )
            exec_summary = ExecutiveComplianceSummary(
                summary_text=summary_text,
                key_focus_areas=focus_areas,
                policy_coverage_pct=cov,
                substantive_changes_count=sub_cnt,
                potential_gaps_count=gaps_cnt,
                partial_matches_count=partials_cnt,
                compliant_count=pol_metrics.get("compliant_count", 0),
            )
        else:
            summary_text = (
                f"ReguLens identified {sub_cnt} substantive regulatory modifications across {tot_cnt} total changes. "
                f"{overview.get('added_candidates', 0)} added candidate provisions and {overview.get('removed_candidates', 0)} candidate withdrawals require operational impact assessment. "
                "Map an internal company policy to unlock automated compliance gap detection and tailored remediation recommendations."
            )
            exec_summary = ExecutiveComplianceSummary(
                summary_text=summary_text,
                key_focus_areas=["Regulatory Scope Revisions", "New Compliance Obligations", "Candidate Additions"],
                policy_coverage_pct=None,
                substantive_changes_count=sub_cnt,
                potential_gaps_count=0,
                partial_matches_count=0,
                compliant_count=0,
            )

        # Build fallback top gaps
        top_gaps: List[TopComplianceGapInsight] = []
        recommendations: List[PolicyRecommendation] = []
        for g in evidence.get("top_gaps", []):
            prov = g["provision_id"]
            title = g["title"]
            gap_type = g["gap_type"]
            sev = g["gap_severity"]
            status = g["compliance_status"]
            sec = g["matched_policy_section"]
            det = g.get("gap_details", "")
            diff = det if det else f"Policy provision ({sec}) deviates from revised regulatory mandate."

            explanation = (
                f"Company policy provision '{sec}' exhibits a {gap_type.lower().replace('_', ' ')} against Provision {prov}: {det}"
            )
            remediation = f"Update internal policy section '{sec}' to align mandatory obligations with Provision {prov}."

            top_gaps.append(
                TopComplianceGapInsight(
                    priority_rank=g["priority_rank"],
                    provision_id=str(prov),
                    clause_id=g.get("clause_id"),
                    gap_type=gap_type,
                    severity=sev,
                    explanation=explanation,
                    matched_policy_section=sec,
                    matched_policy_clause_id=g.get("matched_policy_clause_id"),
                    remediation_hint=remediation,
                    evidence_id=g.get("evidence_id"),
                    regulatory_text_snippet=g.get("regulatory_snippet"),
                    policy_text_snippet=g.get("policy_snippet"),
                    difference_summary=diff,
                    compliance_status=status,
                )
            )

            cat = "update_review_frequency" if "DURATION" in gap_type or "frequency" in det.lower() else (
                "update_reporting_deadline" if "DEADLINE" in gap_type or "timeline" in det.lower() else (
                    "update_monetary_threshold" if "THRESHOLD" in gap_type or "monetary" in det.lower() else "update_policy_wording"
                )
            )
            recommendations.append(
                PolicyRecommendation(
                    id=f"rec-{g['priority_rank']}",
                    priority=sev.capitalize(),
                    category=cat,
                    affected_policy_clause=sec,
                    target_provision_id=str(prov),
                    recommendation=remediation,
                    reason=f"Mandatory requirement under Provision {prov} ({title}). {diff}",
                    action_state="pending_review",
                )
            )

        # Build fallback regulatory change insights
        key_changes: List[RegulatoryChangeInsight] = []
        for c in evidence.get("key_changes", []):
            cid = str(c.get("change_id") or "chg")
            prov = str(c.get("provision_id") or "General")
            title = c.get("title", "Regulatory Revision")
            ctype = c.get("change_type", "Substantive")
            mat = c.get("materiality", "High")
            dim = c.get("dimension", "obligation")
            old_v = c.get("old_value")
            new_v = c.get("new_value")
            val_text = f" from '{old_v}' to '{new_v}'" if old_v and new_v else ""

            explanation = f"Provision {prov} introduces a {ctype.lower()} modification in {dim}{val_text}. {c.get('summary', '')}"

            key_changes.append(
                RegulatoryChangeInsight(
                    change_id=cid,
                    provision_id=prov,
                    title=title,
                    change_type=ctype,
                    materiality=mat,
                    change_dimension=dim,
                    old_value=old_v,
                    new_value=new_v,
                    explanation=explanation,
                    impact_summary=f"Requires compliance verification and review against operational controls.",
                    old_clause_id=c.get("old_clause_id"),
                    new_clause_id=c.get("new_clause_id"),
                )
            )

        status_code = "available" if not is_groq_error else "unavailable"
        err_msg = "Groq API key not configured. Displaying deterministic advisory intelligence." if not self.is_available else (
            "Groq API call encountered an error. Falling back to deterministic advisory intelligence." if is_groq_error else None
        )

        return AnalysisInsightsResponse(
            analysis_id=evidence["analysis_id"],
            status=status_code,
            is_advisory=True,
            disclaimer="Deterministic NLP remains the source of truth. Advisory insights are generated strictly from verified comparison evidence.",
            model="deterministic-rules-engine" if not self.is_available or is_groq_error else self.model,
            created_at=datetime.now(timezone.utc).isoformat(),
            has_policy=has_policy,
            executive_summary=exec_summary,
            top_gaps=top_gaps,
            policy_recommendations=recommendations,
            key_regulatory_changes=key_changes,
            metrics={
                **overview,
                **(pol_metrics if has_policy else {}),
            },
            error_message=err_msg,
        )

    async def generate_advisory_insights(
        self,
        analysis_id: str,
        title: str,
        overview_summary: Dict[str, Any],
        policy_summary: Optional[Dict[str, Any]],
        changes: List[Dict[str, Any]],
        mappings: List[Dict[str, Any]],
        has_policy: bool,
    ) -> AnalysisInsightsResponse:
        """Generate comprehensive advisory insights package using Groq with structured JSON output."""
        evidence = EvidencePackageBuilder.build_evidence_package(
            analysis_id=analysis_id,
            title=title,
            overview_summary=overview_summary,
            policy_summary=policy_summary,
            changes=changes,
            mappings=mappings,
            has_policy=has_policy,
        )

        if not self.is_available:
            return self._build_deterministic_fallback(evidence, is_groq_error=False)

        # Construct single structured LLM prompt
        system_prompt = (
            "You are ReguLens Advisory Intelligence, a specialized regulatory compliance co-pilot. "
            "Your role is strictly ADVISORY. Deterministic NLP evidence has already been computed and is authoritative.\n\n"
            "RULES:\n"
            "1. Ground all statements ONLY in the provided JSON evidence.\n"
            "2. DO NOT alter, override, or disagree with any deterministic compliance status (NON_COMPLIANT, PARTIAL_MATCH, COMPLIANT).\n"
            "3. DO NOT invent citations, clause IDs, numbers, deadlines, or monetary thresholds.\n"
            "4. If no policy is provided, state clearly that policy recommendations require policy mapping.\n"
            "5. Return valid JSON adhering exactly to the requested output structure.\n"
            "6. Use professional, minimal, executive-ready language (e.g., 'Potential Compliance Gap' rather than 'Violation')."
        )

        user_prompt = (
            f"Here is the authoritative deterministic analysis evidence:\n"
            f"{json.dumps(evidence, indent=2)}\n\n"
            "Synthesize an advisory briefing in JSON format with the following schema:\n"
            "{\n"
            '  "executive_summary": {\n'
            '    "summary_text": "2-3 concise sentences explaining the comparison findings, gap count, and top impact areas.",\n'
            '    "key_focus_areas": ["Area 1", "Area 2", "Area 3"]\n'
            "  },\n"
            '  "gap_explanations": [\n'
            '    {\n'
            '      "priority_rank": 1,\n'
            '      "explanation": "Clear explanation of the mismatch based on evidence.",\n'
            '      "remediation_hint": "Actionable policy update guidance."\n'
            '    }\n'
            "  ],\n"
            '  "policy_recommendations": [\n'
            '    {\n'
            '      "priority": "High | Medium | Low",\n'
            '      "category": "update_review_frequency | update_reporting_deadline | update_monetary_threshold | update_policy_wording | operational_procedure",\n'
            '      "affected_policy_clause": "Actual section from evidence",\n'
            '      "target_provision_id": "Actual provision from evidence",\n'
            '      "recommendation": "Concrete policy wording or procedure revision.",\n'
            '      "reason": "Why this change is required by the revised regulation."\n'
            '    }\n'
            "  ],\n"
            '  "change_explanations": [\n'
            '    {\n'
            '      "change_id": "Actual ID from evidence",\n'
            '      "explanation": "Concise explanation of what changed in the regulation and why it matters.",\n'
            '      "impact_summary": "Summary of operational or compliance impact."\n'
            '    }\n'
            "  ]\n"
            "}"
        )

        try:
            import time
            start_t = time.time()
            print(f"[GroqInsightsService] Initiating Groq AI Advisory synthesis for '{analysis_id}' using model '{self.model}'...")
            
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(
                    self.GROQ_API_URL,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        "response_format": {"type": "json_object"},
                        "temperature": 0.15,
                        "max_tokens": 1200,
                    },
                )

                elapsed = round(time.time() - start_t, 2)
                if res.status_code == 200:
                    data = res.json()
                    content_str = data["choices"][0]["message"]["content"].strip()
                    parsed = json.loads(content_str)
                    print(f"[GroqInsightsService] Groq API response received (200 OK in {elapsed}s). Synthesizing structured output.")
                    return self._hydrate_and_validate_insights(evidence, parsed)
                else:
                    print(f"[GroqInsightsService] Groq API returned status {res.status_code}: {res.text}")
                    return self._build_deterministic_fallback(evidence, is_groq_error=True)

        except Exception as e:
            print(f"[GroqInsightsService] Groq API exception: {e}")
            return self._build_deterministic_fallback(evidence, is_groq_error=True)

    def _hydrate_and_validate_insights(
        self,
        evidence: Dict[str, Any],
        llm_output: Dict[str, Any],
    ) -> AnalysisInsightsResponse:
        """Merge LLM natural language advisory synthesis with authoritative deterministic evidence."""
        overview = evidence["overview_metrics"]
        pol_metrics = evidence.get("policy_metrics", {})
        has_policy = evidence.get("has_policy", False)

        top_gaps_evidence = evidence.get("top_gaps", [])
        computed_non_compliant = len([g for g in top_gaps_evidence if g.get("compliance_status") == "NON_COMPLIANT"])
        computed_partial = len([g for g in top_gaps_evidence if g.get("compliance_status") == "PARTIAL_MATCH"])
        
        gaps_cnt = pol_metrics.get("non_compliant_count") or computed_non_compliant or len(top_gaps_evidence)
        partial_cnt = pol_metrics.get("partial_match_count") or computed_partial
        compliant_cnt = pol_metrics.get("compliant_count") or (overview.get("total_changes", 0) - gaps_cnt - partial_cnt if has_policy else 0)
        coverage_pct = pol_metrics.get("coverage_pct") or (round(max(0, min(100, (compliant_cnt / max(1, overview.get("total_changes", 1))) * 100))) if has_policy else None)

        # 1. Executive Summary
        exec_raw = llm_output.get("executive_summary", {})
        summary_text = exec_raw.get("summary_text") or (
            f"ReguLens identified {overview.get('substantive_changes', 0)} substantive regulatory modifications. "
            f"Advisory recommendations highlight key alignment priorities across reporting deadlines and mandatory requirements."
        )
        focus_areas = exec_raw.get("key_focus_areas") or ["Reporting Timelines", "Mandatory Obligations", "Review Frequencies"]

        exec_summary = ExecutiveComplianceSummary(
            summary_text=summary_text,
            key_focus_areas=focus_areas,
            policy_coverage_pct=coverage_pct if has_policy else None,
            substantive_changes_count=overview.get("substantive_changes", 0),
            potential_gaps_count=gaps_cnt if has_policy else 0,
            partial_matches_count=partial_cnt if has_policy else 0,
            compliant_count=compliant_cnt if has_policy else 0,
        )

        # 2. Top Gaps Map
        llm_gap_map = {
            g.get("priority_rank"): g
            for g in llm_output.get("gap_explanations", [])
            if isinstance(g, dict) and "priority_rank" in g
        }

        top_gaps: List[TopComplianceGapInsight] = []
        for g_ev in evidence.get("top_gaps", []):
            rank = g_ev["priority_rank"]
            llm_g = llm_gap_map.get(rank, {})
            det = g_ev.get("gap_details", "")
            sec = g_ev["matched_policy_section"]
            prov = g_ev["provision_id"]

            explanation = llm_g.get("explanation") or f"Policy section '{sec}' exhibits a constraint difference against Provision {prov}: {det}"
            remediation = llm_g.get("remediation_hint") or f"Align policy section '{sec}' with revised Provision {prov} mandates."

            top_gaps.append(
                TopComplianceGapInsight(
                    priority_rank=rank,
                    provision_id=str(prov),
                    clause_id=g_ev.get("clause_id"),
                    gap_type=g_ev["gap_type"],
                    severity=g_ev["gap_severity"],
                    explanation=explanation,
                    matched_policy_section=sec,
                    matched_policy_clause_id=g_ev.get("matched_policy_clause_id"),
                    remediation_hint=remediation,
                    evidence_id=g_ev.get("evidence_id"),
                    regulatory_text_snippet=g_ev.get("regulatory_snippet"),
                    policy_text_snippet=g_ev.get("policy_snippet"),
                    difference_summary=det,
                    compliance_status=g_ev["compliance_status"],
                )
            )

        # 3. Policy Recommendations
        recommendations: List[PolicyRecommendation] = []
        raw_recs = llm_output.get("policy_recommendations", [])
        if raw_recs and isinstance(raw_recs, list) and has_policy:
            for idx, r in enumerate(raw_recs, start=1):
                if not isinstance(r, dict):
                    continue
                recommendations.append(
                    PolicyRecommendation(
                        id=f"rec-{idx}",
                        priority=r.get("priority") or "High",
                        category=r.get("category") or "update_policy_wording",
                        affected_policy_clause=r.get("affected_policy_clause") or "Mapped Internal Policy",
                        target_provision_id=r.get("target_provision_id"),
                        recommendation=r.get("recommendation") or "Review and update internal compliance procedures.",
                        reason=r.get("reason") or "Required to maintain alignment with revised regulatory provisions.",
                        action_state="pending_review",
                    )
                )
        elif has_policy:
            # Fallback recommendations from gaps
            for g in top_gaps:
                recommendations.append(
                    PolicyRecommendation(
                        id=f"rec-{g.priority_rank}",
                        priority=g.severity.capitalize(),
                        category="update_policy_wording",
                        affected_policy_clause=g.matched_policy_section or "Mapped Policy",
                        target_provision_id=g.provision_id,
                        recommendation=g.remediation_hint or "Update policy to reflect revised requirement.",
                        reason=g.difference_summary or "Deterministic constraint mismatch.",
                        action_state="pending_review",
                    )
                )

        # 4. Regulatory Changes Map
        llm_chg_map = {
            c.get("change_id"): c
            for c in llm_output.get("change_explanations", [])
            if isinstance(c, dict) and "change_id" in c
        }

        key_changes: List[RegulatoryChangeInsight] = []
        for c_ev in evidence.get("key_changes", []):
            cid = str(c_ev.get("change_id") or "chg")
            llm_c = llm_chg_map.get(cid, {})
            prov = str(c_ev.get("provision_id") or "General")
            ctype = c_ev.get("change_type", "Substantive")
            mat = c_ev.get("materiality", "High")
            dim = c_ev.get("dimension", "obligation")

            explanation = llm_c.get("explanation") or (
                f"Provision {prov} reflects a {ctype.lower()} modification in {dim}. {c_ev.get('summary', '')}"
            )
            impact = llm_c.get("impact_summary") or "Requires operational procedure verification."

            key_changes.append(
                RegulatoryChangeInsight(
                    change_id=cid,
                    provision_id=prov,
                    title=c_ev.get("title", "Regulatory Revision"),
                    change_type=ctype,
                    materiality=mat,
                    change_dimension=dim,
                    old_value=c_ev.get("old_value"),
                    new_value=c_ev.get("new_value"),
                    explanation=explanation,
                    impact_summary=impact,
                    old_clause_id=c_ev.get("old_clause_id"),
                    new_clause_id=c_ev.get("new_clause_id"),
                )
            )

        return AnalysisInsightsResponse(
            analysis_id=evidence["analysis_id"],
            status="available",
            is_advisory=True,
            disclaimer="Deterministic NLP remains the source of truth. Groq AI insights are strictly advisory recommendations.",
            model=self.model,
            created_at=datetime.now(timezone.utc).isoformat(),
            has_policy=has_policy,
            executive_summary=exec_summary,
            top_gaps=top_gaps,
            policy_recommendations=recommendations,
            key_regulatory_changes=key_changes,
            metrics={
                **overview,
                **(pol_metrics if has_policy else {}),
            },
            error_message=None,
        )
