import json
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np
from app.rag.embeddings import embedding_engine

class VectorStore:
    def __init__(self):
        self.patterns: List[Dict[str, Any]] = []
        self.pattern_vectors: List[np.ndarray] = []
        self.pattern_by_id: Dict[str, Dict[str, Any]] = {}

        self.problems: List[Dict[str, Any]] = []
        self.problem_vectors: List[np.ndarray] = []
        self.problem_by_id: Dict[str, Dict[str, Any]] = {}

        self.is_initialized: bool = False

    def load_data(self):
        data_dir = Path(__file__).resolve().parent.parent / "data"
        patterns_path = data_dir / "dsa_patterns.json"
        problems_path = data_dir / "problem_corpus.json"

        # Load Patterns
        if patterns_path.exists():
            with open(patterns_path, "r", encoding="utf-8") as f:
                self.patterns = json.load(f)
            self.pattern_vectors = []
            for p in self.patterns:
                self.pattern_by_id[p["id"]] = p
                # Composite text for embedding
                composite_text = f"{p['name']} {p['category']} {p.get('core_invariant', '')} " \
                                 f"{' '.join(p.get('problem_signatures', []))} " \
                                 f"{p.get('hints', {}).get('tier1_intuition', '')} " \
                                 f"{p.get('hints', {}).get('tier2_pattern', '')}"
                self.pattern_vectors.append(embedding_engine.get_embedding(composite_text))

        # Load Problems
        if problems_path.exists():
            with open(problems_path, "r", encoding="utf-8") as f:
                self.problems = json.load(f)
            self.problem_vectors = []
            for pr in self.problems:
                self.problem_by_id[pr["id"]] = pr
                composite_text = f"{pr['title']} {pr.get('platform', '')} " \
                                 f"{' '.join(pr.get('topic_tags', []))} " \
                                 f"{pr.get('editorial_summary', '')} " \
                                 f"{pr.get('hints', {}).get('tier1', '')} " \
                                 f"{pr.get('hints', {}).get('tier2', '')}"
                self.problem_vectors.append(embedding_engine.get_embedding(composite_text))

        self.is_initialized = True
        print(f"[VectorStore] Indexed {len(self.patterns)} DSA patterns and {len(self.problems)} problems.")

    def _keyword_score(self, query: str, document_text: str) -> float:
        query_words = set(re.findall(r"\w+", query.lower()))
        doc_words = set(re.findall(r"\w+", document_text.lower()))
        if not query_words:
            return 0.0
        intersection = query_words.intersection(doc_words)
        return len(intersection) / len(query_words)

    def search_patterns(
        self,
        query: str,
        top_k: int = 3,
        category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        if not self.is_initialized:
            self.load_data()

        if not self.patterns:
            return []

        query_vec = embedding_engine.get_embedding(query)
        scored_results = []

        for idx, pattern in enumerate(self.patterns):
            if category and category.lower() not in pattern["category"].lower():
                continue

            # Cosine similarity
            pat_vec = self.pattern_vectors[idx]
            sim = float(np.dot(query_vec, pat_vec))

            # Keyword relevance
            text_repr = f"{pattern['name']} {pattern['category']} {pattern.get('core_invariant', '')} {' '.join(pattern.get('problem_signatures', []))}"
            kw_score = self._keyword_score(query, text_repr)

            # Hybrid score (65% semantic embedding, 35% keyword)
            final_score = 0.65 * sim + 0.35 * kw_score

            scored_results.append({
                "pattern": pattern,
                "score": round(final_score, 4),
                "similarity": round(sim, 4),
                "keyword_score": round(kw_score, 4)
            })

        scored_results.sort(key=lambda x: x["score"], reverse=True)
        return scored_results[:top_k]

    def search_problems(
        self,
        query: str,
        top_k: int = 5,
        rating_target: Optional[int] = None,
        topic: Optional[str] = None,
        platform: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        if not self.is_initialized:
            self.load_data()

        if not self.problems:
            return []

        query_vec = embedding_engine.get_embedding(query)
        scored_results = []

        for idx, problem in enumerate(self.problems):
            if topic:
                tags = [t.lower() for t in problem.get("topic_tags", [])]
                if not any(topic.lower() in t for t in tags):
                    continue

            if platform and platform.lower() != problem.get("platform", "").lower():
                continue

            prob_vec = self.problem_vectors[idx]
            sim = float(np.dot(query_vec, prob_vec))

            text_repr = f"{problem['title']} {' '.join(problem.get('topic_tags', []))} {problem.get('editorial_summary', '')}"
            kw_score = self._keyword_score(query, text_repr)

            # Rating proximity bonus: prioritize problems close to user's frontier rating
            rating_bonus = 0.0
            if rating_target and "rating" in problem:
                diff = abs(problem["rating"] - rating_target)
                if diff <= 200:
                    rating_bonus = 0.15 * (1.0 - diff / 200.0)

            final_score = 0.6 * sim + 0.25 * kw_score + rating_bonus

            scored_results.append({
                "problem": problem,
                "score": round(final_score, 4),
                "similarity": round(sim, 4),
                "rating": problem.get("rating")
            })

        scored_results.sort(key=lambda x: x["score"], reverse=True)
        return scored_results[:top_k]

    def get_pattern_by_id(self, pattern_id: str) -> Optional[Dict[str, Any]]:
        if not self.is_initialized:
            self.load_data()
        return self.pattern_by_id.get(pattern_id)

    def get_problem_by_id(self, problem_id: str) -> Optional[Dict[str, Any]]:
        if not self.is_initialized:
            self.load_data()
        return self.problem_by_id.get(problem_id)

vector_store = VectorStore()
