<p align="center">
  <img src="frontend/assets/logo.svg" width="96" alt="NEXEN logo">
</p>

<h1 align="center">NEXEN ENTERPRISE</h1>

<p align="center"><strong>Your Business. Connected. Intelligent. Executable.</strong></p>

<p align="center">One operating workspace for files, priorities, automation, AI workers, and MARVIN.</p>

<p align="center">
  <img alt="Backend tests" src="https://img.shields.io/badge/backend-24%2F24%20passing-3ddc97">
  <img alt="Browser QA" src="https://img.shields.io/badge/browser%20QA-106%2F106%20passing-4f8cff">
  <img alt="Interaction sweep" src="https://img.shields.io/badge/interactions-514%2F514%20passing-73c7ff">
  <img alt="Demo data" src="https://img.shields.io/badge/data-demo%20%2F%20simulated-ffb13b">
</p>

---

<p align="center">
  <img src="teaser/public/captures/02-con-home.png" alt="NEXEN ENTERPRISE Construction workspace" width="100%">
</p>

## See the product, not the plumbing

NEXEN ENTERPRISE is a premium business-operations demo showing one NEXEN shell adapting to three different operating environments:

| Construction | Corporate | Real Estate |
|---|---|---|
| ![Construction](teaser/public/captures/02-con-home.png) | ![Corporate](teaser/public/captures/11-corp-home.png) | ![Real Estate](teaser/public/captures/12-re-home.png) |
| RFIs · change orders · safety · site operations | meetings · budgets · vendors · executive operations | listings · offers · inspections · disclosures · closings |

The shell stays consistent. The operating context changes.

**MARVIN** sits across the experience as the operator-facing AI interface: open the workspace, see what matters, inspect the evidence, and ask what to do next.

> **Demo truth:** this repository uses demo data, simulated responses, prototype browser voice, and clearly labeled future-development concepts. Mocked capabilities are not represented as live production integrations.

## MARVIN

<p align="center">
  <img src="teaser/public/captures/09-marvin-answer.png" alt="MARVIN answering inside NEXEN" width="84%">
</p>

In the current demo MARVIN can:

- surface the highest-priority operational items,
- summarize context-specific mock documents,
- answer industry-aware scripted questions,
- demonstrate microphone interaction and browser speech,
- participate in the simulated Corporate meeting flow.

## Business event → useful outcome

| Meeting briefing | Live capture | Structured follow-up |
|---|---|---|
| ![Briefing](teaser/public/captures/13-meet-brief.png) | ![Live meeting](teaser/public/captures/14-meet-live-5.png) | ![Notes](teaser/public/captures/15-meet-notes.png) |

This demonstrates the core UX principle: **the complexity belongs in the engine, not in the interface.**

## Responsive product

| Mobile workspace | Mobile MARVIN |
|---|---|
| ![Mobile workspace](teaser/public/captures/21-phone-home.png) | ![Mobile MARVIN](teaser/public/captures/24-phone-marvin.png) |

Verified layouts include 1920×1080 desktop, 1366×768 laptop, and 390×844 mobile/narrow.

## Watch it

**[▶ NEXEN ENTERPRISE guided tutorial](https://github.com/dbgamerboy/NEXEN-ENTERPRISE/releases/download/demo/NEXEN-ENTERPRISE-tutorial.mp4)**

**[▶ NEXEN ENTERPRISE cinematic teaser](https://github.com/dbgamerboy/NEXEN-ENTERPRISE/releases/download/demo/NEXEN-ENTERPRISE-teaser.mp4)**

The teaser is built with **Remotion + Playwright + FFmpeg** using deterministic captures of the actual frontend rather than replacement mock UI.

## Verified demo state

| Check | Result |
|---|---:|
| Python backend suite | **24 / 24 PASS** |
| Browser product QA | **106 / 106 PASS** |
| Exhaustive buttons + checkboxes | **514 / 514 PASS** |
| Browser/page errors in exhaustive sweep | **0** |
| Broken asset/request failures in browser QA | **0** |

Evidence: [`docs/DEMO-RECEIPT.md`](docs/DEMO-RECEIPT.md)

## Start locally

```bash
python backend/server.py
```

Open:

```text
http://127.0.0.1:8794/
```

The frontend is also static-friendly and can be opened directly from `frontend/index.html`.

## Verify

```bash
python -m unittest discover -s tests -v
node tests/demo_qa.js
node tests/demo_buttons.js
node tools/demo_receipt.js
```

Generated QA screenshots are written under `docs/img/` locally and are intentionally not stored in Git.

## Canonical repository

```text
frontend/        one customer-facing product
backend/         bounded local demo server / API
docs/            source of truth + verification evidence
tests/           backend + browser verification
tools/           reproducible demo / receipt tooling
teaser/          Remotion source + deterministic product captures
.github/         CI + Pages deployment
```

Normal fixes happen **in place**. Git stores history. Theme changes, metadata fixes, GUI polish, responsive fixes, and documentation updates do not create parallel product trees.

## Platform thesis

The broader NEXEN model is:

```text
USER
  ↓
MARVIN
  ↓
NEXEN HARNESS / CONTROL PLANE
  ↓
AI · PRODUCTS · WORKFLOWS · WINDOWS AUTOMATION · APIs · WORKERS
  ↓
BUSINESS / PERSONAL CONTEXT
  ↓
RESULTS · EVIDENCE · ALERTS · DECISIONS
```

Standalone products do not need to be rewritten into NEXEN. They can remain powerful independent products and expose a contract that NEXEN can discover, govern, invoke, and present through MARVIN.

Personal NEXEN and public NEXEN are intentionally different:

- **Personal NEXEN** is the high-power internal command center.
- **Public NEXEN** productizes proven capabilities into clear customer experiences.
- **NEXEN LYFE** represents the personal schedule / routine / priority operating context in the broader platform thesis.

## Source of truth

For product boundaries, harness architecture, MARVIN’s role, anti-spaghetti rules, media direction, verification policy, and productization principles:

**[NEXEN ENTERPRISE — SOURCE OF TRUTH](docs/NEXEN-ENTERPRISE-SOURCE-OF-TRUTH.md)**

---

<p align="center">
  <strong>NEXEN ENTERPRISE</strong><br>
  One product. One canonical frontend. One canonical URL. Git owns history.
</p>
