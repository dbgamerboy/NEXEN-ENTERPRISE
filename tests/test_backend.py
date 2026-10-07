"""Backend tests: engine edge cases and the HTTP API. Run: python -m unittest discover -s tests -v"""
import json
import os
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from engine import breaker, chunker, modules, roi, vectors  # noqa: E402
import server  # noqa: E402


class RoiTests(unittest.TestCase):
    def test_scale(self):
        r = roi.score_workflow("a", 150, 2.5, 9, 0.5)
        self.assertEqual(r["decision"], "SCALE")
        self.assertEqual(r["score"], 265.5)

    def test_kill_on_loss(self):
        self.assertEqual(roi.score_workflow("b", 10, 12, 5, 2)["decision"], "KILL")

    def test_hold_thin_margin(self):
        self.assertEqual(roi.score_workflow("c", 11, 10, 5, 1)["decision"], "HOLD")

    def test_zero_spend_is_unbounded(self):
        r = roi.score_workflow("d", 50, 0, 5, 1)
        self.assertIsNone(r["roi_pct"])
        self.assertEqual(r["decision"], "SCALE")

    def test_zero_hours_uses_floor(self):
        self.assertEqual(roi.score_workflow("e", 10, 0, 10, 0)["score"], 100.0)

    def test_bad_input(self):
        for args in [(-1, 0, 5, 1), (1, -1, 5, 1), (1, 1, 0, 1), (1, 1, 11, 1), (1, 1, 5, -2)]:
            with self.assertRaises(ValueError):
                roi.score_workflow("x", *args)


class BreakerTests(unittest.TestCase):
    def test_stall_heals(self):
        r = breaker.run_with_fallback("upload", "save to outbox")
        self.assertTrue(r["healed"])
        self.assertEqual(sum("failed" in s for s in r["steps"]), 3)

    def test_success_does_not_heal(self):
        self.assertFalse(breaker.run_with_fallback("t", "f", attempt=lambda: "ok")["healed"])

    def test_flaky_recovers_without_fallback(self):
        calls = []

        def flaky():
            calls.append(1)
            if len(calls) < 2:
                raise RuntimeError("blip")
            return "ok"
        r = breaker.run_with_fallback("t", "f", attempt=flaky)
        self.assertFalse(r["healed"])
        self.assertEqual(len(calls), 2)


class ChunkerTests(unittest.TestCase):
    def test_overlap_and_cover(self):
        text = " ".join(str(i) for i in range(100))
        ch = chunker.chunk_text(text, 40, 10)
        self.assertEqual(ch[0].split()[30], "30")
        self.assertEqual(ch[1].split()[0], "30")
        self.assertEqual(ch[-1].split()[-1], "99")

    def test_empty(self):
        self.assertEqual(chunker.chunk_text("", 10, 2), [])

    def test_bad_params(self):
        for a in [(0, 0), (5, 5), (5, 9), (5, -1)]:
            with self.assertRaises(ValueError):
                chunker.chunk_text("a b c", *a)


class VectorTests(unittest.TestCase):
    def test_sample_search(self):
        s = vectors.VectorStore(vectors.SAMPLE)
        self.assertGreaterEqual(len(s), 10)
        hits = s.search("how are clips scored")
        self.assertTrue(hits and hits[0]["skill"] == "clipping-workflow")

    def test_empty_and_nonsense_query(self):
        s = vectors.VectorStore(vectors.SAMPLE)
        self.assertEqual(s.search(""), [])
        self.assertEqual(s.search("zzzzqqq"), [])

    def test_corrupt_line_is_skipped(self):
        with tempfile.TemporaryDirectory() as d:
            p = Path(d) / "vectors.jsonl"
            p.write_text('{"text":"good clip row","skill":"x"}\nNOT JSON\n{"nope":1}\n', encoding="utf-8")
            s = vectors.VectorStore(p)
            self.assertEqual(len(s), 1)

    def test_env_path_used_and_missing_falls_back(self):
        with tempfile.TemporaryDirectory() as d:
            (Path(d) / "vectors.jsonl").write_text('{"text":"hello world","skill":"z"}\n', encoding="utf-8")
            os.environ["NEXEN_VECTOR_DIR"] = d
            try:
                self.assertEqual(vectors.resolve_path()[1], "owner-vector-db")
                os.environ["NEXEN_VECTOR_DIR"] = str(Path(d) / "missing")
                self.assertEqual(vectors.resolve_path()[1], "bundled-sample")
            finally:
                del os.environ["NEXEN_VECTOR_DIR"]


class ModuleTests(unittest.TestCase):
    def test_allowlist_blocks_everything_else(self):
        for bad in ["../evil", "NEXEN_APEX_REVENUE_ENGINE", "", "a b", "MARVIN_CIRCUIT_BREAKER.py"]:
            with self.assertRaises(PermissionError):
                modules.run_module(bad)

    def test_unconfigured_dir(self):
        os.environ.pop("NEXEN_MODULES_DIR", None)
        with self.assertRaises(FileNotFoundError):
            modules.run_module("MARVIN_CIRCUIT_BREAKER")

    def test_runs_allowlisted_script_from_configured_dir(self):
        with tempfile.TemporaryDirectory() as d:
            (Path(d) / "MARVIN_CIRCUIT_BREAKER.py").write_text("print('hello from module')", encoding="utf-8")
            os.environ["NEXEN_MODULES_DIR"] = d
            try:
                r = modules.run_module("MARVIN_CIRCUIT_BREAKER")
                self.assertEqual(r["exit"], 0)
                self.assertIn("hello from module", r["stdout"])
            finally:
                del os.environ["NEXEN_MODULES_DIR"]


class ApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.srv = server.make_server(0)
        cls.port = cls.srv.server_address[1]
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown()
        cls.srv.server_close()

    def call(self, path, body=None):
        req = urllib.request.Request(f"http://127.0.0.1:{self.port}{path}",
                                     data=None if body is None else json.dumps(body).encode(),
                                     headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=10) as r:
                return r.status, r.read()
        except urllib.error.HTTPError as e:
            return e.code, e.read()

    def test_health(self):
        code, body = self.call("/api/health")
        j = json.loads(body)
        self.assertEqual(code, 200)
        self.assertTrue(j["ok"] and j["vectors"] >= 10)

    def test_search_and_roi_and_chunk_and_breaker(self):
        self.assertEqual(self.call("/api/search?q=approvals")[0], 200)
        code, body = self.call("/api/roi", {"name": "x", "earned": 100, "spent": 10, "repeat": 8, "hours": 1})
        self.assertEqual(json.loads(body)["decision"], "SCALE")
        code, body = self.call("/api/chunk", {"text": "a b c d e f g h", "size": 4, "overlap": 1})
        self.assertEqual(json.loads(body)["count"], 3)
        self.assertTrue(json.loads(self.call("/api/breaker", {"task": "t", "fallback": "f"})[1])["healed"])

    def test_bad_requests(self):
        self.assertEqual(self.call("/api/roi", {"earned": -5})[0], 400)
        self.assertEqual(self.call("/api/roi", {"earned": "abc"})[0], 400)
        self.assertEqual(self.call("/api/chunk", {"text": "x", "size": 2, "overlap": 5})[0], 400)
        self.assertEqual(self.call("/api/module/run", {"name": "../../etc/passwd"})[0], 403)
        self.assertEqual(self.call("/api/nope")[0], 404)

    def test_oversize_body_rejected(self):
        code, _ = self.call("/api/chunk", {"text": "x" * 70000})
        self.assertEqual(code, 413)

    def test_static_and_traversal(self):
        code, body = self.call("/")
        self.assertEqual(code, 200)
        self.assertIn(b"NEXEN Demo Build", body)
        code, body = self.call("/v2/")
        self.assertEqual(code, 200)
        self.assertIn(b"NEXEN Workspace Demo", body)
        self.assertEqual(self.call("/../backend/server.py")[0], 404)
        self.assertEqual(self.call("/%2e%2e/backend/server.py")[0], 404)


if __name__ == "__main__":
    unittest.main()
