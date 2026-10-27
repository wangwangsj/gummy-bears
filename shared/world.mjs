/* shared/world.mjs - level machinery: part kinematics + contact against the bear's mass points.
   Ported from parts/game.js (slam / pose / touchCircle / touchBox / collideWorld / partHit).
   The page globals it used (simT, GAME.cuts, GAME.events, gSave.up.bounce) live on the world
   object instead, so a run owns all of its state.  No DOM, no THREE. */
import { RIG } from "./physics.mjs";

export const DEPTH = 0.65;                 // the glass panes, front and back

export function slam(P, t) {
  const ph = ((t / P.period + P.off) % 1 + 1) % 1;
  if (ph < 0.14) { const u = ph / 0.14; return u * u; }                 // slam
  if (ph < 0.34) return 1;                                             // hold
  if (ph < 0.8) { const u = (ph - 0.34) / 0.46; return 1 - u * u * (3 - 2 * u); }   // lift
  return 0;
}
const frac = (v) => ((v % 1) + 1) % 1;
/* the round parts collide as circles; a fan is two crossed arms, everything else one box */
export const ROUND_PARTS = new Set(["roller", "bumper", "saw", "crusher", "pendulum", "meteor"]);
export function pose(P, t) {
  P.cx = P.x; P.cy = P.y; P.vx = 0; P.vy = 0;
  P.om = P.spin || 0; P.ang = (P.a || 0) * Math.PI / 180 + P.om * t;
  if (P.t === "pendulum") {
    // a wrecking ball: pivot (x, y), rod len, swings amp degrees either side; ang = the rod angle
    const w = 2 * Math.PI / P.period, A = P.amp * Math.PI / 180, ph = w * t + (P.off || 0) * 2 * Math.PI;
    const th = A * Math.sin(ph), dth = A * w * Math.cos(ph);
    P.cx = P.x + P.len * Math.sin(th); P.cy = P.y - P.len * Math.cos(th);
    P.vx = P.len * Math.cos(th) * dth; P.vy = P.len * Math.sin(th) * dth;
    P.ang = th; P.om = 0;
  } else if (P.t === "piston") {
    // a block that strokes (dx, dy) out from its rest position and back, eased at both ends
    const w = 2 * Math.PI / P.period, ph = w * t + (P.off || 0) * 2 * Math.PI, s = (1 - Math.cos(ph)) / 2, ds = w * Math.sin(ph) / 2;
    P.cx = P.x + (P.dx || 0) * s; P.cy = P.y + (P.dy || 0) * s;
    P.vx = (P.dx || 0) * ds; P.vy = (P.dy || 0) * ds;
  } else if (P.t === "meteor" || P.t === "arrow") {
    // a projectile on a loop: a meteor falls `fall` (drifting `drift`), an arrow flies `dx`
    const ph = frac(t / P.period + (P.off || 0));
    const dx = P.t === "meteor" ? (P.drift || 0) : (P.dx || 0), dy = P.t === "meteor" ? -P.fall : (P.dy || 0);
    P.cx = P.x + dx * ph; P.cy = P.y + dy * ph; P.vx = dx / P.period; P.vy = dy / P.period;
    if (P.t === "meteor") { P.om = -P.vx / P.r; P.ang = P.om * t; } else P.ang = Math.atan2(dy, dx);
  } else if (P.t === "press" || P.t === "blade") {
    P.cy = P.y - P.amp * slam(P, t);
    P.vy = -P.amp * (slam(P, t + 0.004) - slam(P, t - 0.004)) / 0.008;
  } else if (P.t === "crusher") {
    const w = 2 * Math.PI / P.period, ph = w * t + P.off * 2 * Math.PI;
    P.cx = P.x + P.amp * Math.sin(ph); P.vx = P.amp * w * Math.cos(ph);
    P.om = -P.vx / P.r;                                       // rolls, does not slide
    P.ang = -(P.cx - P.x) / P.r;
  }
}
const C = { nx: 0, ny: 0, pen: 0, vx: 0, vy: 0 };
function touchCircle(P, x, y, r) {
  const dx = x - P.cx, dy = y - P.cy, R = P.r + r, d2 = dx * dx + dy * dy;
  if (d2 >= R * R || d2 < 1e-12) return false;
  const d = Math.sqrt(d2);
  C.nx = dx / d; C.ny = dy / d; C.pen = R - d;
  C.vx = P.vx - P.om * C.ny * P.r; C.vy = P.vy + P.om * C.nx * P.r;
  return true;
}
function touchFan(P, x, y, r) {
  if (touchBox(P, x, y, r)) return true;
  P.ang += Math.PI / 2;                         // the second arm, crossed over the first
  const hit = touchBox(P, x, y, r);
  P.ang -= Math.PI / 2;
  return hit;
}
function touchBox(P, x, y, r) {
  const c = Math.cos(P.ang), s = Math.sin(P.ang);
  const dx = x - P.cx, dy = y - P.cy;
  const lx = c * dx + s * dy, ly = -s * dx + c * dy;          // into the part's frame
  const hw = P.w / 2, hh = P.h / 2;
  const qx = Math.max(-hw, Math.min(hw, lx)), qy = Math.max(-hh, Math.min(hh, ly));
  const ex = lx - qx, ey = ly - qy, d2 = ex * ex + ey * ey;
  let nlx, nly;
  if (d2 > 1e-12) {                                           // outside: rounded corners for free
    if (d2 >= r * r) return false;
    const d = Math.sqrt(d2); nlx = ex / d; nly = ey / d; C.pen = r - d;
  } else {                                                    // centre inside: leave by the nearest face
    const px = hw - Math.abs(lx), py = hh - Math.abs(ly);
    if (px < py) { nlx = lx < 0 ? -1 : 1; nly = 0; C.pen = px + r; } else { nlx = 0; nly = ly < 0 ? -1 : 1; C.pen = py + r; }
  }
  C.nx = c * nlx - s * nly; C.ny = s * nlx + c * nly;
  const rx = x - C.nx * r - P.cx, ry = y - C.ny * r - P.cy;  // contact point, relative to the pivot
  C.vx = P.vx - P.om * ry; C.vy = P.vy + P.om * rx;
  if (P.belt && nly > 0.5) { C.vx += c * P.belt; C.vy += s * P.belt; }
  return true;
}

/* a world is per-run mutable state built from an (immutable) level.
   bounce = the bounce upgrade level (0..5); t = simulated seconds (the owner advances it) */
export function createWorld(level, bounce = 0) {
  const W = { lv: level, parts: [], zones: [], collectibles: [], t: -1, simT: 0, bounce, cuts: [], events: [], breaks: [] };
  (level.collectibles || []).forEach((c, index) => W.collectibles.push({ ...c, index, hit: false }));
  level.parts.forEach((def, index) => {
    const P = { ...def, index, broken: false, round: ROUND_PARTS.has(def.t), off: def.off || 0, last: -9, pulse: 0 };
    pose(P, 0);
    W.parts.push(P);
  });
  (level.zones || []).forEach((z, index) => W.zones.push({ ...z, index, hit: false }));
  return W;
}
export function poseAll(W) {
  if (W.t !== W.simT) {
    for (const P of W.parts) {
      pose(P, W.simT);
      // a frozen machine (freeze prop) keeps its pose and does not move what touches it
      if (W.hold) { P.vx = 0; P.vy = 0; P.om = 0; }
    }
    W.t = W.simT;
  }
}

function partHit(W, P, sp) {
  P.pulse = 1;
  if (!P.pts || W.simT - P.last < (P.t === "crusher" ? 0.9 : 0.35)) return;
  if ((P.t === "press" || P.t === "blade") && P.vy > -1.5) return;   // only a falling press flattens
  P.last = W.simT;
  W.events.push(P);
}

/* called from Bear.collide every substep while a level is loaded: returns the hardest new impact */
export function collideWorld(W, b, h) {
  const p = b.p, q = b.q;
  poseAll(W);
  let hit = 0;
  // which points were already touching a part last substep: a point that stays
  // pressed (resting, sliding, squeezed under a press) is not a new impact
  const was = b.wc || (b.wc = new Uint8Array(RIG.n));   // sized for the stumps too
  const bounce = 0.06 * W.bounce;
  for (let i = 0; i < b.n; i++) {
    const k = i * 3, r0 = RIG.col[i];
    let touching = 0;
    const zl = DEPTH - r0 * 0.4;                              // glass panes: a side-on stage
    if (p[k + 2] > zl || p[k + 2] < -zl) {
      const z = p[k + 2] > 0 ? zl : -zl, vz = p[k + 2] - q[k + 2];
      p[k + 2] = z; q[k + 2] = z + vz * 0.3;
    }
    for (const P of W.parts) {
      if (P.broken) continue;                                  // a smashed pane / jar no longer blocks the way
      const r = r0 * (P.soft || 0.92);
      if (!(P.round ? touchCircle(P, p[k], p[k + 1], r) : P.t === "fan" ? touchFan(P, p[k], p[k + 1], r) : touchBox(P, p[k], p[k + 1], r))) continue;
      if (P.ghost) { W.cuts.push(i, P); P.pulse = 1; continue; }   // a blade goes through: it cuts, it does not stop
      if (P.t === "roller" || P.t === "crusher") {
        // Candy rollers feed the gummy underneath instead of acting like pinball bumpers.
        // The travelling steamroller only presses its underside; fixed rollers also feed a
        // gummy landing on top down through the nip. Never apply the generic bounce below.
        if (P.t === "crusher" && C.ny > -0.35) continue;
        const dx = p[k] - P.cx, R = P.r + r;
        const bottom = P.cy - Math.sqrt(Math.max(0, R * R - dx * dx));
        const vx = p[k] - q[k], vy = p[k + 1] - q[k + 1];
        const sp = Math.max(0, vy / h, C.nx * vx / -h - C.ny * vy / h);
        p[k + 1] = bottom;
        const feed = P.t === "roller" ? Math.max(vx, Math.min(2.4, Math.abs(P.om) * P.r) * h) : vx;
        q[k] = p[k] - feed; q[k + 1] = bottom - Math.min(0, vy);
        touching = 1;
        if (!was[i]) {
          b.bump(i, sp, 0, -1);
          hit = Math.max(hit, sp);
          partHit(W, P, sp);
        }
        continue;
      }
      let vx = p[k] - q[k] - C.vx * h, vy = p[k + 1] - q[k + 1] - C.vy * h;   // relative to the surface
      if (P.hp && (P.t === "glass" || P.t === "jar" || P.t === "crate")) {
        // breakable: a hit at or above hp (m/s along the normal) smashes it in one go and passes through;
        // anything gentler meets it as a solid box
        const spn = -(vx * C.nx + vy * C.ny) / h;
        if (spn >= P.hp) {
          // Presentation evidence only: copy this contact before the shared scratch C is reused.
          // Neither the point velocities nor the pass-through break response are changed.
          P.breakImpact = {
            normal: [C.nx, C.ny, 0],
            velocity: [vx / h, vy / h, (p[k + 2] - q[k + 2]) / h],
            point: [p[k] + C.nx * (C.pen - r), p[k + 1] + C.ny * (C.pen - r), p[k + 2]],
            speed: spn,
            surface: { w: P.w, h: P.h, depth: 1.5, cx: P.cx, cy: P.cy, ang: P.ang },
          };
          P.broken = true; P.pulse = 1; W.breaks.push(P); continue;
        }
      }
      p[k] += C.nx * C.pen; p[k + 1] += C.ny * C.pen;
      const vn = vx * C.nx + vy * C.ny;
      const tx = vx - vn * C.nx, ty = vy - vn * C.ny, mu = P.mu ?? 0.04;
      touching = 1;
      if (P.cut) W.cuts.push(i, P);
      if (vn < 0) {
        const sp = -vn / h, e = Math.min(0.9, (P.e ?? 0.3) + bounce), fresh = !was[i];
        if (fresh) {
          if (sp > hit) hit = sp;
          b.bump(i, sp, C.nx, C.ny);
          if (sp > 1.2) partHit(W, P, sp);
        }
        vx = tx * (1 - mu) - vn * e * C.nx; vy = ty * (1 - mu) - vn * e * C.ny;
        if (P.boost && fresh) { vx += C.nx * P.boost * h; vy += C.ny * P.boost * h; }
      } else { vx -= tx * mu; vy -= ty * mu; }
      q[k] = p[k] - (vx + C.vx * h); q[k + 1] = p[k + 1] - (vy + C.vy * h);
    }
    was[i] = touching;
  }
  return hit;
}
