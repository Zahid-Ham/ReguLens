"""Policy NLP Service.

Extracts structured policy requirements, sections, entities, and parameters from
company policy documents processed through the dynamic NLP pipeline.
"""

import re
from typing import List, Optional

from app.schemas.dynamic_nlp import DynamicClauseNLP
from app.schemas.policy_mapping import PolicyRequirementItem


class PolicyNLPService:
    """Service to decompose company policy clauses into structured requirement items."""

    SECTION_PATTERN = re.compile(
        r"^(?:(?:Policy|Section|Clause|Article|Standard)\s*)?(\d+(?:\.\d+)*)\s*[:\-–—]?\s*(.*)",
        re.IGNORECASE,
    )

    DURATION_PATTERN = re.compile(
        r"(\d+)\s*(month|year|day|week|quarter|hr|hour)s?",
        re.IGNORECASE,
    )

    MONEY_PATTERN = re.compile(
        r"(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d+)?)\s*(lakh|crore|thousand|k)?",
        re.IGNORECASE,
    )

    DEADLINE_PATTERN = re.compile(
        r"(?:within|in|by|not\s+later\s+than)\s+(\d+)\s*(day|hour|business\s+day|week|month)s?",
        re.IGNORECASE,
    )

    def extract_section_info(self, text: str, clause_idx: int) -> tuple[Optional[str], Optional[str]]:
        """Extract section number (e.g. 'Policy 3.2') and title from clause text."""
        first_line = text.strip().split("\n")[0].strip()
        m = self.SECTION_PATTERN.match(first_line)
        if m:
            sec_num = m.group(1).strip()
            sec_title = m.group(2).strip()
            if not sec_title and len(first_line.split()) < 8:
                sec_title = first_line
            return f"Policy {sec_num}", sec_title or None

        # Fallback to heading heuristics
        if ":" in first_line and len(first_line.split(":")[0].split()) <= 4:
            prefix, rest = first_line.split(":", 1)
            return prefix.strip(), rest.strip() or None

        return f"Section {clause_idx + 1}", None

    def extract_duration(self, text: str) -> Optional[str]:
        """Extract duration string (e.g. '24 months', '5 years')."""
        matches = self.DURATION_PATTERN.findall(text)
        if matches:
            num, unit = matches[0]
            unit_clean = unit.lower()
            if not unit_clean.endswith("s"):
                unit_clean += "s"
            return f"{num} {unit_clean}"
        return None

    def extract_deadline(self, text: str) -> Optional[str]:
        """Extract deadline string (e.g. 'within 15 days')."""
        m = self.DEADLINE_PATTERN.search(text)
        if m:
            return m.group(0).strip()
        return None

    def extract_monetary_value(self, text: str) -> Optional[str]:
        """Extract monetary threshold (e.g. 'Rs. 10,00,000')."""
        m = self.MONEY_PATTERN.search(text)
        if m:
            return m.group(0).strip()
        return None

    def process_policy_clauses(
        self,
        document_id: str,
        clauses: List[DynamicClauseNLP],
    ) -> List[PolicyRequirementItem]:
        """Transform dynamic NLP policy clauses into structured PolicyRequirementItem objects."""
        items: List[PolicyRequirementItem] = []

        for idx, clause in enumerate(clauses):
            text = clause.clause_text.strip()
            if not text or len(text.split()) < 3:
                continue

            sec_id, sec_title = self.extract_section_info(text, idx)
            req = clause.requirement

            # Extract parameters via regex + NER
            duration = self.extract_duration(text) or (req.duration if req else None)
            deadline = self.extract_deadline(text) or (req.deadline if req else None)
            monetary = self.extract_monetary_value(text)

            # Entity keywords
            ent_texts = [e.text for e in clause.entities]

            subject = req.subject if req else None
            modality = req.modality if req else None
            action = req.action if req else None
            obj = req.object if req else None

            # Fallback for modal auxiliary if not extracted
            if not modality:
                t_lower = text.lower()
                for m in ("shall", "must", "will", "may", "should", "shall not", "must not"):
                    if re.search(rf"\b{m}\b", t_lower):
                        modality = m
                        break

            items.append(
                PolicyRequirementItem(
                    policy_clause_id=clause.clause_id,
                    policy_document_id=document_id,
                    section_id=sec_id,
                    section_title=sec_title,
                    policy_clause_text=text,
                    subject=subject,
                    modality=modality,
                    action=action,
                    object=obj,
                    deadline=deadline,
                    duration=duration,
                    monetary_value=monetary,
                    threshold=None,
                    condition=None,
                    entities=ent_texts,
                )
            )

        return items
