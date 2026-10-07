# NEXEN ENTERPRISE — SOURCE OF TRUTH

## 1. Product identity

**Product name:** NEXEN ENTERPRISE

NEXEN ENTERPRISE is the public-facing product experience in this repository.

This repository has one canonical product surface. Routine fixes improve that surface in place. Git records history; folder names do not.

## 2. The core idea

NEXEN is best understood as a **universal execution harness**.

The long-term product thesis is not “one giant AI app containing every feature.” The harness coordinates capabilities that may remain independently useful and independently deployable:

- frontier AI models
- local AI models
- standalone software products
- Windows automations
- workflow systems
- scripts and deterministic workers
- APIs and external services
- connected devices where appropriate
- business-specific operating contexts
- personal operating contexts such as NEXEN LYFE

MARVIN is the human-facing operator that turns those capabilities into one coherent interaction surface.

A useful mental model is:

    USER
      ↓
    MARVIN
      ↓
    NEXEN CONTROL PLANE / HARNESS
      ↓
    AI · PRODUCTS · WORKFLOWS · WINDOWS AUTOMATION · APIs · WORKERS
      ↓
    BUSINESS / PERSONAL CONTEXT
      ↓
    RESULTS · EVIDENCE · ALERTS · DECISIONS
      ↓
    MARVIN PRESENTS THE OUTCOME

This is the platform direction. It is not a claim that every listed integration is implemented in this public demo today.

## 3. Public NEXEN versus personal NEXEN

These are intentionally different products/surfaces.

### Public NEXEN

Optimized for clarity, onboarding, trust, and immediate comprehension.

A new viewer should be able to open the product and understand what to do without a developer explaining the architecture.

The public product should expose only the capabilities needed for the customer’s context.

### Personal NEXEN

The owner’s internal operating environment can be much denser.

It may coordinate many businesses, AI systems, automation tools, internal utilities, development systems, research lanes, content systems, and personal operations simultaneously.

The personal control plane is allowed to be more technical because its operator understands the machinery.

### Shared principle

Personal NEXEN discovers and proves capabilities.

Public NEXEN productizes the capabilities that deserve to become customer-facing.

Do not force feature parity between the personal and public surfaces.

## 4. Standalone products are first-class

A capability does not need to be permanently welded into NEXEN core.

A standalone product can remain a standalone product and also register with NEXEN.

A product/module should be able to describe at least:

- identity
- purpose
- entry point
- inputs
- outputs
- dependencies
- host/resource requirements
- permissions
- current health/status
- last verification
- available actions
- MARVIN hooks
- automation/workflow hooks

This allows the same capability to exist as:

1. a standalone product,
2. a NEXEN module,
3. part of an industry bundle.

The harness should favor:

**REUSE → REPAIR → COMPOSE → EXTEND → CREATE**

before duplicating functionality.

## 5. MARVIN’s role

MARVIN is not every subsystem.

MARVIN is the intelligent interface and operator over the capabilities NEXEN can safely expose.

The target interaction is outcome-oriented:

1. the user asks for an outcome,
2. NEXEN identifies available capabilities,
3. the appropriate product/worker/workflow executes,
4. the result is verified,
5. evidence is retained,
6. MARVIN presents the result in human terms.

The UX principle is the “golden platter”: the operator should not have to remember which model, script, workflow, program, machine, or API produced the result when that detail is not needed.

## 6. NEXEN LYFE

NEXEN LYFE represents the personal-life operating context: schedule, priorities, routines, reminders, and personal tasks.

It belongs in the broader NEXEN platform thesis but is not presented as a shipped feature of this three-industry public demo unless explicitly implemented and verified.

## 7. What this repository demonstrates today

The current verified frontend demonstrates:

- one NEXEN ENTERPRISE shell
- Construction workspace
- Corporate workspace
- Real Estate workspace
- industry-specific KPIs and priority items
- believable mock business files
- file preview experiences
- task, automation, worker, activity, and analytics views
- MARVIN drawer
- industry-aware scripted MARVIN responses
- simulated microphone flow
- browser speech synthesis trigger
- Corporate simulated meeting flow
- guided five-step product tutorial
- responsive desktop / laptop / phone layouts
- FUTURE DEVELOPMENT concept cards

All demo data and simulated responses are labeled accordingly.

## 8. Future development boundary

VR, spatial interfaces, immersive command centers, and other roadmap concepts are **FUTURE DEVELOPMENT**.

They may appear as concept previews.

They do not belong in the normal product navigation and must not be represented as currently shipped functionality.

## 9. Canonical repository structure

| Path | Purpose |
|---|---|
| frontend/ | The one customer-facing NEXEN ENTERPRISE frontend |
| frontend/index.html | Product entry point |
| frontend/styles.css | Canonical visual system and responsive rules |
| frontend/data.js | Construction, Corporate, and Real Estate demo data |
| frontend/app.js | Frontend behavior, MARVIN, tutorial, previews, routing |
| frontend/assets/ | Product-owned visual assets |
| backend/ | Local demo server and bounded demo API |
| tests/ | Backend and browser verification |
| docs/ | Source of truth, demo guide, evidence, screenshots, and media |
| tools/ | Reproducible receipt and tutorial-recording utilities |
| teaser/ | Reproducible Remotion teaser source; build caches are ignored |
| .claude/skills/ | Project-local build and QA instructions |
| .github/workflows/ | CI and optional Pages deployment |

**Canonical product URL:** `/`

There is no numbered frontend directory.

## 10. Versioning and anti-spaghetti rule

A normal fix does not create another product tree.

These are ordinary in-place changes:

- bug fix
- color/theme correction
- metadata correction
- copy change
- documentation change
- responsive fix
- accessibility fix
- MARVIN improvement
- new mock file
- tutorial improvement
- QA fix

Do not create parallel `V2`, `FINAL`, `FINAL2`, `NEW`, or similar trees for those changes.

Use Git commits and tags when historical reference is needed.

A genuinely new product or incompatible product line may justify a separate repository or branch, but that is an explicit product decision—not the default reaction to a fix.

## 11. Visual system

The canonical public shell uses a dark premium base with electric blue / cyan brand accents.

- Brand: `#4f8cff`
- Brand highlight: `#73c7ff`
- Information: `#6aa8ff`
- Success: `#3ddc97`
- Warning / attention: `#ffb13b`
- Background: `#08090c`

Industry context may use a secondary tint:

- Construction: amber
- Corporate: blue
- Real Estate: teal

Do not reintroduce a global red brand theme.

A danger/error status may still use a semantically appropriate alert color when it communicates an actual destructive/error state.

## 12. Demo flow

The primary demo should remain understandable in roughly 60–90 seconds:

1. Open NEXEN ENTERPRISE.
2. Choose Construction.
3. Read the workspace summary and priority items.
4. Open a believable file.
5. Ask MARVIN what needs attention.
6. Hear/see the prototype voice response.
7. Switch to Corporate.
8. Show the simulated meeting experience.
9. Switch to Real Estate.
10. Show FUTURE DEVELOPMENT only as clearly labeled concept material.

The demo should communicate product value, not expose the entire internal technology stack.

## 13. Product story and media direction

The public product story is intentionally simpler than the underlying platform thesis.

The strongest demo statement is:

**Your Business. Connected. Intelligent. Executable.**

The strongest visual proof is not an architecture diagram. It is the same NEXEN shell becoming multiple believable businesses while MARVIN surfaces the next important action.

Product media should therefore:

- use the actual rendered NEXEN interface rather than fake replacement UI,
- show real deterministic captures of the demo,
- keep demo/simulation labels visible,
- let MARVIN be the memorable interaction,
- show industry switching as proof of adaptability,
- keep effects restrained and premium,
- avoid dumping internal architecture onto a first-time viewer,
- treat future-development concepts as teasers, not shipped functionality.

The preferred launch-film flow is:

1. product promise,
2. real workspace,
3. priorities/files,
4. MARVIN interaction,
5. industry switching,
6. selected operational moment such as the Corporate meeting,
7. responsive/mobile proof,
8. future-development teaser,
9. NEXEN ENTERPRISE end card.

This preserves the useful creative direction developed during the /brag exploration without making the temporary /brag workbench canonical product source.

## 14. Media

### Tutorial

The reproducible local tutorial render is `docs/video/NEXEN-ENTERPRISE-tutorial.mp4`. The public binary is distributed as a GitHub Release asset rather than stored in Git history:

https://github.com/dbgamerboy/NEXEN-ENTERPRISE/releases/download/demo/NEXEN-ENTERPRISE-tutorial.mp4

It is a walkthrough of the actual frontend.

Measured locally on 2026-10-07:

- 1920×1080
- H.264 video
- AAC audio track present
- 104.42 seconds
- 8,528,185 bytes
- SHA-256: `7A2CF5CFACF008D342E4AE1AC344C4BD3F5C829A8959FD352AA4755C60B50E7D`

Audio-track presence is verified technically; subjective voice quality still requires human listening.

### Product teaser

The Remotion project lives under `teaser/`.

It uses real deterministic Playwright captures from the canonical frontend.

Reusable teaser source belongs in Git. Disposable `node_modules`, virtual environments, frame sequences, and render caches do not.

The reproducible local render is `docs/video/NEXEN-ENTERPRISE-teaser.mp4`. The public binary is distributed as a GitHub Release asset rather than stored in Git history: https://github.com/dbgamerboy/NEXEN-ENTERPRISE/releases/download/demo/NEXEN-ENTERPRISE-teaser.mp4

Verified locally on 2026-10-07:

- file: `docs/video/NEXEN-ENTERPRISE-teaser.mp4`
- 1920×1080
- 30 fps
- H.264 video
- AAC audio
- 85.13 seconds
- 18,353,077 bytes
- SHA-256: `553B1E6A5889569BD0F60BE114FAE4221C9EEC6C4F52B5F9AF96F5C3342E5525`

The audio mix is explicitly padded to the full Remotion timeline so the visual outro is not truncated by FFmpeg `-shortest`.

The public-safe teaser build uses generated MARVIN voice by default. Bundled third-party music and SFX are excluded from the public repository unless their redistribution rights are explicitly verified.

## 15. Verification commands

Backend:

    python -m unittest discover -s tests -v

Browser QA:

    node tests/demo_qa.js

Exhaustive interaction sweep:

    node tests/demo_buttons.js

Evidence receipt:

    node tools/demo_receipt.js

A change is not verified because source code exists.

Report **PASS**, **FAIL**, or **NOT RUN**.

## 16. Verified state after canonical frontend consolidation

Verified locally on 2026-10-07 after promoting the current GUI to the canonical root:

- backend test suite: **24 passed / 24**
- browser QA: **106 passed / 106**
- console/page errors in QA: **0**
- broken asset/request failures in QA: **0**
- responsive checks included 1920×1080, 1366×768, and 390×844

- exhaustive interaction sweep: **514 passed / 514**
- exhaustive sweep page errors: **0**

These results were rerun after the canonical-root consolidation, so they are current evidence for this working tree at the time of the run.

## 17. Product truth rule

The frontend is allowed to demonstrate a larger idea than the currently connected backend, but the labeling must stay honest.

Use labels such as:

- Demo Data
- Simulated Response
- Prototype Voice
- Concept Preview
- Future Development

Do not use:

- Live
- Production
- Connected
- Verified
- Operational

for mocked functionality.

## 18. Operating principle

**One product. One canonical frontend. One canonical URL. Git owns history.**

When something needs to be fixed, fix it where it lives.

NEXEN should reduce the operator’s memory burden, not create another layer the operator must remember.


## 19. Product portfolio model

NEXEN is not required to absorb every useful program into one monolithic codebase.

A capability may be:

- a standalone product sold or used independently,
- a reusable module registered with NEXEN,
- a worker used only by another product,
- part of an industry bundle,
- or an internal-only capability used by Personal NEXEN.

The classification depends on whether it has its own user value, purpose, interface or callable entry point, inputs, outputs, dependencies, and lifecycle.

A useful rule is:

**If a capability has a distinct job and can be independently invoked or presented, treat it as product-shaped until proven otherwise.**

This prevents NEXEN core from becoming a dumping ground for every experiment.

## 20. NEXEN as a harness for external products

The platform thesis extends beyond AI.

NEXEN should be able to harness independently powerful tools rather than reimplementing them merely to claim ownership.

That includes:

- frontier AI services,
- local AI runtimes,
- standalone desktop applications,
- Windows automation,
- browser automation,
- workflow engines,
- deterministic scripts,
- APIs,
- connected services,
- and future device adapters where appropriate.

The harness contract is more important than code ownership.

For any registered capability, NEXEN needs to know:

1. What is it?
2. What can it do?
3. How is it invoked?
4. What inputs does it require?
5. What output does it return?
6. What permissions does it need?
7. What can it affect externally?
8. What is its current health/status?
9. When was it last verified?
10. Can MARVIN use it?
11. Can automation/workflows use it?
12. What evidence does execution return?

This is how NEXEN can coordinate powerful standalone products without turning them into tightly coupled spaghetti.

## 21. Multi-business operating model

NEXEN can host multiple operating contexts without forcing them into one undifferentiated workspace.

A target model is:

    NEXEN
      ├─ Business A
      │   ├─ products
      │   ├─ workers
      │   ├─ workflows
      │   └─ MARVIN context
      ├─ Business B
      │   ├─ products
      │   ├─ workers
      │   ├─ workflows
      │   └─ MARVIN context
      ├─ Business C
      │   └─ ...
      └─ NEXEN LYFE
          ├─ schedule
          ├─ priorities
          ├─ routines
          ├─ reminders
          └─ personal tasks

This is a platform direction, not a claim that all contexts are fully implemented in NEXEN ENTERPRISE today.

## 22. Complexity belongs behind the interface

The internal system may be complex. The public experience should not force the customer to understand that complexity.

The customer-facing design principle is:

**The complexity is the engine, not the interface.**

A first-time viewer should not need to understand:

- which model answered,
- which worker executed,
- which machine ran it,
- which workflow engine routed it,
- which API supplied the data,
- or which internal service verified it,

unless that detail is required for trust, approval, troubleshooting, or auditability.

MARVIN should present the useful outcome first and preserve evidence underneath it.

## 23. Investment and capability lesson

The owner’s earlier AI-tool experimentation demonstrated a useful operating lesson:

Early spending was partly capability discovery. Some tools were not fully operationalized, but exposure to working AI products established confidence that AI could produce practical leverage beyond chat.

Going forward, NEXEN should convert that lesson into discipline:

- preserve what was learned,
- avoid buying or rebuilding the same capability repeatedly,
- register reusable capabilities,
- prefer proven execution loops over tool accumulation,
- and treat new tooling as an investment only when it has a defined job, integration path, or learning objective.

The platform should remember what exists so the operator does not have to.

## 24. Productization rule

Personal NEXEN is allowed to discover messy, high-power capabilities.

Public NEXEN should receive only what has been deliberately productized.

The graduation path is:

**DISCOVER → VERIFY → REGISTER → PRODUCTIZE → EXPOSE**

A discovered capability is not automatically ready for customers.

A registered capability is not automatically tested.

A tested capability is not automatically appropriate for the public interface.

This preserves the owner’s ability to experiment aggressively without turning public NEXEN into an experimental control panel.

## 25. Current product principle

The current NEXEN ENTERPRISE demo is intentionally narrow.

It should prove:

- one coherent shell,
- believable industry adaptation,
- useful operational context,
- a strong MARVIN interaction,
- clear customer value,
- and room for the broader NEXEN harness thesis.

It does not need to expose the entire Personal NEXEN operating environment to prove the platform concept.

**The platform may be massive. The next task should still be small.**
