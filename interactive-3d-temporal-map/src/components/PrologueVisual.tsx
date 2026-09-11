import type { MutableRefObject } from "react";
import Canvas3D from "../three/Canvas3D";
import PrologueScene from "../three/PrologueScene";

export default function PrologueVisual({ playhead }: { playhead: MutableRefObject<number> }) {
  return (
    <Canvas3D camera={{ position: [0, 3.5, 13.6], fov: 40 }}>
      <PrologueScene playhead={playhead} />
    </Canvas3D>
  );
}
