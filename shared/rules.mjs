/* shared/rules.mjs - everything that decides a run's outcome but is not geometry:
   rules version, fixed-tick constants, base physics tuning, scoring tables, seeded PRNG,
   config / command validation, stars.  Pure data + arithmetic; no DOM, no THREE. */
import { RIG } from "./physics.mjs";

/* bump on ANY change that can alter a replay's score / outcome.  A server must refuse to
   compare runs across versions; leaderboards are bucketed by it. */
export const RULES_VERSION = "gummy-rules-3";

export const TICK_HZ = 300;
export const TICK_DT = 1 / TICK_HZ;            // fixed substep, same as the browser's CFG.subH
export const SCORE_EVERY = 5;                  // scoring / end-of-run checks run at 60 Hz (the browser's frame rate)
export const SCORE_DT = SCORE_EVERY * TICK_DT;
export const MAX_RUN_TICKS = 6000;             // 20 s; the in-game 15 s timeout always fires first
export const FLY_TIMEOUT = 15;                 // seconds of flight before 'time'

export const DEFAULT_CONFIG = Object.freeze({ sling: 0, bounce: 0, wobble: 0.42 });
export const MAX_UPGRADE = 5;

/* solver / world tuning, identical to the page's CFG for the game (not the sandbox) */
export const PHYSICS_BASE = Object.freeze({
  gravity: -26, subH: TICK_DT, restitution: 0.36, air: 1, fragile: 1, upright: 0.15, pileUpright: 0.3,
  sepCap: 0.0015, stick: 1.1, friction: 0.012, maxV: 0.022, floorY: 0, wallX: 2.45, wallZ: 2.45,
});
export const LAUNCH_PHYSICS = Object.freeze({ upright: 0, maxV: 0.075, air: 0.06, restitutionBase: 0.36, restitutionPerBounce: 0.05, spin: 2.5 });

/* body parts: which bone a point hangs on, and how a hit there is named and paid (parts/game.js) */
export const POINT_NAMES = Object.freeze(Object.keys(RIG.idx));      // RIG_DEF order
export const BONES = Object.freeze({ neck: ["head", "snout", "earL", "earR"], armL: ["handL"], armR: ["handR"],
  legL: ["footL"], legR: ["footR"], waist: ["belly", "footL", "footR"] });
export const BONE_OF = Object.freeze({ head: "neck", snout: "neck", earL: "neck", earR: "neck", handL: "armL", handR: "armR",
  footL: "legL", footR: "legR", body: "waist", belly: "waist" });
export const PART_OF = Object.freeze({ head: "head", earL: "head", earR: "head", snout: "face", handL: "arm", handR: "arm",
  footL: "leg", footR: "leg", body: "body", belly: "body" });
export const PART_MUL = Object.freeze({ head: 1.5, face: 1.7, arm: 1.2, leg: 0.9, body: 1.0, butt: 1.3, land: 0.6 });
export const BONE_SIDE = Object.freeze(Object.fromEntries(
  Object.entries(BONES).map(([k, v]) => [k, new Set(v.map((n) => RIG.idx[n]))])));

/* sling strength: 15 at level 0, +8% per sling level (parts/game.js vmax) */
export const vmax = (sling) => 15 * (1 + 0.08 * sling);

/* mulberry32: tiny, fast, identical on every JS engine.  All gameplay randomness comes from here. */
export function createRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function checkSeed(seed) {
  if (typeof seed !== "number" || !Number.isInteger(seed) || seed < 0 || seed > 0xFFFFFFFF) {
    throw new RangeError("seed must be an integer in 0..4294967295");
  }
  return seed;
}

/* user-facing config -> a frozen, clamped copy.  sling / bounce are upgrade levels 0..5. */
export function normalizeConfig(cfg) {
  const c = cfg == null ? {} : cfg;
  if (typeof c !== "object") throw new TypeError("config must be an object");
  const num = (name, def, lo, hi, int) => {
    const v = c[name];
    if (v === undefined) return def;
    if (typeof v !== "number" || !Number.isFinite(v)) throw new TypeError(`config.${name} must be a finite number`);
    const x = Math.min(hi, Math.max(lo, v));
    return int ? Math.floor(x) : x;
  };
  return Object.freeze({
    sling: num("sling", DEFAULT_CONFIG.sling, 0, MAX_UPGRADE, true),
    bounce: num("bounce", DEFAULT_CONFIG.bounce, 0, MAX_UPGRADE, true),
    wobble: num("wobble", DEFAULT_CONFIG.wobble, 0, 1, false),
  });
}

/* launch command: finite, and no stronger than the sling allows.  Strict: out-of-range throws. */
export function checkCommand(cmd, config) {
  if (!cmd || typeof cmd !== "object") throw new TypeError("command must be {vx, vy}");
  const { vx, vy } = cmd;
  if (typeof vx !== "number" || typeof vy !== "number" || !Number.isFinite(vx) || !Number.isFinite(vy)) {
    throw new TypeError("command.vx / vy must be finite numbers");
  }
  const lim = vmax(config.sling);
  if (Math.hypot(vx, vy) > lim + 1e-9) throw new RangeError(`launch speed ${Math.hypot(vx, vy).toFixed(3)} exceeds the sling limit ${lim.toFixed(3)}`);
  return { vx, vy };
}
/* convenience for callers that hold an over-long vector (older recorded tests): scale it down to the limit */
export function normalizeCommand(cmd, config) {
  if (!cmd || typeof cmd !== "object" || !Number.isFinite(cmd.vx) || !Number.isFinite(cmd.vy)) throw new TypeError("command.vx / vy must be finite numbers");
  const lim = vmax(config.sling), len = Math.hypot(cmd.vx, cmd.vy);
  if (len <= lim) return { vx: cmd.vx, vy: cmd.vy };
  const k = lim / len * (1 - 1e-12);
  return { vx: cmd.vx * k, vy: cmd.vy * k };
}

/* 1 star for arriving, +1 per threshold passed; no goal, no stars */
export function starsFor(level, score, cleared) {
  if (!cleared) return 0;
  const th = level.stars;
  return 1 + (score >= th[0] ? 1 : 0) + (score >= th[1] ? 1 : 0);
}

export const goalOf = (level) => level.zones.find((z) => z.goal);
