// demo-receipt: writes docs/DEMO-RECEIPT.md from docs/qa-results.json and git status. Report only what the data says.
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const ROOT = path.resolve(__dirname, "..");
const qa = JSON.parse(fs.readFileSync(path.join(ROOT, "docs", "qa-results.json"), "utf8"));
const git = (c) => { try { return execSync("git " + c, { cwd: ROOT, encoding: "utf8" }); } catch (e) { return ""; } };

const created = [], modified = [];
git("status --porcelain -uall").split("\n").filter(Boolean).forEach((l) => { const f = l.slice(3).trim(); (l.startsWith("??") || l.startsWith("A") ? created : modified).push(f); });
const lastCommit = git("log --oneline -1").trim();
const group = (arr) => { const imgs = arr.filter((f) => f.startsWith("docs/img/")); const rest = arr.filter((f) => !f.startsWith("docs/img/")); return rest.concat(imgs.length ? [`docs/img/ (${imgs.length} screenshots)`] : []); };
const pass = qa.results.filter((r) => r.pass), fail = qa.results.filter((r) => !r.pass);
const areas = {}; qa.results.forEach((r) => { (areas[r.area] = areas[r.area] || []).push(r); });
const routes = ["/v2/#/ (landing)", "/v2/#/construction", "/v2/#/corporate", "/v2/#/real-estate", "/v2/#/<industry>/{workspace,files,tasks,automation,workers,activity,analytics,home}"];

let md = `# NEXEN demo receipt\n\nGenerated ${new Date().toISOString()} from docs/qa-results.json (QA run ${qa.when}) and git status. Last commit before this work: ${lastCommit || "none"}.\n\n`;
md += `## FILES CREATED\n${group(created).map((f) => "- " + f).join("\n") || "- none"}\n\n## FILES MODIFIED\n${group(modified).map((f) => "- " + f).join("\n") || "- none"}\n\n`;
md += `## ROUTES TESTED\n${routes.map((r) => "- " + r).join("\n")}\n\n`;
md += `## INTERACTIONS TESTED (${qa.results.length} checks)\n${Object.entries(areas).map(([a, rs]) => `### ${a} (${rs.filter((r) => r.pass).length}/${rs.length})\n${rs.map((r) => `- ${r.pass ? "PASS" : "FAIL"}: ${r.name}`).join("\n")}`).join("\n\n")}\n\n`;
md += `## SCREENSHOTS\n${qa.shots.map((s) => "- " + s).join("\n")}\n\n`;
md += `## PASS\n${pass.length} of ${qa.results.length} checks passed.\n\n## FAIL\n${fail.length ? fail.map((r) => `- ${r.area}: ${r.name} | ${r.detail}`).join("\n") : "None in this run."}\n\n`;
md += `## NOT TESTED\n- Audible voice output. Headless Chrome cannot confirm sound. Only that Speak Response calls the speech API (counter) was verified.\n- Real microphone input. The mic button is a simulation by design.\n- Firefox, Safari and Edge. Only installed Chrome was used.\n- A physical phone. Narrow layout was tested with a 390x844 emulated device.\n- Screen readers and a full accessibility audit.\n- GitHub Pages hosting.\n\n`;
md += `## KNOWN ISSUES\n- The landing headline contains the word "Connected" as brand copy from the brief. It is not a status label, and the label scan excludes the landing page.\n- The first-run tutorial shows once per browser (localStorage). Use Restart tutorial to see it again.\n- On a 390px phone the step 4 tutorial card sits over the top of the tall workers section.\n- File previews are UI mocks. No physical Word, PDF or Excel files were generated.\n- The gamified quest and boss layer from the first demo (frontend/index.html) is not part of v2.\n`;
fs.writeFileSync(path.join(ROOT, "docs", "DEMO-RECEIPT.md"), md);
console.log(`receipt written: ${pass.length}/${qa.results.length} pass, ${created.length} created, ${modified.length} modified`);
