"""Groq Advisory Intelligence Service.

Provides optional advisory explanations and remediation recommendations using
the configured Groq LLM model. Operates strictly as an explanation/guidance layer
over pre-computed deterministic compliance evidence.
"""

import os
from typing import Any, Dict, List, Optional
import httpx

from app.schemas.policy_mapping import (
    ComplianceGapHighlight,
    PolicyMappingRecord,
    PolicyRecommendationHighlight,
)


class GroqService:
    """Service to generate advisory natural-language explanations and recommendations via Groq API."""

    GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

    def __init__(self) -> None:
        self.api_key = os.getenv("GROQ_API_KEY", "").strip()
        self.model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b").strip()

    @property
    def is_available(self) -> bool:
        """Check if Groq API key is present."""
        return bool(self.api_key)

    async def generate_top_insights(
        self,
        policy_title: str,
        total_requirements: int,
        policy_gaps: int,
        top_gaps: List[ComplianceGapHighlight],
    ) -> tuple[Optional[str], List[PolicyRecommendationHighlight]]:
        """Generate executive narrative summary and top recommendations for the insights panel."""
        if not self.is_available or not top_gaps:
            return None, []

        prompt_gaps = "\n".join(
            [
                f"- Provision {g.provision_id or 'General'}: {g.title} ({g.gap_type}) - {g.description}"
                for g in top_gaps[:5]
            ]
        )

        system_msg = (
            "You are a regulatory compliance advisor analyzing an organization's internal policy alignment "
            "against RBI regulatory requirements. Generate a concise, 2-sentence executive summary and "
            "actionable policy update recommendations for the top gaps provided. Be precise, professional, "
            "and strictly evidence-grounded. Do not invent regulations or numbers."
        )

        user_msg = (
            f"Company Policy: {policy_title}\n"
            f"Total Requirements: {total_requirements}\n"
            f"Detected Compliance Gaps: {policy_gaps}\n\n"
            f"Top Gaps:\n{prompt_gaps}\n\n"
            "Provide:\n"
            "1. Executive Summary (2 sentences max)\n"
            "2. Recommendations (one concise bullet per gap)"
        )

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(
                    self.GROQ_API_URL,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_msg},
                            {"role": "user", "content": user_msg},
                        ],
                        "temperature": 0.2,
                        "max_tokens": 500,
                    },
                )
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    # Split or extract summary
                    return content.strip(), []
        except Exception:
            pass

        return None, []

    async def generate_mapping_explanation(
        self,
        record: PolicyMappingRecord,
    ) -> tuple[Optional[str], Optional[str]]:
        """Generate natural language explanation and specific remediation guidance for a single mapping record."""
        if not self.is_available:
            return None, None

        reg_text = record.regulatory_evidence.clause_text
        pol_text = record.policy_evidence.clause_text if record.policy_evidence else "No matching policy found"
        status = record.compliance_status
        gap = record.gap_details

        system_msg = (
            "You are an expert regulatory compliance analyst. Explain why the internal company policy is "
            f"evaluated as '{status}' against the regulatory mandate. Provide: "
            "1. EXPLANATION (1-2 sentences on the exact constraint mismatch). "
            "2. REMEDIATION (1 concise sentence specifying the exact policy revision needed)."
        )

        user_msg = (
            f"Regulatory Requirement (Provision {record.regulatory_requirement.provision_id}):\n\"{reg_text}\"\n\n"
            f"Company Policy Evidence ({record.matched_policy_requirement.section_id if record.matched_policy_requirement else 'None'}):\n\"{pol_text}\"\n\n"
            f"Deterministic Gap: {gap}"
        )

        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                res = await client.post(
                    self.GROQ_API_URL,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_msg},
                            {"role": "user", "content": user_msg},
                        ],
                        "temperature": 0.1,
                        "max_tokens": 300,
                    },
                )
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"].strip()
                    parts = content.split("REMEDIATION:")
                    if len(parts) == 2:
                        exp = parts[0].replace("EXPLANATION:", "").strip()
                        rec = parts[1].strip()
                        return exp, rec
                    return content, None
        except Exception:
            pass

        return None, None
