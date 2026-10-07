"""Self-healing circuit breaker: when a task stalls, route around it instead of waking the owner."""
from __future__ import annotations


def run_with_fallback(task: str, fallback: str, attempt=None, max_retries: int = 3) -> dict:
    """Try `attempt` up to max_retries times (default: a simulated stall), then run the fallback route."""
    steps = [f"attempting: {task}"]
    for n in range(1, max_retries + 1):
        try:
            if attempt is None:
                raise RuntimeError("blocked: API timeout or waiting for human input")
            result = attempt()
            steps.append(f"attempt {n} ok")
            return {"task": task, "healed": False, "result": result, "steps": steps}
        except Exception as exc:  # the breaker exists to absorb any failure
            steps.append(f"attempt {n} failed: {exc}")
    steps.append("breaker tripped, rerouting around the blocker")
    steps.append(f"fallback route: {fallback}")
    steps.append("blocker bypassed, unattended run continues")
    return {"task": task, "healed": True, "result": fallback, "steps": steps}
