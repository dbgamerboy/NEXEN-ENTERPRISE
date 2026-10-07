// Records the NEXEN ENTERPRISE tutorial video (1920x1080, captions, visible cursor) with Playwright.
// Run: node tools/record_tutorial_video.js   (env: PYTHON, PLAYWRIGHT_PATH, PW_CHANNEL=chrome)
// Output: docs/video/NEXEN-ENTERPRISE-tutorial.webm (voice is not recorded; MARVIN speech is browser audio)
const { spawn, execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "docs", "video");
const PORT = 8500 + Math.floor(Math.random() * 90);
const PY = process.env.PYTHON || "python";
fs.mkdirSync(OUT, { recursive: true });

const INIT = () => {
  const mk = () => {
    if (document.getElementById("vcap")) return;
    const s = document.createElement("style");
    s.textContent = `#vcap{pointer-events:none;position:fixed;left:50%;top:78px;transform:translateX(-50%);z-index:2147483000;background:rgba(8,9,12,.92);border:1px solid #73c7ff;color:#fff;font:700 28px/1.3 Inter,"Segoe UI",system-ui,sans-serif;padding:14px 28px;border-radius:14px;max-width:1300px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.6);transition:opacity .3s}
    #vcap small{display:block;font:600 18px/1.3 Inter,"Segoe UI",sans-serif;color:#aab2c3;margin-top:4px}
    #vcur{position:fixed;z-index:2147483001;width:26px;height:26px;border-radius:50%;background:rgba(79,140,255,.55);border:3px solid #fff;pointer-events:none;left:-50px;top:-50px;transform:translate(-50%,-50%);transition:transform .08s}
    #vcur.d{transform:translate(-50%,-50%) scale(.6);background:rgba(255,255,255,.8)}`;
    document.head.appendChild(s);
    const c = document.createElement("div"); c.id = "vcap"; c.style.opacity = "0"; document.body.appendChild(c);
    const k = document.createElement("div"); k.id = "vcur"; document.body.appendChild(k);
    document.addEventListener("mousemove", (e) => { k.style.left = e.clientX + "px"; k.style.top = e.clientY + "px"; }, true);
    document.addEventListener("mousedown", () => k.classList.add("d"), true);
    document.addEventListener("mouseup", () => k.classList.remove("d"), true);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mk); else mk();
};

function narrate(webm, caps, secs) {
  const tmp = path.join(OUT, "_narration"); fs.mkdirSync(tmp, { recursive: true });
  const wavs = [];
  caps.forEach((c, i) => {
    const wav = path.join(tmp, `n${i}.wav`);
    const ps = `Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.Rate = 2; $s.SetOutputToWaveFile('${wav.replace(/'/g, "''")}'); $s.Speak('${c.text.replace(/'/g, "''")}'); $s.Dispose()`;
    execFileSync("powershell", ["-NoProfile", "-NonInteractive", "-Command", ps], { stdio: "ignore" });
    const secsLong = (fs.statSync(wav).size - 44) / 44100; const gap = ((caps[i + 1] ? caps[i + 1].t : secs * 1000) - c.t) / 1000;
    if (secsLong > gap) console.log(`  warning: narration ${i} is ${secsLong.toFixed(1)}s but the gap is ${gap.toFixed(1)}s`);
    wavs.push({ wav, ms: Math.max(0, c.t + 150) });
  });
  const ff = process.env.FFMPEG || "ffmpeg";
  const mp4 = path.join(OUT, "NEXEN-ENTERPRISE-tutorial.mp4");
  const inputs = ["-i", webm].concat(...wavs.map((w) => ["-i", w.wav]));
  const filt = wavs.map((w, i) => `[${i + 1}:a]adelay=${w.ms}|${w.ms}[a${i}]`).join(";") + ";" + wavs.map((_, i) => `[a${i}]`).join("") + `amix=inputs=${wavs.length}:normalize=0[aout]`;
  execFileSync(ff, ["-y", ...inputs, "-filter_complex", filt, "-map", "0:v", "-map", "[aout]", "-c:v", "libx264", "-preset", "fast", "-crf", "23", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-shortest", mp4], { stdio: "ignore" });
  console.log(`narrated mp4 -> ${mp4} (${(fs.statSync(mp4).size / 1048576).toFixed(1)} MB)`);
  fs.rmSync(tmp, { recursive: true, force: true });
}

async function main() {
  const srv = spawn(PY, ["-B", path.join(ROOT, "backend", "server.py")], { env: { ...process.env, NEXEN_PORT: String(PORT) }, stdio: "ignore" });
  const base = `http://127.0.0.1:${PORT}/`;
  for (let i = 0; i < 40; i++) { try { if ((await fetch(base)).ok) break; } catch (e) { /* wait */ } await new Promise((r) => setTimeout(r, 150)); }
  const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } } });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const beat = (ms) => page.waitForTimeout(ms);
  let holdUntil = 0;
  const cap = async (t, sub) => {
    const w = holdUntil - Date.now(); if (w > 0) await page.waitForTimeout(w);
    const text = (t + ". " + (sub || "")).replace(/…/g, "").replace(/\s+/g, " ").trim();
    holdUntil = Date.now() + text.split(" ").length * 480 + 700; // wait for the spoken line before the next caption
    caps.push({ t: Date.now() - t0, text }); return capShow(t, sub);
  };
  const capShow = async (t, sub) => page.evaluate(([t, s]) => { const c = document.getElementById("vcap"); if (!c) return; c.innerHTML = t + (s ? "<small>" + s + "</small>" : ""); c.style.opacity = "1"; }, [t, sub || ""]);
  const hideCap = async () => page.evaluate(() => { const c = document.getElementById("vcap"); if (c) c.style.opacity = "0"; });
  const go = async (sel) => { const l = page.locator(sel).first(); const b = await l.boundingBox(); if (b) await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 25 }); await beat(250); await l.click(); };
  const t0 = Date.now(), caps = [];
  try {
    await page.goto(base + "#/"); await page.waitForSelector("#cards .icard"); await page.mouse.move(960, 700);
    await cap("NEXEN ENTERPRISE", "Pick an industry. Everything is demo data."); await beat(4600);
    await go("#enter-construction"); await page.waitForSelector("#tour.on");
    await cap("A 5-step tutorial", "Back, Next, Skip or Try MARVIN"); await beat(3800);
    for (let i = 0; i < 5; i++) { await beat(2300); if (i < 4) await go("#t-next"); }
    await go("#t-next"); await beat(900);
    await cap("The workspace", "KPIs, priority items and MARVIN's recommendation, all demo data"); await beat(3600);
    await page.evaluate(() => document.querySelector("#main").scrollTo({ top: 560, behavior: "smooth" })); await cap("Files, activity and workers", ""); await beat(3800);
    await page.evaluate(() => document.querySelector("#main").scrollTo({ top: 0, behavior: "smooth" })); await beat(900);
    await go("#pri-1"); await page.waitForSelector("#modal.on");
    await cap("Open any file preview", "With a MARVIN Summary and related files"); await beat(4600);
    await go("#pv-close"); await beat(500);
    await go("#marvin-fab"); await page.waitForSelector("#drawer.on"); await cap("Meet MARVIN", "Suggested questions, text, or the microphone"); await beat(2600);
    await go("#mic"); await cap("Microphone demo", "Listening, then a sample question"); await beat(3400);
    await page.waitForFunction(() => document.querySelectorAll("#convo .bub.bot .txt").length >= 2, null, { timeout: 8000 });
    await cap("MARVIN answers", "Press Speak Response to hear it"); await beat(5200);
    await go("#d-close"); await beat(700);
    await cap("Switch industries in one click", "Same shell, different business"); await go("#seg button[data-ind=corporate]"); await beat(3800);
    await go("#meet-now"); await page.waitForSelector("#meet-end");
    await cap("Corporate: a live meeting", "MARVIN captures decisions and actions"); await beat(9200);
    await go("#meet-end"); await page.waitForSelector("#meet-save"); await cap("Meeting notes in one click", ""); await beat(3600);
    await go("#meet-save"); await beat(1500);
    await cap("Real Estate", "Listings, offers and inspections"); await go("#seg button[data-ind=real-estate]"); await beat(3800);
    await go("#pri-1"); await page.waitForSelector("#modal.on"); await beat(3000); await go("#pv-close"); await beat(500);
    await page.locator("#sec-future").scrollIntoViewIfNeeded(); await cap("Future development", "Concept previews. Not shipped today."); await beat(5200);
    await page.evaluate(() => document.querySelector("#main").scrollTo({ top: 0, behavior: "smooth" })); await go("#home-logo"); await page.waitForSelector("#cards .icard");
    await cap("NEXEN ENTERPRISE", "Open. Understand. Ask MARVIN."); await beat(7000);
  } finally {
    const secs = Math.round((Date.now() - t0) / 1000);
    await ctx.close(); const v = await page.video().path(); await browser.close(); srv.kill();
    const dest = path.join(OUT, "NEXEN-ENTERPRISE-tutorial.webm");
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
    fs.renameSync(v, dest);
    fs.writeFileSync(path.join(OUT, "captions.json"), JSON.stringify(caps, null, 2));
    console.log(`recorded ${secs}s -> ${dest} (${(fs.statSync(dest).size / 1048576).toFixed(1)} MB), ${caps.length} captions`);
    narrate(dest, caps, secs);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
