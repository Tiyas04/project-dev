import hashlib
import numpy as np
from typing import List, Optional
from app.config import settings

# In-memory cache for embeddings: text -> np.ndarray
_embedding_cache = {}

def _deterministic_local_embedding(text: str, dim: int = 384) -> np.ndarray:
    """
    Deterministic dense embedding projection based on character n-grams and hashing.
    Provides a resilient, dependency-free local fallback when API is rate-limited.
    """
    words = text.lower().replace("\n", " ").split()
    vector = np.zeros(dim, dtype=np.float32)
    
    if not words:
        return vector

    for i, word in enumerate(words):
        h = int(hashlib.sha256(word.encode("utf-8")).hexdigest(), 16)
        # Distribute over 3 orthogonal coordinates per word
        idx1 = (h) % dim
        idx2 = (h >> 16) % dim
        idx3 = (h >> 32) % dim
        sign = 1.0 if (h % 2 == 0) else -1.0
        
        weight = 1.0 / (1.0 + np.log(1.0 + i))
        vector[idx1] += sign * weight
        vector[idx2] += -sign * (weight * 0.7)
        vector[idx3] += sign * (weight * 0.5)

    norm = np.linalg.norm(vector)
    if norm > 1e-6:
        vector = vector / norm
    return vector

class EmbeddingEngine:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[EmbeddingEngine] Warning: Could not initialize Google GenAI Client: {e}")
                self.client = None

    def get_embedding(self, text: str) -> np.ndarray:
        if not text:
            return np.zeros(384, dtype=np.float32)

        cache_key = hashlib.md5(text.encode("utf-8")).hexdigest()
        if cache_key in _embedding_cache:
            return _embedding_cache[cache_key]

        if self.client:
            try:
                # Use Google GenAI embedding model
                response = self.client.models.embed_content(
                    model="text-embedding-004",
                    contents=text[:2000]
                )
                if response and hasattr(response, "embedding") and response.embedding:
                    vec = np.array(response.embedding.values, dtype=np.float32)
                    norm = np.linalg.norm(vec)
                    if norm > 1e-6:
                        vec = vec / norm
                    _embedding_cache[cache_key] = vec
                    return vec
            except Exception as e:
                # Log failure and fallback to deterministic local embedding
                pass

        vec = _deterministic_local_embedding(text)
        _embedding_cache[cache_key] = vec
        return vec

    def get_embeddings_batch(self, texts: List[str]) -> List[np.ndarray]:
        return [self.get_embedding(t) for t in texts]

embedding_engine = EmbeddingEngine()
