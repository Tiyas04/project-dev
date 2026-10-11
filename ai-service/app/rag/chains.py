import os
from typing import Dict, Any, List, Optional
from app.config import settings
from app.rag.retriever import context_retriever
from app.rag.vector_store import vector_store

import httpx

def _call_groq(prompt: str, model_name: str) -> str:
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured.")
    # Map common aliases if needed
    model = model_name
    if model in ("groq", "default-groq"):
        model = "qwen/qwen3.8-27b"
    
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7
    }
    res = httpx.post(url, headers=headers, json=payload, timeout=25.0)
    if res.status_code != 200:
        raise RuntimeError(f"Groq API error ({res.status_code}): {res.text}")
    data = res.json()
    return data["choices"][0]["message"]["content"]

def _call_openai(prompt: str, model_name: str) -> str:
    api_key = settings.OPENAI_API_KEY
    if not api_key:
        raise ValueError("CHATGPT_API_KEY / OPENAI_API_KEY is not configured.")
    model = model_name
    if model in ("chatgpt", "openai"):
        model = "gpt-4o-mini"
    
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7
    }
    res = httpx.post(url, headers=headers, json=payload, timeout=25.0)
    if res.status_code != 200:
        raise RuntimeError(f"OpenAI API error ({res.status_code}): {res.text}")
    data = res.json()
    return data["choices"][0]["message"]["content"]

def _call_claude(prompt: str, model_name: str) -> str:
    api_key = settings.CLAUDE_API_KEY
    if not api_key:
        raise ValueError("CLAUDE_API_KEY is not configured.")
    model = model_name
    if model in ("claude", "anthropic"):
        model = "claude-3-5-haiku-20241022"
    
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    payload = {
        "model": model,
        "max_tokens": 4096,
        "messages": [{"role": "user", "content": prompt}]
    }
    res = httpx.post(url, headers=headers, json=payload, timeout=30.0)
    if res.status_code != 200:
        raise RuntimeError(f"Claude API error ({res.status_code}): {res.text}")
    data = res.json()
    return data["content"][0]["text"]

def _call_gemini_single(prompt: str, model_name: str) -> str:
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured.")
    from google import genai
    from google.genai import types

    client = genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(timeout=25000)
    )
    response = client.models.generate_content(
        model=model_name,
        contents=prompt
    )
    if response and response.text:
        return response.text
    raise RuntimeError(f"Empty response from Gemini model {model_name}")

def _call_gemini_with_fallback(prompt: str, preferred_model: Optional[str] = None) -> str:
    """
    Unified multi-provider LLM executor supporting Gemini, Groq, ChatGPT, and Claude.
    Automatically cascades across providers if any model encounters rate-limits, credit exhaustion, or 503s.
    """
    models_to_try = []
    if preferred_model:
        models_to_try.append(preferred_model)

    # Standard fallback models across providers
    provider_fallbacks = [
        "gemini-2.5-flash",
        "qwen/qwen3.8-27b",
        "gemini-3.5-flash",
        "openai/gpt-oss-120b",
        "gemini-3.8-flash"
    ]
    for m in provider_fallbacks:
        if m not in models_to_try:
            models_to_try.append(m)

    last_error = None
    for model_name in models_to_try:
        try:
            print(f"[MultiProviderLLM] Dispatching prompt to model: {model_name}...")
            
            # 1. Groq models
            if model_name.startswith("groq/") or model_name.startswith("qwen/") or "gpt-oss" in model_name or "llama" in model_name:
                text = _call_groq(prompt, model_name)
                print(f"[MultiProviderLLM] Successfully generated with Groq ({model_name}).")
                return text

            # 2. Anthropic Claude models
            elif "claude" in model_name.lower():
                text = _call_claude(prompt, model_name)
                print(f"[MultiProviderLLM] Successfully generated with Claude ({model_name}).")
                return text

            # 3. OpenAI ChatGPT models
            elif model_name.startswith("gpt-") or "chatgpt" in model_name.lower():
                text = _call_openai(prompt, model_name)
                print(f"[MultiProviderLLM] Successfully generated with OpenAI ({model_name}).")
                return text

            # 4. Google Gemini models (default)
            else:
                text = _call_gemini_single(prompt, model_name)
                print(f"[MultiProviderLLM] Successfully generated with Gemini ({model_name}).")
                return text

        except Exception as e:
            print(f"[MultiProviderLLM] Model '{model_name}' failed: {e}. Cascading to next provider/model...")
            last_error = e

    raise last_error or RuntimeError("All configured AI models across providers failed.")

class RAGCoachChain:
    def execute(
        self,
        message: str,
        user_context: Optional[Dict[str, Any]] = None,
        chat_history: Optional[List[Dict[str, str]]] = None,
        preferred_model: Optional[str] = None
    ) -> Dict[str, Any]:
        retrieval_data = context_retriever.retrieve_context_for_coach(
            query=message,
            user_context=user_context,
            top_patterns=2,
            top_problems=2
        )
        knowledge_block = context_retriever.format_retrieval_prompt_block(retrieval_data)

        # Build user stats overview
        stats_summary = []
        if user_context:
            lc = user_context.get("leetcode", {}).get("stats", {})
            cf = user_context.get("codeforces", {}).get("stats", {})
            gh = user_context.get("github", {}).get("stats", {})
            arena_score = user_context.get("arenaScore", "N/A")
            
            stats_summary.append(f"- DevArena Unified Score: {arena_score}")
            if lc:
                stats_summary.append(f"- LeetCode: {lc.get('problemsSolved', 0)} solved, Rating: {lc.get('currentRating', 'N/A')}")
            if cf:
                stats_summary.append(f"- Codeforces: {cf.get('problemsSolved', 0)} solved, Rating: {cf.get('currentRating', 'N/A')}")
            if gh:
                stats_summary.append(f"- GitHub: {gh.get('publicRepos', 0)} repos, {gh.get('contributions', 0)} contributions")

        stats_text = "\n".join(stats_summary) if stats_summary else "No connected statistics yet."

        history_lines = []
        if chat_history:
            for turn in chat_history[-6:]:
                role = "User" if turn.get("role") == "user" else "Coach"
                history_lines.append(f"{role}: {turn.get('content', '')}")
        history_text = "\n".join(history_lines) if history_lines else "None."

        prompt = f"""You are the DevArena RAG-Powered AI Coach, an elite competitive programming mentor and ICPC/Olympiad coach.
Your mission is to provide rigorous, grounded, spoiler-free algorithmic guidance.

USER PROFILE METRICS:
{stats_text}

RECENT CONVERSATION HISTORY:
{history_text}

GROUNDED KNOWLEDGE RETRIEVED FROM DEVARENA CORPUS:
{knowledge_block}

USER'S INQUIRY:
{message}

COACHING DIRECTIVES:
1. Ground your advice strictly in proven competitive programming principles and the retrieved patterns above.
2. DO NOT hallucinate fake problem IDs or bogus algorithm complexities.
3. Be encouraging, precise, and concise. Format using clean Markdown with code blocks and bullet points.
4. If the user asks for help with a problem, DO NOT immediately provide the full source code; guide them with intuition, invariant analysis, and complexity benchmarks.
5. Reference the matched patterns and problems where directly applicable."""

        try:
            content = _call_gemini_with_fallback(prompt, preferred_model)
        except Exception as e:
            # Fallback response grounded in retrieved patterns
            patterns = retrieval_data.get("matched_patterns", [])
            pat_text = f"**{patterns[0]['name']}**" if patterns else "standard dynamic programming & graph traversals"
            content = f"### 💡 Coach Insight\n\nBased on your inquiry and profile stats, a key area to explore is {pat_text}.\n\n*Note: Real-time LLM stream encountered an issue ({str(e)[:60]}...). Showing grounded pattern index.*"

        return {
            "content": content,
            "retrieved_patterns": [p["name"] for p in retrieval_data.get("matched_patterns", [])],
            "retrieved_problems": [pr["title"] for pr in retrieval_data.get("matched_problems", [])],
            "grounded": True
        }

class ProgressiveHintChain:
    def execute(
        self,
        problem_title_or_query: str,
        user_rating: Optional[int] = None,
        preferred_model: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Retrieves or generates 4 progressive hint tiers:
        Tier 1: Conceptual Intuition
        Tier 2: Algorithmic Pattern
        Tier 3: Key Invariant
        Tier 4: Edge Cases & Complexity
        """
        # Check if problem is in indexed corpus
        matched_probs = vector_store.search_problems(problem_title_or_query, top_k=1)
        if matched_probs and matched_probs[0]["score"] > 0.6:
            p = matched_probs[0]["problem"]
            hints = p.get("hints", {})
            if hints and "tier1" in hints:
                return {
                    "problem_title": p["title"],
                    "platform": p.get("platform", "DevArena"),
                    "rating": p.get("rating"),
                    "difficulty": p.get("difficulty"),
                    "tier1": hints.get("tier1"),
                    "tier2": hints.get("tier2"),
                    "tier3": hints.get("tier3"),
                    "tier4": hints.get("tier4"),
                    "pattern_id": p.get("pattern_id"),
                    "source": "indexed_corpus"
                }

        # Otherwise generate grounded 4-tier hints using Gemini
        matched_patterns = vector_store.search_patterns(problem_title_or_query, top_k=2)
        pat_context = "\n".join([
            f"- Pattern: {p['pattern']['name']}\n  Invariant: {p['pattern']['core_invariant']}\n  Traps: {', '.join(p['pattern']['common_traps'])}"
            for p in matched_patterns
        ])

        prompt = f"""You are the DevArena 4-Tier Progressive Problem Hint Engine.
The user is working on this problem or concept:
"{problem_title_or_query}"

Relevant Algorithmic Knowledge:
{pat_context}

Generate 4 progressive tiers of hints formatted in valid JSON with these exact string keys:
"tier1": High-level conceptual intuition. (No algorithm names or code spoilers)
"tier2": Algorithmic pattern name and high-level strategy (e.g. Two Pointers, Monotonic Stack, Dijkstra).
"tier3": The exact mathematical invariant or core state transition (e.g. dp[i][j] transition or stack pop condition).
"tier4": Corner cases, constraint bounds (e.g. N <= 10^5 requires O(N log N)), and common pitfalls.

Output ONLY a raw JSON object without markdown fences."""

        try:
            raw_text = _call_gemini_with_fallback(prompt, preferred_model)
            import json, re
            # Extract JSON block
            json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group(0))
                return {
                    "problem_title": problem_title_or_query,
                    "platform": "General",
                    "rating": user_rating or 1400,
                    "difficulty": "Medium",
                    "tier1": parsed.get("tier1", "Think about what invariant stays true as you process elements."),
                    "tier2": parsed.get("tier2", "Apply an optimal data structure or two-pointer sweep."),
                    "tier3": parsed.get("tier3", "Formulate the subproblem state transition carefully."),
                    "tier4": parsed.get("tier4", "Watch out for boundary conditions and integer overflow."),
                    "source": "rag_generator"
                }
        except Exception as e:
            pass

        # Robust static fallback
        pat = matched_patterns[0]["pattern"] if matched_patterns else {}
        return {
            "problem_title": problem_title_or_query,
            "platform": "DevArena",
            "rating": user_rating or 1400,
            "difficulty": "Medium",
            "tier1": pat.get("hints", {}).get("tier1_intuition", "Look for monotonicity or repeating subproblems."),
            "tier2": pat.get("hints", {}).get("tier2_pattern", f"Consider using {pat.get('name', 'Two Pointers / DP')}."),
            "tier3": pat.get("hints", {}).get("tier3_invariant", pat.get("core_invariant", "Maintain validity at each step.")),
            "tier4": pat.get("hints", {}).get("tier4_edge_cases", "Consider empty inputs, single element, and bounds up to 10^5."),
            "source": "pattern_fallback"
        }

class StudyPlannerChain:
    def execute(
        self,
        target_topic: str,
        target_rating_gain: int = 150,
        current_rating: int = 1400,
        preferred_model: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates a 3-week study roadmap grounded in indexed patterns and real problem sets.
        """
        matched_patterns = vector_store.search_patterns(target_topic, top_k=3)
        matched_problems = vector_store.search_problems(
            target_topic,
            top_k=4,
            rating_target=current_rating + 50
        )

        pat_info = "\n".join([f"- {p['pattern']['name']}: {p['pattern']['core_invariant']}" for p in matched_patterns])
        prob_info = "\n".join([f"- [{pr['problem']['platform']}] {pr['problem']['title']} (Rating: {pr['problem'].get('rating', 'N/A')})" for pr in matched_problems])

        prompt = f"""You are the DevArena AI Study Planner.
Create a structured 3-Week Mastery Roadmap for a competitive programmer mastering '{target_topic}'.

Current Rating: {current_rating}
Target Rating: {current_rating + target_rating_gain}

Grounded Patterns Available:
{pat_info}

Grounded Problem Recommendations:
{prob_info}

FORMATTING GUIDELINES:
1. Structure the response strictly into the following sections:
   ### 🎯 Objective & Rating Target
   ### 📅 Week 1: Pattern Recognition & Fundamentals
   ### 📅 Week 2: Intermediate Variations & State Transitions
   ### 📅 Week 3: Contest-Paced Drills & Speed Benchmarking
   ### ⚠️ Common Traps & Antipatterns to Avoid

2. Within each week, organize into sub-headings:
   #### Core Patterns
   - **Pattern Name**
     - Mechanism: explain core principle concisely.
     - Execution: concrete template or implementation trick.
   #### Practice Module
   - **[Platform] Problem Name (Rating: XXXX)**
     - Objective: what this problem trains.
   #### Daily Schedule & Milestones
   - **Days 1-3:** Specific drill.
   - **Days 4-5:** Targeted problem.
   - **Days 6-7:** Timed contest test.

3. For complexities and mathematical bounds, use standard LaTeX ($O(N)$, $O(1)$, $10^5$, $\le$)."""

        try:
            plan_text = _call_gemini_with_fallback(prompt, preferred_model)
        except Exception as e:
            plan_text = f"### 🎯 Roadmap for {target_topic}\n\nTargeting {current_rating} -> {current_rating + target_rating_gain}.\n\n#### Week 1: Foundation\nReview {matched_patterns[0]['pattern']['name'] if matched_patterns else target_topic}.\n\n#### Recommended Practice:\n" + prob_info

        return {
            "topic": target_topic,
            "current_rating": current_rating,
            "target_rating": current_rating + target_rating_gain,
            "roadmap": plan_text,
            "recommended_problems": [p["problem"] for p in matched_problems]
        }

class ContestReviewChain:
    def execute(
        self,
        contest_title: str,
        missed_problems: List[str],
        error_type: str = "TLE",
        preferred_model: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Diagnoses contest misses and failure modes (TLE, WA, MLE) and prescribes recovery drills.
        """
        query = f"{' '.join(missed_problems)} {error_type}"
        matched_patterns = vector_store.search_patterns(query, top_k=2)
        pat_info = "\n".join([f"- {p['pattern']['name']} ({p['pattern']['time_complexity']}): {p['pattern']['core_invariant']}" for p in matched_patterns])

        prompt = f"""You are the DevArena Contest Post-Mortem Diagnostic Engine.
A programmer participated in contest: '{contest_title}'.
They struggled with problem(s): {', '.join(missed_problems)}.
Primary failure symptom: {error_type} (Time Limit Exceeded, Wrong Answer, etc.).

Relevant Algorithmic Knowledge & Optimal Complexities:
{pat_info}

Generate a concise post-mortem report in Markdown:
### 🔍 Root Cause Diagnostic
Analyze why {error_type} typically happens on these problem types (e.g. quadratic vs linear-logarithmic bottlenecks, unpruned recursion, hidden constant factors).
### 🛠️ Algorithmic Invariant Needed
Explain the algorithmic breakthrough required.
### 🎯 Targeted Recovery Drill
Provide 2 concrete practice recommendations to ensure this mistake never recurs in contests."""

        try:
            review_text = _call_gemini_with_fallback(prompt, preferred_model)
        except Exception as e:
            review_text = f"### 🔍 Diagnostic for {contest_title}\n\nFailure mode: {error_type}.\n\nEnsure your algorithm achieves optimal complexity instead of brute force."

        return {
            "contest_title": contest_title,
            "error_type": error_type,
            "analysis": review_text,
            "associated_patterns": [p["pattern"]["name"] for p in matched_patterns]
        }

rag_coach_chain = RAGCoachChain()
progressive_hint_chain = ProgressiveHintChain()
study_planner_chain = StudyPlannerChain()
contest_review_chain = ContestReviewChain()
