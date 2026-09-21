"""Pydantic Schemas for ReguLens NLP Explorer API (/nlp-explorer).

Defines structured response models for document selection, clause navigation,
tokenization/lemmatization/POS tables, dependency syntax trees, domain NER mentions,
regulatory classification, structured requirement extractions, and raw JSON export.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class NLPDocumentItem(BaseModel):
    """Document option in the NLP Explorer document selector."""

    document_id: str = Field(..., description="Unique document ID (e.g., 'rbi_psl_2025', 'rbi_a8d0f9a98495').")
    title: str = Field(..., description="Document display title.")
    filename: Optional[str] = Field(default=None, description="Original filename.")
    regulator: str = Field(default="RBI", description="Regulatory issuing authority.")
    document_type: str = Field(default="Master Direction", description="Document type.")
    effective_date: Optional[str] = Field(default=None, description="Effective date string.")
    uploaded_date: Optional[str] = Field(default=None, description="Uploaded date or catalog date.")
    clause_count: int = Field(default=0, description="Total segmented clauses in this document.")
    has_nlp: bool = Field(default=True, description="Whether NLP analysis is available.")


class NLPClauseItem(BaseModel):
    """Clause summary item in the clause selector dropdown."""

    clause_id: str = Field(..., description="Unique clause identifier.")
    provision_id: Optional[str] = Field(default=None, description="Section or provision number (e.g. '3.2.1', '6.1').")
    title: str = Field(..., description="Short descriptive title or snippet of the clause.")
    section: Optional[str] = Field(default=None, description="Parent section heading or provision label.")
    page_number: Optional[int] = Field(default=1, description="Source page number.")
    order_index: int = Field(default=0, description="Sequential ordering index in the document.")


class NLPTokenItem(BaseModel):
    """Tokenization and linguistic tag record for a single token."""

    index: int = Field(..., description="1-indexed token position in the clause.")
    token: str = Field(..., description="Surface token text.")
    lemma: str = Field(..., description="Base morphological lemma.")
    pos_tag: str = Field(..., description="Coarse Part-Of-Speech tag (e.g., NOUN, VERB, ADJ, AUX, ADP, ADV, DET, NUM, PART, CCONJ, PUNCT).")
    tag: Optional[str] = Field(default=None, description="Fine-grained Penn Treebank POS tag (e.g. NNS, VBZ, JJ).")
    is_stop: bool = Field(default=False, description="Whether the token is a stop word.")


class NLPDependencyNode(BaseModel):
    """Token node with syntactic dependency relations for graph rendering."""

    id: int = Field(..., description="0-indexed token identifier.")
    text: str = Field(..., description="Token surface string.")
    lemma: str = Field(..., description="Lemma.")
    pos: str = Field(..., description="POS tag.")
    dep: str = Field(..., description="Dependency relation label (e.g., ROOT, nsubj, aux, prep, pobj, dobj, amod, advmod).")
    head_id: int = Field(..., description="Parent head token index.")
    head_text: str = Field(..., description="Parent head token string.")
    is_root: bool = Field(default=False, description="Whether this node is the syntactic ROOT of the clause.")
    children: List[int] = Field(default_factory=list, description="List of dependent child token indices.")


class NLPDomainEntity(BaseModel):
    """Domain Named Entity mention recognized in the clause."""

    text: str = Field(..., description="Entity surface span.")
    type: str = Field(..., description="Entity type classification (e.g., REGULATOR, REGULATED_ENTITY, DURATION, DEADLINE, MONETARY_VALUE, THRESHOLD, CUSTOMER_TYPE, REGULATORY_CONCEPT).")
    description: Optional[str] = Field(default=None, description="Human-readable domain explanation of the entity type.")
    start_char: Optional[int] = Field(default=None, description="Start character offset in clause text.")
    end_char: Optional[int] = Field(default=None, description="End character offset in clause text.")


class NLPClauseInformation(BaseModel):
    """Metadata card details for the selected clause."""

    document_id: str
    document_title: str
    clause_id: str
    provision_id: Optional[str] = None
    section: Optional[str] = None
    page_number: Optional[int] = 1
    regulator: str = "RBI"
    document_type: str = "Master Direction"
    effective_date: Optional[str] = None
    source: str = "Official RBI Master Direction Corpus"


class NLPClauseClassification(BaseModel):
    """Clause classification details across regulatory functions, topic, and modality."""

    clause_type: str = Field(default="OBLIGATION", description="Primary regulatory function: OBLIGATION, PROHIBITION, PERMISSION, EXCEPTION, DEFINITION, PROCEDURE, REPORTING, PENALTY, REFERENCE, INFORMATION.")
    regulatory_function: str = Field(default="Obligation & Compliance Requirement", description="Descriptive regulatory function.")
    topic: Optional[str] = Field(default=None, description="High-level topic (e.g. Priority Sector Targets, Customer Due Diligence).")
    sub_topic: Optional[str] = Field(default=None, description="Granular sub-topic (e.g. Periodic Review, Micro Enterprises).")
    modality: str = Field(default="MANDATORY", description="Deontic modality: MANDATORY, RECOMMENDED, DISCRETIONARY, PROHIBITIVE.")
    materiality: Optional[str] = Field(default="HIGH", description="Materiality severity: HIGH, MEDIUM, LOW.")
    classification_source: str = Field(default="Deterministic Rule & Dependency Parsing", description="Source/method: Deterministic Rule, LLM-Assisted Annotation, or Human Audited.")
    rationale: Optional[str] = Field(default=None, description="Linguistic or semantic rationale explaining the classification.")
    confidence: Optional[float] = Field(default=1.0, description="Model confidence score (0.0 to 1.0).")


class NLPExtractedRequirement(BaseModel):
    """Structured regulatory requirement extractions from unstructured text."""

    action: Optional[str] = Field(default=None, description="Operative verb action (e.g., 'Review', 'Submit', 'Maintain').")
    subject: Optional[str] = Field(default=None, description="Regulated entity/subject (e.g., 'Commercial Banks', 'High-risk customers').")
    modality: Optional[str] = Field(default=None, description="Modality helper (e.g., 'shall', 'must', 'may').")
    frequency: Optional[str] = Field(default=None, description="Recurrence frequency (e.g., 'At least once every 12 months').")
    deadline: Optional[str] = Field(default=None, description="Time deadline constraint (e.g., 'within 15 days', 'by April 30').")
    duration: Optional[str] = Field(default=None, description="Time duration (e.g., '12 months', '5 years').")
    threshold: Optional[str] = Field(default=None, description="Monetary or percentage threshold (e.g., '₹50,000', '18 percent').")
    purpose: Optional[str] = Field(default=None, description="Regulatory purpose or objective (e.g., 'Ongoing due diligence and risk assessment').")
    object: Optional[str] = Field(default=None, description="Direct object of the action.")
    condition: Optional[str] = Field(default=None, description="Conditional triggers (e.g., 'if turnover exceeds ₹5 crore').")
    recipient: Optional[str] = Field(default=None, description="Target recipient of report or submission.")


class NLPClauseExplorerResponse(BaseModel):
    """Complete aggregated NLP inspection payload for a single clause."""

    clause_id: str
    document_id: str
    clause_text: str
    metadata: NLPClauseInformation
    tokens: List[NLPTokenItem] = Field(default_factory=list)
    dependencies: List[NLPDependencyNode] = Field(default_factory=list)
    entities: List[NLPDomainEntity] = Field(default_factory=list)
    classification: NLPClauseClassification
    requirement: NLPExtractedRequirement
    raw_json: Dict[str, Any] = Field(default_factory=dict)
