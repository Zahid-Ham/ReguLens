"""Dynamic NLP Pipeline Pydantic Schemas.

Defines structured models for runtime clause segmentation, core linguistic annotations,
domain NER, regulatory classification, requirement extraction, and aggregate statistics.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DependencyItem(BaseModel):
    """Linguistic dependency relationship."""

    token: str = Field(description="Token text")
    dep: str = Field(description="Universal/spaCy dependency label (e.g. nsubj, aux, ROOT, dobj)")
    head: str = Field(description="Syntactic governor/head token text")


class EntityMention(BaseModel):
    """Detected domain regulatory entity."""

    text: str = Field(description="Matched entity text string")
    label: str = Field(description="Domain entity type (e.g. REGULATOR, REGULATED_ENTITY, DEADLINE, DATE)")
    start: int = Field(description="Start character offset in clause text")
    end: int = Field(description="End character offset in clause text")
    source: Optional[str] = Field(default="dynamic_ner", description="Extraction strategy source")


class ClassificationResult(BaseModel):
    """Regulatory function classification result."""

    label: str = Field(description="Regulatory function label (e.g. OBLIGATION, PERMISSION, REPORTING)")
    confidence: float = Field(description="Classification confidence score (0.0 to 1.0)")
    method: str = Field(default="rule_based_dynamic", description="Classification methodology")


class ExtractedRequirement(BaseModel):
    """Structured obligation / requirement decomposition."""

    subject: Optional[str] = Field(default=None, description="Duty holder / regulated subject")
    modality: Optional[str] = Field(default=None, description="Modal auxiliary / obligation force")
    action: Optional[str] = Field(default=None, description="Operative verb / action required")
    object: Optional[str] = Field(default=None, description="Target object or recipient of action")
    deadline: Optional[str] = Field(default=None, description="Prescribed compliance deadline")
    duration: Optional[str] = Field(default=None, description="Prescribed period or validity duration")


class DynamicClauseNLP(BaseModel):
    """Granular linguistic and domain analysis for a single segmented clause."""

    clause_id: str = Field(description="Unique clause identifier (e.g. doc_custom_123_c1)")
    provision_id: Optional[str] = Field(default=None, description="Detected provision number or heading")
    clause_text: str = Field(description="Complete clause text")
    section_level: int = Field(default=1, description="Hierarchical depth (1: Section, 2: Subsection, 3: Paragraph)")
    source_page: Optional[int] = Field(default=None, description="Source page number if available")
    word_count: int = Field(default=0, description="Word count of clause")
    character_count: int = Field(default=0, description="Character count of clause")
    tokens: List[str] = Field(default_factory=list, description="Word tokens")
    lemmas: List[str] = Field(default_factory=list, description="Base lemmatized tokens")
    pos_tags: List[str] = Field(default_factory=list, description="Part-of-Speech tags")
    dependencies: List[DependencyItem] = Field(default_factory=list, description="Dependency parse triples")
    noun_chunks: List[str] = Field(default_factory=list, description="Extracted noun phrases")
    entities: List[EntityMention] = Field(default_factory=list, description="Domain entity mentions")
    classification: ClassificationResult = Field(description="Regulatory function classification")
    requirement: Optional[ExtractedRequirement] = Field(default=None, description="Extracted requirement fields if applicable")


class RequirementCoverage(BaseModel):
    """Requirement field extraction frequencies."""

    subject: int = Field(default=0, description="Count of clauses with extracted subject")
    modality: int = Field(default=0, description="Count of clauses with detected modality")
    action: int = Field(default=0, description="Count of clauses with extracted action verb")
    deadline: int = Field(default=0, description="Count of clauses with detected deadline")
    duration: int = Field(default=0, description="Count of clauses with detected duration")


class DynamicNLPStatistics(BaseModel):
    """Aggregate statistics for an analyzed document."""

    document_id: str = Field(description="Analyzed document identifier")
    total_clauses: int = Field(description="Total segmented clauses")
    total_words: int = Field(description="Total words across all clauses")
    clauses_with_entities: int = Field(description="Number of clauses containing at least one entity")
    total_entity_mentions: int = Field(description="Total count of entity occurrences")
    requirement_like_clauses: int = Field(description="Number of obligation/prohibition/reporting/procedure clauses")
    classification_distribution: Dict[str, int] = Field(description="Clause counts grouped by regulatory function")
    entity_distribution: Dict[str, int] = Field(description="Entity counts grouped by domain label")
    requirement_coverage: RequirementCoverage = Field(description="Coverage counts for requirement components")


class DynamicNLPResponse(BaseModel):
    """API response for dynamic NLP pipeline execution and retrieval."""

    document_id: str = Field(description="Document identifier")
    status: str = Field(default="completed", description="NLP execution status")
    statistics: DynamicNLPStatistics = Field(description="Summary metrics and distributions")
    clauses: List[DynamicClauseNLP] = Field(default_factory=list, description="Processed clause records")
