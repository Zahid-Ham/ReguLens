# ReguLens — Project Context & Development Specification

## 1. Project Identity

**Project Name:** ReguLens

**Academic Title:** An NLP-Based Framework for Regulatory Requirement Extraction, Semantic Change Detection and Compliance Gap Analysis

**Application:** Explainable NLP-based regulatory intelligence and compliance analysis web application.

**Primary Domain:** Indian financial regulation, initially focused on RBI regulatory documents.

**V1 Scope:** English-only RBI documents; document comparison; requirement/obligation extraction; semantic change detection; change classification; materiality indication; explainable NLP processing; regulatory search/exploration; compliance-oriented dashboard.

**Future Scope:** SEBI/IRDAI and other regulators; multilingual support; richer compliance-policy mapping; production-grade document ingestion.

---

## 2. Core Problem

Organizations such as banks and NBFCs must continuously monitor regulatory documents, understand new or modified requirements, identify obligations, deadlines, thresholds and prohibitions, and determine whether internal policies need to change.

Manual regulatory review is time-consuming, difficult to scale, prone to missing subtle semantic changes, and difficult to audit consistently.

ReguLens should make this process easier while keeping the NLP reasoning visible and explainable.

---

## 3. Core Product Idea

ReguLens must NOT behave like a black-box AI chatbot.

The application must visibly demonstrate the NLP pipeline:

```text
Regulatory Document
        ↓
Document Processing
        ↓
Text Extraction
        ↓
Clause Segmentation
        ↓
Tokenization
        ↓
Normalization / Lemmatization
        ↓
POS Tagging
        ↓
Dependency Analysis
        ↓
Domain NER
        ↓
Clause Classification
        ↓
Obligation / Requirement Extraction
        ↓
Semantic Representation
        ↓
Old ↔ New Clause Alignment
        ↓
Semantic Change Detection
        ↓
Change Classification
        ↓
Materiality Assessment
        ↓
Compliance Intelligence
```

The UI should expose these stages where appropriate.

The evaluator should be able to see WHAT NLP operation is happening, WHAT was extracted, and WHY a change was identified.

---

## 4. Example Regulatory Requirement

Old:
"Bank shall retain customer records for five years."

New:
"Financial institutions must preserve customer transaction information for a minimum period of seven years."

Conceptual comparison:

```text
Subject:
banks → financial institutions

Action:
retain → preserve

Object:
customer records → customer transaction information

Duration:
5 years → 7 years

Result:
Material modification
```

Potential compliance implication:

```text
Internal policy: 5 years
New regulatory requirement: 7 years
Potential gap: YES
```

---

## 5. Structured Requirement Representation

Where possible, requirements should be represented using:

```json
{
  "subject": "NBFCs",
  "modality": "shall",
  "action": "submit",
  "object": "quarterly reports",
  "recipient": "RBI",
  "deadline": "15 days"
}
```

Possible fields:
- subject
- modality
- action
- object
- recipient
- condition
- exception
- deadline
- duration
- monetary_value
- percentage
- threshold
- regulation
- section/provision

---

## 6. Clause Classification Labels

- OBLIGATION
- PROHIBITION
- PERMISSION
- EXCEPTION
- DEFINITION
- PROCEDURE
- REPORTING
- PENALTY
- REFERENCE
- INFORMATION

These are regulatory-function categories, not ordinary sentiment/topic categories.

---

## 7. Domain NER Labels

- REGULATOR
- REGULATED_ENTITY
- REGULATORY_INSTRUMENT
- ACT
- REPORT
- DEADLINE
- DURATION
- MONETARY_VALUE
- THRESHOLD
- DATE

The generic spaCy NER model should NOT be presented as the final regulatory NER system because early experiments showed domain-specific false positives.

---

## 8. Current NLP Laboratory Results

The NLP pipeline was developed and tested in Google Colab before application development.

Current corpus:
- 40 RBI PDFs
- approximately 284,418 extracted words
- approximately 5,842 regulatory segments/clauses

Domain NER baseline:
- 2,456 / 5,842 clauses contain detected domain entities.

Entity counts:
- REGULATORY_INSTRUMENT: 1,713
- DATE: 1,542
- REGULATOR: 1,011
- REPORT: 799
- ACT: 785
- REGULATED_ENTITY: 621
- DURATION: 411
- MONETARY_VALUE: 274
- DEADLINE: 152
- THRESHOLD: 137

These are experimental extraction counts, not claims of perfect accuracy.

---

## 9. Clause Classification Experiments

An initial rule-based weak-label baseline was created, followed by a 300-clause LLM-assisted annotation set.

LLM annotation set:
- 300 clauses
- 30 initially sampled from each weak-label class
- average LLM confidence approximately 0.932

Independent audit:
- 44 / 50 correct
- 88% audit accuracy

IMPORTANT: This is an independent review of 50 LLM annotations, NOT a human-annotated gold-standard dataset. Never describe it as human gold truth.

TF-IDF + Logistic Regression 5-fold CV:
- Accuracy approximately 0.52
- Macro F1 approximately 0.466

MiniLM semantic classification was also tested and performed below the TF-IDF baseline on the current small silver dataset.

Do not fabricate stronger metrics.

---

## 10. Obligation Extraction

Dependency-aware V3 extractor:

- Requirement-like clauses: 1,756 / 5,842 = 30.06%
- Subject extracted: 2,009 / 5,842 = 34.39%
- Action extracted: 2,144 / 5,842 = 36.70%
- Regulatory modality: 2,177 / 5,842 = 37.26%
- Deadline detected: 139 / 5,842 = 2.38%
- Duration detected: 357 / 5,842 = 6.11%

This is a baseline extraction system and must not be presented as perfect.

---

## 11. Real Regulatory Version Comparison

A verified RBI Priority Sector Lending comparison was prepared:

**Old:** Priority Sector Lending — Targets and Classification Directions, 2020

**New:** Priority Sector Lending — Targets and Classification Directions, 2025

The 2025 version supersedes the 2020 version.

Main-body segmentation was separately performed to avoid comparing table-of-contents and annex noise.

Current comparison uses:
- provision-aware segmentation
- semantic similarity
- order-aware alignment
- change intelligence
- administrative/date filtering

Alignment is useful for a prototype but is not legally perfect.

---

## 12. Regulatory Change Intelligence V2

Final comparison artifact:

```text
regulens_psl_regulatory_change_intelligence_v2.csv
```

Current summary:

```text
63 total comparison records

31 substantive modifications
4 administrative / metadata changes
7 wording-only changes
7 added candidates
12 removed candidates
2 unchanged

50 high-materiality
0 medium-materiality
13 low-materiality
```

Substantive dimensions include:
- modality changes
- percentage changes
- monetary value changes
- deadline changes
- date/context changes

IMPORTANT: "Added" and "Removed" records are CANDIDATES because semantic alignment is imperfect. Show them as review candidates, not legally verified additions/removals.

Date-only document metadata changes should be separated from substantive regulatory changes.

---

## 13. Current Colab Artifact Locations

Google Drive root:

```text
/content/drive/MyDrive/ReguLens/
```

### Acquisition

```text
data/raw/rbi/discovered_documents.csv
data/raw/rbi/discovered_documents_clean.csv
data/raw/rbi/acquisition_metadata.csv
```

### Raw PDFs

```text
data/raw/rbi/pdfs/
```

Verified PSL 2020 document:

```text
data/raw/rbi/pdfs/rbi_psl_2020_official.pdf
```

### Extracted Text

```text
data/processed/text/
```

### General Clause Dataset

```text
data/processed/clauses/regulatory_clauses.csv
```

### Core NLP

```text
data/processed/clauses/nlp_annotations/core_nlp_annotations.jsonl
```

Contains tokenization, lemmas, POS/tag information, dependencies, noun chunks and generic NLP annotations.

### Enhanced Domain NER

```text
data/processed/clauses/nlp_annotations/enhanced_domain_ner_annotations.jsonl
```

### Annotation Data

```text
data/annotations/regulens_annotation_sample.csv
data/annotations/validated/regulens_llm_annotations_300.csv
data/annotations/validated/regulens_llm_annotation_checkpoint.csv
data/annotations/validated/regulens_human_audit_50.csv
data/annotations/validated/regulens_50_for_chatgpt_validation.csv
```

The filename containing "human_audit" is historical naming. It must not be described as a human gold-standard dataset.

### Final Classification Dataset

```text
data/final/regulens_silver_classification_dataset.csv
```

### Structured Requirements

```text
data/final/regulens_structured_requirements.csv
data/final/regulens_structured_requirements_v3.csv
```

V3 is the preferred baseline.

### Models / Embeddings

```text
models/similarity/regulens_minilm_embeddings.npy
```

### Metrics

```text
results/metrics/regulens_tfidf_logistic_cv_results.csv
results/metrics/regulens_tfidf_logistic_cv_summary.csv
results/metrics/regulens_semantic_classifier_cv_results.csv
results/metrics/regulens_semantic_classifier_cv_summary.csv
results/metrics/regulens_obligation_extraction_coverage.json
results/metrics/regulens_obligation_extraction_v3_coverage.json
results/metrics/regulens_document_inventory.csv
results/metrics/regulens_candidate_document_pairs.csv
results/metrics/regulens_document_titles.csv
results/metrics/regulens_psl_regulatory_change_intelligence_v1.csv
results/metrics/regulens_psl_regulatory_change_intelligence_v2.csv
results/metrics/regulens_psl_regulatory_change_intelligence_summary_v2.json
```

### PSL Version Comparison

```text
data/processed/clauses/psl_version_comparison/
├── psl_2020_main_clauses_v3.csv
└── psl_2025_main_clauses_v3.csv
```

---

## 14. Required Application Architecture

Frontend:

```text
React + JavaScript
```

Do NOT use TypeScript.

Backend:

```text
Python + FastAPI
```

Database/auth direction:

```text
Firebase / Firestore
```

where persistent application data is required.

Current NLP artifacts can initially be served from processed files through FastAPI. Keep the architecture modular so NLP processing can later become dedicated backend services.

---

## 15. Frontend Design Philosophy

The UI must look like a serious regulatory intelligence platform, not a generic college CRUD application.

Desired:
- premium fintech / enterprise intelligence aesthetic
- polished
- modern
- responsive
- smooth animations
- clear information hierarchy
- excellent typography
- meaningful data visualizations
- professional dashboard
- strong landing page
- interactive regulatory comparison
- explainable NLP processing

Avoid:
- generic admin templates
- excessive glassmorphism
- random gradients
- meaningless animations
- excessive rounded cards
- chatbot-only UI
- hiding NLP processing behind a single "Analyze" button

---

## 16. Critical Explainability Requirement

When a clause is analyzed, the UI should be able to show something like:

```text
RAW CLAUSE
↓
CLAUSE SEGMENTATION
↓
TOKENS
[Financial] [institutions] [shall] [submit] ...
↓
LEMMAS
[financial] [institution] [shall] [submit] ...
↓
POS
institutions → NOUN
shall → AUX
submit → VERB
↓
DOMAIN NER
institutions → REGULATED_ENTITY
RBI → REGULATOR
15 days → DEADLINE
↓
DEPENDENCY
institutions → subject
submit → root
shall → auxiliary
↓
CLAUSE TYPE
OBLIGATION
↓
STRUCTURED REQUIREMENT
subject = Financial institutions
modality = shall
action = submit
deadline = 15 days
```

Possible UI presentation:
- animated pipeline
- processing timeline
- expandable NLP stages
- token/entity highlighting
- dependency visualization
- before/after comparison
- evidence panel

---

## 17. Landing Page Direction

The landing page should communicate:

"Regulatory change is not just about reading documents. It's about understanding what changed, why it changed, and what it means."

Possible CTAs:
- Compare Regulations
- Explore NLP Pipeline
- View Demo

Possible sections:
1. Hero
2. Regulatory problem
3. How ReguLens works
4. NLP pipeline visualization
5. Change detection demonstration
6. Before vs After example
7. Intelligence dashboard preview
8. Explainability section
9. NLP architecture
10. Final CTA
11. Footer

---

## 18. Development Workflow

### Stage 0 — Initialization
1. Create root project.
2. Create complete directory structure.
3. Install frontend/backend dependencies.
4. Configure environment files.
5. Verify frontend/backend startup.

### Stage 1 — UI
Build screen-by-screen.

For each major screen:
1. Generate a visual reference image.
2. Provide a natural-language Antigravity implementation command together with the image.
3. User runs it.
4. User reports output/screenshot.
5. Refine only when necessary.

Do NOT dump all UI implementation commands at once.

### Stage 2 — Backend
Implement sequentially:
```text
FastAPI foundation
↓
Configuration
↓
Data/artifact loaders
↓
NLP service layer
↓
Regulatory document service
↓
Clause analysis API
↓
Change comparison API
↓
Search API
↓
Dashboard statistics API
↓
Compliance-gap API
↓
Firebase integration if required
↓
Error handling
↓
Validation
↓
Testing
```

### Stage 3 — Integration
Connect React screens to real FastAPI APIs and real processed NLP artifacts.

### Stage 4 — Testing & Demo
Validate APIs, UI flows, NLP evidence, comparison outputs and final presentation/demo.

---

## 19. Antigravity Instructions

Antigravity is the coding agent.

Commands must be:
- natural language
- precise
- self-contained
- implementation-oriented
- aware of existing files
- safe to execute incrementally

When modifying existing code:
- inspect existing implementation first
- do not overwrite working modules unnecessarily
- preserve current functionality
- use reusable components
- keep frontend/backend separated
- avoid TypeScript
- document non-obvious logic

---

## 20. Recommended Repository Structure

```text
ReguLens/
├── context.md
├── README.md
├── .gitignore
├── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── sections/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── data/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── nlp/
│   │   │   ├── regulatory/
│   │   │   ├── comparison/
│   │   │   └── compliance/
│   │   ├── utils/
│   │   └── main.py
│   ├── data/
│   │   ├── raw/
│   │   │   └── rbi/
│   │   │       └── pdfs/
│   │   ├── processed/
│   │   │   ├── text/
│   │   │   └── clauses/
│   │   │       ├── nlp_annotations/
│   │   │       └── psl_version_comparison/
│   │   ├── annotations/
│   │   ├── final/
│   │   ├── models/
│   │   └── metrics/
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── ui/
│   └── report/
│
├── scripts/
├── tests/
└── exports/
```

---

## 21. Exact Placement of Important Colab Artifacts

Copy these into the application repository as follows:

```text
Colab:
data/final/regulens_silver_classification_dataset.csv
→
backend/data/final/regulens_silver_classification_dataset.csv
```

```text
Colab:
data/final/regulens_structured_requirements_v3.csv
→
backend/data/final/regulens_structured_requirements_v3.csv
```

```text
Colab:
results/metrics/regulens_psl_regulatory_change_intelligence_v2.csv
→
backend/data/final/regulens_psl_regulatory_change_intelligence_v2.csv
```

```text
Colab:
data/processed/clauses/regulatory_clauses.csv
→
backend/data/processed/clauses/regulatory_clauses.csv
```

```text
Colab:
data/processed/clauses/nlp_annotations/enhanced_domain_ner_annotations.jsonl
→
backend/data/processed/clauses/nlp_annotations/enhanced_domain_ner_annotations.jsonl
```

```text
Colab:
data/processed/clauses/psl_version_comparison/psl_2020_main_clauses_v3.csv
→
backend/data/processed/clauses/psl_version_comparison/psl_2020_main_clauses_v3.csv
```

```text
Colab:
data/processed/clauses/psl_version_comparison/psl_2025_main_clauses_v3.csv
→
backend/data/processed/clauses/psl_version_comparison/psl_2025_main_clauses_v3.csv
```

Metrics:

```text
results/metrics/regulens_tfidf_logistic_cv_summary.csv
→ backend/data/metrics/

results/metrics/regulens_semantic_classifier_cv_summary.csv
→ backend/data/metrics/

results/metrics/regulens_obligation_extraction_v3_coverage.json
→ backend/data/metrics/

results/metrics/regulens_psl_regulatory_change_intelligence_summary_v2.json
→ backend/data/metrics/
```

Raw PDFs:

```text
data/raw/rbi/pdfs/
→
backend/data/raw/rbi/pdfs/
```

Only copy the PDFs needed for the demo initially, especially the verified PSL 2020/2025 comparison documents. Do not unnecessarily commit hundreds of large PDFs.

---

## 22. Data Integrity Rules

Distinguish:

### Source Data
Official regulatory documents and extracted clauses.

### Experimental NLP Outputs
NER, POS, dependency, classification and extraction results.

### Derived Results
Semantic embeddings, alignment and change intelligence.

### Candidate Results
Added/removed provisions requiring review.

Never present experimental outputs as legal truth.

---

## 23. Final Demonstration Goal

A evaluator should be able to:

1. Open ReguLens.
2. Understand the regulatory problem immediately.
3. Select or upload two regulatory versions.
4. Start analysis.
5. See the NLP processing pipeline.
6. Inspect tokens, POS, entities and extracted requirements.
7. Compare old and new clauses.
8. See exactly what changed.
9. See change type and materiality.
10. See evidence supporting the detected change.
11. Inspect added/removed candidates separately.
12. Search regulatory content.
13. Understand potential compliance impact.

Key differentiator:

> ReguLens does not merely say that regulations changed. It shows the NLP evidence for what changed, how it changed, and why the change may matter.

---

## 24. Non-Negotiable Constraints

- Frontend: React + JavaScript
- Backend: Python + FastAPI
- No TypeScript
- NLP must remain visible/explainable
- Do not fabricate NLP metrics
- Do not claim candidate additions/removals are legally verified
- Do not call the 50-clause audit a human gold standard
- Preserve existing NLP artifacts
- Do not unnecessarily repeat Colab experiments
- Build incrementally
- Use visual references before implementing major UI screens
- Use Antigravity for coding
- Give Antigravity natural-language commands
- Keep the application modular and production-like
- Prioritize a polished demo suitable for academic NLP evaluation
