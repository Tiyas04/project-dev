# DevArena AI & RAG Microservice

> **High-performance Retrieval-Augmented Generation (RAG) engine for Competitive Programming Analytics and Personalized DSA Mentorship.**

The **DevArena AI Microservice** is a FastAPI service powered by Google Gemini and vector-based semantic retrieval. It powers DevArena's interactive AI Coach, progressive DSA hints, custom study roadmap planner, and contest failure analysis.

---

## Key Capabilities

- **Competitive Programming Knowledge Base (RAG):**
  - Curated pattern registry covering 20+ algorithmic archetypes (Sliding Window, Monotonic Stack, Trie, Segment Tree, DP states, etc.).
  - Cross-platform problem corpus from LeetCode and Codeforces with topics, difficulties, and target ratings.
- **Socratic AI Coach (`/api/rag/coach`):**
  - Context-aware coaching using user rating, connected accounts, and chat history.
  - Socratic guidance designed to teach algorithmic intuition without immediately giving away source solutions.
- **Progressive 3-Tier Hints (`/api/rag/hints`):**
  - Generates structured hints:
    1. *Conceptual Nudge:* Pattern recognition and high-level strategy.
    2. *Algorithmic Blueprint:* Data structure selection and invariant analysis.
    3. *Edge Case & Complexity Check:* Boundary conditions and time/space budget.
- **Adaptive Study Plan Generator (`/api/rag/plan`):**
  - Synthesizes personalized training roadmaps tailored to the user's current rating and target rating gain.
- **Contest Performance Reviewer (`/api/rag/review`):**
  - Diagnoses contest errors (Time Limit Exceeded, Wrong Answer, Memory Limit Exceeded) and recommends remediation strategies.
- **Multi-Provider AI & Cross-Provider Resilient Fallback:**
  - **Google Gemini:** `gemini-2.5-flash`, `gemini-3.5-flash`, `gemini-3.8-flash`, `gemini-3.1-pro-preview`.
  - **Groq (Ultra-Fast LPUs):** `qwen/qwen3.8-27b`, `openai/gpt-oss-120b`.
  - **OpenAI ChatGPT:** `gpt-4o-mini`, `gpt-4o`.
  - **Anthropic Claude:** `claude-3-5-haiku-20241022`, `claude-3-5-sonnet-20241022`.
  - Automatic cross-provider cascading if any model hits rate limits, credit exhaustion, or 503 downtime.

---

## Directory Structure

```text
ai-service/
├── app/
│   ├── api/                  # FastAPI router endpoints
│   │   ├── coach.py          # /api/rag/coach endpoint
│   │   ├── hints.py          # /api/rag/hints endpoint
│   │   ├── planner.py        # /api/rag/plan endpoint
│   │   └── review.py         # /api/rag/review endpoint
│   ├── data/                 # Static DSA knowledge corpus
│   │   ├── dsa_patterns.json # Algorithmic patterns and templates
│   │   └── problem_corpus.json # Curated problem corpus
│   ├── rag/                  # RAG pipeline modules
│   │   ├── chains.py         # Prompt orchestration & LLM invocation
│   │   ├── embeddings.py     # Embedding computation & similarity scoring
│   │   ├── retriever.py      # Semantic & keyword pattern retriever
│   │   └── vector_store.py   # In-memory vector indexer
│   ├── config.py             # Settings & environment variables
│   └── main.py               # FastAPI application lifecycle & routes
├── .env.example              # Example environment configuration
├── Dockerfile                # Production container specification
├── requirements.txt          # Python dependencies
├── run.py                    # Auto-detecting startup runner
└── README.md                 # Service documentation
```

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Microservice health, indexed patterns/problems, active model |
| `POST` | `/api/rag/coach` | Interactive AI Coach dialogue with user context & history |
| `POST` | `/api/rag/hints` | Progressive 3-step hint generation for a problem query |
| `POST` | `/api/rag/plan` | Personalized study curriculum tailored to target rating |
| `POST` | `/api/rag/review` | Contest error diagnosis (TLE, WA, MLE) and post-mortem |
| `GET` | `/api/rag/patterns` | Retrieve catalog of algorithmic patterns (optional `?category=`) |
| `GET` | `/api/rag/problems` | Search indexed problem bank (optional `?topic=` or `?platform=`) |

---

## Getting Started

### 1. Prerequisites
- Python 3.11+ (Python 3.12 recommended)
- Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/app/apikey))

### 2. Setup Virtual Environment

```bash
# Navigate to ai-service directory
cd ai-service

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create `.env` inside `ai-service/` (or configure in the root/backend `.env`):

```env
PORT=8000
HOST=0.0.0.0
# Provider Keys
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
CHATGPT_API_KEY=your_openai_api_key
CLAUDE_API_KEY=your_anthropic_api_key

INTERNAL_AI_SECRET=devarena_rag_secret_key_2026
DEFAULT_MODEL=gemini-2.5-flash
FALLBACK_MODELS=gemini-2.5-flash,qwen/qwen3.8-27b,gemini-3.5-flash,gemini-3.8-flash
CORS_ORIGINS=http://localhost:3000,http://localhost:5000
```

### 4. Run the Service

```bash
# Using the auto-detecting runner
python run.py

# Or directly with uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The service will be live at `http://localhost:8000`. You can explore interactive Swagger docs at `http://localhost:8000/docs`.

---

## Docker Deployment

Build and run via Docker:

```bash
docker build -t devarena-ai-service .
docker run -p 8000:8000 --env-file .env devarena-ai-service
```
