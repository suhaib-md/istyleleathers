import * as THREE from "three";

/**
 * Procedural, tileable leather surface maps generated on the CPU.
 * Each finish produces a height field → normal map, roughness map and an
 * albedo multiplier (grooves darker, plateaus lighter).
 */

import type { Finish } from "@/content/materials";
export type { Finish };

// ───────────── noise helpers (seeded, tileable) ─────────────
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeLattice(n: number, rnd: () => number) {
  const g = new Float32Array(n * n);
  for (let i = 0; i < g.length; i++) g[i] = rnd();
  return g;
}

/** tileable value noise, period = n lattice cells over [0,1) */
function valueNoise(g: Float32Array, n: number, x: number, y: number) {
  const fx = x * n,
    fy = y * n;
  const x0 = Math.floor(fx),
    y0 = Math.floor(fy);
  const tx = fx - x0,
    ty = fy - y0;
  const sx = tx * tx * (3 - 2 * tx),
    sy = ty * ty * (3 - 2 * ty);
  const i0 = ((x0 % n) + n) % n,
    j0 = ((y0 % n) + n) % n;
  const i1 = (i0 + 1) % n,
    j1 = (j0 + 1) % n;
  const a = g[j0 * n + i0],
    b = g[j0 * n + i1],
    c = g[j1 * n + i0],
    d = g[j1 * n + i1];
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

function fbm(lats: { g: Float32Array; n: number }[], x: number, y: number) {
  let s = 0,
    amp = 0.5,
    tot = 0;
  for (const l of lats) {
    s += valueNoise(l.g, l.n, x, y) * amp;
    tot += amp;
    amp *= 0.5;
  }
  return s / tot;
}

/** tileable Worley noise → [F1, F2] in cell units */
function makeCells(n: number, rnd: () => number, jitter = 0.85) {
  const p = new Float32Array(n * n * 2);
  for (let i = 0; i < n * n; i++) {
    p[i * 2] = 0.5 + (rnd() - 0.5) * jitter;
    p[i * 2 + 1] = 0.5 + (rnd() - 0.5) * jitter;
  }
  return p;
}
function worley(pts: Float32Array, n: number, x: number, y: number, ax = 1, out = [0, 0, 0]) {
  const fx = x * n,
    fy = y * n;
  const cx = Math.floor(fx),
    cy = Math.floor(fy);
  let f1 = 1e9,
    f2 = 1e9,
    id = 0;
  for (let j = -1; j <= 1; j++)
    for (let i = -1; i <= 1; i++) {
      const gx = cx + i,
        gy = cy + j;
      const wi = ((gx % n) + n) % n,
        wj = ((gy % n) + n) % n;
      const k = (wj * n + wi) * 2;
      const dx = (gx + pts[k] - fx) * ax,
        dy = gy + pts[k + 1] - fy;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < f1) {
        f2 = f1;
        f1 = d;
        id = wj * n + wi;
      } else if (d < f2) f2 = d;
    }
  out[0] = f1;
  out[1] = f2;
  out[2] = id;
  return out;
}
const smooth = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

// ───────────── height fields ─────────────
export function heightField(finish: Finish, size = 256, seed = 7) {
  const rnd = mulberry32(seed * 9301 + finish.length * 49297);
  const h = new Float32Array(size * size);
  const shade = new Float32Array(size * size); // albedo multiplier 0..1
  const rough = new Float32Array(size * size);
  const lat = [8, 16, 32, 64].map((n) => ({ g: makeLattice(n, rnd), n }));
  const fine = [64, 128].map((n) => ({ g: makeLattice(n, rnd), n }));
  const tmp = [0, 0, 0];

  const cellN = finish === "croc" ? 7 : finish === "pebble" ? 26 : 12;
  const cells = makeCells(cellN, rnd, finish === "croc" ? 0.55 : 0.9);
  const cellRnd = new Float32Array(cellN * cellN).map(() => rnd());

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size,
        v = y / size;
      const i = y * size + x;
      const low = fbm(lat, u, v);
      const grit = fbm(fine, u, v);
      let H = 0,
        S = 1,
        R = 0.5;
      switch (finish) {
        case "smooth": {
          H = low * 0.5 + grit * 0.08;
          S = 0.9 + low * 0.1;
          R = 0.42 + grit * 0.1;
          break;
        }
        case "pebble": {
          worley(cells, cellN, u, v, 1, tmp);
          const edge = smooth(0.0, 0.32, tmp[1] - tmp[0]);
          const dome = 1 - Math.min(1, tmp[0] * 1.3);
          H = edge * (0.65 + dome * 0.35) + grit * 0.12;
          S = 0.72 + edge * 0.28;
          R = 0.62 - edge * 0.16;
          break;
        }
        case "croc": {
          worley(cells, cellN, u, v, 0.78, tmp);
          const edge = smooth(0.0, 0.11, tmp[1] - tmp[0]);
          const dome = 1 - Math.min(1, tmp[0] * 1.05);
          const tone = cellRnd[tmp[2]];
          H = edge * (0.55 + dome * 0.45) + grit * 0.05;
          S = 0.42 + edge * (0.48 + tone * 0.1);
          R = 0.55 - edge * 0.3;
          break;
        }
        case "woven": {
          const N = 8;
          const fx = u * N,
            fy = v * N;
          const ix = Math.floor(fx),
            iy = Math.floor(fy);
          const lu = fx - ix,
            lv = fy - iy;
          const horizontalOnTop = (ix + iy) % 2 === 0;
          const across = horizontalOnTop ? lv : lu;
          const along = horizontalOnTop ? lu : lv;
          const gap = smooth(0.02, 0.1, across) * smooth(0.02, 0.1, 1 - across);
          const prof = Math.sqrt(Math.sin(Math.PI * across));
          const dip = 0.72 + 0.28 * Math.sin(Math.PI * along);
          H = gap * prof * dip + grit * 0.05;
          S = 0.5 + gap * 0.5 * dip;
          R = 0.5 - gap * 0.12;
          break;
        }
        case "perforated": {
          const N = 14;
          let fx = u * N;
          const fy = v * N;
          if (Math.floor(fy) % 2 === 1) fx += 0.5;
          const du = fx - Math.floor(fx) - 0.5,
            dv = fy - Math.floor(fy) - 0.5;
          const d = Math.sqrt(du * du + dv * dv);
          const hole = smooth(0.15, 0.2, d);
          H = hole * (0.85 + low * 0.15) + grit * 0.05;
          S = 0.08 + hole * 0.92;
          R = 0.45 + (1 - hole) * 0.4;
          break;
        }
        case "suede": {
          const n = fbm(fine, u * 1.0, v * 1.0);
          H = n * 0.35 + low * 0.25;
          S = 0.86 + n * 0.18 - low * 0.08;
          R = 0.95;
          break;
        }
        case "saffiano": {
          const k = 60;
          const a = Math.abs(Math.sin(Math.PI * (u + v) * k));
          const b = Math.abs(Math.sin(Math.PI * (u - v) * k));
          H = (a * 0.5 + b * 0.5) * 0.7 + grit * 0.25;
          S = 0.88 + H * 0.12;
          R = 0.38 + grit * 0.15;
          break;
        }
        case "canvas": {
          const k = 72;
          const wx = Math.abs(Math.sin(Math.PI * u * k));
          const wy = Math.abs(Math.sin(Math.PI * v * k));
          const ox = Math.floor(u * k),
            oy = Math.floor(v * k);
          const over = (ox + oy) % 2 === 0 ? wx : wy;
          H = over * 0.7 + grit * 0.3;
          S = 0.78 + over * 0.2 + (grit - 0.5) * 0.1;
          R = 0.88;
          break;
        }
      }
      h[i] = H;
      shade[i] = S;
      rough[i] = R;
    }
  }
  return { h, shade, rough, size };
}

function toNormal(h: Float32Array, size: number, strength: number) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    const ym = ((y - 1 + size) % size) * size,
      yp = ((y + 1) % size) * size,
      yr = y * size;
    for (let x = 0; x < size; x++) {
      const xm = (x - 1 + size) % size,
        xp = (x + 1) % size;
      const dx = (h[yr + xp] - h[yr + xm]) * strength;
      const dy = (h[yp + x] - h[ym + x]) * strength;
      const inv = 1 / Math.sqrt(dx * dx + dy * dy + 1);
      const o = (yr + x) * 4;
      data[o] = (-dx * inv * 0.5 + 0.5) * 255;
      data[o + 1] = (dy * inv * 0.5 + 0.5) * 255;
      data[o + 2] = (inv * 0.5 + 0.5) * 255;
      data[o + 3] = 255;
    }
  }
  return data;
}

function dataTex(data: Uint8Array, size: number, srgb = false) {
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

export type LeatherMaps = {
  normal: THREE.DataTexture;
  rough: THREE.DataTexture;
  shade: THREE.DataTexture;
  height: Float32Array;
  size: number;
};

const cache = new Map<string, LeatherMaps>();

export function leatherMaps(finish: Finish, size = 256, seed = 7): LeatherMaps {
  const key = `${finish}:${size}:${seed}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const { h, shade, rough } = heightField(finish, size, seed);
  const strength = finish === "croc" ? 9 : finish === "woven" ? 7 : finish === "perforated" ? 6 : finish === "suede" ? 2.5 : finish === "smooth" ? 3 : 5;
  const normal = dataTex(toNormal(h, size, strength * (size / 256)), size);
  const r = new Uint8Array(size * size * 4);
  const s = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const rv = Math.max(0, Math.min(1, rough[i])) * 255;
    r[i * 4] = rv;
    r[i * 4 + 1] = rv;
    r[i * 4 + 2] = rv;
    r[i * 4 + 3] = 255;
    const sv = Math.max(0, Math.min(1, shade[i])) * 255;
    s[i * 4] = sv;
    s[i * 4 + 1] = sv;
    s[i * 4 + 2] = sv;
    s[i * 4 + 3] = 255;
  }
  const out = { normal, rough: dataTex(r, size), shade: dataTex(s, size, true), height: h, size };
  cache.set(key, out);
  return out;
}

/** Standard physical leather material using the procedural maps. */
export function leatherMaterial(
  color: string,
  finish: Finish,
  opts: { repeat?: number; size?: number; seed?: number; sheen?: number; clearcoat?: number } = {}
) {
  const { repeat = 2, size = 256, seed = 7 } = opts;
  const maps = leatherMaps(finish, size, seed);
  const set = (t: THREE.Texture) => {
    const c = t.clone();
    c.repeat.set(repeat, repeat);
    c.needsUpdate = true;
    return c;
  };
  const isSuede = finish === "suede";
  const isCanvas = finish === "canvas";
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    map: set(maps.shade),
    normalMap: set(maps.normal),
    normalScale: new THREE.Vector2(1, 1),
    roughnessMap: set(maps.rough),
    roughness: isSuede || isCanvas ? 1 : 0.85,
    metalness: 0,
    sheen: opts.sheen ?? (isSuede ? 1 : 0.35),
    sheenRoughness: isSuede ? 0.9 : 0.5,
    sheenColor: new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.35),
    clearcoat: opts.clearcoat ?? (finish === "croc" || finish === "smooth" || finish === "saffiano" ? 0.35 : 0.05),
    clearcoatRoughness: 0.45,
  });
}
