import { Component, useMemo, type ErrorInfo, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Model3DAsset } from "../data/buildings";
import { resolveModelUrl } from "../lib/modelUrl";

class ModelBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("No fue posible cargar el modelo patrimonial; se usa la volumetría procedural.", error, info);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function LoadedHeritageModel({ asset }: { asset: Model3DAsset }) {
  const gltf = useGLTF(resolveModelUrl(asset.url));

  const normalized = useMemo(() => {
    const scene = gltf.scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(scene);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const longest = Math.max(size.x, size.y, size.z) || 1;
    const scale = (asset.targetSize ?? 4.8) / longest;

    scene.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      node.castShadow = false;
      node.receiveShadow = false;
      const tune = (material: THREE.Material): THREE.Material => {
        const next = material.clone();
        if (next instanceof THREE.MeshStandardMaterial) {
          next.color.lerp(new THREE.Color("#d8d0bd"), 0.42);
          next.roughness = 0.88;
          next.metalness = 0.04;
        }
        return next;
      };
      // Preserve cardinality: a single material must stay single. Wrapping it in an
      // array makes three.js pair materials with geometry.groups — and GLB geometries
      // from single-material primitives have no groups, so nothing renders.
      node.material = Array.isArray(node.material) ? node.material.map(tune) : tune(node.material);
    });

    return {
      scene,
      scale,
      offset: [-center.x, -bounds.min.y, -center.z] as [number, number, number],
    };
  }, [asset.targetSize, gltf.scene]);

  return (
    <group scale={normalized.scale} rotation={asset.rotation ?? [0, 0, 0]}>
      <primitive object={normalized.scene} position={normalized.offset} />
    </group>
  );
}

export default function HeritageModel({
  asset,
  fallback,
}: {
  asset: Model3DAsset;
  fallback: ReactNode;
}) {
  return (
    <ModelBoundary fallback={fallback}>
      <LoadedHeritageModel asset={asset} />
    </ModelBoundary>
  );
}
