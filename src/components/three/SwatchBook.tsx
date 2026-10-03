"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { leatherMaterial } from "@/lib/leather";
import { SWATCHES, type Swatch } from "@/content/materials";

const W = 1.25,
  H = 2.05,
  R = 0.12,
  DEPTH = 0.03;
const PIVOT = new THREE.Vector2(0, -H / 2 + 0.2);

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2,
    y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function useSwatchGeometry() {
  return useMemo(() => {
    const shape = roundedRect(W, H, R);
    const hole = new THREE.Path();
    hole.absarc(PIVOT.x, PIVOT.y, 0.075, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 3,
      curveSegments: 24,
    });
    geo.translate(-PIVOT.x, -PIVOT.y, 0); // pivot at origin

    // stitches along an inset outline
    const inset = roundedRect(W - 0.16, H - 0.16, R * 0.6);
    const pts = inset.getSpacedPoints(150);
    const stitches: { p: THREE.Vector3; a: number }[] = [];
    for (let i = 0; i < pts.length - 1; i += 1) {
      const a = pts[i],
        b = pts[i + 1];
      if (Math.abs(a.y - PIVOT.y) < 0.18 && Math.abs(a.x) < 0.2) continue;
      stitches.push({
        p: new THREE.Vector3((a.x + b.x) / 2 - PIVOT.x, (a.y + b.y) / 2 - PIVOT.y, DEPTH + 0.012),
        a: Math.atan2(b.y - a.y, b.x - a.x),
      });
    }
    return { geo, stitches };
  }, []);
}

function SwatchMesh({
  s,
  i,
  n,
  geo,
  stitches,
  spread,
  hovered,
  setHovered,
}: {
  s: Swatch;
  i: number;
  n: number;
  geo: THREE.ExtrudeGeometry;
  stitches: { p: THREE.Vector3; a: number }[];
  spread: React.RefObject<number>;
  hovered: React.RefObject<number>;
  setHovered: (i: number) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const lift = useRef(0);
  const inst = useRef<THREE.InstancedMesh>(null);

  const mats = useMemo(() => {
    const face = leatherMaterial(s.hex, s.finish, { repeat: 1.6, seed: 3 + i });
    const edge = new THREE.MeshStandardMaterial({ color: s.edge, roughness: 0.45 });
    return [face, edge];
  }, [s, i]);

  const threadMat = useMemo(() => new THREE.MeshStandardMaterial({ color: s.thread, roughness: 0.6 }), [s.thread]);
  const capsule = useMemo(() => {
    const g = new THREE.CapsuleGeometry(0.0065, 0.03, 3, 6);
    g.rotateZ(Math.PI / 2);
    return g;
  }, []);

  useEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const one = new THREE.Vector3(1, 1, 1);
    stitches.forEach((st, k) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), st.a);
      m.compose(st.p, q, one);
      inst.current!.setMatrixAt(k, m);
    });
    inst.current!.instanceMatrix.needsUpdate = true;
  }, [stitches]);

  useFrame(() => {
    const g = group.current!;
    const k = i - (n - 1) / 2;
    const sp = spread.current ?? 0;
    const target = hovered.current === i ? 1 : 0;
    lift.current += (target - lift.current) * 0.12;
    const ang = -k * sp * 0.2;
    g.rotation.z = ang;
    g.position.z = i * (DEPTH + 0.03) - n * 0.03;
    // slide out along its own axis when hovered
    g.position.x = -Math.sin(ang) * lift.current * 0.35;
    g.position.y = Math.cos(ang) * lift.current * 0.35;
  });

  return (
    <group ref={group}>
      <mesh
        geometry={geo}
        material={mats}
        castShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(i);
        }}
        onPointerOut={() => setHovered(-1)}
      />
      <instancedMesh ref={inst} args={[capsule, threadMat, stitches.length]} />
    </group>
  );
}

function Fit() {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    camera.position.z = aspect < 0.8 ? 9.2 : aspect < 1.1 ? 7.4 : 6.1;
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

function Book({
  spread,
  hovered,
  setHovered,
  pointer,
}: {
  spread: React.RefObject<number>;
  hovered: React.RefObject<number>;
  setHovered: (i: number) => void;
  pointer: React.RefObject<{ x: number; y: number }>;
}) {
  const { geo, stitches } = useSwatchGeometry();
  const root = useRef<THREE.Group>(null);
  useFrame(() => {
    const p = pointer.current!;
    const g = root.current!;
    g.rotation.y += (p.x * 0.35 - 0.12 - g.rotation.y) * 0.05;
    g.rotation.x += (-p.y * 0.18 - 0.08 - g.rotation.x) * 0.05;
  });
  return (
    <group ref={root} position={[0, -1.05, 0]}>
      {SWATCHES.map((s, i) => (
        <SwatchMesh
          key={i}
          s={s}
          i={i}
          n={SWATCHES.length}
          geo={geo}
          stitches={stitches}
          spread={spread}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
      {/* brass post */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.06, 0.06, 0.62, 32]} />
        <meshStandardMaterial color="#c9a45e" metalness={0.75} roughness={0.32} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.42]}>
        <cylinderGeometry args={[0.13, 0.13, 0.04, 40]} />
        <meshStandardMaterial color="#d8b673" metalness={0.75} roughness={0.28} emissive="#3a2a10" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.22]}>
        <cylinderGeometry args={[0.13, 0.13, 0.04, 40]} />
        <meshStandardMaterial color="#b9944f" metalness={0.75} roughness={0.32} />
      </mesh>
    </group>
  );
}

export default function SwatchBook({
  spread,
  hoveredIndex,
  onHover,
}: {
  spread: React.RefObject<number>;
  hoveredIndex: React.RefObject<number>;
  onHover: (i: number) => void;
}) {
  const pointer = useRef({ x: 0, y: 0 });
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "120px" });
    io.observe(host.current!);
    return () => {
      window.removeEventListener("pointermove", move);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={host} className="h-full w-full" data-cursor="Feel">
      <Canvas frameloop={active ? "always" : "never"} shadows dpr={[1, 1.75]} camera={{ fov: 30, position: [0, 0.25, 6.1] }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.25} />
        <directionalLight position={[3, 5, 6]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-4, 1, 3]} intensity={0.45} color="#ffe2c2" />
        <pointLight position={[0.6, -0.6, 2.2]} intensity={4} distance={5} color="#ffe6c0" />
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={3} position={[0, 4, 4]} scale={[8, 2, 1]} />
          <Lightformer form="rect" intensity={1.4} color="#ffd9b0" position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} />
          <Lightformer form="ring" intensity={2} position={[4, 2, 3]} scale={2} />
        </Environment>
        <Fit />
        <Book spread={spread} hovered={hoveredIndex} setHovered={onHover} pointer={pointer} />
        <ContactShadows position={[0, -2.6, 0]} opacity={0.35} scale={9} blur={2.6} far={4} />
      </Canvas>
    </div>
  );
}
