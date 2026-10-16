/* shared/physics.mjs - the gummy bear soft body, extracted from parts/core.js (lines 1-526).
   Ten mass points, shape matching + PBD links, cut fragments, strands, bear<->bear separation.
   Pure arithmetic: no DOM, no THREE, no Math.random, no page globals.  What the original read
   from the page-level CFG / collideWorld / Math.random arrives through an "env" object:
     env.cfg                    physics tuning (see sim.mjs makeCfg)
     env.rng()                  seeded [0,1) source
     env.collideWorld(bear, h)  level collision, called once per substep (optional)
   The maths below is verbatim; only the global reads were rebound. */
// wobble -> solver stiffness.  low wobble = firm candy, high = jelly
export function solve(CFG){
  const w = CFG.wobble;
  return {
    shape: 0.26 - 0.20 * w,   // per-substep shape-match blend
    dist:  0.90 - 0.55 * w,   // distance-constraint stiffness
    align: (0.16 - 0.14 * w) * CFG.upright,   // how fast the bear rights itself
    drag:  (0.006 - 0.004 * w) * CFG.air, // per-substep air drag
    wob:   w,
  };
}

/* ============================================================
   1 · BEAR RIG — 10 mass points, y up, z toward the viewer
   [name, x, y, z, fieldRadius]
   ============================================================ */
/* Classic gummy-bear proportions, rig height ~1.0.  Every value here is a
   field ball, so the silhouette IS these numbers: the head is the widest thing
   above the waist, the ears are bumps level with the skull, the muzzle stays
   inside the head, and nothing fills the crotch between the legs. */
const RIG_DEF = [
  ['body',   0.000, 0.400,  0.000, 0.248],
  ['belly',  0.000, 0.290,  0.092, 0.175],
  ['head',   0.000, 0.720,  0.000, 0.242],
  ['snout',  0.000, 0.648,  0.208, 0.118],
  ['earL',  -0.198, 0.925, -0.012, 0.092],
  ['earR',   0.198, 0.925, -0.012, 0.092],
  ['handL', -0.335, 0.385,  0.058, 0.122],
  ['handR',  0.335, 0.385,  0.058, 0.122],
  ['footL', -0.198, 0.085,  0.072, 0.128],
  ['footR',  0.198, 0.085,  0.072, 0.128],
];
// stretchy strands: rendered as interpolated field balls, thinned by stretch
const CHAINS = [
  ['body', 'head'], ['body', 'belly'], ['head', 'snout'], ['head', 'earL'], ['head', 'earR'],
  ['body', 'handL'], ['body', 'handR'], ['body', 'footL'], ['body', 'footR'],
];
// subtractive field balls: the crotch between the legs and the hollow under
// each arm. without them the metaball merges everything into one barrel.
const CARVE = [
  { a: 'footL', b: 'footR', t: 0.5,  off: [0, -0.020, 0.012], r: 0.235 }, // crotch
  { a: 'body',  b: 'handL', t: 0.52, off: [0, -0.060, 0.0], r: 0.120 },   // armpit
  { a: 'body',  b: 'handR', t: 0.52, off: [0, -0.060, 0.0], r: 0.120 },
];
// shear / bend guards so the bear cannot collapse into a puddle
const BRACES = [
  ['earL', 'earR'], ['handL', 'handR'], ['footL', 'footR'], ['head', 'belly'],
  ['snout', 'body'], ['head', 'footL'], ['head', 'footR'], ['head', 'handL'], ['head', 'handR'],
  ['belly', 'footL'], ['belly', 'footR'], ['belly', 'handL'], ['belly', 'handR'],
  ['earL', 'snout'], ['earR', 'snout'],
];
const MASS = { body: 1.6, belly: 1.0, head: 1.15, snout: 0.25, earL: 0.18, earR: 0.18,
               handL: 0.35, handR: 0.35, footL: 0.5, footR: 0.5 };

export const RIG = (() => {
  const n = RIG_DEF.length;
  const idx = Object.create(null);
  const rest = new Float32Array(n * 3), rad = new Float32Array(n),
        inv = new Float32Array(n), mass = new Float32Array(n), col = new Float32Array(n);
  RIG_DEF.forEach((d, i) => {
    idx[d[0]] = i;
    rest[i * 3] = d[1]; rest[i * 3 + 1] = d[2]; rest[i * 3 + 2] = d[3];
    rad[i] = d[4]; col[i] = d[4] * 1.02;   // the isosurface reaches past the ball, so bears stop a hair early
    mass[i] = MASS[d[0]]; inv[i] = 1 / MASS[d[0]];
  });
  // shape matching needs the rest pose about its own centre of mass, otherwise the
  // target is com + rest and every bear walks itself upward through the table
  let mx = 0, my = 0, mz = 0, mm = 0;
  for (let i = 0; i < n; i++) {
    mm += mass[i];
    mx += rest[i * 3] * mass[i]; my += rest[i * 3 + 1] * mass[i]; mz += rest[i * 3 + 2] * mass[i];
  }
  mx /= mm; my /= mm; mz /= mm;
  const rec = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    rec[i * 3] = rest[i * 3] - mx; rec[i * 3 + 1] = rest[i * 3 + 1] - my; rec[i * 3 + 2] = rest[i * 3 + 2] - mz;
  }
  const restY = my;                              // rest centre-of-mass height above the floor
  let minY = 1e9;                                // lowest point of the rest pose, incl. radius
  for (let i = 0; i < n; i++) minY = Math.min(minY, rest[i * 3 + 1] - col[i]);
  const link = (a, b, k) => {
    const i = idx[a], j = idx[b];
    const dx = rest[i * 3] - rest[j * 3], dy = rest[i * 3 + 1] - rest[j * 3 + 1],
          dz = rest[i * 3 + 2] - rest[j * 3 + 2];
    return { i, j, rest: Math.hypot(dx, dy, dz), k };
  };
  return {
    n, idx, rest, rec, restY, minY, rad, col, inv, mass,
    chains: CHAINS.map(([a, b]) => link(a, b, 1)),
    carve: CARVE.map((c) => ({ i: idx[c.a], j: idx[c.b], t: c.t, off: c.off, r: c.r })),
    braces: BRACES.map(([a, b]) => link(a, b, 1)),
    links: [...CHAINS.map(([a, b]) => link(a, b, 1)), ...BRACES.map(([a, b]) => link(a, b, 1))],
    // strand samples per chain, and the radius factor they carry
    strandT: [0.34, 0.67],
    strandR: 0.66,
  };
})();


/* ============================================================
   2 · SOFT BODY — volume-preserving shape matching + PBD links
   ============================================================ */
const _A = new Float32Array(9), _R = new Float32Array(9), _I = new Float32Array(9), _T = new Float32Array(9);

function invert3(m, out) {
  const a = m[0], b = m[1], c = m[2], d = m[3], e = m[4], f = m[5], g = m[6], h = m[7], i = m[8];
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  if (!(Math.abs(det) > 1e-9)) return 0;
  const k = 1 / det;
  out[0] = A * k; out[1] = (c * h - b * i) * k; out[2] = (b * f - c * e) * k;
  out[3] = B * k; out[4] = (a * i - c * g) * k; out[5] = (c * d - a * f) * k;
  out[6] = C * k; out[7] = (b * g - a * h) * k; out[8] = (a * e - b * d) * k;
  return det;
}
// iterative polar decomposition: R <- 1/2 (R + R^-T)
function polar3(m, iters) {
  for (let k = 0; k < iters; k++) {
    if (!invert3(m, _I)) { m.set([1, 0, 0, 0, 1, 0, 0, 0, 1]); return false; }
    for (let i = 0; i < 9; i++) m[i] = 0.5 * (m[i] + _I[(i % 3) * 3 + ((i / 3) | 0)]);
  }
  return true;
}

export class Bear {
  constructor(env, x, y, z, yaw, flavour, vx, vy, vz) {
    this.env = env;
    const CFG = env.cfg;
    const n = this.n = RIG.n;
    this.f = flavour;
    this.p = new Float32Array(n * 3);
    this.q = new Float32Array(n * 3);
    this.R0 = new Float32Array(9);
    const c = Math.cos(yaw), s = Math.sin(yaw);
    this.R0.set([c, 0, -s, 0, 1, 0, s, 0, c]);
    for (let i = 0; i < n; i++) {
      const rx = RIG.rest[i * 3], ry = RIG.rest[i * 3 + 1], rz = RIG.rest[i * 3 + 2];
      const px = c * rx - s * rz, pz = s * rx + c * rz;
      const k = i * 3;
      this.p[k] = this.q[k] = px + x;
      this.p[k + 1] = this.q[k + 1] = ry + y;
      this.p[k + 2] = this.q[k + 2] = pz + z;
    }
    if (vx || vy || vz) {                       // seed verlet history with a velocity
      const h = CFG.subH;
      for (let i = 0; i < n; i++) {
        const k = i * 3;
        this.q[k] -= vx * h; this.q[k + 1] -= vy * h; this.q[k + 2] -= vz * h;
      }
    }
    this.grab = -1; this.grabT = null;
    this.hop = 1.2 + env.rng() * 3.5; this.hopArm = 0; this.hopCool = 1 + env.rng() * 2.5;
    this.idle = 0; this.strain = 1; this.bounce = 0; this.hit = 0; this.perch = 0; this.onTop = 0;
    this.alive = true;
    // pieces: every link can be cut; seg[i] says which fragment a point belongs to
    this.seg = new Int8Array(n); this.segs = null;
    this.lk = new Uint8Array(RIG.links.length).fill(1);
    // strands: what is left of a cut limb, a long soft string of gummy that only pulls
    this.strands = [];
    this.up = [0, 1, 0];
    // soft: a hit leaves it wobblier for a moment; stiff: frozen > 1, melted < 1
    this.soft = 0; this.stiff = 1;
    // per-point hit flash and lasting stress whitening, read by the shader
    this.flash = new Float32Array(n); this.dmg = new Float32Array(n);
    this.hitSp = 0; this.hitPart = -1; this.hitNx = 0; this.hitNy = 1;
  }

  /* a point took a hit of speed sp (m/s) along normal n */
  bump(i, sp, nx, ny) {
    const CFG = this.env.cfg;
    if (sp < (CFG.world ? 2.2 : 5.5)) return;
    this.flash[i] = Math.max(this.flash[i], Math.min(1, (sp - 2) / 9));
    if (CFG.world) this.dmg[i] = Math.min(1.2, this.dmg[i] + sp * 0.02 * CFG.fragile);
    this.soft = Math.max(this.soft, Math.min(1.2, sp / 11));
    if (sp > this.hitSp) { this.hitSp = sp; this.hitPart = i; this.hitNx = nx; this.hitNy = ny; }
  }

  /* cut every live link the test says is crossed; returns how many.  With strand, the
     main strand across the cut survives as a stretchy string, so the piece dangles */
  cutWhere(test, strand) {
    let any = 0, first = -1;
    RIG.links.forEach((L, li) => {
      if (!this.lk[li] || !test(L.i, L.j)) return;
      this.lk[li] = 0; any++;
      if (first < 0 && li < RIG.chains.length) first = li;
    });
    if (any) this.resegment();
    if (any && strand && first >= 0) {
      const L = RIG.links[first];
      const s = { i: L.i, j: L.j, rest: L.rest * 1.1 };
      this.strands.push(s);
      return s;
    }
    return any;
  }
  resegment() {
    const n = this.n, root = Array.from({ length: n }, (_, i) => i);
    const find = (i) => (root[i] === i ? i : (root[i] = find(root[i])));
    RIG.links.forEach((L, li) => { if (this.lk[li]) root[find(L.i)] = find(L.j); });
    const id = new Map();
    for (let i = 0; i < n; i++) { const r = find(i); if (!id.has(r)) id.set(r, id.size); this.seg[i] = id.get(r); }
    // a link left between two fragments would pull them back together
    RIG.links.forEach((L, li) => { if (this.seg[L.i] !== this.seg[L.j]) this.lk[li] = 0; });
    if (id.size < 2) { this.segs = null; return; }
    this.segs = [];
    for (let s = 0; s < id.size; s++) {
      const ids = [];
      for (let i = 0; i < n; i++) if (this.seg[i] === s) ids.push(i);
      let mx = 0, my = 0, mz = 0, mm = 0;
      for (const i of ids) { const w = RIG.mass[i]; mm += w; mx += RIG.rest[i * 3] * w; my += RIG.rest[i * 3 + 1] * w; mz += RIG.rest[i * 3 + 2] * w; }
      mx /= mm; my /= mm; mz /= mm;
      const rec = new Float32Array(ids.length * 3);
      ids.forEach((i, j) => { rec[j * 3] = RIG.rest[i * 3] - mx; rec[j * 3 + 1] = RIG.rest[i * 3 + 1] - my; rec[j * 3 + 2] = RIG.rest[i * 3 + 2] - mz; });
      this.segs.push({ ids, n: ids.length, rec, mass: mm });
    }
  }
  segCentre(s) {
    let x = 0, y = 0, z = 0, m = 0;
    for (let i = 0; i < this.n; i++) {
      if (this.seg[i] !== s) continue;
      const w = RIG.mass[i], k = i * 3;
      x += this.p[k] * w; y += this.p[k + 1] * w; z += this.p[k + 2] * w; m += w;
    }
    return [x / m, y / m, z / m];
  }

  /* ---- one physics substep ---- */
  step(h, S) {
    const CFG = this.env.cfg;
    const n = this.n, p = this.p, q = this.q, inv = RIG.inv;
    const drag = 1 - S.drag;
    const g = CFG.gravity * h * h;
    let still = 0;
    for (let i = 0; i < n; i++) {
      const k = i * 3;
      let vx = (p[k] - q[k]) * drag, vy = (p[k + 1] - q[k + 1]) * drag, vz = (p[k + 2] - q[k + 2]) * drag;
      const sp2 = vx * vx + vy * vy + vz * vz;
      if (sp2 > CFG.maxV2) {                        // a hard pancake must not rocket a bear off the table
        const s = CFG.maxV / Math.sqrt(sp2); vx *= s; vy *= s; vz *= s;
      }
      if (this.idle > 0 && this.grab < 0) { const s = 1 - 0.35 * this.idle; vx *= s; vy *= s; vz *= s; }
      q[k] = p[k]; q[k + 1] = p[k + 1]; q[k + 2] = p[k + 2];
      p[k] += vx; p[k + 1] += vy + g; p[k + 2] += vz;
      still += Math.abs(vx) + Math.abs(vy) + Math.abs(vz);
    }
    // idle = 1 only when the bear is genuinely at rest.  damping used to key off
    // how *fast* a bear was moving, which strangled every wobble and hop.
    this.idle = 1 - Math.min(1, (still / n) * 600);
    this.behave(h);
    const soft = Math.min(1, this.soft);
    this.soft = Math.max(0, this.soft - h * 2.2);
    for (let i = 0; i < n; i++) {
      this.flash[i] *= 0.986;
      if (this.dmg[i] > 0) this.dmg[i] = Math.max(0, this.dmg[i] - h * 0.015);
    }
    const lam = Math.min(0.6, S.shape * this.stiff) * (1 - 0.7 * soft);
    const kd = Math.min(1, S.dist * this.stiff) * (1 - 0.45 * soft);
    for (let it = 0; it < 2; it++) {
      if (this.segs) { for (const sg of this.segs) if (sg.n >= 3) this.shapeMatchSeg(sg, lam); }
      // a bear lying on others lets go of standing up, so piles can form
      else this.shapeMatch(lam, this.onTop > 0 ? S.align * CFG.pileUpright : S.align);
      this.links(kd);
      if (this.grab >= 0) this.applyGrab();
    }
    if (this.segs) this.selfCollide();
    this.collide(h);
  }

  /* ---- volume-preserving shape matching ---- */
  shapeMatch(lambda, align) {
    const n = this.n, p = this.p, rest = RIG.rest, w = RIG.mass;
    let m = 0, cx = 0, cy = 0, cz = 0;
    for (let i = 0; i < n; i++) {
      const k = i * 3, wi = w[i];
      m += wi; cx += p[k] * wi; cy += p[k + 1] * wi; cz += p[k + 2] * wi;
    }
    cx /= m; cy /= m; cz /= m;
    let a00 = 0, a01 = 0, a02 = 0, a10 = 0, a11 = 0, a12 = 0, a20 = 0, a21 = 0, a22 = 0;
    for (let i = 0; i < n; i++) {
      const k = i * 3, wi = w[i];
      const x = (p[k] - cx) * wi, y = (p[k + 1] - cy) * wi, z = (p[k + 2] - cz) * wi;
      const rx = rest[k], ry = rest[k + 1], rz = rest[k + 2];
      a00 += x * rx; a01 += x * ry; a02 += x * rz;
      a10 += y * rx; a11 += y * ry; a12 += y * rz;
      a20 += z * rx; a21 += z * ry; a22 += z * rz;
    }
    // bias the covariance toward the bear's own facing (it leans, then rights itself)
    const R0 = this.R0, al = align;
    a00 += al * (R0[0] - a00); a01 += al * (R0[1] - a01); a02 += al * (R0[2] - a02);
    a10 += al * (R0[3] - a10); a11 += al * (R0[4] - a11); a12 += al * (R0[5] - a12);
    a20 += al * (R0[6] - a20); a21 += al * (R0[7] - a21); a22 += al * (R0[8] - a22);
    // The covariance is C·Rᵀ, not symmetric, and the rest shape is strongly
    // elongated — so its singular values are far apart. Divide out det(A) first:
    // that leaves a unit-determinant map whose polar factor is a true rotation,
    // and the leftover stretch *is* the volume change we have to undo.
    _A.set([a00, a01, a02, a10, a11, a12, a20, a21, a22]);
    const dA = a00 * (a11 * a22 - a12 * a21) - a01 * (a10 * a22 - a12 * a20) +
               a02 * (a10 * a21 - a11 * a20);
    if (!(Math.abs(dA) > 1e-9)) return;
    const na = Math.cbrt(Math.abs(dA));
    for (let i = 0; i < 9; i++) _A[i] /= na;
    if (!polar3(_A, 6)) return;
    _R.set(_A);
    // volume preservation: undo the area change of the linear map
    const det = _R[0] * (_R[4] * _R[8] - _R[5] * _R[7]) - _R[1] * (_R[3] * _R[8] - _R[5] * _R[6]) +
                _R[2] * (_R[3] * _R[7] - _R[4] * _R[6]);
    let sc = Math.cbrt(1 / Math.max(0.05, Math.abs(det)));
    sc = Math.max(0.72, Math.min(1.35, sc));
    const r0 = _R;
    for (let i = 0; i < n; i++) {
      const rx = RIG.rec[i * 3] * sc, ry = RIG.rec[i * 3 + 1] * sc, rz = RIG.rec[i * 3 + 2] * sc;
      const k = i * 3;
      const tx = cx + r0[0] * rx + r0[1] * ry + r0[2] * rz;
      const ty = cy + r0[3] * rx + r0[4] * ry + r0[5] * rz;
      const tz = cz + r0[6] * rx + r0[7] * ry + r0[8] * rz;
      p[k] += lambda * (tx - p[k]);
      p[k + 1] += lambda * (ty - p[k + 1]);
      p[k + 2] += lambda * (tz - p[k + 2]);
    }
  }

  /* shape matching for one fragment of a cut bear: same maths, its own rest shape */
  shapeMatchSeg(sg, lambda) {
    const p = this.p, rest = RIG.rest, w = RIG.mass, ids = sg.ids;
    let m = 0, cx = 0, cy = 0, cz = 0;
    for (const i of ids) { const k = i * 3, wi = w[i]; m += wi; cx += p[k] * wi; cy += p[k + 1] * wi; cz += p[k + 2] * wi; }
    cx /= m; cy /= m; cz /= m;
    let a00 = 0, a01 = 0, a02 = 0, a10 = 0, a11 = 0, a12 = 0, a20 = 0, a21 = 0, a22 = 0;
    for (const i of ids) {
      const k = i * 3, wi = w[i];
      const x = (p[k] - cx) * wi, y = (p[k + 1] - cy) * wi, z = (p[k + 2] - cz) * wi;
      const rx = rest[k], ry = rest[k + 1], rz = rest[k + 2];
      a00 += x * rx; a01 += x * ry; a02 += x * rz;
      a10 += y * rx; a11 += y * ry; a12 += y * rz;
      a20 += z * rx; a21 += z * ry; a22 += z * rz;
    }
    _A.set([a00, a01, a02, a10, a11, a12, a20, a21, a22]);
    const dA = a00 * (a11 * a22 - a12 * a21) - a01 * (a10 * a22 - a12 * a20) + a02 * (a10 * a21 - a11 * a20);
    if (!(Math.abs(dA) > 1e-12)) return;
    const na = Math.cbrt(Math.abs(dA));
    for (let i = 0; i < 9; i++) _A[i] /= na;
    if (!polar3(_A, 6)) return;
    const r0 = _A;
    ids.forEach((i, j) => {
      const rx = sg.rec[j * 3], ry = sg.rec[j * 3 + 1], rz = sg.rec[j * 3 + 2], k = i * 3;
      p[k] += lambda * (cx + r0[0] * rx + r0[1] * ry + r0[2] * rz - p[k]);
      p[k + 1] += lambda * (cy + r0[3] * rx + r0[4] * ry + r0[5] * rz - p[k + 1]);
      p[k + 2] += lambda * (cz + r0[6] * rx + r0[7] * ry + r0[8] * rz - p[k + 2]);
    });
  }

  /* fragments of one bear bump into each other instead of passing through */
  selfCollide() {
    const p = this.p, n = this.n;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      if (this.seg[i] === this.seg[j]) continue;
      const A = i * 3, B = j * 3, min = (RIG.col[i] + RIG.col[j]) * 0.9;
      const dx = p[A] - p[B], dy = p[A + 1] - p[B + 1], dz = p[A + 2] - p[B + 2];
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > min * min || d2 < 1e-10) continue;
      const d = Math.sqrt(d2), pen = Math.min(min - d, 0.004);
      const wa = RIG.inv[i] / (RIG.inv[i] + RIG.inv[j]), wb = 1 - wa;
      p[A] += dx / d * pen * wa; p[A + 1] += dy / d * pen * wa; p[A + 2] += dz / d * pen * wa;
      p[B] -= dx / d * pen * wb; p[B + 1] -= dy / d * pen * wb; p[B + 2] -= dz / d * pen * wb;
    }
  }

  links(k) {
    const p = this.p, inv = RIG.inv, lk = this.lk;
    for (let li = 0; li < RIG.links.length; li++) {
      if (!lk[li]) continue;
      const L = RIG.links[li];
      const a = L.i * 3, b = L.j * 3;
      let dx = p[a] - p[b], dy = p[a + 1] - p[b + 1], dz = p[a + 2] - p[b + 2];
      const d = Math.hypot(dx, dy, dz);
      if (d < 1e-6) continue;
      const wi = inv[L.i] + inv[L.j];
      let C = d - L.rest;
      if (C > 0) C = Math.min(C, L.rest * 1.15);        // soft limit on how far a limb can fly
      const s = (k * C) / (d * wi);
      const si = inv[L.i] * s, sj = inv[L.j] * s;
      p[a] -= dx * si; p[a + 1] -= dy * si; p[a + 2] -= dz * si;
      p[b] += dx * sj; p[b + 1] += dy * sj; p[b + 2] += dz * sj;
    }
    // strands only pull, and gently: the piece swings and stretches on its string
    for (const S of this.strands) {
      const a = S.i * 3, b = S.j * 3;
      const dx = p[a] - p[b], dy = p[a + 1] - p[b + 1], dz = p[a + 2] - p[b + 2];
      const d = Math.hypot(dx, dy, dz);
      S.len = d;
      if (d <= S.rest) continue;
      // slack-ish up to ~2.5x its length, then it firms up like taffy before it snaps
      const k = 0.004 + 0.05 * Math.min(1, Math.max(0, (d / S.rest - 2.5) / 1.5));
      const s = (k * (d - S.rest)) / (d * (inv[S.i] + inv[S.j]));
      const si = inv[S.i] * s, sj = inv[S.j] * s;
      p[a] -= dx * si; p[a + 1] -= dy * si; p[a + 2] -= dz * si;
      p[b] += dx * sj; p[b + 1] += dy * sj; p[b + 2] += dz * sj;
    }
  }

  /* ---- idle life: crouch, pancake, launch ---- */
  behave(h) {
    const CFG = this.env.cfg;
    this.hopCool -= h; this.perch -= h; this.onTop -= h;
    if (CFG.world) return;                           // a launched ragdoll does not hop
    const p = this.p, hd = RIG.idx.head * 3, bd = RIG.idx.body * 3;
    if (this.hopArm > 0) {                           // wind up: crouch, spread the limbs
      this.hopArm -= h;
      p[hd + 1] -= 0.0075; p[bd + 1] -= 0.0026;
      for (const nm of ['footL', 'footR', 'handL', 'handR']) {
        const k = RIG.idx[nm] * 3, s = nm.charCodeAt(4) === 76 ? -1 : 1;
        p[k] += s * 0.0022;
      }
      if (this.hopArm <= 0) {                        // one release impulse, then rest
        this.hopCool = this.hop;
        this.hop = 1.5 + this.env.rng() * 3.4;
        for (let i = 0; i < this.n; i++) p[i * 3 + 1] += 0.0082;
      }
      return;
    }
    if (this.grab < 0 && this.hopCool <= 0 && this.idle > 0.9 && this.perch <= 0) this.hopArm = 0.2;
  }

  applyGrab() {
    const i = this.grab, k = i * 3, t = this.grabT;
    const stiff = 0.4;                                  // mass-independent: the limb follows the hand
    this.p[k] += (t.x - this.p[k]) * stiff;
    this.p[k + 1] += (t.y - this.p[k + 1]) * stiff;
    this.p[k + 2] += (t.z - this.p[k + 2]) * stiff;
  }

  /* ---- floor + walls + other bears ---- */
  collide(h) {
    const CFG = this.env.cfg;
    const n = this.n, p = this.p, q = this.q, inv = RIG.inv, rad = RIG.col;
    let hit = 0;
    for (let i = 0; i < n; i++) {
      const k = i * 3, r = rad[i];
      // floor
      if (p[k + 1] < CFG.floorY + r) {
        const vy = p[k + 1] - q[k + 1];
        const fix = CFG.floorY + r - p[k + 1];
        p[k + 1] = CFG.floorY + r;
        // move the previous position by the same amount, otherwise Verlet reads
        // the penetration fix as velocity and the bear launches off the table
        q[k + 1] += fix;
        if (vy < 0) {
          q[k + 1] = p[k + 1] + vy * CFG.restitution;
          q[k] = p[k] - (p[k] - q[k]) * (1 - CFG.friction);
          q[k + 2] = p[k + 2] - (p[k + 2] - q[k + 2]) * (1 - CFG.friction);
          hit = Math.max(hit, -vy / h);
          this.bump(i, -vy / h, 0, 1);
        }
      }
      if (CFG.world) continue;                       // a level brings its own walls
      // soft elliptical wall: narrower across a portrait screen, deeper into it
      const ax = CFG.wallX - r, az = CFG.wallZ - r;
      const e2 = (p[k] * p[k]) / (ax * ax) + (p[k + 2] * p[k + 2]) / (az * az);
      if (e2 > 1) {
        const s = (1 - 1 / Math.sqrt(e2)) * 0.8;
        const mx = p[k] * s, mz = p[k + 2] * s;
        p[k] -= mx; p[k + 2] -= mz; q[k] -= mx; q[k + 2] -= mz;
      }
    }
    if (CFG.world) hit = Math.max(hit, this.env.collideWorld(this, h));
    this.hit = hit;
  }

  centre() {
    let x = 0, y = 0, z = 0, m = 0;
    for (let i = 0; i < this.n; i++) {
      const w = RIG.mass[i], k = i * 3;
      x += this.p[k] * w; y += this.p[k + 1] * w; z += this.p[k + 2] * w; m += w;
    }
    return [x / m, y / m, z / m];
  }
}

/* bear <-> bear: mass points never pass through one another.  Standard
   position-based contact: the overlap is fixed on p alone, so the fix itself
   becomes the (inelastic) contact velocity, and friction cancels the slip that
   actually happened this substep.  The original moved q along with p, which
   kept a deep fix from launching the pair but also hid every sideways creep
   from friction, so nothing could ever rest on another bear.  The launch guard
   survives as a cap on how fast a fix may push two points apart. */
export function separate(a, b) {
  const CFG = a.env.cfg;
  const pa = a.p, pb = b.p, qa = a.q, qb = b.q, n = a.n;
  for (let i = 0; i < n; i++) {
    const ri = RIG.col[i], wi = RIG.inv[i];
    for (let j = 0; j < n; j++) {
      const rj = RIG.col[j], wj = RIG.inv[j];
      const min = ri + rj;
      const A = i * 3, B = j * 3;
      const dx = pa[A] - pb[B], dy = pa[A + 1] - pb[B + 1], dz = pa[A + 2] - pb[B + 2];
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > min * min || d2 < 1e-9) continue;
      const d = Math.sqrt(d2), pen = min - d;
      const nx = dx / d, ny = dy / d, nz = dz / d;  // from b's point to a's
      const tot = wi + wj, wa = wi / tot, wb = wj / tot;
      pa[A] += nx * pen * wa; pa[A + 1] += ny * pen * wa; pa[A + 2] += nz * pen * wa;
      pb[B] -= nx * pen * wb; pb[B + 1] -= ny * pen * wb; pb[B + 2] -= nz * pen * wb;

      // relative motion this substep, after the fix
      let rx = (pa[A] - qa[A]) - (pb[B] - qb[B]),
          ry = (pa[A + 1] - qa[A + 1]) - (pb[B + 1] - qb[B + 1]),
          rz = (pa[A + 2] - qa[A + 2]) - (pb[B + 2] - qb[B + 2]);
      let vn = rx * nx + ry * ny + rz * nz;
      if (vn > CFG.sepCap) {                         // deep overlap: q soaks up the excess
        const e = vn - CFG.sepCap;
        qa[A] += nx * e * wa; qa[A + 1] += ny * e * wa; qa[A + 2] += nz * e * wa;
        qb[B] -= nx * e * wb; qb[B + 1] -= ny * e * wb; qb[B + 2] -= nz * e * wb;
        vn = CFG.sepCap;
      }
      // Coulomb friction on the slip: grip in proportion to how hard they press
      const tx = rx - vn * nx, ty = ry - vn * ny, tz = rz - vn * nz;
      const tl = Math.sqrt(tx * tx + ty * ty + tz * tz);
      if (tl > 1e-9) {
        const f = Math.min(1, CFG.stick * pen / tl);
        pa[A] -= tx * f * wa; pa[A + 1] -= ty * f * wa; pa[A + 2] -= tz * f * wa;
        pb[B] += tx * f * wb; pb[B + 1] += ty * f * wb; pb[B + 2] += tz * f * wb;
      }
      if (ny > 0.5 || ny < -0.5) {                   // stacked: nobody hops, the upper one lies down
        a.perch = 0.6; b.perch = 0.6;
        if (ny > 0) a.onTop = 0.4; else b.onTop = 0.4;
      }
    }
  }
}

/* ============================================================
   3 · IMPLICIT SURFACE — splat the field, then march the cubes
   ============================================================ */
