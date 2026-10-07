"""Runs the owner's vetted scripts from NEXEN_MODULES_DIR (for example H:\\NEXEN_MODULES\\_curated).

Only names on the allowlist run, each in its own process with a timeout and no network access flags set.
The scripts themselves are never copied into this repo.
"""
from __future__ import annotations

import os
import re
import subprocess
import sys
from pathlib import Path

ALLOWLIST = {
    "MARVIN_WORKFLOW_ROI_CALCULATOR": "Workflow ROI calculator (Golden Math)",
    "MARVIN_CIRCUIT_BREAKER": "Self-healing circuit breaker",
}
_NAME = re.compile(r"^[A-Za-z0-9_]+$")


def modules_dir() -> Path | None:
    env = os.environ.get("NEXEN_MODULES_DIR", "").strip()
    return Path(env) if env and Path(env).is_dir() else None


def available() -> list[dict]:
    d = modules_dir()
    return [{"name": n, "label": label, "present": bool(d and (d / f"{n}.py").is_file())}
            for n, label in ALLOWLIST.items()]


def run_module(name: str, timeout: int = 15) -> dict:
    if not _NAME.match(name or "") or name not in ALLOWLIST:
        raise PermissionError("module not on the allowlist")
    d = modules_dir()
    if d is None or not (d / f"{name}.py").is_file():
        raise FileNotFoundError("module folder not configured, set NEXEN_MODULES_DIR")
    proc = subprocess.run([sys.executable, "-B", str(d / f"{name}.py")], capture_output=True, text=True,
                          timeout=timeout, cwd=str(d), env={"PATH": os.environ.get("PATH", ""),
                                                           "PYTHONIOENCODING": "utf-8"})
    return {"name": name, "exit": proc.returncode, "stdout": proc.stdout[-4000:],
            "stderr": proc.stderr[-1000:]}
