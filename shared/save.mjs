/* shared/save.mjs - campaign progress: migration from the old positional save, legacy export
   and progress updates.  The official level ids live in levels.mjs (single source of truth),
   so this module derives LEVEL_IDS instead of keeping a second copy in sync by hand.
   Direction is levels.mjs -> rules.mjs -> physics.mjs; nothing here is imported by levels.mjs,
   so there is no cycle. */
import { OFFICIAL_LEVELS } from "./levels.mjs";
import { PROP_IDS } from "./rules.mjs";

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
    tipBreak: input.tipBreak === true, propTip: input.propTip === true, levels: {},
    // one-throw props on hand, and today's rewarded-ad count (capped per local day)
    items: Object.fromEntries(PROP_IDS.map((k) => [k, integer(input.items?.[k], ITEM_MAX)])),
    ads: { day: typeof input.ads?.day === "string" ? input.ads.day.slice(0, 10) : "", count: integer(input.ads?.count, 1000) } };
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

/* ---- props: bought with candy coins, or granted by a rewarded ad ----
   A prop costs about a third of what a delivery pays, so coins alone always keep them in reach:
   an ad only saves time, it is never the only way to get one. */
export const ITEM_MAX = 99;
export const ITEM_PRICE = Object.freeze({ aim: 40, freeze: 100, boost: 80 });
/* ads appear from this level index on (level 12): before it the player is still learning and
   every level is cleared in a throw or two (balance sim 2026-10-20) */
export const AD_FROM = 11;
/* the prop bar appears from level 7 (index 6, crossed fans): the first level that asks for timing */
export const PROPS_FROM = 6;
export const AD_DAILY_CAP = 20;
const checkItem = (id) => { if (!PROP_IDS.includes(id)) throw new Error(`Unknown prop ${id}`); };

export function buyItem(save, id) {
  checkItem(id);
  const next = migrateSave(save);
  if (next.items[id] >= ITEM_MAX) throw new Error("Prop stack is full");
  if (next.coins < ITEM_PRICE[id]) throw new Error("Not enough coins");
  next.coins -= ITEM_PRICE[id]; next.items[id]++;
  return next;
}
export function grantItem(save, id, n = 1) {
  checkItem(id);
  const next = migrateSave(save);
  next.items[id] = Math.min(ITEM_MAX, next.items[id] + integer(n, ITEM_MAX));
  return next;
}
/* the props a throw used: every one must be on hand, and each is spent once */
export function useItems(save, ids) {
  const next = migrateSave(save);
  for (const id of new Set(ids)) { checkItem(id); if (next.items[id] < 1) throw new Error(`No ${id} left`); next.items[id]--; }
  return next;
}
export const adsLeft = (save, day) => { const s = migrateSave(save); return Math.max(0, AD_DAILY_CAP - (s.ads.day === day ? s.ads.count : 0)); };
export function recordAd(save, day) {
  const next = migrateSave(save);
  if (adsLeft(next, day) < 1) throw new Error("Daily ad limit reached");
  next.ads = { day, count: (next.ads.day === day ? next.ads.count : 0) + 1 };
  return next;
}
