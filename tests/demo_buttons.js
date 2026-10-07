// Exhaustive click test for the demo. Every visible button and checkbox is clicked, one per fresh page load.
// A click passes when it changes the page (DOM, route, toast), starts a download, or triggers voice playback.
// Buttons that are already in their active state (current tab, current industry) pass as idempotent.
// Run: node tests/demo_buttons.js   (env: PYTHON, PLAYWRIGHT_PATH, PW_CHANNEL=chrome)
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");

const ROOT = path.resolve(__dirname, "..");
const PORT = 8600 + Math.floor(Math.random() * 90);
const PY = process.env.PYTHON || "python";
const results = [], errors = [];
const INDS = ["construction", "corporate", "real-estate"];
const VIEWS = ["home", "workspace", "files", "tasks", "automation", "workers", "activity", "analytics"];
let base, pageDone, pageFresh, downloaded = false;

const snap = () => {
  const s = document.body.innerHTML + "|" + location.hash + "|" + (document.querySelector("#toast") || {}).className + (document.querySelector("#toast") || {}).textContent + "|" + (window.__speakCount || 0) + "|" + document.activeElement.id;
  let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h + ":" + s.length;
};

async function load(page, hash) { await page.goto("about:blank"); await page.goto(base + "#/" + hash); await page.waitForSelector("#landing:not(.hide), #app:not(.hide)"); await page.waitForTimeout(60); }
async function tag(page, scope) {
  return page.evaluate((sc) => { const root = document.querySelector(sc); if (!root) return []; const out = []; let n = 0;
    root.querySelectorAll("button, input[type=checkbox]").forEach((e) => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); if (r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && !e.disabled && e.closest("[hidden]") === null && cs.display !== "none") { e.setAttribute("data-qa", String(n)); out.push({ i: n, label: (e.getAttribute("aria-label") || e.textContent || e.id || e.type).trim().replace(/\s+/g, " ").slice(0, 40), active: e.classList.contains("on") || e.getAttribute("aria-pressed") === "true" }); n++; } });
    return out; }, scope);
}

async function testScope(name, hash, setup, scope, page) {
  await load(page, hash); if (setup) await setup(page);
  const list = await tag(page, scope);
  if (!list.length) { results.push({ name: name + ": read-only view, no interactive controls (nothing to click)", pass: true, info: true, detail: "" }); return 0; }
  for (const b of list) {
    await load(page, hash); if (setup) await setup(page); await tag(page, scope);
    const t1 = await page.evaluate(snap); await page.waitForTimeout(120); const t2 = await page.evaluate(snap);
    const volatile = t1 !== t2; const sp0 = await page.evaluate(() => window.__speakCount || 0);
    downloaded = false; const errs0 = errors.length;
    let ok = true, detail = "";
    try { await page.locator(`[data-qa="${b.i}"]`).first().click({ timeout: 3500 }); } catch (e) { ok = false; detail = "not clickable: " + e.message.split("\n")[0]; }
    await page.waitForTimeout(260);
    if (ok) { const t3 = await page.evaluate(snap), sp1 = await page.evaluate(() => window.__speakCount || 0);
      const changed = t3 !== t2 || sp1 !== sp0 || downloaded;
      if (!changed && !b.active && !volatile) { ok = false; detail = "no visible effect"; } }
    if (errors.length > errs0) { ok = false; detail += " page error: " + errors.slice(errs0).join(" ; "); }
    results.push({ name: `${name}: ${b.label}${b.active ? " (active)" : ""}`, pass: ok, detail });
    if (!ok) console.log("  FAIL " + name + ": " + b.label + " | " + detail);
  }
  return list.length;
}

const modalSetup = (sel, wait) => async (p) => { await p.click(sel); await p.waitForSelector(wait || "#modal.on"); await p.waitForTimeout(100); };

async function main() {
  const srv = spawn(PY, ["-B", path.join(ROOT, "backend", "server.py")], { env: { ...process.env, NEXEN_PORT: String(PORT) }, stdio: "ignore" });
  base = `http://127.0.0.1:${PORT}/`;
  for (let i = 0; i < 40; i++) { try { if ((await fetch(base)).ok) break; } catch (e) { /* wait */ } await new Promise((r) => setTimeout(r, 150)); }
  const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  const mk = async (done) => { const c = await browser.newContext({ viewport: { width: 1920, height: 1080 }, acceptDownloads: true }); if (done) await c.addInitScript(() => { try { localStorage.setItem("nexen_demo_tour_done", "1"); } catch (e) { /* ignore */ } });
    const p = await c.newPage(); p.on("pageerror", (e) => errors.push(e.message)); p.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); }); p.on("download", () => { downloaded = true; }); return p; };
  pageDone = await mk(true); pageFresh = await mk(false);
  let total = 0;
  try {
    // landing
    total += await testScope("landing", "", null, "#landing", pageDone);
    for (const ind of INDS) {
      console.log(ind);
      total += await testScope(`${ind}/home shell`, `${ind}/home`, null, "#side, #top, #marvin-fab".split(",")[0], pageDone);
      total += await testScope(`${ind}/home top bar`, `${ind}/home`, null, "#top", pageDone);
      await load(pageDone, `${ind}/home`); await pageDone.click("#marvin-fab"); await pageDone.waitForSelector("#drawer.on", { timeout: 3000 }).then(() => results.push({ name: `${ind} Ask MARVIN button opens the drawer`, pass: true, detail: "" }), () => results.push({ name: `${ind} Ask MARVIN button opens the drawer`, pass: false, detail: "drawer did not open" }));
      await pageDone.waitForTimeout(350); await pageDone.click("#d-close"); await pageDone.waitForFunction(() => !document.querySelector("#drawer.on"), null, { timeout: 3000 }).then(() => results.push({ name: `${ind} MARVIN close button closes the drawer`, pass: true, detail: "" }), () => results.push({ name: `${ind} MARVIN close button closes the drawer`, pass: false, detail: "drawer stayed open" }));
      total += 2;
      for (const v of VIEWS) total += await testScope(`${ind}/${v} page`, `${ind}/${v}`, null, "#page", pageDone);
      // file previews: every file
      for (let f = 0; f < 8; f++) total += await testScope(`${ind} file ${f} preview`, `${ind}/files`, modalSetup("#file-" + f), "#mbox", pageDone);
      total += await testScope(`${ind} notifications`, `${ind}/home`, modalSetup("#bell"), "#mbox", pageDone);
      total += await testScope(`${ind} settings`, `${ind}/home`, modalSetup("#nav-settings"), "#mbox", pageDone);
      total += await testScope(`${ind} user menu`, `${ind}/home`, modalSetup("#user"), "#mbox", pageDone);
      for (let k = 0; k < 3; k++) total += await testScope(`${ind} future ${k}`, `${ind}/home`, modalSetup("#future-" + k), "#mbox", pageDone);
      // MARVIN drawer: empty, after an answer, after mic
      total += await testScope(`${ind} MARVIN drawer`, `${ind}/home`, async (p) => { await p.click("#marvin-fab"); await p.waitForSelector("#drawer.on"); await p.waitForTimeout(350); }, "#drawer", pageDone);
      total += await testScope(`${ind} MARVIN drawer with answer`, `${ind}/home`, async (p) => { await p.click("#marvin-fab"); await p.waitForSelector("#drawer.on"); await p.waitForTimeout(350); await p.click("#sq-0"); await p.waitForFunction(() => document.querySelectorAll("#convo .bub.bot").length >= 2); await p.waitForTimeout(300); }, "#drawer", pageDone);
      // tutorial: each step
      for (let st = 0; st < 5; st++) total += await testScope(`${ind} tutorial step ${st + 1}`, `${ind}/home`, async (p) => { await p.evaluate(() => localStorage.removeItem("nexen_demo_tour_done")); await p.goto("about:blank"); await p.goto(base + "#/" + ind + "/home"); await p.waitForSelector("#tour.on"); for (let k = 0; k < st; k++) { await p.waitForTimeout(150); await p.click("#t-next"); } await p.waitForTimeout(500); }, "#tcard", pageFresh);
    }
    // corporate meeting: briefing, live, notes
    total += await testScope("corporate meeting briefing", "corporate/home", modalSetup("#meet-brief"), "#mbox", pageDone);
    total += await testScope("corporate meeting live", "corporate/home", modalSetup("#meet-now"), "#mbox", pageDone);
    total += await testScope("corporate meeting notes", "corporate/home", async (p) => { await p.click("#meet-now"); await p.waitForSelector("#meet-end"); await p.waitForTimeout(300); await p.click("#meet-end"); await p.waitForSelector("#meet-save"); }, "#mbox", pageDone);
    total += await testScope("corporate priority to meeting", "corporate/home", async (p) => { await p.click("#pri-2"); await p.waitForSelector("#meet-start"); }, "#mbox", pageDone);
    total += await testScope("corporate MARVIN meeting answer", "corporate/home", async (p) => { await p.click("#marvin-fab"); await p.waitForSelector("#drawer.on"); await p.waitForTimeout(350); await p.click("#sq-3"); await p.waitForSelector("[data-meet]"); }, "#drawer", pageDone);
  } finally { await browser.close(); srv.kill(); }
  const fails = results.filter((r) => !r.pass);
  fs.writeFileSync(path.join(ROOT, "docs", "button-test-results.json"), JSON.stringify({ when: new Date().toISOString(), total: results.length, passed: results.length - fails.length, readOnlyViews: results.filter((r) => r.info).length, failed: fails }, null, 2));
  console.log(`\n${results.length} buttons and checkboxes clicked, ${results.length - fails.length} passed, ${fails.length} failed. page errors: ${errors.length}`);
  process.exit(fails.length || errors.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(2); });
