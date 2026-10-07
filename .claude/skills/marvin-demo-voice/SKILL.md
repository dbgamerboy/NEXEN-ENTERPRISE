---
name: marvin-demo-voice
description: MARVIN drawer behavior: simulated mic, waveform, scripted answers, browser speech playback.
---

Code: Voice object and ask/mic handlers in frontend/v2/app.js. Answers live in each industry's `marvin` map and `chips` list. Mic inserts the first suggestion after 1.9 seconds.
Voice uses window.speechSynthesis when present, otherwise shows a toast. Keep it replaceable: only Voice.speak and Voice.stop touch the speech API.
