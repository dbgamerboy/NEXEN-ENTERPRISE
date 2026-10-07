---
name: ui-polish-audit
description: Audit the rendered NEXEN demo UI from screenshots, not source. Use after each visible change.
---

Composes the existing design-review and design-qa skills. Steps: run `node tests/demo_qa.js`, open docs/img/v2/*.png, check hierarchy, spacing, truncation, empty space, tap targets, contrast, one visual language, label safety.
Output: a short list of findings with the screenshot name, then fix and rerun. Do not judge from source code alone.
