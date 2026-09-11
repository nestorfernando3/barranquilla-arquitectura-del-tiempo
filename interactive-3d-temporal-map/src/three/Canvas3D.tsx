import { useEffect, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "../store";

export function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function SceneFallback({ note }: { note?: string }) {
  return (
    <div className="relative flex h-full w-full items-end justify-center overflow-hidden bg-ink">
      <svg viewBox="0 0 800 300" className="absolute inset-0 h-full w-full opacity-50" aria-hidden="true">
        <g stroke="#2b6e74" fill="none" strokeWidth="1.5">
          <path d="M0 260 Q 160 236 320 252 T 800 244" />
          <path d="M0 272 Q 160 248 320 264 T 800 256" opacity="0.5" />
        </g>
        <g stroke="#e9e2d0" strokeOpacity="0.55" fill="none">
          <rect x="120" y="180" width="70" height="70" />
          <rect x="210" y="150" width="50" height="100" />
          <rect x="285" y="195" width="90" height="55" />
          <rect x="400" y="130" width="42" height="120" />
          <rect x="460" y="160" width="70" height="90" />
          <rect x="560" y="175" width="55" height="75" />
          <path d="M400 130 L421 108 L442 130" />
        </g>
        <g fill="#4fa3a8" opacity="0.8">
          <circle cx="155" cy="170" r="3" />
          <circle cx="421" cy="120" r="3" />
          <circle cx="588" cy="165" r="3" />
        </g>
      </svg>
      <div className="relative z-10 m-6 max-w-md border border-line bg-carbon/85 p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-river">Modo sin WebGL</p>
        <p className="mt-2 text-sm leading-relaxed text-faded">
          Tu navegador no permite renderizar la escena 3D. La narrativa completa —textos, datos,
          mapa y fuentes— sigue disponible en esta experiencia.
        </p>
        {note ? <p className="mt-2 text-xs text-dim">{note}</p> : null}
      </div>
    </div>
  );
}

export default function Canvas3D({
  children,
  camera,
  className,
  fallbackNote,
}: {
  children: ReactNode;
  camera?: { position: [number, number, number]; fov?: number };
  className?: string;
  fallbackNote?: string;
}) {
  const [ok, setOk] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(() => !document.hidden);
  const [compact, setCompact] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  const reducedMotion = useStore((state) => state.reducedMotion);

  useEffect(() => {
    setOk(hasWebGL());
    const media = window.matchMedia("(max-width: 767px)");
    const onVisibility = () => setVisible(!document.hidden);
    const onMedia = () => setCompact(media.matches);
    document.addEventListener("visibilitychange", onVisibility);
    media.addEventListener("change", onMedia);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      media.removeEventListener("change", onMedia);
    };
  }, []);

  if (ok === null) {
    return <div className={`bg-carbon ${className ?? ""}`} aria-hidden="true" />;
  }

  if (!ok) return <SceneFallback note={fallbackNote} />;

  return (
    <Canvas
      className={className}
      dpr={compact ? [1, 1.25] : [1, 1.5]}
      frameloop={!visible ? "never" : reducedMotion ? "demand" : "always"}
      camera={{ position: camera?.position ?? [0, 2.6, 9], fov: camera?.fov ?? 42 }}
      gl={{ antialias: !compact, alpha: true, powerPreference: "high-performance" }}
      onCreated={(state) => {
        state.gl.setClearColor(0x000000, 0);
        state.scene.fog = new THREE.Fog(0x0b0f14, 13, 38);
      }}
    >
      {children}
    </Canvas>
  );
}
