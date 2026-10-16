const TYPES = new Set(['box', 'roller', 'bumper', 'spring', 'press', 'crusher', 'belt', 'saw', 'blade', 'glass', 'jar']);
const COLORS = new Set(['cream', 'pink', 'mint', 'butter', 'lilac', 'metal', 'steel', 'ink', 'rose']);
const PART_KEYS = new Set(['t', 'x', 'y', 'w', 'h', 'r', 'a', 'spin', 'boost', 'pts', 'amp', 'period', 'off', 'belt', 'soft', 'mu', 'e', 'c', 'kind', 'cut', 'ghost', 'hp']);
const ZONE_KEYS = new Set(['kind', 'goal', 'x0', 'x1', 'y0', 'y1', 'pts']);
function fail(message) { throw new Error(`Invalid level: ${message}`); }
function object(value, keys) {
  if (!value || Array.isArray(value) || typeof value !== 'object') fail('object expected');
  for (const key of Object.keys(value)) if (!keys.has(key)) fail(`unknown field ${key}`);
}
function number(value, min, max) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) fail('number out of bounds');
}
function point(a, count, min, max) {
  if (!Array.isArray(a) || a.length !== count) fail('point expected');
  for (const n of a) number(n, min, max);
}
export function makeDraft() {
  return { version: 1, id: 'custom', name: { zh: '我的软糖关卡', en: 'My gummy level' },
    tag: { zh: '自制关卡', en: 'Custom level' }, goal: 'box', start: [-6, 4], span: [-9, 10], stars: [1500, 3000],
    dev: { zh: ['自制机关'], en: ['Custom contraptions'] },
    parts: [{ t: 'box', x: -6, y: 3.5, w: 2, h: .5, c: 'cream' },
      { t: 'belt', x: 1, y: .6, w: 14, h: .4, belt: 2.4 }],
    zones: [{ kind: 'box', goal: true, x0: 6, x1: 8.5, y0: 0, y1: 2, pts: 500 }],
    collectibles: [] };
}
export function validateLevel(level) {
  object(level, new Set(['version', 'id', 'name', 'tag', 'goal', 'start', 'span', 'stars', 'dev', 'parts', 'zones', 'collectibles']));
  if (level.version !== 1 || level.id !== 'custom') fail('version/id');
  for (const key of ['name', 'tag']) {
    object(level[key], new Set(['zh', 'en']));
    for (const text of Object.values(level[key])) if (typeof text !== 'string' || !text.trim() || text.length > 48 || /[<>\p{Cc}\p{Cf}]/u.test(text)) fail('text');
    if (typeof level[key].zh !== 'string' || typeof level[key].en !== 'string') fail('bilingual text');
  }
  if (!['box', 'syrup', 'grinder'].includes(level.goal)) fail('goal');
  point(level.start, 2, -40, 40); point(level.span, 2, -40, 40); point(level.stars, 2, 1, 100000);
  if (level.span[1] - level.span[0] < 5 || level.span[1] - level.span[0] > 50 || level.stars[1] < level.stars[0]) fail('span/stars');
  if (level.start[0] < level.span[0] || level.start[0] > level.span[1] || level.start[1] < 0 || level.start[1] > 18) fail('start');
  object(level.dev, new Set(['zh', 'en']));
  for (const lang of ['zh', 'en']) {
    if (!Array.isArray(level.dev[lang]) || level.dev[lang].length > 8 || level.dev[lang].some(s => typeof s !== 'string' || !s.trim() || s.length > 32 || /[<>\p{Cc}\p{Cf}]/u.test(s))) fail('device labels');
  }
  if (!Array.isArray(level.parts) || level.parts.length > 128) fail('part count');
  for (const p of level.parts) {
    object(p, PART_KEYS);
    if (!TYPES.has(p.t)) fail('part type');
    number(p.x, -40, 40); number(p.y, -2, 20);
    for (const [key, value] of Object.entries(p)) {
      if (['t', 'c', 'kind', 'cut', 'ghost'].includes(key)) continue;
      const limits = key === 'period' ? [.4, 30] : ['r', 'w', 'h'].includes(key) ? [.05, 40]
        : key === 'pts' ? [0, 1000] : key === 'hp' ? [1, 20] : key === 'a' ? [-180, 180]
        : ['mu', 'e', 'soft', 'off'].includes(key) ? [0, 1] : key === 'y' ? [-2, 20] : [-40, 40];
      number(value, ...limits);
    }
    if (['roller', 'crusher', 'saw', 'bumper'].includes(p.t)) number(p.r, .05, 4);
    else { number(p.w, .05, 40); number(p.h, .05, 20); }
    if (['press', 'crusher', 'blade'].includes(p.t)) { number(p.period, .4, 30); number(p.amp ?? 0, 0, 8); }
    if (p.c !== undefined && !COLORS.has(p.c)) fail('color');
    if (p.kind !== undefined && !['juice', 'bumper', 'grind'].includes(p.kind)) fail('kind');
    for (const flag of ['cut', 'ghost']) if (p[flag] !== undefined && typeof p[flag] !== 'boolean') fail('flag');
  }
  if (!Array.isArray(level.zones) || level.zones.length < 1 || level.zones.length > 16 || level.zones.filter(z => z.goal === true).length !== 1) fail('exactly one goal');
  for (const z of level.zones) {
    object(z, ZONE_KEYS);
    if (!['box', 'syrup', 'grinder'].includes(z.kind) || typeof z.goal !== 'boolean') fail('zone');
    for (const k of ['x0', 'x1', 'y0', 'y1']) number(z[k], -40, 40);
    number(z.pts, 0, 1000);
    if (z.x1 <= z.x0 || z.y1 <= z.y0 || z.x0 < level.span[0] || z.x1 > level.span[1]) fail('zone bounds');
  }
  if (!Array.isArray(level.collectibles) || level.collectibles.length > 32) fail('collectibles');
  for (const p of level.collectibles) {
    object(p, new Set(['x', 'y', 'pts'])); number(p.x, -40, 40); number(p.y, 0, 20); number(p.pts, 0, 1000);
  }
  if (JSON.stringify(level).length > 65536) fail('data size');
  return JSON.parse(JSON.stringify(level));
}
export function encodeLevel(level) {
  const bytes = new TextEncoder().encode(JSON.stringify(validateLevel(level)));
  let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function decodeLevel(code) {
  if (typeof code !== 'string' || code.length > 88000 || !/^[A-Za-z0-9_-]+$/.test(code)) fail('share code');
  const binary = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
  if (binary.length > 65536) fail('decoded size');
  return validateLevel(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, c => c.charCodeAt(0)))));
}
