# ReguLens — NLP-Based Regulatory Change Detection & Compliance Intelligence

<div align="center">

![ReguLens](https://img.shields.io/badge/ReguLens-Regulatory%20AI-0F172A?style=for-the-badge&logo=shield&logoColor=38BDF8)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![spaCy](https://img.shields.io/badge/spaCy-3.8+-09A3D5?style=for-the-badge&logo=spacy&logoColor=white)
![Sentence Transformers](https://img.shields.io/badge/SBERT-all--MiniLM--L6--v2-FFA800?style=for-the-badge&logo=huggingface&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)

### ⚡ 12-Stage NLP Pipeline • 🎯 Deontic Requirement Extraction • 🔍 Semantic Change Detection • 🏢 Policy Gap Analysis • 🤖 Advisory AI

*An NLP-Powered Framework for Regulatory Requirement Extraction, Semantic Change Detection, and Company Policy Compliance Gap Analysis.*

[Quick Start](#-quick-start-guide) • [Key Features](#-key-features) • [Architecture](#%EF%B8%8F-end-to-end-nlp-architecture) • [Environment Config](#%EF%B8%8F-environment-configuration-guide) • [API Reference](#-api-endpoints--usage) • [Contributing](#-contributing)

</div>

---

## 📌 Repository Tagline & Highlights

> **"NLP-powered regulatory change detection and compliance intelligence platform for extracting obligations, comparing regulatory versions, and mapping requirements to company policies."**

- **🎯 Deterministic Source of Truth:** Compliance gap verification (`COMPLIANT`, `PARTIAL_MATCH`, `NON_COMPLIANT`, `NO_MATCH_FOUND`) and parameter diffs are computed deterministically via parsed semantic constraints—eliminating ungrounded LLM hallucinations.
- **🔄 Two-Stage Alignment Engine:** Blends high-dimensional semantic vector embeddings (`all-MiniLM-L6-v2`) and TF-IDF lexical matching with syntactic dependency and deontic modality verification.
- **⏱️ Live Sequential Playback:** Real-time visual feedback across all 12 pipeline stages during dynamic analysis, inspecting individual token lemmas, POS tags, syntactic dependencies, and extracted requirements.
- **📑 Verifiable Bidirectional Evidence:** Every finding links directly to immutable document, clause, and provision citations.
- **🤖 Grounded Advisory AI Layer:** Powered by Groq LPU inference (`openai/gpt-oss-120b`) for executive summaries and actionable remediation roadmaps without compromising core deterministic evaluation.

---

## 🚀 Overview

**ReguLens** is an advanced Natural Language Processing (NLP) framework and enterprise-grade compliance intelligence platform. It automates the extraction, semantic comparison, and company policy alignment of complex regulatory circulars, master directions, and compliance mandates (such as Reserve Bank of India Master Directions).

### The Challenge

Financial institutions face continuous regulatory churn. When central authorities issue revisions, legal and compliance teams struggle with:
1. **Document Volume & Density:** Dense circulars spanning dozens of pages with deeply nested provisions and cross-references.
2. **Subtle Parameter Shifts:** Minor numerical or temporal modifications (e.g., reporting window reduced from *14 days* to *7 days*, or review frequency shifted from *24 months* to *12 months*) that easily escape manual side-by-side reviews.
3. **Deontic Nuance:** Subtle auxiliary verb shifts (e.g., *"entities may report"* vs. *"entities shall report"*) that alter legal enforceability.
4. **Internal Policy Lag:** Tedious manual mapping of external regulatory amendments against internal Standard Operating Procedures (SOPs).

### The ReguLens Solution

ReguLens ingests baseline and revised regulatory circulars alongside internal company policy documents, automatically segments text into atomic clauses, parses syntactic dependencies, classifies regulatory functions, detects parameter-level shifts, and pinpoints actionable compliance gaps.

```
                      REGULENS COMPLIANCE INTELLIGENCE WORKFLOW
  ===================================================================================

    Baseline Regulation (PDF/DOCX)           Target Regulation (PDF/DOCX)
                 │                                        │
                 ▼                                        ▼
         ┌────────────────────────────────────────────────────────┐
         │       Dynamic Multi-Stage NLP Analysis Pipeline        │
         │   Segmentation · Lemmatization · POS · Dependency      │
         │     Domain NER · Deontic Classification · Tuples       │
         └───────────────────────────┬────────────────────────────┘
                                     │
                                     ▼
         ┌────────────────────────────────────────────────────────┐
         │         Regulatory Change Intelligence Engine          │
         │    Semantic Vector Embedding · TF-IDF Similarity       │
         │  Parameter Diffing · Materiality Rating (High/Med/Low) │
         └───────────────────────────┬────────────────────────────┘
                                     │
                                     ▼
    Company Policy (PDF) ──► ┌───────────────────────────────────┐
                             │   Company Policy Mapping Engine   │
                             │   Two-Stage Candidate Retrieval   │
                             │   Deterministic Rule Evaluator    │
                             └───────────────┬───────────────────┘
                                             │
                                             ▼
                             ┌───────────────────────────────────┐
                             │    Interactive Results Screen     │
                             │   • Verifiable Clause Citations   │
                             │   • Parameter Discrepancy Breakdown│
                             │   • Groq LLM Advisory Insights    │
                             └───────────────────────────────────┘
```

---

## ✨ Key Features

### 📄 1. Dynamic Multi-Format Ingestion
- Ingest arbitrary baseline and target regulatory documents in **PDF** and **DOCX** formats.
- High-precision text extraction with layout preservation, header/footer normalization, and structural clause boundary segmentation.

### 🧠 2. Deep Computational Linguistics Pipeline
- **Morphological Analysis:** Word tokenization, case normalization, stopword filtering, and lemmatization via spaCy (`en_core_web_sm`).
- **POS & Deontic Tagging:** Identifies modal auxiliaries (`shall`, `must`, `should`, `may`, `prohibited`), root action verbs, subject entities, and direct objects.
- **Domain-Specific Named Entity Recognition (NER):** Extracts financial regulators (`RBI`, `SEBI`), regulated institutions (`Commercial Banks`, `NBFCs`), compliance instruments, and temporal constraints.
- **Deontic Classification:** Categorizes clauses into 6 regulatory functions: `OBLIGATION`, `PROHIBITION`, `PERMISSION`, `REPORTING`, `PROCEDURE`, and `DEFINITION`.
- **Structured Requirement Tuples:** Extracts normalized tuples: `(Subject, Modality, Action, Object, Deadline, Duration, Monetary Threshold, Condition)`.

### 🔍 3. Regulatory Change Detection & Materiality Assessment
- Pairs baseline and target provisions using semantic similarity and categorizes shifts:
  - **Substantive Modifications** (High/Medium Materiality) — Operational changes, metric alterations, or scope expansions.
  - **Wording-Only Changes** (Low Materiality) — Stylistic clarifications without legal enforceability changes.
  - **Added Candidates** — New provisions introduced in the revised regulation.
  - **Removed Candidates** — Baseline provisions retired or unreferenced in the target regulation.
  - **Unchanged Provisions** — Operationally identical provisions.

### 🏢 4. Company Policy Mapping & Compliance Impact
- Ingests internal corporate policy documents (e.g., *Credit Risk Policy*, *KYC/AML SOPs*).
- Selects enforceable regulatory requirements and matches them against policy clauses via a two-stage retrieval pipeline (SBERT + TF-IDF).
- Deterministically identifies parameter-level compliance gaps:
  - ⏱️ **Duration Mismatches** (e.g., mandatory 12-month review vs. internal 24-month policy)
  - 📅 **Deadline Mismatches** (e.g., 7-day reporting window vs. internal 15-day escalation SLA)
  - 💰 **Threshold Mismatches** (e.g., Rs. 5 Lakh statutory limit vs. Rs. 10 Lakh internal limit)
  - ⚖️ **Modality Mismatches** (e.g., statutory mandate converted to discretionary recommendation)

### 🤖 5. Grounded Advisory AI Layer (Groq LPU)
- Generates executive summaries, prioritized remediation roadmaps, and clause-level advisory guidance using Groq's high-speed inference engine (`openai/gpt-oss-120b`).
- **Strict Guardrails:** The AI layer acts solely as an advisory synthesizer and never overrides deterministic compliance evaluation.

---

## 🏗️ End-to-End NLP Architecture

```
                                 THE 12 PIPELINE STAGES
  ┌──────────────────────────────────────────────────────────────────────────────────────────┐
  │  Stage 01: Document Ingestion & Text Extraction (PyMuPDF / python-docx)                  │
  │  Stage 02: Structural Clause Boundary & Heading Segmentation                             │
  │  Stage 03: Tokenization, Case Normalization & Noise Filtering                            │
  │  Stage 04: Morphological Analysis & Lemmatization (spaCy)                                │
  │  Stage 05: Part-of-Speech Tagging & Deontic Modal Auxiliary Detection                    │
  │  Stage 06: Syntactic Dependency Parsing & Argument Extraction                            │
  │  Stage 07: Domain-Specific Named Entity Recognition (Regulators, Entities, Instruments) │
  │  Stage 08: Regulatory Function Classification (6 Core Deontic Classes)                   │
  │  Stage 09: Structured Requirement Tuple Extraction (Subject-Modality-Action-Object)      │
  │  Stage 10: Semantic Vector Embedding (all-MiniLM-L6-v2) & Lexical TF-IDF Alignment       │
  │  Stage 11: Change Type Classification & Multi-Factor Materiality Assessment              │
  │  Stage 12: Company Policy Mapping & Deterministic Compliance Gap Detection               │
  └──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

<div align="center">

| Layer | Technologies / Libraries | Functionality |
| :--- | :--- | :--- |
| **Backend Framework** | **FastAPI** (Python 3.10+) | Asynchronous, high-throughput REST API backend |
| **Web Server** | **Uvicorn** | High-performance ASGI production server |
| **NLP & Linguistics** | **spaCy** (`en_core_web_sm`) | POS tagging, dependency parsing, lemmatization |
| **Semantic Embeddings**| **Sentence-Transformers** (`all-MiniLM-L6-v2`) | High-speed dense vector embeddings & cosine similarity |
| **Machine Learning** | **scikit-learn** | TF-IDF vectorization and cross-validated classifiers |
| **Document Processing**| **PyMuPDF** (`fitz`), **python-docx** | Robust multi-page PDF/DOCX layout parsing |
| **Schema Validation** | **Pydantic v2** | Strict data modeling, request/response validation |
| **Advisory AI** | **Groq SDK** (`openai/gpt-oss-120b`) | Ultra-fast LLM-powered advisory explanations |
| **Test Suite** | **pytest**, **pytest-asyncio** | 76 automated unit, integration, and E2E tests |
| **Frontend UI** | **React 19**, **Vite 6** | Modern component-based single-page application |
| **Styling & Icons** | **Tailwind CSS**, **Lucide React** | Sleek, responsive interface with custom theme tokens |
| **Visualizations** | **Recharts** | Dynamic change distribution & compliance charts |

</div>

---

## 📁 Repository Structure

```
ReguLens/
├── backend/
│   ├── app/
│   │   ├── api/                     # FastAPI Route Handlers
│   │   │   ├── analysis.py          # Precomputed baseline comparison endpoints
│   │   │   ├── analysis_jobs.py     # Dynamic analysis lifecycle & playback
│   │   │   ├── documents.py         # Document upload & ingestion
│   │   │   ├── health.py            # Health checks & system status
│   │   │   ├── nlp.py               # NLP metrics, entities, and coverage
│   │   │   ├── policy_mapping.py    # Company Policy Mapping & Groq advisory
│   │   │   └── regulations.py       # Regulatory catalog management
│   │   ├── schemas/                 # Pydantic Schemas & DTOs
│   │   │   ├── analysis.py
│   │   │   ├── analysis_job.py
│   │   │   ├── dynamic_nlp.py
│   │   │   ├── nlp.py
│   │   │   ├── policy_mapping.py
│   │   │   └── regulations.py
│   │   ├── services/                # Core NLP & Compliance Engines
│   │   │   ├── compliance/
│   │   │   │   ├── groq_service.py           # Groq LLM advisory client
│   │   │   │   ├── policy_mapping_service.py # Two-stage matching & constraint rules
│   │   │   │   └── policy_nlp_service.py     # Policy extraction & parameter regexes
│   │   │   ├── analysis_job_service.py       # Job manager & sequential playback
│   │   │   ├── analysis_service.py           # Baseline analysis provider
│   │   │   ├── data_repository.py            # Local dataset repository & indexer
│   │   │   ├── document_upload_service.py    # Runtime file storage & text parser
│   │   │   ├── dynamic_comparison_service.py # Pairwise regulatory comparison engine
│   │   │   ├── dynamic_nlp_pipeline.py       # Dynamic spaCy/dependency pipeline
│   │   │   ├── nlp_service.py                # Precomputed NLP artifact service
│   │   │   └── regulation_service.py         # Document resolver
│   │   ├── config.py                # Application configuration & settings
│   │   ├── dependencies.py          # Dependency injection providers
│   │   └── main.py                  # FastAPI application entry point
│   ├── data/                        # Verified Datasets, Annotations & Reference PDFs
│   │   ├── annotations/             # 300 LLM annotations + 50 audit subset
│   │   ├── final/                   # Precomputed PSL 2020 vs 2025 change intelligence
│   │   ├── metrics/                 # Cross-validation & coverage metrics
│   │   ├── processed/               # Document catalog & acquisition metadata
│   │   └── raw/rbi/pdfs/            # Official RBI reference PDFs
│   ├── tests/                       # Automated Pytest Suite (76 passing tests)
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
│   │   │   ├── AnalysisProcessing.jsx # Live clause playback & pipeline progress
│   │   │   ├── NewAnalysis.jsx      # Document selection & upload setup
│   │   │   └── LandingPage.jsx      # Public landing overview
│   │   ├── services/
│   │   │   └── api.js               # Centralized API client
│   │   ├── App.jsx                  # Root router & layout shell
│   │   └── main.jsx                 # Application entry point
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example                 # Frontend environment template
├── .env.example                     # Global environment template
├── .gitignore                       # Clean Git exclusion rules
├── LICENSE                          # MIT License
└── README.md                        # Documentation
```

---

## 🛠️ Quick Start Guide

Follow these step-by-step instructions to clone, configure, and launch ReguLens on your local machine.

### Prerequisites

| Tool | Recommended Version | Verification Command |
| :--- | :--- | :--- |
| **Python** | `3.10` or `3.11` | `python --version` |
| **Node.js** | `18.x` or `20.x` | `node --version` |
| **npm** | `9.x` or `10.x` | `npm --version` |
| **Git** | `2.x` | `git --version` |

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/Zahid-Ham/ReguLens.git
cd ReguLens
```

---

### Step 2: Backend Setup

#### On Windows (PowerShell):

```powershell
# 1. Navigate to backend directory
cd backend

# 2. Create Python virtual environment
python -m venv .venv

# 3. Activate virtual environment
.\.venv\Scripts\activate

# 4. Upgrade pip and install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# 5. Download required spaCy language model
python -m spacy download en_core_web_sm

# 6. Create local environment file from template
Copy-Item .env.example .env
```

#### On macOS / Linux (Bash):

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create Python virtual environment
python3 -m venv .venv

# 3. Activate virtual environment
source .venv/bin/activate

# 4. Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 5. Download required spaCy language model
python -m spacy download en_core_web_sm

# 6. Create local environment file from template
cp .env.example .env
```

---

### Step 3: Frontend Setup

Open a **new terminal window**:

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. (Optional) Create local environment file from template
# On Windows: Copy-Item .env.example .env
# On Mac/Linux: cp .env.example .env
```

---

### Step 4: Run the Application

#### Terminal 1 — Start FastAPI Backend:
```bash
# From the backend/ directory with active .venv:
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- 🌐 **Backend API:** `http://127.0.0.1:8000`
- 📚 **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
- 📖 **ReDoc Alternative Docs:** `http://127.0.0.1:8000/redoc`

#### Terminal 2 — Start Vite React Frontend:
```bash
# From the frontend/ directory:
npm run dev
```
- 🚀 **Web Application:** `http://localhost:5173`

---

## ⚙️ Environment Configuration Guide

ReguLens uses environment variables to configure host ports, CORS origins, and optional advisory LLM integrations.

### `.env` File Reference

Create a `.env` file in the `backend/` folder (or copy from `backend/.env.example`):

```env
# ==============================================================================
# ReguLens Backend Configuration
# ==============================================================================

# Application environment ('development' | 'production' | 'testing')
APP_ENV=development

# Backend network binding
API_HOST=0.0.0.0
API_PORT=8000

# Permitted Frontend CORS origin
FRONTEND_URL=http://localhost:5173

# ==============================================================================
# Optional Advisory AI Integration (Groq LPU)
# ==============================================================================
# Get a free key at: https://console.groq.com
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
```

### Configuration Parameters Explained

| Variable | Default Value | Required? | Description |
| :--- | :--- | :---: | :--- |
| `APP_ENV` | `development` | Optional | Runtime mode (`development`, `production`). |
| `API_HOST` | `0.0.0.0` | Optional | Interface address for the Uvicorn server. |
| `API_PORT` | `8000` | Optional | Port for the FastAPI application backend. |
| `FRONTEND_URL` | `http://localhost:5173` | Optional | Allowed origin for Cross-Origin Resource Sharing (CORS). |
| `GROQ_API_KEY` | *(empty)* | Optional | API key for generating AI advisory summaries. |
| `GROQ_MODEL` | `openai/gpt-oss-120b` | Optional | Supported Groq model for synthesis. |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Optional | *(Frontend)* Target backend API base address. |

> [!NOTE]
> **Advisory Key Decoupling:** If `GROQ_API_KEY` is not provided, the entire core NLP pipeline (clause segmentation, POS, NER, requirement decomposition, change detection, and policy mapping) continues to run at 100% functionality. Only the AI executive summary generation will display a prompt requesting an API key.

---

## 🧪 Testing & Verification

ReguLens includes an automated test suite verifying endpoints, parsing engines, and compliance mapping logic.

```powershell
# 1. Run full backend test suite (76 automated tests)
cd backend
.\.venv\Scripts\python.exe -m pytest tests -v

# 2. Run frontend production build validation
cd ../frontend
npm run build
```

---

## 📡 API Endpoints & Usage

### Key Endpoints

| HTTP | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health check and runtime status |
| `GET` | `/api/regulations` | Catalog of indexed regulatory documents |
| `POST` | `/api/documents/upload` | Upload PDF/DOCX regulatory circular or policy |
| `POST` | `/api/analysis` | Create a comparative analysis job |
| `GET` | `/api/analysis/{id}/status` | Check live execution progress & stage metrics |
| `GET` | `/api/analysis/{id}/changes` | Retrieve filtered regulatory change records |
| `GET` | `/api/analysis/{id}/policy-mapping` | Complete Company Policy Mapping results |
| `POST` | `/api/analysis/{id}/policy-mapping/insights` | Synthesize advisory executive summary via Groq |

### Example API Request (Create Analysis)

```bash
curl -X POST "http://127.0.0.1:8000/api/analysis" \
  -H "Content-Type: application/json" \
  -d '{
    "baseline_doc_id": "rbi_psl_2020",
    "target_doc_id": "rbi_psl_2025"
  }'
```

---

## 📊 Experimental Evaluation & Metrics

The ReguLens experimental dataset was validated using Reserve Bank of India Priority Sector Lending (PSL) regulatory documents.

### PSL 2020 vs 2025 Benchmark Results
- **Indexed Document Catalog:** 41 regulatory documents
- **Comparative Provisions Analyzed:** 63 records
  - **Substantive Modifications:** 31
  - **Administrative Updates:** 4
  - **Wording-Only Revisions:** 7
  - **Added Candidates:** 7 *(explicitly labeled as analytical candidates)*
  - **Removed Candidates:** 12 *(explicitly labeled as analytical candidates)*
  - **Unchanged Provisions:** 2

### Regulatory Function Classification Evaluation
Evaluated across 300 annotated clauses with an independent 50-clause human validation audit subset (**88.0% validation agreement**):

| Model / Classifier | Accuracy | Macro Precision | Macro Recall | Macro F1 | Weighted F1 |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **TF-IDF + Logistic Regression** | 52.00% ± 4.88% | 48.78% ± 6.10% | 47.95% ± 6.95% | 46.58% ± 5.87% | 51.29% ± 4.31% |
| **Sentence-Transformer Classifier** | 44.33% ± 5.54% | 41.41% ± 8.07% | 40.30% ± 8.49% | 39.82% ± 8.37% | 44.12% ± 5.51% |

### Corpus & NER Extraction Statistics
- **Total Clauses Evaluated:** 5,842 clauses
- **Requirement-Bearing Clauses Identified:** 1,756 clauses
- **Extracted Structural Elements:** 2,009 subjects • 2,144 actions • 2,177 modalities • 139 deadlines • 357 durations
- **Domain Named Entity Mentions:** 7,445 mentions across 2,456 entity-bearing clauses.

*(Note: These figures reflect the current ReguLens experimental corpus and setup, not universal production benchmarks.)*

---

## 🗺️ Roadmap

### ✅ Completed & Live

- [x] **Dynamic Document Ingestion:** Dual PDF/DOCX parsing with structural boundary detection.
- [x] **12-Stage NLP Engine:** Tokenization, lemmatization, POS, dependency parsing, and domain NER.
- [x] **Deontic Requirement Extraction:** Structural tuple parsing `(Subject, Modality, Action, Object, Parameters)`.
- [x] **Semantic Change Detection:** Multi-factor materiality assessment (Substantive, Wording, Added/Removed Candidates).
- [x] **Company Policy Mapping Engine:** Two-stage retrieval with deterministic duration/deadline/threshold parameter validation.
- [x] **Real-Time Playback UI:** Interactive clause-by-clause NLP inspection during processing.
- [x] **Advisory AI Integration:** Groq LPU LLM explanation layer (`openai/gpt-oss-120b`).
- [x] **Automated Test Suite:** 76 pytest integration and unit tests.

### 📋 Planned (Future Scope)

- [ ] **Automated Circular Web Crawler:** Scheduled polling of central bank notification feeds.
- [ ] **Multi-Jurisdiction Expansion:** Pre-configured taxonomy packs for SEBI, SEC, and EU DORA.
- [ ] **Vector Database Backend:** Optional Milvus / Qdrant indexing for enterprise-scale multi-million clause corpora.
- [ ] **Role-Based Audit Trails:** Multi-user compliance sign-off and approval workflows.

---

## 🤝 Contributing

Contributions from the NLP, RegTech, and Open-Source communities are warmly welcomed!

### Contribution Workflow

1. **Fork the Repository**
   Click the **Fork** button at the top right of this page.

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ReguLens.git
   cd ReguLens
   ```

3. **Create a Feature Branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

4. **Follow Development Standards**
   - Ensure all Python code conforms to PEP 8 and passes type checks.
   - Maintain Pydantic schema validation for new endpoints.
   - Run the backend test suite before committing:
     ```powershell
     pytest backend/tests -v
     ```
   - Validate frontend build:
     ```powershell
     cd frontend && npm run build
     ```

5. **Commit Your Changes**
   Use standard conventional commits:
   ```bash
   git commit -m "feat: add multi-clause batch alignment support"
   ```

6. **Push to Your Branch**
   ```bash
   git push origin feat/your-feature-name
   ```

7. **Open a Pull Request**
   Submit a detailed PR describing your changes, motivation, and test coverage.

---

## 🔒 Responsible Use & Legal Disclaimer

> [!IMPORTANT]
> **Analytical Decision-Support Tool:** ReguLens is an academic and technical research platform engineered to accelerate regulatory document analysis and highlight potential policy misalignments. **It does not provide legal advice or legal certification.**
>
> - **Human-in-the-Loop Required:** All candidate alignments (such as *"Added Candidates"* or *"Removed Candidates"*) and *"Potential Compliance Gaps"* are computational suggestions that require verification by qualified legal and compliance professionals.
> - **Source of Truth:** Deterministic NLP rules serve as the authoritative baseline within the system; optional LLM synthesis is strictly advisory.

---

## 📜 License

This project is open-source software licensed under the **MIT License**. See the [LICENSE](LICENSE) file for complete details.

---

## 🙏 Acknowledgments

- **Reserve Bank of India (RBI):** Master Directions, Notifications, and regulatory publications used for experimental evaluation.
- **Explosion AI (spaCy):** Industrial-strength NLP parsing and tokenization models.
- **Hugging Face & SBERT:** High-performance Sentence-Transformers embeddings.
- **Groq:** Ultra-low latency LPU inference platform.
- The open-source RegTech and computational linguistics communities.

---

<div align="center">

**Built with precision for the Compliance & NLP Research Community**

<sub>ReguLens © 2026 • NLP-Based Regulatory Change Detection & Compliance Intelligence</sub>

</div>
