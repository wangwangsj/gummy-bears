/* shared/sim.mjs - the authoritative, headless run of one level.
   Fixed 1/300 s ticks; the same Bear / PBD solver and level machinery as the browser game.
   Scoring, cutting, strands, zones and the end of the run live here, not in a render frame.
   Presentation (sound, particles, hit-stop, camera shake) is only *described* by events with
   an `fx` hint; nothing here reads or slows the clock because of it.

   States
     intro  reserved for the client (camera tour); a run never reports it
     aim    created here.  step() is a no-op: sim time starts at launch, so a recorded
            command {vx, vy} alone replays exactly (machine phase is t = 0 at launch)
     fly    after launch(); includes the short settle once the goal zone is reached
     over   result() is final; step() / launch() no longer do anything useful */
import { Bear, RIG, solve } from "./physics.mjs";
import { createWorld, collideWorld, poseAll } from "./world.mjs";
import { OFFICIAL_LEVELS, levelById, validateLevel } from "./levels.mjs";
import {
  RULES_VERSION, TICK_DT, SCORE_EVERY, SCORE_DT, MAX_RUN_TICKS, FLY_TIMEOUT, PHYSICS_BASE, LAUNCH_PHYSICS,
  POINT_NAMES, BONE_OF, PART_OF, PART_MUL, BONE_SIDE, createRng, checkSeed, normalizeConfig, checkCommand, FREEZE_S,
  starsFor,
} from "./rules.mjs";

export const STATES = Object.freeze(["intro", "aim", "fly", "over"]);
export { RULES_VERSION };

const liveMass = (b) => { let s = 0; for (let i = 0; i < b.n; i++) s += RIG.mass[i]; return s; };

function resolveLevel(level) {
  const lv = typeof level === "string" ? levelById(level) : level;
  if (!lv) throw new RangeError(`unknown level ${String(level)}`);
  return validateLevel(lv);
}

export function createRun({ level, seed, config, flavour = 0 } = {}) {
  const lv = resolveLevel(level);
  checkSeed(seed);
  const cfgUser = normalizeConfig(config);
  const rng = createRng(seed);

  const cfg = { ...PHYSICS_BASE, wobble: cfgUser.wobble, world: true, maxV2: PHYSICS_BASE.maxV * PHYSICS_BASE.maxV };
  const world = createWorld(lv, cfgUser.bounce);
  const env = { cfg, rng, collideWorld: (b, h) => collideWorld(world, b, h) };
  const bear = new Bear(env, lv.start[0], lv.start[1] - RIG.minY + 0.01, 0, 0, flavour | 0);
  bear.hopCool = 1e9;

  const run = {
    state: "aim", tick: 0, waitTicks: 0, done: false, reason: null, goal: false,
    score: 0, impact: 0, stretch: 0, bonus: 0, maxHit: 0, combo: 0, bestCombo: 1, lastHit: -9,
    pv: [0, 0], ev: 0, flyT: 0, still: 0, endT: 0, strPop: -9, lost: 0, grindT: 0,
    anchor: null, anchorT: 0, cut: new Set(), seq: 0, events: [],
  };
  const time = () => run.tick * TICK_DT;
  // the machines' clock: it starts where the player released, and with the freeze prop it
  // stands still for the first FREEZE_S seconds of flight before running on from there
  const freezeTicks = cfgUser.props?.includes("freeze") ? Math.round(FREEZE_S / TICK_DT) : 0;
  const machineTick = () => run.waitTicks + Math.max(0, run.tick - freezeTicks);
  function syncMachines() {
    const hold = run.tick < freezeTicks;
    if (hold !== !!world.hold) { world.hold = hold; world.t = -1; }
    world.simT = machineTick() * TICK_DT;
  }
  const emit = (type, data) => run.events.push({ seq: run.seq++, tick: run.tick, t: time(), type, ...data });
  const at = (i) => [bear.p[i * 3], bear.p[i * 3 + 1], bear.p[i * 3 + 2]];

  /* ---- helpers ported from parts/game.js ---- */
  function mainC() {
    if (!bear.segs) return bear.centre();
    let best = 0;
    bear.segs.forEach((s, k) => { if (s.mass > bear.segs[best].mass) best = k; });
    return bear.segCentre(best);
  }
  function chain() {
    run.combo = time() - run.lastHit < 0.9 ? run.combo + 1 : 1;
    run.lastHit = time();
    run.bestCombo = Math.max(run.bestCombo, run.combo);
    return Math.min(3, 1 + 0.25 * (run.combo - 1));
  }
  const addPts = (n, kind) => { run.score += n; run[kind] += n; };
  function strainOf() {
    let s = 1;
    for (let li = 0; li < RIG.links.length; li++) {
      if (!bear.lk[li]) continue;
      const Lk = RIG.links[li], a = Lk.i * 3, c = Lk.j * 3;
      s = Math.max(s, Math.hypot(bear.p[a] - bear.p[c], bear.p[a + 1] - bear.p[c + 1], bear.p[a + 2] - bear.p[c + 2]) / Lk.rest);
    }
    return s;
  }
  function partName() {
    const nm = POINT_NAMES[bear.hitPart] || "body", grp = PART_OF[nm];
    const fromBelow = bear.hitNy > 0.6, upright = bear.up[1] > 0.4;
    if (grp === "body" && fromBelow && upright) return "butt";
    if (grp === "leg" && fromBelow && upright) return "land";
    return grp;
  }
  /* `up` is normally refreshed by the renderer's head frame; without a view, derive it the same way */
  function refreshUp() {
    const hd = RIG.idx.head * 3, bd = RIG.idx.body * 3, el = RIG.idx.earL * 3, er = RIG.idx.earR * 3, p = bear.p;
    let ux, uy, uz;
    const whole = (i) => !bear.segs || bear.seg[i / 3] === bear.seg[RIG.idx.head];
    if (whole(bd) && bear.lk[0]) { ux = p[hd] - p[bd]; uy = p[hd + 1] - p[bd + 1]; uz = p[hd + 2] - p[bd + 2]; }
    else if (whole(el) && whole(er)) {
      ux = (p[el] + p[er]) / 2 - p[hd]; uy = (p[el + 1] + p[er + 1]) / 2 - p[hd + 1]; uz = (p[el + 2] + p[er + 2]) / 2 - p[hd + 2];
    } else return;
    const l = Math.hypot(ux, uy, uz) || 1;
    bear.up[0] = ux / l; bear.up[1] = uy / l; bear.up[2] = uz / l;
  }

  function cutBone(bone, atPoint, strand = true) {
    if (run.cut.has(bone)) return false;
    const side = BONE_SIDE[bone];
    run.cut.add(bone);
    const res = bear.cutWhere((i, j) => side.has(i) !== side.has(j), strand);
    if (!res) return false;
    if (typeof res === "object") { res.bone = bone; res.t = time(); }
    run.lost++;
    // the severed piece springs off the stump
    let sx = 0, sy = 0, sm = 0, rx = 0, ry = 0, rm = 0;
    for (let i = 0; i < bear.n; i++) {
      const w = RIG.mass[i];
      if (side.has(i)) { sx += bear.p[i * 3] * w; sy += bear.p[i * 3 + 1] * w; sm += w; } else { rx += bear.p[i * 3] * w; ry += bear.p[i * 3 + 1] * w; rm += w; }
    }
    if (sm && rm) {
      let dx = sx / sm - rx / rm, dy = sy / sm - ry / rm; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      for (let i = 0; i < bear.n; i++) {
        const s = side.has(i) ? 2.6 : -0.6, k = i * 3;
        bear.q[k] -= dx * s * cfg.subH; bear.q[k + 1] -= (dy * s + (side.has(i) ? 1.5 : 0)) * cfg.subH;
      }
    }
    const pi = atPoint ?? [...side][0];
    emit("cut", { bone, point: pi, at: at(pi), strand: typeof res === "object" });
    for (const i of side) bear.flash[i] = 1;
    return true;
  }
  function snapStrand(S) {
    const k = bear.strands.indexOf(S);
    if (k < 0) return;
    bear.strands.splice(k, 1);
    const a = S.i * 3, c = S.j * 3;
    const mid = [(bear.p[a] + bear.p[c]) / 2, (bear.p[a + 1] + bear.p[c + 1]) / 2, (bear.p[a + 2] + bear.p[c + 2]) / 2];
    const pts = Math.round(140 * chain()); addPts(pts, "bonus");
    emit("snap", { bone: S.bone, pts, at: mid });
  }
  function burst() {
    for (const bone of Object.keys(BONE_SIDE)) cutBone(bone, undefined, false);
    bear.strands.length = 0;
    for (let i = 0; i < bear.n; i++) { bear.flash[i] = 1; bear.dmg[i] = Math.max(bear.dmg[i], 0.7); }
  }
  function endRun(why) {
    if (run.done) return;
    run.done = true; run.state = "over";
    run.reason = run.goal ? "goal" : (why || "stuck");
    emit("end", { reason: run.reason, goal: run.goal, score: run.score, stars: starsFor(lv, run.score, run.goal) });
  }

  /* ---- scoring, at SCORE_EVERY ticks (the browser's 60 Hz frame).  parts/game.js scoreFrame ---- */
  function scoreStep(dt) {
    const b = bear, simT = time();
    refreshUp();
    let vx = 0, vy = 0;
    for (let i = 0; i < b.n; i++) { const m = RIG.mass[i]; vx += (b.p[i * 3] - b.q[i * 3]) * m; vy += (b.p[i * 3 + 1] - b.q[i * 3 + 1]) * m; }
    const M = liveMass(b); vx /= M * cfg.subH; vy /= M * cfg.subH;
    const pv = run.pv; run.pv = [vx, vy];
    // impacts: how hard the bear's own velocity was changed (gravity subtracted), summed over the frames a collision takes
    const dv = Math.hypot(vx - pv[0], vy - pv[1] - cfg.gravity * dt);
    if (dv > 1.4) run.ev += dv;
    else if (run.ev > 0) {
      const ev = run.ev; run.ev = 0;
      const part = partName();
      const raw = Math.min(900, RIG.coreMass * ev * ev * 0.3) * PART_MUL[part];
      run.maxHit = Math.max(run.maxHit, ev);
      const hp = b.hitPart, hn = [b.hitNx, b.hitNy];
      b.hitSp = 0;
      if (ev > 26 && run.cut.size < 6) {                       // too hard: the whole bear bursts
        const pts = Math.round(900 * chain());
        addPts(pts, "bonus"); burst();
        emit("burst", { pts, ev, at: mainC(), fx: { freeze: 0.14, slow: 0.6, shake: 0.6 } });
      } else if (raw >= 14) {
        const pts = Math.round(raw * chain());
        addPts(pts, "impact");
        const fx = raw >= 300 ? { freeze: 0.09, slow: 0.4, shake: 0.4 } : raw >= 60 ? { freeze: 0.045, shake: 0.15 } : {};
        emit("impact", { raw, pts, ev, part, point: Math.max(0, hp), at: at(Math.max(0, hp)), normal: hn, fx });
      }
    }
    // stretch: points for every second spent pulled long
    const s = strainOf();
    if (s > 1.08) {
      addPts(Math.round((s - 1.08) * dt * 1400), "stretch");
      if (s > 1.4 && simT - run.strPop > 1.2) {
        run.strPop = simT;
        const pts = Math.round(s * 20); addPts(pts, "bonus");
        emit("stretch", { pts, strain: s });
      }
    }
    // a part that has taken enough hits snaps off
    for (const [bone, side] of Object.entries(BONE_SIDE)) {
      if (run.cut.has(bone)) continue;
      let d = 0; for (const i of side) d = Math.max(d, b.dmg[i]);
      if (d >= 1 && cutBone(bone)) {
        b.flash.fill(0.6);
        const pts = Math.round(250 * chain()); addPts(pts, "bonus");
        emit("break", { bone, pts, fx: { freeze: 0.07 } });
      }
    }
    // strands that have been pulled too far let go
    for (const S of b.strands.slice()) if (S.len > S.rest * 4.2) snapStrand(S);
    // blades
    const cuts = world.cuts;
    for (let k = 0; k < cuts.length; k += 2) {
      const i = cuts[k], P = cuts[k + 1], bone = BONE_OF[POINT_NAMES[i]];
      if (P.kind === "grind") continue;
      if (run.cut.has(bone)) {                                 // already hanging by a string: this one cuts it
        const S = b.strands.find((x) => x.bone === bone && (x.i === i || x.j === i));
        if (S && simT - (S.t || 0) > 0.4) snapStrand(S);
        continue;
      }
      if (cutBone(bone, i)) {
        const pts = Math.round(Math.max(150, P.pts) * chain()); addPts(pts, "bonus");
        emit("slice", { bone, pts, part: P.index, fx: { freeze: 0.08, slow: 0.35, shake: 0.3 } });
      }
    }
    cuts.length = 0;
    // breakables smashed this window: paid once (pts), chained like any other hit
    for (const P of world.breaks) {
      const pts = Math.round((P.pts || 0) * chain());
      addPts(pts, "bonus");
      const contact = P.breakImpact;
      emit("smash", { kind: P.t, part: P.index, pts, at: [P.cx, P.cy, 0],
        impact: contact ? { normal: [...contact.normal], velocity: [...contact.velocity], point: [...contact.point], speed: contact.speed } : null,
        surface: contact ? { ...contact.surface } : null,
        fx: { freeze: 0.05, shake: 0.2 } });
    }
    world.breaks.length = 0;
    // collectible stars: touched by any mass point, once each, flat pts
    for (const C of world.collectibles) {
      if (C.hit) continue;
      for (let i = 0; i < b.n; i++) {
        if (Math.hypot(b.p[i * 3] - C.x, b.p[i * 3 + 1] - C.y) < 0.45 + RIG.col[i] * 0.6) {
          C.hit = true; addPts(C.pts, "bonus");
          emit("collect", { index: C.index, pts: C.pts, at: [C.x, C.y, 0] });
          break;
        }
      }
    }
    // contraptions
    for (const P of world.events) {
      const pts = Math.round(P.pts * chain());
      addPts(pts, "bonus");
      const kind = P.kind || P.t;
      const heavy = kind === "press" || kind === "crusher";
      emit("contraption", { kind, part: P.index, pts, at: mainC(), fx: heavy ? { freeze: 0.06, shake: 0.3 } : {} });
    }
    world.events.length = 0;
    // zones
    const c = mainC();
    for (const Z of world.zones) {
      if (c[0] < Z.x0 || c[0] > Z.x1 || c[1] < Z.y0 || c[1] > Z.y1) continue;
      if (Z.kind === "syrup") for (let i = 0; i < b.n * 3; i++) b.q[i] = b.p[i] - (b.p[i] - b.q[i]) * 0.82;   // thick
      if (Z.kind === "grinder") {
        // the grinder takes it apart one bone at a time, and pays for each
        run.grindT -= dt;
        if (run.grindT <= 0) {
          run.grindT = 0.28;
          const left = Object.keys(BONE_SIDE).filter((k) => !run.cut.has(k));
          if (left.length) {
            const bone = left[Math.floor(rng() * left.length)];
            cutBone(bone, undefined, false);
            b.strands.length = 0;
            const pts = Math.round(160 * chain()); addPts(pts, "bonus");
            emit("grind", { bone, pts, at: c, fx: { shake: 0.18 } });
          } else {
            const pts = Math.round(60 * chain()); addPts(pts, "bonus");
            emit("grind", { bone: null, pts, at: c, fx: { shake: 0.18 } });
          }
        }
      }
      if (!Z.hit && !run.goal) {
        Z.hit = true;
        const pts = Math.round(Z.pts * chain());
        addPts(pts, "bonus");
        emit("zone", { kind: Z.kind, zone: Z.index, goal: !!Z.goal, pts });
        if (Z.goal) { run.goal = true; run.endT = Z.kind === "grinder" ? 2.6 : 1.4; emit("goal", { zone: Z.index }); }
      }
    }
    if (run.combo > 1 && simT - run.lastHit > 0.9) run.combo = 0;

    // the end of a run: goal settled, or the bear left the factory / jammed / ran out of time
    run.flyT += dt;
    let v = 0;
    for (let i = 0; i < b.n * 3; i++) v = Math.max(v, Math.abs(b.p[i] - b.q[i]));
    run.still = v / cfg.subH < 0.9 ? run.still + dt : 0;
    const [x0, x1] = lv.span, c2 = mainC();
    if (run.goal) { run.endT -= dt; if (run.endT <= 0) endRun(); return; }
    if (c2[0] < x0 - 1.5 || c2[0] > x1 + 1.5) return endRun("out");
    // or it is jammed somewhere (rollers keep it jiggling, so it never reads as still)
    if (!run.anchor || Math.hypot(c2[0] - run.anchor[0], c2[1] - run.anchor[1]) > 0.4) { run.anchor = c2; run.anchorT = 0; }
    else run.anchorT += dt;
    if ((run.flyT > 0.8 && run.still > 1.0) || (run.flyT > 1 && run.anchorT > 1.8)) return endRun("stuck");
    if (run.flyT > FLY_TIMEOUT) return endRun("time");
  }

  /* ---- public surface ---- */
  function launch(cmd) {
    if (run.state !== "aim") throw new Error(`launch() needs state "aim", run is "${run.state}"`);
    const { vx, vy, waitTicks = 0 } = checkCommand(cmd, cfgUser);
    run.waitTicks = waitTicks; world.t = -1; syncMachines(); poseAll(world);
    const b = bear, h = cfg.subH, c = b.centre();
    cfg.upright = LAUNCH_PHYSICS.upright; cfg.maxV = LAUNCH_PHYSICS.maxV; cfg.maxV2 = cfg.maxV * cfg.maxV; cfg.air = LAUNCH_PHYSICS.air;
    cfg.restitution = LAUNCH_PHYSICS.restitutionBase + LAUNCH_PHYSICS.restitutionPerBounce * cfgUser.bounce;
    b.idle = 0;                                                 // an idle bear's damping would eat a third of the throw
    const spin = -Math.sign(vx || 1) * LAUNCH_PHYSICS.spin;     // a little tumble reads better than a dart
    for (let i = 0; i < b.n; i++) {
      const k = i * 3, rx = b.p[k] - c[0], ry = b.p[k + 1] - c[1];
      b.q[k] = b.p[k] - (vx - spin * ry) * h;
      b.q[k + 1] = b.p[k + 1] - (vy + spin * rx) * h;
      b.q[k + 2] = b.p[k + 2];
    }
    let mx = 0, my = 0;
    for (let i = 0; i < b.n; i++) { mx += (b.p[i * 3] - b.q[i * 3]) * RIG.mass[i]; my += (b.p[i * 3 + 1] - b.q[i * 3 + 1]) * RIG.mass[i]; }
    run.pv = [mx / (liveMass(b) * h), my / (liveMass(b) * h)]; run.ev = 0;
    run.state = "fly"; run.flyT = 0;
    emit("launch", { vx, vy });
  }

  function tickOnce() {
    syncMachines();
    bear.step(TICK_DT, solve(cfg));
    run.tick++;
    syncMachines();
    if (run.tick % SCORE_EVERY === 0) scoreStep(SCORE_DT);
    if (!run.done && run.tick >= MAX_RUN_TICKS) endRun("time");
  }
  function step(count = 1) {
    if (!Number.isInteger(count) || count < 0 || count > MAX_RUN_TICKS) throw new RangeError(`step(count): integer 0..${MAX_RUN_TICKS}`);
    for (let n = 0; n < count && run.state === "fly"; n++) tickOnce();
    return run.tick;
  }

  const arr = (a) => Array.from(a);
  function snapshot() {
    syncMachines();
    poseAll(world);
    const events = run.events; run.events = [];                 // consumed exactly once; step() never drops them
    return {
      rules: RULES_VERSION, levelId: lv.id, t: time(), tick: run.tick, state: run.state, score: run.score, goal: run.goal,
      bears: [{
        id: "bear-0", n: bear.n, p: arr(bear.p), q: arr(bear.q), flavour: bear.f,
        segments: arr(bear.seg), links: arr(bear.lk),
        strands: bear.strands.map((S) => ({ i: S.i, j: S.j, rest: S.rest, len: S.len || 0, bone: S.bone || null })),
        dmg: arr(bear.dmg), flash: arr(bear.flash), cut: [...run.cut],
        // names the original View reads (Bear.lk / seg / segs / up); same data as links / segments
        lk: arr(bear.lk), seg: arr(bear.seg), up: arr(bear.up),
        segs: bear.segs ? bear.segs.map((s) => ({ ids: arr(s.ids), n: s.n, mass: s.mass })) : null,
      }],
      physT: world.simT, machineTick: machineTick(), frozen: !!world.hold,
      run: { impact: run.impact, stretch: run.stretch, bonus: run.bonus, maxHit: run.maxHit, lost: run.lost, bestCombo: run.bestCombo, combo: run.combo },
      collectibles: world.collectibles.map((C) => ({ index: C.index, x: C.x, y: C.y, pts: C.pts, hit: C.hit })),
      brokenParts: world.parts.filter((P) => P.broken).map((P) => P.index),
      parts: world.parts.map((P) => ({ index: P.index, t: P.t, cx: P.cx, cy: P.cy, ang: P.ang, pulse: P.pulse, broken: P.broken })),
      zones: world.zones.map((Z) => ({ index: Z.index, hit: Z.hit })),
      events,
    };
  }
  function result() {
    return {
      done: run.done, goal: run.goal, score: run.score,
      stars: run.done ? starsFor(lv, run.score, run.goal) : 0,
      reason: run.reason, ticks: run.tick,
      breakdown: { impact: run.impact, stretch: run.stretch, bonus: run.bonus, maxHit: run.maxHit, lost: run.lost, bestCombo: run.bestCombo },
      rules: RULES_VERSION, levelId: lv.id,
    };
  }
  return { launch, step, snapshot, result, get state() { return run.state; }, config: cfgUser, level: lv };
}

/* one whole run: launch, then tick until the run ends (never more than MAX_RUN_TICKS) */
export function simulateRun({ level, seed, config, command, flavour } = {}) {
  const r = createRun({ level, seed, config, flavour });
  r.launch(command);
  while (!r.result().done) r.step(300);
  return r.result();
}

export { OFFICIAL_LEVELS };
