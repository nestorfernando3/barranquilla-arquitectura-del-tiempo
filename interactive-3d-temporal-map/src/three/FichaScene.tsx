import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import type { Building } from "../data/buildings";
import { useStore } from "../store";
import {
  FragmentModel,
  Floaters,
  StageFloor,
  StageLights,
  type LayerMode,
} from "./FragmentModel";
import HeritageModel from "./HeritageModel";

export default function FichaScene({
  building,
  mode,
  explode,
  autoRotate,
}: {
  building: Building;
  mode: LayerMode;
  explode: number;
  autoRotate: boolean;
}) {
  const reduced = useStore((s) => s.reducedMotion);
  const procedural = (
    <FragmentModel
      building={building}
      explode={explode}
      mode={mode}
      showArchive={mode === "memoria"}
    />
  );

  return (
    <>
      <StageLights mood={mode === "memoria" ? "dark" : "normal"} />
      <StageFloor />
      <Floaters count={120} spread={16} />
      {mode === "forma" && building.model3d ? (
        <Suspense fallback={procedural}>
          <HeritageModel asset={building.model3d} fallback={procedural} />
        </Suspense>
      ) : procedural}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan={false}
        minDistance={4.2}
        maxDistance={16}
        maxPolarAngle={1.48}
        autoRotate={autoRotate && !reduced}
        autoRotateSpeed={0.55}
        target={[0, 1.2, 0]}
      />
    </>
  );
}
