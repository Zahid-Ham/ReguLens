"""Pydantic schemas for NLP Processing Intelligence API."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# =============================================================================
# Pipeline Overview & Status
# =============================================================================

class NLPOverview(BaseModel):
    """Aggregated statistics across all NLP pipeline stages."""

    total_regulatory_clauses: int = Field(..., description="Total segmented clauses across regulatory corpus")
    clauses_with_domain_entities: int = Field(..., description="Clauses containing at least one recognized domain entity")
    total_domain_entity_mentions: int = Field(..., description="Total domain entity mentions extracted")
    domain_entity_counts: Dict[str, int] = Field(..., description="Count of mentions per entity category")

    requirement_like_clauses: int = Field(..., description="Clauses containing actionable regulatory requirements")
    extracted_subjects: int = Field(..., description="Clauses with successfully parsed regulated subjects")
    extracted_actions: int = Field(..., description="Clauses with extracted action predicates")
    regulatory_modality_count: int = Field(..., description="Clauses with detected deontic modals")
    deadline_count: int = Field(..., description="Clauses with extracted temporal deadlines")
    duration_count: int = Field(..., description="Clauses with extracted time durations")

    classification_distribution: Dict[str, int] = Field(..., description="Clause classification category counts")
    classification_validation_accuracy: float = Field(..., description="Human-audited validation accuracy on 50 samples")

    tfidf_classifier_metrics: Dict[str, Any] = Field(..., description="5-fold CV metrics for TF-IDF + Logistic Regression")
    semantic_classifier_metrics: Dict[str, Any] = Field(..., description="5-fold CV metrics for Sentence Transformer Classifier")
    obligation_extraction_coverage: Dict[str, Any] = Field(..., description="Coverage statistics for requirement extraction")

    pipeline_stages: List[str] = Field(..., description="Sequential stages of the ReguLens NLP pipeline")


class NLPStageStatus(BaseModel):
    """Status and artifact availability for an individual NLP processing stage."""

    stage: str = Field(..., description="Pipeline stage name")
    status: str = Field(..., description="Execution status (e.g. completed)")
    artifact: str = Field(..., description="Primary artifact path for this stage")
    artifact_exists: bool = Field(..., description="Whether underlying data artifact is verified on disk")


class NLPProcessingStatus(BaseModel):
    """Overall status and artifact availability of the precomputed NLP pipeline."""

    analysis_id: str = Field(..., description="Target regulatory comparison identifier")
    mode: str = Field(default="precomputed", description="Processing execution mode")
    status: str = Field(default="complete", description="Overall pipeline status")
    stages: List[NLPStageStatus] = Field(..., description="Stage-by-stage verification details")


# =============================================================================
# Domain NER
# =============================================================================

class EntityItem(BaseModel):
    """Count and share for a specific domain entity type."""

    entity_type: str = Field(..., description="Entity category (e.g. REGULATOR, ACT, MONETARY_VALUE)")
    count: int = Field(..., description="Total mentions detected")
    percentage: float = Field(..., description="Percentage share among all entity mentions")


class EntityStatistics(BaseModel):
    """Aggregate domain entity extraction statistics from NER annotations."""

    total_mentions: int = Field(..., description="Total entity mentions across corpus")
    total_clauses_annotated: int = Field(..., description="Total clauses processed through NER pipeline")
    clauses_with_entities: int = Field(..., description="Clauses containing one or more domain entities")
    entity_statistics: List[EntityItem] = Field(..., description="Ranked entity categories by occurrence")


# =============================================================================
# Clause Classification & Validation
# =============================================================================

class ClassificationItem(BaseModel):
    """Distribution item for a classification category."""

    label: str = Field(..., description="Category label (e.g. OBLIGATION, PERMISSION, INFORMATION)")
    count: int = Field(..., description="Number of clauses with this label")
    percentage: float = Field(..., description="Percentage of annotated dataset")


class ValidationAuditSummary(BaseModel):
    """Validation audit results from human verification of LLM-assisted labels."""

    audit_size: int = Field(..., description="Number of clauses in human-audited validation subset")
    agreements: int = Field(..., description="Number of exact agreements between human auditor and LLM annotation")
    validated_accuracy: float = Field(..., description="Human-audited validation accuracy score")
    audit_subset_description: str = Field(..., description="Provenance note describing the human validation subset")


class ClassificationStatistics(BaseModel):
    """Clause classification distribution and audit validation metrics."""

    dataset_type: str = Field(..., description="Description of annotation dataset and provenance")
    total_annotated: int = Field(..., description="Total clauses in annotated dataset")
    distribution: List[ClassificationItem] = Field(..., description="Label distribution breakdown")
    validation: ValidationAuditSummary = Field(..., description="Human audit verification metrics")


# =============================================================================
# Requirement Extraction Coverage
# =============================================================================

class RequirementCoverage(BaseModel):
    """Coverage metrics and function breakdown from obligation extraction pipeline."""

    total_clauses: int = Field(..., description="Total clauses evaluated")
    requirement_like: int = Field(..., description="Clauses identified with actionable regulatory requirement content")
    subject_extracted: int = Field(..., description="Clauses with successfully extracted regulated entities/subjects")
    action_extracted: int = Field(..., description="Clauses with extracted action verbs/predicates")
    modal_detected: int = Field(..., description="Clauses with extracted modal operators")
    deadline_detected: int = Field(..., description="Clauses with extracted compliance deadlines")
    duration_detected: int = Field(..., description="Clauses with extracted timeframe/duration periods")

    coverage_percentages: Dict[str, float] = Field(..., description="Coverage percentages relative to total clauses")
    regulatory_function_distribution: Dict[str, int] = Field(..., description="Distribution of extracted regulatory functions")


# =============================================================================
# Classifier Evaluation Metrics
# =============================================================================

class MetricDetail(BaseModel):
    """Mean and standard deviation for a cross-validation metric."""

    mean: float = Field(..., description="Cross-validation mean score")
    std: float = Field(..., description="Cross-validation standard deviation")


class ModelEvaluation(BaseModel):
    """Evaluation summary for a trained or evaluated classifier model."""

    model_name: str = Field(..., description="Display name of the classifier")
    model_type: str = Field(..., description="Architecture description")
    cv_folds: int = Field(default=5, description="Number of cross-validation folds")
    metrics: Dict[str, MetricDetail] = Field(..., description="Evaluated performance metrics")


class ModelEvaluationListResponse(BaseModel):
    """Comparison of evaluated models in the ReguLens NLP pipeline."""

    models: List[ModelEvaluation] = Field(..., description="Evaluated model summaries")


# =============================================================================
# Granular Clause NLP Detail
# =============================================================================

class DomainEntityMention(BaseModel):
    """Single domain entity mention within a clause."""

    text: str = Field(..., description="Extracted surface text")
    label: str = Field(..., description="Entity category")
    start: Optional[int] = Field(None, description="Character start offset")
    end: Optional[int] = Field(None, description="Character end offset")


class NLPClauseDetail(BaseModel):
    """Complete NLP annotation payload for a single clause."""

    clause_id: str = Field(..., description="Unique clause identifier")
    clause_text: str = Field(..., description="Raw text of the clause")
    tokens: Optional[List[str]] = Field(None, description="Word tokens")
    lemmas: Optional[List[str]] = Field(None, description="Lemmatized tokens")
    pos_tags: Optional[List[Dict[str, str]]] = Field(None, description="Part-of-speech tags")
    dependencies: Optional[List[Dict[str, str]]] = Field(None, description="Syntactic dependency relations")
    noun_chunks: Optional[List[str]] = Field(None, description="Extracted noun phrases")
    domain_entities: List[DomainEntityMention] = Field(default_factory=list, description="Extracted domain entities")
    regulatory_function: Optional[str] = Field(None, description="Classified regulatory function")
    subject: Optional[str] = Field(None, description="Extracted regulated entity")
    modality: Optional[str] = Field(None, description="Extracted deontic modality keyword")
    action: Optional[str] = Field(None, description="Extracted regulatory action")
    deadline: Optional[str] = Field(None, description="Extracted compliance deadline")
    duration: Optional[str] = Field(None, description="Extracted duration")
