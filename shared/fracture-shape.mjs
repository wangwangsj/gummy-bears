/* Pure presentation geometry and debris motion. No world/physics/scoring imports and no
   shared RNG: calling this module can never consume an authoritative simulation draw. */
export const FRACTURE_MAX = 200;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
function seeded(seed) {
  let s = seed >>> 0;
  return () => { s += 0x6D2B79F5; let t = Math.imul(s ^ s >>> 15, 1 | s); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const triangle = (out, a, b, c) => out.push(...a, ...b, ...c);
function prism(poly, depth) {
  const v = [], z = depth / 2;
  for (let i = 1; i < poly.length - 1; i++) {
    triangle(v, [...poly[0], z], [...poly[i], z], [...poly[i + 1], z]);
    triangle(v, [...poly[0], -z], [...poly[i + 1], -z], [...poly[i], -z]);
  }
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    triangle(v, [...a, z], [...a, -z], [...b, z]); triangle(v, [...b, z], [...a, -z], [...b, -z]);
  }
  return v;
}
function box(w, h, d) { return prism([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], d); }
function cylinder(radius, height) {
  const v = [], n = 12;
  for (let i = 0; i < n; i++) {
    const a = i * Math.PI * 2 / n, b = (i + 1) * Math.PI * 2 / n;
    const p = [Math.cos(a) * radius, -height / 2, Math.sin(a) * radius], q = [Math.cos(b) * radius, -height / 2, Math.sin(b) * radius];
    const r = [p[0], height / 2, p[2]], s = [q[0], height / 2, q[2]];
    triangle(v, p, r, q); triangle(v, q, r, s); triangle(v, [0, height / 2, 0], s, r); triangle(v, [0, -height / 2, 0], p, q);
  }
  return v;
}
export function generateFracture(part, impact = {}, seed = 1) {
  if (!['glass', 'jar', 'crate'].includes(part.t)) return [];
  const random = seeded(seed), pieces = [], w = part.w, h = part.h;
  const cx = part.cx ?? part.x ?? 0, cy = part.cy ?? part.y ?? 0, ang = part.ang || 0, c = Math.cos(ang), s = Math.sin(ang);
  const iv = impact.velocity || [0, 0, 0], normal = impact.normal || [-1, 0, 0];
  const speed = clamp(impact.speed || Math.hypot(...iv), 2, 24);
  const length = Math.hypot(iv[0], iv[1]) || 1;
  const dx = length > 1e-6 && Math.hypot(iv[0], iv[1]) > .1 ? iv[0] / length : -normal[0];
  const dy = length > 1e-6 && Math.hypot(iv[0], iv[1]) > .1 ? iv[1] / length : -normal[1];
  function add(kind, material, verts, center, extra = {}) {
    const [x, y, z] = center, wx = cx + c * x - s * y, wy = cy + s * x + c * y;
    const p = impact.point || [cx, cy, 0], rx = wx - p[0], ry = wy - p[1], rl = Math.hypot(rx, ry) || 1;
    const spray = .6 + random() * 1.2, drive = speed * (.3 + random() * .16);
    pieces.push({ kind, material, vertices: verts, localCenter: center,
      position: [wx, wy, z], rotation: [0, 0, ang],
      velocity: [dx * drive + rx / rl * spray, dy * drive + ry / rl * spray + .6 + random() * .9, (random() - .5) * 2.1 + (iv[2] || 0) * .2],
      spin: [(random() - .5) * 10, (random() - .5) * 10, (random() - .5) * 8],
      life: 2.8 + random() * 1.4, tint: random(), radius: Math.min(.11, Math.max(.025, h * .025)), ...extra });
  }
  if (part.t === 'glass') {
    // A shared jittered grid is triangulated, not a bag of randomly placed triangles:
    // both pane faces are fully tiled with coincident fracture boundaries and no holes.
    const depth = part.depth || 1.5, narrow = w < depth, faceWidth = narrow ? depth : w;
    const nx = clamp(Math.round(faceWidth / h * 4), 2, 5), ny = clamp(Math.round(h / faceWidth * 3), 2, 5), grid = [];
    for (let y = 0; y <= ny; y++) {
      const row = [];
      for (let x = 0; x <= nx; x++) row.push([-faceWidth / 2 + faceWidth * (x + (x > 0 && x < nx ? (random() - .5) * .55 : 0)) / nx,
        -h / 2 + h * (y + (y > 0 && y < ny ? (random() - .5) * .55 : 0)) / ny]);
      grid.push(row);
    }
    const thickness = Math.min(.026, w * .2);
    for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
      const a = grid[y][x], b = grid[y][x + 1], d = grid[y + 1][x], e = grid[y + 1][x + 1];
      const tris = random() < .5 ? [[a, b, e], [a, e, d]] : [[a, b, d], [b, e, d]];
      for (const outline of tris) {
        const mx = outline.reduce((sum, p) => sum + p[0], 0) / 3, my = outline.reduce((sum, p) => sum + p[1], 0) / 3;
        const v = prism(outline.map(p => [p[0] - mx, p[1] - my]), thickness);
        // The usual .18-wide obstacle is a yz sheet (1.5 deep), not a tiny xy ribbon.
        // A wide pane uses xy; swapping x/z is done in local space before the part pose.
        if (narrow) for (let i = 0; i < v.length; i += 3) { const x = v[i]; v[i] = -v[i + 2]; v[i + 2] = x; }
        for (const side of [-1, 1]) add('shard', 'glass', v,
          narrow ? [side * (w / 2 - thickness / 2), my, mx] : [mx, my, side * (depth / 2 - thickness / 2)],
          { outline, side, thickness });
      }
    }
  } else if (part.t === 'jar') {
    // Closed curved shell patches follow the intact cylinder, not flat chips in a cloud.
    const rad = w / 2, thick = Math.min(.06, w * .055), rows = 3, columns = 8;
    for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
      const lo = col * Math.PI * 2 / columns, hi = (col + 1) * Math.PI * 2 / columns;
      const y0 = -h / 2 + row * h / rows, y1 = y0 + h / rows, mid = (hi + lo) / 2;
      const center = [Math.cos(mid) * (rad - thick / 2), (y0 + y1) / 2, Math.sin(mid) * (rad - thick / 2)], v = [];
      const at = (a, y, r) => [Math.cos(a) * r - center[0], y - center[1], Math.sin(a) * r - center[2]];
      for (let j = 0; j < 4; j++) {
        const a = lo + (hi - lo) * j / 4, b = lo + (hi - lo) * (j + 1) / 4;
        const p = at(a, y0, rad), q = at(b, y0, rad), r = at(a, y1, rad), t = at(b, y1, rad);
        const pi = at(a, y0, rad - thick), qi = at(b, y0, rad - thick), ri = at(a, y1, rad - thick), ti = at(b, y1, rad - thick);
        triangle(v, p, r, q); triangle(v, q, r, t); triangle(v, pi, qi, ri); triangle(v, qi, ti, ri);
        triangle(v, r, ri, t); triangle(v, t, ri, ti); triangle(v, p, q, pi); triangle(v, q, qi, pi);
        if (j === 0) { triangle(v, p, pi, r); triangle(v, r, pi, ri); }
        if (j === 3) { triangle(v, q, t, qi); triangle(v, t, ti, qi); }
      }
      add('shell', 'shell', v, center, { thickness: thick });
    }
    add('lid', 'lid', cylinder(w * .56, .14), [0, h / 2 + .02, 0]);
  } else {
    const count = 8, plankW = Math.min(w / count * .94, h / 7);
    for (let i = 0; i < count; i++) for (const side of [-1, 1]) {
      const length = h * (.8 + random() * .18), width = plankW * (.8 + random() * .2);
      add('plank', 'wood', box(width, length, .065), [-w / 2 + w * (i + .5) / count, (random() - .5) * h * .08, side * .66], { aspect: length / width });
    }
    for (let i = 0; i < 12; i++) {
      const length = .08 + random() * .18, width = length * .2;
      add('chip', 'wood', prism([[-width, -length / 2], [width, -length * .2], [width * .3, length / 2]], .025), [(random() - .5) * w, (random() - .5) * h, (random() - .5) * 1.2]);
    }
  }
  return pieces;
}
export function createFracturePool({ max = FRACTURE_MAX } = {}) {
  const cap = clamp(Math.floor(max) || FRACTURE_MAX, 1, FRACTURE_MAX), pieces = [];
  return {
    pieces,
    spawn(shapes) {
      for (const f of shapes) {
        if (pieces.length >= cap) pieces.shift();
        pieces.push({ ...f, position: [...f.position], velocity: [...f.velocity], rotation: [...f.rotation], spin: [...f.spin] });
      }
    },
    step(dt, { gravity = -16, floorY = 0, parts = [] } = {}) {
      if (!(dt > 0) || !Number.isFinite(dt)) return;
      // Stable presentation substeps keep floor bounces stable even after a slow frame.
      let remaining = Math.min(dt, .25);
      while (remaining > 1e-8) {
        const h = Math.min(remaining, 1 / 120); remaining -= h;
        for (const f of pieces) {
          f.life -= h;
          const p = f.position, v = f.velocity, previousY = p[1];
          v[1] += gravity * h;
          for (let k = 0; k < 3; k++) { p[k] += v[k] * h; f.rotation[k] += f.spin[k] * h; }
          let surface = floorY;
          if (v[1] < 0) for (const P of parts) {
            if (P.broken || P.round || P.ghost || Math.abs(P.ang || 0) > .001 || !P.w || !P.h) continue;
            const top = P.cy + P.h / 2;
            if (Math.abs(p[0] - P.cx) < P.w / 2 && previousY - f.radius >= top - .02 && p[1] - f.radius < top) surface = Math.max(surface, top);
          }
          if (p[1] < surface + f.radius && v[1] < 0) {
            p[1] = surface + f.radius; v[1] *= -.32; v[0] *= .7; v[2] *= .7;
            for (let k = 0; k < 3; k++) f.spin[k] *= .65;
          }
        }
      }
      let n = 0;
      for (const f of pieces) if (f.life > 0) pieces[n++] = f;
      pieces.length = n;
    },
    clear() { pieces.length = 0; },
  };
}
