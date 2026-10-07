"""NEXEN demo server: serves the triple-screen frontend and a small JSON API. Standard library only.

    python backend/server.py            -> http://127.0.0.1:8794/
Env (all optional):
    NEXEN_VECTOR_DIR   folder or file with vectors.jsonl (default: bundled synthetic sample)
    NEXEN_MODULES_DIR  folder with the owner's vetted scripts (default: none, module runner disabled)
    NEXEN_PORT         default 8794
"""
from __future__ import annotations

import json
import mimetypes
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))
from engine import breaker, chunker, modules, roi, vectors  # noqa: E402

FRONTEND = (Path(__file__).resolve().parents[1] / "frontend").resolve()
MAX_BODY = 64 * 1024
STORE = vectors.VectorStore()


class BodyTooLarge(ValueError):
    pass


class Handler(BaseHTTPRequestHandler):
    server_version = "NexenDemo/1.0"

    def log_message(self, fmt, *args):  # quiet by default
        if os.environ.get("NEXEN_VERBOSE"):
            super().log_message(fmt, *args)

    # ---- helpers
    def _json(self, code: int, obj) -> None:
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _body(self) -> dict:
        n = int(self.headers.get("Content-Length") or 0)
        if n > MAX_BODY:
            left = min(n, 1024 * 1024)  # drain so the client can read our answer instead of a reset
            while left > 0:
                chunk = self.rfile.read(min(65536, left))
                if not chunk:
                    break
                left -= len(chunk)
            raise BodyTooLarge("body too large")
        if n == 0:
            return {}
        data = json.loads(self.rfile.read(n) or b"{}")
        if not isinstance(data, dict):
            raise ValueError("JSON object expected")
        return data

    # ---- routes
    def do_GET(self):
        url = urlparse(self.path)
        if url.path == "/api/health":
            return self._json(200, {"ok": True, "mode": "live", "vectors": len(STORE),
                                    "vector_source": STORE.source, "modules": modules.available()})
        if url.path == "/api/search":
            q = (parse_qs(url.query).get("q") or [""])[0][:200]
            k = int((parse_qs(url.query).get("k") or ["5"])[0])
            return self._json(200, {"query": q, "source": STORE.source, "hits": STORE.search(q, k)})
        if url.path.startswith("/api/"):
            return self._json(404, {"error": "unknown endpoint"})
        return self._static(url.path)

    def do_POST(self):
        path = urlparse(self.path).path
        try:
            data = self._body()
            if path == "/api/roi":
                return self._json(200, roi.score_workflow(
                    str(data.get("name", "Workflow"))[:80], data.get("earned", 0), data.get("spent", 0),
                    data.get("repeat", 5), data.get("hours", 1)))
            if path == "/api/breaker":
                return self._json(200, breaker.run_with_fallback(
                    str(data.get("task", "task"))[:80], str(data.get("fallback", "save to outbox"))[:120]))
            if path == "/api/chunk":
                text = str(data.get("text", ""))[:20000]
                chunks = chunker.chunk_text(text, int(data.get("size", 40)), int(data.get("overlap", 5)))
                return self._json(200, {"count": len(chunks), "chunks": chunks[:50]})
            if path == "/api/module/run":
                return self._json(200, modules.run_module(str(data.get("name", ""))))
        except BodyTooLarge as exc:
            return self._json(413, {"error": str(exc)})
        except PermissionError as exc:
            return self._json(403, {"error": str(exc)})
        except FileNotFoundError as exc:
            return self._json(404, {"error": str(exc)})
        except (ValueError, TypeError, json.JSONDecodeError) as exc:
            return self._json(400, {"error": str(exc)})
        except Exception as exc:  # last resort, keep the server alive
            return self._json(500, {"error": f"{type(exc).__name__}: {exc}"})
        return self._json(404, {"error": "unknown endpoint"})

    def _static(self, rel: str):
        rel = "index.html" if rel in ("", "/") else rel.lstrip("/")
        target = (FRONTEND / rel).resolve()
        if FRONTEND not in target.parents and target != FRONTEND or not target.is_file():
            self.send_response(404)
            self.end_headers()
            return
        body = target.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", mimetypes.guess_type(target.name)[0] or "application/octet-stream")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def make_server(port: int = 0, host: str = "127.0.0.1") -> ThreadingHTTPServer:
    return ThreadingHTTPServer((host, port), Handler)


if __name__ == "__main__":
    port = int(os.environ.get("NEXEN_PORT", "8794"))
    srv = make_server(port)
    print(f"NEXEN demo on http://127.0.0.1:{port}/  (vectors: {len(STORE)} from {STORE.source})")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
