import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import manifest from "../public/captures/manifest.json";
import tl from "./timeline.json";

const { fontFamily } = loadFont("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin"] });
const ACC = "#4f8cff", ACC2 = "#73c7ff", BG = "#08090c", TXT = "#f2f4f8", SOFT = "#aab2c3";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.45, 0, 0.15, 1);
const OV = 10; // cross-dissolve overlap between scenes

/* ---------- manifest helpers (real element boxes from the Playwright captures) ---------- */
type Rect = { x: number; y: number; w: number; h: number };
const R = (shot: string, sel: string, i = 0): Rect => (manifest as any)[shot].rects[sel][i];
const U = (shot: string, sel: string): Rect => {
  const rs: Rect[] = (manifest as any)[shot].rects[sel];
  const x0 = Math.min(...rs.map((r) => r.x)), y0 = Math.min(...rs.map((r) => r.y));
  const x1 = Math.max(...rs.map((r) => r.x + r.w)), y1 = Math.max(...rs.map((r) => r.y + r.h));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
};
const C = (r: Rect) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

/* ---------- camera ---------- */
type KF = { f: number; x: number; y: number; z: number };
const KF = (f: number, r: Rect, z: number): KF => ({ f, x: C(r).x, y: C(r).y, z: Math.min(z, (1920 * 0.86) / (r.w * 0.92), (1080 * 0.84) / (r.h * 0.92)) });
const FULL = (f: number): KF => ({ f, x: 960, y: 540, z: 1 });
function camAt(kfs: KF[], f: number) {
  if (f <= kfs[0].f) return kfs[0];
  for (let i = 0; i < kfs.length - 1; i++) {
    const a = kfs[i], b = kfs[i + 1];
    if (f <= b.f) { const t = ease((f - a.f) / (b.f - a.f)); return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t }; }
  }
  return kfs[kfs.length - 1];
}
function xf(c: { x: number; y: number; z: number }) {
  const s = c.z * 0.92; let cx = c.x, cy = c.y;
  if (s >= 1) { cx = Math.min(Math.max(cx, 960 / s), 1920 - 960 / s); cy = Math.min(Math.max(cy, 540 / s), 1080 - 540 / s); }
  return { s, tx: 960 - cx * s, ty: 540 - cy * s };
}
const toStage = (r: Rect, t: { s: number; tx: number; ty: number }): Rect => ({ x: t.tx + r.x * t.s, y: t.ty + r.y * t.s, w: r.w * t.s, h: r.h * t.s });

/* ---------- scene frame context ---------- */
const SceneCtx = React.createContext(0);
const useF = () => useCurrentFrame() - React.useContext(SceneCtx);

const SceneWrap: React.FC<{ k: string; children: React.ReactNode }> = ({ k, children }) => {
  const s = (tl.scenes as any)[k]; const first = k === "S0"; const off = first ? 0 : OV;
  return (
    <Sequence from={s.start - off} durationInFrames={s.dur + off}>
      <SceneCtx.Provider value={off}><Fade dur={s.dur + off} inF={first ? 1 : OV} outF={k === "S9" ? 0 : OV}>{children}</Fade></SceneCtx.Provider>
    </Sequence>
  );
};
const Fade: React.FC<{ dur: number; inF: number; outF: number; children: React.ReactNode }> = ({ dur, inF, outF, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [0, Math.max(1, inF)], [0, 1], clamp), outF ? interpolate(f, [dur - outF, dur], [1, 0], clamp) : 1);
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/* ---------- visual atoms ---------- */
const Backdrop: React.FC<{ shot: string; cam?: { x: number; y: number }; tint?: string }> = ({ shot, cam, tint }) => {
  const f = useF();
  const dx = cam ? -(cam.x - 960) * 0.1 : Math.sin(f / 90) * 20, dy = cam ? -(cam.y - 540) * 0.1 : Math.cos(f / 110) * 14;
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <Img src={staticFile(`captures/${shot}.png`)} style={{ position: "absolute", left: -140 + dx, top: -80 + dy, width: 2200, height: 1238, filter: "blur(36px) brightness(0.34) saturate(1.25)" }} />
      <AbsoluteFill style={{ background: `radial-gradient(900px 600px at ${50 + Math.sin(f / 120) * 8}% 0%, ${tint || ACC}33, transparent 70%)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.55) 100%)" }} />
    </AbsoluteFill>
  );
};

const Chip: React.FC<{ n: string; text: string }> = ({ n, text }) => {
  const f = useF(); const p = spring({ frame: f - 6, fps: 30, config: { damping: 200 } });
  return (
    <div style={{ position: "absolute", left: 56, top: 48, display: "flex", alignItems: "center", gap: 14, padding: "12px 20px 12px 14px", borderRadius: 999, background: "rgba(14,16,22,.72)", border: "1px solid rgba(255,255,255,.12)", backdropFilter: "blur(14px)", opacity: p, transform: `translateY(${(1 - p) * -14}px)`, fontFamily, color: TXT, zIndex: 20 }}>
      <span style={{ fontWeight: 800, fontSize: 16, color: "#06101f", background: ACC, borderRadius: 999, padding: "4px 10px" }}>{n}</span>
      <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: ".16em" }}>{text}</span>
    </div>
  );
};

type CO = { rect: Rect; label: string; from: number; to: number; side?: "top" | "bottom" | "left" | "right"; n?: number };
const Callout: React.FC<{ co: CO; t: { s: number; tx: number; ty: number } }> = ({ co, t }) => {
  const f = useF();
  const p = spring({ frame: f - co.from, fps: 30, config: { damping: 18, stiffness: 140 } });
  const out = interpolate(f, [co.to - 8, co.to], [1, 0], clamp);
  const o = Math.max(0, Math.min(p, out)); if (o <= 0.01) return null;
  const r = toStage(co.rect, t); const pad = 10;
  const side = co.side || "top"; const lw = 520;
  let lx = r.x - pad, ly = r.y - pad - 74;
  if (side === "bottom") ly = r.y + r.h + pad + 16;
  if (side === "left") { lx = r.x - lw - 30; ly = r.y + r.h / 2 - 28; }
  if (side === "right") { lx = r.x + r.w + 30; ly = r.y + r.h / 2 - 28; }
  lx = Math.min(Math.max(lx, 40), 1920 - lw - 40); ly = Math.min(Math.max(ly, 120), 1080 - 100);
  return (
    <>
      <div style={{ position: "absolute", left: r.x - pad, top: r.y - pad, width: r.w + pad * 2, height: r.h + pad * 2, borderRadius: 16, border: `3px solid ${ACC}`, boxShadow: `0 0 0 6px ${ACC}22, 0 0 40px ${ACC}66`, opacity: o, transform: `scale(${0.96 + 0.04 * o})`, zIndex: 15 }} />
      <div style={{ position: "absolute", left: lx, top: ly, display: "flex", alignItems: "center", gap: 12, padding: "14px 22px 14px 14px", borderRadius: 14, background: "rgba(10,12,17,.92)", border: `1px solid ${ACC}88`, boxShadow: "0 18px 50px rgba(0,0,0,.55)", opacity: o, transform: `translateY(${(1 - o) * 14}px)`, fontFamily, color: TXT, fontWeight: 700, fontSize: 30, letterSpacing: "-.01em", zIndex: 16, maxWidth: lw + 120 }}>
        {co.n != null && <span style={{ background: ACC, color: "#06101f", borderRadius: 999, minWidth: 34, height: 34, display: "grid", placeItems: "center", fontSize: 20, fontWeight: 800 }}>{co.n}</span>}
        <span>{co.label}</span>
      </div>
    </>
  );
};

const Karaoke: React.FC<{ text: string; start: number; dur: number; tag: string }> = ({ text, start, dur, tag }) => {
  const f = useF(); const words = text.split(" ");
  const p = interpolate(f, [start, start + dur], [0, 1], clamp);
  const show = interpolate(f, [start - 12, start], [0, 1], clamp) * interpolate(f, [start + dur, start + dur + 20], [1, 0], clamp);
  if (show <= 0.01) return null;
  const idx = Math.floor(p * words.length);
  const perLine = 11; const lines: string[][] = []; for (let i = 0; i < words.length; i += perLine) lines.push(words.slice(i, i + perLine));
  const curLine = Math.min(lines.length - 1, Math.floor(idx / perLine));
  return (
    <div style={{ position: "absolute", left: 120, right: 120, bottom: 58, opacity: show, transform: `translateY(${(1 - show) * 20}px)`, zIndex: 30, fontFamily, textAlign: "center" }}>
      <div style={{ display: "inline-block", padding: "18px 34px", borderRadius: 18, background: "rgba(8,9,12,.9)", border: "1px solid rgba(255,255,255,.14)", boxShadow: "0 24px 70px rgba(0,0,0,.6)", maxWidth: 1500 }}>
        <div style={{ fontSize: 15, letterSpacing: ".22em", fontWeight: 800, color: ACC2, marginBottom: 8 }}>{tag}</div>
        <div style={{ fontSize: 38, fontWeight: 700, lineHeight: 1.3, letterSpacing: "-.01em" }}>
          {lines[curLine].map((w, i) => { const gi = curLine * perLine + i; return <span key={i} style={{ color: gi <= idx ? TXT : "rgba(242,244,248,.32)", marginRight: 12 }}>{w}</span>; })}
        </div>
      </div>
    </div>
  );
};

const VoiceRings: React.FC<{ rect: Rect; t: { s: number; tx: number; ty: number }; start: number; dur: number }> = ({ rect, t, start, dur }) => {
  const f = useF(); if (f < start || f > start + dur) return null;
  const r = toStage(rect, t); const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  return (
    <>
      {[0, 1, 2].map((i) => { const ph = ((f - start + i * 14) % 42) / 42; const sz = r.w * (1 + ph * 2.2);
        return <div key={i} style={{ position: "absolute", left: cx - sz / 2, top: cy - sz / 2, width: sz, height: sz, borderRadius: "50%", border: `3px solid ${ACC}`, opacity: (1 - ph) * 0.7, zIndex: 14 }} />; })}
    </>
  );
};

/* ---------- a captured screen with camera, parallax, callouts ---------- */
const Product: React.FC<{ shot: string; kfs: KF[]; callouts?: CO[]; chip?: [string, string]; tilt?: boolean; tint?: string; children?: (t: { s: number; tx: number; ty: number }) => React.ReactNode }> = ({ shot, kfs, callouts = [], chip, tilt, tint, children }) => {
  const f = useF(); const cam = camAt(kfs, f); const t = xf(cam);
  const ent = tilt ? 1 - spring({ frame: f, fps: 30, config: { damping: 200 }, durationInFrames: 40 }) : 0;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Backdrop shot={shot} cam={cam} tint={tint} />
      <AbsoluteFill style={{ perspective: 2600 }}>
        <div style={{ position: "absolute", inset: 0, transform: `rotateX(${ent * 9}deg) rotateY(${ent * -8}deg) scale(${1 - ent * 0.08})`, transformOrigin: "50% 50%" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "0 0", transform: `translate(${t.tx}px,${t.ty}px) scale(${t.s})` }}>
            <Img src={staticFile(`captures/${shot}.png`)} style={{ width: 1920, height: 1080, borderRadius: 18, boxShadow: "0 50px 140px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.08)" }} />
          </div>
        </div>
      </AbsoluteFill>
      {callouts.map((co, i) => <Callout key={i} co={co} t={t} />)}
      {children && children(t)}
      {chip && <Chip n={chip[0]} text={chip[1]} />}
    </AbsoluteFill>
  );
};

const Slide: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 12], [0, 1], clamp), b = interpolate(f, [dur - 12, dur], [1, 0], clamp);
  const x = (1 - ease(a)) * 90 - (1 - ease(b)) * 90;
  return <AbsoluteFill style={{ opacity: Math.min(a, b), transform: `translateX(${x}px)` }}>{children}</AbsoluteFill>;
};

/* ---------- scenes ---------- */
const S0: React.FC = () => {
  const f = useF(); const words = [["Your Business.", TXT], ["Connected.", ACC], ["Intelligent.", "#d7dbe6"], ["Executable.", TXT]] as const;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Backdrop shot="02-con-home" tint={ACC} />
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 170px", fontFamily }}>
        {words.map(([w, c], i) => {
          const p = spring({ frame: f - 10 - i * 30, fps: 30, config: { damping: 22, stiffness: 120 } });
          return <div key={i} style={{ fontSize: 138, fontWeight: 800, letterSpacing: "-.035em", lineHeight: 1.04, color: c as string, opacity: p, transform: `translateY(${(1 - p) * 46}px)`, filter: `blur(${(1 - p) * 14}px)` }}>{w}</div>;
        })}
        <div style={{ marginTop: 34, fontSize: 28, letterSpacing: ".34em", fontWeight: 700, color: SOFT, opacity: interpolate(f, [110, 135], [0, 1], clamp) }}>NEXEN ENTERPRISE V1</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const S1: React.FC = () => {
  const sh = "01-landing"; const cards = (manifest as any)[sh].rects[".icard"] as Rect[];
  const names = ["Construction", "Corporate", "Real Estate"];
  return <Product shot={sh} tilt chip={["01", "PICK A WORKSPACE"]} kfs={[FULL(0), KF(36, U(sh, ".icard"), 1.25), KF(110, U(sh, ".icard"), 1.25), FULL(150)]}
    callouts={cards.map((r, i) => ({ rect: r, label: names[i], from: 30 + i * 14, to: 140, side: "top" as const, n: i + 1 }))} />;
};

const S2: React.FC = () => {
  const sh = "02-con-home";
  const kp = U(sh, ".kpis"), pr = R(sh, "#sec-priority"), rec = R(sh, "#sec-rec");
  return <Product shot={sh} tint="#ffb000" chip={["02", "THE WORKSPACE"]}
    kfs={[FULL(0), KF(45, kp, 1.9), KF(100, kp, 1.9), KF(135, pr, 1.55), KF(185, pr, 1.55), KF(215, rec, 2.0), KF(265, rec, 2.0)]}
    callouts={[
      { rect: kp, label: "Project health at a glance", from: 50, to: 102, side: "bottom", n: 1 },
      { rect: pr, label: "What needs attention, ranked", from: 138, to: 188, side: "top", n: 2 },
      { rect: rec, label: "MARVIN recommends the first move", from: 218, to: 266, side: "left", n: 3 }
    ]} />;
};

const S3: React.FC = () => {
  const sh = "05-con-file-rfi"; const paper = R(sh, ".paper"), sum = R(sh, ".msum"), mb = R(sh, "#mbox");
  return <Product shot={sh} tint="#ffb000" chip={["03", "FILES THAT EXPLAIN THEMSELVES"]}
    kfs={[KF(0, mb, 1.05), KF(40, paper, 1.75), KF(90, paper, 1.75), KF(130, sum, 2.25), KF(180, sum, 2.25)]}
    callouts={[
      { rect: paper, label: "Open any file for a real preview", from: 44, to: 96, side: "right", n: 1 },
      { rect: sum, label: "MARVIN Summary on every file", from: 134, to: 178, side: "left", n: 2 }
    ]} />;
};

const S4: React.FC = () => {
  const f = useF(); const a = 0, b = 60, c = 120, d = 165, e = 190; const ans = (tl.voice as any[])[0]; const voiceLocal = ans.start - (tl.scenes as any).S4.start;
  const dur = (tl.scenes as any).S4.dur;
  const shot = f < b ? "06-marvin-ready" : f < c ? "07-marvin-listening" : f < d ? "08-marvin-question" : "09-marvin-answer";
  const dr = R("06-marvin-ready", "#drawer");
  const kfs: KF[] = [{ f: 0, x: 960, y: 540, z: 1 }, { f: 40, x: 1700, y: 520, z: 1.35 }, { f: dur, x: 1700, y: 560, z: 1.38 }];
  const orb = R("09-marvin-answer", "#d-h");
  const mic = R("07-marvin-listening", "#mic"), speak = R("09-marvin-answer", "[data-speak]");
  return (
    <Product shot={shot} tint={ACC} chip={["04", "MEET MARVIN"]} tilt kfs={kfs}
      callouts={[
        { rect: R("06-marvin-ready", "#mic"), label: "Tap the mic, or type", from: 20, to: b + 50, side: "left", n: 1 },
        { rect: R("09-marvin-answer", "[data-speak]"), label: "Speak Response plays it aloud", from: voiceLocal + 20, to: dur - 20, side: "left", n: 2 }
      ]}>
      {(t) => <>
        <VoiceRings rect={{ x: orb.x + 20, y: orb.y + 18, w: 46, h: 46 }} t={t} start={voiceLocal} dur={ans.dur} />
        <Karaoke tag="MARVIN · PROTOTYPE VOICE · SIMULATED RESPONSE" start={voiceLocal} dur={ans.dur} text="Good morning. Three items need your attention. Change Order 017 needs approval, plus $38,400. RFI 042 is 48 hours overdue. Start with Change Order 017." />
      </>}
    </Product>
  );
};

const S5: React.FC = () => {
  const subs: [string, string, string, string][] = [["02-con-home", "Construction", "Riverside Tower Project", "#ffb000"], ["11-corp-home", "Corporate", "Northstar Operations", "#3b8bff"], ["12-re-home", "Real Estate", "Evergreen Realty Group", "#19c6a0"]];
  const per = 80;
  return (
    <AbsoluteFill style={{ background: BG }}>
      {subs.map(([sh, name, ws, tint], i) => (
        <Sequence key={sh} from={OV + i * per - (i ? 8 : 0)} durationInFrames={per + (i ? 8 : 0)}>
          <SceneCtx.Provider value={0}>
            <Slide dur={per + (i ? 8 : 0)}>
              <Product shot={sh} tint={tint} chip={["05", "ONE SHELL, ANY BUSINESS"]}
                kfs={[FULL(0), KF(40, U(sh, ".kpis"), 1.55), KF(per + 8, U(sh, ".kpis"), 1.6)]}
                callouts={[{ rect: R(sh, "#seg"), label: `${name} · ${ws}`, from: 8, to: per + 4, side: "bottom" }]} />
            </Slide>
          </SceneCtx.Provider>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const S6: React.FC = () => {
  const mv = (tl.voice as any[])[1]; const base = (tl.scenes as any).S6.start; const vl = mv.start - base;
  const parts: [string, number, number][] = [["11-corp-home", 0, 78], ["13-meet-brief", 78, 150], ["14-meet-live-1", 150, 195], ["14-meet-live-3", 195, 240], ["14-meet-live-5", 240, 272], ["14-meet-live-6", 272, 305], ["15-meet-notes", 305, (tl.scenes as any).S6.dur]];
  return (
    <AbsoluteFill style={{ background: BG }}>
      {parts.map(([sh, a, b], i) => {
        const mb = (manifest as any)[sh].rects["#mbox"] ? R(sh, "#mbox") : null;
        const kfs: KF[] = sh === "11-corp-home" ? [FULL(0), KF(30, R(sh, "#sec-meeting"), 1.7), KF(b - a, R(sh, "#sec-meeting"), 1.7)] : [KF(0, mb as Rect, 1.0), KF(30, mb as Rect, 1.45), KF(b - a + 10, mb as Rect, 1.5)];
        const cos: CO[] = sh === "11-corp-home" ? [{ rect: R(sh, "#sec-meeting"), label: "Next meeting, one click away", from: 24, to: 72, side: "top", n: 1 }]
          : sh === "13-meet-brief" ? [{ rect: R(sh, ".msum"), label: "MARVIN prepares the briefing", from: 18, to: 70, side: "left", n: 2 }]
          : sh.startsWith("14-meet-live") ? [{ rect: R(sh, "#mt-cap"), label: "Decisions and actions captured live", from: 4, to: b - a, side: "left", n: 3 }]
          : [{ rect: R(sh, ".msum"), label: "Notes in one click", from: 14, to: 120, side: "left", n: 4 }];
        return (
          <Sequence key={sh} from={OV + a - (i ? 6 : 0)} durationInFrames={b - a + (i ? 6 : 0)}>
            <SceneCtx.Provider value={0}>
              <Fade dur={b - a + (i ? 6 : 0)} inF={i ? 6 : 1} outF={i < parts.length - 1 ? 6 : 0}>
                <Product shot={sh} tint="#3b8bff" chip={["06", "LIVE MEETINGS, SIMULATED"]} kfs={kfs} callouts={cos} />
              </Fade>
            </SceneCtx.Provider>
          </Sequence>
        );
      })}
      <Karaoke tag="MARVIN · PROTOTYPE VOICE · SIMULATED" start={vl} dur={mv.dur} text="Notes are ready. One decision, three actions." />
    </AbsoluteFill>
  );
};

const Phone: React.FC<{ shot: string; x: number; delay: number; label: string }> = ({ shot, x, delay, label }) => {
  const f = useF(); const p = spring({ frame: f - delay, fps: 30, config: { damping: 20, stiffness: 90 } });
  const fy = Math.sin((f + delay * 3) / 40) * 10; const H = 880, W = H * (1170 / 2532);
  return (
    <div style={{ position: "absolute", left: x - W / 2, top: 130 + (1 - p) * 200 + fy, opacity: p, width: W + 20, fontFamily }}>
      <div style={{ borderRadius: 54, padding: 10, background: "#12151c", border: "2px solid rgba(255,255,255,.14)", boxShadow: "0 50px 120px rgba(0,0,0,.65)" }}>
        <Img src={staticFile(`captures/${shot}.png`)} style={{ width: W, height: H, borderRadius: 44, display: "block" }} />
      </div>
      <div style={{ textAlign: "center", marginTop: 22, color: SOFT, fontWeight: 700, letterSpacing: ".18em", fontSize: 20 }}>{label}</div>
    </div>
  );
};
const S7: React.FC = () => {
  const f = useF(); const o = interpolate(f, [4, 26], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Backdrop shot="02-con-home" />
      <div style={{ position: "absolute", left: 0, right: 0, top: 36, textAlign: "center", fontFamily, fontSize: 54, fontWeight: 800, letterSpacing: "-.02em", color: TXT, opacity: o, transform: `translateY(${(1 - o) * 20}px)` }}>Built for 1080p and phones.</div>
      <Phone shot="21-phone-home" x={620} delay={6} label="WORKSPACE" />
      <Phone shot="22-phone-menu" x={960} delay={16} label="SWITCH INDUSTRY" />
      <Phone shot="24-phone-marvin" x={1300} delay={26} label="ASK MARVIN" />
      <Chip n="07" text="EVERYWHERE" />
    </AbsoluteFill>
  );
};

const S8: React.FC = () => {
  const sh = "04-con-future"; const fu = R(sh, "#sec-future"); const f = useF();
  const o = interpolate(f, [30, 60], [0, 1], clamp);
  return (
    <Product shot={sh} tint="#9b5cff" chip={["08", "FUTURE DEVELOPMENT"]} kfs={[FULL(0), KF(40, fu, 1.45), KF(150, fu, 1.5)]}
      callouts={[{ rect: fu, label: "Concept previews. Not shipped today.", from: 36, to: 146, side: "top" }]}>
      {() => <div style={{ position: "absolute", left: 0, right: 0, bottom: 60, textAlign: "center", fontFamily, color: TXT, opacity: o, fontSize: 30, fontWeight: 600, textShadow: "0 4px 30px #000" }}>Concept visualization. Not representative of currently shipped functionality.</div>}
    </Product>
  );
};

const S9: React.FC = () => {
  const f = useF(); const ov = (tl.voice as any[])[2]; const vl = ov.start - (tl.scenes as any).S9.start;
  const p = spring({ frame: f - 8, fps: 30, config: { damping: 18, stiffness: 100 } });
  const t1 = interpolate(f, [34, 56], [0, 1], clamp), t2 = interpolate(f, [vl, vl + 16], [0, 1], clamp), t3 = interpolate(f, [vl + 50, vl + 74], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: BG, alignItems: "center", justifyContent: "center", fontFamily }}>
      <Backdrop shot="02-con-home" />
      {f >= vl && f <= vl + ov.dur && [0, 1, 2].map((i) => { const ph = ((f - vl + i * 14) % 42) / 42; const sz = 220 * (1 + ph * 2.4); return <div key={i} style={{ position: "absolute", left: 960 - sz / 2, top: 360 - sz / 2, width: sz, height: sz, borderRadius: "50%", border: `3px solid ${ACC}`, opacity: (1 - ph) * 0.6 }} />; })}
      <div style={{ position: "absolute", top: 250, left: 860, width: 200, height: 200, transform: `scale(${0.7 + 0.3 * p})`, opacity: p, filter: `drop-shadow(0 0 40px ${ACC}aa)` }}><Img src={staticFile("logo.svg")} style={{ width: 200, height: 200 }} /></div>
      <div style={{ position: "absolute", top: 500, textAlign: "center", width: "100%" }}>
        <div style={{ fontSize: 40, letterSpacing: ".4em", fontWeight: 800, color: TXT, opacity: t1 }}>NEXEN ENTERPRISE V1</div>
        <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: "-.03em", color: TXT, marginTop: 30, opacity: t2, transform: `translateY(${(1 - t2) * 20}px)` }}>Open. Understand. <span style={{ color: ACC }}>Ask MARVIN.</span></div>
        <div style={{ fontSize: 24, color: SOFT, marginTop: 60, letterSpacing: ".06em", opacity: t3 }}>Demo data. Simulated responses. Concept features are future development.</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- composition ---------- */
export const Teaser: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <SceneWrap k="S0"><S0 /></SceneWrap>
    <SceneWrap k="S1"><S1 /></SceneWrap>
    <SceneWrap k="S2"><S2 /></SceneWrap>
    <SceneWrap k="S3"><S3 /></SceneWrap>
    <SceneWrap k="S4"><S4 /></SceneWrap>
    <SceneWrap k="S5"><S5 /></SceneWrap>
    <SceneWrap k="S6"><S6 /></SceneWrap>
    <SceneWrap k="S7"><S7 /></SceneWrap>
    <SceneWrap k="S8"><S8 /></SceneWrap>
    <SceneWrap k="S9"><S9 /></SceneWrap>
    {/* Studio preview audio. The final mix is built by scripts/build.js with FFmpeg from the same timeline. */}
    <Audio src={staticFile((tl.music as any).file)} volume={0.2} />
    {(tl.voice as any[]).map((v) => <Sequence key={v.id} from={v.start}><Audio src={staticFile(v.file)} /></Sequence>)}
  </AbsoluteFill>
);
