# ReguLens — NLP-Based Regulatory Change Detection & Compliance Intelligence

> **Academic Title:** *An NLP-Based Framework for Regulatory Requirement Extraction, Semantic Change Detection and Compliance Gap Analysis*  
> **Repository Tagline:** *NLP-powered regulatory change detection and compliance intelligence platform for extracting obligations, comparing regulatory versions, and mapping requirements to company policies.*

---

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg?style=flat-square&logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![spaCy](https://img.shields.io/badge/spaCy-3.8%2B-09A3D5.svg?style=flat-square&logo=spacy)](https://spacy.io/)
[![Sentence Transformers](https://img.shields.io/badge/Sentence--Transformers-all--MiniLM--L6--v2-FFA800.svg?style=flat-square)](https://www.sbert.net/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 1. Overview

**ReguLens** is an end-to-end Natural Language Processing (NLP) framework and interactive compliance intelligence application designed to analyze regulatory texts, track semantic modifications across regulatory revisions, extract deontic requirement tuples, and evaluate company policy alignment.

Built specifically for complex, highly structured financial and banking regulations (such as Reserve Bank of India Master Directions and circulars), ReguLens addresses the critical operational bottleneck of manual regulatory monitoring. It automatically segments clauses, parses syntactic dependencies, classifies regulatory functions, detects parameter-level shifts (e.g., review frequency, reporting deadlines, monetary thresholds), and identifies potential compliance gaps in corporate internal policies.

```
                      REGULENS END-TO-END INTELLIGENCE FLOW
  =============================================================================

   Baseline Regulation (2020/2024)         Target Regulation (2025)
          [ PDF / DOCX ]                        [ PDF / DOCX ]
                │                                     │
                ▼                                     ▼
        ┌─────────────────────────────────────────────────────┐
        │       Dynamic Multi-Stage NLP Analysis Pipeline     │
        │  Clause Segmentation · POS · Lemmatization · NER    │
        │   Dependency Parsing · Requirement Decomposition    │
        └──────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
        ┌─────────────────────────────────────────────────────┐
        │         Regulatory Change Intelligence Engine       │
        │   Semantic Vector Alignment (Sentence-Transformers) │
        │    TF-IDF Lexical Similarity · Parameter Diffing    │
        │      Materiality Assessment (High / Medium / Low)   │
        └──────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
   Company Policy [PDF] ──► ┌─────────────────────────────────┐
                            │  Company Policy Mapping Engine  │
                            │  Two-Stage Candidate Retrieval  │
                            │  Deterministic Rule Evaluator   │
                            └──────────────┬──────────────────┘
                                           │
                                           ▼
                            ┌─────────────────────────────────┐
                            │    Interactive Results Screen   │
                            │  • Verifiable Clause Citations  │
                            │  • Compliance Gap Breakdown     │
                            │  • Groq LLM Advisory Guidance   │
                            └─────────────────────────────────┘
```

---

## 2. Problem Statement

Financial institutions operate under strict, frequently amended regulatory frameworks. When a central regulatory authority (such as the RBI) issues an updated Master Direction or circular, compliance officers and legal teams face significant challenges:

1. **Volume & Density:** Regulatory documents frequently span dozens of pages with nested numbering, cross-references, and dense legal terminology.
2. **Subtle Parameter Shifts:** Critical amendments often involve minor numerical or temporal adjustments (e.g., changing a review window from *24 months* to *12 months*, or reducing an escalation window from *14 days* to *7 days*) that are easily overlooked in manual side-by-side reading.
3. **Deontic Nuance:** Minor modal shifts (e.g., changing *"entities may submit"* to *"entities shall submit"*) transform discretionary recommendations into legally binding obligations.
4. **Internal Alignment Lag:** Mapping external regulatory modifications to internal company operating procedures and standard operating procedures (SOPs) requires tedious clause-by-clause manual verification.

---

## 3. Why ReguLens

ReguLens provides an evidence-grounded, explainable solution combining computational linguistics with modern retrieval techniques:

- **Deterministic Source of Truth:** Compliance determinations (`COMPLIANT`, `PARTIAL_MATCH`, `NON_COMPLIANT`, `NO_MATCH_FOUND`) and parameter discrepancy checks are computed deterministically via extracted semantic constraints—not unconstrained LLM hallucinations.
- **Two-Stage Matching Architecture:** Combines fast vector/lexical candidate retrieval (`all-MiniLM-L6-v2` embeddings + TF-IDF) with fine-grained deontic and parameter comparison.
- **Live Sequential Processing Playback:** Provides real-time visual progress across all 12 pipeline stages during dynamic analysis, allowing users to inspect individual token lemmas, POS tags, syntactic dependencies, and extracted requirements.
- **Explainable Evidence:** Every mapping record maintains verifiable bidirectional citations (Document ID, Clause ID, Provision ID, and verbatim text).
- **Optional Advisory AI Layer:** Integrated with Groq LLM (`openai/gpt-oss-120b`) strictly as an advisory explanation and remediation synthesizer, keeping the core compliance evaluation deterministic.

---

## 4. Key Features

### A. Dynamic Regulatory Document Ingestion
- Upload arbitrary baseline and revised regulatory documents in **PDF** or **DOCX** format.
- Automatic text extraction, page numbering normalization, and structural clause boundary segmentation.

### B. Multi-Stage NLP Feature Extraction
- **Tokenization & Normalization:** Word tokenization, lowercasing, punctuation stripping, and lemmatization via spaCy.
- **POS Tagging & Dependency Parsing:** Identifies modal auxiliaries (`shall`, `must`, `may`, `should`), root action verbs, subjects, direct objects, and prepositional modifiers.
- **Domain-Specific Named Entity Recognition (NER):** Extracts financial regulators (`RBI`, `SEBI`), regulated entities (`Scheduled Commercial Banks`, `NBFCs`), compliance instruments, and temporal constraints.
- **Regulatory Function Classification:** Classifies clauses into 6 core deontic categories: `OBLIGATION`, `PROHIBITION`, `PERMISSION`, `REPORTING`, `PROCEDURE`, and `DEFINITION`.
- **Structured Requirement Decomposition:** Parses clauses into structured tuples containing `(Subject, Modality, Action, Object, Deadline, Duration, Monetary Threshold, Condition)`.

### C. Regulatory Change Detection & Materiality Assessment
- Pairs corresponding clauses across regulatory versions and categorizes changes into:
  - **Substantive Modifications** (High/Medium Materiality)
  - **Wording-Only Changes** (Low Materiality)
  - **Added Candidates** (New provisions identified in target regulation)
  - **Removed Candidates** (Baseline provisions not retained in target regulation)
  - **Unchanged Provisions** (Identical operational requirements)

### D. Company Policy Mapping & Compliance Impact
- Ingests internal company policy documents dynamically.
- Selects enforceable regulatory requirements (excluding purely informational, reference, or title clauses).
- Matches policy clauses against regulatory mandates using Sentence-Transformers and TF-IDF similarity.
- Evaluates parameter-level compliance:
  - **Duration Mismatches** (e.g., mandatory 12-month review vs. internal 24-month policy)
  - **Deadline Mismatches** (e.g., 7-day reporting requirement vs. internal 15-day escalation SLA)
  - **Monetary Threshold Mismatches** (e.g., Rs. 5 Lakh threshold vs. Rs. 10 Lakh internal policy)
  - **Modality Shifts** (e.g., mandatory regulatory obligation reduced to discretionary permission)

### E. Advisory AI & Evidence Inspection
- Slide-over evidence drawer displaying exact regulatory citations alongside matched policy text.
- On-demand synthesized advisory remediation advice via Groq LLM (`openai/gpt-oss-120b`).

---

## 5. End-to-End NLP Architecture

```
                               THE 12 PIPELINE STAGES
  ┌─────────────────────────────────────────────────────────────────────────┐
  │  Stage 01: Document Ingestion & Text Extraction (PyMuPDF / docx)        │
  │  Stage 02: Structural Clause Boundary Segmentation                      │
  │  Stage 03: Tokenization, Case Normalization & Stopword Handling         │
  │  Stage 04: Morphological Analysis & Lemmatization (spaCy)               │
  │  Stage 05: Part-of-Speech Tagging & Modal Auxiliary Detection           │
  │  Stage 06: Syntactic Dependency Parsing & Argument Extraction           │
  │  Stage 07: Domain-Specific Named Entity Recognition (NER)               │
  │  Stage 08: Regulatory Function Classification (6 Deontic Classes)       │
  │  Stage 09: Structured Requirement Tuple Extraction                      │
  │  Stage 10: Semantic Vector Embedding & Lexical Alignment                │
  │  Stage 11: Change Type Classification & Materiality Rating              │
  │  Stage 12: Company Policy Mapping & Compliance Impact Analysis          │
  └─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Technology Stack

### Backend
| Component | Technology / Library | Purpose |
| :--- | :--- | :--- |
| **Framework** | FastAPI (Python 3.10+) | High-performance asynchronous REST API backend |
| **Server** | Uvicorn | ASGI web server |
| **Linguistics / NLP** | spaCy (`en_core_web_sm`) | Lemmatization, POS tagging, dependency parsing |
| **Vector Embeddings** | Sentence-Transformers (`all-MiniLM-L6-v2`) | Semantic clause embeddings and cosine similarity |
| **Machine Learning** | scikit-learn | TF-IDF vectorization, Logistic Regression baseline |
| **PDF Extraction** | PyMuPDF (`fitz`) | High-speed PDF text and layout parsing |
| **DOCX Extraction** | python-docx | Word document parsing |
| **Data Models** | Pydantic v2 | Strict schema validation and serialization |
| **Advisory LLM** | Groq Python SDK (`openai/gpt-oss-120b`) | Advisory executive summary and remediation insights |
| **Testing** | pytest, pytest-asyncio | Comprehensive test suite (76 automated unit/e2e tests) |

### Frontend
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React 19 | Component-based interactive user interface |
| **Bundler / Tooling** | Vite 6 | Development server and production bundling |
| **Styling** | Tailwind CSS | Modern responsive design system |
| **Icons** | Lucide React | Clean, scalable icon system |
| **Charts** | Recharts | Distribution visualizations |
| **HTTP Client** | Native Fetch API | Direct communication with backend REST endpoints |

---

## 7. Repository Structure

```
ReguLens/
├── backend/
│   ├── app/
│   │   ├── api/                     # FastAPI Route Controllers
│   │   │   ├── analysis.py          # Precomputed PSL comparison endpoints
│   │   │   ├── analysis_jobs.py     # Dynamic analysis lifecycle & playback
│   │   │   ├── documents.py         # Document upload & ingestion endpoints
│   │   │   ├── health.py            # Health & system integrity checks
│   │   │   ├── nlp.py               # NLP metrics, entities, and coverage
│   │   │   ├── policy_mapping.py    # Company Policy Mapping & Groq advisory
│   │   │   └── regulations.py       # Regulatory catalog management
│   │   ├── schemas/                 # Pydantic Schemas & DTOs
│   │   │   ├── analysis.py
│   │   │   ├── analysis_job.py
│   │   │   ├── dynamic_nlp.py
│   │   │   ├── nlp.py
│   │   │   ├── policy_mapping.py
│   │   │   └── regulation.py
│   │   ├── services/                # Core Business Logic & NLP Engines
│   │   │   ├── compliance/
│   │   │   │   ├── groq_service.py           # Groq LLM advisory client
│   │   │   │   ├── policy_mapping_service.py # Two-stage matching & constraint rules
│   │   │   │   └── policy_nlp_service.py     # Policy extraction & parameter regexes
│   │   │   ├── analysis_job_service.py       # Job manager & sequential playback
│   │   │   ├── analysis_service.py           # PSL baseline analysis provider
│   │   │   ├── data_repository.py            # Local dataset repository & indexer
│   │   │   ├── document_upload_service.py    # Runtime file storage & text parser
│   │   │   ├── dynamic_comparison_service.py # Pairwise regulatory comparison engine
│   │   │   ├── dynamic_nlp_pipeline.py       # Dynamic spaCy/dependency pipeline
│   │   │   ├── nlp_service.py                # Precomputed NLP artifact service
│   │   │   └── regulation_service.py         # Document resolver
│   │   ├── config.py                # Application configuration & settings
│   │   ├── dependencies.py          # Dependency injection providers
│   │   └── main.py                  # FastAPI application entry point
│   ├── data/                        # Datasets, Annotations & Reference Documents
│   │   ├── annotations/             # 300 LLM annotations + 50 audit subset
│   │   ├── final/                   # Precomputed PSL 2020 vs 2025 change intelligence
│   │   ├── metrics/                 # Cross-validation & coverage metrics
│   │   ├── processed/               # Document catalog & acquisition metadata
│   │   └── raw/rbi/pdfs/            # Official RBI reference PDFs
│   ├── tests/                       # Automated Pytest Suite (76 tests)
│   │   ├── test_analysis.py
│   │   ├── test_analysis_jobs.py
│   │   ├── test_data_repository.py
│   │   ├── test_document_upload.py
│   │   ├── test_dynamic_comparison.py
│   │   ├── test_dynamic_nlp_pipeline.py
│   │   ├── test_health.py
│   │   ├── test_nlp.py
│   │   ├── test_policy_e2e_integration.py
│   │   ├── test_policy_mapping.py
│   │   └── test_regulations.py
│   ├── .env.example                 # Backend environment variable template
│   └── requirements.txt             # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/              # Modular UI Components
│   │   │   ├── analysis/            # Results header, change table, filters
│   │   │   ├── compliance/          # Policy metric cards, insights, table, drawer
│   │   │   ├── documents/           # Upload cards & document selectors
│   │   │   └── layout/              # Navbar, sidebar, footer
│   │   ├── pages/                   # Main Page Views
│   │   │   ├── AnalysisResults.jsx  # Primary results screen
│   │   │   ├── ProcessingPage.jsx   # Live clause playback & pipeline progress
│   │   │   ├── NewAnalysis.jsx      # Document selection & upload setup
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js               # Centralized API client
│   │   ├── App.jsx                  # Root router & layout
│   │   └── main.jsx                 # Application mount point
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example                 # Frontend environment template
├── .env.example                     # Root environment template
├── .gitignore                       # Clean Git exclusion rules
├── LICENSE                          # MIT License
└── README.md                        # Documentation
```

---

## 8. Experimental Evaluation & Data Metrics

The ReguLens experimental dataset and evaluation framework were benchmarked across Reserve Bank of India Priority Sector Lending (PSL) regulatory documents:

### Verified PSL 2020 vs 2025 Benchmark Comparison
- **Indexed Document Catalog:** 41 regulatory documents
- **Total Comparative Provisions Analyzed:** 63 records
  - **Substantive Modifications:** 31
  - **Administrative Changes:** 4
  - **Wording-Only Changes:** 7
  - **Added Candidates:** 7 *(clearly labeled as analytical candidates)*
  - **Removed Candidates:** 12 *(clearly labeled as analytical candidates)*
  - **Unchanged Provisions:** 2

### Regulatory Function Classification Evaluation
Evaluated across 300 annotated clauses with an independent 50-clause human validation audit subset (44/50 agreement = **88.0% validation accuracy**):

| Model / Classifier | Accuracy | Macro Precision | Macro Recall | Macro F1 | Weighted F1 |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **TF-IDF + Logistic Regression** | 52.00% ± 4.88% | 48.78% ± 6.10% | 47.95% ± 6.95% | 46.58% ± 5.87% | 51.29% ± 4.31% |
| **Sentence-Transformer Classifier** | 44.33% ± 5.54% | 41.41% ± 8.07% | 40.30% ± 8.49% | 39.82% ± 8.37% | 44.12% ± 5.51% |

### Requirement Extraction & Domain NER Statistics
- **Total Clauses Evaluated:** 5,842 clauses
- **Requirement-Bearing Clauses Identified:** 1,756 clauses
- **Extracted Structural Tuples:**
  - Subjects Extracted: 2,009
  - Root Actions Extracted: 2,144
  - Modalities Detected: 2,177
  - Temporal Deadlines Detected: 139
  - Durations / Review Periods Detected: 357
- **Domain Named Entity Mentions:** 7,445 mentions across 2,456 entity-bearing clauses.

*(Note: These figures reflect the current ReguLens experimental corpus and setup, not universal production benchmarks.)*

---

## 9. Quick Start Guide

### Prerequisites
- **Python:** 3.10 or higher
- **Node.js:** 18.x or higher
- **Git:** 2.x

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Zahid-Ham/ReguLens.git
cd ReguLens
```

---

### Step 2: Backend Setup (Windows PowerShell / CMD)

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download required spaCy language model
python -m spacy download en_core_web_sm

# (Optional) Copy environment template
cp .env.example .env
```

#### Optional: Configure Groq API Key
If you wish to enable the optional AI advisory explanations:
```env
# In backend/.env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
```
*(If unconfigured, all deterministic NLP comparison, change detection, and policy gap features remain fully operational.)*

#### Start the Backend Server:
```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **API Base URL:** `http://localhost:8000`
- **Interactive Swagger Documentation:** `http://localhost:8000/docs`
- **ReDoc Documentation:** `http://localhost:8000/redoc`

---

### Step 3: Frontend Setup

Open a separate terminal window:

```powershell
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start development server
npm run dev
```
- **Frontend Web UI:** `http://localhost:5173`

---

### Step 4: Run Automated Verification Tests

```powershell
# Run the complete backend test suite (76 tests)
cd backend
.\.venv\Scripts\python.exe -m pytest tests -v

# Run the frontend production build
cd ../frontend
npm run build
```

---

## 10. API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health and runtime environment status |
| `GET` | `/api/regulations` | Catalog of indexed regulatory documents |
| `POST` | `/api/documents/upload` | Upload PDF/DOCX regulatory or policy documents |
| `POST` | `/api/analysis` | Create a comparative analysis job between two documents |
| `GET` | `/api/analysis/{id}/status` | Check live execution progress and pipeline stages |
| `GET` | `/api/analysis/{id}/changes` | Retrieve filtered regulatory change intelligence records |
| `GET` | `/api/analysis/{id}/changes/{change_id}` | Granular side-by-side comparative clause detail |
| `GET` | `/api/analysis/{id}/policy-mapping` | Complete Company Policy Mapping dataset & metrics |
| `GET` | `/api/analysis/{id}/policy-mapping/summary` | Aggregate compliance metrics, gap counts, and recommendations |
| `GET` | `/api/analysis/{id}/policy-mapping/{mapping_id}` | Single policy mapping evidence record |
| `POST` | `/api/analysis/{id}/policy-mapping/insights` | Generate executive advisory insights via Groq LLM |
| `POST` | `/api/analysis/{id}/policy-mapping/{mapping_id}/explain` | Generate single-gap advisory explanation via Groq LLM |

---

## 11. Example Workflow

1. **Initiate Analysis:** Navigate to `New Analysis` (`/analysis/new`). Select a baseline regulation (e.g., *2020 Master Direction*) and target regulation (e.g., *2025 Master Direction*), or upload your own PDF/DOCX files. Optionally upload an internal company policy PDF.
2. **Real-Time Processing:** Observe the 12-stage sequential playback on `/analysis/processing`, displaying live clause segmentation, POS highlights, dependency links, and extracted deontic tuples.
3. **Inspect Changes:** On `/analysis/results`, view the prioritized change distribution table (Substantive Modifications sorted by materiality, Wording-Only, Added/Removed Candidates).
4. **Evaluate Compliance Gaps:** Scroll to the **Company Policy Mapping & Compliance Impact** section to review coverage metrics (Total Requirements, Mapped Clauses, Policy Gaps, Partial Matches).
5. **View Citations:** Open the **Evidence Drawer** to inspect side-by-side regulatory and policy clauses along with parameter diff breakdowns (Duration, Deadline, Monetary Threshold).
6. **Synthesize Guidance:** Click *"Generate Detailed Insights"* to receive an advisory executive narrative and remediation recommendations.

---

## 12. Limitations & Responsible Use

### Academic & Research Context
ReguLens was developed as an academic and practical NLP research project demonstrating computational linguistics and machine learning applied to legal/regulatory text processing.

### Analytical Assistance vs. Authoritative Legal Interpretation
- **Decision-Support Only:** ReguLens is an analytical tool designed to accelerate regulatory discovery and highlight potential discrepancies. It **does not** provide legal advice or automated legal certification.
- **Candidate Alignment:** Clauses identified as *"Added"* or *"Removed"* are labeled as **Candidates** and represent analytical alignment outputs that require verification by human domain experts.
- **Terminology:** All compliance evaluations identify *"Potential Compliance Gaps"* and must be validated by qualified compliance professionals.

---

## 13. License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 14. Acknowledgments & References

- **Reserve Bank of India (RBI):** Master Directions and Priority Sector Lending (PSL) regulatory notifications.
- **spaCy:** Industrial-strength Natural Language Processing in Python.
- **Sentence-Transformers:** Multilingual sentence, paragraph, and image embeddings using BERT/RoBERTa architectures.
- **FastAPI & React:** Modern, high-performance web engineering foundations.
