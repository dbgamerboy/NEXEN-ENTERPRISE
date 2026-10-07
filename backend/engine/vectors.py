"""Local vector store reader.

Reads a `vectors.jsonl` file (one JSON object per line: id, skill, chunk, text, optional embedding).
Path comes from NEXEN_VECTOR_DIR (point it at G:\\My Drive\\NEXEN_VECTOR_DB\\jsonl-store\\primary-70-data
on the owner's PC) and falls back to the synthetic sample bundled in data/sample.
Search is keyword scored. Stored embeddings are loaded but a query embedder is not part of the demo.
"""
from __future__ import annotations

import json
import math
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SAMPLE = ROOT / "data" / "sample" / "vectors.sample.jsonl"
_WORD = re.compile(r"[a-z0-9']+")
_STOP = {"the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "is", "are", "was", "how", "do", "does",
         "what", "it", "its", "my", "me", "i", "you", "your", "with", "by", "at", "be", "as", "that", "this"}


def _tokens(text: str) -> list[str]:
    out = []
    for w in _WORD.findall(text.lower()):
        if w in _STOP or len(w) < 2:
            continue
        for suf in ("ing", "ed", "es", "s"):
            if w.endswith(suf) and len(w) - len(suf) >= 3:
                w = w[: -len(suf)]
                break
        out.append(w)
    return out


def resolve_path() -> tuple[Path, str]:
    env = os.environ.get("NEXEN_VECTOR_DIR", "").strip()
    if env:
        p = Path(env)
        f = p / "vectors.jsonl" if p.is_dir() else p
        if f.is_file():
            return f, "owner-vector-db"
    return SAMPLE, "bundled-sample"


class VectorStore:
    def __init__(self, path: Path | None = None):
        if path is None:
            path, self.source = resolve_path()
        else:
            self.source = "custom"
        self.path = Path(path)
        self.rows: list[dict] = []
        self._tokens: list[list[str]] = []
        self._df: dict[str, int] = {}
        self._load()

    def _load(self) -> None:
        if not self.path.is_file():
            return
        with open(self.path, encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    row = json.loads(line)
                except json.JSONDecodeError:
                    continue  # skip a corrupt line, keep the rest of the store usable
                if "text" not in row:
                    continue
                self.rows.append(row)
        for row in self.rows:
            toks = _tokens(row["text"] + " " + str(row.get("skill", "")))
            self._tokens.append(toks)
            for t in set(toks):
                self._df[t] = self._df.get(t, 0) + 1

    def __len__(self) -> int:
        return len(self.rows)

    def search(self, query: str, k: int = 5) -> list[dict]:
        q = _tokens(query)
        if not q or not self.rows:
            return []
        n = len(self.rows)
        scored = []
        for row, toks in zip(self.rows, self._tokens):
            if not toks:
                continue
            tf = {}
            for t in toks:
                tf[t] = tf.get(t, 0) + 1
            s = 0.0
            for t in q:
                if t in tf:
                    s += (1 + math.log(tf[t])) * math.log(1 + n / self._df[t])
            if s > 0:
                scored.append((s / math.sqrt(len(toks)), row))
        scored.sort(key=lambda x: -x[0])
        out = []
        for s, row in scored[: max(1, min(k, 20))]:
            text = row["text"]
            low = text.lower()
            i = min((low.find(t) for t in q if t in low), default=0)
            out.append({"skill": row.get("skill", "?"), "chunk": row.get("chunk", 0),
                        "score": round(s, 3), "snippet": text[max(0, i - 60): i + 220].strip()})
        return out
