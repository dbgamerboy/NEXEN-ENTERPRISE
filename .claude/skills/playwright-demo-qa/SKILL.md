---
name: playwright-demo-qa
description: Launch the NEXEN demo and verify landing, three workspaces, switching, file preview, MARVIN, voice trigger, tutorial, future section, console, assets, narrow viewport.
---

Command: `PW_CHANNEL=chrome PLAYWRIGHT_PATH=<playwright> PYTHON=<python> node tests/demo_qa.js`.
Writes docs/qa-results.json and screenshots to docs/img/v2/. Exits non-zero on any failure.
Composes the existing webapp-testing approach; no new framework.
