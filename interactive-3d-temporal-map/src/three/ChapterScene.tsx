import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { CHAPTERS } from "../data/chapters";
import { BUILDING_BY_ID } from "../data/buildings";
import { useStore } from "../store";
import {
  FragmentModel,
  Floaters,
  RiverLine,
  StageFloor,
  StageLights,
  DecoLines,
} from "./FragmentModel";

type Vec3 = [number, number, number];

const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/** cámara por capítulo: from / to / punto de mirada */
const CAMS: { from: Vec3; to: Vec3; look: Vec3 }[] = [
  { from: [-5.6, 1.7, 7.9], to: [3.2, 2.6, 6.7], look: [0, 1.2, 0] },
  { from: [4.9, 1.5, 6.7], to: [-3.7, 2.2, 7.3], look: [0, 0.8, 0.6] },
  { from: [0.4, 5.9, 8.9], to: [4.7, 2.3, 6.6], look: [0, 0.9, 0.2] },
  { from: [-3.5, 1.2, 7.3], to: [3.4, 3.4, 7.7], look: [-0.3, 1.7, 0] },
  { from: [0, 6.3, 10.6], to: [0.6, 2.5, 7.5], look: [0, 1.1, 0] },
  { from: [0.6, 1.7, 6.7], to: [-2.7, 2.8, 7.5], look: [0, 1.2, 0] },
  { from: [0, 3.6, 10.2], to: [0, 6.6, 13.6], look: [0, 1, 0] },
];

const smooth01 = (t: number, a: number, b: number) =>
  easeInOut(THREE.MathUtils.clamp((t - a) / (b - a), 0, 1));

export default function ChapterScene() {
  // cuantizar para re-render limitado; el damping interno suaviza
  const p = useStore((s) => Math.round(s.tourProgress * 300) / 300);
  const reduced = useStore((s) => s.reducedMotion);
  const lookRef = useRef(new THREE.Vector3(0, 1.2, 0));
  const total = CHAPTERS.length;

  useFrame((state, delta) => {
    const i = Math.min(total - 1, Math.max(0, Math.floor(p)));
    const t = THREE.MathUtils.clamp(p - i, 0, 1);
    const cam = CAMS[i];
    const k = reduced ? 1 : Math.min(1, delta * 2.4);
    const ex = THREE.MathUtils.lerp(cam.from[0], cam.to[0], easeInOut(t));
    const ey = THREE.MathUtils.lerp(cam.from[1], cam.to[1], easeInOut(t));
    const ez = THREE.MathUtils.lerp(cam.from[2], cam.to[2], easeInOut(t));
    state.camera.position.x += (ex - state.camera.position.x) * k;
    state.camera.position.y += (ey - state.camera.position.y) * k;
    state.camera.position.z += (ez - state.camera.position.z) * k;
    lookRef.current.x += (cam.look[0] - lookRef.current.x) * k;
    lookRef.current.y += (cam.look[1] - lookRef.current.y) * k;
    lookRef.current.z += (cam.look[2] - lookRef.current.z) * k;
    state.camera.lookAt(lookRef.current);
  });

  const ch = Math.min(total - 1, Math.floor(p));
  const t = THREE.MathUtils.clamp(p - ch, 0, 1);

  const byId = (id: string) => BUILDING_BY_ID[id];
  const visible = (i: number) => Math.abs(p - (i + 0.5)) < 1.15;

  const aduana = byId("aduana");
  const montoya = byId("montoya");
  const prado = byId("prado");
  const garcia = byId("garcia");
  const bellas = byId("bellas-artes");
  const caja = byId("caja-agraria");
  const rex = byId("cine-rex");

  return (
    <>
      <StageLights mood={ch === 5 ? "dark" : ch === 6 ? "golden" : "normal"} />
      <StageFloor />
      <Floaters count={200} spread={20} color={ch === 6 ? "#e3b23c" : "#cfc6b2"} />
      <RiverLine position={[0, 0, 3.4]} visible={ch === 0 || ch === 6} />

      {/* 01 — Aduana: estratos que se asientan */}
      <group visible={visible(0)}>
        <FragmentModel
          building={aduana}
          explode={1 - smooth01(t, 0.12, 0.68)}
          mode="forma"
        />
      </group>

      {/* 02 — Montoya: corte ferroviario */}
      <group visible={visible(1)}>
        <FragmentModel
          building={montoya}
          explode={1 - smooth01(t, 0.08, 0.62)}
          mode="material"
        />
      </group>

      {/* 03 — El Prado: alas alrededor del vacío */}
      <group visible={visible(2)}>
        <FragmentModel
          building={prado}
          explode={0.95 - 0.9 * smooth01(t, 0.14, 0.72)}
          mode="material"
        />
      </group>

      {/* 04 — García: apilamiento vertical + líneas déco */}
      <group visible={visible(3)}>
        <DecoLines />
        <FragmentModel
          building={garcia}
          explode={1 - smooth01(t, 0.1, 0.6)}
          mode="forma"
        />
      </group>

      {/* 05 — modernismo: dos volúmenes institucionales */}
      <group visible={visible(4)}>
        <FragmentModel
          building={bellas}
          explode={0.9 - 0.9 * smooth01(t, 0.08, 0.6)}
          mode="material"
          position={[-2.7, 0, 0]}
          scale={0.95}
        />
        <FragmentModel
          building={caja}
          explode={0.9 - 0.9 * smooth01(t, 0.16, 0.7)}
          mode="material"
          position={[2.7, 0, 0]}
          scale={0.95}
        />
      </group>

      {/* 06 — supervivencia: el volumen se abre sin fingir demolición */}
      <group visible={visible(5)}>
        <FragmentModel
          building={rex}
          explode={0.75 - 0.6 * smooth01(t, 0.15, 0.78)}
          mode="forma"
        />
      </group>

      {/* 07 — epílogo: la ciudad reensamblada */}
      <group visible={visible(6)}>
        <FragmentModel
          building={aduana}
          explode={1 - smooth01(t, 0, 0.4)}
          mode="forma"
          position={[-4.4, 0, 0.4]}
          scale={0.62}
        />
        <FragmentModel
          building={garcia}
          explode={1 - smooth01(t, 0.05, 0.45)}
          mode="forma"
          position={[0, 0, -0.6]}
          scale={0.62}
        />
        <FragmentModel
          building={prado}
          explode={1 - smooth01(t, 0.1, 0.5)}
          mode="forma"
          position={[4.4, 0, 0.4]}
          scale={0.62}
        />
      </group>
    </>
  );
}
