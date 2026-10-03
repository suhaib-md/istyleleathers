"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/gsap";

/**
 * Full-screen leather surface rendered in a fragment shader:
 *  - procedural pebble grain (two Worley octaves + noise) and soft creases
 *  - the I Style badge heat-stamped (debossed) into the hide, filled with gold foil
 *  - a saddle-stitched border
 *  - a point light that follows the cursor (or drifts on its own on touch)
 */

const vert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const frag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;        // css px
uniform float uTime;
uniform vec3 uLight;      // uv xy + height factor
uniform sampler2D uLogo;  // r sharp, g blur, b wide blur
uniform vec4 uLogoRect;   // cx, cy, w, h (uv)
uniform vec3 uBase;
uniform vec3 uFoil;
uniform vec3 uThread;
uniform float uIntro;
uniform float uFade;
uniform float uInset;

vec2 hash2(vec2 p){ p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))); return fract(sin(p)*43758.5453); }
float hash1(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  float a=hash1(i), b=hash1(i+vec2(1.,0.)), c=hash1(i+vec2(0.,1.)), d=hash1(i+vec2(1.,1.));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y); }
float fbm(vec2 p){ float s=0., a=.5; for(int i=0;i<4;i++){ s+=a*vnoise(p); p=p*2.03+17.1; a*=.5;} return s; }
vec2 worley(vec2 p){
  vec2 n = floor(p); vec2 f = fract(p);
  float f1 = 8.0, f2 = 8.0;
  for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
    vec2 g = vec2(float(i),float(j));
    vec2 o = 0.5 + 0.42*sin(6.2831*hash2(n+g));
    vec2 r = g + o - f;
    float d = dot(r,r);
    if(d<f1){ f2=f1; f1=d; } else if(d<f2){ f2=d; }
  }
  return vec2(sqrt(f1), sqrt(f2));
}
float sdRoundRect(vec2 p, vec2 b, float r){ vec2 q = abs(p)-b+r; return length(max(q,0.)) + min(max(q.x,q.y),0.) - r; }

vec3 logoAt(vec2 uv){
  vec2 luv = (uv - (uLogoRect.xy - uLogoRect.zw*0.5)) / uLogoRect.zw;
  if(luv.x<0.||luv.y<0.||luv.x>1.||luv.y>1.) return vec3(0.);
  return texture2D(uLogo, vec2(luv.x, 1.0-luv.y)).rgb;
}

// returns height; also writes grain plateau + stitch masks
float heightAt(vec2 px, out float plateau, out float thread, out vec3 logo){
  vec2 uv = px / uRes;
  vec2 w = worley(px / 8.5);
  float edge = smoothstep(0.0, 0.42, w.y - w.x);
  float dome = 1.0 - clamp(w.x*1.25, 0., 1.);
  vec2 w2 = worley(px / 52.0 + 3.7);
  float edge2 = smoothstep(0.0, 0.16, w2.y - w2.x);
  plateau = edge * (0.55 + 0.45*edge2);
  float grain = edge*(0.6+0.4*dome) + 0.45*edge2 + 0.08*vnoise(px*0.55);
  float crease = fbm(uv*vec2(2.6, 1.7) + vec2(0.0, uTime*0.004));
  logo = logoAt(uv);
  float press = logo.g * uIntro;
  // stitching
  vec2 c = uRes*0.5; vec2 p = px - c; vec2 b = c - vec2(uInset);
  float d = sdRoundRect(p, b, 14.0);
  float along = (abs(p.x) - b.x > abs(p.y) - b.y) ? p.y : p.x;
  float seg = fract(along / 10.0);
  float st = smoothstep(0.02,0.12,seg) * (1.0 - smoothstep(0.62,0.72,seg));
  float across = abs(d);
  thread = (1.0 - smoothstep(0.9, 1.9, across)) * st;
  float channel = 1.0 - smoothstep(0.0, 6.0, across);
  float h = grain*0.42*(1.0 - 0.85*press) + crease*2.2 - press*1.5 - channel*0.35 + thread*0.9*sqrt(max(0.,1.0-across/1.9));
  return h;
}

void main(){
  vec2 px = vUv * uRes;
  float plateau, thread, pl2, th2, pl3, th3; vec3 logo, lg2, lg3;
  float h  = heightAt(px, plateau, thread, logo);
  float hx = heightAt(px + vec2(1.0,0.0), pl2, th2, lg2);
  float hy = heightAt(px + vec2(0.0,1.0), pl3, th3, lg3);
  vec3 N = normalize(vec3(-(hx-h)*2.2, -(hy-h)*2.2, 1.0));

  float minDim = min(uRes.x, uRes.y);
  vec3 pos = vec3(px, 0.0);
  vec3 lp = vec3(uLight.xy*uRes, uLight.z*minDim);
  vec3 L = normalize(lp - pos);
  vec3 V = vec3(0.,0.,1.);
  vec3 H = normalize(L+V);
  float dist = length(lp.xy - pos.xy)/minDim;
  float att = 1.0/(1.0 + dist*dist*2.6);
  float diff = max(dot(N,L),0.0);
  float ndh = max(dot(N,H),0.0);

  // leather
  float mottling = 0.9 + 0.2*fbm(px*0.0035 + 4.0);
  vec3 base = uBase * mix(0.62, 1.1, plateau) * mottling;
  float spec = pow(ndh, 26.0) * 0.32 * (0.35 + plateau);
  vec3 leather = base*(0.10 + diff*1.25*att) + spec*att*vec3(1.0,0.86,0.7);
  // a little rim of warm light grazing the grain
  leather += base * pow(1.0 - diff, 4.0) * 0.04;

  // gold foil inside the stamp
  float foil = smoothstep(0.42, 0.6, logo.r) * uIntro;
  float flake = 0.82 + 0.36*vnoise(px*0.85);
  vec3 foilCol = uFoil*flake;
  float fspec = pow(ndh, 70.0)*2.4 + pow(ndh, 12.0)*0.35;
  vec3 gold = foilCol*(0.18 + diff*0.95*att) + fspec*att*vec3(1.0,0.93,0.75);

  vec3 col = mix(leather, gold, foil);
  // pressed shadow around the stamp
  col *= 1.0 - logo.b*0.22*uIntro*(1.0-foil);

  // thread
  vec3 thr = uThread*(0.22 + diff*1.1*att) + pow(ndh,30.0)*0.4*att;
  col = mix(col, thr, thread*0.95);

  // vignette + fade
  vec2 q = vUv - 0.5;
  col *= 1.0 - dot(q*vec2(1.0,1.2),q*vec2(1.0,1.2))*1.05;
  col *= uFade;

  // filmic-ish curve + gamma
  col = col / (col + vec3(0.62)) * 1.62;
  col = pow(max(col, 0.0), vec3(1.0/2.2));
  gl_FragColor = vec4(col, 1.0);
}
`;

function boxBlur(src: Float32Array, w: number, h: number, r: number) {
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  const size = r * 2 + 1;
  for (let y = 0; y < h; y++) {
    let acc = 0;
    for (let x = -r; x <= r; x++) acc += src[y * w + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = acc / size;
      const add = src[y * w + Math.min(w - 1, x + r + 1)];
      const sub = src[y * w + Math.max(0, x - r)];
      acc += add - sub;
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc / size;
      const add = tmp[Math.min(h - 1, y + r + 1) * w + x];
      const sub = tmp[Math.max(0, y - r) * w + x];
      acc += add - sub;
    }
  }
  return out;
}

async function logoTexture(src: string, height = 760) {
  const img = new Image();
  img.src = src;
  await img.decode();
  const w = Math.round((img.width / img.height) * height);
  const h = height;
  const pad = 40;
  const W = w + pad * 2,
    H = h + pad * 2;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, pad, pad, w, h);
  const id = ctx.getImageData(0, 0, W, H).data;
  const a = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) a[i] = id[i * 4 + 3] / 255;
  let b1 = boxBlur(a, W, H, 2);
  b1 = boxBlur(b1, W, H, 2);
  let b2 = boxBlur(a, W, H, 9);
  b2 = boxBlur(b2, W, H, 9);
  const data = new Uint8Array(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    data[i * 4] = a[i] * 255;
    data[i * 4 + 1] = Math.min(1, b1[i] * 1.15) * 255;
    data[i * 4 + 2] = Math.min(1, b2[i] * 1.6) * 255;
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, W, H, THREE.RGBAFormat);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return { tex, aspect: W / H };
}

export default function LeatherHero({ className = "" }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current!;
    const reduce = prefersReducedMotion();
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
    } catch {
      el.classList.add("hero-fallback");
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.6);
    renderer.setPixelRatio(dpr);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uLight: { value: new THREE.Vector3(0.68, 0.62, 0.42) },
      uLogo: { value: new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1) },
      uLogoRect: { value: new THREE.Vector4(0.7, 0.5, 0.3, 0.7) },
      uBase: { value: new THREE.Color("#5a3220") },
      uFoil: { value: new THREE.Color("#d8b26a") },
      uThread: { value: new THREE.Color("#eadbc0") },
      uIntro: { value: 0 },
      uFade: { value: 1 },
      uInset: { value: 22 },
    };
    // colours are authored in sRGB; the shader works in linear
    (uniforms.uBase.value as THREE.Color).convertSRGBToLinear();
    (uniforms.uFoil.value as THREE.Color).convertSRGBToLinear();
    (uniforms.uThread.value as THREE.Color).convertSRGBToLinear();
    uniforms.uLogo.value.needsUpdate = true;

    const mat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms });
    if (process.env.NODE_ENV !== "production") (window as unknown as { __hero?: unknown }).__hero = uniforms;
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    scene.add(quad);

    let logoAspect = 0.77;
    const layout = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w, h);
      uniforms.uInset.value = w < 640 ? 12 : 22;
      const r = uniforms.uLogoRect.value;
      if (w / h > 1.05) {
        const hu = 0.74;
        const wu = (hu * logoAspect * h) / w;
        r.set(0.71, 0.5, wu, hu);
      } else {
        const wu = w < 500 ? 0.58 : 0.5;
        const hu = (wu / logoAspect) * (w / h);
        r.set(0.5, 1 - hu / 2 - 0.085, wu, hu);
      }
    };
    layout();

    let alive = true;
    logoTexture("/brand/logo-full.png").then(({ tex, aspect }) => {
      if (!alive) return;
      uniforms.uLogo.value = tex;
      logoAspect = aspect;
      layout();
    });

    // light control
    const target = new THREE.Vector2(0.68, 0.62);
    const cur = new THREE.Vector2(0.68, 0.62);
    let lastMove = -1e9;
    const onMove = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      if (e.clientY > b.bottom || e.clientY < b.top) return;
      target.set((e.clientX - b.left) / b.width, 1 - (e.clientY - b.top) / b.height);
      lastMove = performance.now();
    };
    if (!coarse) window.addEventListener("pointermove", onMove, { passive: true });

    // stamp-in once intro finishes
    let introStart = -1;
    const startIntro = () => {
      if (introStart < 0) introStart = performance.now();
    };
    window.addEventListener("istyle:ready", startIntro);
    const fallback = setTimeout(startIntro, 2600);
    try {
      if (sessionStorage.getItem("istyle-intro") === "1") setTimeout(startIntro, 250);
    } catch {}

    // pause when off-screen
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(el);

    const ro = new ResizeObserver(layout);
    ro.observe(el);

    const t0 = performance.now();
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const t = (performance.now() - t0) / 1000;
      uniforms.uTime.value = t;
      if (introStart > 0) {
        const k = Math.min(1, (performance.now() - introStart) / 1400);
        uniforms.uIntro.value = reduce ? 1 : 1 - Math.pow(1 - k, 3);
      }
      const idle = performance.now() - lastMove > 2500;
      if (idle && !reduce) {
        const r = uniforms.uLogoRect.value;
        target.set(r.x + Math.cos(t * 0.35) * r.z * 0.75, r.y + Math.sin(t * 0.5) * r.w * 0.38);
      }
      cur.lerp(target, idle ? 0.02 : 0.08);
      uniforms.uLight.value.set(cur.x, cur.y, 0.42);
      // dim as the hero scrolls away
      const b = el.getBoundingClientRect();
      uniforms.uFade.value = Math.max(0.35, Math.min(1, 1 + b.top / (b.height * 1.1)));
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("istyle:ready", startIntro);
      io.disconnect();
      ro.disconnect();
      mat.dispose();
      quad.geometry.dispose();
      (uniforms.uLogo.value as THREE.Texture).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={host} className={`absolute inset-0 overflow-hidden bg-leather ${className}`} aria-hidden />;
}
