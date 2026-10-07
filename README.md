# NEXEN ENTERPRISE V1

## CANONICAL DEMO — BUSINESS / INVESTOR VERSION

**Use this demo for presentations. Do not infer the current demo from folder version numbers.**

| Item | Canonical value |
|---|---|
| Audience | Business owners, operators, investors |
| Source | `frontend/v2/` |
| Primary route | `/v2/#/construction` |
| Local demo | `http://127.0.0.1:8795/v2/#/construction` |
| Public demo | `https://dbgamerboy.github.io/NEXEN-ENTERPRISE-V1-PAGES/v2/#/construction` |
| Data | Demo data + simulated responses only |
| Identity file | `DEMO_TARGET.json` |

The business demo is one NEXEN shell with **Construction, Corporate and Real Estate** workspaces, file previews, tasks, automation, workers, analytics, MARVIN, a guided tour, and clearly labeled future-development concepts.

> **IMPORTANT:** the older gamified triple-screen HUD in the root of `frontend/` is a **legacy/internal demo**. It is **not** the investor/business presentation target and must not be deployed or presented as the canonical NEXEN demo.

### Run the canonical demo locally

```powershell
$env:NEXEN_PORT = "8795"
python -B backend/server.py
```

Then open:

```text
http://127.0.0.1:8795/v2/#/construction
```

The backend defaults to port 8794 when `NEXEN_PORT` is not set.

### Demo evidence and QA

- Guide: [docs/DEMO-GUIDE.md](docs/DEMO-GUIDE.md)
- Evidence receipt: [docs/DEMO-RECEIPT.md](docs/DEMO-RECEIPT.md)
- Tutorial video: [docs/video/NEXEN-ENTERPRISE-V1-tutorial.mp4](docs/video/NEXEN-ENTERPRISE-V1-tutorial.mp4)
- Construction screenshot: [docs/img/v2/03-construction-home-1080p.png](docs/img/v2/03-construction-home-1080p.png)

```bash
node tests/demo_qa.js
node tests/demo_buttons.js
node tools/demo_receipt.js
```

The most recent repository receipts record **106 browser QA checks** and **514/514 button and checkbox checks** passing for the workspace demo.

## Repository map

```text
frontend/v2/      CANONICAL business/investor demo
frontend/assets/  shared branding assets
frontend/         legacy/internal HUD files also remain here for now
backend/          local demo server + demo API
data/             synthetic sample data
docs/             demo guide, evidence, screenshots and tutorial video
tests/            backend/browser/demo QA
tools/            demo recording and documentation helpers
```

## Deployment rule

The private repository is the **source of truth**.

GitHub Pages is not available for this private repository on the current GitHub plan, so the public repository `dbgamerboy/NEXEN-ENTERPRISE-V1-PAGES` is a **deployment artifact only**. It must contain only the static business-demo assets required to present `frontend/v2/`; it is not a second source tree.

**Do not create a V3/V4 demo folder to supersede this. Update the canonical target only after `DEMO_TARGET.json` is deliberately changed.**

## Backend

`backend/server.py` serves the static frontend and the local demo API:

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Demo mode, vector count/source, runnable modules |
| `GET /api/search?q=` | Search sample or configured vector data |
| `POST /api/roi` | Workflow ROI demo |
| `POST /api/breaker` | Circuit-breaker/fallback demo |
| `POST /api/chunk` | Text chunking demo |
| `POST /api/module/run` | Allowlisted local module runner |

The server binds to `127.0.0.1`. Demo UI data is synthetic unless the owner explicitly starts the server with approved local data/module paths.
