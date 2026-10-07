---
name: nexen-frontend-demo
description: Master scope for the NEXEN frontend demo: Construction, Corporate, Real Estate, mock files, MARVIN voice, tutorial, Future Development teasers. Use before touching frontend/v2.
---

Scope (frontend only): one shell in `frontend/v2/` (index.html, styles.css, data.js, app.js). Three mock workspaces, files with previews, MARVIN drawer with simulated voice, 5-step tutorial, FUTURE DEVELOPMENT concept cards.
Out of scope: backend work, new databases, agent systems, VR as a feature, n8n/Ollama/Obsidian.
Rules: demo data only. Safe labels: Demo Data, Mock Workspace, Concept Preview, Future Development, Simulated Response, Prototype Voice. Never label mocks Live, Production, Connected, Verified, Operational.
Order: P0 shell + 3 dashboards, P1 files + MARVIN + voice, P2 tutorial + activity + workers, P3 future cards + polish.
Loop: build, render, inspect (ui-polish-audit), test (playwright-demo-qa), screenshot, receipt (demo-receipt).
Reuses: node tests/demo_qa.js, tools/demo_receipt.js, the stdlib server in backend/server.py (serves /v2/).
