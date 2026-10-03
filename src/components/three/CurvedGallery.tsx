"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Product } from "@/content/products";

export const optimised = (src: string, w = 640) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=70`;

const vert = /* glsl */ `
uniform float uCurve;
uniform float uVel;
varying vec2 vUv;
varying float vDepth;
void main(){
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  float bend = wp.x * wp.x * uCurve;
  wp.z -= bend;
  // cards flex a little against the direction of travel
  wp.x += sin(uv.y * 3.14159) * uVel * 0.06;
  vDepth = bend;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
const frag = /* glsl */ `
uniform sampler2D uTex;
uniform vec2 uPlane;
uniform vec2 uImage;
uniform float uHover;
uniform float uVel;
varying vec2 vUv;
varying float vDepth;
vec2 cover(vec2 uv){
  float rp = uPlane.x/uPlane.y, ri = uImage.x/uImage.y;
  vec2 s = rp > ri ? vec2(1.0, ri/rp) : vec2(rp/ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}
void main(){
  vec2 uv = cover(vUv);
  uv = (uv - 0.5) * (1.0 - 0.07 * uHover) + 0.5;
  float s = clamp(uVel, -2.0, 2.0) * 0.006;
  vec3 c = vec3(texture2D(uTex, uv + vec2(s, 0.0)).r, texture2D(uTex, uv).g, texture2D(uTex, uv - vec2(s, 0.0)).b);
  // fade cards as they curve away into the dark
  c *= 1.0 - clamp(vDepth * 0.22, 0.0, 0.75);
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}
`;

type CardProps = {
  url: string;
  index: number;
  count: number;
  spacing: number;
  w: number;
  h: number;
  state: React.RefObject<{ offset: number; vel: number; hovered: number }>;
  onPick: (i: number) => void;
};

function Card({ url, index, count, spacing, w, h, state, onPick }: CardProps) {
  const tex = useTexture(url);
  const mesh = useRef<THREE.Mesh>(null);
  const hover = useRef(0);
  const uniforms = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const img = tex.image as HTMLImageElement;
    return {
      uTex: { value: tex },
      uPlane: { value: new THREE.Vector2(w, h) },
      uImage: { value: new THREE.Vector2(img?.width || 1, img?.height || 1) },
      uHover: { value: 0 },
      uVel: { value: 0 },
      uCurve: { value: 0.06 },
    };
  }, [tex, w, h]);

  useFrame(() => {
    const s = state.current;
    const L = count * spacing;
    let x = (index * spacing + s.offset) % L;
    if (x < 0) x += L;
    x -= L / 2;
    mesh.current!.position.x = x;
    const target = s.hovered === index ? 1 : 0;
    hover.current += (target - hover.current) * 0.1;
    uniforms.uHover.value = hover.current;
    uniforms.uVel.value = s.vel;
    uniforms.uCurve.value = 0.055 + Math.min(0.05, Math.abs(s.vel) * 0.012);
    mesh.current!.scale.setScalar(1 + hover.current * 0.03);
  });

  return (
    <mesh
      ref={mesh}
      onPointerOver={(e) => {
        e.stopPropagation();
        state.current.hovered = index;
      }}
      onPointerOut={() => {
        if (state.current.hovered === index) state.current.hovered = -1;
      }}
      onClick={(e) => {
        e.stopPropagation();
        onPick(index);
      }}
    >
      <planeGeometry args={[w, h, 24, 24]} />
      <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={uniforms} />
    </mesh>
  );
}

function Rig({
  state,
  count,
  spacing,
  onCenter,
}: {
  state: React.RefObject<{ offset: number; target: number; vel: number; hovered: number }>;
  count: number;
  spacing: number;
  onCenter: (i: number) => void;
}) {
  const { camera, size } = useThree();
  const last = useRef(-1);
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.z = size.width < 500 ? 11 : size.width < 900 ? 8.6 : 6.4;
    cam.updateProjectionMatrix();
  }, [camera, size.width]);
  useFrame((_, dt) => {
    const s = state.current;
    const prev = s.offset;
    s.offset += (s.target - s.offset) * Math.min(1, dt * 5);
    s.vel += ((s.offset - prev) / Math.max(dt, 1e-3) - s.vel) * 0.15;
    // the card nearest to centre
    const L = count * spacing;
    let best = 0,
      bestD = 1e9;
    for (let i = 0; i < count; i++) {
      let x = (i * spacing + s.offset) % L;
      if (x < 0) x += L;
      x -= L / 2;
      if (Math.abs(x) < bestD) {
        bestD = Math.abs(x);
        best = i;
      }
    }
    if (best !== last.current) {
      last.current = best;
      onCenter(best);
    }
  });
  return null;
}

export default function CurvedGallery({
  items,
  onOpen,
  scrollProgress,
}: {
  items: Product[];
  onOpen: (p: Product) => void;
  scrollProgress: React.RefObject<number>;
}) {
  const state = useRef({ offset: 0, target: 0, vel: 0, hovered: -1 });
  const host = useRef<HTMLDivElement>(null);
  const [center, setCenter] = useState(0);
  const [active, setActive] = useState(true);
  const drag = useRef({ down: false, x: 0, moved: 0, base: 0 });
  const spacing = 2.05;
  const w = 1.75,
    h = 2.2;
  const urls = useMemo(() => items.map((p) => optimised(p.images[0], 640)), [items]);

  // scroll drives the strip too
  useEffect(() => {
    let raf = 0;
    let lastP = scrollProgress.current ?? 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const p = scrollProgress.current ?? 0;
      const d = p - lastP;
      lastP = p;
      if (!drag.current.down) state.current.target -= d * spacing * items.length * 0.9;
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [scrollProgress, items.length]);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "200px" });
    io.observe(host.current!);
    return () => io.disconnect();
  }, []);

  const onDown = (e: React.PointerEvent) => {
    drag.current = { down: true, x: e.clientX, moved: 0, base: state.current.target };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.down) return;
    const dx = e.clientX - drag.current.x;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
    state.current.target = drag.current.base + dx * 0.012;
  };
  const onUp = () => {
    drag.current.down = false;
  };

  return (
    <div ref={host} className="relative h-full w-full" style={{ touchAction: "pan-y" }}>
      <div
        className="absolute inset-0"
        data-cursor="Drag"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onPointerCancel={onUp}
      >
        <Canvas
          frameloop={active ? "always" : "never"}
          dpr={[1, 1.6]}
          camera={{ fov: 32, position: [0, 0, 6.4] }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            {urls.map((u, i) => (
              <Card
                key={u}
                url={u}
                index={i}
                count={items.length}
                spacing={spacing}
                w={w}
                h={h}
                state={state}
                onPick={(idx) => {
                  if (drag.current.moved < 6) onOpen(items[idx]);
                }}
              />
            ))}
          </Suspense>
          <Rig state={state} count={items.length} spacing={spacing} onCenter={setCenter} />
        </Canvas>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center text-center md:bottom-8">
        <span className="mono opacity-60">
          N° {String(center + 1).padStart(2, "0")} — {items[center]?.line}
        </span>
        <span key={center} className="serif mt-2 text-[34px] leading-none md:text-[44px]" style={{ animation: "galname .7s cubic-bezier(.22,1,.36,1)" }}>
          {items[center]?.name}
        </span>
      </div>
      <style>{`@keyframes galname{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
