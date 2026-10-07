# NEXEN ENTERPRISE teaser (Remotion)

A 85 second product film built from real Playwright captures of the frontend. Remotion renders the frames, FFmpeg mixes the audio and encodes the MP4.

| Step | Command | What it does |
|---|---|---|
| 1 | `npm install` | Remotion, React, Inter font |
| 2 | `node capture/capture.js` | Drives the real app with Playwright and saves 3840x2160 stills plus element boxes (`public/captures`) |
| 3 | `node scripts/prep.js` | Makes MARVIN voice lines (Kokoro via Hyperframes TTS, Windows SAPI as fallback), measures them, writes `src/timeline.json` |
| 4 | `node scripts/build.js` | Remotion PNG frames in ignored `out/`, FFmpeg audio mix, final MP4 in `../docs/video/NEXEN-ENTERPRISE-teaser.mp4` |

Studio preview: `npx remotion studio src/index.ts`.

Environment: `PLAYWRIGHT_PATH`, `PW_CHANNEL=chrome`, `PYTHON` (capture), `FFMPEG` and `FFPROBE` (if not on PATH), `CHROME` (Remotion browser), `HYPERFRAMES_PYTHON` (a venv with `kokoro-onnx` and `soundfile`).

The committed/public-safe render uses generated MARVIN voice only. Third-party music and SFX are intentionally not committed. To use music after confirming its license, set `NEXEN_TEASER_MUSIC` to an absolute licensed audio path. Set `NEXEN_TEASER_SFX=1` only when the local SFX are cleared for the intended distribution.

Everything in the film is demo data and simulated responses. The film labels MARVIN's voice as Prototype Voice and the future features as concept previews.
