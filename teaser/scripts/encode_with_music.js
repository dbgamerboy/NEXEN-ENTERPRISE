// Encodes the already rendered PNG frames (out/frames) with the full audio bed: MARVIN voice, music and SFX.
// Writes to out/music/ so it never collides with build.js outputs.
// Run: node scripts/encode_with_music.js   (env: FFMPEG, MUSIC path to the licensed track)
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const tl = require("../src/timeline.json");
const FF = process.env.FFMPEG || "ffmpeg";
const MUSIC = process.env.MUSIC || path.join(ROOT, "public", tl.music.file);
const FRAMES = path.join(ROOT, "out", "frames");
const OUT = path.join(ROOT, "out", "music");
fs.mkdirSync(OUT, { recursive: true });
const T = tl.total / tl.fps;
const run = (args) => { const r = spawnSync(FF, args, { stdio: "inherit" }); if (r.status !== 0) { console.error("ffmpeg failed"); process.exit(r.status || 1); } };

const inputs = [], filters = [], labels = []; let n = 0;
const add = (file) => { inputs.push("-i", file); return n++; };
const m = add(MUSIC);
let mf = `[${m}:a]atrim=0:${T.toFixed(2)},asetpts=PTS-STARTPTS,volume=${tl.music.vol}`;
for (const v of tl.voice) mf += `,volume=enable='between(t,${(v.start / tl.fps - 0.25).toFixed(2)},${((v.start + v.dur) / tl.fps + 0.4).toFixed(2)})':volume=0.35`;
mf += `,afade=t=in:st=0:d=1.5,afade=t=out:st=${(T - 2.8).toFixed(2)}:d=2.8[music]`; filters.push(mf); labels.push("[music]");
tl.voice.forEach((v, i) => { const k = add(path.join(ROOT, "public", v.file)); const ms = Math.round((v.start / tl.fps) * 1000); filters.push(`[${k}:a]aformat=sample_rates=44100:channel_layouts=stereo,adelay=${ms}|${ms},volume=1.5[v${i}]`); labels.push(`[v${i}]`); });
tl.sfx.forEach((s, i) => { const f = path.join(ROOT, "public", s.file); if (!fs.existsSync(f)) return; const k = add(f); const ms = Math.round((s.start / tl.fps) * 1000); filters.push(`[${k}:a]aformat=sample_rates=44100:channel_layouts=stereo,adelay=${ms}|${ms},volume=${s.vol}[s${i}]`); labels.push(`[s${i}]`); });
filters.push(`${labels.join("")}amix=inputs=${labels.length}:normalize=0:duration=longest,apad=whole_dur=${T.toFixed(2)},atrim=0:${T.toFixed(2)},alimiter=limit=0.95,loudnorm=I=-16:TP=-1.5:LRA=11[mix]`);
const mix = path.join(OUT, "mix.wav");
run(["-y", ...inputs, "-filter_complex", filters.join(";"), "-map", "[mix]", "-ar", "44100", mix]);

const first = fs.readdirSync(FRAMES).filter((f) => f.endsWith(".png")).sort()[0];
const pad = first.match(/(\d+)\.png$/)[1].length;
const out = path.join(OUT, "NEXEN-ENTERPRISE-teaser-with-music.mp4");
run(["-y", "-framerate", String(tl.fps), "-i", path.join(FRAMES, `element-%0${pad}d.png`), "-i", mix, "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-shortest", out]);
console.log("done:", out, (fs.statSync(out).size / 1048576).toFixed(1) + " MB,", T.toFixed(1) + "s");
