/* NEXEN Demo Build: every button works on sample data. Live backend endpoints are used when reachable. */
(function () {
  "use strict";
  const D = window.NEXEN_DATA, TOUR = window.NEXEN_TOUR;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const S = { live: false, xp: 0, leads: 0, clips: 0, installed: new Map(), industry: D.industries[0].id, picked: new Set(),
              voted: false, plan: "Pro", voice: false, rec: true, den: false, nextI: 0, swarmTab: "Startups", dungeonI: 0, swarmRuns: 0 };

  /* ---------- helpers ---------- */
  let toastT;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2600); }
  function speak(text) {
    if (!S.voice || !("speechSynthesis" in window)) return;
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 1.02; speechSynthesis.speak(u); } catch (e) { /* voice is optional */ }
  }
  async function api(path, body) {
    const opt = body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {};
    const r = await fetch(path, opt);
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || r.statusText);
    return j;
  }
  function addXp(n) {
    S.xp += n;
    const lvl = 1 + Math.floor(S.xp / 200);
    $("#lvl").textContent = lvl; $("#xpbar").style.width = (S.xp % 200) / 2 + "%";
    kpis();
  }
  function kpis() {
    $("#k-leads").textContent = S.leads; $("#k-clips").textContent = S.clips;
    $("#k-wf").textContent = S.installed.size; $("#k-xp").textContent = S.xp;
  }
  function modal(html) { const m = $("#modal"); $("#mbox").innerHTML = html; m.classList.add("on"); const c = $("#m-close"); if (c) c.focus(); }
  function closeModal() { $("#modal").classList.remove("on"); $("#mbox").innerHTML = ""; }
  $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal" || e.target.id === "m-close") closeModal(); });

  /* ---------- pager (side arrows, tab bar) ---------- */
  const track = $("#track");
  const narrow = () => window.matchMedia("(max-width:1099px)").matches;
  function curScreen() { return Math.round(track.scrollLeft / Math.max(1, track.clientWidth)); }
  function goTo(i) { i = Math.max(0, Math.min(2, i)); if (narrow()) track.scrollTo({ left: i * track.clientWidth }); }
  function syncPager() {
    const i = curScreen();
    $("#arr-l").disabled = i <= 0; $("#arr-r").disabled = i >= 2;
    $$("#tabbar button").forEach((b) => b.classList.toggle("on", +b.dataset.go === i));
  }
  $("#arr-l").addEventListener("click", () => goTo(curScreen() - 1));
  $("#arr-r").addEventListener("click", () => goTo(curScreen() + 1));
  $$("#tabbar button").forEach((b) => b.addEventListener("click", () => goTo(+b.dataset.go)));
  track.addEventListener("scroll", () => requestAnimationFrame(syncPager), { passive: true });
  window.addEventListener("resize", syncPager);

  /* ---------- screen 1: launch ---------- */
  function renderOnboarding() {
    $("#onb").innerHTML = D.videos.map((v, i) => `<div class="item"><div class="grow"><div class="t">${esc(v.t)}<span class="badge b-warn" id="onb-b${i}">${v.len}</span></div><div class="m">+${v.xp} XP</div></div><button class="btn sm" type="button" id="onb-play-${i}">▶ Play</button></div>`).join("");
    D.videos.forEach((v, i) => $("#onb-play-" + i).addEventListener("click", () => playVideo(i)));
    updOnb();
  }
  const watched = new Set();
  function updOnb() { $("#onb-sum").textContent = watched.size + "/" + D.videos.length + " watched"; }
  function playVideo(i) {
    const v = D.videos[i];
    modal(`<h2 style="margin:0;font-size:16px">${esc(v.t)}</h2><div id="vid">“${esc(v.say)}”</div><div class="bar"><i id="vbar"></i></div>
      <div class="row" style="margin-top:12px"><button class="btn ok" id="m-watched" type="button">Mark watched (+${v.xp} XP)</button><button class="btn" id="m-close" type="button">Close</button></div>
      <p class="note">Sample video card. In the full build this plays the recorded onboarding.</p>`);
    requestAnimationFrame(() => { const b = $("#vbar"); if (b) b.style.width = "100%"; $("#vbar").style.transition = "width 4s linear"; });
    speak(v.say);
    $("#m-watched").addEventListener("click", () => {
      if (!watched.has(i)) { watched.add(i); addXp(v.xp); $("#onb-b" + i).className = "badge b-ok"; $("#onb-b" + i).textContent = "watched"; updOnb(); }
      toast("Watched: " + v.t); closeModal();
    });
  }

  function renderIndustries() {
    $("#ind-chips").innerHTML = D.industries.map((x) => `<button type="button" class="chip" data-id="${x.id}">${x.icon} ${esc(x.name)}</button>`).join("");
    $$("#ind-chips .chip").forEach((b) => b.addEventListener("click", () => { S.industry = b.dataset.id; renderWorkflows(); }));
    renderWorkflows();
  }
  function renderWorkflows() {
    const ind = D.industries.find((x) => x.id === S.industry);
    $$("#ind-chips .chip").forEach((b) => b.classList.toggle("on", b.dataset.id === S.industry));
    $("#wf-sum").textContent = ind.name;
    $("#wf-list").innerHTML = ind.wf.map((w, i) => {
      const key = ind.id + ":" + i, on = S.installed.has(key);
      return `<div class="item wf"><div class="grow"><div class="t">${esc(w[0])}<span class="badge b-warn">${w[1]} nodes</span></div><div class="m">${esc(w[2])}</div></div><button class="btn sm ${on ? "ok" : ""}" type="button" data-key="${key}" data-i="${i}">${on ? "Installed ✓" : "Install"}</button></div>`;
    }).join("");
    $$("#wf-list .btn").forEach((b) => b.addEventListener("click", () => {
      const key = b.dataset.key, w = ind.wf[+b.dataset.i];
      if (S.installed.has(key)) { S.installed.delete(key); toast("Removed: " + w[0]); } else { S.installed.set(key, { name: w[0], nodes: w[1], ind: ind.id }); addXp(20); toast("Installed: " + w[0]); }
      renderWorkflows(); renderPicker(); kpis();
    }));
  }
  function renderPicker() {
    const sel = $("#wf-pick"), old = sel.value;
    sel.innerHTML = S.installed.size ? Array.from(S.installed, ([k, v]) => `<option value="${k}">${esc(v.name)}</option>`).join("") : `<option value="">No workflows installed yet</option>`;
    if (S.installed.has(old)) sel.value = old;
  }

  function renderCourses() {
    $("#courses").innerHTML = D.courses.map((c, i) => `<div class="item"><div class="grow"><div class="t">${esc(c.name)}<span class="badge b-warn">${c.tier}</span></div><div class="m">${c.lessons} lessons · ${esc(c.blurb)}</div></div><button class="btn sm" type="button" id="course-${i}" data-id="${c.id}"></button></div>`).join("");
    $$("#courses .btn").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.id;
      if (S.picked.has(id)) S.picked.delete(id); else if (S.picked.size < 2) { S.picked.add(id); addXp(15); }
      updCourses();
    }));
    updCourses();
  }
  function updCourses() {
    $("#course-sum").textContent = S.picked.size + "/2 picked";
    $$("#courses .btn").forEach((b) => {
      const on = S.picked.has(b.dataset.id), full = S.picked.size >= 2 && !on;
      b.textContent = on ? "Picked ✓" : full ? "Locked" : "Pick"; b.disabled = full; b.classList.toggle("ok", on);
    });
  }

  function renderVotes() {
    const total = D.votes.reduce((a, v) => a + v.n, 0);
    $("#votes").innerHTML = D.votes.map((v, i) => `<div class="item"><div class="grow"><div class="t">${esc(v.name)}</div><div class="bar"><i style="width:${Math.round(v.n / total * 100)}%"></i></div><div class="m">${v.n} votes (sample)</div></div><button class="btn sm" type="button" id="vote-${i}" ${S.voted ? "disabled" : ""}>Vote</button></div>`).join("");
    D.votes.forEach((v, i) => $("#vote-" + i).addEventListener("click", () => { if (S.voted) return; S.voted = true; v.n += 1; addXp(10); toast("Vote counted for " + v.name); renderVotes(); }));
  }

  function renderPlans() {
    $("#plan-tabs").innerHTML = Object.keys(D.plans).map((p) => `<button type="button" class="tab ${p === S.plan ? "on" : ""}" data-p="${p}">${p}</button>`).join("");
    $$("#plan-tabs .tab").forEach((b) => b.addEventListener("click", () => { S.plan = b.dataset.p; renderPlans(); }));
    $("#perks").innerHTML = D.plans[S.plan].map((x) => `<li>${esc(x)}</li>`).join("");
  }
  $("#subscribe").addEventListener("click", () => toast("Demo only: no payment taken. " + S.plan + " perks previewed."));

  function localRoi(name, earned, spent, rep, hours) {
    const profit = +(earned - spent).toFixed(2);
    const roi = spent === 0 ? (profit > 0 ? null : 0) : +(profit / spent * 100).toFixed(1);
    if (profit <= 0) return { name, profit, roi_pct: roi, score: 0, decision: "KILL", reason: "operating at a loss" };
    const score = +(profit * (rep / 10) / (hours > 0 ? hours : 0.1)).toFixed(2);
    const scale = roi === null || roi >= 20;
    return { name, profit, roi_pct: roi, score, decision: scale ? "SCALE" : "HOLD", reason: scale ? "profitable and repeatable" : "barely breaking even, send to backlog" };
  }
  $("#roi-run").addEventListener("click", async () => {
    const name = $("#roi-name").value.trim() || "Workflow", e = +$("#roi-earned").value, sp = +$("#roi-spent").value, rep = +$("#roi-rep").value, hrs = +$("#roi-hrs").value;
    if (!(e >= 0 && sp >= 0 && hrs >= 0 && rep >= 1 && rep <= 10)) { toast("Check inputs: repeatability 1 to 10, no negatives."); return; }
    let r, src = "browser";
    try { if (S.live) { r = await api("/api/roi", { name, earned: e, spent: sp, repeat: rep, hours: hrs }); src = "live backend"; } } catch (x) { r = null; }
    if (!r) r = localRoi(name, e, sp, rep, hrs);
    const cls = r.decision === "SCALE" ? "b-ok" : r.decision === "HOLD" ? "b-warn" : "b-bad";
    $("#roi-out").innerHTML = `<b>${esc(r.name)}</b><span class="badge ${cls}">${r.decision}</span><br>Profit $${r.profit} · ROI ${r.roi_pct === null ? "unbounded" : r.roi_pct + "%"} · Score ${r.score} · ${esc(r.reason)}`;
    $("#roi-src").textContent = src; addXp(10);
  });

  /* ---------- screen 2: MARVIN ---------- */
  function say(who, text) {
    const d = document.createElement("div"); d.className = "msg " + who; $("#log").appendChild(d);
    if (who === "me") { d.textContent = text; } else { let i = 0; const step = () => { d.textContent = text.slice(0, i += 3); $("#log").scrollTop = 1e6; if (i < text.length) setTimeout(step, 14); }; step(); speak(text); }
    $("#log").scrollTop = 1e6;
  }
  function ask(q) {
    say("me", q);
    const hit = D.chat.find((c) => c[0].test(q));
    say("bot", hit ? hit[1] : D.chatDefault);
  }
  $("#chatform").addEventListener("submit", (e) => { e.preventDefault(); const v = $("#chat-in").value.trim(); if (!v) return; $("#chat-in").value = ""; ask(v); });
  ["What's the money move today?", "What's blocking me?", "Find me a startup"].forEach((q) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "quick"; b.textContent = q; b.addEventListener("click", () => ask(q)); $("#quick").appendChild(b);
  });
  $("#voice").addEventListener("click", () => {
    if (!("speechSynthesis" in window)) { toast("This browser has no speech voice."); return; }
    S.voice = !S.voice; $("#voice").textContent = S.voice ? "🔊 Voice on" : "🔇 Voice off"; $("#voice").setAttribute("aria-pressed", S.voice);
    if (S.voice) speak("MARVIN voice on."); else speechSynthesis.cancel();
  });

  function renderNext() {
    const n = D.nextActions[S.nextI % D.nextActions.length]; $("#next-t").textContent = n.t; $("#next-w").textContent = n.why + " (+" + n.xp + " XP)";
  }
  $("#next-do").addEventListener("click", () => { const n = D.nextActions[S.nextI % D.nextActions.length]; addXp(n.xp); toast("Done: " + n.t); S.nextI++; renderNext(); });
  $("#next-skip").addEventListener("click", () => { S.nextI++; renderNext(); });

  function renderApprovals() {
    $("#appr").innerHTML = D.approvals.map((a, i) => `<div class="item" id="appr-${i}"><div class="grow"><div class="t">${esc(a.t)}</div><div class="m">${esc(a.why)}</div></div><span class="row"><button class="btn sm ok ok-btn ok" type="button" data-i="${i}">Approve</button><button class="btn sm no" type="button" data-i="${i}" data-no="1">Deny</button></span></div>`).join("");
    $$("#appr button").forEach((b) => b.addEventListener("click", () => {
      const i = +b.dataset.i, a = D.approvals[i], row = $("#appr-" + i), yes = !b.dataset.no;
      row.querySelector(".row").innerHTML = `<span class="badge ${yes ? "b-ok" : "b-bad"}">${yes ? "approved" : "denied"}</span>`;
      if (yes) { if (i === 0) S.clips += 3; if (i === 1) S.leads += 12; addXp(15); } kpis();
      toast((yes ? "Approved: " : "Denied: ") + a.t);
    }));
  }

  let feedI = 0, feedTimer;
  function feedTick() {
    const f = D.feed[feedI++ % D.feed.length], el = document.createElement("div");
    el.innerHTML = `<b>${esc(f[0])}</b> ${esc(f[1])}`; const box = $("#feed"); box.prepend(el);
    while (box.children.length > 6) box.lastChild.remove();
    if (/leads/.test(f[1])) S.leads += S.den ? 28 : 14; if (/clips/.test(f[1])) S.clips += S.den ? 12 : 6; kpis();
  }
  function startFeed() { clearInterval(feedTimer); if (S.rec) feedTimer = setInterval(feedTick, S.den ? 1100 : 2200); }
  $("#rec-toggle").addEventListener("click", () => {
    S.rec = !S.rec; $("#rec-dot").classList.toggle("off", !S.rec); $("#rec-txt").textContent = S.rec ? "Recording" : "Paused"; startFeed(); toast(S.rec ? "Agent recording on" : "Agent recording paused");
  });

  let running = false;
  $("#wf-run").addEventListener("click", () => {
    const key = $("#wf-pick").value, w = S.installed.get(key), t = $("#wf-term");
    if (!w) { toast("Install a workflow on screen 1 first."); return; }
    if (running) return; running = true; t.textContent = "";
    const steps = ["▶ trigger: manual run", "▸ fetch input (sample data)"]; for (let i = 2; i < Math.min(w.nodes, 7); i++) steps.push("▸ node " + i + " ok");
    steps.push("✔ done · " + (w.ind === "clip" ? "6 clips queued for approval" : w.ind === "lead" ? "14 leads scored" : w.ind === "re" ? "3 properties flagged" : "sample output ready"));
    let i = 0; const next = () => {
      t.textContent += steps[i++] + "\n"; t.scrollTop = 1e6;
      if (i < steps.length) setTimeout(next, 320);
      else { running = false; if (w.ind === "clip") S.clips += 6; if (w.ind === "lead") S.leads += 14; addXp(25); toast("Ran: " + w.name); }
    }; next();
  });

  const LOCAL_DOCS = [
    ["clipping-workflow", "Clip scoring ranks each moment by hook strength in the first three seconds, speaker energy, a clear payoff and caption readability. Clips under 60 are dropped."],
    ["lead-finder", "Describe your ideal buyer, the swarm scans public directories, scores fit and queues a draft email. A human approves every send."],
    ["approvals", "Anything that posts, sends or spends money waits in a queue. Approve or deny with one tap."],
    ["rpg-layer", "Tasks become monsters in dungeons. The last task is the boss. A critical strike unlocks a workflow. PVE only."],
    ["workflow-roi", "Scores money earned against money spent, repeatability and hours. Losing workflows are killed, thin ones held, strong ones scaled."],
    ["translation-engine", "Localizes a pitch or video script into many languages and keeps product names untouched."]
  ];
  function localSearch(q) {
    const w = q.toLowerCase().match(/[a-z0-9']{2,}/g) || [];
    return LOCAL_DOCS.map((d) => ({ skill: d[0], chunk: 0, snippet: d[1], score: w.reduce((a, t) => a + (d[1].toLowerCase().includes(t) || d[0].includes(t) ? 1 : 0), 0) }))
      .filter((h) => h.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
  }
  $("#brain-form").addEventListener("submit", async (e) => {
    e.preventDefault(); const q = $("#brain-q").value.trim(); if (!q) return;
    let hits, src = "browser sample";
    try { if (S.live) { const r = await api("/api/search?q=" + encodeURIComponent(q) + "&k=4"); hits = r.hits; src = "live · " + r.source; } } catch (x) { hits = null; }
    if (!hits) hits = localSearch(q);
    $("#brain-src").textContent = src;
    $("#brain-out").innerHTML = hits.length ? hits.map((h) => `<div class="item"><div class="grow"><div class="t">${esc(h.skill)}<span class="badge b-ok">${h.score}</span></div><div class="m">${esc(h.snippet)}</div></div></div>`).join("") : `<div class="note">No match. Try: clips, leads, approvals, ROI.</div>`;
    addXp(5);
  });

  /* ---------- screen 3: grow ---------- */
  function renderDungeon() {
    const d = D.dungeon, inTasks = S.dungeonI < d.tasks.length;
    $("#mon-e").textContent = inTasks ? ["📨", "🎞️", "🧩", "📊"][S.dungeonI % 4] : "🐉";
    $("#mon-n").textContent = inTasks ? d.tasks[S.dungeonI] : d.boss;
    $("#mon-s").textContent = inTasks ? d.name + " · task " + (S.dungeonI + 1) + " of " + d.tasks.length : d.name + " · boss HP " + Math.max(0, S.bossHp) + "/" + d.bossHp;
    $("#hpbar").style.width = inTasks ? "100%" : Math.max(0, S.bossHp) + "%";
    $("#atk").disabled = !inTasks && S.bossHp <= 0;
  }
  function floatDmg(n) { const e = document.createElement("div"); e.className = "dmg"; e.textContent = "-" + n; $("#mon").appendChild(e); setTimeout(() => e.remove(), 950); $("#mon").classList.add("hit"); setTimeout(() => $("#mon").classList.remove("hit"), 150); }
  $("#atk").addEventListener("click", () => {
    const d = D.dungeon;
    if (S.dungeonI < d.tasks.length) { floatDmg(10 + S.dungeonI * 3); toast("Task cleared: " + d.tasks[S.dungeonI]); addXp(20); S.dungeonI++; if (S.dungeonI === d.tasks.length) S.bossHp = d.bossHp; renderDungeon(); return; }
    const dmg = 34; S.bossHp -= dmg; floatDmg(dmg);
    if (S.bossHp <= 0) {
      const c = $("#crit"); c.style.display = "flex"; c.style.animation = "none"; void c.offsetWidth; c.style.animation = "";
      setTimeout(() => { c.style.display = "none"; }, 1450);
      addXp(150); speak(D.marvinLines.crit); toast("Boss down. Workflow unlocked: Offer Letter Drafter"); say("bot", D.marvinLines.crit);
    } else addXp(10);
    renderDungeon();
  });
  $("#dng").addEventListener("click", () => { S.dungeonI = 0; S.bossHp = D.dungeon.bossHp; renderDungeon(); toast("New dungeon: " + D.dungeon.name); });

  function drawQr() {
    const c = $("#qr"), x = c.getContext("2d"), n = 33; x.fillStyle = "#fff"; x.fillRect(0, 0, n, n); x.fillStyle = "#000";
    let s = (Date.now() % 100000) | 1; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (rnd() > 0.52) x.fillRect(i, j, 1, 1);
    [[0, 0], [n - 7, 0], [0, n - 7]].forEach(([a, b]) => { x.fillStyle = "#fff"; x.fillRect(a - 1, b - 1, 9, 9); x.fillStyle = "#000"; x.fillRect(a, b, 7, 7); x.fillStyle = "#fff"; x.fillRect(a + 1, b + 1, 5, 5); x.fillStyle = "#000"; x.fillRect(a + 2, b + 2, 3, 3); });
  }
  $("#qr-gen").addEventListener("click", () => { drawQr(); toast("Demo QR pattern. Not a real login code."); });
  $("#shot").addEventListener("change", (e) => { const f = e.target.files[0]; if (!f) return; $("#shot-n").textContent = "Selected " + f.name + ". Balance shown is sample data, nothing was uploaded."; $("#bal").textContent = "$1,250.00"; toast("Balance screenshot attached (demo only)"); });

  function renderSwarm() {
    $("#swarm-tabs").innerHTML = Object.keys(D.swarm).map((k) => `<button type="button" class="tab ${k === S.swarmTab ? "on" : ""}" data-k="${esc(k)}">${esc(k)}</button>`).join("");
    $$("#swarm-tabs .tab").forEach((b) => b.addEventListener("click", () => { S.swarmTab = b.dataset.k; renderSwarm(); }));
    const t = D.swarm[S.swarmTab], num = (v) => typeof v === "number";
    $("#swarm-tbl").innerHTML = `<table><tr>${t.cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr>${t.rows.map((r) => `<tr>${r.map((v) => `<td class="${num(v) ? "fit" : ""}">${esc(v)}</td>`).join("")}</tr>`).join("")}</table>`;
    $("#swarm-sum").textContent = t.rows.length + " found" + (S.swarmRuns ? " · run " + S.swarmRuns : "");
  }
  $("#swarm-run").addEventListener("click", () => {
    const b = $("#swarm-run"); b.disabled = true; b.textContent = "Scouting…";
    setTimeout(() => {
      S.swarmRuns++; const t = D.swarm[S.swarmTab];
      t.rows = t.rows.map((r) => r.map((v) => (typeof v === "number" ? Math.max(50, Math.min(99, v + Math.round(Math.random() * 6 - 2))) : v)));
      t.rows.sort((a, c) => (c.find((v) => typeof v === "number") || 0) - (a.find((v) => typeof v === "number") || 0));
      if (S.swarmTab === "Leads") S.leads += S.den ? 16 : 8; addXp(10); renderSwarm(); kpis();
      b.disabled = false; b.textContent = "Run swarm"; toast("Swarm finished: " + S.swarmTab + (S.den ? " (Denizen x2)" : ""));
    }, 900);
  });

  function renderLang() { $("#tr-lang").innerHTML = Object.entries(D.languages).map(([k, v]) => `<option value="${k}">${esc(v[0])}</option>`).join(""); $("#tr-out").textContent = D.pitch; }
  $("#tr-go").addEventListener("click", () => { const l = D.languages[$("#tr-lang").value]; const o = $("#tr-out"); o.textContent = l[1]; o.dir = l[2] || "ltr"; addXp(5); toast("Translated to " + l[0]); });

  function drawAb(progress) {
    const c = $("#ab"), x = c.getContext("2d"), W = c.width, H = c.height, p = 24; x.clearRect(0, 0, W, H);
    x.strokeStyle = "rgba(255,255,255,.12)"; x.fillStyle = "rgba(255,255,255,.5)"; x.font = "14px sans-serif";
    for (let g = 0; g <= 4; g++) { const y = p + (H - 2 * p) * g / 4; x.beginPath(); x.moveTo(p, y); x.lineTo(W - p, y); x.stroke(); x.fillText(100 - g * 25 + "%", 0, y + 4); }
    const line = (arr, col) => { x.strokeStyle = col; x.lineWidth = 3; x.beginPath(); const m = Math.max(1, Math.floor((arr.length - 1) * progress)); for (let i = 0; i <= m; i++) { const px = p + 12 + (W - 2 * p - 12) * i / (arr.length - 1), py = p + (H - 2 * p) * (1 - arr[i] / 100); if (i) x.lineTo(px, py); else x.moveTo(px, py); } x.stroke(); };
    line(D.retention.theirs, "#8f7a7c"); line(D.retention.ours, "#ff3b43");
  }
  $("#ab-run").addEventListener("click", () => {
    const b = $("#ab-run"); b.disabled = true; let t0 = null;
    const frame = (ts) => { t0 = t0 || ts; const pr = Math.min(1, (ts - t0) / 1200); drawAb(pr); if (pr < 1) requestAnimationFrame(frame); else {
      const o = D.retention.ours[9], th = D.retention.theirs[9]; $("#ab-out").textContent = "Ours holds " + o + "% at the end vs " + th + "%: +" + (o - th) + " points (sample)."; b.disabled = false; addXp(10); toast("A/B finished: ours wins"); } };
    requestAnimationFrame(frame);
  });

  function renderRoad() { $("#road").innerHTML = D.roadmap.map((r) => `<div class="item"><div class="grow"><div class="t">${r.v} · ${esc(r.t)}<span class="badge ${r.s === "shipped" ? "b-ok" : r.s === "demo" ? "b-warn" : "b-bad"}">${esc(r.s)}</span></div><div class="m">${esc(r.d)}</div></div></div>`).join(""); }
  $("#vr-open").addEventListener("click", () => {
    modal(`<h2 style="margin:0;font-size:16px">VR home preview (planned 2027)</h2><div id="room"><div id="cube"><div class="f"></div><div class="b"></div><div class="l"></div><div class="r"></div><div class="fl"></div>
      <span class="goal" style="margin-left:-60px;margin-top:-50px">Goal: 10 leads</span><span class="goal" style="margin-left:10px;margin-top:-10px;animation-delay:.8s">Boss: first client</span><span class="goal" style="margin-left:-40px;margin-top:30px;animation-delay:1.6s">Quest: install a workflow</span></div></div>
      <p class="note">Concept preview. Your goals float in the room and the house layout becomes your in-game interior.</p><button class="btn" id="m-close" type="button">Close</button>`);
  });

  $("#den").addEventListener("click", () => {
    S.den = !S.den; $("#den").textContent = "Denizen: " + (S.den ? "ON" : "off"); $("#den").setAttribute("aria-pressed", S.den); $("#den").classList.toggle("solid", S.den);
    $("#den-n").textContent = S.den ? "Agent counts and feed speed doubled." : "Doubles agent counts and feed speed."; startFeed(); toast(S.den ? "Denizen on: swarm at full power" : "Denizen off");
  });

  /* ---------- MARVIN core orb ---------- */
  (function orb() {
    const c = $("#orb"), x = c.getContext("2d"); let W, H, t = 0;
    const pts = Array.from({ length: 90 }, (_, i) => ({ a: i / 90 * Math.PI * 2, r: 70 + (i % 3) * 14, s: 0.2 + (i % 5) * 0.06 }));
    function fit() { const r = c.getBoundingClientRect(); W = c.width = Math.max(1, r.width * devicePixelRatio); H = c.height = Math.max(1, r.height * devicePixelRatio); }
    function draw() {
      if (document.hidden) { requestAnimationFrame(draw); return; }
      x.clearRect(0, 0, W, H); t += 0.01; const k = devicePixelRatio;
      pts.forEach((p) => { const a = p.a + t * p.s, rr = p.r * k * (1 + 0.05 * Math.sin(t * 3 + p.a * 4)); x.fillStyle = "rgba(255,80,88," + (0.35 + 0.5 * Math.abs(Math.sin(a * 2))) + ")"; x.beginPath(); x.arc(W / 2 + Math.cos(a) * rr * 1.5, H / 2 + Math.sin(a) * rr * 0.85, 2 * k, 0, 7); x.fill(); });
      if (!matchMedia("(prefers-reduced-motion:reduce)").matches) requestAnimationFrame(draw);
    }
    fit(); window.addEventListener("resize", fit); draw();
  })();

  /* ---------- highlight all + guided tour ---------- */
  $("#hl-btn").addEventListener("click", () => { document.body.classList.toggle("hl"); toast(document.body.classList.contains("hl") ? "Every button is outlined and numbered" : "Highlights off"); });
  let ti = -1;
  const spot = $("#spot"), tip = $("#tip");
  function place(el) {
    const r = el.getBoundingClientRect(), pad = 6;
    Object.assign(spot.style, { display: "block", left: r.left - pad + "px", top: r.top - pad + "px", width: r.width + pad * 2 + "px", height: r.height + pad * 2 + "px" });
    tip.style.display = "block"; const th = tip.offsetHeight, tw = tip.offsetWidth;
    let top = r.bottom + 14; if (top + th > innerHeight - 8) top = Math.max(8, r.top - th - 14);
    let left = Math.min(Math.max(8, r.left + r.width / 2 - tw / 2), innerWidth - tw - 8);
    tip.style.top = top + "px"; tip.style.left = left + "px";
  }
  function showStep(i) {
    if (i < 0) i = 0; if (i >= TOUR.length) { endTour(); return; }
    ti = i; const s = TOUR[i];
    $("#tip-n").textContent = "Step " + (i + 1) + " of " + TOUR.length + " · " + (s.screen == null ? "header" : "screen " + (s.screen + 1));
    $("#tip-h").textContent = s.name; $("#tip-p").textContent = s.does; $("#tip-n2").textContent = i === TOUR.length - 1 ? "Finish" : "Next";
    if (s.screen != null) goTo(s.screen);
    setTimeout(() => {
      const el = $(s.sel) || (s.alt && $(s.alt)); if (!el) { showStep(i + 1); return; }
      if (s.sel.indexOf("#arr") !== 0 && s.sel.indexOf("-btn") < 0) el.scrollIntoView({ block: "center", inline: "center", behavior: "auto" });
      setTimeout(() => place(el), 60);
    }, narrow() ? 380 : 40);
  }
  function endTour() { ti = -1; spot.style.display = "none"; tip.style.display = "none"; }
  window.startTour = () => showStep(0);
  $("#tour-btn").addEventListener("click", () => showStep(0));
  $("#tip-n2").addEventListener("click", () => showStep(ti + 1));
  $("#tip-b").addEventListener("click", () => showStep(ti - 1));
  $("#tip-x").addEventListener("click", endTour);
  window.addEventListener("resize", () => { if (ti >= 0) showStep(ti); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (ti >= 0) endTour(); closeModal(); }
    if (ti >= 0 && e.key === "ArrowRight") showStep(ti + 1);
    if (ti >= 0 && e.key === "ArrowLeft") showStep(ti - 1);
  });

  /* ---------- boot ---------- */
  S.bossHp = D.dungeon.bossHp;
  renderOnboarding(); renderIndustries(); renderPicker(); renderCourses(); renderVotes(); renderPlans(); renderNext(); renderApprovals();
  renderDungeon(); renderSwarm(); renderLang(); renderRoad(); drawAb(0); drawQr(); kpis(); syncPager();
  say("bot", "MARVIN online. This is the NEXEN demo: every button works on sample data. Press ▶ Tutorial for a guided tour.");
  feedTick(); startFeed();
  setInterval(() => { $("#clock").textContent = new Date().toLocaleTimeString(); }, 1000); $("#clock").textContent = new Date().toLocaleTimeString();
  if (/^https?:/.test(location.protocol)) {
    const ctl = new AbortController(); setTimeout(() => ctl.abort(), 1200);
    fetch("/api/health", { signal: ctl.signal }).then((r) => (r.ok ? r.json() : Promise.reject())).then((h) => {
      if (!h || !h.ok) return; S.live = true; const m = $("#mode"); m.textContent = "LIVE BACKEND"; m.classList.add("live"); $("#brain-src").textContent = h.vectors + " chunks · " + h.vector_source;
    }).catch(() => { /* static hosting: stay on sample data */ });
  }
})();
