"""Workflow ROI scorer (the "Golden Math").

score = profit * (repeatability / 10) / hours
A workflow with profit <= 0 is killed, ROI under the minimum is held, otherwise scaled.
"""
from __future__ import annotations

MIN_ROI_PCT = 20.0


def score_workflow(name: str, earned: float, spent: float, repeat: float, hours: float,
                   min_roi: float = MIN_ROI_PCT) -> dict:
    earned, spent, repeat, hours = float(earned), float(spent), float(repeat), float(hours)
    if earned < 0 or spent < 0 or hours < 0:
        raise ValueError("earned, spent and hours must be zero or more")
    if not 1 <= repeat <= 10:
        raise ValueError("repeat must be between 1 and 10")
    profit = round(earned - spent, 2)
    if spent == 0:
        roi = None if profit > 0 else 0.0  # None means unbounded
    else:
        roi = round(profit / spent * 100, 1)
    if profit <= 0:
        return {"name": name, "profit": profit, "roi_pct": roi, "score": 0.0, "decision": "KILL",
                "reason": "operating at a loss"}
    time_factor = hours if hours > 0 else 0.1
    score = round(profit * (repeat / 10) / time_factor, 2)
    if roi is None or roi >= min_roi:
        decision, reason = "SCALE", "profitable and repeatable"
    else:
        decision, reason = "HOLD", "barely breaking even, send to backlog"
    return {"name": name, "profit": profit, "roi_pct": roi, "score": score, "decision": decision,
            "reason": reason}
