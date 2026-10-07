/* NEXEN workspace demo. One shell, three mock workspaces. Demo data and simulated responses only. */
(function () {
  "use strict";
  const D = window.NX;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const S = { ind: null, view: "home", cat: "All", q: "", done: {}, chats: {}, speaking: false, listening: false };
  window.__speakCount = 0; window.__lastSpoken = "";

  const VIEWS = [["home", "Home", "🏠"], ["workspace", "Workspace", "🧭"], ["files", "Files", "📁"], ["tasks", "Tasks", "✅"], ["automation", "Automation", "🔀"], ["workers", "Workers", "🤖"], ["activity", "Activity", "🕒"], ["analytics", "Analytics", "📊"]];
  const cur = () => D.industries[S.ind];
  const ext = (n) => n.split(".").pop().toLowerCase();
  const stClass = (s) => s.split(" ")[0];

  let toastT;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2600); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- router ---------- */
  function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }
  function route() {
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    const ind = parts[0], view = parts[1] || "home";
    if (!ind || !D.industries[ind]) { showLanding(); return; }
    enter(ind, VIEWS.some((v) => v[0] === view) ? view : "home");
  }
  window.addEventListener("hashchange", route);

  /* ---------- landing ---------- */
  function previewSvg(ind) {
    const c = ind.tint;
    return `<svg viewBox="0 0 300 110" aria-hidden="true"><rect width="300" height="110" fill="#0d0f14"/><rect x="10" y="10" width="46" height="90" rx="6" fill="#12151c" stroke="#232836"/>
      ${[0, 1, 2, 3].map((i) => `<rect x="62" y="${10 + i * 0}" width="0" height="0"/>`).join("")}
      ${[0, 1, 2, 3].map((i) => `<rect x="${64 + i * 58}" y="12" width="52" height="26" rx="6" fill="#171b24" stroke="#232836"/><rect x="70" y="0" width="0" height="0"/><rect x="${70 + i * 58}" y="20" width="26" height="6" rx="3" fill="${i === 0 ? c : "#3a4157"}"/>`).join("")}
      <rect x="64" y="46" width="130" height="54" rx="6" fill="#171b24" stroke="#232836"/>${[0, 1, 2].map((i) => `<rect x="72" y="${54 + i * 15}" width="${100 - i * 18}" height="7" rx="3" fill="${i === 0 ? c : "#3a4157"}" opacity="${i === 0 ? 1 : .8}"/>`).join("")}
      <rect x="200" y="46" width="90" height="54" rx="6" fill="#241012" stroke="${c}" opacity=".9"/><circle cx="222" cy="66" r="9" fill="${c}"/><rect x="238" y="60" width="44" height="6" rx="3" fill="#aab2c3"/><rect x="238" y="72" width="34" height="6" rx="3" fill="#5b6479"/></svg>`;
  }
  function renderLanding() {
    $("#cards").innerHTML = D.order.map((id) => { const d = D.industries[id];
      return `<article class="icard" style="--c:${d.tint}"><div class="top"><span class="ico">${d.icon}</span><h2>${esc(d.name.toUpperCase())}</h2></div><p>${esc(d.blurb)}</p>${previewSvg(d)}<button class="enter" type="button" data-ind="${id}" id="enter-${id}">ENTER WORKSPACE</button></article>`; }).join("");
    $$("#cards .enter").forEach((b) => b.addEventListener("click", () => go("#/" + b.dataset.ind)));
  }
  function showLanding() {
    closeDrawer(); endTour(false); closeModal();
    $("#landing").classList.remove("hide"); $("#app").classList.add("hide"); $("#marvin-fab").classList.add("hide");
    document.title = "NEXEN Enterprise V1"; S.ind = null;
  }
  $("#land-tour").addEventListener("click", () => { store("nexen_demo_tour_done", ""); go("#/construction"); });
  $("#home-logo").addEventListener("click", () => go("#/"));

  /* ---------- shell ---------- */
  function enter(ind, view) {
    const first = S.ind === null;
    S.ind = ind; S.view = view;
    const d = cur();
    $("#landing").classList.add("hide"); $("#app").classList.remove("hide"); $("#marvin-fab").classList.remove("hide");
    document.documentElement.style.setProperty("--tint", d.tint);
    document.title = "NEXEN Enterprise V1 · " + d.workspace;
    $("#ws-name").textContent = d.workspace; $("#ws-sub").textContent = d.name + " workspace · Demo Data";
    $("#av").textContent = d.user.initials; $("#u-name").textContent = d.user.name; $("#u-role").textContent = d.user.role;
    const segHtml = D.order.map((id) => `<button type="button" data-ind="${id}" class="${id === ind ? "on" : ""}">${D.industries[id].icon} ${esc(D.industries[id].name)}</button>`).join("");
    $("#seg").innerHTML = segHtml;
    renderNav(); renderPage(); renderSuggestions(); renderConvo();
    $("#side").classList.remove("on"); $("#main").scrollTop = 0;
    if (first && store("nexen_demo_tour_done") !== "1") setTimeout(() => startTour(), 500);
  }
  $("#seg").addEventListener("click", (e) => { const b = e.target.closest("button[data-ind]"); if (b) { S.q = ""; $("#search").value = ""; S.cat = "All"; go("#/" + b.dataset.ind + "/" + S.view); toast("Switched to " + D.industries[b.dataset.ind].name); } });
  function renderNav() {
    const open = cur().tasks.filter((t, i) => !(S.done[S.ind] || {})[i]).length;
    $("#nav").innerHTML = `<div class="seg" style="margin-bottom:8px">${D.order.map((id) => `<button type="button" data-ind="${id}" class="${id === S.ind ? "on" : ""}" title="${esc(D.industries[id].name)}">${D.industries[id].icon}</button>`).join("")}</div>` +
      VIEWS.map((v) => `<button class="nav ${S.view === v[0] ? "on" : ""}" type="button" data-view="${v[0]}" id="nav-${v[0]}"><span class="i">${v[2]}</span>${v[1]}${v[0] === "tasks" && open ? `<span class="cnt">${open}</span>` : ""}</button>`).join("");
    $$("#nav .nav").forEach((b) => b.addEventListener("click", () => go("#/" + S.ind + "/" + b.dataset.view)));
    $$("#nav .seg button").forEach((b) => b.addEventListener("click", () => go("#/" + b.dataset.ind + "/" + S.view)));
  }
  $("#ham").addEventListener("click", () => $("#side").classList.toggle("on"));
  $("#nav-marvin").addEventListener("click", () => openDrawer());
  $("#bell").addEventListener("click", () => {
    const d = cur();
    openModal(`<div class="m-h"><div style="flex:1"><b>Notifications</b><small>${esc(d.workspace)} · Demo Data</small></div><button class="btn sm" data-close type="button">Close</button></div><div style="padding:18px 22px">${d.priority.map((p, i) => `<button class="pri" type="button" data-file="${p[3]}"><span class="sev ${p[0]}">${p[0]}</span><span style="flex:1"><span class="t">${esc(p[1])}</span><br><span class="m">${esc(p[2])}</span></span></button>`).join("")}</div>`);
    $$("#mbox [data-file]").forEach((b, k) => b.addEventListener("click", () => { const p = d.priority[k]; if (p && p[4]) openMeeting("brief"); else openFile(+b.dataset.file); }));
  });
  function settingsModal() {
    openModal(`<div class="m-h"><div style="flex:1"><b>Settings</b><small>Demo controls</small></div><button class="btn sm" data-close type="button">Close</button></div>
      <div style="padding:20px 22px;display:flex;flex-direction:column;gap:12px"><div><button class="btn primary" id="set-tour" type="button">Restart tutorial</button></div><div><button class="btn" id="set-home" type="button">Back to industry selection</button></div>
      <p class="note" style="color:var(--muted)">All data is demo data. MARVIN answers are simulated. Voice playback uses your browser's speech engine.</p></div>`);
    $("#set-tour").addEventListener("click", () => { closeModal(); startTour(); });
    $("#set-home").addEventListener("click", () => { closeModal(); go("#/"); });
  }
  $("#nav-settings").addEventListener("click", settingsModal);
  $("#user").addEventListener("click", settingsModal);
  $("#search").addEventListener("input", (e) => { S.q = e.target.value; if (S.view !== "files") { S.view = "files"; location.hash = "#/" + S.ind + "/files"; } else renderPage(); });

  /* ---------- pages ---------- */
  function secKpis(d) { return `<div class="kpis">${d.kpis.map((k) => `<div class="kpi"><b>${esc(k[0])}</b><span>${esc(k[1])}</span><small>${esc(k[2])} · demo</small></div>`).join("")}</div>`; }
  function secPriority(d, title) {
    return `<section class="sec" id="sec-priority"><div class="sec-h"><h2>${title || "Priority items"}</h2><small>${d.priority.length} need a look</small></div>${d.priority.map((p, i) => `<button class="pri" type="button" id="pri-${i}" data-file="${p[3]}" ${p[4] ? 'data-meeting="1"' : ""}><span class="sev ${p[0]}">${p[0]}</span><span style="flex:1;min-width:0"><span class="t">${esc(p[1])}</span><br><span class="m">${esc(p[2])}</span></span><span class="link">Open ›</span></button>`).join("")}</section>`;
  }
  function secRec(d) {
    return `<section class="rec" id="sec-rec"><div class="head"><span class="orb"></span><div><div class="who">MARVIN RECOMMENDS</div><small style="color:var(--muted)">Simulated response</small></div></div><h3>${esc(d.recommend.title)}</h3><p>${esc(d.recommend.text)}</p><ul class="then">${d.tasks.slice(1, 3).map((t) => `<li><b>THEN</b>${esc(t[0])}</li>`).join("")}</ul><div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary sm" type="button" data-file="${d.recommend.file}" id="rec-open">Open ${esc(d.files[d.recommend.file].name.replace(/_/g, " ").replace(/\.\w+$/, ""))}</button><button class="btn sm" type="button" id="rec-ask">Ask MARVIN</button></div></section>`;
  }
  function fileRows(d, list) {
    if (!list.length) return `<p class="note" style="color:var(--muted);padding:10px">No files match your search.</p>`;
    return `<div class="files"><div class="frow head"><span>Name</span><span class="c-owner">Owner</span><span class="c-mod">Modified</span><span class="c-size">Size</span><span>Status</span></div>${list.map(([f, i]) => `<button class="frow" type="button" id="file-${i}" data-file="${i}"><span class="fname"><span class="ftype ${ext(f.name)}">${ext(f.name).toUpperCase()}</span><span style="min-width:0"><b>${esc(f.name)}</b><small>${esc(f.cat)}</small></span></span><span class="fmeta c-owner">${esc(f.owner)}</span><span class="fmeta c-mod">${esc(f.mod)}</span><span class="fmeta c-size">${esc(f.size)}</span><span class="st ${stClass(f.status)}">${esc(f.status)}</span></button>`).join("")}</div>`;
  }
  function filtered(d) {
    return d.files.map((f, i) => [f, i]).filter(([f]) => (S.cat === "All" || f.cat === S.cat) && (!S.q || (f.name + f.cat + f.owner + f.status).toLowerCase().includes(S.q.toLowerCase())));
  }
  function secFiles(d, full) {
    const list = full ? filtered(d) : d.files.slice(0, 5).map((f, i) => [f, i]);
    const cats = ["All"].concat(Array.from(new Set(d.files.map((f) => f.cat))));
    return `<section class="sec" id="sec-files"><div class="sec-h"><h2>${full ? "All files" : "Recent files"}</h2><small>${d.files.length} files · demo data</small><span class="sp"></span>${full ? "" : `<button class="link" type="button" data-view="files">View all ›</button>`}</div>${full ? `<div class="fl">${cats.map((c) => `<button class="chipf ${S.cat === c ? "on" : ""}" type="button" data-cat="${esc(c)}">${esc(c)}</button>`).join("")}</div>` : ""}${fileRows(d, list)}</section>`;
  }
  function secActivity(d, limit) {
    return `<section class="sec" id="sec-activity"><div class="sec-h"><h2>Recent activity</h2><small>Simulated</small><span class="sp"></span>${limit ? `<button class="link" type="button" data-view="activity">View all ›</button>` : ""}</div><ul class="tl">${d.activity.slice(0, limit || 99).map((a) => `<li><i></i><span>${esc(a[0])}</span><small>${esc(a[1])}</small></li>`).join("")}</ul></section>`;
  }
  function secWorkers(d, withFlows, only) {
    const w = `<div class="wgrid">${d.workers.map((w, i) => `<div class="worker" id="worker-${i}"><span class="sim">SIMULATED</span><b>${esc(w[0])}</b><p>${esc(w[1])}</p><span class="wst ${w[2]}"><i></i>${esc(w[2])}</span></div>`).join("")}</div>`;
    const f = withFlows ? `<div style="margin-top:18px"><div class="sec-h"><h2 style="font-size:14px">Active workflows</h2></div>${d.flows.map((x) => `<div class="flow"><b>${esc(x[0])}</b> <span class="note" style="color:var(--muted)">· ${esc(x[1])}</span><div class="bar"><i style="width:${x[2]}%"></i></div></div>`).join("")}</div>` : "";
    return `<section class="sec" id="sec-workers"><div class="sec-h"><h2>${only === "automation" ? "Automation" : "Workers + automation"}</h2><small>Specialized workers, activity always visible</small></div>${only === "automation" ? "" : w}${f}</section>`;
  }
  function art(v, big) {
    const hue = ["#6aa8ff", "#ff6b71", "#3ddc97"][v], h = big ? 300 : 170;
    return `<svg viewBox="0 0 400 ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Concept visualization"><defs><linearGradient id="g${v}${big ? "b" : ""}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0d18"/><stop offset="1" stop-color="#1a1426"/></linearGradient><radialGradient id="o${v}${big ? "b" : ""}"><stop offset="0" stop-color="${hue}" stop-opacity=".9"/><stop offset="1" stop-color="${hue}" stop-opacity="0"/></radialGradient></defs>
      <rect width="400" height="${h}" fill="url(#g${v}${big ? "b" : ""})"/><ellipse cx="200" cy="${h * .5}" rx="150" ry="70" fill="url(#o${v}${big ? "b" : ""})" opacity=".35"/>
      ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<line x1="${200 + (i - 3) * 20}" y1="${h * .62}" x2="${200 + (i - 3) * 90}" y2="${h}" stroke="${hue}" stroke-opacity=".35"/>`).join("")}${[0, 1, 2, 3].map((i) => `<line x1="0" y1="${h * (.68 + i * .1)}" x2="400" y2="${h * (.68 + i * .1)}" stroke="${hue}" stroke-opacity=".25"/>`).join("")}
      ${v === 0 ? `<rect x="60" y="${h * .2}" width="90" height="${h * .3}" rx="6" fill="#ffffff" fill-opacity=".08" stroke="${hue}" transform="skewY(-6)"/><rect x="250" y="${h * .18}" width="90" height="${h * .34}" rx="6" fill="#ffffff" fill-opacity=".08" stroke="${hue}" transform="skewY(6)"/><rect x="155" y="${h * .12}" width="90" height="${h * .4}" rx="6" fill="#ffffff" fill-opacity=".12" stroke="${hue}"/>` : v === 1 ? `<circle cx="200" cy="${h * .42}" r="${h * .2}" fill="url(#o${v}${big ? "b" : ""})"/><circle cx="200" cy="${h * .42}" r="${h * .13}" fill="none" stroke="${hue}" stroke-width="2"/><rect x="40" y="${h * .25}" width="80" height="${h * .22}" rx="6" fill="#fff" fill-opacity=".07" stroke="${hue}"/><rect x="280" y="${h * .25}" width="80" height="${h * .22}" rx="6" fill="#fff" fill-opacity=".07" stroke="${hue}"/>` : [0, 1, 2, 3, 4].map((i) => `<circle cx="${70 + i * 65}" cy="${h * (.3 + (i % 2) * .15)}" r="14" fill="${hue}" fill-opacity=".5" stroke="${hue}"/><line x1="${70 + i * 65}" y1="${h * (.3 + (i % 2) * .15)}" x2="${70 + (i + 1) * 65}" y2="${h * (.3 + ((i + 1) % 2) * .15)}" stroke="${hue}" stroke-opacity=".6"/>`).join("")}
      <g fill="#fff" fill-opacity=".14" font-family="ui-monospace,monospace" font-weight="800" font-size="13" letter-spacing="3">${[0, 1, 2].map((r) => `<text x="${-40 + r * 30}" y="${h * (.3 + r * .28)}" transform="rotate(-18 200 ${h / 2})">CONCEPT · FUTURE DEVELOPMENT · CONCEPT · FUTURE DEVELOPMENT</text>`).join("")}</g></svg>`;
  }
  function secFuture() {
    return `<section class="future" id="sec-future"><h2>FUTURE DEVELOPMENT</h2><p class="sub">Concept previews of where NEXEN could go. None of this works today.</p><div class="fgrid">${D.future.map((f, i) => `<button class="fcard" type="button" id="future-${i}" data-future="${i}">${art(f.v)}<span class="cap"><span class="fbadge">${esc(f.badge)}</span><b>${esc(f.t)}</b><p>${esc(f.d)}</p></span></button>`).join("")}</div><p class="disc">Concept visualization. Not representative of currently shipped functionality.</p></section>`;
  }
  function secMeeting(d) {
    const m = d.meeting; if (!m) return "";
    return `<section class="sec" id="sec-meeting"><div class="sec-h"><h2>Next meeting</h2><small>${esc(m.when)} · Demo Data</small></div><div class="mt-row"><div><b style="font-size:17px">${esc(m.title)}</b><div class="note" style="color:var(--soft)">${esc(m.starts)} · ${esc(m.room)}</div><div class="avs">${m.attendees.map((a) => `<span class="av sm" title="${esc(a[0])}, ${esc(a[1])}">${esc(a[0].split(" ").map((w) => w[0]).join(""))}</span>`).join("")}</div></div><div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="meet-brief" type="button">Open briefing</button><button class="btn primary" id="meet-now" type="button">▶ Start meeting now</button></div></div></section>`;
  }
  function greet(d) {
    return `<div class="greet"><div><h1>Good morning, ${esc(d.user.name.split(" ")[0])}</h1><p>${esc(d.summaryLine)}</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="g-tour" type="button">Restart tutorial</button><button class="btn primary" id="g-marvin" type="button">🎙️ Ask MARVIN</button></div></div>`;
  }
  function renderPage() {
    const d = cur(), v = S.view; let h = "";
    if (v === "home") h = greet(d) + `<div id="dash" style="display:flex;flex-direction:column;gap:22px">${secKpis(d)}<div class="grid2">${secPriority(d)}${secRec(d)}</div></div>${secMeeting(d)}<div class="grid2">${secFiles(d, false)}${secActivity(d, 5)}</div>${secWorkers(d, true)}${secFuture()}`;
    else if (v === "workspace") h = greet(d) + `<div id="dash" style="display:flex;flex-direction:column;gap:22px">${secKpis(d)}<section class="sec"><div class="sec-h"><h2>Workspace overview</h2></div><div class="ws-info"><div><small>Workspace</small><b>${esc(d.workspace)}</b></div><div><small>Owner</small><b>${esc(d.user.name)} · ${esc(d.user.role)}</b></div><div><small>Files · workers</small><b>${d.files.length} files · ${d.workers.length} workers</b></div></div></section><div class="grid2">${secPriority(d)}${secRec(d)}</div></div>`;
    else if (v === "files") h = `<div class="greet"><div><h1>Files</h1><p>${esc(d.workspace)} · demo data</p></div></div>${secFiles(d, true)}`;
    else if (v === "tasks") h = `<div class="greet"><div><h1>Tasks</h1><p>Your open tasks for ${esc(d.short)}.</p></div></div><section class="sec" id="sec-tasks">${d.tasks.map((t, i) => { const dn = (S.done[S.ind] || {})[i]; return `<label class="task ${dn ? "done" : ""}"><input type="checkbox" data-task="${i}" ${dn ? "checked" : ""}><span class="t">${esc(t[0])}</span><small>${esc(t[1])}</small><button class="link" type="button" data-file="${t[2]}">Open file ›</button></label>`; }).join("")}</section>` + secPriority(d, "Priority items");
    else if (v === "automation") h = `<div class="greet"><div><h1>Automation</h1><p>Workflows keep running while activity stays visible.</p></div></div>${secWorkers(d, true, "automation")}`;
    else if (v === "workers") h = `<div class="greet"><div><h1>Workers</h1><p>Specialized workers for ${esc(d.short)}. Simulated for the demo.</p></div></div>${secWorkers(d, false)}`;
    else if (v === "activity") h = `<div class="greet"><div><h1>Activity</h1><p>Everything MARVIN and the workers did, in one place.</p></div></div>${secActivity(d, 0)}`;
    else if (v === "analytics") {
      const by = {}; d.files.forEach((f) => { by[stClass(f.status)] = (by[stClass(f.status)] || 0) + 1; });
      h = `<div class="greet"><div><h1>Analytics</h1><p>A quick read on ${esc(d.short)}. Demo data.</p></div></div>${secKpis(d)}<section class="sec"><div class="sec-h"><h2>Files by status</h2></div><div class="barchart">${Object.entries(by).map(([k, n]) => `<div class="r"><span>${esc(k)}</span><div class="bar"><i style="width:${n / d.files.length * 100}%"></i></div><span>${n} of ${d.files.length}</span></div>`).join("")}</div></section>`;
    }
    $("#page").innerHTML = h;
    wirePage();
  }
  function wirePage() {
    const p = $("#page");
    $$("[data-file]", p).forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); if (b.dataset.meeting) openMeeting("brief"); else openFile(+b.dataset.file); }));
    const mb = $("#meet-brief"); if (mb) mb.addEventListener("click", () => openMeeting("brief"));
    const mn = $("#meet-now"); if (mn) mn.addEventListener("click", () => openMeeting("live"));
    $$("[data-view]", p).forEach((b) => b.addEventListener("click", () => go("#/" + S.ind + "/" + b.dataset.view)));
    $$("[data-cat]", p).forEach((b) => b.addEventListener("click", () => { S.cat = b.dataset.cat; renderPage(); }));
    $$("[data-future]", p).forEach((b) => b.addEventListener("click", () => openFuture(+b.dataset.future)));
    $$("[data-task]", p).forEach((c) => c.addEventListener("change", () => { (S.done[S.ind] = S.done[S.ind] || {})[+c.dataset.task] = c.checked; renderPage(); renderNav(); }));
    const gt = $("#g-tour"); if (gt) gt.addEventListener("click", () => startTour());
    const gm = $("#g-marvin"); if (gm) gm.addEventListener("click", () => openDrawer());
    const ra = $("#rec-ask"); if (ra) ra.addEventListener("click", () => { openDrawer(); setTimeout(() => ask(D.industries[S.ind].chips[0][1]), 250); });
  }

  /* ---------- modal + file preview ---------- */
  function openModal(html) { $("#mbox").innerHTML = html; $("#modal").classList.add("on"); const c = $("[data-close]", $("#mbox")); if (c) c.focus(); }
  function closeModal() { clearInterval(S.meetT); $("#modal").classList.remove("on"); $("#mbox").innerHTML = ""; }
  $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal" || e.target.hasAttribute("data-close")) closeModal(); });
  function previewText(f) {
    const p = f.prev, out = [p.head + " · " + p.sub, "DEMO PREVIEW. This file is mock data."];
    (p.fields || []).forEach((x) => out.push(x[0] + ": " + x[1]));
    (p.blocks || []).forEach((x) => out.push("", x[0] + ": " + x[1]));
    if (p.table) { out.push("", p.table.cols.join(" | ")); p.table.rows.forEach((r) => out.push(r.join(" | "))); }
    (p.slides || []).forEach((s, i) => out.push("Slide " + (i + 1) + ": " + s));
    return out.join("\n");
  }
  function openFile(i) {
    const d = cur(), f = d.files[i], p = f.prev, e = ext(f.name);
    let paper = `<h3>${esc(p.head)}</h3><div class="sub">${esc(p.sub)}</div>`;
    if (p.fields) paper += `<div class="fl2">${p.fields.map((x) => `<div><small>${esc(x[0])}</small><b>${esc(x[1])}</b></div>`).join("")}</div>`;
    (p.blocks || []).forEach((b) => { paper += `<h4>${esc(b[0])}</h4><p>${esc(b[1])}</p>`; });
    if (p.table) paper += `<table><tr>${p.table.cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr>${p.table.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table>`;
    const slides = (p.slides || []).map((s, k) => `<div class="slide"><small style="opacity:.6">Slide ${k + 1}</small><br>${esc(s)}</div>`).join("");
    const act = (p.activity || []).concat(d.activity.filter((a) => a[0].toLowerCase().includes(f.cat.toLowerCase().slice(0, 4))).map((a) => a[0])).slice(0, 3);
    openModal(`<div class="m-h"><span class="ftype ${e}">${e.toUpperCase()}</span><div style="flex:1;min-width:0"><b>${esc(f.name)}</b><small>${esc(f.cat)} · ${esc(f.size)} · Mock preview</small></div><span class="st ${stClass(f.status)}">${esc(f.status)}</span><button class="btn sm" data-close type="button" id="pv-close">Close</button></div>
      <div class="m-body"><div>${e === "pptx" ? slides : `<div class="paper">${paper}</div>`}</div>
      <div class="m-side"><div class="blk"><h4>Details</h4><div class="note" style="color:var(--soft)">Owner: ${esc(f.owner)}<br>Modified: ${esc(f.mod)}<br>Category: ${esc(f.cat)}<br>Size: ${esc(f.size)}</div></div>
      <div class="blk msum"><div class="who"><span class="orb"></span>MARVIN SUMMARY</div><p style="color:var(--text);font-size:14px">${esc(p.summary)}</p><p class="note" style="color:var(--muted);margin-top:6px">Simulated summary.</p></div>
      ${p.related && p.related.length ? `<div class="blk"><h4>Related files</h4>${p.related.map((r) => `<button class="rel" type="button" data-rel="${r}"><span class="ftype ${ext(d.files[r].name)}" style="width:28px;height:32px;font-size:8px">${ext(d.files[r].name).toUpperCase()}</span>${esc(d.files[r].name)}</button>`).join("")}</div>` : ""}
      ${act.length ? `<div class="blk"><h4>Activity</h4><ul class="tl">${act.map((a) => `<li><i></i><span>${esc(a)}</span></li>`).join("")}</ul></div>` : ""}
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm primary" type="button" id="pv-ask">🎙️ Ask MARVIN</button><button class="btn sm" type="button" id="pv-dl">Download preview</button></div></div></div>`);
    $$("[data-rel]", $("#mbox")).forEach((b) => b.addEventListener("click", () => openFile(+b.dataset.rel)));
    $("#pv-ask").addEventListener("click", () => { closeModal(); openDrawer(); setTimeout(() => ask("Summarize " + f.name.replace(/\.\w+$/, "").replace(/_/g, " ") + "."), 250); });
    $("#pv-dl").addEventListener("click", () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([previewText(f)], { type: "text/plain" })); a.download = f.name + ".demo-preview.txt"; document.body.appendChild(a); a.click(); a.remove(); toast("Downloaded a text preview of the mock file"); });
  }
  function openMeeting(mode) {
    const d = cur(), m = d.meeting; if (!m) return; clearInterval(S.meetT);
    if (mode === "live") return meetLive();
    openModal(`<div class="m-h"><span class="ftype pptx" style="font-size:18px">📅</span><div style="flex:1;min-width:0"><b>${esc(m.title)}</b><small>${esc(m.when)} · ${esc(m.starts)} · ${esc(m.room)} · Demo Data</small></div><button class="btn sm" data-close type="button" id="mt-close">Close</button></div>
      <div class="m-body"><div><div class="blk"><h4>Agenda</h4><ul class="tl">${m.agenda.map((a) => `<li><i></i><span><b>${esc(a[1])}</b><br><small style="color:var(--muted)">${esc(a[0])} · ${esc(a[2])}</small></span></li>`).join("")}</ul></div>
        <div class="blk msum"><div class="who"><span class="orb"></span>MARVIN TALKING POINTS</div><ul style="margin:6px 0 0;padding-left:18px">${m.talking.map((t) => `<li style="margin:4px 0">${esc(t)}</li>`).join("")}</ul><p class="note" style="color:var(--muted);margin-top:6px">Simulated brief.</p></div></div>
      <div class="m-side"><div class="blk"><h4>Attendees</h4>${m.attendees.map((a) => `<div class="note" style="color:var(--soft)">${esc(a[0])} · ${esc(a[1])}</div>`).join("")}</div>
        <div class="blk"><h4>Pre-read</h4>${m.preread.map((r) => `<button class="rel" type="button" data-rel="${r}"><span class="ftype ${ext(d.files[r].name)}" style="width:28px;height:32px;font-size:8px">${ext(d.files[r].name).toUpperCase()}</span>${esc(d.files[r].name)}</button>`).join("")}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm primary" type="button" id="meet-play">🔊 Play briefing</button><button class="btn sm primary" type="button" id="meet-start">▶ Start meeting now</button><button class="btn sm" type="button" id="meet-prepared">Mark prepared</button></div></div></div>`);
    $$("[data-rel]", $("#mbox")).forEach((b) => b.addEventListener("click", () => openFile(+b.dataset.rel)));
    $("#meet-play").addEventListener("click", () => { Voice.speak(m.spoken); toast("Playing the simulated briefing"); });
    $("#meet-start").addEventListener("click", () => meetLive());
    $("#meet-prepared").addEventListener("click", (e) => { (S.done[S.ind] = S.done[S.ind] || {})[2] = true; e.target.textContent = "Prepared ✓"; renderNav(); toast("Marked prepared. The task was checked off."); });
  }
  function meetLive() {
    const d = cur(), m = d.meeting; let i = 0; const cap = [];
    openModal(`<div class="m-h"><span class="livedot"></span><div style="flex:1;min-width:0"><b>LIVE · ${esc(m.title)}</b><small id="mt-state">Simulated meeting. MARVIN is listening and taking notes. Demo Data</small></div><button class="btn sm primary" type="button" id="meet-end">■ End meeting</button></div>
      <div class="m-body"><div class="blk"><h4>Live transcript</h4><div id="mt-tr" class="trbox"></div></div><div class="m-side"><div class="blk msum"><div class="who"><span class="orb"></span>MARVIN CAPTURED</div><div id="mt-cap" class="note" style="color:var(--soft)">Decisions and actions appear here.</div></div></div></div>`);
    const tick = () => {
      if (i >= m.live.length) { clearInterval(S.meetT); const s = $("#mt-state"); if (s) s.textContent = "Agenda covered. End the meeting to get notes."; return; }
      const l = m.live[i], box = $("#mt-tr"); if (!box) { clearInterval(S.meetT); return; }
      box.insertAdjacentHTML("beforeend", `<div class="trl"><b>${esc(l[0])}</b> ${esc(l[1])}</div>`); box.scrollTop = 1e6;
      m.captured.filter((c) => c[0] === i).forEach((c) => { cap.push(c); $("#mt-cap").innerHTML = cap.map((k) => `<div class="capi"><span class="st ${k[1] === "DECISION" ? "Approved" : "Pending"}">${k[1]}</span> ${esc(k[2])}</div>`).join(""); });
      i++;
    };
    tick(); S.meetT = setInterval(tick, 1300);
    $("#meet-end").addEventListener("click", () => {
      clearInterval(S.meetT);
      $("#mbox").innerHTML = `<div class="m-h"><div style="flex:1"><b>Meeting notes</b><small>${esc(m.title)} · generated by MARVIN · Simulated</small></div><button class="btn sm" data-close type="button" id="mt-close">Close</button></div>
        <div style="padding:20px 22px;display:flex;flex-direction:column;gap:14px"><div class="msum"><div class="who"><span class="orb"></span>MARVIN SUMMARY</div><p style="color:var(--text)">${esc(m.summary)}</p></div>
        <div>${m.captured.map((k) => `<div class="capi"><span class="st ${k[1] === "DECISION" ? "Approved" : "Pending"}">${k[1]}</span> ${esc(k[2])}</div>`).join("")}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary sm" type="button" id="meet-save">Save notes to workspace</button><button class="btn sm" type="button" id="meet-speak">🔊 Speak summary</button></div></div>`;
      $("#meet-speak").addEventListener("click", () => Voice.speak(m.summary));
      $("#meet-save").addEventListener("click", () => { d.activity.unshift(["MARVIN generated the leadership meeting notes (4 items)", "just now"]); d.files[2].status = "Updated"; d.files[2].mod = "Today"; (S.done[S.ind] = S.done[S.ind] || {})[2] = true; closeModal(); renderPage(); renderNav(); toast("Notes saved to Leadership_Meeting_Notes.docx (mock)"); });
    });
  }
  function openFuture(i) {
    const f = D.future[i];
    openModal(`<div class="m-h"><div style="flex:1"><span class="fbadge">${esc(f.badge)}</span><b style="margin-top:8px">${esc(f.t)}</b></div><button class="btn sm" data-close type="button">Close</button></div><div style="padding:0">${art(f.v, true).replace("<svg", '<svg style="display:block;width:100%;height:auto"')}</div><div style="padding:18px 22px"><p>${esc(f.d)}</p><p class="disc">Concept visualization. Not representative of currently shipped functionality.</p></div>`);
  }

  /* ---------- MARVIN ---------- */
  const Voice = {
    supported: () => "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined",
    speak(text, onEnd) {
      window.__speakCount++; window.__lastSpoken = text;
      if (!Voice.supported()) { toast("Voice playback is not supported in this browser. The text answer is shown."); if (onEnd) onEnd(); return false; }
      try {
        speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 1; u.pitch = 0.95;
        u.onstart = () => setStatus("Speaking…", "speaking"); u.onend = u.onerror = () => { setStatus("Ready"); if (onEnd) onEnd(); };
        speechSynthesis.speak(u); setStatus("Speaking…", "speaking"); return true;
      } catch (e) { setStatus("Ready"); return false; }
    },
    stop() { if (Voice.supported()) speechSynthesis.cancel(); setStatus("Ready"); }
  };
  function setStatus(t, cls) { $("#d-status").textContent = t; $("#d-h").className = "d-h" + (cls ? " " + cls : ""); S.speaking = cls === "speaking"; S.listening = cls === "listening"; }
  function openDrawer() { $("#drawer").classList.add("on"); $("#scrim").classList.add("on"); $("#drawer").setAttribute("aria-hidden", "false"); setTimeout(() => $("#d-in").focus(), 320); }
  function closeDrawer() { $("#drawer").classList.remove("on"); $("#scrim").classList.remove("on"); $("#drawer").setAttribute("aria-hidden", "true"); Voice.stop(); stopWave(); $("#mic").classList.remove("on"); }
  $("#marvin-fab").addEventListener("click", () => ($("#drawer").classList.contains("on") ? closeDrawer() : openDrawer()));
  $("#d-close").addEventListener("click", closeDrawer);
  $("#scrim").addEventListener("click", closeDrawer);
  function renderSuggestions() { $("#sugg").innerHTML = cur().chips.map((c, i) => `<button class="sq" type="button" id="sq-${i}" data-q="${esc(c[1])}">${esc(c[1])}</button>`).join(""); $$("#sugg .sq").forEach((b) => b.addEventListener("click", () => ask(b.dataset.q))); }
  function chat() { return (S.chats[S.ind] = S.chats[S.ind] || []); }
  function renderConvo() {
    const c = chat(), d = cur();
    if (!c.length) c.push({ who: "bot", text: `Ready. I'm watching ${d.short}. Ask me what needs attention, or pick a suggestion.`, files: [], greeting: true });
    $("#convo").innerHTML = c.map((m, i) => bubble(m, i)).join(""); $("#convo").scrollTop = 1e6; wireConvo();
  }
  function bubble(m, i) {
    if (m.who === "me") return `<div class="bub me"><span class="tag">YOU</span>${esc(m.text)}</div>`;
    const d = cur();
    return `<div class="bub bot"><span class="tag">MARVIN · SIMULATED RESPONSE</span><span class="txt">${esc(m.text)}</span>${m.greeting ? "" : `<div class="acts"><button class="btn sm primary" type="button" data-speak="${i}">🔊 Speak Response</button>${m.meeting ? `<button class="btn sm" type="button" data-meet="1">📅 Open meeting briefing</button>` : ""}${(m.files || []).map((f) => `<button class="btn sm" type="button" data-bfile="${f}">${esc(d.files[f].name)}</button>`).join("")}</div>`}</div>`;
  }
  function wireConvo() {
    $$("[data-speak]", $("#convo")).forEach((b) => b.addEventListener("click", () => { const m = chat()[+b.dataset.speak]; if (S.speaking) { Voice.stop(); b.textContent = "🔊 Speak Response"; } else Voice.speak(m.text, () => { b.textContent = "🔊 Speak Response"; }); if (S.speaking) b.textContent = "⏹ Stop"; }));
    $$("[data-meet]", $("#convo")).forEach((b) => b.addEventListener("click", () => { closeDrawer(); openMeeting("brief"); }));
    $$("[data-bfile]", $("#convo")).forEach((b) => b.addEventListener("click", () => { closeDrawer(); openFile(+b.dataset.bfile); }));
  }
  function match(text) {
    const d = cur(), keys = Object.keys(d.marvin);
    const chip = d.chips.find((c) => c[1] === text); if (chip) return chip[0];
    for (const k of keys) if (D.keywords[k] && D.keywords[k].test(text)) return k;
    return null;
  }
  function ask(text, opts) {
    opts = opts || {}; text = (text || "").trim(); if (!text) return;
    if (!$("#drawer").classList.contains("on")) openDrawer();
    chat().push({ who: "me", text }); renderConvo(); setStatus("Thinking…");
    setTimeout(() => {
      const k = match(text), d = cur(), r = k ? d.marvin[k] : null;
      chat().push({ who: "bot", text: r ? r[0] : D.fallbackMarvin, files: r ? r[1] : [], meeting: !!(k === "meeting" && d.meeting) });
      renderConvo(); setStatus("Ready");
      if (opts.autoSpeak && r) Voice.speak(r[0]);
    }, 700);
  }
  $("#d-form").addEventListener("submit", (e) => { e.preventDefault(); const v = $("#d-in").value; $("#d-in").value = ""; ask(v); });
  /* mic: simulated listening, waveform, scripted request */
  let waveRaf = 0;
  function startWave() { const c = $("#wave"), x = c.getContext("2d"); c.classList.add("on"); const t0 = performance.now();
    (function f(t) { x.clearRect(0, 0, c.width, c.height); const n = 40; for (let i = 0; i < n; i++) { const a = Math.abs(Math.sin((t - t0) / 160 + i * .55)) * (0.35 + 0.65 * Math.abs(Math.sin(i * 1.7 + (t - t0) / 420))); x.fillStyle = "rgba(255,59,67," + (.45 + a * .5) + ")"; const h = 4 + a * 36; x.fillRect(8 + i * 9.8, (c.height - h) / 2, 5, h); } waveRaf = requestAnimationFrame(f); })(t0); }
  function stopWave() { cancelAnimationFrame(waveRaf); const c = $("#wave"); c.classList.remove("on"); }
  $("#mic").addEventListener("click", () => {
    if (S.listening) return;
    Voice.stop(); $("#mic").classList.add("on"); setStatus("Listening…", "listening"); startWave();
    $("#d-in").placeholder = "Listening…";
    setTimeout(() => { stopWave(); $("#mic").classList.remove("on"); $("#d-in").placeholder = "Ask MARVIN…"; setStatus("Ready"); ask(cur().chips[0][1], { autoSpeak: true }); }, 1900);
  });
  $("#convo").addEventListener("scroll", () => {});

  /* ---------- tutorial ---------- */
  let ti = -1;
  const spot = $("#spot"), tcard = $("#tcard");
  function startTour() { if (S.ind === null) { go("#/construction"); return; } closeDrawer(); closeModal(); $("#tour").classList.add("on"); showStep(0); }
  function endTour(done) { ti = -1; $("#tour").classList.remove("on"); spot.style.display = "none"; if (done !== false) store("nexen_demo_tour_done", "1"); }
  function showStep(i) {
    const st = D.tutorial[i]; ti = i;
    $("#t-step").textContent = "STEP " + (i + 1) + " OF " + D.tutorial.length; $("#t-h").textContent = st.t; $("#t-p").textContent = st.d;
    $("#t-dots").innerHTML = D.tutorial.map((_, k) => `<i class="${k <= i ? "on" : ""}"></i>`).join("");
    $("#t-back").style.display = i === 0 ? "none" : ""; $("#t-skip").style.display = i === D.tutorial.length - 1 ? "none" : "";
    $("#t-next").textContent = i === D.tutorial.length - 1 ? "Finish" : "Next"; $("#t-try").style.display = i === 2 || i === D.tutorial.length - 1 ? "" : "none";
    const el = st.target ? $(st.target) : null;
    if (el && el.offsetParent !== null || (el && getComputedStyle(el).position === "fixed")) {
      if (el.id !== "marvin-fab") el.scrollIntoView({ block: el.getBoundingClientRect().height > innerHeight * 0.7 ? "start" : "center", behavior: "instant" });
      setTimeout(() => placeCard(el), 120); setTimeout(() => { if (ti === i) placeCard(el); }, 450);
    } else { spot.style.display = "none"; $("#veil").style.display = "block"; Object.assign(tcard.style, { left: "50%", top: "50%", transform: "translate(-50%,-50%)" }); }
  }
  function placeCard(el) {
    const r = el.getBoundingClientRect(), pad = 8, vh = innerHeight, vw = innerWidth;
    const top = Math.max(4, r.top - pad), height = Math.min(r.height + pad * 2, vh - top - 4);
    $("#veil").style.display = "none";
    Object.assign(spot.style, { display: "block", left: Math.max(4, r.left - pad) + "px", top: top + "px", width: Math.min(r.width + pad * 2, vw - 8) + "px", height: height + "px" });
    tcard.style.transform = "none"; const ch = tcard.offsetHeight, cw = tcard.offsetWidth;
    let y = top + height + 14; if (y + ch > vh - 8) y = Math.max(8, top - ch - 14); if (y < 8 || y + ch > vh) y = Math.max(8, vh - ch - 12);
    let x = Math.min(Math.max(12, r.left + r.width / 2 - cw / 2), vw - cw - 12);
    if (r.width > vw * .6) x = Math.max(12, (vw - cw) / 2);
    tcard.style.left = x + "px"; tcard.style.top = y + "px";
  }
  $("#t-next").addEventListener("click", () => { if (ti >= D.tutorial.length - 1) endTour(); else showStep(ti + 1); });
  $("#t-back").addEventListener("click", () => showStep(Math.max(0, ti - 1)));
  $("#t-skip").addEventListener("click", () => endTour());
  $("#t-try").addEventListener("click", () => { endTour(); openDrawer(); });
  window.addEventListener("resize", () => { if (ti >= 0) showStep(ti); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (ti >= 0) endTour(); else if ($("#modal").classList.contains("on")) closeModal(); else if ($("#drawer").classList.contains("on")) closeDrawer(); }
    if (ti >= 0 && e.key === "ArrowRight") $("#t-next").click();
    if (ti >= 0 && e.key === "ArrowLeft" && ti > 0) $("#t-back").click();
  });

  window.startTour = startTour;
  renderLanding(); route();
})();
