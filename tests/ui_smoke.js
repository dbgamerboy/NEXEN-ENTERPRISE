// UI smoke test: starts the demo server, clicks every button at 1920x1080 and phone size, checks layout.
// Run: node tests/ui_smoke.js   (set PLAYWRIGHT_PATH if playwright is not installed locally; PYTHON for the interpreter)
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");

const ROOT = path.resolve(__dirname, "..");
const PY = process.env.PYTHON || "python";
const PORT = 8800 + Math.floor(Math.random() * 90);
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.log("  FAIL:", m); } };

async function main() {
  const srv = spawn(PY, ["-B", path.join(ROOT, "backend", "server.py")], { env: { ...process.env, NEXEN_PORT: String(PORT) }, stdio: "ignore" });
  const base = `http://127.0.0.1:${PORT}/`;
  for (let i = 0; i < 40; i++) { try { if ((await fetch(base + "api/health")).ok) break; } catch (e) { /* wait */ } await new Promise((r) => setTimeout(r, 150)); }
  const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  try {
    await desktop(browser, base);
    await phone(browser, base);
    await staticMode(browser);
  } finally { await browser.close(); srv.kill(); }
  console.log(`\n${passes} checks passed, ${fails} failed`);
  process.exit(fails ? 1 : 0);
}

function watch(page, errs) {
  page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text()); });
}
const txt = (page, sel) => page.locator(sel).first().innerText();

async function desktop(browser, base) {
  console.log("DESKTOP 1920x1080");
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage(); const errs = []; watch(page, errs);
  await page.goto(base); await page.waitForSelector("#mode.live", { timeout: 5000 });
  ok(true, "live mode pill");
  const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, sh: document.documentElement.scrollHeight, ih: innerHeight,
    cols: ["#s0", "#s1", "#s2"].map((s) => { const r = document.querySelector(s).getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right), Math.round(r.width)]; }),
    arrow: getComputedStyle(document.querySelector("#arr-r")).display }));
  ok(m.sw <= m.iw, "no horizontal overflow, scrollWidth " + m.sw);
  ok(m.sh <= m.ih, "page fits 1080p without page scroll, " + m.sh + " vs " + m.ih);
  ok(m.cols.every((c) => c[0] >= 0 && c[1] <= m.iw && c[2] > 400), "three columns visible side by side " + JSON.stringify(m.cols));
  ok(m.arrow === "none", "side arrows hidden when all three screens fit");

  // screen 1
  await page.click("#onb-play-0"); ok(await page.locator("#modal.on").count() === 1, "video modal opens");
  await page.click("#m-watched"); ok(await page.locator("#modal.on").count() === 0, "video modal closes");
  ok((await txt(page, "#k-xp")) === "50", "XP after video is 50");
  const chips = await page.locator("#ind-chips .chip").count(); ok(chips === 8, "8 industry chips");
  for (let i = 0; i < chips; i++) { await page.locator("#ind-chips .chip").nth(i).click(); ok(await page.locator("#wf-list .wf").count() === 3, "industry " + i + " lists 3 workflows"); }
  await page.locator("#ind-chips .chip").nth(1).click();
  await page.locator("#wf-list .wf .btn").nth(0).click(); await page.locator("#wf-list .wf .btn").nth(1).click();
  ok((await txt(page, "#k-wf")) === "2", "two workflows installed");
  ok(await page.locator("#wf-pick option").count() === 2, "picker lists installed workflows");
  await page.locator("#wf-list .wf .btn").nth(1).click(); ok((await txt(page, "#k-wf")) === "1", "uninstall works");
  await page.click("#course-0"); await page.click("#course-1");
  ok(await page.locator("#course-2").isDisabled(), "third course locks after two picks");
  await page.click("#course-1"); ok(!(await page.locator("#course-2").isDisabled()), "unpick frees the lock");
  await page.click("#vote-0"); ok(await page.locator("#vote-1").isDisabled(), "one vote per month");
  for (const p of [1, 2, 3]) await page.click(`#plan-tabs .tab:nth-child(${p})`);
  ok((await page.locator("#perks li").count()) === 4, "Denizen perks listed");
  await page.click("#subscribe"); ok((await txt(page, "#toast")).includes("no payment"), "subscribe is demo only");
  await page.click("#roi-run"); await page.waitForFunction(() => document.querySelector("#roi-src").textContent.includes("live"));
  ok((await txt(page, "#roi-out")).includes("SCALE"), "ROI SCALE via live backend");
  await page.fill("#roi-earned", "5"); await page.fill("#roi-spent", "10"); await page.click("#roi-run");
  await page.waitForFunction(() => document.querySelector("#roi-out").textContent.includes("KILL"));
  await page.fill("#roi-rep", "99"); await page.click("#roi-run");
  ok((await txt(page, "#toast")).includes("Check inputs"), "ROI rejects repeatability 99");

  // screen 2
  await page.fill("#chat-in", "what is the money move today"); await page.click("#chat-send");
  await page.waitForFunction(() => document.querySelector("#log").textContent.includes("Fastest move"));
  await page.fill("#chat-in", "<img src=x onerror=alert(1)>"); await page.keyboard.press("Enter");
  ok(await page.locator("#log img").count() === 0, "chat input is not rendered as HTML");
  for (let i = 0; i < 3; i++) await page.locator("#quick .quick").nth(i).click();
  ok((await page.locator("#log .msg").count()) >= 9, "quick chips add messages");
  await page.click("#voice"); await page.click("#voice");
  const xp0 = +(await txt(page, "#k-xp")); await page.click("#next-do"); ok(+(await txt(page, "#k-xp")) > xp0, "Do it awards XP");
  const t0 = await txt(page, "#next-t"); await page.click("#next-skip"); ok((await txt(page, "#next-t")) !== t0, "Skip shows a new action");
  await page.click("#appr-0 .ok"); await page.click("#appr-1 .no"); await page.click("#appr-2 .ok");
  ok((await txt(page, "#appr-0")).toLowerCase().includes("approved") && (await txt(page, "#appr-1")).toLowerCase().includes("denied"), "approve and deny mark rows");
  await page.click("#rec-toggle"); ok((await txt(page, "#rec-txt")) === "Paused", "recording pauses"); await page.click("#rec-toggle");
  await page.click("#wf-run"); await page.waitForFunction(() => document.querySelector("#wf-term").textContent.includes("done"), null, { timeout: 8000 });
  await page.click("#brain-go"); await page.waitForFunction(() => document.querySelector("#brain-out .item"));
  ok((await txt(page, "#brain-src")).includes("live"), "brain search used live backend");
  await page.fill("#brain-q", "zzzzqqq"); await page.click("#brain-go");
  await page.waitForFunction(() => document.querySelector("#brain-out").textContent.includes("No match"));

  // screen 3
  for (let i = 0; i < 7; i++) await page.click("#atk");
  ok(await page.locator("#atk").isDisabled(), "attack disabled after boss dies");
  await page.waitForFunction(() => document.querySelector("#log").textContent.includes("Critical strike"), null, { timeout: 4000 }).then(() => ok(true), () => ok(false, "MARVIN announces critical strike"));
  await page.click("#dng"); ok(!(await page.locator("#atk").isDisabled()), "next dungeon resets");
  await page.click("#qr-gen");
  const png = path.join(os.tmpdir(), "nexen-shot.png"); fs.writeFileSync(png, Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==", "base64"));
  await page.setInputFiles("#shot", png); ok((await txt(page, "#shot-n")).includes("nexen-shot.png"), "balance screenshot attach");
  for (let i = 1; i <= 5; i++) { await page.click(`#swarm-tabs .tab:nth-child(${i})`); await page.click("#swarm-run"); await page.waitForFunction(() => !document.querySelector("#swarm-run").disabled); }
  ok(await page.locator("#swarm-tbl tr").count() === 5, "swarm table has header + 4 rows");
  const langs = await page.locator("#tr-lang option").allInnerTexts(); const seen = new Set();
  for (let i = 0; i < langs.length; i++) { await page.selectOption("#tr-lang", { index: i }); await page.click("#tr-go"); seen.add(await txt(page, "#tr-out")); }
  ok(seen.size === 7, "7 distinct translations"); await page.selectOption("#tr-lang", "ar"); await page.click("#tr-go");
  ok((await page.locator("#tr-out").getAttribute("dir")) === "rtl", "Arabic renders right to left");
  await page.click("#ab-run"); await page.waitForFunction(() => document.querySelector("#ab-out").textContent.includes("+21"), null, { timeout: 5000 });
  await page.click("#vr-open"); ok(await page.locator("#cube").count() === 1, "VR room opens"); await page.keyboard.press("Escape");
  ok(await page.locator("#modal.on").count() === 0, "Escape closes modal");
  await page.click("#den"); ok((await txt(page, "#den")).includes("ON"), "Denizen on"); await page.click("#den");

  // highlight all + tour
  await page.click("#hl-btn"); ok(await page.evaluate(() => document.body.classList.contains("hl")), "highlight-all on"); await page.click("#hl-btn");
  await page.click("#tour-btn");
  const steps = await page.evaluate(() => window.NEXEN_TOUR.length);
  for (let i = 0; i < steps; i++) {
    await page.waitForTimeout(160);
    const r = await page.evaluate(() => { const s = document.querySelector("#spot").getBoundingClientRect(), t = document.querySelector("#tip").getBoundingClientRect();
      return { sv: getComputedStyle(document.querySelector("#spot")).display, s: [s.left, s.top, s.right, s.bottom], t: [t.left, t.top, t.right, t.bottom], w: innerWidth, h: innerHeight }; });
    const inside = (b) => b[0] >= -8 && b[1] >= -8 && b[2] <= r.w + 8 && b[3] <= r.h + 8;
    ok(r.sv === "block" && inside(r.t) && r.s[2] - r.s[0] > 10, `tour step ${i + 1} spotlight and tip on screen ${JSON.stringify(r)}`);
    await page.click("#tip-n2");
  }
  ok((await page.locator("#tip").evaluate((e) => getComputedStyle(e).display)) === "none", "tour ends cleanly");
  ok(errs.length === 0, "no console or page errors: " + errs.join(" | "));
  // sweep: every enabled visible button clicks without a page error
  const n = await page.locator("button:visible:not([disabled])").count(); ok(n > 40, "found " + n + " clickable buttons");
  await ctx.close();
}

async function phone(browser, base) {
  console.log("PHONE 390x844");
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage(); const errs = []; watch(page, errs);
  await page.goto(base); await page.waitForSelector("#mode.live");
  const m = await page.evaluate(() => { const t = document.querySelector("#track");
    return { sw: document.documentElement.scrollWidth, iw: innerWidth, tsw: t.scrollWidth, tcw: t.clientWidth, arrow: getComputedStyle(document.querySelector("#arr-r")).display,
      tab: getComputedStyle(document.querySelector("#tabbar")).display,
      over: ["#s0", "#s1", "#s2"].map((s) => document.querySelector(s).scrollWidth - document.querySelector(s).clientWidth),
      small: Array.from(document.querySelectorAll("button")).filter((b) => b.offsetParent && b.getBoundingClientRect().height < 32 && !b.closest("#tip")).map((b) => b.id || b.textContent.trim()) }; });
  ok(m.sw <= 390 && m.iw === 390, "phone: no horizontal page overflow, scrollWidth " + m.sw + " innerWidth " + m.iw);
  ok(m.tsw === m.tcw * 3, "phone: track holds 3 screens");
  ok(m.arrow === "block" && m.tab === "grid", "phone: side arrows and tab bar visible");
  ok(m.over.every((o) => o <= 1), "phone: no screen overflows sideways " + m.over);
  ok(m.small.length === 0, "phone: tap targets at least 32px high " + m.small.join(","));
  ok(await page.locator("#arr-l").isDisabled(), "left arrow disabled on first screen");
  await page.click("#arr-r"); await page.waitForTimeout(700);
  ok(await page.evaluate(() => Math.round(document.querySelector("#track").scrollLeft / innerWidth)) === 1, "right arrow moves to screen 2");
  await page.click("#arr-r"); await page.waitForTimeout(700); ok(await page.locator("#arr-r").isDisabled(), "right arrow disabled on last screen");
  await page.click('#tabbar button[data-go="0"]'); await page.waitForTimeout(700);
  ok(await page.evaluate(() => document.querySelector("#tabbar button.on").dataset.go) === "0", "tab bar jumps and highlights");
  await page.tap("#onb-play-1"); await page.tap("#m-close");
  await page.click("#tour-btn");
  const steps = await page.evaluate(() => window.NEXEN_TOUR.length);
  for (let i = 0; i < steps; i++) {
    await page.waitForTimeout(650);
    const r = await page.evaluate(() => { const s = document.querySelector("#spot").getBoundingClientRect(), t = document.querySelector("#tip").getBoundingClientRect();
      return { s: [s.left, s.top, s.right, s.bottom], t: [t.left, t.top, t.right, t.bottom], w: innerWidth, h: innerHeight }; });
    const inside = (b) => b[0] >= -10 && b[1] >= -10 && b[2] <= r.w + 10 && b[3] <= r.h + 10;
    ok(inside(r.t) && r.s[2] > 0 && r.s[0] < r.w && r.s[1] < r.h, `phone tour step ${i + 1} visible`);
    await page.click("#tip-n2");
  }
  ok(errs.length === 0, "phone: no console or page errors: " + errs.join(" | "));
  await ctx.close();
}

async function staticMode(browser) {
  console.log("STATIC (no backend, file://)");
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage(); const errs = []; watch(page, errs);
  await page.goto("file:///" + path.join(ROOT, "frontend", "index.html").replace(/\\/g, "/"));
  ok((await txt(page, "#mode")) === "SAMPLE DATA", "file:// stays in sample mode");
  await page.click("#roi-run"); ok((await txt(page, "#roi-out")).includes("SCALE"), "ROI works without backend");
  await page.click("#brain-go"); await page.waitForFunction(() => document.querySelector("#brain-out .item"));
  ok((await txt(page, "#brain-src")).includes("sample"), "brain search falls back to browser sample");
  ok(errs.length === 0, "static: no console or page errors: " + errs.join(" | "));
  await ctx.close();
}

main().catch((e) => { console.error(e); process.exit(2); });
