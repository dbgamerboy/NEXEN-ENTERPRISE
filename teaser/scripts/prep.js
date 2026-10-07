// Prepares MARVIN voice lines (Kokoro via Hyperframes TTS, Windows SAPI as fallback), measures them with ffprobe,
// and writes src/timeline.json: the single source of truth for scene starts, voice windows and SFX hits.
// Run: node scripts/prep.js   (env: FFPROBE, HYPERFRAMES_PYTHON)
const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const AUD = path.join(ROOT, "public", "audio");
const FPS = 30;
const FFPROBE = process.env.FFPROBE || "ffprobe";
const venvPy = path.join(ROOT, ".venv", "Scripts", "python.exe");

const LINES = {
  answer: "Good morning. Three items need your attention. Change Order seventeen needs approval, plus thirty eight thousand four hundred dollars. R F I forty two is forty eight hours overdue. Start with Change Order seventeen.",
  meeting: "Notes are ready. One decision, three actions.",
  outro: "Open. Understand. Ask MARVIN."
};

function kokoro(id, text) {
  const out = path.join(AUD, id + ".wav");
  const env = { ...process.env }; if (fs.existsSync(venvPy)) env.HYPERFRAMES_PYTHON = venvPy;
  const r = spawnSync("npx", ["--yes", "hyperframes", "tts", text, "--voice", "am_adam", "--output", out], { env, shell: true, encoding: "utf8", timeout: 600000 });
  return r.status === 0 && fs.existsSync(out) && fs.statSync(out).size > 4000;
}
function sapi(id, text) {
  const out = path.join(AUD, id + ".wav");
  const ps = `Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; try { $s.SelectVoice('Microsoft David Desktop') } catch {}; $s.Rate = 0; $s.SetOutputToWaveFile('${out.replace(/'/g, "''")}'); $s.Speak('${text.replace(/'/g, "''")}'); $s.Dispose()`;
  execFileSync("powershell", ["-NoProfile", "-NonInteractive", "-Command", ps], { stdio: "ignore" });
}
const dur = (f) => parseFloat(execFileSync(FFPROBE, ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", f], { encoding: "utf8" }));

const engine = {};
for (const [id, text] of Object.entries(LINES)) {
  const f = path.join(AUD, id + ".wav");
  if (fs.existsSync(f) && fs.statSync(f).size > 4000) { engine[id] = "existing"; continue; }
  if (process.env.NO_KOKORO !== "1" && kokoro(id, text)) engine[id] = "kokoro am_adam"; else { sapi(id, text); engine[id] = "windows sapi (fallback)"; }
  console.log("voice", id, "->", engine[id]);
}
const d = {}; for (const id of Object.keys(LINES)) d[id] = Math.ceil(dur(path.join(AUD, id + ".wav")) * FPS);
console.log("voice frames:", d);

// scene lengths in frames (S4 and S6 and S9 stretch to fit the voice)
const L = { S0: 150, S1: 150, S2: 270, S3: 180, S4: 60 + 60 + 45 + 25 + d.answer + 45, S5: 240, S6: 305 + d.meeting + 45, S7: 180, S8: 150, S9: Math.max(180, 55 + d.outro + 70) };
const scenes = {}; let t = 0;
for (const k of Object.keys(L)) { scenes[k] = { start: t, dur: L[k] }; t += L[k]; }
const total = t;
const voice = [
  { id: "answer", file: "audio/answer.wav", start: scenes.S4.start + 60 + 60 + 45 + 25, dur: d.answer },
  { id: "meeting", file: "audio/meeting.wav", start: scenes.S6.start + 305, dur: d.meeting },
  { id: "outro", file: "audio/outro.wav", start: scenes.S9.start + 55, dur: d.outro }
];
const sfx = [
  { file: "audio/sfx/card-slide-1.ogg", start: scenes.S1.start + 8, vol: 0.5 },
  { file: "audio/sfx/impactSoft_medium_001.ogg", start: scenes.S2.start + 4, vol: 0.6 },
  { file: "audio/sfx/click_003.ogg", start: scenes.S4.start + 56, vol: 0.7 },
  { file: "audio/sfx/impactSoft_medium_001.ogg", start: scenes.S4.start + 60 + 60 + 45 + 20, vol: 0.5 },
  { file: "audio/sfx/card-slide-1.ogg", start: scenes.S5.start + 80, vol: 0.5 },
  { file: "audio/sfx/card-slide-1.ogg", start: scenes.S5.start + 160, vol: 0.5 },
  { file: "audio/sfx/click_003.ogg", start: scenes.S6.start + 80, vol: 0.6 },
  { file: "audio/sfx/impactSoft_medium_001.ogg", start: scenes.S8.start + 6, vol: 0.5 },
  { file: "audio/sfx/bong_001.ogg", start: scenes.S9.start + 16, vol: 0.7 }
];
const timeline = { fps: FPS, width: 1920, height: 1080, total, scenes, voice, sfx, music: { file: "audio/music.mp3", vol: 0.3 }, voiceEngine: engine };
fs.writeFileSync(path.join(ROOT, "src", "timeline.json"), JSON.stringify(timeline, null, 2));
console.log(`timeline: ${total} frames = ${(total / FPS).toFixed(1)}s`);
