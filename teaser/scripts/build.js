// Final render: Remotion renders PNG frames, FFmpeg mixes audio from the same timeline and encodes the MP4.
// Run: node scripts/build.js            (SKIP_FRAMES=1 reuses out/frames; env FFMPEG, CHROME)
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const tl = require("../src/timeline.json");
const FF = process.env.FFMPEG || "ffmpeg";
const CHROME = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const FRAMES = path.join(ROOT, "out", "frames");
const T = tl.total / tl.fps;
const run = (cmd, args, opts) => {
  const r = spawnSync(cmd, args, { stdio: "inherit", cwd: ROOT, ...opts });
  if (r.error) console.error(r.error);
  if (r.status !== 0) { console.error("failed:", cmd, args.slice(0, 4).join(" ")); process.exit(r.status || 1); }
};
const REMOTION_CLI = path.join(ROOT, "node_modules", "@remotion", "cli", "remotion-cli.js");

if (process.env.SKIP_FRAMES !== "1") {
  fs.rmSync(FRAMES, { recursive: true, force: true });
  run(process.execPath, [REMOTION_CLI, "render", "src/index.ts", "Teaser", "out/frames", "--sequence", "--image-format=png", `--browser-executable=${CHROME}`, "--concurrency=4", "--log=warn"]);
}

// Public-safe audio: generated MARVIN voice by default.
// Optional licensed music can be supplied explicitly with NEXEN_TEASER_MUSIC.
// Optional SFX are used only when NEXEN_TEASER_SFX=1 and the local files exist.
const inputs = [], filters = []; let n = 0; const labels = [];
const addPath = (file) => { inputs.push("-i", file); return n++; };
const addPublic = (file) => addPath(path.join(ROOT, "public", file));

const musicPath = process.env.NEXEN_TEASER_MUSIC;
if (musicPath && fs.existsSync(musicPath)) {
  const m = addPath(musicPath);
  let mf = `[${m}:a]atrim=0:${T.toFixed(2)},asetpts=PTS-STARTPTS,volume=${tl.music.vol}`;
  for (const v of tl.voice) mf += `,volume=enable='between(t,${(v.start / tl.fps - 0.25).toFixed(2)},${((v.start + v.dur) / tl.fps + 0.4).toFixed(2)})':volume=0.35`;
  mf += `,afade=t=in:st=0:d=1.5,afade=t=out:st=${(T - 2.8).toFixed(2)}:d=2.8[music]`;
  filters.push(mf); labels.push("[music]");
}

tl.voice.forEach((v, i) => {
  const k = addPublic(v.file);
  const ms = Math.round((v.start / tl.fps) * 1000);
  filters.push(`[${k}:a]aformat=sample_rates=44100:channel_layouts=stereo,adelay=${ms}|${ms},volume=1.5[v${i}]`);
  labels.push(`[v${i}]`);
});

if (process.env.NEXEN_TEASER_SFX === "1") {
  tl.sfx.forEach((s, i) => {
    const p = path.join(ROOT, "public", s.file);
    if (!fs.existsSync(p)) return;
    const k = addPath(p);
    const ms = Math.round((s.start / tl.fps) * 1000);
    filters.push(`[${k}:a]aformat=sample_rates=44100:channel_layouts=stereo,adelay=${ms}|${ms},volume=${s.vol}[s${i}]`);
    labels.push(`[s${i}]`);
  });
}

filters.push(`${labels.join("")}amix=inputs=${labels.length}:normalize=0:duration=longest,apad=whole_dur=${T.toFixed(2)},atrim=0:${T.toFixed(2)},alimiter=limit=0.95,loudnorm=I=-16:TP=-1.5:LRA=11[mix]`);
const mixPath = path.join(ROOT, "out", "mix.wav");
run(FF, ["-y", ...inputs, "-filter_complex", filters.join(";"), "-map", "[mix]", "-ar", "44100", mixPath]);

const first = fs.readdirSync(FRAMES).filter((f) => f.endsWith(".png")).sort()[0];
const pad = first.match(/(\d+)\.png$/)[1].length;
const videoDir = path.resolve(ROOT, "..", "docs", "video");
fs.mkdirSync(videoDir, { recursive: true });
const out = path.join(videoDir, "NEXEN-ENTERPRISE-teaser.mp4");
run(FF, ["-y", "-framerate", String(tl.fps), "-i", path.join(FRAMES, `element-%0${pad}d.png`), "-i", mixPath, "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-shortest", out]);
console.log("done:", out, (fs.statSync(out).size / 1048576).toFixed(1) + " MB,", T.toFixed(1) + "s");
