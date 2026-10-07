# NEXEN ENTERPRISE V1 teaser (Remotion)

A 85 second product film built from real Playwright captures of the frontend. Remotion renders the frames, FFmpeg mixes the audio and encodes the MP4.

| Step | Command | What it does |
|---|---|---|
| 1 | `npm install` | Remotion, React, Inter font |
| 2 | `node capture/capture.js` | Drives the real app with Playwright and saves 3840x2160 stills plus element boxes (`public/captures`) |
| 3 | `node scripts/prep.js` | Makes MARVIN voice lines (Kokoro via Hyperframes TTS, Windows SAPI as fallback), measures them, writes `src/timeline.json` |
| 4 | `node scripts/build.js` | Remotion PNG frames, FFmpeg audio mix, final MP4 in `out/` |

Studio preview: `npx remotion studio src/index.ts`.

Environment: `PLAYWRIGHT_PATH`, `PW_CHANNEL=chrome`, `PYTHON` (capture), `FFMPEG` and `FFPROBE` (if not on PATH), `CHROME` (Remotion browser), `HYPERFRAMES_PYTHON` (a venv with `kokoro-onnx` and `soundfile`).

Music is not in the repo (license terms must be checked before redistributing). Copy `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` from the `/brag` skill assets to `public/audio/music.mp3`.

Everything in the film is demo data and simulated responses. The film labels MARVIN's voice as Prototype Voice and the future features as concept previews.
