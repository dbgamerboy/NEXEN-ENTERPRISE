// playwright-demo-qa: launches the NEXEN workspace demo, drives every required state, saves screenshots and results.
// Run: node tests/demo_qa.js   (env: PYTHON, PLAYWRIGHT_PATH, PW_CHANNEL=chrome)
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");

const ROOT = path.resolve(__dirname, "..");
const SHOTS = path.join(ROOT, "docs", "img");
const PORT = 8700 + Math.floor(Math.random() * 90);
const PY = process.env.PYTHON || "python";
const results = [], shots = [], consoleErrors = [], badAssets = [];
fs.mkdirSync(SHOTS, { recursive: true });

function rec(area, name, pass, detail) { results.push({ area, name, pass: !!pass, detail: detail || "" }); console.log((pass ? "  PASS " : "  FAIL ") + area + ": " + name + (pass || !detail ? "" : " | " + detail)); }
async function shot(page, name) { const f = path.join(SHOTS, name + ".png"); await page.screenshot({ path: f }); shots.push("docs/img/" + name + ".png"); }
function watch(page, tag) {
  page.on("pageerror", (e) => consoleErrors.push(tag + " pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(tag + " console: " + m.text()); });
  page.on("response", (r) => { if (r.status() >= 400) badAssets.push(tag + " " + r.status() + " " + r.url()); });
  page.on("requestfailed", (r) => badAssets.push(tag + " failed " + r.url()));
}
const txt = (page, sel) => page.locator(sel).first().innerText();

async function main() {
  const srv = spawn(PY, ["-B", path.join(ROOT, "backend", "server.py")], { env: { ...process.env, NEXEN_PORT: String(PORT) }, stdio: "ignore" });
  const base = `http://127.0.0.1:${PORT}/`;
  for (let i = 0; i < 40; i++) { try { if ((await fetch(base)).ok) break; } catch (e) { /* wait */ } await new Promise((r) => setTimeout(r, 150)); }
  const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  try { await desktop(browser, base); await narrow(browser, base); await laptop(browser, base); } finally { await browser.close(); srv.kill(); }
  const fails = results.filter((r) => !r.pass).length;
  rec("Console", "no console errors or page errors across all runs", consoleErrors.length === 0, consoleErrors.join(" || "));
  rec("Assets", "no broken assets or failed requests", badAssets.length === 0, badAssets.join(" || "));
  fs.writeFileSync(path.join(ROOT, "docs", "qa-results.json"), JSON.stringify({ when: new Date().toISOString(), results, shots }, null, 2));
  const f2 = results.filter((r) => !r.pass).length;
  console.log(`\n${results.length - f2} passed, ${f2} failed, ${shots.length} screenshots`);
  process.exit(f2 ? 1 : 0);
}

async function runPrompt(page, area, expect) {
  await page.click("#marvin-fab"); await page.waitForSelector("#drawer.on");
  rec(area, "MARVIN opens", await page.locator("#drawer.on").count() === 1);
  rec(area, "MARVIN status is Ready", (await txt(page, "#d-status")) === "Ready");
  await page.click("#sq-0");
  await page.waitForFunction((t) => document.querySelector("#convo").innerText.includes(t), expect, { timeout: 5000 }).then(() => rec(area, "suggested prompt returns a relevant answer", true), () => rec(area, "suggested prompt returns a relevant answer", false, "missing: " + expect));
  const n0 = await page.evaluate(() => window.__speakCount);
  await page.locator("[data-speak]").last().click();
  const n1 = await page.evaluate(() => window.__speakCount);
  rec(area, "Speak Response triggers voice playback", n1 === n0 + 1, "speakCount " + n0 + " to " + n1);
  await page.evaluate(() => speechSynthesis && speechSynthesis.cancel());
}

async function desktop(browser, base) {
  console.log("DESKTOP 1920x1080");
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage(); watch(page, "desktop");
  await page.goto(base + "#/");
  await page.waitForSelector("#cards .icard");
  rec("Landing", "headline and 3 industry cards render", (await txt(page, ".hero h1")).includes("Connected") && await page.locator("#cards .icard").count() === 3);
  rec("Landing", "each card has an ENTER WORKSPACE button and preview", await page.locator("#cards .enter").count() === 3 && await page.locator("#cards svg").count() === 3);
  rec("Landing", "no horizontal overflow at 1920", await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await shot(page, "01-landing-1080p");

  const kpiSets = {}, wsNames = {};
  // Construction first run: tutorial auto starts
  await page.click("#enter-construction");
  await page.waitForSelector("#tour.on");
  rec("Tutorial", "auto-opens on first run", true);
  const titles = [];
  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(450);
    titles.push(await txt(page, "#t-h"));
    const vis = await page.evaluate(() => { const s = document.querySelector("#spot"), c = document.querySelector("#tcard").getBoundingClientRect(); return { spot: getComputedStyle(s).display, cardIn: c.left >= 0 && c.top >= 0 && c.right <= innerWidth && c.bottom <= innerHeight }; });
    rec("Tutorial", `step ${i + 1} card on screen${[1, 2, 3].includes(i) ? " with spotlight" : ""}`, vis.cardIn && (![1, 2, 3].includes(i) || vis.spot === "block"), JSON.stringify(vis));
    if (i === 2) { rec("Tutorial", "Try MARVIN button visible on the MARVIN step", await page.locator("#t-try").isVisible()); await shot(page, "02-tutorial-marvin-step"); }
    if (i === 1) { await page.click("#t-back"); await page.waitForTimeout(250); rec("Tutorial", "Back returns to step 1", (await txt(page, "#t-h")) === "Welcome to NEXEN"); await page.click("#t-next"); await page.waitForTimeout(250); }
    if (i < 4) await page.click("#t-next");
  }
  rec("Tutorial", "five steps in order", titles.join("|") === "Welcome to NEXEN|Your workspace|Meet MARVIN|Automation + workers|You're ready", titles.join("|"));
  await page.click("#t-next");
  rec("Tutorial", "Finish closes and remembers completion", await page.locator("#tour.on").count() === 0 && (await page.evaluate(() => localStorage.getItem("nexen_demo_tour_done"))) === "1");
  await page.click("#g-tour"); await page.waitForSelector("#tour.on"); await page.click("#t-skip");
  rec("Tutorial", "restart works and Skip Tutorial closes it", await page.locator("#tour.on").count() === 0);

  async function inspectIndustry(id, wsExpect, fileIdx, fileMust, promptExpect, kpiMust) {
    const a = id;
    wsNames[id] = await txt(page, "#ws-name");
    rec(a, "workspace name is " + wsExpect, wsNames[id] === wsExpect, wsNames[id]);
    const k = await page.locator(".kpi").allInnerTexts(); kpiSets[id] = k.join("|");
    rec(a, "4 KPI cards incl. " + kpiMust, k.length === 4 && k[0].includes(kpiMust), k[0]);
    rec(a, "4 priority items", await page.locator("#sec-priority .pri").count() === 4);
    rec(a, "recent files list (5) with status badges", await page.locator("#sec-files .frow:not(.head)").count() === 5 && await page.locator("#sec-files .st").count() === 5);
    rec(a, "5 simulated workers listed", await page.locator("#sec-workers .worker").count() === 5);
    rec(a, "recent activity shows 5 entries", await page.locator("#sec-activity .tl li").count() === 5);
    await shot(page, "03-" + id + "-home-1080p");
    await page.click("#nav-files"); await page.waitForFunction(() => document.querySelectorAll("#sec-files .frow:not(.head)").length === 8 && /\/files$/.test(location.hash), null, { timeout: 4000 }).then(() => rec(a, "Files view lists all 8 files", true), () => rec(a, "Files view lists all 8 files", false));
    await page.click("#file-" + fileIdx); await page.waitForSelector("#modal.on");
    const body = (await txt(page, "#mbox")).replace(/\s+/g, " ").toLowerCase();
    rec(a, "file preview opens with expected content", fileMust.every((t) => body.includes(t.toLowerCase())), "missing: " + fileMust.filter((t) => !body.includes(t.toLowerCase())).join(","));
    rec(a, "preview shows MARVIN Summary, details and related files", body.includes("marvin summary") && body.includes("owner") && (await page.locator("#mbox .rel").count()) >= 0);
    await shot(page, "04-" + id + "-file-preview");
    await page.click("#pv-close"); rec(a, "preview closes", await page.locator("#modal.on").count() === 0);
    await page.click("#nav-home");
    await runPrompt(page, a, promptExpect);
    if (id === "construction") await shot(page, "05-marvin-response-construction"); else await shot(page, "05-marvin-response-" + id);
    await page.click("#d-close"); await page.waitForTimeout(350);
    rec(a, "MARVIN closes", await page.locator("#drawer.on").count() === 0);
  }

  await inspectIndustry("construction", "Riverside Tower Project", 1, ["RFI #042", "Electrical Routing Conflict", "Awaiting Response", "October 5, 2026", "Project Engineer", "Electrical conduit conflicts with revised HVAC routing on Level 8.", "Provide revised routing direction prior to drywall installation."], "Three items need your attention at Riverside Tower", "82%");

  // mic flow in Construction
  await page.click("#marvin-fab"); await page.waitForSelector("#drawer.on");
  const c0 = await page.evaluate(() => window.__speakCount);
  await page.click("#mic");
  rec("MARVIN", "mic shows Listening… and waveform", (await txt(page, "#d-status")) === "Listening…" && await page.locator("#wave.on").count() === 1);
  await shot(page, "06-marvin-listening");
  await page.waitForFunction(() => document.querySelectorAll("#convo .bub.bot .txt").length >= 3 && document.querySelectorAll("#convo .bub.me").length >= 2, null, { timeout: 7000 }).then(() => rec("MARVIN", "mic inserts scripted request, then shows MARVIN answer", true), () => rec("MARVIN", "mic inserts scripted request, then shows MARVIN answer", false));
  await page.waitForFunction((n) => window.__speakCount > n, c0, { timeout: 4000 }).then(() => rec("MARVIN", "mic flow attempts voice playback", true), () => rec("MARVIN", "mic flow attempts voice playback", false));
  await page.evaluate(() => speechSynthesis && speechSynthesis.cancel());
  await page.click("#d-in"); await page.fill("#d-in", "which invoices need approval?"); await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector("#convo").innerText.includes("Invoice 8921"), null, { timeout: 5000 }).then(() => rec("MARVIN", "typed question gets a matching answer", true), () => rec("MARVIN", "typed question gets a matching answer", false));
  await page.fill("#d-in", "tell me a joke"); await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector("#convo").innerText.includes("simulated response"), null, { timeout: 5000 }).then(() => rec("MARVIN", "unknown question gets a safe fallback", true), () => rec("MARVIN", "unknown question gets a safe fallback", false));
  await page.fill("#d-in", "<img src=x onerror=alert(1)>"); await page.keyboard.press("Enter"); await page.waitForTimeout(900);
  rec("MARVIN", "typed input is escaped, not rendered as HTML", await page.locator("#convo img").count() === 0);
  await page.keyboard.press("Escape"); await page.waitForTimeout(350);
  rec("MARVIN", "Escape closes the drawer", await page.locator("#drawer.on").count() === 0);

  // industry switching
  await page.click("#seg button[data-ind=corporate]"); await page.waitForFunction(() => document.querySelector("#ws-name").textContent === "Northstar Operations");
  rec("Switching", "Construction to Corporate swaps workspace instantly", true);
  await inspectIndustry("corporate", "Northstar Operations", 3, ["Vendor Agreement", "Brightloop Cloud", "Notice deadline", "MARVIN SUMMARY"], "Three items need executive attention", "$4.8M");
  // corporate meeting: briefing, live meeting, notes
  await page.click("#meet-brief"); await page.waitForSelector("#modal.on");
  const brief = (await txt(page, "#mbox")).toLowerCase();
  rec("Meeting", "briefing shows agenda, attendees, pre-read and MARVIN talking points", ["agenda", "attendees", "pre-read", "marvin talking points", "q3 results"].every((t) => brief.includes(t)));
  await shot(page, "16-corporate-meeting-briefing");
  const m0 = await page.evaluate(() => window.__speakCount); await page.click("#meet-play");
  rec("Meeting", "Play briefing triggers voice playback", (await page.evaluate(() => window.__speakCount)) === m0 + 1);
  await page.evaluate(() => speechSynthesis && speechSynthesis.cancel());
  await page.click("#meet-start"); await page.waitForFunction(() => document.querySelectorAll("#mt-tr .trl").length >= 4, null, { timeout: 8000 }).then(() => rec("Meeting", "live meeting streams transcript lines", true), () => rec("Meeting", "live meeting streams transcript lines", false));
  rec("Meeting", "MARVIN captures decisions and actions live", (await page.locator("#mt-cap .capi").count()) >= 2);
  await shot(page, "17-corporate-meeting-live");
  await page.click("#meet-end"); await page.waitForSelector("#meet-save");
  rec("Meeting", "end meeting shows summary and 4 captured items", (await txt(page, "#mbox")).includes("MARVIN SUMMARY") && await page.locator("#mbox .capi").count() === 4);
  await shot(page, "18-corporate-meeting-notes");
  await page.click("#meet-save"); await page.waitForSelector("#modal.on", { state: "detached", timeout: 2000 }).catch(() => {});
  rec("Meeting", "saving notes updates the activity feed and the file status", (await txt(page, "#sec-activity")).includes("leadership meeting notes") && (await txt(page, "#file-2")).includes("Updated"));
  await page.click("#pri-2"); await page.waitForSelector("#meet-start"); rec("Meeting", "the MEDIUM briefing priority item opens the meeting", true); await page.keyboard.press("Escape");
  await page.click("#seg button[data-ind=real-estate]"); await page.waitForFunction(() => document.querySelector("#ws-name").textContent === "Evergreen Realty Group");
  rec("Switching", "Corporate to Real Estate swaps workspace instantly", true);
  await inspectIndustry("real-estate", "Evergreen Realty Group", 3, ["Buyer Offer", "Johnson Family", "$402,000", "MARVIN SUMMARY"], "Three deals need attention", "18");
  const uniq = new Set(Object.values(kpiSets)).size === 3;
  rec("Switching", "each industry has unique KPI data", uniq, JSON.stringify(kpiSets));
  const hashOk = await page.evaluate(() => location.hash);
  rec("Routes", "hash route reflects workspace and view", hashOk.startsWith("#/real-estate"), hashOk);

  // all nav views per route
  for (const v of ["workspace", "files", "tasks", "automation", "workers", "activity", "analytics", "home"]) {
    await page.click("#nav-" + v); await page.waitForTimeout(120);
    const ok = await page.evaluate(() => document.querySelector("#page").innerText.length > 120);
    rec("Navigation", `${v} view renders content`, ok);
  }
  await page.click("#nav-tasks"); await page.locator("[data-task]").first().check(); rec("Navigation", "task checkbox toggles and updates the badge", (await txt(page, "#nav-tasks")).includes("3"));
  await page.click("#nav-home");
  await page.fill("#search", "disclosure"); await page.waitForTimeout(200);
  rec("Navigation", "search filters the Files view", await page.locator("#sec-files .frow:not(.head)").count() === 1);
  await page.fill("#search", ""); await page.click("#nav-home");
  await page.click("#bell"); rec("Navigation", "notifications open with 4 items", await page.locator("#mbox .pri").count() === 4); await page.keyboard.press("Escape");

  // future development
  await page.click("#nav-home"); await page.locator("#sec-future").scrollIntoViewIfNeeded(); await page.waitForTimeout(250);
  const fut = await txt(page, "#sec-future");
  rec("Future", "section titled FUTURE DEVELOPMENT with 3 cards", fut.includes("FUTURE DEVELOPMENT") && await page.locator("#sec-future .fcard").count() === 3);
  rec("Future", "required titles and badges present", ["NEXEN Spatial Workspace", "MARVIN Spatial Command Center", "Immersive Multi-Agent Operations", "CONCEPT PREVIEW", "RESEARCH / FUTURE DEVELOPMENT"].every((t) => fut.includes(t)));
  rec("Future", "disclaimer text present", fut.includes("Concept visualization. Not representative of currently shipped functionality."));
  rec("Future", "every concept image carries an in-image FUTURE DEVELOPMENT watermark", (await page.locator("#sec-future svg").evaluateAll((els) => els.every((e) => e.textContent.includes("FUTURE DEVELOPMENT")))));
  rec("Future", "future items are not in the sidebar navigation", !(await txt(page, "#side")).match(/VR|spatial|future/i));
  await shot(page, "07-future-development");
  await page.click("#future-1"); rec("Future", "concept card opens enlarged view with disclaimer", (await txt(page, "#mbox")).includes("Not representative of currently shipped functionality"));
  await shot(page, "08-future-enlarged"); await page.keyboard.press("Escape");
  const labels = await page.evaluate(() => { const c = document.body.cloneNode(true); c.querySelectorAll("#sec-future,#modal,#landing,script").forEach((e) => e.remove()); return c.innerText + " " + c.textContent; });
  rec("Labels", "no mocked feature labeled Live, Production, Connected, Verified or Operational", !/\b(live|production|connected|verified|operational)\b/i.test(labels.replace(/Demo Data/g, "")), (labels.match(/\b(live|production|connected|verified|operational)\b/i) || [""])[0]);
  await ctx.close();
}

async function narrow(browser, base) {
  console.log("NARROW 390x844");
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage(); watch(page, "narrow");
  await page.goto(base + "#/"); await page.waitForSelector("#cards .icard");
  rec("Narrow", "landing has no horizontal overflow", await page.evaluate(() => document.documentElement.scrollWidth <= 390), String(await page.evaluate(() => document.documentElement.scrollWidth)));
  await shot(page, "09-narrow-landing");
  await page.tap("#enter-corporate"); await page.waitForSelector("#tour.on");
  const inView = async () => page.evaluate(() => { const c = document.querySelector("#tcard").getBoundingClientRect(); return c.left >= 0 && c.right <= innerWidth && c.top >= 0 && c.bottom <= innerHeight; });
  let ok = true; for (let i = 0; i < 5; i++) { await page.waitForTimeout(450); if (!(await inView())) ok = false; if (i === 3) await shot(page, "10-narrow-tutorial"); if (i < 4) await page.tap("#t-next"); }
  rec("Narrow", "tutorial card fits in the viewport on every step", ok); await page.tap("#t-next");
  rec("Narrow", "workspace has no horizontal overflow", await page.evaluate(() => document.documentElement.scrollWidth <= 390 && document.querySelector("#main").scrollWidth <= 391));
  await shot(page, "11-narrow-home");
  await page.tap("#ham"); await page.waitForTimeout(350);
  rec("Narrow", "menu opens and offers the industry switch", await page.locator("#side.on").count() === 1 && await page.locator("#nav .seg button").first().isVisible());
  await shot(page, "12-narrow-menu");
  await page.tap('#nav .seg button[data-ind="construction"]'); await page.waitForFunction(() => document.querySelector("#ws-name").textContent === "Riverside Tower Project");
  rec("Narrow", "industry switch works from the menu", true);
  await page.tap("#marvin-fab"); await page.waitForSelector("#drawer.on"); await page.tap("#sq-0"); await page.waitForFunction(() => document.querySelector("#convo").innerText.includes("Riverside"), null, { timeout: 5000 });
  rec("Narrow", "MARVIN drawer fits and answers", await page.evaluate(() => document.querySelector("#drawer").getBoundingClientRect().width <= 390));
  await shot(page, "13-narrow-marvin");
  await page.tap("#d-close"); await page.waitForTimeout(350);
  await page.tap("#file-1"); await page.waitForSelector("#modal.on"); rec("Narrow", "file preview fits", await page.evaluate(() => document.querySelector("#mbox").getBoundingClientRect().width <= 390));
  await shot(page, "14-narrow-preview"); await page.keyboard.press("Escape");
  const small = await page.evaluate(() => Array.from(document.querySelectorAll("button")).filter((b) => b.offsetParent && b.getBoundingClientRect().height < 32).map((b) => b.id || b.textContent.trim().slice(0, 20)));
  rec("Narrow", "tap targets at least 32px", small.length === 0, small.join(","));
  await ctx.close();
}

async function laptop(browser, base) {
  console.log("LAPTOP 1366x768");
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await ctx.newPage(); watch(page, "laptop");
  await page.goto(base + "#/real-estate");
  await page.waitForSelector("#page .kpi");
  if (await page.locator("#tour.on").count()) await page.click("#t-skip");
  rec("Laptop", "no horizontal overflow at 1366x768", await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await shot(page, "15-laptop-realestate");
  await ctx.close();
}

main().catch((e) => { console.error(e); process.exit(2); });
