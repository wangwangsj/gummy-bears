/* shared/levels.mjs - the 21 official levels (3 chapters x 7), data only: no THREE, no DOM.
   Chapter 0 factory = the original 7 (ids and order unchanged, so old saves and positional
   legacy arrays keep working).  Chapter 1 Dessert Street and chapter 2 Candy Fair are the
   expansion: every one of them is reachable by at least one legal command (see LEVEL_SOLUTIONS,
   measured with the real simulateRun, sling 0).
   Each entry carries a stable id (saves / leaderboards / replays never depend on array order)
   plus chapter metadata (chapter / chapterName / chapterTheme / order) for the front end.
   Entries are deep-frozen: runs copy parts, never mutate these.
   part kinds: box (static / spinning), roller / bumper / saw (circles), spring, press + blade
   (slam), crusher (rolls back and forth), belt, glass, jar (breakable).  zones: box / syrup /
   grinder; goal ends the level.  stars = [two-star score, three-star score] calibrated to the
   zero-upgrade grid p50 / p90 (pipeline/level-expansion-2026-10-16.md);
   start = bear spawn [x, y]; span = x range of the factory. */
import { RULES_VERSION } from "./rules.mjs";
export { RULES_VERSION };

const RAW_LEVELS = [
  // factory · Stairway (下楼梯)
  { id: "stairway", name: {"en":"Stairway","zh":"下楼梯"}, tag: {"en":"Warm-up","zh":"先热热身"}, goal: "box", chapter: 0, chapterName: {"en":"Candy Factory","zh":"糖果工厂"}, chapterTheme: "factory", theme: "factory", order: 0, dev: {"en":["candy stars","sugar glass","string slicer"],"zh":["糖星","糖玻璃","拉丝切刀"]}, start: [-6.2,5.4], stars: [5300,6300], span: [-8.6,8.4],
    parts: [
      { t: "box", x: -6.2, y: 5.15, w: 2.4, h: 0.5, c: "cream" },
      { t: "box", x: -6.2, y: 2.45, w: 0.6, h: 4.9, c: "lilac" },
      { t: "box", x: -4.35, y: 2.4, w: 1.1, h: 4.8, c: "pink" },
      { t: "box", x: -3.2499999999999996, y: 2.1, w: 1.1, h: 4.2, c: "cream" },
      { t: "box", x: -2.1499999999999995, y: 1.7999999999999998, w: 1.1, h: 3.5999999999999996, c: "pink" },
      { t: "box", x: -1.0499999999999994, y: 1.5, w: 1.1, h: 3, c: "cream" },
      { t: "box", x: 0.05000000000000071, y: 1.2, w: 1.1, h: 2.4, c: "pink" },
      { t: "box", x: 1.1500000000000004, y: 0.8999999999999999, w: 1.1, h: 1.7999999999999998, c: "cream" },
      { t: "box", x: 2.250000000000001, y: 0.6000000000000001, w: 1.1, h: 1.2000000000000002, c: "pink" },
      { t: "box", x: 3.3500000000000014, y: 0.2999999999999998, w: 1.1, h: 0.5999999999999996, c: "cream" },
      { t: "box", x: 4.300000000000001, y: 0.25, w: 0.2, h: 0.5, c: "pink" },
      { t: "box", x: 6.8999999999999995, y: 0.8, w: 0.2, h: 1.6, c: "pink" },
      { t: "bumper", x: 6.2, y: 3.4, r: 0.45, boost: 4, pts: 100 },
      { t: "box", x: 7.6, y: 2.6, w: 0.6, h: 5.2, c: "mint" },
      { t: "glass", x: -2.5, y: 4.35, w: 0.18, h: 1.5, c: "mint", hp: 3, pts: 350 },
      { t: "jar", x: 1.2, y: 2.35, w: 0.7, h: 1.1, c: "butter", hp: 2, pts: 250 },
      { t: "blade", x: -1, y: 4.2, w: 0.1, h: 1.1, amp: 0.5, period: 2.5, off: 0, cut: true, ghost: true, pts: 150 }
    ],
    zones: [
      { kind: "box", goal: true, x0: 4.4, x1: 6.8, y0: 0, y1: 1.5, pts: 500 }
    ],
    collectibles: [
      { x: -3.4000000000000004, y: 6, pts: 300 },
      { x: -0.09999999999999964, y: 3.2, pts: 300 },
      { x: 3.4000000000000004, y: 2.2, pts: 300 }
    ] },
  // factory · Rolling Pins (擀面杖)
  { id: "rolling-pins", name: {"en":"Rolling Pins","zh":"擀面杖"}, tag: {"en":"Roll with it","zh":"滚来滚去"}, goal: "box", chapter: 0, chapterName: {"en":"Candy Factory","zh":"糖果工厂"}, chapterTheme: "factory", theme: "factory", order: 1, dev: {"en":["candy stars","sugar glass","string slicer"],"zh":["糖星","糖玻璃","拉丝切刀"]}, start: [-6.5,6.5], stars: [5000,7700], span: [-8.6,7.2],
    parts: [
      { t: "box", x: -6.5, y: 6.25, w: 2.2, h: 0.5, c: "cream" },
      { t: "box", x: -6.5, y: 3, w: 0.6, h: 6, c: "lilac" },
      { t: "roller", x: -3.6, y: 5.2, r: 0.45, spin: -5, pts: 40 },
      { t: "roller", x: -1.3, y: 3.8, r: 0.52, spin: 6, pts: 40 },
      { t: "roller", x: 1, y: 5.5, r: 0.42, spin: -7, pts: 40 },
      { t: "roller", x: 2.6, y: 2.5, r: 0.55, spin: 5, pts: 40 },
      { t: "roller", x: 4.6, y: 4.3, r: 0.45, spin: -6, pts: 40 },
      { t: "box", x: 0.2, y: 1.75, w: 2, h: 0.22, spin: 2.2, c: "mint", pts: 50, kind: "bumper" },
      { t: "box", x: -2.6, y: 0.48, w: 9.8, h: 0.2, a: -4.5, c: "butter", mu: 0.012 },
      { t: "box", x: 2.3, y: 0.06, w: 0.2, h: 0.12, c: "pink" },
      { t: "box", x: 5.8999999999999995, y: 0.8, w: 0.2, h: 1.6, c: "pink" },
      { t: "box", x: 6.6, y: 3.5, w: 0.6, h: 7, c: "pink" },
      { t: "glass", x: -2.5, y: 4, w: 0.18, h: 1.5, c: "mint", hp: 3, pts: 350 },
      { t: "jar", x: 1.6, y: 2.1, w: 0.7, h: 1.1, c: "butter", hp: 2, pts: 250 },
      { t: "blade", x: -0.6, y: 4.2, w: 0.1, h: 1.1, amp: 0.5, period: 2.5, off: 0, cut: true, ghost: true, pts: 150 }
    ],
    zones: [
      { kind: "box", goal: true, x0: 2.4, x1: 5.8, y0: 0, y1: 1.5, pts: 500 }
    ],
    collectibles: [
      { x: -3.7, y: 7.1, pts: 300 },
      { x: -0.6999999999999997, y: 3.2, pts: 300 },
      { x: 1.4, y: 3, pts: 300 }
    ] },
  // factory · The Juicer (榨汁机)
  // tuned 2026-10-18: funnel lowered 0.9 and left arm lengthened: flat throws land on the arm and slide in instead of bouncing off its tip
  { id: "juicer", name: {"en":"The Juicer","zh":"榨汁机"}, tag: {"en":"Squeeze me","zh":"挤一挤更健康"}, goal: "syrup", chapter: 0, chapterName: {"en":"Candy Factory","zh":"糖果工厂"}, chapterTheme: "factory", theme: "factory", order: 2, dev: {"en":["funnel","juicer","belt"],"zh":["漏斗","榨汁滚筒","传送带"]}, start: [-6,6], stars: [6000,7900], span: [-8.4,8.4],
    parts: [
      { t: "box", x: -6, y: 5.75, w: 2.4, h: 0.5, c: "cream" },
      { t: "box", x: -6, y: 2.75, w: 0.6, h: 5.5, c: "lilac" },
      { t: "box", x: -1.8957, y: 4.5221, w: 3.2, h: 0.25, a: -35, c: "butter" },
      { t: "box", x: 1.65, y: 4.35, w: 2.6, h: 0.25, a: 35, c: "butter" },
      { t: "box", x: 2.9, y: 5.3, w: 0.25, h: 1.6, c: "butter" },
      { t: "roller", x: -0.62, y: 2.7, r: 0.45, spin: -9, soft: 0.45, pts: 150, kind: "juice", mu: 0.12 },
      { t: "roller", x: 0.62, y: 2.7, r: 0.45, spin: 9, soft: 0.45, pts: 150, kind: "juice", mu: 0.12 },
      { t: "belt", x: 1.9, y: 1.55, w: 5.4, h: 0.3, belt: 2.6 },
      { t: "bumper", x: -3.2, y: 2, r: 0.45, boost: 5, pts: 100 },
      { t: "box", x: 5.15, y: 0.6, w: 0.2, h: 1.2, c: "metal" },
      { t: "box", x: 7.65, y: 1, w: 0.2, h: 2, c: "metal" }
    ],
    zones: [
      { kind: "syrup", goal: true, x0: 5.25, x1: 7.55, y0: 0, y1: 1.45, pts: 500 }
    ],
    collectibles: [
      { x: -3.2, y: 6.6, pts: 300 },
      { x: 0, y: 3.2, pts: 300 },
      { x: 4.25, y: 2.2, pts: 300 }
    ] },
  // factory · Pinball Hell (弹珠台)
  { id: "pinball", name: {"en":"Pinball Hell","zh":"弹珠台"}, tag: {"en":"Bonk bonk","zh":"弹到头晕"}, goal: "box", chapter: 0, chapterName: {"en":"Candy Factory","zh":"糖果工厂"}, chapterTheme: "factory", theme: "factory", order: 3, dev: {"en":["bumpers","tilted table"],"zh":["弹珠","倾斜台面"]}, start: [-6.6,2.4], stars: [2100,3000], span: [-8.6,7.6],
    parts: [
      { t: "box", x: -6.6, y: 2.15, w: 2, h: 0.5, c: "cream" },
      { t: "box", x: -6.6, y: 1.3, w: 0.6, h: 1.4, c: "lilac" },
      { t: "bumper", x: -3.2, y: 4.4, r: 0.48, boost: 6, pts: 100 },
      { t: "bumper", x: -1, y: 6, r: 0.48, boost: 6, pts: 100 },
      { t: "bumper", x: 1, y: 4, r: 0.48, boost: 6, pts: 100 },
      { t: "bumper", x: 3.2, y: 6.2, r: 0.48, boost: 6, pts: 100 },
      { t: "bumper", x: 1, y: 7.9, r: 0.48, boost: 6, pts: 100 },
      { t: "bumper", x: -2.2, y: 2.3, r: 0.48, boost: 6, pts: 100 },
      { t: "bumper", x: 2.4, y: 2.4, r: 0.48, boost: 6, pts: 100 },
      { t: "bumper", x: 4.8, y: 4, r: 0.48, boost: 6, pts: 100 },
      { t: "bumper", x: -4.4, y: 6.8, r: 0.48, boost: 6, pts: 100 },
      { t: "box", x: -0.4, y: 9.3, w: 16, h: 0.4, c: "pink" },
      { t: "box", x: -8.6, y: 4.6, w: 0.5, h: 9.2, c: "mint" },
      { t: "box", x: 7.4, y: 4.6, w: 0.5, h: 9.2, c: "mint" },
      { t: "box", x: -2, y: 0.6, w: 12.6, h: 0.2, a: -4.5, c: "butter", mu: 0.012 },
      { t: "spring", x: -5, y: 1.07, w: 1.2, h: 0.25, a: -4.5, boost: 11, pts: 60 },
      { t: "box", x: 4.2, y: 0.05, w: 0.2, h: 0.1, c: "pink" },
      { t: "box", x: 7, y: 0.8, w: 0.2, h: 1.6, c: "pink" }
    ],
    zones: [
      { kind: "box", goal: true, x0: 4.3, x1: 6.9, y0: 0, y1: 1.5, pts: 500 }
    ],
    collectibles: [
      { x: -3.8, y: 3, pts: 300 },
      { x: -0.5, y: 3.2, pts: 300 },
      { x: 3.3, y: 2.2, pts: 300 }
    ] },
  // factory · Steamroller (碾压线)
  { id: "steamroller", name: {"en":"Steamroller","zh":"碾压线"}, tag: {"en":"Flat pack","zh":"压成薄片"}, goal: "box", chapter: 0, chapterName: {"en":"Candy Factory","zh":"糖果工厂"}, chapterTheme: "factory", theme: "factory", order: 4, dev: {"en":["belt","presses","steamroller"],"zh":["传送带","冲压机","压路滚筒"]}, start: [-7,4], stars: [5500,8000], span: [-8.6,10.2],
    parts: [
      { t: "box", x: -7, y: 3.75, w: 2, h: 0.5, c: "cream" },
      { t: "box", x: -7, y: 1.75, w: 0.6, h: 3.5, c: "lilac" },
      { t: "belt", x: 0.6, y: 0.6, w: 13.6, h: 0.4, belt: 2.2 },
      { t: "press", x: -3.4, y: 3.9, w: 1.4, h: 1, amp: 2.4, period: 1.7, off: 0, pts: 300, soft: 0.75 },
      { t: "crusher", x: 0.6, y: 1.72, r: 0.64, amp: 1.7, period: 2.6, off: 0.25, pts: 350, soft: 0.6 },
      { t: "press", x: 4.5, y: 3.9, w: 1.4, h: 1, amp: 2.4, period: 1.2, off: 0.2, pts: 300, soft: 0.75 },
      { t: "box", x: 7.65, y: 0.25, w: 0.2, h: 0.5, c: "pink" },
      { t: "box", x: 9.85, y: 0.8, w: 0.2, h: 1.6, c: "pink" }
    ],
    zones: [
      { kind: "box", goal: true, x0: 7.75, x1: 9.75, y0: 0, y1: 1.6, pts: 500 }
    ],
    collectibles: [
      { x: -4.2, y: 4.6, pts: 300 },
      { x: 0.7999999999999998, y: 3.2, pts: 300 },
      { x: 6.75, y: 2.2, pts: 300 }
    ] },
  // factory · The Slicer (切糖车间)
  // tuned 2026-10-18: slower belt: the line no longer carries every landing past the blades, aim decides
  { id: "slicer", name: {"en":"The Slicer","zh":"切糖车间"}, tag: {"en":"Mind the blades","zh":"小心刀片"}, goal: "box", chapter: 0, chapterName: {"en":"Candy Factory","zh":"糖果工厂"}, chapterTheme: "factory", theme: "factory", order: 5, dev: {"en":["ramp","saw blades","guillotine"],"zh":["滑道","圆锯","铡刀"]}, start: [-7,5], stars: [5800,6900], span: [-8.6,9.6],
    parts: [
      { t: "box", x: -7, y: 4.75, w: 2, h: 0.5, c: "cream" },
      { t: "box", x: -7, y: 2.25, w: 0.6, h: 4.5, c: "lilac" },
      { t: "box", x: -3.7, y: 2.6, w: 4.6, h: 0.25, a: -32, c: "butter" },
      { t: "belt", x: 2, y: 0.6, w: 7.4, h: 0.4, belt: 1.2 },
      { t: "saw", x: 0.4, y: 1.25, r: 0.5, spin: 16, cut: true, ghost: true, pts: 200 },
      { t: "blade", x: 2.2, y: 3.4, w: 0.14, h: 1.6, amp: 1.8, period: 1.5, off: 0.3, cut: true, ghost: true, pts: 250 },
      { t: "saw", x: 3.9, y: 1.25, r: 0.5, spin: -16, cut: true, ghost: true, pts: 200 },
      { t: "box", x: 6.1, y: 0.25, w: 0.2, h: 0.5, c: "pink" },
      { t: "box", x: 8.3, y: 0.8, w: 0.2, h: 1.6, c: "pink" }
    ],
    zones: [
      { kind: "box", goal: true, x0: 6.2, x1: 8.2, y0: 0, y1: 1.6, pts: 500 }
    ],
    collectibles: [
      { x: -4.2, y: 5.6, pts: 300 },
      { x: 0.5, y: 3.2, pts: 300 },
      { x: 5.2, y: 2.2, pts: 300 }
    ] },
  // factory · The Grinder (终极碎糖机)
  { id: "grinder", name: {"en":"The Grinder","zh":"终极碎糖机"}, tag: {"en":"Grand finale","zh":"最终车间"}, goal: "grinder", chapter: 0, chapterName: {"en":"Candy Factory","zh":"糖果工厂"}, chapterTheme: "factory", theme: "factory", order: 6, dev: {"en":["stairs","rolling pins","saw","steamroller","grinder"],"zh":["楼梯","擀面杖","圆锯","压路滚筒","碎糖机"]}, start: [-8,7.2], stars: [9600,12000], span: [-9.8,13.6],
    parts: [
      { t: "box", x: -8, y: 6.95, w: 2.2, h: 0.5, c: "cream" },
      { t: "box", x: -8, y: 3.35, w: 0.6, h: 6.7, c: "lilac" },
      { t: "box", x: -6.1, y: 3.1, w: 1.2, h: 6.2, c: "pink" },
      { t: "box", x: -4.8999999999999995, y: 2.7, w: 1.2, h: 5.4, c: "cream" },
      { t: "box", x: -3.6999999999999997, y: 2.3, w: 1.2, h: 4.6, c: "pink" },
      { t: "box", x: -2.5, y: 1.9, w: 1.2, h: 3.8, c: "cream" },
      { t: "roller", x: -1.6, y: 4.4, r: 0.45, spin: 7, pts: 40 },
      { t: "roller", x: 0.4, y: 3.3, r: 0.5, spin: -6, pts: 40 },
      { t: "belt", x: 6.1, y: 1.4, w: 8.6, h: 0.4, belt: 2.4 },
      { t: "saw", x: 4, y: 2.1, r: 0.48, spin: 16, cut: true, ghost: true, pts: 200 },
      { t: "crusher", x: 6.6, y: 2.66, r: 0.64, amp: 1.2, period: 2.2, off: 0, pts: 350, soft: 0.6 },
      { t: "box", x: 9.85, y: 0.6, w: 0.25, h: 1.2, c: "metal" },
      { t: "box", x: 12.95, y: 1.6, w: 0.25, h: 3.2, c: "metal" },
      { t: "saw", x: 10.85, y: 0.55, r: 0.45, spin: -22, cut: true, ghost: true, pts: 0, kind: "grind" },
      { t: "saw", x: 11.95, y: 0.55, r: 0.45, spin: 22, cut: true, ghost: true, pts: 0, kind: "grind" },
      { t: "box", x: 14.2, y: 3.5, w: 0.6, h: 7, c: "pink" },
      { t: "box", x: 0.2, y: 2.3071796769724493, w: 3.6, h: 0.25, a: -15, c: "mint", mu: 0.002 }
    ],
    zones: [
      { kind: "grinder", goal: true, x0: 10, x1: 12.8, y0: 0, y1: 2.6, pts: 800 }
    ],
    collectibles: [
      { x: -5.2, y: 7.8, pts: 300 },
      { x: 1.8999999999999995, y: 3.2, pts: 300 },
      { x: 9, y: 2.2, pts: 300 }
    ] },
  // dessert · Sugar Stairs (糖霜台阶)
  // tuned 2026-10-18: tray starts 1 m later: a lazy drop off the stairs falls short
  { id: "dessert-01", name: {"en":"Sugar Stairs","zh":"糖霜台阶"}, tag: {"en":"Warm-up","zh":"先热热身"}, goal: "box", chapter: 1, chapterName: {"en":"Dessert Street","zh":"甜品街"}, chapterTheme: "dessert", theme: "dessert", order: 7, dev: {"en":["stairs"],"zh":["台阶"]}, start: [-6.6,5.6], stars: [2400,3000], span: [-8.4,9],
    parts: [
      { t: "box", x: -6.6, y: 5.35, w: 2.4, h: 0.5, c: "cream" },
      { t: "box", x: -6.6, y: 2.55, w: 0.6, h: 5.1, c: "lilac" },
      { t: "box", x: -4.65, y: 2.25, w: 1.5, h: 4.5, c: "pink" },
      { t: "box", x: -3.15, y: 1.75, w: 1.5, h: 3.5, c: "cream" },
      { t: "box", x: -1.65, y: 1.25, w: 1.5, h: 2.5, c: "pink" },
      { t: "box", x: -0.15, y: 0.75, w: 1.5, h: 1.5, c: "cream" },
      { t: "box", x: 2.4, y: 0.25, w: 3.6, h: 0.5, c: "cream" },
      { t: "box", x: 6.4, y: 0.25, w: 4, h: 0.5, c: "butter" },
      { t: "box", x: 4.3, y: 0.25, w: 0.2, h: 0.5, c: "pink" },
      { t: "box", x: 8.5, y: 0.8, w: 0.2, h: 1.6, c: "pink" },
      { t: "bumper", x: 8.8, y: 3.4, r: 0.45, boost: 4, pts: 100 }
    ],
    zones: [
      { kind: "box", goal: true, x0: 4.4, x1: 8.4, y0: 0, y1: 1.7, pts: 500 }
    ],
    collectibles: [
      { x: -2.4, y: 4.6, pts: 300 },
      { x: 0.4, y: 2.4, pts: 300 },
      { x: 5.8, y: 2.4, pts: 300 }
    ] },
  // dessert · Syrup Ferry (糖浆渡口)
  { id: "dessert-02", name: {"en":"Syrup Ferry","zh":"糖浆渡口"}, tag: {"en":"Catch the belt","zh":"搭上传送带"}, goal: "box", chapter: 1, chapterName: {"en":"Dessert Street","zh":"甜品街"}, chapterTheme: "dessert", theme: "dessert", order: 8, dev: {"en":["stairs","belt"],"zh":["台阶","传送带"]}, start: [-6.8,5.6], stars: [3200,6300], span: [-8.6,9.2],
    parts: [
      { t: "box", x: -6.8, y: 5.35, w: 2.2, h: 0.5, c: "cream" },
      { t: "box", x: -6.8, y: 2.55, w: 0.6, h: 5.1, c: "lilac" },
      { t: "box", x: -4.85, y: 2.25, w: 1.5, h: 4.5, c: "pink" },
      { t: "box", x: -3.35, y: 1.75, w: 1.5, h: 3.5, c: "cream" },
      { t: "box", x: -1.85, y: 1.25, w: 1.5, h: 2.5, c: "pink" },
      { t: "box", x: -0.35, y: 0.75, w: 1.5, h: 1.5, c: "cream" },
      { t: "belt", x: 1.9, y: 0.25, w: 3, h: 0.5, belt: 2.6 },
      { t: "box", x: 5.9, y: 0.25, w: 4.6, h: 0.5, c: "metal" },
      { t: "box", x: 3.5, y: 0.25, w: 0.2, h: 0.5, c: "pink" },
      { t: "box", x: 8.5, y: 0.8, w: 0.2, h: 1.6, c: "pink" },
      { t: "roller", x: -1.85, y: 3.4, r: 0.42, spin: -6, pts: 40 }
    ],
    zones: [
      { kind: "box", goal: true, x0: 3.6, x1: 8.4, y0: 0, y1: 1.7, pts: 500 }
    ],
    collectibles: [
      { x: -2.6, y: 3.8, pts: 300 },
      { x: 0.4, y: 2.4, pts: 300 },
      { x: 5.8, y: 2.4, pts: 300 }
    ] },
  // dessert · Rabbit Hole (兔子洞)
  // rebuilt 2026-10-18: benchmark archetype Rabbit's Hole: the crate is a hole in the counter close to the sling; a full-power fling sails over it
  { id: "dessert-03", name: {"en":"Rabbit Hole","zh":"兔子洞"}, tag: {"en":"The hole is close","zh":"洞就在跟前"}, goal: "box", chapter: 1, chapterName: {"en":"Dessert Street","zh":"甜品街"}, chapterTheme: "dessert", theme: "dessert", order: 9, dev: {"en":["counter hole","sugar glass","candy jar","saw"],"zh":["台面洞口","糖玻璃","糖罐","圆锯"]}, start: [-6.4,6.2], stars: [3400,4300], span: [-8.200000000000001,9.399999999999999],
    parts: [
      { t: "box", x: -6.4, y: 5.95, w: 2, h: 0.5, c: "cream" },
      { t: "box", x: -6.4, y: 2.85, w: 0.6, h: 5.7, c: "lilac" },
      { t: "box", x: -3.75, y: 0.7, w: 3.1, h: 1.4, c: "cream" },
      { t: "box", x: 4.2, y: 0.7, w: 8, h: 1.4, c: "pink" },
      { t: "box", x: 8.45, y: 1.6, w: 0.5, h: 3.2, c: "mint" },
      { t: "jar", x: 2.4, y: 1.95, w: 0.7, h: 1.1, c: "butter", hp: 2, pts: 250 },
      { t: "glass", x: -3.6, y: 2.3, w: 0.18, h: 1.8, c: "mint", hp: 3, pts: 350 },
      { t: "bumper", x: 3.8, y: 3.8, r: 0.45, boost: 4, pts: 100 },
      { t: "saw", x: 4.8, y: 1.85, r: 0.45, spin: -16, cut: true, ghost: true, pts: 200 }
    ],
    zones: [
      { kind: "box", goal: true, x0: -2.15, x1: 0.15, y0: 0, y1: 1.4, pts: 500 }
    ],
    collectibles: [
      { x: -3.8, y: 6.8, pts: 300 },
      { x: -1, y: 3, pts: 300 },
      { x: 3.8, y: 4.9, pts: 300 }
    ] },
  // dessert · Waffle Press (华夫压线)
  // tuned 2026-10-18: press stroke 2.0 -> 1.8: the waffle irons still bite but no longer wall off half the throws
  { id: "dessert-04", name: {"en":"Waffle Press","zh":"华夫压线"}, tag: {"en":"Time the presses","zh":"跟上冲压节奏"}, goal: "box", chapter: 1, chapterName: {"en":"Dessert Street","zh":"甜品街"}, chapterTheme: "dessert", theme: "dessert", order: 10, dev: {"en":["belt","presses"],"zh":["传送带","冲压机"]}, start: [-7,5.8], stars: [4600,8300], span: [-8.8,9.8],
    parts: [
      { t: "box", x: -7, y: 5.55, w: 2, h: 0.5, c: "cream" },
      { t: "box", x: -7, y: 2.65, w: 0.6, h: 5.3, c: "lilac" },
      { t: "box", x: -5.05, y: 2.25, w: 1.5, h: 4.5, c: "pink" },
      { t: "box", x: -3.55, y: 1.75, w: 1.5, h: 3.5, c: "cream" },
      { t: "box", x: -2.05, y: 1.25, w: 1.5, h: 2.5, c: "pink" },
      { t: "box", x: -0.55, y: 0.75, w: 1.5, h: 1.5, c: "cream" },
      { t: "belt", x: 2, y: 0.25, w: 3.6, h: 0.5, belt: 2.6 },
      { t: "press", x: 1.05, y: 3.1, w: 1.7, h: 1, amp: 1.8, period: 1.9, off: 0, pts: 300, soft: 0.75 },
      { t: "press", x: 2.9, y: 3.1, w: 1.7, h: 1, amp: 1.8, period: 1.4, off: 0.5, pts: 300, soft: 0.75 },
      { t: "box", x: 6.4, y: 0.25, w: 4.8, h: 0.5, c: "metal" },
      { t: "box", x: 3.9, y: 0.25, w: 0.2, h: 0.5, c: "pink" },
      { t: "box", x: 9.1, y: 0.8, w: 0.2, h: 1.6, c: "pink" }
    ],
    zones: [
      { kind: "box", goal: true, x0: 4, x1: 9, y0: 0, y1: 1.7, pts: 500 }
    ],
    collectibles: [
      { x: -1.6, y: 4.8, pts: 300 },
      { x: 2.4, y: 2.4, pts: 300 },
      { x: 6.4, y: 2.4, pts: 300 }
    ] },
  // dessert · Big Slide (大滑梯)
  // rebuilt 2026-10-18: benchmark archetype Big Slide Down: one long slide, a kicker, a syrup pit before the crate
  { id: "dessert-05", name: {"en":"Big Slide","zh":"大滑梯"}, tag: {"en":"Slide, then jump the syrup","zh":"滑下去，飞过糖浆"}, goal: "box", chapter: 1, chapterName: {"en":"Dessert Street","zh":"甜品街"}, chapterTheme: "dessert", theme: "dessert", order: 11, dev: {"en":["long slide","kicker","syrup pit"],"zh":["长滑梯","跳台","糖浆坑"]}, start: [-7.2,7.6], stars: [3800,4700], span: [-9,10.8],
    parts: [
      { t: "box", x: -7.2, y: 7.35, w: 2, h: 0.5, c: "cream" },
      { t: "box", x: -7.2, y: 3.55, w: 0.6, h: 7.1, c: "lilac" },
      { t: "box", x: -1.275, y: 4.075, w: 11.219, h: 0.25, a: -29.65, c: "butter", mu: 0.01 },
      { t: "box", x: 4.21, y: 1.558, w: 1.127, h: 0.25, a: 29.591, c: "mint", mu: 0.01 },
      { t: "box", x: 4.1, y: 0.55, w: 0.4, h: 1.1, c: "lilac" },
      { t: "box", x: 8.1, y: 0.3, w: 2.8, h: 0.6, c: "butter" },
      { t: "box", x: 9.75, y: 1.8, w: 0.5, h: 3.6, c: "pink" },
      { t: "glass", x: -1.75, y: 5.325, w: 0.18, h: 1.6, c: "mint", hp: 3, pts: 350 },
      { t: "bumper", x: 5.7, y: 4.437, r: 0.45, boost: 4, pts: 100 }
    ],
    zones: [
      { kind: "syrup", goal: false, x0: 4.8, x1: 6.65, y0: 0, y1: 0.9, pts: 150 },
      { kind: "box", goal: true, x0: 6.9, x1: 9.3, y0: 0.6, y1: 2.2, pts: 500 }
    ],
    collectibles: [
      { x: -4.15, y: 6.65, pts: 300 },
      { x: 5.7, y: 3.237, pts: 300 },
      { x: 7.9, y: 3, pts: 300 }
    ] },
  // dessert · Split Conveyor (断带车间)
  // tuned 2026-10-18: first belt 1.5 -> 1.3: the gap the level is named after is wider
  { id: "dessert-06", name: {"en":"Split Conveyor","zh":"断带车间"}, tag: {"en":"Mind the gap","zh":"当心断口"}, goal: "box", chapter: 1, chapterName: {"en":"Dessert Street","zh":"甜品街"}, chapterTheme: "dessert", theme: "dessert", order: 12, dev: {"en":["belt","crusher"],"zh":["传送带","压路机"]}, start: [-7,5.8], stars: [2600,3800], span: [-8.8,11.2],
    parts: [
      { t: "box", x: -7, y: 5.55, w: 2, h: 0.5, c: "cream" },
      { t: "box", x: -7, y: 2.65, w: 0.6, h: 5.3, c: "lilac" },
      { t: "box", x: -5.05, y: 2.25, w: 1.5, h: 4.5, c: "pink" },
      { t: "box", x: -3.55, y: 1.75, w: 1.5, h: 3.5, c: "cream" },
      { t: "box", x: -2.05, y: 1.25, w: 1.5, h: 2.5, c: "pink" },
      { t: "box", x: -0.55, y: 0.75, w: 1.5, h: 1.5, c: "cream" },
      { t: "belt", x: 0.85, y: 0.25, w: 1.3, h: 0.5, belt: 2.4 },
      { t: "belt", x: 5.8, y: 0.25, w: 7.6, h: 0.5, belt: 2.4 },
      { t: "crusher", x: 3.4, y: 1.52, r: 0.6, amp: 1.2, period: 2.4, off: 0.1, pts: 350, soft: 0.6 },
      { t: "saw", x: 6.6, y: 0.9, r: 0.45, spin: -22, cut: true, ghost: true, pts: 0, kind: "grind" },
      { t: "box", x: 9.9, y: 0.6, w: 0.25, h: 1.2, c: "metal" },
      { t: "box", x: 10.8, y: 2.4, w: 0.6, h: 4.8, c: "pink" }
    ],
    zones: [
      { kind: "box", goal: true, x0: 6.4, x1: 9.2, y0: 0, y1: 2, pts: 500 }
    ],
    collectibles: [
      { x: -3.4, y: 4.8, pts: 300 },
      { x: 3.4, y: 2.4, pts: 300 },
      { x: 7.8, y: 2.4, pts: 300 }
    ] },
  // dessert · Fudge Foundry (软糖铸造厂)
  // tuned 2026-10-18: chapter finale: the foundry belt now breaks before the grinder (0.45 gap, outside the crusher's travel)
  { id: "dessert-07", name: {"en":"Fudge Foundry","zh":"软糖铸造厂"}, tag: {"en":"Chapter finale","zh":"甜品街终章"}, goal: "grinder", chapter: 1, chapterName: {"en":"Dessert Street","zh":"甜品街"}, chapterTheme: "dessert", theme: "dessert", order: 13, dev: {"en":["belt","saw","grinder"],"zh":["传送带","圆锯","碎糖机"]}, start: [-7.6,6], stars: [5100,6900], span: [-9.2,14.6],
    parts: [
      { t: "box", x: -7.6, y: 5.75, w: 2.2, h: 0.5, c: "cream" },
      { t: "box", x: -7.6, y: 2.75, w: 0.6, h: 5.5, c: "lilac" },
      { t: "box", x: -5.65, y: 2.25, w: 1.5, h: 4.5, c: "pink" },
      { t: "box", x: -4.15, y: 1.75, w: 1.5, h: 3.5, c: "cream" },
      { t: "box", x: -2.65, y: 1.25, w: 1.5, h: 2.5, c: "pink" },
      { t: "box", x: -1.15, y: 0.75, w: 1.5, h: 1.5, c: "cream" },
      { t: "belt", x: 2.8, y: 0.25, w: 6.4, h: 0.5, belt: 3.4 },
      { t: "saw", x: 1, y: 1.35, r: 0.42, spin: 16, cut: true, ghost: true, pts: 200 },
      { t: "crusher", x: 4.2, y: 1.52, r: 0.6, amp: 1.2, period: 2.2, off: 0.15, pts: 350, soft: 0.6 },
      { t: "saw", x: 7.35, y: 0.9, r: 0.45, spin: -22, cut: true, ghost: true, pts: 0, kind: "grind" },
      { t: "saw", x: 9.65, y: 0.9, r: 0.45, spin: 22, cut: true, ghost: true, pts: 0, kind: "grind" },
      { t: "box", x: 10.4, y: 0.6, w: 0.25, h: 1.2, c: "metal" },
      { t: "box", x: 13, y: 1.6, w: 0.25, h: 3.2, c: "metal" },
      { t: "box", x: 14.25, y: 3.4, w: 0.6, h: 6.8, c: "pink" },
      { t: "belt", x: 8.225, y: 0.25, w: 3.55, h: 0.5, belt: 3.4 }
    ],
    zones: [
      { kind: "grinder", goal: true, x0: 7.2, x1: 9.8, y0: 0, y1: 2.6, pts: 800 }
    ],
    collectibles: [
      { x: -3.8, y: 4.8, pts: 300 },
      { x: 1, y: 2.9, pts: 300 },
      { x: 6.2, y: 2.4, pts: 300 }
    ] },
  // fair · Narrow Landing (窄台落点)
  // tuned 2026-10-18: chapter opener: landing 3 -> 3.6 wide and 1.6 -> 1.0 high; the stopper that the wider landing would bury is gone
  { id: "fair-01", name: {"en":"Narrow Landing","zh":"窄台落点"}, tag: {"en":"Aim small","zh":"落到窄台上"}, goal: "box", chapter: 2, chapterName: {"en":"Candy Fair","zh":"糖果游乐园"}, chapterTheme: "fair", theme: "fair", order: 14, dev: {"en":["stairs","narrow pad"],"zh":["台阶","窄台"]}, start: [-7,5.8], stars: [3000,4000], span: [-9,7.6],
    parts: [
      { t: "box", x: -7, y: 5.55, w: 2, h: 0.5, c: "cream" },
      { t: "box", x: -7, y: 2.65, w: 0.6, h: 5.3, c: "lilac" },
      { t: "box", x: -5.05, y: 2.25, w: 1.5, h: 4.5, c: "pink" },
      { t: "box", x: -3.55, y: 1.75, w: 1.5, h: 3.5, c: "cream" },
      { t: "box", x: -2.05, y: 1.25, w: 1.5, h: 2.5, c: "pink" },
      { t: "box", x: -0.55, y: 0.75, w: 1.5, h: 1.5, c: "cream" },
      { t: "box", x: 0.75, y: 0.25, w: 1.1, h: 0.5, c: "pink" },
      { t: "box", x: 3, y: 0.5, w: 3.6, h: 1, c: "butter" },
      { t: "box", x: 1.1, y: 0.5, w: 0.2, h: 1, c: "pink" },
      { t: "box", x: 4.9, y: 0.5, w: 0.2, h: 1, c: "pink" },
      { t: "bumper", x: -3.2, y: 4.3, r: 0.45, boost: 4.5, pts: 100 },
      { t: "box", x: 6.4, y: 2.4, w: 0.6, h: 4.8, c: "pink" }
    ],
    zones: [
      { kind: "box", goal: true, x0: 1.2, x1: 4.8, y0: 0, y1: 3, pts: 500 }
    ],
    collectibles: [
      { x: -2.6, y: 4.6, pts: 300 },
      { x: 0.2, y: 2.4, pts: 300 },
      { x: 3, y: 3.6, pts: 300 }
    ] },
  // fair · Three Holes (三个洞)
  // rebuilt 2026-10-18: benchmark archetype 3 Holes: three holes in a counter, the outer two are syrup traps
  { id: "fair-02", name: {"en":"Three Holes","zh":"三个洞"}, tag: {"en":"Only the middle one is a box","zh":"只有中间是包装盒"}, goal: "box", chapter: 2, chapterName: {"en":"Candy Fair","zh":"糖果游乐园"}, chapterTheme: "fair", theme: "fair", order: 15, dev: {"en":["three holes","syrup traps","pendulum blade"],"zh":["三个洞","糖浆陷阱","摆刀"]}, start: [-7.2,5.8], stars: [3800,5400], span: [-9,8.7],
    parts: [
      { t: "box", x: -7.2, y: 5.55, w: 2, h: 0.5, c: "cream" },
      { t: "box", x: -7.2, y: 2.65, w: 0.6, h: 5.3, c: "lilac" },
      { t: "box", x: -4.8, y: 0.5, w: 2.6, h: 1, c: "cream" },
      { t: "box", x: -0.9, y: 0.5, w: 1.6, h: 1, c: "pink" },
      { t: "box", x: 2.5, y: 0.5, w: 1.6, h: 1, c: "cream" },
      { t: "box", x: 6.3, y: 0.5, w: 2.4, h: 1, c: "cream" },
      { t: "box", x: 7.75, y: 1.7, w: 0.5, h: 3.4, c: "mint" },
      { t: "blade", x: -0.45, y: 3.4, w: 0.14, h: 1.4, amp: 1, period: 1.6, off: 0.2, cut: true, ghost: true, pts: 250 },
      { t: "bumper", x: 5.6, y: 3.2, r: 0.45, boost: 4, pts: 100 },
      { t: "jar", x: -0.9, y: 1.55, w: 0.7, h: 1.1, c: "butter", hp: 2, pts: 250 }
    ],
    zones: [
      { kind: "syrup", goal: false, x0: -3.45, x1: -1.75, y0: 0, y1: 0.8, pts: 120 },
      { kind: "box", goal: true, x0: -0.05, x1: 1.65, y0: 0, y1: 1, pts: 500 },
      { kind: "syrup", goal: false, x0: 3.35, x1: 5.05, y0: 0, y1: 0.8, pts: 120 }
    ],
    collectibles: [
      { x: -2.6, y: 2.5, pts: 300 },
      { x: 0.8, y: 5, pts: 300 },
      { x: 4.2, y: 2.5, pts: 300 }
    ] },
  // fair · Two Roads (双路径转盘)
  // tuned 2026-10-18: low road belt slowed: the low road no longer auto-delivers, so high or low is a real choice
  { id: "fair-03", name: {"en":"Two Roads","zh":"双路径转盘"}, tag: {"en":"High or low","zh":"走高台还是走低道"}, goal: "box", chapter: 2, chapterName: {"en":"Candy Fair","zh":"糖果游乐园"}, chapterTheme: "fair", theme: "fair", order: 16, dev: {"en":["two paths","belt"],"zh":["双路径","传送带"]}, start: [-7,6], stars: [2600,6400], span: [-9,10.2],
    parts: [
      { t: "box", x: -7, y: 5.75, w: 2, h: 0.5, c: "cream" },
      { t: "box", x: -7, y: 2.75, w: 0.6, h: 5.5, c: "lilac" },
      { t: "box", x: -5.05, y: 2.25, w: 1.5, h: 4.5, c: "pink" },
      { t: "box", x: -3.55, y: 1.75, w: 1.5, h: 3.5, c: "cream" },
      { t: "box", x: -2.05, y: 1.25, w: 1.5, h: 2.5, c: "pink" },
      { t: "box", x: -0.55, y: 0.75, w: 1.5, h: 1.5, c: "cream" },
      { t: "belt", x: 4.2, y: 0.25, w: 8, h: 0.5, belt: 0.8 },
      { t: "roller", x: -0.75, y: 2.4, r: 0.42, spin: -7, pts: 40 },
      { t: "box", x: 3, y: 4.2, w: 2.2, h: 0.3, c: "cream", mu: 0.03 },
      { t: "box", x: 6, y: 4.8, w: 2, h: 0.3, c: "cream", mu: 0.03 },
      { t: "box", x: 8.6, y: 0.6, w: 0.25, h: 1.2, c: "metal" },
      { t: "box", x: 9.2, y: 2.6, w: 0.6, h: 5.2, c: "pink" }
    ],
    zones: [
      { kind: "box", goal: true, x0: 6.2, x1: 8, y0: 0, y1: 1.7, pts: 500 }
    ],
    collectibles: [
      { x: 3, y: 5.9, pts: 300 },
      { x: 6, y: 6.5, pts: 300 },
      { x: 6.6, y: 2.4, pts: 300 }
    ] },
  // fair · Zigzag (之字滑道)
  // rebuilt 2026-10-18: benchmark archetype Zigzag: two switchback chutes bring the bear back under the sling
  { id: "fair-04", name: {"en":"Zigzag","zh":"之字滑道"}, tag: {"en":"The goal is under the sling","zh":"终点在弹弓下面"}, goal: "box", chapter: 2, chapterName: {"en":"Candy Fair","zh":"糖果游乐园"}, chapterTheme: "fair", theme: "fair", order: 17, dev: {"en":["switchback chutes","saw","sugar glass"],"zh":["折返滑道","圆锯","糖玻璃"]}, start: [-6.2,6.125], stars: [7000,8000], span: [-8,3.92],
    parts: [
      { t: "box", x: -6.2, y: 5.875, w: 2, h: 0.5, c: "cream" },
      { t: "box", x: -6.2, y: 2.812, w: 0.6, h: 5.625, c: "lilac" },
      { t: "box", x: -2.38, y: 4.319, w: 7.027, h: 0.25, a: -5, c: "butter", mu: 0.02 },
      { t: "box", x: -1.005, y: 1.906, w: 8.173, h: 0.25, a: -175.703, c: "pink", mu: 0.02 },
      { t: "box", x: -4.7, y: 0.25, w: 2.4, h: 0.5, c: "cream" },
      { t: "box", x: -3.4, y: 0.8, w: 0.2, h: 0.6, c: "pink" },
      { t: "saw", x: -2.03, y: 2.437, r: 0.4, spin: 16, cut: true, ghost: true, pts: 200 },
      { t: "bumper", x: 1.72, y: 6.225, r: 0.45, boost: 4, pts: 100 },
      { t: "glass", x: -3.43, y: 5.29, w: 0.18, h: 1.4, c: "mint", hp: 3, pts: 350 },
      { t: "box", x: 3.32, y: 3.063, w: 0.5, h: 6.125, c: "mint" }
    ],
    zones: [
      { kind: "box", goal: true, x0: -5.8, x1: -3.6, y0: 0.5, y1: 2.1, pts: 500 }
    ],
    collectibles: [
      { x: -2.38, y: 5.325, pts: 300 },
      { x: -2.38, y: 2.612, pts: 300 },
      { x: 1.72, y: 7.425, pts: 300 }
    ] },
  // fair · Roller Coaster (过山车压线)
  { id: "fair-05", name: {"en":"Roller Coaster","zh":"过山车压线"}, tag: {"en":"Perfect timing","zh":"卡准三拍"}, goal: "box", chapter: 2, chapterName: {"en":"Candy Fair","zh":"糖果游乐园"}, chapterTheme: "fair", theme: "fair", order: 18, dev: {"en":["belt","three presses"],"zh":["传送带","三台冲压"]}, start: [-7.8,6.2], stars: [4700,14400], span: [-9.4,12.4],
    parts: [
      { t: "box", x: -7.8, y: 5.95, w: 2, h: 0.5, c: "cream" },
      { t: "box", x: -7.8, y: 2.85, w: 0.6, h: 5.7, c: "lilac" },
      { t: "box", x: -5.85, y: 2.25, w: 1.5, h: 4.5, c: "pink" },
      { t: "box", x: -4.35, y: 1.75, w: 1.5, h: 3.5, c: "cream" },
      { t: "box", x: -2.85, y: 1.25, w: 1.5, h: 2.5, c: "pink" },
      { t: "box", x: -1.35, y: 0.75, w: 1.5, h: 1.5, c: "cream" },
      { t: "belt", x: 2.75, y: 0.25, w: 6.699999999999999, h: 0.5, belt: 2.4 },
      { t: "press", x: 0.3, y: 3.1, w: 1.6, h: 1, amp: 2, period: 1.8, off: 0, pts: 300, soft: 0.75 },
      { t: "press", x: 2.5, y: 3.1, w: 1.6, h: 1, amp: 2, period: 1.5, off: 0.33, pts: 300, soft: 0.75 },
      { t: "press", x: 4.7, y: 3.1, w: 1.6, h: 1, amp: 2, period: 1.2, off: 0.66, pts: 300, soft: 0.75 },
      { t: "box", x: 10.8, y: 0.6, w: 0.25, h: 1.2, c: "metal" },
      { t: "box", x: 12, y: 2.6, w: 0.6, h: 5.2, c: "pink" },
      { t: "box", x: 8.399999999999999, y: 0.325, w: 3.5999999999999996, h: 0.65, c: "butter" }
    ],
    zones: [
      { kind: "box", goal: true, x0: 6.6, x1: 10.2, y0: 0.65, y1: 2.25, pts: 500 }
    ],
    collectibles: [
      { x: -1.6, y: 2.4, pts: 300 },
      { x: 1.6, y: 2.4, pts: 300 },
      { x: 4.4, y: 2.4, pts: 300 }
    ] },
  // fair · Candy Tower (糖塔)
  // rebuilt 2026-10-18: a crate on a tower: a flat fling hits the wall, only a lob lands
  { id: "fair-06", name: {"en":"Candy Tower","zh":"糖塔"}, tag: {"en":"Lob it onto the top","zh":"抛高，落在塔顶"}, goal: "box", chapter: 2, chapterName: {"en":"Candy Fair","zh":"糖果游乐园"}, chapterTheme: "fair", theme: "fair", order: 19, dev: {"en":["tower top","bumper","saw"],"zh":["塔顶","弹珠","圆锯"]}, start: [-7.2,4.6], stars: [2300,3300], span: [-9,7.3],
    parts: [
      { t: "box", x: -7.2, y: 4.35, w: 2, h: 0.5, c: "cream" },
      { t: "box", x: -7.2, y: 2.05, w: 0.6, h: 4.1, c: "lilac" },
      { t: "box", x: 1.2, y: 1.5, w: 2.6, h: 3, c: "lilac" },
      { t: "box", x: 0, y: 3.3, w: 0.2, h: 0.6, c: "pink" },
      { t: "box", x: 2.4, y: 3.3, w: 0.2, h: 0.6, c: "pink" },
      { t: "box", x: 6.7, y: 3.2, w: 0.5, h: 6.4, c: "mint" },
      { t: "bumper", x: 4.7, y: 5.2, r: 0.48, boost: 5, pts: 100 },
      { t: "saw", x: 4.1, y: 0.45, r: 0.45, spin: -16, cut: true, ghost: true, pts: 200 },
      { t: "glass", x: -2.5, y: 4.6, w: 0.18, h: 1.6, c: "mint", hp: 3, pts: 350 }
    ],
    zones: [
      { kind: "box", goal: true, x0: 0.1, x1: 2.3, y0: 3, y1: 4.6, pts: 500 }
    ],
    collectibles: [
      { x: -4.2, y: 6.2, pts: 300 },
      { x: 1.2, y: 6.2, pts: 300 },
      { x: 4.7, y: 6.4, pts: 300 }
    ] },
  // fair · Grand Carousel (终极旋转木马)
  { id: "fair-07", name: {"en":"Grand Carousel","zh":"终极旋转木马"}, tag: {"en":"Grand finale","zh":"游乐园终章"}, goal: "grinder", chapter: 2, chapterName: {"en":"Candy Fair","zh":"糖果游乐园"}, chapterTheme: "fair", theme: "fair", order: 20, dev: {"en":["belt","crusher","grinder"],"zh":["传送带","压路机","碎糖机"]}, start: [-8.4,6.8], stars: [7100,8300], span: [-10,15.1],
    parts: [
      { t: "box", x: -8.4, y: 6.55, w: 2.2, h: 0.5, c: "cream" },
      { t: "box", x: -8.4, y: 3.15, w: 0.6, h: 6.3, c: "lilac" },
      { t: "box", x: -6.8, y: 3.25, w: 1.25, h: 6.5, c: "pink" },
      { t: "box", x: -5.55, y: 2.6, w: 1.25, h: 5.2, c: "cream" },
      { t: "box", x: -4.3, y: 1.95, w: 1.25, h: 3.9, c: "pink" },
      { t: "box", x: -3.05, y: 1.3, w: 1.25, h: 2.6, c: "cream" },
      { t: "box", x: -1.8, y: 0.65, w: 1.25, h: 1.3, c: "pink" },
      { t: "belt", x: 2.7125, y: 0.25, w: 7.7749999999999995, h: 0.5, belt: 2.8 },
      { t: "saw", x: 0.8, y: 1.35, r: 0.42, spin: 16, cut: true, ghost: true, pts: 200 },
      { t: "crusher", x: 4.2, y: 1.52, r: 0.62, amp: 1.2, period: 2.2, off: 0, pts: 350, soft: 0.6 },
      { t: "saw", x: 6.6, y: 1.1, r: 0.45, spin: -22, cut: true, ghost: true, pts: 0, kind: "grind" },
      { t: "saw", x: 9.7, y: 1.1, r: 0.45, spin: 22, cut: true, ghost: true, pts: 0, kind: "grind" },
      { t: "box", x: 10.9, y: 0.6, w: 0.25, h: 1.2, c: "metal" },
      { t: "box", x: 13.5, y: 1.6, w: 0.25, h: 3.2, c: "metal" },
      { t: "box", x: 14.75, y: 3.4, w: 0.6, h: 6.8, c: "pink" },
      { t: "box", x: 8.45, y: 0.275, w: 2.9000000000000004, h: 0.55, c: "butter" }
    ],
    zones: [
      { kind: "grinder", goal: true, x0: 7, x1: 9.9, y0: 0.55, y1: 2.1500000000000004, pts: 800 }
    ],
    collectibles: [
      { x: -4, y: 6.2, pts: 300 },
      { x: 1.2, y: 2.9, pts: 300 },
      { x: 5.2, y: 2.4, pts: 300 }
    ] }
];

const deepFreeze = (o) => { if (o && typeof o === "object" && !Object.isFrozen(o)) { Object.freeze(o); for (const v of Object.values(o)) deepFreeze(v); } return o; };

export const OFFICIAL_LEVELS = Object.freeze(RAW_LEVELS.map((lv) => deepFreeze({ ...lv })));
export const levelById = (id) => OFFICIAL_LEVELS.find((l) => l.id === id) || null;
export const levelIndex = (id) => OFFICIAL_LEVELS.findIndex((l) => l.id === id);

/* the three chapters, in order.  chapter is zero-based (0 factory / 1 dessert / 2 fair) and
   the front end groups by floor(index / 7); CHAPTERS is the same metadata without the levels. */
export const CHAPTERS = Object.freeze([
  { chapter: 0, chapterName: { en: "Candy Factory", zh: "糖果工厂" }, chapterTheme: "factory", theme: "factory" },
  { chapter: 1, chapterName: { en: "Dessert Street", zh: "甜品街" }, chapterTheme: "dessert", theme: "dessert" },
  { chapter: 2, chapterName: { en: "Candy Fair", zh: "糖果游乐园" }, chapterTheme: "fair", theme: "fair" },
].map(deepFreeze));
export const levelsOfChapter = (n) => OFFICIAL_LEVELS.filter((l) => l.chapter === n);

/* one verified, repeatable delivery command per level (measured with the real simulateRun at
   sling 0).  The browser sweep can replay these instead of searching offline.  Every entry
   scores at least one star, so no level is unpassable. */
export const LEVEL_SOLUTIONS = Object.freeze(deepFreeze({
  "stairway": {
    "seed": 1,
    "vx": 11.95433637710095,
    "vy": 1.0458689129718983,
    "degree": 5,
    "power": 0.8,
    "score": 7455,
    "stars": 3
  },
  "rolling-pins": {
    "seed": 1,
    "vx": 4.635342674190491,
    "vy": 7.714505706319011,
    "degree": 59,
    "power": 0.6,
    "score": 12422,
    "stars": 3
  },
  "juicer": {
    "seed": 1,
    "vx": 13.30352107758513,
    "vy": 5.106743281020531,
    "degree": 21,
    "power": 0.95,
    "score": 6484,
    "stars": 2
  },
  "pinball": {
    "seed": 1,
    "vx": 12.332863678175116,
    "vy": 5.490944681523304,
    "degree": 24,
    "power": 0.9,
    "score": 4483,
    "stars": 3
  },
  "steamroller": {
    "seed": 1,
    "vx": 1.4325974657521758,
    "vy": 8.124663962350716,
    "degree": 80,
    "power": 0.55,
    "score": 15588,
    "stars": 3
  },
  "slicer": {
    "seed": 1,
    "vx": 8.490482777506188,
    "vy": 7.380664076143208,
    "degree": 41,
    "power": 0.75,
    "score": 7496,
    "stars": 3
  },
  "grinder": {
    "seed": 1,
    "vx": 2.530699361368481,
    "vy": 10.961663228833899,
    "degree": 77,
    "power": 0.75,
    "score": 16024,
    "stars": 3
  },
  "dessert-01": {
    "seed": 1,
    "vx": 6.342925190304882,
    "vy": 2.308635967448264,
    "degree": 20,
    "power": 0.45,
    "score": 3638,
    "stars": 3
  },
  "dessert-02": {
    "seed": 1,
    "vx": 1.7598877317025985,
    "vy": 11.111493831695304,
    "degree": 81,
    "power": 0.75,
    "score": 5314,
    "stars": 2
  },
  "dessert-03": {
    "seed": 1,
    "vx": 8.25,
    "vy": 0,
    "degree": 0,
    "power": 0.55,
    "score": 3254,
    "stars": 1
  },
  "dessert-04": {
    "seed": 1,
    "vx": 5.638155724715451,
    "vy": 2.0521208599540124,
    "degree": 20,
    "power": 0.4,
    "score": 13454,
    "stars": 3
  },
  "dessert-05": {
    "seed": 1,
    "vx": 3.6881713927109203,
    "vy": 13.764443024619224,
    "degree": 75,
    "power": 0.95,
    "score": 5890,
    "stars": 3
  },
  "dessert-06": {
    "seed": 1,
    "vx": 11.934262744419282,
    "vy": 1.2543415592118419,
    "degree": 6,
    "power": 0.8,
    "score": 6383,
    "stars": 3
  },
  "dessert-07": {
    "seed": 1,
    "vx": 3.334696397425271,
    "vy": 9.162003052662605,
    "degree": 70,
    "power": 0.65,
    "score": 7836,
    "stars": 3
  },
  "fair-01": {
    "seed": 1,
    "vx": 11.528492169843005,
    "vy": 8.375939845167744,
    "degree": 36,
    "power": 0.95,
    "score": 3369,
    "stars": 2
  },
  "fair-02": {
    "seed": 1,
    "vx": 8.617999985088503,
    "vy": 7.231360608973566,
    "degree": 40,
    "power": 0.75,
    "score": 7211,
    "stars": 3
  },
  "fair-03": {
    "seed": 1,
    "vx": 6.713022793735845,
    "vy": 0.7055671270566608,
    "degree": 6,
    "power": 0.45,
    "score": 7619,
    "stars": 3
  },
  "fair-04": {
    "seed": 1,
    "vx": 10.866665545752019,
    "vy": 2.911714257403358,
    "degree": 15,
    "power": 0.75,
    "score": 8247,
    "stars": 3
  },
  "fair-05": {
    "seed": 1,
    "vx": 11.892549817311727,
    "vy": 8.640443208699354,
    "degree": 36,
    "power": 0.98,
    "score": 3884,
    "stars": 1
  },
  "fair-06": {
    "seed": 1,
    "vx": 8.173464218002406,
    "vy": 11.672916631118133,
    "degree": 55,
    "power": 0.95,
    "score": 7153,
    "stars": 3
  },
  "fair-07": {
    "seed": 1,
    "vx": 12.556298850905657,
    "vy": 2.2140142652533625,
    "degree": 10,
    "power": 0.85,
    "score": 9435,
    "stars": 3
  }
}));

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
