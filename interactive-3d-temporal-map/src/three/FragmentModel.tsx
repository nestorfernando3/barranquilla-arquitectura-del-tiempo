import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Edges, Grid } from "@react-three/drei";
import {
  MATERIAL_COLORS,
  ZONE_COLORS,
  type BoxSpec,
  type Building,
} from "../data/buildings";
import { getBlueprintTexture } from "../lib/blueprint";
import { useStore } from "../store";

export type LayerMode = "forma" | "material" | "funcion" | "ciudad" | "memoria";

const PAPER = "#d8d0bd";
const EDGE_DARK = "#10161d";
const TEAL = "#4fa3a8";
const TEAL_DEEP = "#2b6e74";

function seed(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function boxColor(box: BoxSpec, mode: LayerMode): string {
  if (mode === "forma") return PAPER;
  if (mode === "material") return MATERIAL_COLORS[box.m];
  if (mode === "funcion") return ZONE_COLORS[box.zone ?? "servicio"];
  if (mode === "ciudad") return MATERIAL_COLORS[box.m];
  return TEAL_DEEP;
}

function edgeColor(mode: LayerMode, lost: boolean): string {
  if (mode === "memoria" || lost) return TEAL;
  if (mode === "ciudad") return "#8ea3b8";
  if (mode === "forma") return "#3d3628";
  return EDGE_DARK;
}

/* ------------------------------------------------ labels */
function makeLabelTexture(text: string): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 96;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "rgba(11,15,20,0.88)";
  ctx.fillRect(0, 0, 512, 96);
  ctx.fillStyle = TEAL;
  ctx.fillRect(0, 0, 6, 96);
  ctx.font = "500 32px 'IBM Plex Mono', monospace";
  ctx.fillStyle = "#e9e2d0";
  ctx.fillText(text.slice(0, 26), 26, 59);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function LabelTag({
  text,
  position,
  opacity = 1,
}: {
  text: string;
  position: [number, number, number];
  opacity?: number;
}) {
  const tex = useMemo(() => makeLabelTexture(text), [text]);
  return (
    <sprite position={position} scale={[1.7, 0.32, 1]}>
      <spriteMaterial map={tex} transparent opacity={opacity} depthWrite={false} />
    </sprite>
  );
}

/* ------------------------------------------------ fragment model */
export function FragmentModel({
  building,
  explode,
  mode = "forma",
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  showLabels = true,
  showArchive = true,
  ghost = false,
}: {
  building: Building;
  explode: number;
  mode?: LayerMode;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  showLabels?: boolean;
  showArchive?: boolean;
  ghost?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const current = useRef(explode);
  const lost = building.status === "perdido" || ghost;
  const { boxes, profile } = building.massing;
  const isMemoria = mode === "memoria" || lost;

  const axisIndex = profile.axis === "x" ? 0 : profile.axis === "y" ? 1 : 2;

  const sorted = useMemo(() => {
    const withIdx = boxes.map((b, i) => ({ box: b, i, c: b.p[axisIndex] }));
    const centroid = withIdx.reduce((a, b) => a + b.c, 0) / withIdx.length;
    let half = 0;
    for (const w of withIdx) half = Math.max(half, Math.abs(w.c - centroid));
    return { list: withIdx, centroid, half: half || 1 };
  }, [boxes, axisIndex]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const target = isMemoria ? Math.max(explode, 0.55) : explode;
    const reduced = useStore.getState().reducedMotion;
    const k = reduced ? 1 : Math.min(1, delta * 3.2);
    current.current += (target - current.current) * k;
    const e = current.current;
    group.current.userData.e = e;
    const t = performance.now() * 0.001;
    group.current.children.forEach((child, idx) => {
      const item = sorted.list[idx];
      if (!item) return;
      const rel = (item.c - sorted.centroid) / sorted.half;
      const jitter = lost ? Math.sin(t * 0.8 + idx * 2.1) * 0.08 : 0;
      const off = rel * profile.spread * e + jitter;
      const base = item.box.p;
      child.position.set(
        base[0] + (axisIndex === 0 ? off : 0),
        base[1] + (axisIndex === 1 ? off : 0) + (lost ? Math.sin(t * 0.6 + idx) * 0.05 * e : 0),
        base[2] + (axisIndex === 2 ? off : 0)
      );
      child.rotation.set(
        (item.box.r?.[0] ?? 0) + e * 0.22 * (seed(item.i + 1) - 0.5),
        (item.box.r?.[1] ?? 0) + e * (profile.twist ?? 0.15) * (item.i % 2 === 0 ? 1 : -1),
        (item.box.r?.[2] ?? 0) + e * 0.18 * (seed(item.i + 7) - 0.5)
      );
    });
  });

  const labelsVisible = showLabels && (mode !== "ciudad");

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group ref={group}>
        {sorted.list.map(({ box, i }) => {
          const evidence = box.evidence ?? building.massing.defaultEvidence;
          if (evidence === "desconocido") return null;
          const color = boxColor(box, mode);
          const inferred = evidence === "inferido";
          const evocative = evidence === "evocativo";
          const transparent = isMemoria || mode === "ciudad" || inferred || evocative;
          const opacity = isMemoria ? 0.13 : evocative ? 0.18 : mode === "ciudad" ? 0.42 : inferred ? 0.72 : 1;
          return (
            <mesh key={i} position={box.p} rotation={box.r ?? [0, 0, 0]}>
              <boxGeometry args={box.s} />
              <meshStandardMaterial
                color={color}
                transparent={transparent}
                opacity={opacity}
                roughness={box.m === "vidrio" ? 0.2 : 0.85}
                metalness={box.m === "metal" ? 0.55 : 0.05}
                emissive={isMemoria ? TEAL_DEEP : "#000000"}
                emissiveIntensity={isMemoria ? 0.35 : 0}
              />
              <Edges threshold={20} color={inferred ? "#e3b23c" : edgeColor(mode, lost)} />
              {labelsVisible && box.label ? (
                <group position={[0, box.s[1] / 2 + 0.28, 0]}>
                  <LabelTagOpacity text={box.label} threshold={0.42} />
                </group>
              ) : null}
            </mesh>
          );
        })}
      </group>

      {/* contexto urbano */}
      {mode === "ciudad" && building.massing.context
        ? building.massing.context.map((box, i) => (
            <mesh key={`ctx-${i}`} position={box.p}>
              <boxGeometry args={box.s} />
              <meshStandardMaterial color="#8ea3b8" transparent opacity={0.12} roughness={1} />
              <Edges threshold={20} color="#3d5468" />
            </mesh>
          ))
        : null}

      {/* extras */}
      {building.massing.extras?.includes("rails") ? <Rails /> : null}
      {building.massing.extras?.includes("gardens") ? <Gardens /> : null}
      {building.massing.extras?.includes("plaza") ? <PlazaRing /> : null}
      {building.massing.extras?.includes("pointcloud") || lost ? (
        <PointVolume boxes={boxes} />
      ) : null}

      {/* planos de archivo */}
      {showArchive && isMemoria ? <ArchivePlanes building={building} /> : null}
    </group>
  );
}

/** label cuya opacidad depende del nivel de desensamblado (lee userData.e del grupo animado) */
function LabelTagOpacity({ text, threshold }: { text: string; threshold: number }) {
  const ref = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.SpriteMaterial>(null);
  useFrame(() => {
    if (!matRef.current) return;
    let n: THREE.Object3D | null | undefined = ref.current;
    let e = 0;
    while (n) {
      if (typeof n.userData.e === "number") {
        e = n.userData.e as number;
        break;
      }
      n = n.parent;
    }
    matRef.current.opacity = e > threshold ? Math.min(1, (e - threshold) * 3) : 0;
  });
  const tex = useMemo(() => makeLabelTexture(text), [text]);
  return (
    <group ref={ref}>
      <sprite scale={[1.6, 0.3, 1]}>
        <spriteMaterial ref={matRef} map={tex} transparent opacity={0} depthWrite={false} />
      </sprite>
    </group>
  );
}

/* ------------------------------------------------ nubes y partículas */
export function PointVolume({ boxes, color = TEAL }: { boxes: BoxSpec[]; color?: string }) {
  const ref = useRef<THREE.Points>(null);
  const reduced = useStore.getState().reducedMotion;

  const { positions, center } = useMemo(() => {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (const b of boxes) {
      minX = Math.min(minX, b.p[0] - b.s[0] / 2); maxX = Math.max(maxX, b.p[0] + b.s[0] / 2);
      minY = Math.min(minY, b.p[1] - b.s[1] / 2); maxY = Math.max(maxY, b.p[1] + b.s[1] / 2);
      minZ = Math.min(minZ, b.p[2] - b.s[2] / 2); maxZ = Math.max(maxZ, b.p[2] + b.s[2] / 2);
    }
    const size: [number, number, number] = [maxX - minX, maxY - minY, maxZ - minZ];
    const center: [number, number, number] = [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2];
    const count = window.innerWidth < 768 ? 600 : 1500;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = minX + seed(i * 3 + 17) * size[0];
      arr[i * 3 + 1] = minY + seed(i * 3 + 31) * size[1];
      arr[i * 3 + 2] = minZ + seed(i * 3 + 47) * size[2];
    }
    return { positions: arr, center };
  }, [boxes]);

  useFrame((state) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    ref.current.position.y = center[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.045}
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function Floaters({ count = 220, spread = 16, color = "#cfc6b2" }: { count?: number; spread?: number; color?: string }) {
  const ref = useRef<THREE.Points>(null);
  const reduced = useStore.getState().reducedMotion;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (seed(i * 3 + 61) - 0.5) * spread;
      arr[i * 3 + 1] = seed(i * 3 + 73) * 7;
      arr[i * 3 + 2] = (seed(i * 3 + 89) - 0.5) * spread;
    }
    return arr;
  }, [count, spread]);

  useFrame((state) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.012;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.03} transparent opacity={0.5} depthWrite={false} />
    </points>
  );
}

/* ------------------------------------------------ entorno */
export function RiverLine({ visible = true, position = [0, 0, 0] as [number, number, number] }) {
  const flowRef = useRef<THREE.Points>(null);
  const reduced = useStore.getState().reducedMotion;

  const { curve, flow } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-9, 0.03, 5.5),
      new THREE.Vector3(-4.5, 0.03, 3.6),
      new THREE.Vector3(-0.5, 0.03, 3.0),
      new THREE.Vector3(3.5, 0.03, 3.4),
      new THREE.Vector3(8, 0.03, 4.6),
    ]);
    const n = 60;
    const arr = new Float32Array(n * 3);
    return { curve, flow: arr };
  }, []);

  useFrame((state) => {
    if (!flowRef.current || reduced || !visible) return;
    const t = state.clock.elapsedTime;
    const pos = flowRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < 60; i++) {
      const u = (i / 60 + t * 0.02) % 1;
      const p = curve.getPointAt(u);
      pos.setXYZ(i, p.x, p.y + 0.05, p.z);
    }
    pos.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <group position={position}>
      <mesh>
        <tubeGeometry args={[curve, 72, 0.16, 10, false]} />
        <meshStandardMaterial
          color="#16333a"
          emissive={TEAL_DEEP}
          emissiveIntensity={0.55}
          roughness={0.35}
          transparent
          opacity={0.92}
        />
      </mesh>
      <points ref={flowRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[flow, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#7fd6dc" size={0.05} transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

export function Rails() {
  const ties = useMemo(() => Array.from({ length: 14 }, (_, i) => -3.4 + i * 0.5), []);
  return (
    <group position={[0, 0.02, 2.2]}>
      <mesh position={[0, 0.02, -0.16]}>
        <boxGeometry args={[7.4, 0.05, 0.06]} />
        <meshStandardMaterial color="#667584" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.02, 0.16]}>
        <boxGeometry args={[7.4, 0.05, 0.06]} />
        <meshStandardMaterial color="#667584" metalness={0.7} roughness={0.4} />
      </mesh>
      {ties.map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <boxGeometry args={[0.12, 0.04, 0.62]} />
          <meshStandardMaterial color="#4a3a28" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

export function Gardens() {
  const pts = useMemo(() => {
    const arr = new Float32Array(140 * 3);
    for (let i = 0; i < 140; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      arr[i * 3] = side * (2.9 + seed(i * 3 + 101) * 1.8);
      arr[i * 3 + 1] = 0.05 + seed(i * 3 + 113) * 0.5;
      arr[i * 3 + 2] = (seed(i * 3 + 127) - 0.3) * 3.6;
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pts, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#5f7350" size={0.07} transparent opacity={0.85} depthWrite={false} />
    </points>
  );
}

export function PlazaRing() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
      <ringGeometry args={[3.1, 3.16, 72]} />
      <meshBasicMaterial color={TEAL_DEEP} transparent opacity={0.5} />
    </mesh>
  );
}

export function StageFloor() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[34, 48]} />
        <meshStandardMaterial color="#0d1219" roughness={1} />
      </mesh>
      <Grid
        position={[0, 0.001, 0]}
        args={[40, 40]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1b2836"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#23384a"
        fadeDistance={26}
        fadeStrength={1.4}
        infiniteGrid
      />
    </>
  );
}

export function StageLights({ mood = "normal" }: { mood?: "normal" | "dark" | "golden" }) {
  return (
    <>
      <ambientLight intensity={mood === "dark" ? 0.25 : 0.5} color="#cfe3ea" />
      <directionalLight
        position={[5, 9, 4]}
        intensity={mood === "dark" ? 0.5 : 1.15}
        color={mood === "golden" ? "#ffd9a0" : "#ffedd0"}
      />
      <pointLight position={[-6, 3.5, -5]} intensity={mood === "dark" ? 0.25 : 0.6} color={TEAL} distance={20} />
      <pointLight position={[4, 1.5, 6]} intensity={0.35} color="#c1572f" distance={16} />
    </>
  );
}

/* ------------------------------------------------ planos de archivo */
export function ArchivePlanes({ building }: { building: Building }) {
  const tex = useMemo(() => getBlueprintTexture(building), [building]);
  const g1 = useRef<THREE.Group>(null);
  const g2 = useRef<THREE.Group>(null);
  const reduced = useStore.getState().reducedMotion;

  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    if (g1.current) g1.current.position.y = 1.7 + Math.sin(t * 0.7) * 0.08;
    if (g2.current) g2.current.position.y = 1.15 + Math.sin(t * 0.7 + 2) * 0.08;
  });

  return (
    <group>
      <group ref={g1} position={[-3.1, 1.7, -0.6]} rotation={[0, 0.42, 0]}>
        <mesh>
          <planeGeometry args={[2.1, 2.66]} />
          <meshBasicMaterial map={tex} transparent opacity={0.92} side={THREE.DoubleSide} />
        </mesh>
        <LabelTag text="PLANO INTERPRETATIVO" position={[0, -1.55, 0.01]} opacity={0.9} />
      </group>
      <group ref={g2} position={[3.1, 1.15, -0.2]} rotation={[0, -0.38, 0]}>
        <mesh>
          <planeGeometry args={[1.7, 2.15]} />
          <meshBasicMaterial map={tex} transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
        <LabelTag text="PROTOTIPO · NO ES ARCHIVO" position={[0, -1.28, 0.01]} opacity={0.85} />
      </group>
    </group>
  );
}

/* ------------------------------------------------ líneas verticales déco */
export function DecoLines({ count = 14 }: { count?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: -7 + (i / (count - 1)) * 14,
        h: 2.5 + seed(i) * 5,
        z: -5 - seed(i + 40) * 3,
      })),
    [count]
  );
  return (
    <group>
      {items.map((it, i) => (
        <mesh key={i} position={[it.x, it.h / 2, it.z]}>
          <boxGeometry args={[0.035, it.h, 0.035]} />
          <meshBasicMaterial color="#e3b23c" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}
