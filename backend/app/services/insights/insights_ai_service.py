"""Groq AI Global Insights Advisory Service.

Synthesizes evidence-grounded global executive regulatory briefs across multiple analyses
using Groq LLM (default: openai/gpt-oss-120b), with 100% deterministic fallback.
"""

from datetime import datetime, timezone
import json
import os
from typing import Any, Dict, List, Optional
import httpx

from app.schemas.insights import AIRegulatoryBrief, ComplianceRiskArea, RegulatoryTheme


class InsightsAIService:
    """Service providing global AI regulatory intelligence briefs."""

    def __init__(self):
        self.api_key = os.environ.get("GROQ_API_KEY", "").strip()
        self.model = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b").strip()
        self.groq_url = "https://api.groq.com/openai/v1/chat/completions"

    async def generate_global_ai_brief(
        self,
        total_analyses: int,
        total_changes: int,
        potential_gaps: int,
        substantive_changes: int,
        policy_coverage_pct: float,
        top_risk_areas: List[ComplianceRiskArea],
        regulatory_themes: List[RegulatoryTheme],
    ) -> AIRegulatoryBrief:
        """Generate synthesized AI advisory brief across all analyses."""
        if total_analyses == 0:
            return AIRegulatoryBrief(
                summary_text="No regulatory intelligence yet. Run your first regulatory analysis to start building your Insights workspace.",
                key_observations=["Completed analyses will automatically populate global trends, risk matrices, and advisory intelligence."],
                is_advisory=True,
                model="deterministic-zero-state",
                generated_at=datetime.now(timezone.utc).isoformat(),
            )

        # 1. Attempt Groq AI synthesis if API key is present
        if self.api_key:
            try:
                brief = await self._call_groq_llm(
                    total_analyses=total_analyses,
                    total_changes=total_changes,
                    potential_gaps=potential_gaps,
                    substantive_changes=substantive_changes,
                    policy_coverage_pct=policy_coverage_pct,
                    top_risk_areas=top_risk_areas,
                    regulatory_themes=regulatory_themes,
                )
                if brief and brief.summary_text:
                    return brief
            except Exception as e:
                print(f"[InsightsAIService] Groq API call note ({e}); using deterministic fallback.")

        # 2. Deterministic Fallback
        return self._generate_deterministic_brief(
            total_analyses=total_analyses,
            total_changes=total_changes,
            potential_gaps=potential_gaps,
            substantive_changes=substantive_changes,
            policy_coverage_pct=policy_coverage_pct,
            top_risk_areas=top_risk_areas,
            regulatory_themes=regulatory_themes,
        )

    async def _call_groq_llm(
        self,
        total_analyses: int,
        total_changes: int,
        potential_gaps: int,
        substantive_changes: int,
        policy_coverage_pct: float,
        top_risk_areas: List[ComplianceRiskArea],
        regulatory_themes: List[RegulatoryTheme],
    ) -> Optional[AIRegulatoryBrief]:
        """Query Groq API for evidence-grounded summary."""
        top_risks_str = ", ".join([f"{r.risk_area} ({r.potential_gaps} gaps)" for r in top_risk_areas[:4]]) or "Customer Due Diligence, Reporting, and Risk Assessment"
        top_themes_str = ", ".join([t.theme for t in regulatory_themes[:4]]) or "Customer Due Diligence, Reporting, Verification"

        system_prompt = (
            "You are ReguLens Global AI Intelligence Advisor, an elite banking regulatory compliance analyst.\n"
            "Your task is to synthesize a high-level 2-3 sentence executive regulatory brief across multiple completed compliance analyses.\n\n"
            "STRICT RULES:\n"
            "1. Ground all observations strictly in the provided deterministic figures. Do not invent ungrounded facts or external citations.\n"
            "2. Keep the tone concise, strategic, executive, and advisory.\n"
            "3. Output MUST be valid JSON with keys: 'summary_text' (string) and 'key_observations' (list of 2-3 short strings).\n"
            "4. Do NOT wrap output in markdown codeblocks."
        )

        user_prompt = (
            f"Here is the aggregated compliance data across {total_analyses} analyses:\n"
            f"- Total Regulatory Changes: {total_changes}\n"
            f"- Substantive Changes: {substantive_changes}\n"
            f"- Potential Compliance Gaps: {potential_gaps}\n"
            f"- Overall Policy Coverage: {policy_coverage_pct}%\n"
            f"- Top Compliance Risk Areas: {top_risks_str}\n"
            f"- Frequent Regulatory Themes: {top_themes_str}\n\n"
            "Generate the executive advisory brief in JSON format."
        )

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.2,
            "max_tokens": 450,
            "response_format": {"type": "json_object"},
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }
            resp = await client.post(self.groq_url, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                summary_text = parsed.get("summary_text", "").strip()
                observations = parsed.get("key_observations", [])
                
                if summary_text:
                    return AIRegulatoryBrief(
                        summary_text=summary_text,
                        key_observations=observations if isinstance(observations, list) else [],
                        is_advisory=True,
                        disclaimer="These insights are AI-generated and should be used for guidance only. Deterministic analysis results remain the source of truth.",
                        model=self.model,
                        generated_at=datetime.now(timezone.utc).isoformat(),
                    )
        return None

    def _generate_deterministic_brief(
        self,
        total_analyses: int,
        total_changes: int,
        potential_gaps: int,
        substantive_changes: int,
        policy_coverage_pct: float,
        top_risk_areas: List[ComplianceRiskArea],
        regulatory_themes: List[RegulatoryTheme],
    ) -> AIRegulatoryBrief:
        """Deterministic high-quality fallback brief."""
        top_area_names = [a.risk_area for a in top_risk_areas[:3]]
        top_str = ", ".join(top_area_names) if top_area_names else "customer due diligence, reporting timelines, and digital verification"

        summary = (
            f"Across {total_analyses} analyses, we observe an increasing regulatory focus on {top_str} requirements. "
            f"Several policies show recurring gaps in review frequency and threshold-based controls, "
            f"indicating {substantive_changes} substantive modifications that require prioritized attention."
        )

        observations = [
            f"Detected {total_changes} aggregate regulatory modifications across completed analyses.",
            f"Identified {potential_gaps} potential compliance gaps requiring policy alignment.",
            f"Current global policy coverage rate stands at {policy_coverage_pct}%.",
        ]

        return AIRegulatoryBrief(
            summary_text=summary,
            key_observations=observations,
            is_advisory=True,
            disclaimer="These insights are AI-generated and should be used for guidance only. Deterministic analysis results remain the source of truth.",
            model="deterministic-grounded-fallback",
            generated_at=datetime.now(timezone.utc).isoformat(),
        )
