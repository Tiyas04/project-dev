# DevArena - Development Plan

## Project Overview

DevArena is an AI-powered Competitive Programming Analytics Platform that helps users track coding performance, analyze weaknesses, monitor rating growth, and receive personalized recommendations for improvement.

The platform aggregates data from multiple coding platforms and transforms raw statistics into actionable insights.

---

# Tech Stack

## Frontend

* Next.js 16
* TypeScript
* Tailwind CSS
* Framer Motion
* Recharts

## Backend

* Node.js
* Express.js
* JavaScript
* JWT Authentication

## Database

* MongoDB

## Caching & Jobs

* Redis
* BullMQ

## AI & RAG Engine (Python Microservice)

* Python 3.11+
* FastAPI & Uvicorn
* LangChain / LlamaIndex
* ChromaDB / FAISS (Vector Database)
* Hugging Face Embeddings / Sentence-Transformers
* Google GenAI SDK (Python) / Open-source LLMs

## Deployment

### Frontend

* Vercel

### Backend

* Render

### Database

* MongoDB Atlas

### Cache

* Upstash Redis

---

# Core Objectives

* Unified coding profile
* Contest analytics
* Topic-wise performance analysis
* AI-powered recommendations
* Rating growth tracking
* Friend leaderboards
* Public user profiles

---

# Development Roadmap

## Phase 1: Foundation

### Authentication

#### Features

* User Registration
* User Login
* JWT Authentication
* Refresh Tokens
* Google OAuth

#### Models

User

```ts
{
  _id
  name
  email
  avatar
  password
  refreshToken
  createdAt
}
```

---

### Project Setup

#### Frontend

* Next.js initialization
* Tailwind setup
* ShadCN installation
* Global layouts
* Theme configuration

#### Backend

* Express initialization
* MongoDB connection
* Environment configuration
* API structure
* Error handling
* Logging middleware

---

## Phase 2: Platform Integrations

### Connected Accounts

Users can connect:

* LeetCode
* Codeforces

Future:

* CodeChef
* AtCoder

#### Model

ConnectedAccount

```ts
{
  _id
  userId
  platform
  username
  lastSync
}
```

---

### Data Collection Service

Fetch:

* User profile
* Ratings
* Contest history
* Solved problems
* Problem tags

Store synchronized snapshots in MongoDB.

---

## Phase 3: Dashboard

### Dashboard Cards

Display:

* Current Rating
* Best Rating
* Problems Solved
* Contests Participated
* Global Ranking
* Arena Score

---

### Rating Analytics

Charts for:

* Rating Growth
* Contest Performance
* Monthly Progress

Time filters:

* 30 Days
* 90 Days
* 1 Year
* All Time

---

### Problem Analytics

Show:

* Total Solved
* Difficulty Distribution
* Platform Distribution

Example

Easy: 120

Medium: 340

Hard: 95

---

## Phase 4: Topic Analysis

### Problem Categorization

Classify solved problems into:

* Arrays
* Strings
* Linked List
* Trees
* Graphs
* Dynamic Programming
* Greedy
* Binary Search
* Math
* Backtracking

---

### Topic Strength Engine

Calculate:

```text
Topic Score =
Solved Problems /
Available Problems
```

Generate:

* Strong Topics
* Average Topics
* Weak Topics

---

### Analytics Model

```ts
{
  _id
  userId
  arenaScore
  strongTopics
  weakTopics
  topicScores
  updatedAt
}
```

---

## Phase 5: Arena Score

### Custom Rating System

Combine:

* LeetCode Rating
* Codeforces Rating
* Contest Frequency
* Problem Solving Consistency

Generate:

```text
Arena Score: 1850
```

Purpose:

Provide a unified metric across platforms.

---

## Phase 6: Social Features

### Friends System

Features:

* Search Users
* Send Requests
* Accept Requests
* Remove Friends

---

### Leaderboards

Display:

* Weekly Growth
* Monthly Growth
* Arena Score Rankings
* Contest Activity Rankings

---

## Phase 7: Public Profiles

### Shareable Profile

Example:

```text
devarena.app/user/tiyas
```

Display:

* Ratings
* Arena Score
* Solved Problems
* Topic Strengths
* Contest History
* Achievements

---

### Achievement System

Badges:

* First Contest
* 100 Problems Solved
* 500 Problems Solved
* 1000 Problems Solved
* 100 Day Streak

---

## Phase 8: AI Features

### AI Coach

Input:

* Ratings
* Weak Topics
* Contest History

Output:

* Improvement Suggestions
* Learning Roadmaps
* Topic Recommendations

---

### AI Study Planner

Generate:

* Daily Plan
* Weekly Plan
* Monthly Plan

Based on:

* Current Rating
* Goals
* Weak Areas

---

### AI Contest Review

Analyze:

* Recent Contests
* Solved Problems
* Missed Opportunities

Generate detailed performance reports.

---

## Phase 9: Background Jobs & Cache Controlling ✅

### BullMQ Jobs

#### Sync User Data

Runs periodically & on-demand via background worker:

* Fetch latest ratings
* Update contests
* Update solved problems

#### Analytics Generation

Recalculate asynchronously:

* Arena Score
* Topic Scores
* Recommendations

#### Achievement Engine

Award badges automatically via 22 evaluation rules.

---

## Phase 10: Python AI & RAG Engine ✅ (Complete)

### Python Microservice Architecture
* **FastAPI Service (`ai-service/`)**:
  * Asynchronous endpoints running on Uvicorn (default: port 8000).
  * Streaming responses via Server-Sent Events (SSE) for token-by-token coach responses.
  * Internal API authentication with Express backend (`/api/v1/ai/*` proxies to Python service).
  * Managed via root `concurrently` script alongside frontend and backend.

### RAG Knowledge Base & Vector Store
* **Curated Competitive Programming Corpus**:
  * Algorithmic design patterns & templates (DP states, Graph traversals, Range Queries, Binary Search, Math & Combinatorics).
  * Problem metadata, taxonomies, and editorial hints from LeetCode, Codeforces, and CSES.
  * Common pitfalls, edge cases, and algorithmic complexity benchmarks.
* **Vector Indexing Engine**:
  * Vector Database: ChromaDB / FAISS for dense vector indexing and low-latency nearest-neighbor search.
  * Embeddings: Hugging Face `sentence-transformers` (e.g., `all-MiniLM-L6-v2`) or Google GenAI embeddings.
  * Chunking and metadata enrichment strategy (difficulty brackets, topic tags, source platforms).

### Context-Aware Retrieval Pipeline
* **User Context Augmentation**:
  * Dynamic ingestion of user's live profile: current ratings, Arena Score, topic mastery radar vector, recent contest misses.
  * Hybrid retrieval combining dense vector similarity with metadata filtering (matching user difficulty frontier and target weak topics).
  * Context re-ranking to prioritize algorithms tailored to the user's specific skill level.

### Intelligent Deliverables
#### 1. RAG-Powered AI Coach
* Grounded conversational mentor referencing actual algorithmic patterns and problem corpora instead of generic hallucinations.
* Guided problem-solving assistance without spoiling code solutions.

#### 2. 4-Tier Progressive Hint System
* Generates progressive nudges on demand:
  1. *Conceptual Intuition* (High-level perspective)
  2. *Algorithmic Pattern* (e.g., Prefix Sums vs Sliding Window)
  3. *Key Observation & Invariant* (Crucial structural insight)
  4. *Edge Cases & Complexity Benchmarks* (Target constraints and boundary inputs)

#### 3. Dynamic Curated Study Planner
* Generates personalized study roadmaps grounded in real, indexed problem sets matched to user's rating gaps.

#### 4. Contest Post-Mortem Diagnostics
* Ingests contest submissions and analyzes where the user struggled, diagnosing failure modes (TLE, WA, edge cases) and prescribing targeted recovery practice.

---

## Database Design

### Collections

Users

ConnectedAccounts

Problems

Contests

Analytics

Achievements

FriendRequests

Notifications

StudyPlans

---

# API Structure

```text
/api/auth
/api/users
/api/accounts
/api/problems
/api/contests
/api/analytics
/api/leaderboard
/api/friends
/api/achievements
/api/ai
```

---

# Folder Structure

## Frontend

```text
frontend
|
├── app
├── components
├── hooks
├── services
├── store
├── types
├── lib
└── utils
```

---

## Backend

```text
backend
|
├── src
│   ├── controllers
│   ├── routes
│   ├── models
│   ├── middleware
│   ├── services
│   ├── jobs
│   ├── utils
│   ├── config
│   └── app.ts
```

---

## AI Service (Python FastAPI & RAG)

```text
ai-service
|
├── app
│   ├── api
│   │   ├── coach.py
│   │   ├── hints.py
│   │   └── planner.py
│   ├── rag
│   │   ├── vector_store.py
│   │   ├── retriever.py
│   │   ├── embeddings.py
│   │   └── chains.py
│   ├── data
│   │   ├── dsa_patterns/
│   │   └── problem_corpus/
│   └── main.py
├── requirements.txt
└── Dockerfile
```

---

# MVP Deliverables

## Version 1.0

* Authentication
* LeetCode Integration
* Codeforces Integration
* Dashboard
* Rating Graphs
* Contest History
* Topic Analysis
* Public Profiles

---

# Version 2.0

* Friend System
* Leaderboards
* Arena Score
* Achievements
* Notifications
* Redis Cache Controlling
* BullMQ Background Jobs & Automated Sync

---

# Version 3.0 (Python AI & RAG Engine ✅)

* Dedicated Python AI & RAG Microservice (FastAPI)
* Curated DSA Knowledge Base & Vector Indexing (ChromaDB / FAISS)
* Grounded RAG-Powered AI Coach (No hallucinations)
* Progressive 4-Tier Problem Hint Engine
* Dynamic Curated Study Plans & Problem Recommendations
* Algorithmic Contest Post-Mortem Diagnostics

---

# Long-Term Vision

DevArena should evolve from a coding statistics dashboard into a personal AI coach for competitive programmers, helping users improve their skills, increase their ratings, and achieve their coding goals through data-driven insights and personalized guidance.
