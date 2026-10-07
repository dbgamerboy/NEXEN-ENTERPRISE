# NEXEN demo receipt

Generated 2026-10-07T12:13:18.274Z from docs/qa-results.json (QA run 2026-10-07T12:13:17.865Z) and git status. Last commit before this work: b1f34e2 NEXEN Demo Build: triple-screen HUD with clickable sample data.

## FILES CREATED
- .claude/skills/demo-receipt/SKILL.md
- .claude/skills/future-development-teasers/SKILL.md
- .claude/skills/guided-product-tour/SKILL.md
- .claude/skills/marvin-demo-voice/SKILL.md
- .claude/skills/mock-file-preview/SKILL.md
- .claude/skills/mock-industry-factory/SKILL.md
- .claude/skills/nexen-frontend-demo/SKILL.md
- .claude/skills/playwright-demo-qa/SKILL.md
- .claude/skills/responsive-visual-check/SKILL.md
- .claude/skills/ui-polish-audit/SKILL.md
- docs/DEMO-GUIDE.md
- docs/qa-results.json
- frontend/v2/app.js
- frontend/v2/data.js
- frontend/v2/index.html
- frontend/v2/styles.css
- tests/demo_qa.js
- tools/demo_receipt.js
- docs/img/ (21 screenshots)

## FILES MODIFIED
- README.md
- backend/server.py
- tests/test_backend.py

## ROUTES TESTED
- /v2/#/ (landing)
- /v2/#/construction
- /v2/#/corporate
- /v2/#/real-estate
- /v2/#/<industry>/{workspace,files,tasks,automation,workers,activity,analytics,home}

## INTERACTIONS TESTED (99 checks)
### Landing (3/3)
- PASS: headline and 3 industry cards render
- PASS: each card has an ENTER WORKSPACE button and preview
- PASS: no horizontal overflow at 1920

### Tutorial (11/11)
- PASS: auto-opens on first run
- PASS: step 1 card on screen
- PASS: step 2 card on screen with spotlight
- PASS: Back returns to step 1
- PASS: step 3 card on screen with spotlight
- PASS: Try MARVIN button visible on the MARVIN step
- PASS: step 4 card on screen with spotlight
- PASS: step 5 card on screen
- PASS: five steps in order
- PASS: Finish closes and remembers completion
- PASS: restart works and Skip Tutorial closes it

### construction (15/15)
- PASS: workspace name is Riverside Tower Project
- PASS: 4 KPI cards incl. 82%
- PASS: 4 priority items
- PASS: recent files list (5) with status badges
- PASS: 5 simulated workers listed
- PASS: recent activity shows 5 entries
- PASS: Files view lists all 8 files
- PASS: file preview opens with expected content
- PASS: preview shows MARVIN Summary, details and related files
- PASS: preview closes
- PASS: MARVIN opens
- PASS: MARVIN status is Ready
- PASS: suggested prompt returns a relevant answer
- PASS: Speak Response triggers voice playback
- PASS: MARVIN closes

### MARVIN (7/7)
- PASS: mic shows Listening… and waveform
- PASS: mic inserts scripted request, then shows MARVIN answer
- PASS: mic flow attempts voice playback
- PASS: typed question gets a matching answer
- PASS: unknown question gets a safe fallback
- PASS: typed input is escaped, not rendered as HTML
- PASS: Escape closes the drawer

### Switching (3/3)
- PASS: Construction to Corporate swaps workspace instantly
- PASS: Corporate to Real Estate swaps workspace instantly
- PASS: each industry has unique KPI data

### corporate (15/15)
- PASS: workspace name is Northstar Operations
- PASS: 4 KPI cards incl. $4.8M
- PASS: 4 priority items
- PASS: recent files list (5) with status badges
- PASS: 5 simulated workers listed
- PASS: recent activity shows 5 entries
- PASS: Files view lists all 8 files
- PASS: file preview opens with expected content
- PASS: preview shows MARVIN Summary, details and related files
- PASS: preview closes
- PASS: MARVIN opens
- PASS: MARVIN status is Ready
- PASS: suggested prompt returns a relevant answer
- PASS: Speak Response triggers voice playback
- PASS: MARVIN closes

### real-estate (15/15)
- PASS: workspace name is Evergreen Realty Group
- PASS: 4 KPI cards incl. 18
- PASS: 4 priority items
- PASS: recent files list (5) with status badges
- PASS: 5 simulated workers listed
- PASS: recent activity shows 5 entries
- PASS: Files view lists all 8 files
- PASS: file preview opens with expected content
- PASS: preview shows MARVIN Summary, details and related files
- PASS: preview closes
- PASS: MARVIN opens
- PASS: MARVIN status is Ready
- PASS: suggested prompt returns a relevant answer
- PASS: Speak Response triggers voice playback
- PASS: MARVIN closes

### Routes (1/1)
- PASS: hash route reflects workspace and view

### Navigation (11/11)
- PASS: workspace view renders content
- PASS: files view renders content
- PASS: tasks view renders content
- PASS: automation view renders content
- PASS: workers view renders content
- PASS: activity view renders content
- PASS: analytics view renders content
- PASS: home view renders content
- PASS: task checkbox toggles and updates the badge
- PASS: search filters the Files view
- PASS: notifications open with 4 items

### Future (6/6)
- PASS: section titled FUTURE DEVELOPMENT with 3 cards
- PASS: required titles and badges present
- PASS: disclaimer text present
- PASS: every concept image carries an in-image FUTURE DEVELOPMENT watermark
- PASS: future items are not in the sidebar navigation
- PASS: concept card opens enlarged view with disclaimer

### Labels (1/1)
- PASS: no mocked feature labeled Live, Production, Connected, Verified or Operational

### Narrow (8/8)
- PASS: landing has no horizontal overflow
- PASS: tutorial card fits in the viewport on every step
- PASS: workspace has no horizontal overflow
- PASS: menu opens and offers the industry switch
- PASS: industry switch works from the menu
- PASS: MARVIN drawer fits and answers
- PASS: file preview fits
- PASS: tap targets at least 32px

### Laptop (1/1)
- PASS: no horizontal overflow at 1366x768

### Console (1/1)
- PASS: no console errors or page errors across all runs

### Assets (1/1)
- PASS: no broken assets or failed requests

## SCREENSHOTS
- docs/img/v2/01-landing-1080p.png
- docs/img/v2/02-tutorial-marvin-step.png
- docs/img/v2/03-construction-home-1080p.png
- docs/img/v2/04-construction-file-preview.png
- docs/img/v2/05-marvin-response-construction.png
- docs/img/v2/06-marvin-listening.png
- docs/img/v2/03-corporate-home-1080p.png
- docs/img/v2/04-corporate-file-preview.png
- docs/img/v2/05-marvin-response-corporate.png
- docs/img/v2/03-real-estate-home-1080p.png
- docs/img/v2/04-real-estate-file-preview.png
- docs/img/v2/05-marvin-response-real-estate.png
- docs/img/v2/07-future-development.png
- docs/img/v2/08-future-enlarged.png
- docs/img/v2/09-narrow-landing.png
- docs/img/v2/10-narrow-tutorial.png
- docs/img/v2/11-narrow-home.png
- docs/img/v2/12-narrow-menu.png
- docs/img/v2/13-narrow-marvin.png
- docs/img/v2/14-narrow-preview.png
- docs/img/v2/15-laptop-realestate.png

## PASS
99 of 99 checks passed.

## FAIL
None in this run.

## NOT TESTED
- Audible voice output. Headless Chrome cannot confirm sound. Only that Speak Response calls the speech API (counter) was verified.
- Real microphone input. The mic button is a simulation by design.
- Firefox, Safari and Edge. Only installed Chrome was used.
- A physical phone. Narrow layout was tested with a 390x844 emulated device.
- Screen readers and a full accessibility audit.
- GitHub Pages hosting.

## KNOWN ISSUES
- The landing headline contains the word "Connected" as brand copy from the brief. It is not a status label, and the label scan excludes the landing page.
- The first-run tutorial shows once per browser (localStorage). Use Restart tutorial to see it again.
- On a 390px phone the step 4 tutorial card sits over the top of the tall workers section.
- File previews are UI mocks. No physical Word, PDF or Excel files were generated.
- The gamified quest and boss layer from the first demo (frontend/index.html) is not part of v2.
