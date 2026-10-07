// Deterministic product captures of NEXEN ENTERPRISE for the Remotion teaser.
// Real frontend, real clicks. Writes public/captures/*.png (3840x2160 desktop, 1170x2532 phone) and manifest.json
// with element boxes (CSS px) so callouts land exactly on the real UI.
// Run: node capture/capture.js   (env: PYTHON, PLAYWRIGHT_PATH, PW_CHANNEL=chrome)
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");

const REPO = path.resolve(__dirname, "..", "..");
const OUT = path.resolve(__dirname, "..", "public", "captures");
const PORT = 8400 + Math.floor(Math.random() * 90);
const PY = process.env.PYTHON || "python";
fs.mkdirSync(OUT, { recursive: true });
const manifest = {};

async function shot(page, name, sels, vw, vh) {
  await page.waitForTimeout(450); // let CSS transitions settle so every capture is identical
  await page.screenshot({ path: path.join(OUT, name + ".png") });
  const rects = await page.evaluate((sels) => { const out = {}; for (const s of sels || []) { out[s] = Array.from(document.querySelectorAll(s)).slice(0, 8).map((e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }); } return out; }, sels || []);
  manifest[name] = { w: vw, h: vh, rects };
  console.log("  captured", name);
}

async function main() {
  const srv = spawn(PY, ["-B", path.join(REPO, "backend", "server.py")], { env: { ...process.env, NEXEN_PORT: String(PORT) }, stdio: "ignore" });
  let base = `http://127.0.0.1:${PORT}/`;
  for (let i = 0; i < 40; i++) { try { if ((await fetch(base)).ok) break; } catch (e) { /* wait */ } await new Promise((r) => setTimeout(r, 150)); }
  console.log("capturing from", base);
  const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  try {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
    await ctx.addInitScript(() => { try { localStorage.setItem("nexen_demo_tour_done", "1"); } catch (e) { /* ignore */ } });
    const p = await ctx.newPage();
    const W = 1920, H = 1080;
    const S = (n, s) => shot(p, n, s, W, H);
    console.log("desktop");
    await p.goto(base + "#/"); await p.waitForSelector("#cards .icard");
    await S("01-landing", [".hero h1", ".icard", ".enter"]);
    await p.click("#enter-construction"); await p.waitForSelector("#page .kpi");
    await S("02-con-home", [".kpis", ".kpi", "#sec-priority", ".pri", "#sec-rec", "#sec-files", "#marvin-fab", "#seg", "#nav", "#ws-name"]);
    await p.evaluate(() => document.querySelector("#main").scrollTo({ top: 540, behavior: "instant" }));
    await S("03-con-home-scrolled", ["#sec-files", ".frow", "#sec-activity", "#sec-workers", ".worker"]);
    await p.locator("#sec-future").scrollIntoViewIfNeeded();
    await S("04-con-future", ["#sec-future", ".fcard"]);
    await p.evaluate(() => document.querySelector("#main").scrollTo({ top: 0, behavior: "instant" }));
    await p.click("#pri-1"); await p.waitForSelector("#modal.on");
    await S("05-con-file-rfi", ["#mbox", ".paper", ".msum", ".rel", ".m-h"]);
    await p.keyboard.press("Escape");
    await p.click("#marvin-fab"); await p.waitForSelector("#drawer.on"); await p.waitForTimeout(500);
    await S("06-marvin-ready", ["#drawer", "#sugg", "#mic", "#d-in", "#d-h"]);
    await p.click("#mic"); await p.waitForTimeout(650);
    await S("07-marvin-listening", ["#drawer", "#wave", "#d-h", "#mic"]);
    await p.waitForFunction(() => document.querySelectorAll("#convo .bub.me").length >= 1, null, { timeout: 5000 });
    await p.waitForTimeout(150);
    await S("08-marvin-question", ["#drawer", "#convo .bub.me"]);
    await p.waitForFunction(() => document.querySelectorAll("#convo .bub.bot").length >= 2, null, { timeout: 5000 });
    await S("09-marvin-answer", ["#drawer", "#convo .bub.bot", "[data-speak]", "#d-h"]);
    await p.evaluate(() => speechSynthesis && speechSynthesis.cancel());
    await p.click("#d-close"); await p.waitForTimeout(450);
    await p.click("#seg button[data-ind=corporate]"); await p.waitForFunction(() => document.querySelector("#ws-name").textContent === "Northstar Operations");
    await S("11-corp-home", [".kpis", ".kpi", "#sec-priority", "#sec-rec", "#sec-meeting", "#seg", "#ws-name"]);
    await p.click("#meet-brief"); await p.waitForSelector("#modal.on");
    await S("13-meet-brief", ["#mbox", ".msum", ".m-h", "#meet-start"]);
    await p.click("#meet-start"); await p.waitForSelector("#meet-end");
    for (const n of [1, 3, 5]) { await p.waitForFunction((k) => document.querySelectorAll("#mt-tr .trl").length >= k, n, { timeout: 12000 }); await S("14-meet-live-" + n, ["#mbox", "#mt-tr", "#mt-cap", ".capi", "#meet-end"]); }
    await p.waitForFunction(() => document.querySelectorAll("#mt-tr .trl").length >= 6, null, { timeout: 12000 }); await S("14-meet-live-6", ["#mbox", "#mt-tr", "#mt-cap", ".capi"]);
    await p.click("#meet-end"); await p.waitForSelector("#meet-save");
    await S("15-meet-notes", ["#mbox", ".msum", ".capi", "#meet-save"]);
    await p.keyboard.press("Escape");
    await p.click("#seg button[data-ind=real-estate]"); await p.waitForFunction(() => document.querySelector("#ws-name").textContent === "Evergreen Realty Group");
    await S("12-re-home", [".kpis", ".kpi", "#sec-priority", "#sec-rec", "#seg", "#ws-name"]);
    await p.click("#pri-1"); await p.waitForSelector("#modal.on");
    await S("16-re-file-offer", ["#mbox", ".paper", ".msum", ".m-h"]);
    await p.keyboard.press("Escape");
    await ctx.close();

    console.log("phone");
    const pc = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await pc.addInitScript(() => { try { localStorage.setItem("nexen_demo_tour_done", "1"); } catch (e) { /* ignore */ } });
    const q = await pc.newPage(); const PS = (n, s) => shot(q, n, s, 390, 844);
    await q.goto(base + "#/"); await q.waitForSelector("#cards .icard");
    await PS("20-phone-landing", []);
    await q.tap("#enter-construction"); await q.waitForSelector("#page .kpi");
    await PS("21-phone-home", ["#ham", "#marvin-fab"]);
    await q.tap("#ham"); await q.waitForTimeout(350);
    await PS("22-phone-menu", ["#side", "#nav .seg"]);
    await q.tap('#nav .seg button[data-ind="corporate"]'); await q.waitForFunction(() => document.querySelector("#ws-name").textContent === "Northstar Operations");
    await PS("23-phone-corp", ["#ws-name"]);
    await q.tap("#marvin-fab"); await q.waitForSelector("#drawer.on"); await q.tap("#sq-0");
    await q.waitForFunction(() => document.querySelectorAll("#convo .bub.bot").length >= 2); await q.waitForTimeout(300);
    await PS("24-phone-marvin", ["#drawer", "#convo .bub.bot"]);
    await pc.close();
    fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
    console.log("manifest written:", Object.keys(manifest).length, "captures");
  } finally { await browser.close(); srv.kill(); }
}
main().catch((e) => { console.error(e); process.exit(1); });
