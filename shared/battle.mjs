/* shared/battle.mjs - pure battle rules: two gummy kings on two platforms throw candy at each other.
   Same Bear / PBD solver and bear<->bear separate() as the campaign, but its OWN cfg object and its
   OWN collideWorld callback (platform slabs, no floor), so nothing here can touch a campaign run.
   No DOM, no THREE, no Math.random, no wall-clock; all randomness from the seeded rng.
   Ticks are fixed 1/300 s.  States: aim (step is a no-op) -> fly (physics runs) -> aim ... -> over. */
import { Bear, RIG, separate, solve } from "./physics.mjs";
import {
  TICK_DT, PHYSICS_BASE, LAUNCH_PHYSICS, POINT_NAMES, BONE_OF, BONE_SIDE, createRng, checkSeed,
} from "./rules.mjs";

export const BATTLE_VERSION = "gummy-battle-1";

export const KINDS = Object.freeze(["soft", "hard", "gum"]);
/* kind -> solver stiffness (Bear.stiff), wobble (solve()), mass scale (contact weighting + damage),
   restitution kick.  This is what makes the three candies behave differently, not their colour. */
export const KIND_PARAMS = Object.freeze({
  king: Object.freeze({ stiff: 1.15, wobble: 0.30, mass: 3.2, flavour: 3 }),
  soft: Object.freeze({ stiff: 0.50, wobble: 0.85, mass: 0.8, flavour: 0 }),
  hard: Object.freeze({ stiff: 1.80, wobble: 0.05, mass: 2.2, flavour: 1 }),
  gum:  Object.freeze({ stiff: 0.85, wobble: 0.55, mass: 1.0, flavour: 2 }),
});
export const BATTLE_RULES = Object.freeze({
  platformX: 5, platformW: 4, platformTop: 0, platformThick: 0.8, platformFriction: 0.05,
  fallY: -2, fieldX: 12, removeY: -6,
  ammoEach: 3, maxEntities: 20, maxSpeed: 15,
  maxFlyTicks: 8 * 300, stillTicks: 180, minFlyTicks: 150,
  hitMin: 2.0, hitGap: 20,
  stability0: 100, stabilityDmgMax: 30, stabilityDmgK: 1.2,
  cutSpeedSoft: 4.5, cutSpeedKing: 9, hardKick: 1.6,
  glueTicks: 3 * 300, glueStiff: 0.35, glueTear: 4, glueMax: 6,
  settleTicks: 150,
});
const R = BATTLE_RULES;
const restitution = (ka, kb) => {
  const k = [ka, kb].sort().join("+");
  return { "hard+hard": 0.5, "hard+king": 0.2, "hard+soft": 0.25, "gum+hard": 0.15, "gum+soft": 0.85,
    "soft+soft": 0.3, "king+soft": 0.3, "gum+king": 0.15, "gum+gum": 0.2, "king+king": 0.1 }[k] ?? 0.2;
};

export function createBattle(opts = {}) {
  const { seed = 1, scenario = null } = opts;
  checkSeed(seed);
  let S = build(seed, scenario);
  return {
    snapshot: () => S.snapshot(),
    command: (c) => S.command(c),
    step: (n) => S.step(n),
    result: () => S.result(),
    reset: (s = seed) => { checkSeed(s); S = build(s, scenario); },
  };
}

function build(seed, scenario) {
  const rng = createRng(seed);
  const cfg = {
    ...PHYSICS_BASE, world: true, floorY: -1e9, upright: LAUNCH_PHYSICS.upright + 0.1,
    maxV: LAUNCH_PHYSICS.maxV, air: LAUNCH_PHYSICS.air, restitution: 0.3,
    maxV2: LAUNCH_PHYSICS.maxV * LAUNCH_PHYSICS.maxV,
  };
  const h = cfg.subH;
  const solvers = Object.fromEntries(Object.entries(KIND_PARAMS).map(([k, p]) => [k, solve({ ...cfg, wobble: p.wobble })]));
  const plats = [-1, 1].map((s) => ({ x0: s * R.platformX - R.platformW / 2, x1: s * R.platformX + R.platformW / 2,
    y0: R.platformTop - R.platformThick, y1: R.platformTop }));

  /* sphere vs slab, for every mass point, like the floor in Bear.collide */
  function collidePlatforms(b, hh) {
    const p = b.p, q = b.q;
    let hit = 0;
    for (let i = 0; i < b.n; i++) {
      const k = i * 3, r = RIG.col[i];
      for (const pl of plats) {
        const cx = Math.min(pl.x1, Math.max(pl.x0, p[k])), cy = Math.min(pl.y1, Math.max(pl.y0, p[k + 1]));
        let dx = p[k] - cx, dy = p[k + 1] - cy, d = Math.hypot(dx, dy), nx, ny, pen;
        if (d > 1e-6) { if (d >= r) continue; nx = dx / d; ny = dy / d; pen = r - d; }
        else {                                              // centre inside the slab: leave by the nearest face
          const f = [[p[k] - pl.x0, -1, 0], [pl.x1 - p[k], 1, 0], [p[k + 1] - pl.y0, 0, -1], [pl.y1 - p[k + 1], 0, 1]]
            .sort((a, c) => a[0] - c[0])[0];
          nx = f[1]; ny = f[2]; pen = f[0] + r;
        }
        const vx = p[k] - q[k], vy = p[k + 1] - q[k + 1];
        p[k] += nx * pen; p[k + 1] += ny * pen;
        const vn = vx * nx + vy * ny;
        if (vn < 0) {
          const tx = vx - vn * nx, ty = vy - vn * ny, e = cfg.restitution, fr = 1 - R.platformFriction;
          q[k] = p[k] - (tx * fr - e * vn * nx);
          q[k + 1] = p[k + 1] - (ty * fr - e * vn * ny);
          q[k + 2] = p[k + 2] - (p[k + 2] - q[k + 2]) * fr;
          hit = Math.max(hit, -vn / hh);
          b.bump(i, -vn / hh, nx, ny);
        } else { q[k] += nx * pen; q[k + 1] += ny * pen; }
      }
    }
    return hit;
  }
  const env = { cfg, rng, collideWorld: collidePlatforms };

  const st = {
    tick: 0, flyT: 0, still: 0, state: "aim", turn: 0, turnNo: 0, done: false, winner: null, reason: null,
    seq: 0, events: [], nextId: 0, nextGlue: 0, thrown: 0,
  };
  const inventory = [0, 1].map(() => ({ soft: R.ammoEach, hard: R.ammoEach, gum: R.ammoEach }));
  const stability = [R.stability0, R.stability0];
  const bears = [], glue = [], contactAt = new Map(), actions = new Map();
  const emit = (type, data) => st.events.push({ seq: st.seq++, tick: st.tick, t: st.tick * h, type, ...data });

  function spawn(owner, kind, king, x, y, vx = 0, vy = 0, spin = 0) {
    const P = KIND_PARAMS[king ? "king" : kind];
    const b = new Bear(env, x, y - RIG.minY + 0.01, 0, 0, P.flavour, 0, 0, 0);
    b.hopCool = 1e9; b.stiff = P.stiff;
    b.id = king ? `king-${owner}` : `b${st.nextId++}`;
    b.owner = owner; b.kind = king ? "king" : kind; b.king = king; b.massScale = P.mass; b.cut = new Set();
    b.sk = king ? "king" : kind;
    if (vx || vy || spin) {
      const c = b.centre();
      for (let i = 0; i < b.n; i++) {
        const k = i * 3, rx = b.p[k] - c[0], ry = b.p[k + 1] - c[1];
        b.q[k] = b.p[k] - (vx - spin * ry) * h; b.q[k + 1] = b.p[k + 1] - (vy + spin * rx) * h;
      }
    }
    bears.push(b);
    return b;
  }
  const byId = (id) => bears.find((b) => b.id === id);

  /* ---- glue: a limited-time distance constraint between two different bears ---- */
  function endGlue(g, reason) {
    const k = glue.indexOf(g);
    if (k < 0) return;
    glue.splice(k, 1);
    emit("glue-end", { id: g.id, reason });
  }
  function addGlue(a, b, ia, ib) {
    if (glue.length >= R.glueMax || glue.some((g) => (g.a === a && g.b === b) || (g.a === b && g.b === a))) return;
    const A = ia * 3, B = ib * 3;
    const rest = Math.hypot(a.p[A] - b.p[B], a.p[A + 1] - b.p[B + 1], a.p[A + 2] - b.p[B + 2]);
    const g = { id: `g${st.nextGlue++}`, a, b, ia, ib, rest, born: st.tick, ttl: R.glueTicks, len: rest };
    glue.push(g);
    emit("glue", { id: g.id, a: a.id, b: b.id, ia, ib });
  }
  function applyGlue() {
    for (const g of glue.slice()) {
      if (st.tick - g.born >= g.ttl) { endGlue(g, "time"); continue; }
      const A = g.ia * 3, B = g.ib * 3, pa = g.a.p, pb = g.b.p;
      const dx = pa[A] - pb[B], dy = pa[A + 1] - pb[B + 1], dz = pa[A + 2] - pb[B + 2], d = Math.hypot(dx, dy, dz);
      g.len = d;
      if (d > g.rest * R.glueTear + 0.5) { endGlue(g, "torn"); continue; }
      if (d < 1e-6 || d <= g.rest) continue;
      const wa = RIG.inv[g.ia] / g.a.massScale, wb = RIG.inv[g.ib] / g.b.massScale;
      const s = (R.glueStiff * (d - g.rest)) / (d * (wa + wb));
      pa[A] -= dx * s * wa; pa[A + 1] -= dy * s * wa; pa[A + 2] -= dz * s * wa;
      pb[B] += dx * s * wb; pb[B + 1] += dy * s * wb; pb[B + 2] += dz * s * wb;
    }
  }
  const dropGlueOf = (b, reason) => { for (const g of glue.slice()) if (g.a === b || g.b === b) endGlue(g, reason); };

  /* ---- hard strike: cut the limb nearest the contact ---- */
  function cutNear(target, pt, cx, cy, speed) {
    const cands = { armL: "handL", armR: "handR", legL: "footL", legR: "footR", neck: "head" };
    let bone = BONE_OF[POINT_NAMES[pt]];
    if (!cands[bone]) {
      let best = 1e9;
      for (const [bn, pn] of Object.entries(cands)) {
        const k = RIG.idx[pn] * 3, d = Math.hypot(target.p[k] - cx, target.p[k + 1] - cy);
        if (!target.cut.has(bn) && d < best) { best = d; bone = bn; }
      }
    }
    if (!cands[bone] || target.cut.has(bone)) return false;
    const side = BONE_SIDE[bone];
    target.cut.add(bone);
    if (!target.cutWhere((i, j) => side.has(i) !== side.has(j), true)) return false;
    for (const i of side) target.flash[i] = 1;
    emit("cut", { target: target.id, bone, speed });
    return true;
  }

  /* ---- bear<->bear contact: detect, resolve with real separate(), reweight by mass, react ---- */
  function aabb(b) {
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (let i = 0; i < b.n; i++) {
      const x = b.p[i * 3], y = b.p[i * 3 + 1];
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    return [x0 - 0.3, x1 + 0.3, y0 - 0.3, y1 + 0.3];
  }
  function contact(a, b, ba, bb) {
    if (ba[1] < bb[0] || bb[1] < ba[0] || ba[3] < bb[2] || bb[3] < ba[2]) return;
    const pa = a.p, pb = b.p, qa = a.q, qb = b.q;
    let best = -1e9, ia = -1, ib = -1, nx = 0, ny = 1, any = false;
    for (let i = 0; i < a.n; i++) for (let j = 0; j < b.n; j++) {
      const A = i * 3, B = j * 3, min = RIG.col[i] + RIG.col[j];
      const dx = pa[A] - pb[B], dy = pa[A + 1] - pb[B + 1], dz = pa[A + 2] - pb[B + 2], d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > min * min || d2 < 1e-9) continue;
      any = true;
      const d = Math.sqrt(d2), ux = dx / d, uy = dy / d, uz = dz / d;
      const vn = -(((pa[A] - qa[A]) - (pb[B] - qb[B])) * ux + ((pa[A + 1] - qa[A + 1]) - (pb[B + 1] - qb[B + 1])) * uy +
        ((pa[A + 2] - qa[A + 2]) - (pb[B + 2] - qb[B + 2])) * uz) / h;
      if (vn > best) { best = vn; ia = i; ib = j; nx = ux; ny = uy; }
    }
    if (!any) return;
    const key = a.id + "|" + b.id, last = contactAt.get(key) ?? -1e9;
    contactAt.set(key, st.tick);
    const p0a = Float32Array.from(pa), p0b = Float32Array.from(pb);
    separate(a, b);
    // mass weighting: separate() splits the correction by equal rig masses; re-split by the bears' real masses
    const wa = 2 * (1 / a.massScale) / (1 / a.massScale + 1 / b.massScale), wb = 2 - wa;
    for (let i = 0; i < pa.length; i++) { pa[i] = p0a[i] + (pa[i] - p0a[i]) * wa; pb[i] = p0b[i] + (pb[i] - p0b[i]) * wb; }
    if (st.tick - last <= R.hitGap || best < R.hitMin) return;
    onHit(a, b, best, ia, ib, nx, ny);
  }
  function kick(b, dvx, dvy) {
    for (let i = 0; i < b.n; i++) { b.q[i * 3] -= dvx * h; b.q[i * 3 + 1] -= dvy * h; }
  }
  function onHit(a, b, s, ia, ib, nx, ny) {
    const ma = a.massScale, mb = b.massScale;
    let e = restitution(a.sk, b.sk);
    const hardHitsSoft = (a.sk === "hard" && (b.sk === "soft" || b.sk === "king")) || (b.sk === "hard" && (a.sk === "soft" || a.sk === "king"));
    if (hardHitsSoft) e *= R.hardKick;
    kick(a, nx * e * s * mb / (ma + mb), ny * e * s * mb / (ma + mb));
    kick(b, -nx * e * s * ma / (ma + mb), -ny * e * s * ma / (ma + mb));
    a.bump(ia, s, nx, ny); b.bump(ib, s, -nx, -ny);
    emit("hit", { a: a.id, b: b.id, kinds: [a.kind, b.kind], speed: s, ia, ib, point: [a.p[ia * 3], a.p[ia * 3 + 1]] });
    for (const [k, o] of [[a, b], [b, a]]) {            // king stability: the one and only definition
      if (!k.king) continue;
      const d = Math.min(R.stabilityDmgMax, Math.round(R.stabilityDmgK * s * o.massScale));
      if (d > 0) { stability[k.owner] = Math.max(0, stability[k.owner] - d); emit("king-hit", { king: k.id, by: o.id, damage: d, stability: stability[k.owner] }); }
    }
    if (hardHitsSoft) {
      const [hd, tg, pt, bx, by] = a.sk === "hard" ? [a, b, ib, b.p[ib * 3], b.p[ib * 3 + 1]] : [b, a, ia, a.p[ia * 3], a.p[ia * 3 + 1]];
      if (s >= (tg.king ? R.cutSpeedKing : R.cutSpeedSoft)) cutNear(tg, pt, bx, by, s);
    }
    const kinds = [a.sk, b.sk];
    if (kinds.includes("gum") && kinds.includes("hard")) {
      const [g, hd, ig, ih] = a.sk === "gum" ? [a, b, ia, ib] : [b, a, ib, ia];
      addGlue(g, hd, ig, ih);
    } else if (kinds.includes("gum") && kinds.includes("soft")) {
      dropGlueOf(a.sk === "gum" ? a : b, "bounced");       // a soft hit knocks gum clean off, nothing sticks
    }
  }

  function removeBear(b, reason) {
    dropGlueOf(b, "gone");
    bears.splice(bears.indexOf(b), 1);
    emit("remove", { id: b.id, reason });
  }

  /* ---- end conditions ---- */
  const kings = () => [byId("king-0"), byId("king-1")];
  function kingOut(k) {
    const c = k.centre();
    return c[1] < R.fallY || Math.abs(c[0]) > R.fieldX;
  }
  function finish(winner, reason) {
    st.done = true; st.state = "over"; st.winner = winner; st.reason = reason;
    for (const g of glue.slice()) endGlue(g, "over");
    emit("end", { winner, reason, stability: stability.slice() });
  }
  function checkKings() {
    const [k0, k1] = kings();
    const o0 = kingOut(k0), o1 = kingOut(k1);
    if (o0 && o1) return finish(null, "double-out"), true;
    if (o0 || o1) return finish(o0 ? 1 : 0, "king-out"), true;
    return false;
  }
  function endTurn() {
    for (const g of glue.slice()) endGlue(g, "turn");
    st.turnNo++;
    const empty = inventory.map((v) => v.soft + v.hard + v.gum === 0);
    if (empty[0] && empty[1]) {
      if (stability[0] === stability[1]) return finish(null, "draw");
      return finish(stability[0] > stability[1] ? 0 : 1, "stability");
    }
    st.turn = empty[1 - st.turn] ? st.turn : 1 - st.turn;
    st.state = "aim";
    emit("turn", { turn: st.turn, no: st.turnNo });
  }

  function tickOnce() {
    for (const b of bears) b.step(h, solvers[b.sk]);
    st.tick++;
    applyGlue();
    const boxes = bears.map(aabb);
    for (let i = 0; i < bears.length; i++) for (let j = i + 1; j < bears.length; j++) contact(bears[i], bears[j], boxes[i], boxes[j]);
    for (const b of bears.slice()) {
      if (b.king) continue;
      const k = b.p[RIG.idx.body * 3 + 1];
      if (k < R.removeY) removeBear(b, "fell");
    }
    if (st.state === "fly" && !st.done) {
      st.flyT++;
      if (checkKings()) return;
      let v = 0;
      for (const b of bears) for (let i = 0; i < b.n * 3; i++) v = Math.max(v, Math.abs(b.p[i] - b.q[i]));
      st.still = v / h < 0.9 ? st.still + 1 : 0;
      if (st.flyT >= R.maxFlyTicks || (st.flyT > R.minFlyTicks && st.still >= R.stillTicks)) endTurn();
    }
  }

  /* ---- setup: platforms, kings, optional explicit test scenario ---- */
  for (const owner of [0, 1]) {
    const at = scenario?.kingAt?.[owner];                  // explicit test placement only
    spawn(owner, "king", true, at ? at[0] : (owner === 0 ? -1 : 1) * R.platformX, at ? at[1] : R.platformTop);
  }
  if (!scenario?.kingAt) {
    st.state = "fly";                                     // let the kings settle onto their platforms
    for (let i = 0; i < R.settleTicks; i++) tickOnce();
  }
  st.state = "aim"; st.tick = 0; st.events = []; st.seq = 0; contactAt.clear(); st.flyT = 0; st.still = 0;
  if (scenario) {
    if (scenario.inventory) for (const s of [0, 1]) Object.assign(inventory[s], scenario.inventory[s] || {});
    if (scenario.stability) { stability[0] = scenario.stability[0]; stability[1] = scenario.stability[1]; }
    for (const e of scenario.bears || []) {
      if (!KINDS.includes(e.kind)) throw new RangeError("scenario kind");
      spawn(e.owner | 0, e.kind, false, e.x, e.y, e.vx || 0, e.vy || 0, e.spin || 0);
    }
    if (scenario.turn !== undefined) st.turn = scenario.turn;
    if (scenario.state === "fly") st.state = "fly";
  }

  /* ---- public surface ---- */
  const rej = (error) => ({ ok: false, error });
  function command(c) {
    if (!c || typeof c !== "object") return rej("bad-command");
    const { side, kind, vx, vy, actionId } = c;
    if ((typeof actionId !== "string" && typeof actionId !== "number") || actionId === "" || String(actionId).length > 64) return rej("bad-action-id");
    const key = JSON.stringify([side, kind, vx, vy]);
    const prev = actions.get(String(actionId));
    if (prev) return prev.key === key ? { ...prev.res, duplicate: true } : rej("action-conflict");
    if (st.done || st.state === "over") return rej("game-over");
    if (side !== 0 && side !== 1) return rej("bad-side");
    if (st.state !== "aim") return rej("not-aiming");
    if (side !== st.turn) return rej("not-your-turn");
    if (!KINDS.includes(kind)) return rej("bad-kind");
    if (typeof vx !== "number" || typeof vy !== "number" || !Number.isFinite(vx) || !Number.isFinite(vy)) return rej("bad-velocity");
    if (Math.hypot(vx, vy) > R.maxSpeed + 1e-9) return rej("too-fast");
    if (inventory[side][kind] <= 0) return rej("no-stock");
    if (bears.length >= R.maxEntities) return rej("entity-cap");
    inventory[side][kind]--;
    st.thrown++;
    const dir = side === 0 ? 1 : -1;
    const x = (side === 0 ? -1 : 1) * R.platformX + dir * 1.4, y = R.platformTop + 1.6;
    const b = spawn(side, kind, false, x, y, vx, vy, -Math.sign(vx || 1) * LAUNCH_PHYSICS.spin);
    st.state = "fly"; st.flyT = 0; st.still = 0;
    emit("launch", { id: b.id, side, kind, vx, vy, actionId });
    const res = { ok: true, entityId: b.id, tick: st.tick };
    actions.set(String(actionId), { key, res });
    return res;
  }
  function step(count = 1) {
    if (!Number.isInteger(count) || count < 0 || count > 20000) throw new RangeError("step(count): integer 0..20000");
    for (let n = 0; n < count && st.state === "fly" && !st.done; n++) tickOnce();
    return st.tick;
  }
  const arr = (a) => Array.from(a);
  function refreshUp(b) {
    const p = b.p, hd = RIG.idx.head * 3, bd = RIG.idx.body * 3;
    const ux = p[hd] - p[bd], uy = p[hd + 1] - p[bd + 1], uz = p[hd + 2] - p[bd + 2], l = Math.hypot(ux, uy, uz) || 1;
    b.up[0] = ux / l; b.up[1] = uy / l; b.up[2] = uz / l;
  }
  function snapshot() {
    const events = st.events; st.events = [];
    return {
      version: BATTLE_VERSION, tick: st.tick, state: st.state, turn: st.turn,
      inventory: inventory.map((v) => ({ soft: v.soft, hard: v.hard, gum: v.gum })),
      stability: stability.slice(),
      bears: bears.map((b) => {
        refreshUp(b);
        return {
          id: b.id, owner: b.owner, kind: b.kind, type: b.king ? "king" : "candy", king: b.king,
          p: arr(b.p), q: arr(b.q), lk: arr(b.lk), seg: arr(b.seg),
          segs: b.segs ? b.segs.map((s) => ({ ids: arr(s.ids), n: s.n, mass: s.mass })) : null,
          strands: b.strands.map((x) => ({ i: x.i, j: x.j, rest: x.rest, len: x.len || 0, bone: x.bone || null })),
          dmg: arr(b.dmg), flash: arr(b.flash), up: arr(b.up),
        };
      }),
      glue: glue.map((g) => ({ id: g.id, a: g.a.id, b: g.b.id, ia: g.ia, ib: g.ib, rest: g.rest, len: g.len, age: st.tick - g.born, ttl: g.ttl })),
      winner: st.winner, events,
    };
  }
  const result = () => ({ done: st.done, winner: st.winner, reason: st.reason, stability: stability.slice(), turns: st.turnNo, ticks: st.tick, version: BATTLE_VERSION });
  return { command, step, snapshot, result };
}
