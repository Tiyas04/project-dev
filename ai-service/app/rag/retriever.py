from typing import Dict, Any, List, Optional
from app.rag.vector_store import vector_store

class CPContextRetriever:
    def __init__(self):
        self.store = vector_store

    def retrieve_context_for_coach(
        self,
        query: str,
        user_context: Optional[Dict[str, Any]] = None,
        top_patterns: int = 2,
        top_problems: int = 2
    ) -> Dict[str, Any]:
        """
        Retrieves relevant DSA patterns and practice problems matching the user query
        and user profile metrics.
        """
        # Determine target rating from user context
        target_rating = 1400
        if user_context:
            lc_rating = user_context.get("leetcode", {}).get("stats", {}).get("currentRating")
            cf_rating = user_context.get("codeforces", {}).get("stats", {}).get("currentRating")
            arena_score = user_context.get("arenaScore")
            
            candidates = [r for r in [lc_rating, cf_rating, arena_score] if isinstance(r, (int, float)) and r > 0]
            if candidates:
                target_rating = int(sum(candidates) / len(candidates))

        # Search patterns
        matched_patterns = self.store.search_patterns(query, top_k=top_patterns)
        
        # Search problems with rating target
        matched_problems = self.store.search_problems(
            query,
            top_k=top_problems,
            rating_target=target_rating
        )

        return {
            "query": query,
            "target_rating": target_rating,
            "matched_patterns": [p["pattern"] for p in matched_patterns],
            "matched_problems": [pr["problem"] for pr in matched_problems]
        }

    def format_retrieval_prompt_block(self, context_data: Dict[str, Any]) -> str:
        """
        Formats retrieved knowledge into a clean, hallucination-resistant prompt block.
        """
        blocks = []
        patterns = context_data.get("matched_patterns", [])
        if patterns:
            blocks.append("### 📚 Grounded Algorithmic Patterns from Knowledge Base:")
            for p in patterns:
                blocks.append(
                    f"- **{p['name']}** ({p['category']}, {p['difficulty_bracket']})\n"
                    f"  * Core Invariant: {p['core_invariant']}\n"
                    f"  * Time/Space: {p['time_complexity']} | {p['space_complexity']}\n"
                    f"  * Key Intuition: {p.get('hints', {}).get('tier1_intuition', '')}\n"
                    f"  * Common Traps: {', '.join(p.get('common_traps', []))}"
                )

        problems = context_data.get("matched_problems", [])
        if problems:
            blocks.append("\n### 🎯 Relevant Grounded Practice Problems:")
            for pr in problems:
                blocks.append(
                    f"- [{pr['platform']}] **{pr['title']}** (Rating: {pr.get('rating', 'N/A')}, Difficulty: {pr.get('difficulty', 'N/A')})\n"
                    f"  * Tags: {', '.join(pr.get('topic_tags', []))}\n"
                    f"  * Core Idea: {pr.get('editorial_summary', '')}"
                )

        return "\n".join(blocks)

context_retriever = CPContextRetriever()
