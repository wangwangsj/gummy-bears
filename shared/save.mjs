/* shared/save.mjs - campaign progress: migration from the old positional save, legacy export
   and progress updates.  The official level ids live in levels.mjs (single source of truth),
   so this module derives LEVEL_IDS instead of keeping a second copy in sync by hand.
   Direction is levels.mjs -> rules.mjs -> physics.mjs; nothing here is imported by levels.mjs,
   so there is no cycle. */
import { OFFICIAL_LEVELS } from "./levels.mjs";

export const LEVEL_IDS = Object.freeze(OFFICIAL_LEVELS.map((l) => l.id));
export const CHAPTER_COUNT = 3;
export const LEVELS_PER_CHAPTER = 7;

/* Levels are bought with candy coins, the same currency as the upgrades: a delivery always pays,
   so progress never stalls, but a better-aimed run pays more and opens the next level sooner.
   Level 0 is free; every later one needs the previous level cleared plus its price. */
export const levelPrice = (i) => i <= 0 ? 0 : Math.round(120 * Math.pow(1.10, i - 1) / 10) * 10;

function integer(n, max = 100000000) { return Number.isFinite(n) ? Math.max(0, Math.min(max, Math.floor(n))) : 0; }

/* the old save kept best / stars / clear as positional arrays indexed by level order.  Those
   arrays still line up with the first seven ids, so a pre-expansion save keeps its clears,
   stars and best scores; the fourteen new levels simply start empty. */
export function migrateSave(raw) {
  const input = raw && typeof raw === "object" ? raw : {};
  const save = { version: 4, coins: integer(input.coins),
    up: Object.fromEntries(['sling', 'bounce', 'magnet'].map(k => [k, integer(input.up?.[k], 5)])),
    tipBreak: input.tipBreak === true, levels: {} };
  const keyed = input.version === 3 || input.version === 4;
  const cleared = LEVEL_IDS.map((id, i) => keyed ? input.levels?.[id]?.clear === true : input.clear?.[i] === true);
  LEVEL_IDS.forEach((id, i) => {
    const entry = keyed ? input.levels?.[id] : null;
    // before v4 the next level opened for free on a clear; whatever that rule opened stays open
    const open = i === 0 || cleared[i] || (input.version === 4 ? entry?.open === true : cleared[i - 1]);
    save.levels[id] = { clear: cleared[i], open,
      stars: integer(entry ? entry.stars : input.stars?.[i], 3),
      best: entry ? integer(entry.best) : 0,
      legacyBest: integer(entry ? entry.legacyBest : input.best?.[i]) };
  });
  return save;
}

/* positional view for the page: one entry per official level, in table order */
export function exportLegacy(save) {
  const safe = migrateSave(save);
  return { ...safe, best: LEVEL_IDS.map(id => safe.levels[id].best),
    stars: LEVEL_IDS.map(id => safe.levels[id].stars), clear: LEVEL_IDS.map(id => safe.levels[id].clear),
    open: LEVEL_IDS.map(id => safe.levels[id].open) };
}

export function updateProgress(save, id, result) {
  if (!LEVEL_IDS.includes(id)) throw new Error('Custom and battle modes cannot award campaign progress');
  const next = migrateSave(save), entry = next.levels[id];
  if (result.goal) { entry.clear = true; entry.stars = Math.max(entry.stars, integer(result.stars, 3)); entry.best = Math.max(entry.best, integer(result.score)); }
  next.coins = integer(next.coins + integer(result.coins));
  return next;
}

export function buyLevel(save, id) {
  const i = LEVEL_IDS.indexOf(id);
  if (i < 0) throw new Error('Only official levels are bought');
  const next = migrateSave(save), entry = next.levels[id];
  if (entry.open) throw new Error('Level is already open');
  if (!next.levels[LEVEL_IDS[i - 1]].clear) throw new Error('Clear the previous level first');
  if (next.coins < levelPrice(i)) throw new Error('Not enough coins');
  next.coins -= levelPrice(i); entry.open = true;
  return next;
}
