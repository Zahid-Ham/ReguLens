"""Dynamic Regulatory NLP Processing Pipeline Service.

Provides complete, real-time linguistic and regulatory analysis for uploaded regulatory documents:
1. Regulatory-aware clause segmentation
2. Core spaCy linguistic processing (tokens, lemmas, POS, dependency parsing, noun chunks)
3. 10-class regulatory domain NER with overlap resolution & date guardrails
4. 10-class regulatory function classification
5. Dependency-aware structured requirement extraction (subject, modality, action, object, deadline, duration)
6. Runtime storage and aggregate statistics computation
"""

from collections import Counter
import re
from typing import Any, Dict, List, Optional, Set, Tuple

import spacy
from spacy.tokens import Doc

from app.schemas.dynamic_nlp import (
    ClassificationResult,
    DependencyItem,
    DynamicClauseNLP,
    DynamicNLPResponse,
    DynamicNLPStatistics,
    EntityMention,
    ExtractedRequirement,
    RequirementCoverage,
)


class DynamicNLPPipeline:
    """Service performing live NLP pipeline operations and maintaining runtime NLP analysis results."""

    _nlp_model = None

    # Regulatory Classification Labels
    LABELS = [
        "OBLIGATION",
        "PROHIBITION",
        "PERMISSION",
        "EXCEPTION",
        "DEFINITION",
        "PROCEDURE",
        "REPORTING",
        "PENALTY",
        "REFERENCE",
        "INFORMATION",
    ]

    # Domain Entity Types
    ENTITY_TYPES = [
        "REGULATOR",
        "REGULATED_ENTITY",
        "REGULATORY_INSTRUMENT",
        "ACT",
        "REPORT",
        "DATE",
        "DEADLINE",
        "DURATION",
        "MONETARY_VALUE",
        "THRESHOLD",
    ]

    def __init__(self) -> None:
        self._results_store: Dict[str, DynamicNLPResponse] = {}

    @classmethod
    def get_nlp(cls) -> Any:
        """Load and cache spaCy pipeline singleton once for efficiency."""
        if cls._nlp_model is None:
            try:
                cls._nlp_model = spacy.load("en_core_web_sm")
            except Exception:
                # Fallback to blank english model if model pack unavailable
                cls._nlp_model = spacy.blank("en")
                if "sentencizer" not in cls._nlp_model.pipe_names:
                    cls._nlp_model.add_pipe("sentencizer")
        return cls._nlp_model

    # =========================================================================
    # 1. Clause Segmentation
    # =========================================================================

    def segment_text(self, document_id: str, extracted_text: str) -> List[Dict[str, Any]]:
        """Segment raw regulatory document text into structured clauses."""
        lines = extracted_text.splitlines()
        segmented: List[Dict[str, Any]] = []

        current_page = 1
        current_clause_lines: List[str] = []
        current_provision_id: Optional[str] = None
        current_level = 1

        # Patterns for provisions
        # 1. Section numbers like "1.", "1.1", "2.1(a)", "3.1.2"
        section_num_re = re.compile(r"^(\d+(?:\.\d+)*(?:\([a-z0-9]+\))?)(?:[\.\:\s\t]|$)", re.IGNORECASE)
        # 2. Bullet subclauses like "(a)", "(b)", "(i)", "(ii)", "a.", "b."
        bullet_sub_re = re.compile(r"^(\([a-z0-9]+\)|\([ivx]+\)|[a-z]\.)(?:\s|\t|$)", re.IGNORECASE)
        # 3. Heading labels like "Section 1", "Chapter II", "Clause 4", "Annex I", "Part A"
        named_heading_re = re.compile(
            r"^(Chapter\s+[IVX0-9]+|Section\s+\d+|Clause\s+\d+|Part\s+[A-Z0-9]+|Annex(?:ure)?\s+[IVX0-9]+)(?:[\.\:\s\t]|$)",
            re.IGNORECASE,
        )

        def flush_clause():
            nonlocal current_clause_lines, current_provision_id, current_level
            if not current_clause_lines:
                return
            clause_str = " ".join(current_clause_lines).strip()
            # Clean excessive spacing
            clause_str = re.sub(r"\s+", " ", clause_str)
            if len(clause_str) >= 5:  # Avoid empty fragments
                cid = f"{document_id}_c{len(segmented) + 1}"
                segmented.append({
                    "clause_id": cid,
                    "provision_id": current_provision_id,
                    "clause_text": clause_str,
                    "section_level": current_level,
                    "source_page": current_page,
                    "word_count": len(clause_str.split()),
                    "character_count": len(clause_str),
                })
            current_clause_lines = []
            current_provision_id = None
            current_level = 1

        for line in lines:
            trimmed = line.strip()
            if not trimmed:
                # Blank line indicates potential paragraph boundary
                if len(current_clause_lines) >= 1:
                    flush_clause()
                continue

            # Check page marker (e.g. "[Page 2]")
            page_match = re.match(r"^\[Page\s+(\d+)\]$", trimmed, re.IGNORECASE)
            if page_match:
                flush_clause()
                current_page = int(page_match.group(1))
                continue

            # Check if line starts with provision pattern
            named_m = named_heading_re.match(trimmed)
            sec_m = section_num_re.match(trimmed)
            bullet_m = bullet_sub_re.match(trimmed)

            # False provision check: ensure numbers are not dates (e.g. "2024-25" or "26 May"),
            # percentages ("7.5 per cent"), or monetary values ("Rs. 50,000")
            is_false_num = False
            if sec_m:
                matched_label = sec_m.group(1)
                # If matched label is 4 digits (e.g. "2020"), likely year
                if len(matched_label) == 4 and matched_label.isdigit() and int(matched_label) > 1900:
                    is_false_num = True
                # If followed immediately by % or per cent
                if re.search(r"^\d+(?:\.\d+)?\s*(?:%|per cent|lakh|crore)", trimmed, re.IGNORECASE):
                    is_false_num = True

            if named_m:
                flush_clause()
                current_provision_id = named_m.group(1).strip()
                current_level = 1
                current_clause_lines.append(trimmed)
            elif sec_m and not is_false_num:
                flush_clause()
                current_provision_id = sec_m.group(1).strip()
                dots = current_provision_id.count(".")
                current_level = min(dots + 1, 4)
                current_clause_lines.append(trimmed)
            elif bullet_m:
                flush_clause()
                current_provision_id = bullet_m.group(1).strip()
                current_level = 3
                current_clause_lines.append(trimmed)
            else:
                current_clause_lines.append(trimmed)

        flush_clause()

        # Fallback: if no clauses were produced (e.g. single unformatted block), split by sentences
        if not segmented and extracted_text.strip():
            raw_clean = re.sub(r"\s+", " ", extracted_text.strip())
            segmented.append({
                "clause_id": f"{document_id}_c1",
                "provision_id": None,
                "clause_text": raw_clean,
                "section_level": 1,
                "source_page": 1,
                "word_count": len(raw_clean.split()),
                "character_count": len(raw_clean),
            })

        return segmented

    # =========================================================================
    # 2. Domain NER Extraction
    # =========================================================================

    def extract_domain_entities(self, text: str) -> List[EntityMention]:
        """Extract regulatory domain entities using domain regex patterns with non-overlapping prioritization."""
        entities: List[EntityMention] = []

        patterns = [
            # 1. DATE: Full dates (Month Day, Year or Day Month Year or ISO)
            (
                "DATE",
                re.compile(
                    r"\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b|"
                    r"\b\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+\d{4})?\b|"
                    r"\b\d{4}-\d{2}-\d{2}\b|"
                    r"\b31st\s+March\b",
                    re.IGNORECASE,
                ),
            ),
            # 2. DEADLINE: expressions like "within 15 days", "Within 5 working days", "no later than 30 days"
            (
                "DEADLINE",
                re.compile(
                    r"\b(?:within|within in|no later than|not later than|by)\s+(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:working\s+)?(?:days?|weeks?|months?|hours?|years?)\b|"
                    r"\b(?:within|by)\s+\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\b",
                    re.IGNORECASE,
                ),
            ),
            # 3. DURATION: expressions like "21 days", "15 days", "One month", "two years", "quarterly", "annually"
            (
                "DURATION",
                re.compile(
                    r"\b(?<!within\s)(?<!by\s)(?<!before\s)(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|half[- ]yearly|quarterly|annual|annually)\s+(?:working\s+)?(?:days?|weeks?|months?|years?)\b",
                    re.IGNORECASE,
                ),
            ),
            # 4. REGULATOR
            (
                "REGULATOR",
                re.compile(
                    r"\b(Reserve Bank of India|RBI|SEBI|IRDAI|PFRDA|Central Bank|Reserve Bank)\b",
                    re.IGNORECASE,
                ),
            ),
            # 5. REGULATED_ENTITY
            (
                "REGULATED_ENTITY",
                re.compile(
                    r"\b(Scheduled Commercial Banks?|Commercial Banks?|Public Sector Banks?|Private Sector Banks?|Foreign Banks?|"
                    r"Urban Co-?operative Banks?|UCBs?|Small Finance Banks?|SFBs?|Regional Rural Banks?|RRBs?|Payments Banks?|"
                    r"Non-Banking Financial Compan(?:y|ies)|NBFCs?|Regulated Entit(?:y|ies)|Authorised Persons?|"
                    r"Banking Compan(?:y|ies)|Branch Auditors?|Statutory Central Auditors?|Primary Urban Co-operative Banks?)\b",
                    re.IGNORECASE,
                ),
            ),
            # 6. REGULATORY_INSTRUMENT
            (
                "REGULATORY_INSTRUMENT",
                re.compile(
                    r"\b(Master Directions?|Directions?|Master Circulars?|Circulars?|Guidelines?|Notifications?|Framework|Regulations?|Policy)\b",
                    re.IGNORECASE,
                ),
            ),
            # 7. ACT
            (
                "ACT",
                re.compile(
                    r"\b(Banking Regulation Act,?\s*(?:1949)?|Reserve Bank of India Act,?\s*(?:1934)?|Companies Act,?\s*(?:2013|1956)?|"
                    r"Prevention of Money Laundering Act,?\s*(?:2002)?|PMLA|FEMA|Foreign Exchange Management Act,?\s*(?:1999)?|"
                    r"Payment and Settlement Systems Act,?\s*(?:2007)?|Insolvency and Bankruptcy Code,?\s*(?:2016)?)\b",
                    re.IGNORECASE,
                ),
            ),
            # 8. REPORT
            (
                "REPORT",
                re.compile(
                    r"\b(Returns?|Balance Sheet Analysis|Form\s+[A-Z0-9]+|Statutory Returns?|Statements?|Audit Reports?|Compliance Reports?|"
                    r"STR|CTR|CCR|Auditor’s report|Auditor's report|Annual Return)\b",
                    re.IGNORECASE,
                ),
            ),
            # 9. MONETARY_VALUE
            (
                "MONETARY_VALUE",
                re.compile(
                    r"\b(?:Rs\.?|INR|₹|Rupees|USD|\$)\s*\d+(?:,\d+)*(?:\.\d+)?(?:\s*(?:crore|lakh|million|billion|thousand|k))?\b",
                    re.IGNORECASE,
                ),
            ),
            # 10. THRESHOLD
            (
                "THRESHOLD",
                re.compile(
                    r"\b\d+(?:\.\d+)?\s*(?:per\s*cent|%|percent)\b|\b(?:at least|minimum of|not exceeding|exceeding|more than|less than|up to)\s+\d+(?:\.\d+)?\s*(?:%|per cent)?\b",
                    re.IGNORECASE,
                ),
            ),
        ]

        # Collect raw matches
        raw_matches: List[Tuple[int, int, str, str]] = []
        for label, pattern in patterns:
            for m in pattern.finditer(text):
                raw_matches.append((m.start(), m.end(), label, m.group(0)))

        # Sort matches by start position, then longer matches first
        raw_matches.sort(key=lambda x: (x[0], -(x[1] - x[0])))

        # Resolve overlaps by keeping earlier and longer matches
        occupied: List[Tuple[int, int]] = []
        for start, end, label, matched_text in raw_matches:
            is_overlapping = any(not (end <= occ_start or start >= occ_end) for occ_start, occ_end in occupied)
            if not is_overlapping:
                occupied.append((start, end))
                entities.append(
                    EntityMention(
                        text=matched_text.strip(),
                        label=label,
                        start=start,
                        end=end,
                        source="dynamic_ner",
                    )
                )

        # Sort entities by start position
        entities.sort(key=lambda e: e.start)
        return entities

    # =========================================================================
    # 3. Clause Classification
    # =========================================================================

    def classify_clause(self, text: str, doc: Doc, entities: List[EntityMention]) -> ClassificationResult:
        """Classify clause into one of ten regulatory functions with grammatical validation."""
        text_lower = text.lower()

        # Check for Month 'May' vs Modal 'may'
        # If 'may' occurs, verify if it's within a DATE entity or capitalized Month
        date_spans = {(e.start, e.end) for e in entities if e.label == "DATE"}

        has_true_modal_may = False
        for token in doc:
            if token.lower_ == "may":
                # Check if token falls inside a DATE span
                token_in_date = any(start <= token.idx < end for start, end in date_spans)
                if not token_in_date and (token.pos_ in ("AUX", "VERB") or token.tag_ == "MD"):
                    has_true_modal_may = True

        # 1. PROHIBITION
        if re.search(r"\b(shall not|must not|prohibited from|cannot|shall never|strictly prohibited|is not permitted|are not permitted)\b", text_lower):
            return ClassificationResult(label="PROHIBITION", confidence=0.96, method="rule_based_dynamic")

        # 2. EXCEPTION
        if re.search(r"\b(provided that|provided further that|except where|unless otherwise|notwithstanding anything contained|subject to the exception|with the exception of)\b", text_lower):
            return ClassificationResult(label="EXCEPTION", confidence=0.92, method="rule_based_dynamic")

        # 3. PENALTY
        if re.search(r"\b(penal(?:ty|ties)?|penal action|fine of|punishable under|imprisonment|section 46|liable to penalty)\b", text_lower):
            return ClassificationResult(label="PENALTY", confidence=0.93, method="rule_based_dynamic")

        # 4. DEFINITION
        if re.search(r'(?:^|[\.\:\s])(?:means|shall mean|is defined as|shall have the meaning|refers to|“[^”]+”\s+means|"[^"]+"\s+means)\b', text_lower):
            return ClassificationResult(label="DEFINITION", confidence=0.91, method="rule_based_dynamic")

        # 5. REPORTING
        if re.search(r"\b(shall submit|shall file|shall report|shall furnish|must submit|must file|must report|submission of returns?|reporting of)\b", text_lower):
            return ClassificationResult(label="REPORTING", confidence=0.94, method="rule_based_dynamic")

        # 6. PROCEDURE
        if re.search(r"\b(procedure for|steps to be taken|manner of|in accordance with the procedure|methodology for|guidelines for conducting)\b", text_lower):
            return ClassificationResult(label="PROCEDURE", confidence=0.88, method="rule_based_dynamic")

        # 7. PERMISSION (Only if true modal may or explicit permission)
        if has_true_modal_may or re.search(r"\b(can|are permitted to|is permitted to|may be allowed|at its discretion|optionally)\b", text_lower):
            return ClassificationResult(label="PERMISSION", confidence=0.90, method="rule_based_dynamic")

        # 8. OBLIGATION
        if re.search(r"\b(shall|must|is required to|are required to|shall ensure|shall verify|shall comply|shall maintain)\b", text_lower):
            return ClassificationResult(label="OBLIGATION", confidence=0.95, method="rule_based_dynamic")

        # 9. REFERENCE
        if re.search(r"\b(refer to|in terms of|as per|vide circular|contained in Annex|in accordance with Section)\b", text_lower):
            return ClassificationResult(label="REFERENCE", confidence=0.82, method="rule_based_dynamic")

        # 10. INFORMATION (Default)
        return ClassificationResult(label="INFORMATION", confidence=0.75, method="rule_based_dynamic")

    # =========================================================================
    # 4. Dependency-Aware Requirement Extraction
    # =========================================================================

    def extract_requirement(
        self,
        text: str,
        doc: Doc,
        classification: ClassificationResult,
        entities: List[EntityMention],
    ) -> Optional[ExtractedRequirement]:
        """Extract grammatical subject, modal auxiliary, action verb, object, deadline, and duration."""
        # Only extract requirement structure if clause is an active regulatory requirement/obligation/reporting/permission
        if classification.label not in ("OBLIGATION", "PROHIBITION", "PERMISSION", "REPORTING", "PROCEDURE"):
            return None

        subject: Optional[str] = None
        modality: Optional[str] = None
        action: Optional[str] = None
        obj: Optional[str] = None
        deadline: Optional[str] = None
        duration: Optional[str] = None

        # 1. Deadline & Duration from domain entities
        for ent in entities:
            if ent.label == "DEADLINE" and deadline is None:
                deadline = ent.text
            elif ent.label == "DURATION" and duration is None:
                duration = ent.text

        # 2. Modality & Action Verb Extraction
        action_token = None
        for token in doc:
            if token.dep_ in ("aux", "auxpass") and token.lower_ in ("shall", "must", "may", "should", "can", "will"):
                # Check for negation: "shall not"
                head = token.head
                is_negated = any(child.dep_ == "neg" for child in head.children)
                modality = f"{token.text} not" if is_negated else token.text
                action_token = head
                action = head.lemma_
                break

        # Fallback action verb if modal was not an aux dependency
        if not action_token:
            for token in doc:
                if token.dep_ == "ROOT" and token.pos_ in ("VERB", "AUX"):
                    action_token = token
                    action = token.lemma_
                    break

        # 3. Subject Extraction via grammatical subject relations (nsubj / nsubjpass)
        if action_token:
            # Look for nsubj on the action verb or its ancestors
            subj_tokens = [child for child in action_token.children if child.dep_ in ("nsubj", "nsubjpass")]
            if not subj_tokens and action_token.head and action_token.head != action_token:
                subj_tokens = [child for child in action_token.head.children if child.dep_ in ("nsubj", "nsubjpass")]

            if subj_tokens:
                target_subj = subj_tokens[0]
                # Expand subject with modifiers (amod, compound, det)
                subj_span_tokens = [t for t in target_subj.subtree if t.i <= target_subj.i]
                if subj_span_tokens:
                    subj_text = doc[subj_span_tokens[0].i : target_subj.i + 1].text.strip()
                    if subj_text:
                        subject = subj_text

            # 4. Object Extraction (dobj, pobj, attr)
            obj_tokens = [child for child in action_token.children if child.dep_ in ("dobj", "pobj", "attr")]
            if not obj_tokens and action_token.head and action_token.head != action_token:
                obj_tokens = [child for child in action_token.head.children if child.dep_ in ("dobj", "pobj", "attr")]

            if obj_tokens:
                target_obj = obj_tokens[0]
                # Expand object subtree
                obj_span_tokens = [t for t in target_obj.subtree]
                if obj_span_tokens:
                    start_i = min(t.i for t in obj_span_tokens)
                    end_i = max(t.i for t in obj_span_tokens) + 1
                    # Limit object span to reasonable length (<= 8 tokens)
                    if end_i - start_i <= 10:
                        obj_text = doc[start_i:end_i].text.strip()
                        if obj_text:
                            obj = obj_text

        # If none of the operative fields could be extracted, return None
        if not any([subject, modality, action, deadline, duration]):
            return None

        return ExtractedRequirement(
            subject=subject,
            modality=modality,
            action=action,
            object=obj,
            deadline=deadline,
            duration=duration,
        )

    # =========================================================================
    # 5. Pipeline Execution & Runtime Store
    # =========================================================================

    def process_document(self, document_id: str, extracted_text: str) -> DynamicNLPResponse:
        """Execute the end-to-end dynamic NLP pipeline on extracted text and store the result."""
        nlp = self.get_nlp()

        # Step 1: Segment text into clauses
        raw_clauses = self.segment_text(document_id, extracted_text)

        clause_texts = [c["clause_text"] for c in raw_clauses]
        # Step 2: Batch process docs with spaCy nlp.pipe
        docs: List[Doc] = list(nlp.pipe(clause_texts, batch_size=50))

        processed_clauses: List[DynamicClauseNLP] = []
        classification_counts: Counter = Counter()
        entity_counts: Counter = Counter()
        clauses_with_entities = 0
        total_entity_mentions = 0
        req_like_count = 0
        req_coverage = {
            "subject": 0,
            "modality": 0,
            "action": 0,
            "deadline": 0,
            "duration": 0,
        }

        for raw_c, doc in zip(raw_clauses, docs):
            clause_text = raw_c["clause_text"]

            # Linguistic components
            tokens = [t.text for t in doc]
            lemmas = [t.lemma_ for t in doc]
            pos_tags = [t.pos_ for t in doc]
            dependencies = [
                DependencyItem(token=t.text, dep=t.dep_, head=t.head.text)
                for t in doc
            ]
            noun_chunks = [nc.text for nc in doc.noun_chunks] if hasattr(doc, "noun_chunks") else []

            # Domain NER
            entities = self.extract_domain_entities(clause_text)
            if entities:
                clauses_with_entities += 1
                total_entity_mentions += len(entities)
                for ent in entities:
                    entity_counts[ent.label] += 1

            # Classification
            classification = self.classify_clause(clause_text, doc, entities)
            classification_counts[classification.label] += 1
            if classification.label in ("OBLIGATION", "PROHIBITION", "PERMISSION", "REPORTING", "PROCEDURE"):
                req_like_count += 1

            # Requirement Extraction
            requirement = self.extract_requirement(clause_text, doc, classification, entities)
            if requirement:
                if requirement.subject:
                    req_coverage["subject"] += 1
                if requirement.modality:
                    req_coverage["modality"] += 1
                if requirement.action:
                    req_coverage["action"] += 1
                if requirement.deadline:
                    req_coverage["deadline"] += 1
                if requirement.duration:
                    req_coverage["duration"] += 1

            clause_obj = DynamicClauseNLP(
                clause_id=raw_c["clause_id"],
                provision_id=raw_c["provision_id"],
                clause_text=clause_text,
                section_level=raw_c["section_level"],
                source_page=raw_c["source_page"],
                word_count=raw_c["word_count"],
                character_count=raw_c["character_count"],
                tokens=tokens,
                lemmas=lemmas,
                pos_tags=pos_tags,
                dependencies=dependencies,
                noun_chunks=noun_chunks,
                entities=entities,
                classification=classification,
                requirement=requirement,
            )
            processed_clauses.append(clause_obj)

        total_words = sum(c.word_count for c in processed_clauses)

        stats = DynamicNLPStatistics(
            document_id=document_id,
            total_clauses=len(processed_clauses),
            total_words=total_words,
            clauses_with_entities=clauses_with_entities,
            total_entity_mentions=total_entity_mentions,
            requirement_like_clauses=req_like_count,
            classification_distribution=dict(classification_counts),
            entity_distribution=dict(entity_counts),
            requirement_coverage=RequirementCoverage(**req_coverage),
        )

        response = DynamicNLPResponse(
            document_id=document_id,
            status="completed",
            statistics=stats,
            clauses=processed_clauses,
        )

        self._results_store[document_id] = response
        return response

    def get_document_nlp_result(self, document_id: str) -> Optional[DynamicNLPResponse]:
        """Retrieve runtime NLP analysis result for a document if previously processed."""
        clean_id = document_id.strip()
        return self._results_store.get(clean_id)
