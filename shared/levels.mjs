/* shared/levels.mjs - the 7 official levels, copied verbatim from parts/game.js LEVELS
   (data only: no THREE, no DOM).  Each gets a stable id so saves, leaderboards and replays
   never depend on array order.  Entries are deep-frozen: runs copy parts, never mutate these.
   part kinds: box (static / spinning), roller / bumper / saw (circles), spring, press + blade
   (slam), crusher (rolls back and forth), belt.  zones: box / syrup / grinder; goal ends the level.
   stars = [two-star score, three-star score]; start = bear spawn [x, y]; span = x range of the factory. */
import { RULES_VERSION } from "./rules.mjs";
export { RULES_VERSION };
const goalBox = (x0, x1, h = 0.5) => [
  { t: 'box', x: x0 - 0.1, y: h / 2, w: 0.2, h, c: 'pink' },
  { t: 'box', x: x1 + 0.1, y: 0.8, w: 0.2, h: 1.6, c: 'pink' },
];
const RAW_LEVELS = [
  { name: { en: 'Stairway', zh: '下楼梯' }, tag: { en: 'Warm-up', zh: '先热热身' }, goal: 'box',
    dev: { en: ['stairs', 'bumper'], zh: ['楼梯', '弹珠'] },
    start: [-6.2, 5.4], stars: [6100, 6700], span: [-8.6, 8.4],
    parts: [
      { t: 'box', x: -6.2, y: 5.15, w: 2.4, h: 0.5, c: 'cream' },
      { t: 'box', x: -6.2, y: 2.45, w: 0.6, h: 4.9, c: 'lilac' },
      ...Array.from({ length: 8 }, (_, k) => ({ t: 'box', x: -4.35 + 1.1 * k, y: (4.8 - 0.6 * k) / 2, w: 1.1, h: 4.8 - 0.6 * k,
        c: k % 2 ? 'cream' : 'pink' })),
      ...goalBox(4.4, 6.8),
      { t: 'bumper', x: 6.2, y: 3.4, r: 0.45, boost: 4, pts: 100 },
      { t: 'box', x: 7.6, y: 2.6, w: 0.6, h: 5.2, c: 'mint' },
    ],
    zones: [{ kind: 'box', goal: true, x0: 4.4, x1: 6.8, y0: 0, y1: 1.5, pts: 500 }] },
  { name: { en: 'Rolling Pins', zh: '擀面杖' }, tag: { en: 'Roll with it', zh: '滚来滚去' }, goal: 'box',
    dev: { en: ['rolling pins', 'paddle'], zh: ['擀面杖', '旋转挡板'] },
    start: [-6.5, 6.5], stars: [6000, 7900], span: [-8.6, 7.2],
    parts: [
      { t: 'box', x: -6.5, y: 6.25, w: 2.2, h: 0.5, c: 'cream' },
      { t: 'box', x: -6.5, y: 3.0, w: 0.6, h: 6.0, c: 'lilac' },
      { t: 'roller', x: -3.6, y: 5.2, r: 0.45, spin: -5, pts: 40 },
      { t: 'roller', x: -1.3, y: 3.8, r: 0.52, spin: 6, pts: 40 },
      { t: 'roller', x: 1.0, y: 5.5, r: 0.42, spin: -7, pts: 40 },
      { t: 'roller', x: 2.6, y: 2.5, r: 0.55, spin: 5, pts: 40 },
      { t: 'roller', x: 4.6, y: 4.3, r: 0.45, spin: -6, pts: 40 },
      { t: 'box', x: 0.2, y: 1.75, w: 2.4, h: 0.22, spin: 2.2, c: 'mint', pts: 50, kind: 'bumper' },
      { t: 'box', x: -2.6, y: 0.48, w: 9.8, h: 0.2, a: -4.5, c: 'butter', mu: 0.012 },
      ...goalBox(2.4, 5.8, 0.12),
      { t: 'box', x: 6.6, y: 3.5, w: 0.6, h: 7.0, c: 'pink' },
    ],
    zones: [{ kind: 'box', goal: true, x0: 2.4, x1: 5.8, y0: 0, y1: 1.5, pts: 500 }] },
  { name: { en: 'The Juicer', zh: '榨汁机' }, tag: { en: 'Squeeze me', zh: '挤一挤更健康' }, goal: 'syrup',
    dev: { en: ['funnel', 'juicer', 'belt'], zh: ['漏斗', '榨汁滚筒', '传送带'] },
    start: [-6.0, 6.0], stars: [7600, 8800], span: [-8.4, 8.4],
    parts: [
      { t: 'box', x: -6.0, y: 5.75, w: 2.4, h: 0.5, c: 'cream' },
      { t: 'box', x: -6.0, y: 2.75, w: 0.6, h: 5.5, c: 'lilac' },
      { t: 'box', x: -1.65, y: 5.25, w: 2.6, h: 0.25, a: -35, c: 'butter' },
      { t: 'box', x: 1.65, y: 5.25, w: 2.6, h: 0.25, a: 35, c: 'butter' },
      { t: 'box', x: 2.9, y: 6.2, w: 0.25, h: 1.6, c: 'butter' },
      { t: 'roller', x: -0.62, y: 3.6, r: 0.45, spin: -9, soft: 0.45, pts: 150, kind: 'juice', mu: 0.12 },
      { t: 'roller', x: 0.62, y: 3.6, r: 0.45, spin: 9, soft: 0.45, pts: 150, kind: 'juice', mu: 0.12 },
      { t: 'belt', x: 1.9, y: 1.55, w: 5.4, h: 0.3, belt: 2.6 },
      { t: 'bumper', x: -3.2, y: 2.0, r: 0.45, boost: 5, pts: 100 },
      { t: 'box', x: 5.15, y: 0.6, w: 0.2, h: 1.2, c: 'metal' },
      { t: 'box', x: 7.65, y: 1.0, w: 0.2, h: 2.0, c: 'metal' },
    ],
    zones: [{ kind: 'syrup', goal: true, x0: 5.25, x1: 7.55, y0: 0, y1: 1.45, pts: 500 }] },
  { name: { en: 'Pinball Hell', zh: '弹珠台' }, tag: { en: 'Bonk bonk', zh: '弹到头晕' }, goal: 'box',
    dev: { en: ['bumpers', 'tilted table'], zh: ['弹珠', '倾斜台面'] },
    start: [-6.6, 2.4], stars: [2600, 3700], span: [-8.6, 7.6],
    parts: [
      { t: 'box', x: -6.6, y: 2.15, w: 2.0, h: 0.5, c: 'cream' },
      { t: 'box', x: -6.6, y: 1.3, w: 0.6, h: 1.4, c: 'lilac' },
      ...[[-3.2, 4.4], [-1.0, 6.0], [1.0, 4.0], [3.2, 6.2], [1.0, 7.9], [-2.2, 2.3], [2.4, 2.4], [4.8, 4.0], [-4.4, 6.8]]
        .map(([x, y]) => ({ t: 'bumper', x, y, r: 0.48, boost: 6, pts: 100 })),
      { t: 'box', x: -0.4, y: 9.3, w: 16.0, h: 0.4, c: 'pink' },
      { t: 'box', x: -8.6, y: 4.6, w: 0.5, h: 9.2, c: 'mint' },
      { t: 'box', x: 7.4, y: 4.6, w: 0.5, h: 9.2, c: 'mint' },
      { t: 'box', x: -2.0, y: 0.55, w: 12.6, h: 0.2, a: -4.5, c: 'butter', mu: 0.012 },
      { t: 'spring', x: -5.0, y: 0.95, w: 1.2, h: 0.25, a: -4.5, boost: 11, pts: 60 },
      ...goalBox(4.3, 6.9, 0.1),
    ],
    zones: [{ kind: 'box', goal: true, x0: 4.3, x1: 6.9, y0: 0, y1: 1.5, pts: 500 }] },
  { name: { en: 'Steamroller', zh: '碾压线' }, tag: { en: 'Flat pack', zh: '压成薄片' }, goal: 'box',
    dev: { en: ['belt', 'presses', 'steamroller'], zh: ['传送带', '冲压机', '压路滚筒'] },
    start: [-7.0, 4.0], stars: [6400, 8700], span: [-8.6, 10.2],
    parts: [
      { t: 'box', x: -7.0, y: 3.75, w: 2.0, h: 0.5, c: 'cream' },
      { t: 'box', x: -7.0, y: 1.75, w: 0.6, h: 3.5, c: 'lilac' },
      { t: 'belt', x: 0.6, y: 0.6, w: 13.6, h: 0.4, belt: 2.2 },
      { t: 'press', x: -3.4, y: 3.9, w: 1.4, h: 1.0, amp: 2.4, period: 1.7, off: 0.0, pts: 300, soft: 0.75 },
      { t: 'crusher', x: 0.6, y: 1.72, r: 0.64, amp: 1.7, period: 2.6, off: 0.25, pts: 350, soft: 0.6 },
      { t: 'press', x: 4.5, y: 3.9, w: 1.4, h: 1.0, amp: 2.4, period: 1.2, off: 0.2, pts: 300, soft: 0.75 },
      ...goalBox(7.75, 9.75),
    ],
    zones: [{ kind: 'box', goal: true, x0: 7.75, x1: 9.75, y0: 0, y1: 1.6, pts: 500 }] },
  { name: { en: 'The Slicer', zh: '切糖车间' }, tag: { en: 'Mind the blades', zh: '小心刀片' }, goal: 'box',
    dev: { en: ['ramp', 'saw blades', 'guillotine'], zh: ['滑道', '圆锯', '铡刀'] },
    start: [-7.0, 5.0], stars: [6700, 7800], span: [-8.6, 9.6],
    parts: [
      { t: 'box', x: -7.0, y: 4.75, w: 2.0, h: 0.5, c: 'cream' },
      { t: 'box', x: -7.0, y: 2.25, w: 0.6, h: 4.5, c: 'lilac' },
      { t: 'box', x: -3.7, y: 2.6, w: 4.6, h: 0.25, a: -32, c: 'butter' },
      { t: 'belt', x: 2.0, y: 0.6, w: 7.4, h: 0.4, belt: 2.4 },
      { t: 'saw', x: 0.4, y: 0.95, r: 0.5, spin: 16, cut: true, ghost: true, pts: 200 },
      { t: 'blade', x: 2.2, y: 3.4, w: 0.14, h: 1.6, amp: 2.1, period: 1.5, off: 0.3, cut: true, ghost: true, pts: 250 },
      { t: 'saw', x: 3.9, y: 0.95, r: 0.5, spin: -16, cut: true, ghost: true, pts: 200 },
      ...goalBox(6.2, 8.2),
    ],
    zones: [{ kind: 'box', goal: true, x0: 6.2, x1: 8.2, y0: 0, y1: 1.6, pts: 500 }] },
  { name: { en: 'The Grinder', zh: '终极碎糖机' }, tag: { en: 'Grand finale', zh: '最终车间' }, goal: 'grinder',
    dev: { en: ['stairs', 'rolling pins', 'saw', 'steamroller', 'grinder'], zh: ['楼梯', '擀面杖', '圆锯', '压路滚筒', '碎糖机'] },
    start: [-8.0, 7.2], stars: [10400, 14900], span: [-9.8, 13.6],
    parts: [
      { t: 'box', x: -8.0, y: 6.95, w: 2.2, h: 0.5, c: 'cream' },
      { t: 'box', x: -8.0, y: 3.35, w: 0.6, h: 6.7, c: 'lilac' },
      ...Array.from({ length: 4 }, (_, k) => ({ t: 'box', x: -6.1 + 1.2 * k, y: (6.2 - 0.8 * k) / 2, w: 1.2, h: 6.2 - 0.8 * k,
        c: k % 2 ? 'cream' : 'pink' })),
      { t: 'roller', x: -1.6, y: 4.4, r: 0.45, spin: 7, pts: 40 },
      { t: 'roller', x: 0.4, y: 3.3, r: 0.5, spin: -6, pts: 40 },
      { t: 'belt', x: 6.1, y: 1.4, w: 8.6, h: 0.4, belt: 2.4 },
      { t: 'saw', x: 3.2, y: 1.75, r: 0.48, spin: 16, cut: true, ghost: true, pts: 200 },
      { t: 'crusher', x: 6.6, y: 2.66, r: 0.64, amp: 1.2, period: 2.2, off: 0, pts: 350, soft: 0.6 },
      { t: 'box', x: 9.85, y: 0.6, w: 0.25, h: 1.2, c: 'metal' },
      { t: 'box', x: 12.95, y: 1.6, w: 0.25, h: 3.2, c: 'metal' },
      { t: 'saw', x: 10.85, y: 0.55, r: 0.45, spin: -22, cut: true, ghost: true, pts: 0, kind: 'grind' },
      { t: 'saw', x: 11.95, y: 0.55, r: 0.45, spin: 22, cut: true, ghost: true, pts: 0, kind: 'grind' },
      { t: 'box', x: 14.2, y: 3.5, w: 0.6, h: 7.0, c: 'pink' },
    ],
    zones: [{ kind: 'grinder', goal: true, x0: 10.0, x1: 12.8, y0: 0, y1: 2.6, pts: 800 }] },
];

/* content added after the base table (mirrors the block after LEVELS in parts/game.js):
   3 collectible stars (300 each) per level, glass/jar/blade on the first two levels, catch ramp on the last. */
RAW_LEVELS.forEach((lv, i) => {
  lv.collectibles = [{ x: lv.start[0] + 2.8, y: Math.max(2, lv.start[1] + 0.6), pts: 300 },
    { x: (lv.span[0] + lv.span[1]) / 2, y: 3.2, pts: 300 },
    { x: lv.zones[0].x0 - 1, y: 2.2, pts: 300 }];
  if (i < 2) {
    lv.dev.zh = ['糖星', '糖玻璃', '拉丝切刀'];
    lv.dev.en = ['candy stars', 'sugar glass', 'string slicer'];
  }
  if (i < 2) lv.parts.push(
    { t: "glass", x: -2.5, y: 4, w: 0.18, h: 1.5, c: "mint", hp: 3, pts: 350 },
    { t: "jar", x: 1.6, y: 2.1, w: 0.7, h: 1.1, c: "butter", hp: 2, pts: 250 },
    { t: "blade", x: -1, y: 4.2, w: 0.1, h: 1.1, amp: 0.5, period: 2.5, off: 0, cut: true, ghost: true, pts: 150 });
});
RAW_LEVELS[6].parts.push({ t: "box", x: 1.2, y: 1.05, w: 4.8, h: 0.25, a: 18, c: "mint", mu: 0.002 });
/* visible catch chute into the belt: descends to the right (a<0) and hands the bear onto the belt head.  Before it, a weak throw
   that dropped short of the elevated belt (top y 1.6) landed on the floor and could only jam (pipeline/level-balance-2026-10-16.md). */
RAW_LEVELS[6].parts.push({ t: "box", x: 0.6, y: 2.2, w: 4.4, h: 0.25, a: -15, c: "mint", mu: 0.002 });

const IDS = ["stairway","rolling-pins","juicer","pinball","steamroller","slicer","grinder"];
const deepFreeze = (o) => { if (o && typeof o === "object" && !Object.isFrozen(o)) { Object.freeze(o); for (const v of Object.values(o)) deepFreeze(v); } return o; };

export const OFFICIAL_LEVELS = Object.freeze(RAW_LEVELS.map((lv, i) => deepFreeze({ id: IDS[i], ...lv })));
export const levelById = (id) => OFFICIAL_LEVELS.find((l) => l.id === id) || null;
export const levelIndex = (id) => OFFICIAL_LEVELS.findIndex((l) => l.id === id);

const PART_TYPES = new Set(["box", "roller", "bumper", "saw", "spring", "press", "blade", "crusher", "belt", "glass", "jar"]);
const ZONE_KINDS = new Set(["box", "syrup", "grinder"]);
const NUM_KEYS = ["hp", "x", "y", "w", "h", "r", "a", "spin", "e", "mu", "soft", "boost", "pts", "amp", "period", "off", "belt"];
const fin = (v) => typeof v === "number" && Number.isFinite(v);
/* throws RangeError / TypeError on anything the simulation cannot run safely (custom or untrusted levels) */
export function validateLevel(lv) {
  if (!lv || typeof lv !== "object") throw new TypeError("level must be an object");
  if (!Array.isArray(lv.parts) || lv.parts.length > 200) throw new RangeError("level.parts must be an array of <= 200");
  if (!Array.isArray(lv.zones) || !lv.zones.some((z) => z && z.goal)) throw new RangeError("level.zones needs a goal zone");
  for (const k of ["start", "span", "stars"]) if (!Array.isArray(lv[k]) || lv[k].length < 2 || !lv[k].every(fin)) throw new RangeError("level." + k + " must be 2 finite numbers");
  lv.parts.forEach((P, i) => {
    if (!P || !PART_TYPES.has(P.t)) throw new RangeError("part " + i + ": unknown type");
    for (const k of NUM_KEYS) if (P[k] !== undefined && !fin(P[k])) throw new RangeError("part " + i + "." + k + " not finite");
    if ((P.t === "press" || P.t === "blade" || P.t === "crusher") && !(P.period > 0)) throw new RangeError("part " + i + ": period must be > 0");
    if ((P.t === "roller" || P.t === "bumper" || P.t === "saw" || P.t === "crusher") && !(P.r > 0)) throw new RangeError("part " + i + ": r must be > 0");
    if ((P.t === "box" || P.t === "belt" || P.t === "spring" || P.t === "glass" || P.t === "jar" || P.t === "press" || P.t === "blade") && !(P.w > 0 && P.h > 0)) throw new RangeError("part " + i + ": w/h must be > 0");
  });
  if (lv.collectibles !== undefined) {
    if (!Array.isArray(lv.collectibles) || lv.collectibles.length > 32) throw new RangeError("level.collectibles must be an array of <= 32");
    lv.collectibles.forEach((c, i) => { for (const k of ["x", "y", "pts"]) if (!fin(c && c[k])) throw new RangeError("collectible " + i + "." + k + " not finite"); });
  }
  lv.zones.forEach((Z, i) => {
    if (!Z || !ZONE_KINDS.has(Z.kind)) throw new RangeError("zone " + i + ": unknown kind");
    for (const k of ["x0", "x1", "y0", "y1", "pts"]) if (!fin(Z[k])) throw new RangeError("zone " + i + "." + k + " not finite");
  });
  return lv;
}
