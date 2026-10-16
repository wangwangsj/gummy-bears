/* shared/save.mjs - campaign progress: migration from the old positional save, legacy export
   and progress updates.  The official level ids live in levels.mjs (single source of truth),
   so this module derives LEVEL_IDS instead of keeping a second copy in sync by hand.
   Direction is levels.mjs -> rules.mjs -> physics.mjs; nothing here is imported by levels.mjs,
   so there is no cycle. */
import { OFFICIAL_LEVELS } from "./levels.mjs";

export const LEVEL_IDS = Object.freeze(OFFICIAL_LEVELS.map((l) => l.id));
export const CHAPTER_COUNT = 3;
export const LEVELS_PER_CHAPTER = 7;

function integer(n, max = 100000000) { return Number.isFinite(n) ? Math.max(0, Math.min(max, Math.floor(n))) : 0; }

/* the old save kept best / stars / clear as positional arrays indexed by level order.  Those
   arrays still line up with the first seven ids, so a pre-expansion save keeps its clears,
   stars and best scores; the fourteen new levels simply start empty. */
export function migrateSave(raw) {
  const input = raw && typeof raw === "object" ? raw : {};
  const save = { version: 3, coins: integer(input.coins),
    up: Object.fromEntries(['sling', 'bounce', 'magnet'].map(k => [k, integer(input.up?.[k], 5)])),
    tipBreak: input.tipBreak === true, levels: {} };
  LEVEL_IDS.forEach((id, i) => {
    const entry = input.version === 3 ? input.levels?.[id] : null;
    save.levels[id] = { clear: entry ? entry.clear === true : input.clear?.[i] === true,
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
    stars: LEVEL_IDS.map(id => safe.levels[id].stars), clear: LEVEL_IDS.map(id => safe.levels[id].clear) };
}

export function updateProgress(save, id, result) {
  if (!LEVEL_IDS.includes(id)) throw new Error('Custom and battle modes cannot award campaign progress');
  const next = migrateSave(save), entry = next.levels[id];
  if (result.goal) { entry.clear = true; entry.stars = Math.max(entry.stars, integer(result.stars, 3)); entry.best = Math.max(entry.best, integer(result.score)); }
  next.coins = integer(next.coins + integer(result.coins));
  return next;
}
