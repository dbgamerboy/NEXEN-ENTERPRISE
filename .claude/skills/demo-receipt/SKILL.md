---
name: demo-receipt
description: Produce exact evidence for the demo: files, routes, interactions, screenshots, pass, fail, not tested, known issues.
---

Command: `node tools/demo_receipt.js` after demo_qa.js. It reads docs/qa-results.json and git status and writes docs/DEMO-RECEIPT.md. Report only what the file says.
