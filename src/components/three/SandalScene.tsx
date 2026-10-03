"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SandalModel, type SandalConfig } from "./Sandal";

function Pair({ config, float }: { config: SandalConfig; float: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!float || !g.current) return;
    g.current.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.03;
  });
  return (
    <group ref={g}>
      <group position={[0.58, 0, 0.12]} rotation={[0, -0.08, 0]}>
        <SandalModel config={config} />
      </group>
      <group position={[-0.58, 0, -0.12]} rotation={[0, 0.08, 0]}>
        <SandalModel config={config} mirror />
      </group>
    </group>
  );
}

/**
 * An open studio floor. The fog melts it into the background colour in every direction, so the
 * camera can circle the pair freely — a sweep wall behind them blocked the view from the back.
 */
function Floor({ color }: { color: string }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.001, 0]} receiveShadow>
      <circleGeometry args={[40, 64]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

function CameraFit() {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const narrow = size.width / size.height < 0.9;
    cam.fov = narrow ? 42 : 30;
    cam.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

export default function SandalScene({
  config,
  interactive = true,
  autoRotate = true,
  backdrop = "#8f9a8e",
  preserve = false,
  zoom = true,
  onCreated,
}: {
  config: SandalConfig;
  interactive?: boolean;
  autoRotate?: boolean;
  backdrop?: string;
  preserve?: boolean;
  zoom?: boolean;
  onCreated?: (gl: THREE.WebGLRenderer) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    io.observe(host.current!);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={host} className="h-full w-full" data-cursor={interactive ? "Rotate" : undefined}>
      <Canvas
        frameloop={active ? "always" : "never"}
        shadows
        dpr={[1, 1.75]}
        camera={{ fov: 30, position: [4.3, 3.3, 5.2] }}
        gl={{ antialias: true, preserveDrawingBuffer: preserve }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          onCreated?.(gl);
        }}
      >
        <color attach="background" args={[backdrop]} />
        <fog attach="fog" args={[backdrop, 9, 18]} />
        <CameraFit />
        <ambientLight intensity={0.35} />
        <directionalLight
          position={[3.5, 6, 3]}
          intensity={2.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-3}
          shadow-camera-right={3}
          shadow-camera-top={3}
          shadow-camera-bottom={-3}
          shadow-bias={-0.0004}
        />
        <directionalLight position={[-4, 3, -2]} intensity={0.6} color="#ffe4c4" />
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={2.6} position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[8, 5, 1]} />
          <Lightformer form="rect" intensity={1.6} color="#fff1dc" position={[-5, 2, 1]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
          <Lightformer form="rect" intensity={1.2} position={[5, 1.5, -1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
          <Lightformer form="ring" intensity={2} position={[2, 3, 4]} scale={1.5} />
        </Environment>
        <Floor color={backdrop} />
        <Pair config={config} float={!interactive} />
        <ContactShadows position={[0, 0.002, 0]} opacity={0.55} scale={7} blur={2.2} far={2} resolution={1024} />
        <OrbitControls
          enabled={interactive}
          enablePan={false}
          enableZoom={interactive && zoom}
          autoRotate={autoRotate}
          autoRotateSpeed={0.6}
          enableDamping
          dampingFactor={0.06}
          minDistance={3}
          maxDistance={9}
          minPolarAngle={0.25}
          maxPolarAngle={Math.PI * 0.47}
          target={[0, 0.22, 0]}
        />
      </Canvas>
    </div>
  );
}
