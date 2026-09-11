import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import { Floaters, RiverLine, StageFloor, StageLights } from "./FragmentModel";
import { useStore } from "../store";

type Vec3 = [number, number, number];

function seed(n: number) {
  const x = Math.sin(n * 91.7 + 47.3) * 43758.5453;
  return x - Math.floor(x);
}

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const SKYLINE = [
  { x: -6.3, w: 1.0, h: 1.35, d: 0.9 },
  { x: -5.1, w: 0.8, h: 2.15, d: 0.8 },
  { x: -4.1, w: 1.15, h: 1.05, d: 1.0 },
  { x: -3.0, w: 0.7, h: 2.85, d: 0.7 },
  { x: -2.0, w: 1.2, h: 1.65, d: 1.0 },
  { x: -0.8, w: 0.9, h: 3.4, d: 0.9 },
  { x: 0.35, w: 1.3, h: 1.9, d: 1.1 },
  { x: 1.55, w: 0.7, h: 2.55, d: 0.7 },
  { x: 2.55, w: 1.1, h: 1.25, d: 0.9 },
  { x: 3.6, w: 0.8, h: 3.0, d: 0.8 },
  { x: 4.65, w: 1.2, h: 1.7, d: 1.0 },
  { x: 5.8, w: 0.9, h: 2.3, d: 0.8 },
];

export default function PrologueScene({ playhead }: { playhead: React.MutableRefObject<number> }) {
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const reduced = useStore.getState().reducedMotion;

  const frags = useMemo(
    () =>
      SKYLINE.map((s, i) => {
        const start: Vec3 = [
          s.x * 2.1 + (seed(i) - 0.5) * 12,
          3.5 + seed(i + 11) * 8,
          -7 - seed(i + 23) * 7,
        ];
        const end: Vec3 = [s.x, s.h / 2, 0.4 + (seed(i + 5) - 0.5) * 0.9];
        const startRot: Vec3 = [
          (seed(i + 2) - 0.5) * 2.4,
          (seed(i + 3) - 0.5) * 2.4,
          (seed(i + 4) - 0.5) * 1.6,
        ];
        return { ...s, start, end, startRot, win: 0.08 + i * 0.045 };
      }),
    []
  );

  const ghosts = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        p: [(seed(i + 50) - 0.5) * 13, 1.5 + seed(i + 60) * 4, -4 - seed(i + 70) * 5] as Vec3,
        s: [0.5 + seed(i + 80), 0.5 + seed(i + 90) * 1.6, 0.4] as Vec3,
        speed: 0.1 + seed(i + 100) * 0.2,
      })),
    []
  );

  useFrame((state, delta) => {
    const t = reduced ? 1 : playhead.current;
    // cámara con peso
    const cam = state.camera;
    const cz = THREE.MathUtils.lerp(13.6, 8.9, easeInOutCubic(Math.min(1, t / 0.9)));
    const cy = THREE.MathUtils.lerp(3.5, 2.35, easeInOutCubic(Math.min(1, t / 0.9)));
    const k = reduced ? 1 : Math.min(1, delta * 4);
    cam.position.x += (0 - cam.position.x) * k;
    cam.position.y += (cy - cam.position.y) * k;
    cam.position.z += (cz - cam.position.z) * k;
    cam.lookAt(0, 1.75, 0);

    const now = state.clock.elapsedTime;
    frags.forEach((f, i) => {
      const m = meshes.current[i];
      if (!m) return;
      const kk = reduced ? 1 : easeInOutCubic(THREE.MathUtils.clamp((t - f.win) / 0.4, 0, 1));
      const bob = kk >= 1 && !reduced ? Math.sin(now * 0.9 + i) * 0.03 : 0;
      m.position.set(
        THREE.MathUtils.lerp(f.start[0], f.end[0], kk),
        THREE.MathUtils.lerp(f.start[1], f.end[1], kk) + bob,
        THREE.MathUtils.lerp(f.start[2], f.end[2], kk)
      );
      m.rotation.set(
        f.startRot[0] * (1 - kk),
        f.startRot[1] * (1 - kk),
        f.startRot[2] * (1 - kk)
      );
    });

    ghosts.forEach((g, i) => {
      const m = meshes.current[SKYLINE.length + i];
      if (!m) return;
      m.rotation.y += delta * g.speed;
      m.rotation.x += delta * g.speed * 0.6;
      m.position.y = g.p[1] + Math.sin(now * 0.4 + i * 2) * 0.35;
    });
  });

  return (
    <>
      <StageLights />
      <StageFloor />
      <Floaters count={260} spread={20} />
      <RiverLine position={[0, 0, 3.4]} />

      {frags.map((f, i) => (
        <mesh key={i} ref={(el) => { meshes.current[i] = el; }} position={f.start}>
          <boxGeometry args={[f.w, f.h, f.d]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? "#cfc6b2" : i % 3 === 1 ? "#b3653f" : "#9aa0a6"}
            roughness={0.85}
            transparent
            opacity={0.94}
          />
          <Edges threshold={20} color="#10161d" />
        </mesh>
      ))}

      {ghosts.map((g, i) => (
        <mesh key={`g-${i}`} ref={(el) => { meshes.current[SKYLINE.length + i] = el; }} position={g.p}>
          <boxGeometry args={g.s} />
          <meshBasicMaterial color="#4fa3a8" wireframe transparent opacity={0.28} />
        </mesh>
      ))}
    </>
  );
}
