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
* ShadCN UI
* Framer Motion
* Recharts

## Backend

* Node.js
* Express.js
* JavaScript
* JWT Authentication

## Database

* MongoDB
* Mongoose

## Caching & Jobs

* Redis
* BullMQ

## AI

* Gemini API

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
  role
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

## Phase 9: Background Jobs

### BullMQ Jobs

#### Sync User Data

Runs periodically:

* Fetch latest ratings
* Update contests
* Update solved problems

#### Analytics Generation

Recalculate:

* Arena Score
* Topic Scores
* Recommendations

#### Achievement Engine

Award badges automatically.

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

---

# Version 3.0

* AI Coach
* AI Study Plans
* AI Contest Reviews
* Smart Recommendations

---

# Long-Term Vision

DevArena should evolve from a coding statistics dashboard into a personal AI coach for competitive programmers, helping users improve their skills, increase their ratings, and achieve their coding goals through data-driven insights and personalized guidance.
