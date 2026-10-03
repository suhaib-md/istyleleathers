"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { leatherMaps } from "@/lib/leather";
import type { Finish } from "@/content/materials";

export type Silhouette = "cross" | "band" | "twin";
export type StampStyle = "blind" | "gold" | "silver";

export type SandalConfig = {
  silhouette: Silhouette;
  toeRing: boolean;
  finish: Finish;
  strap: string;
  strap2: string;
  footbed: string;
  sole: string;
  thread: string;
  hardware: string;
  stamp: string;
  stampStyle: StampStyle;
  stampLogo: boolean;
};

// ───────────────────────── geometry ─────────────────────────
const OUTLINE: [number, number][] = [
  [0.0, -1.35], [0.22, -1.31], [0.34, -1.18], [0.38, -0.95], [0.37, -0.6], [0.38, -0.25], [0.42, 0.15],
  [0.48, 0.5], [0.5, 0.75], [0.46, 1.0], [0.36, 1.2], [0.2, 1.32], [0.0, 1.37], [-0.18, 1.36], [-0.34, 1.26],
  [-0.44, 1.05], [-0.48, 0.75], [-0.44, 0.4], [-0.33, 0.05], [-0.3, -0.35], [-0.33, -0.75], [-0.34, -1.05],
  [-0.28, -1.26], [-0.15, -1.33],
];

function outlinePoints(sx = 1, sy = 1, n = 220) {
  const c = new THREE.CatmullRomCurve3(
    OUTLINE.map(([x, y]) => new THREE.Vector3(x * sx, y * sy, 0)),
    true,
    "centripetal"
  );
  return c.getSpacedPoints(n).map((p) => new THREE.Vector2(p.x, p.y));
}

const SOLE_D = 0.14;
const BED_D = 0.06;
const BED_BEVEL = 0.015;
export const Y0 = SOLE_D + 0.02 + BED_D + BED_BEVEL; // footbed top ≈ 0.235

function extruded(points: THREE.Vector2[], depth: number, bevel: number) {
  const shape = new THREE.Shape(points);
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 4,
    steps: 1,
  });
  g.rotateX(-Math.PI / 2); // shape y → -z (toe forward), depth → +y
  return g;
}

type Frame = { c: THREE.Vector3; t: THREE.Vector3; w: THREE.Vector3; n: THREE.Vector3 };

function ribbon(points: THREE.Vector3[], width: number, thick: number, widthDir: THREE.Vector3, segs = 110) {
  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal", 0.5);
  const frames: Frame[] = [];
  for (let i = 0; i <= segs; i++) {
    const u = i / segs;
    const c = curve.getPointAt(u);
    const t = curve.getTangentAt(u).normalize();
    const w = widthDir.clone().sub(t.clone().multiplyScalar(widthDir.dot(t))).normalize();
    const n = new THREE.Vector3().crossVectors(t, w).normalize();
    frames.push({ c, t, w, n });
  }
  if (frames[Math.floor(segs / 2)].n.y < 0) frames.forEach((f) => f.n.negate());
  const len = curve.getLength();

  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const hw = width / 2,
    ht = thick / 2;
  const strip = (fa: (f: Frame) => THREE.Vector3, fb: (f: Frame) => THREE.Vector3, vA: number, vB: number) => {
    const base = pos.length / 3;
    frames.forEach((f, i) => {
      const a = fa(f),
        b = fb(f);
      pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
      const uu = (i / segs) * len;
      uv.push(uu, vA, uu, vB);
    });
    for (let i = 0; i < segs; i++) {
      const a = base + i * 2,
        b = a + 1,
        c = a + 2,
        d = a + 3;
      idx.push(a, c, b, b, c, d);
    }
  };
  const P = (f: Frame, sn: number, sw: number) =>
    f.c.clone().addScaledVector(f.n, sn * ht).addScaledVector(f.w, sw * hw);
  strip((f) => P(f, 1, -1), (f) => P(f, 1, 1), 0, width);
  strip((f) => P(f, -1, 1), (f) => P(f, -1, -1), width, 0);
  const faceCount = idx.length;
  strip((f) => P(f, 1, 1), (f) => P(f, -1, 1), 0, thick);
  strip((f) => P(f, -1, -1), (f) => P(f, 1, -1), 0, thick);

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.addGroup(0, faceCount, 0);
  g.addGroup(faceCount, idx.length - faceCount, 1);
  g.computeVertexNormals();
  return { geometry: g, frames, len, width, thick };
}

type Strap = ReturnType<typeof ribbon>;

function strapPath(start: THREE.Vector3, end: THREE.Vector3, apex: number) {
  const mid = start.clone().lerp(end, 0.5);
  const a = start.clone().lerp(end, 0.16);
  const b = start.clone().lerp(end, 0.84);
  return [
    new THREE.Vector3(start.x, Y0 - 0.06, start.z),
    new THREE.Vector3(start.x * 1.02, Y0 + 0.02, start.z),
    new THREE.Vector3(a.x * 1.04, Y0 + apex * 0.62, a.z),
    new THREE.Vector3(mid.x, Y0 + apex, mid.z),
    new THREE.Vector3(b.x * 1.04, Y0 + apex * 0.62, b.z),
    new THREE.Vector3(end.x * 1.02, Y0 + 0.02, end.z),
    new THREE.Vector3(end.x, Y0 - 0.06, end.z),
  ];
}

function horizontalPerp(a: THREE.Vector3, b: THREE.Vector3) {
  const span = new THREE.Vector3(b.x - a.x, 0, b.z - a.z);
  return new THREE.Vector3().crossVectors(span, new THREE.Vector3(0, 1, 0)).normalize();
}

function buildStraps(sil: Silhouette): Strap[] {
  const th = 0.036;
  if (sil === "cross") {
    const s1 = new THREE.Vector3(0.4, 0, -0.02),
      e1 = new THREE.Vector3(-0.45, 0, -0.9);
    const s2 = new THREE.Vector3(-0.34, 0, -0.02),
      e2 = new THREE.Vector3(0.49, 0, -0.9);
    return [
      ribbon(strapPath(s1, e1, 0.4), 0.3, th, horizontalPerp(s1, e1)),
      ribbon(strapPath(s2, e2, 0.4 + th + 0.006), 0.3, th, horizontalPerp(s2, e2)),
    ];
  }
  if (sil === "band") {
    const s = new THREE.Vector3(0.47, 0, -0.5),
      e = new THREE.Vector3(-0.45, 0, -0.5);
    return [ribbon(strapPath(s, e, 0.42), 0.82, th, new THREE.Vector3(0, 0, 1))];
  }
  const a1 = new THREE.Vector3(0.49, 0, -0.78),
    b1 = new THREE.Vector3(-0.47, 0, -0.78);
  const a2 = new THREE.Vector3(0.41, 0, -0.12),
    b2 = new THREE.Vector3(-0.33, 0, -0.12);
  return [
    ribbon(strapPath(a1, b1, 0.36), 0.36, th, new THREE.Vector3(0, 0, 1)),
    ribbon(strapPath(a2, b2, 0.44), 0.36, th, new THREE.Vector3(0, 0, 1)),
  ];
}

function stitchTransforms(straps: Strap[], bedOutline: THREE.Vector2[]) {
  const out: THREE.Matrix4[] = [];
  const q = new THREE.Quaternion();
  const X = new THREE.Vector3(1, 0, 0);
  const one = new THREE.Vector3(1, 1, 1);
  for (const s of straps) {
    const step = 0.048;
    const count = Math.floor(s.len / step);
    for (let k = 2; k < count - 2; k++) {
      const f = s.frames[Math.round((k / count) * (s.frames.length - 1))];
      if (f.c.y < Y0 + 0.01) continue;
      for (const side of [-1, 1]) {
        const p = f.c
          .clone()
          .addScaledVector(f.n, s.thick / 2 + 0.003)
          .addScaledVector(f.w, side * (s.width / 2 - 0.035));
        q.setFromUnitVectors(X, f.t);
        out.push(new THREE.Matrix4().compose(p, q, one));
      }
    }
  }
  // footbed edge stitching
  const n = bedOutline.length;
  for (let i = 0; i < n; i += 2) {
    const a = bedOutline[i],
      b = bedOutline[(i + 1) % n];
    const p = new THREE.Vector3((a.x + b.x) / 2, Y0 + 0.002, -(a.y + b.y) / 2);
    const t = new THREE.Vector3(b.x - a.x, 0, -(b.y - a.y)).normalize();
    q.setFromUnitVectors(X, t);
    out.push(new THREE.Matrix4().compose(p, q, one));
  }
  return out;
}

function buckleGeometry() {
  const w = 0.17,
    h = 0.42,
    r = 0.04,
    bar = 0.032;
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  const hole = new THREE.Path();
  const iw = w - bar * 2,
    ih = h - bar * 2;
  hole.moveTo(-iw / 2, -ih / 2);
  hole.lineTo(-iw / 2, ih / 2);
  hole.lineTo(iw / 2, ih / 2);
  hole.lineTo(iw / 2, -ih / 2);
  hole.lineTo(-iw / 2, -ih / 2);
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.018, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 3 });
  g.translate(0, 0, -0.009);
  return g;
}

// ───────────────────────── stamp texture ─────────────────────────
function cssFont(varName: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}

let logoImg: HTMLImageElement | null = null;
function getLogo() {
  if (!logoImg && typeof window !== "undefined") {
    logoImg = new Image();
    logoImg.src = "/brand/logo-mark.png";
  }
  return logoImg;
}

function stampCanvases(text: string, useLogo: boolean) {
  const W = 1024,
    H = 512;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const logo = getLogo();
  const t = text.trim().toUpperCase();
  if (useLogo && logo && logo.complete && logo.naturalWidth) {
    const lh = t ? 290 : 400;
    const lw = (logo.naturalWidth / logo.naturalHeight) * lh;
    ctx.drawImage(logo, W / 2 - lw / 2, t ? 30 : 56, lw, lh);
  }
  if (t) {
    const fam = cssFont("--font-instrument", "Georgia, serif");
    let size = useLogo ? 96 : 150;
    ctx.font = `${size}px ${fam}`;
    const spacing = 0.12;
    const measure = () => ctx.measureText(t).width + t.length * size * spacing;
    while (measure() > W * 0.9 && size > 30) {
      size -= 4;
      ctx.font = `${size}px ${fam}`;
    }
    // manual letter-spacing
    const total = measure();
    let x = W / 2 - total / 2;
    const y = useLogo && logo?.complete ? H - 82 : H / 2 + 6;
    ctx.textAlign = "left";
    for (const ch of t) {
      ctx.fillText(ch, x, y);
      x += ctx.measureText(ch).width + size * spacing;
    }
  }
  // alpha + height → normal
  const img = ctx.getImageData(0, 0, W, H).data;
  const a = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) a[i] = img[i * 4] / 255;
  // soft blur for bevel: a (2R+1) box with clamped edges, kept as running sums so each pixel costs
  // the same however wide the box (this runs on every keystroke in the stamp field)
  const R = 3,
    n = R * 2 + 1;
  const b = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    const row = y * W;
    let s = 0;
    for (let k = -R; k <= R; k++) s += a[row + Math.min(W - 1, Math.max(0, k))];
    for (let x = 0; x < W; x++) {
      b[row + x] = s / n;
      s += a[row + Math.min(W - 1, x + R + 1)] - a[row + Math.max(0, x - R)];
    }
  }
  const bb = new Float32Array(W * H);
  const col = new Float64Array(W);
  for (let k = -R; k <= R; k++) {
    const row = Math.min(H - 1, Math.max(0, k)) * W;
    for (let x = 0; x < W; x++) col[x] += b[row + x];
  }
  for (let y = 0; y < H; y++) {
    const row = y * W,
      add = Math.min(H - 1, y + R + 1) * W,
      sub = Math.max(0, y - R) * W;
    for (let x = 0; x < W; x++) {
      bb[row + x] = col[x] / n;
      col[x] += b[add + x] - b[sub + x];
    }
  }
  const alpha = new Uint8Array(W * H * 4);
  const normal = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      // texture rows run bottom-up, canvas rows top-down → write flipped
      const o = (H - 1 - y) * W + x;
      const v = Math.min(1, bb[i] * 1.6);
      alpha[o * 4] = alpha[o * 4 + 1] = alpha[o * 4 + 2] = v * 255;
      alpha[o * 4 + 3] = 255;
      const xm = bb[y * W + Math.max(0, x - 1)],
        xp = bb[y * W + Math.min(W - 1, x + 1)];
      const ym = bb[Math.max(0, y - 1) * W + x],
        yp = bb[Math.min(H - 1, y + 1) * W + x];
      // debossed: height = -bb
      const dx = -(xp - xm) * 6,
        dy = -(yp - ym) * 6;
      const inv = 1 / Math.sqrt(dx * dx + dy * dy + 1);
      normal[o * 4] = (-dx * inv * 0.5 + 0.5) * 255;
      normal[o * 4 + 1] = (dy * inv * 0.5 + 0.5) * 255;
      normal[o * 4 + 2] = (inv * 0.5 + 0.5) * 255;
      normal[o * 4 + 3] = 255;
    }
  const mk = (d: Uint8Array) => {
    const tx = new THREE.DataTexture(d, W, H, THREE.RGBAFormat);
    tx.flipY = false;
    tx.magFilter = THREE.LinearFilter;
    tx.minFilter = THREE.LinearMipmapLinearFilter;
    tx.generateMipmaps = true;
    tx.anisotropy = 8;
    tx.needsUpdate = true;
    return tx;
  };
  return { alpha: mk(alpha), normal: mk(normal) };
}

export type StampTextures = ReturnType<typeof stampCanvases>;

/** The footbed stamp's textures — build once per pair and hand the same set to both feet. */
export function useStampTextures(text: string, useLogo: boolean) {
  const stamp = useMemo(() => (typeof window === "undefined" ? null : stampCanvases(text, useLogo)), [text, useLogo]);
  useEffect(() => () => {
    stamp?.alpha.dispose();
    stamp?.normal.dispose();
  }, [stamp]);
  return stamp;
}

// ───────────────────────── component ─────────────────────────
function useLeatherMat(color: string, finish: Finish, repeat: number, seed: number) {
  const mat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide, metalness: 0 });
    return m;
  }, []);
  useEffect(() => {
    const maps = leatherMaps(finish, 256, seed);
    const set = (t: THREE.Texture) => {
      const c = t.clone();
      c.repeat.set(repeat, repeat);
      c.needsUpdate = true;
      return c;
    };
    mat.map?.dispose();
    mat.normalMap?.dispose();
    mat.roughnessMap?.dispose();
    mat.map = set(maps.shade);
    mat.normalMap = set(maps.normal);
    mat.roughnessMap = set(maps.rough);
    const soft = finish === "suede" || finish === "canvas";
    mat.roughness = soft ? 1 : 0.82;
    mat.sheen = soft ? 1 : 0.35;
    mat.sheenRoughness = soft ? 0.9 : 0.5;
    mat.clearcoat = finish === "croc" || finish === "smooth" || finish === "saffiano" ? 0.4 : 0.06;
    mat.clearcoatRoughness = 0.42;
    mat.needsUpdate = true;
  }, [finish, repeat, seed, mat]);
  useEffect(() => {
    mat.color.set(color);
    mat.sheenColor.set(color).lerp(new THREE.Color("#ffffff"), 0.3);
  }, [color, mat]);
  return mat;
}

export function SandalModel({ config, stamp, mirror = false }: { config: SandalConfig; stamp: StampTextures | null; mirror?: boolean }) {
  const bedOutline = useMemo(() => outlinePoints(0.955, 0.972, 260), []);
  const soleGeo = useMemo(() => extruded(outlinePoints(1, 1), SOLE_D, 0.02), []);
  const bedGeo = useMemo(() => {
    const g = extruded(bedOutline, BED_D, BED_BEVEL);
    g.translate(0, SOLE_D + 0.02, 0);
    return g;
  }, [bedOutline]);
  const straps = useMemo(() => buildStraps(config.silhouette), [config.silhouette]);
  const stitches = useMemo(() => stitchTransforms(straps, bedOutline), [straps, bedOutline]);
  const buckleGeo = useMemo(() => buckleGeometry(), []);
  const capsule = useMemo(() => {
    const g = new THREE.CapsuleGeometry(0.0062, 0.026, 3, 6);
    g.rotateZ(Math.PI / 2);
    return g;
  }, []);

  const rep = config.finish === "croc" ? 3.4 : config.finish === "woven" || config.finish === "perforated" ? 3 : 2.4;
  const strapMat = useLeatherMat(config.strap, config.finish, rep, 11);
  const strap2Mat = useLeatherMat(config.silhouette === "cross" ? config.strap2 : config.strap, config.finish, rep, 12);
  const bedMat = useLeatherMat(config.footbed, "smooth", 1.4, 5);
  const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.4 }), []);
  useEffect(() => {
    edgeMat.color.set(config.strap).multiplyScalar(0.45);
  }, [config.strap, edgeMat]);
  const edge2Mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.4 }), []);
  useEffect(() => {
    edge2Mat.color.set(config.silhouette === "cross" ? config.strap2 : config.strap).multiplyScalar(0.45);
  }, [config.strap2, config.strap, config.silhouette, edge2Mat]);
  const bedEdge = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.5 }), []);
  useEffect(() => {
    bedEdge.color.set(config.footbed).multiplyScalar(0.7);
  }, [config.footbed, bedEdge]);
  const soleMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.82 }), []);
  useEffect(() => {
    soleMat.color.set(config.sole);
  }, [config.sole, soleMat]);
  const threadMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.65 }), []);
  useEffect(() => {
    threadMat.color.set(config.thread);
  }, [config.thread, threadMat]);
  const metalMat = useMemo(() => new THREE.MeshStandardMaterial({ metalness: 0.85, roughness: 0.3 }), []);
  useEffect(() => {
    metalMat.color.set(config.hardware);
  }, [config.hardware, metalMat]);

  // stamp decal
  const stampMat = useMemo(() => new THREE.MeshPhysicalMaterial({ transparent: true, depthWrite: false }), []);
  useEffect(() => {
    if (!stamp) return;
    stampMat.alphaMap = stamp.alpha;
    stampMat.normalMap = stamp.normal;
    stampMat.normalScale.set(1.4, 1.4);
    if (config.stampStyle === "blind") {
      stampMat.color.set(config.footbed).multiplyScalar(0.62);
      stampMat.metalness = 0;
      stampMat.roughness = 0.55;
    } else {
      stampMat.color.set(config.stampStyle === "gold" ? "#d6b066" : "#d9dde0");
      stampMat.metalness = 1;
      stampMat.roughness = 0.24;
    }
    stampMat.needsUpdate = true;
  }, [stamp, config.stampStyle, config.footbed, stampMat]);

  const inst = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (!inst.current) return;
    stitches.forEach((m, i) => inst.current!.setMatrixAt(i, m));
    inst.current.count = stitches.length;
    inst.current.instanceMatrix.needsUpdate = true;
  }, [stitches]);

  // buckles for the twin silhouette
  const buckles = useMemo(() => {
    if (config.silhouette !== "twin") return [];
    return straps.map((s) => {
      const f = s.frames[Math.round(s.frames.length * 0.24)];
      const m = new THREE.Matrix4().makeBasis(f.t, f.w, f.n);
      const p = f.c.clone().addScaledVector(f.n, s.thick / 2 + 0.014);
      m.setPosition(p);
      return m;
    });
  }, [straps, config.silhouette]);

  return (
    <group scale={[mirror ? -1 : 1, 1, 1]}>
      <mesh geometry={soleGeo} material={soleMat} castShadow receiveShadow />
      <mesh geometry={bedGeo} material={[bedMat, bedEdge]} castShadow receiveShadow />
      {straps.map((s, i) => (
        <mesh
          key={`${config.silhouette}-${i}`}
          geometry={s.geometry}
          material={i === 1 && config.silhouette === "cross" ? [strap2Mat, edge2Mat] : [strapMat, edgeMat]}
          castShadow
          receiveShadow
        />
      ))}
      <instancedMesh key={config.silhouette} ref={inst} args={[capsule, threadMat, 900]} castShadow />
      {buckles.map((m, i) => (
        <mesh key={i} geometry={buckleGeo} material={metalMat} matrix={m} matrixAutoUpdate={false} castShadow />
      ))}
      {config.toeRing && (
        <mesh position={[-0.27, Y0 + 0.005, -1.0]} rotation={[0, 0.15, 0]} material={strapMat} castShadow>
          <torusGeometry args={[0.095, 0.026, 14, 40, Math.PI]} />
        </mesh>
      )}
      {stamp && (
        <mesh position={[0, Y0 + 0.0025, 0.82]} rotation={[-Math.PI / 2, 0, 0]} scale={[mirror ? -1 : 1, 1, 1]} material={stampMat}>
          <planeGeometry args={[0.6, 0.3]} />
        </mesh>
      )}
    </group>
  );
}
