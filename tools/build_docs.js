// Builds docs/TUTORIAL.md and docs/img/*.png from the live UI and the NEXEN_TOUR list (single source of truth).
// Run: node tools/build_docs.js   (PLAYWRIGHT_PATH, PW_CHANNEL, PYTHON as in tests/ui_smoke.js)
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");

const ROOT = path.resolve(__dirname, "..");
const IMG = path.join(ROOT, "docs", "img");
const PORT = 8900 + Math.floor(Math.random() * 90);
const PY = process.env.PYTHON || "python";

async function main() {
  fs.mkdirSync(IMG, { recursive: true });
  const srv = spawn(PY, ["-B", path.join(ROOT, "backend", "server.py")], { env: { ...process.env, NEXEN_PORT: String(PORT) }, stdio: "ignore" });
  const base = `http://127.0.0.1:${PORT}/`;
  for (let i = 0; i < 40; i++) { try { if ((await fetch(base + "api/health")).ok) break; } catch (e) { /* wait */ } await new Promise((r) => setTimeout(r, 150)); }
  const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  let tour;
  try {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await ctx.newPage();
    await page.goto(base); await page.waitForSelector("#mode.live"); await page.waitForTimeout(1500);
    tour = await page.evaluate(() => window.NEXEN_TOUR);
    await page.screenshot({ path: path.join(IMG, "overview-1080p.png") });
    await page.click("#hl-btn"); await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(IMG, "overview-1080p-highlighted.png") });
    await page.click("#hl-btn");
    await page.click("#tour-btn");
    for (let i = 0; i < tour.length; i++) {
      await page.waitForTimeout(750);
      const b = await page.evaluate(() => { const r = (id) => document.querySelector(id).getBoundingClientRect(); const s = r("#spot"), t = r("#tip");
        return { l: Math.min(s.left, t.left), t: Math.min(s.top, t.top), r: Math.max(s.right, t.right), b: Math.max(s.bottom, t.bottom), w: innerWidth, h: innerHeight }; });
      const pad = 30, x = Math.max(0, Math.floor(b.l - pad)), y = Math.max(0, Math.floor(b.t - pad));
      const clip = { x, y, width: Math.min(b.w - x, Math.ceil(b.r - b.l + 2 * pad)), height: Math.min(b.h - y, Math.ceil(b.b - b.t + 2 * pad)) };
      await page.screenshot({ path: path.join(IMG, `step-${String(i + 1).padStart(2, "0")}.png`), clip });
      if (i < tour.length - 1) await page.click("#tip-n2");
    }
    await ctx.close();

    const pctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const ph = await pctx.newPage();
    await ph.goto(base); await ph.waitForSelector("#mode.live"); await ph.waitForTimeout(1200);
    for (let s = 0; s < 3; s++) {
      await ph.click(`#tabbar button[data-go="${s}"]`); await ph.waitForTimeout(800);
      await ph.screenshot({ path: path.join(IMG, `phone-screen-${s + 1}.png`) });
    }
    await ph.click('#tabbar button[data-go="0"]'); await ph.waitForTimeout(700);
    await ph.click("#hl-btn"); await ph.waitForTimeout(200);
    await ph.screenshot({ path: path.join(IMG, "phone-highlighted.png") });
    await pctx.close();
  } finally { await browser.close(); srv.kill(); }

  const names = ["Header and navigation", "Screen 1 · LAUNCH (learn, pick, install)", "Screen 2 · MARVIN (command center)", "Screen 3 · GROW (game, swarm, global)"];
  const group = (s) => (s.screen == null ? 0 : s.screen + 1);
  let n = 0, md = `# NEXEN Demo Build: button tutorial

Every button below works in the demo on **sample data**. Highlighted frames are generated from the live UI by \`tools/build_docs.js\`, so they match the build.

**Try it in the app:** press **▶ Tutorial** (top right) for a guided spotlight tour, or **Highlight all** to outline and number every button.

| View | Image |
|---|---|
| 1080p desktop, three screens side by side | ![overview](img/overview-1080p.png) |
| 1080p with every button highlighted | ![highlighted](img/overview-1080p-highlighted.png) |

**Phone:** one screen at a time. Use the **side arrows** (‹ ›), swipe, or the bottom tab bar.

| LAUNCH | MARVIN | GROW | All buttons highlighted |
|---|---|---|---|
| ![](img/phone-screen-1.png) | ![](img/phone-screen-2.png) | ![](img/phone-screen-3.png) | ![](img/phone-highlighted.png) |

`;
  for (let g = 0; g < 4; g++) {
    md += `\n## ${names[g]}\n\n`;
    tour.forEach((s, i) => {
      if (group(s) !== g) return; n++;
      md += `### ${i + 1}. ${s.name}\n\n${s.does}\n\n![${s.name}](img/step-${String(i + 1).padStart(2, "0")}.png)\n\n`;
    });
  }
  md += `\n---\nAll numbers, names and results in the demo are sample data for demonstration. They are not results or earnings claims.\n`;
  fs.writeFileSync(path.join(ROOT, "docs", "TUTORIAL.md"), md);
  console.log(`wrote TUTORIAL.md with ${n} buttons and ${fs.readdirSync(IMG).length} images`);
}
main().catch((e) => { console.error(e); process.exit(1); });
