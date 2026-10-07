# NEXEN Demo Build

A clickable demo of the NEXEN triple-screen command HUD. Every button works on sample data. A small Python backend adds live vector search, workflow ROI scoring and a script runner.

| | |
|---|---|
| ![1080p](docs/img/overview-1080p.png) | ![phone](docs/img/phone-screen-2.png) |

**Status (2026-10-07):** 24 backend tests and 114 browser checks pass (1920x1080, 390x844 phone, no-backend file mode). All data in the UI is sample data, not results or earnings claims.

## Try it

```bash
python backend/server.py          # http://127.0.0.1:8794/  (Python 3.10+, no installs)
```

Or open `frontend/index.html` directly. Without the backend the page runs fully on sample data and shows a `SAMPLE DATA` badge. With the backend it shows `LIVE BACKEND`.

On the owner's PC, `START-DEMO.cmd` points the backend at the real vector DB and the vetted scripts (paths below).

## Three screens

| Screen | What is on it |
|---|---|
| 1 · LAUNCH | Onboarding videos, industry picker with exact n8n workflows, courses (pick 2), monthly hustle vote, plan perks, workflow ROI scorer |
| 2 · MARVIN | Core orb, live counters, voice chat, one next action, approvals, agent recording feed, workflow runner, vector DB search |
| 3 · GROW | RPG dungeon with boss and critical strike, login QR (demo), swarm scouts, translation, A/B retention lab, 6 product roadmap, VR room preview, Denizen mode |

**1080p:** all three screens sit side by side and each column scrolls inside itself, so the page never scrolls.
**Phone:** one screen at a time. Use the side arrows, swipe, or the bottom tab bar.

## Tutorial with every button highlighted

- In the app: **▶ Tutorial** runs a spotlight tour of 26 buttons. **Highlight all** outlines and numbers every button.
- On paper: [docs/TUTORIAL.md](docs/TUTORIAL.md) has a highlighted frame for each button.
- Feature map from the pitch to the demo: [docs/FEATURES.md](docs/FEATURES.md).

## Backend

`backend/server.py` serves the frontend and these endpoints (standard library only):

| Endpoint | Does |
|---|---|
| `GET /api/health` | Mode, vector count and source, runnable modules |
| `GET /api/search?q=` | Keyword search over `vectors.jsonl` with stemming and stopwords |
| `POST /api/roi` | Golden Math: profit and repeatability give SCALE, HOLD or KILL |
| `POST /api/breaker` | Self-healing circuit breaker with fallback route |
| `POST /api/chunk` | Word-window chunker used before vector ingest |
| `POST /api/module/run` | Runs an allowlisted vetted script in its own process |

Limits: body 64 KB (413 above that), binds to 127.0.0.1, module names are allowlisted and path-checked.

### Wiring to the owner's real data (nothing personal is in this repo)

| Env var | Points at | Default |
|---|---|---|
| `NEXEN_VECTOR_DIR` | Folder or file holding `vectors.jsonl`, for example `G:\My Drive\NEXEN_VECTOR_DB\jsonl-store\primary-70-data` | bundled synthetic sample |
| `NEXEN_MODULES_DIR` | Vetted scripts, for example `H:\NEXEN_MODULES\_curated` | disabled |
| `NEXEN_PORT` | Port | 8794 |

The vector DB lives on Google Drive (G:) for faster access from every machine. The repo carries only a synthetic 14-chunk sample.

## Cloud pieces

| Piece | Where | Why |
|---|---|---|
| Vector DB (`vectors.jsonl`, backups) | Google Drive `G:\My Drive\NEXEN_VECTOR_DB\jsonl-store` | Shared, off the H: drive |
| Static demo (`frontend/`) | GitHub Pages via `.github/workflows/pages.yml` | Free hosting, works with sample data. Needs a public repo on the free plan |
| Tests | GitHub Actions via `.github/workflows/ci.yml` | Runs backend and browser tests on every push |

## Tests

```bash
python -m unittest discover -s tests -v          # 24 backend tests
npm i playwright && npx playwright install chromium
node tests/ui_smoke.js                           # 114 UI checks
node tools/build_docs.js                         # regenerates docs/TUTORIAL.md and docs/img
```

Env for the Node tools: `PYTHON` (interpreter), `PLAYWRIGHT_PATH`, `PW_CHANNEL=chrome` to use an installed Chrome.

## Layout

```
frontend/   index.html, app.js, sample-data.js (all demo data + tutorial steps), assets/
backend/    server.py, engine/ (roi, breaker, chunker, vectors, modules)
data/       sample/vectors.sample.jsonl (synthetic)
docs/       TUTORIAL.md, FEATURES.md, img/
tests/      test_backend.py, ui_smoke.js
tools/      build_docs.js
```
