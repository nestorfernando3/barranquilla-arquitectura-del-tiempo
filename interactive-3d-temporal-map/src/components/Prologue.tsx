import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import { PROLOGUE } from "../data/chapters";
import { audio } from "../lib/audio";

const PrologueVisual = lazy(() => import("./PrologueVisual"));

function AssembleTitle({ text, className, baseDelay = 0 }: { text: string; className?: string; baseDelay?: number }) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((ch, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="char"
          style={{
            ["--d" as string]: `${baseDelay + i * 42}ms`,
            ["--dx" as string]: `${(Math.sin(i * 3.7) * 30).toFixed(0)}px`,
            ["--dy" as string]: `${(20 + Math.cos(i * 2.3) * 26).toFixed(0)}px`,
            ["--rz" as string]: `${(Math.sin(i * 5.1) * 14).toFixed(0)}deg`,
          }}
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}

export default function Prologue() {
  const playhead = useRef(0);
  const [phase, setPhase] = useState(0);
  const [visualReady, setVisualReady] = useState(false);
  const go = useStore((s) => s.go);
  const skip = useStore((s) => s.skipPrologue);
  const reduced = useStore((s) => s.reducedMotion);
  const soundOn = useStore((s) => s.soundOn);
  const toggleSound = useStore((s) => s.toggleSound);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const DURATION = 8200;
    const instant = reduced;
    if (instant) {
      playhead.current = 1;
      setPhase(4);
    } else {
      const loop = (now: number) => {
        const t = Math.min(1, (now - start) / DURATION);
        playhead.current = t;
        const ph = t >= 0.9 ? 4 : t >= 0.68 ? 3 : t >= 0.42 ? 2 : t >= 0.06 ? 1 : 0;
        setPhase((prev) => (prev !== ph ? ph : prev));
        if (t < 1) raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    audio.setScene("prologo");
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisualReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const skipAll = () => {
    playhead.current = 1;
    setPhase(4);
    skip();
  };

  return (
    <section className="relative h-[calc(100dvh-3.5rem)] overflow-hidden" aria-label="Prólogo">
      <div className="absolute inset-0 topo-bg" aria-hidden="true" />
      <div className="absolute inset-0">
        {visualReady ? (
          <Suspense fallback={null}>
            <PrologueVisual playhead={playhead} />
          </Suspense>
        ) : null}
      </div>

      {/* gradiente de legibilidad */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-carbon/60" aria-hidden="true" />

      {/* coordenadas — máquina de escribir */}
      <div className={`absolute left-4 top-6 hidden transition-opacity duration-700 sm:block md:left-8 ${phase >= 1 ? "opacity-100" : "opacity-0"}`}>
        <p className="font-mono text-[11px] tracking-[0.24em] text-river">
          {PROLOGUE.coords}
          <span className="blink text-paper">▊</span>
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-faded">
          {PROLOGUE.place}
        </p>
      </div>

      {/* omitir */}
      <button
        onClick={skipAll}
        className="btn-ghost absolute right-4 top-6 border border-line bg-carbon/60 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-faded hover:border-rust hover:text-paper md:right-8"
      >
        Omitir introducción ▸
      </button>

      {/* título */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[39%] flex flex-col items-center px-5 text-center sm:bottom-[30%]">
        {phase >= 2 && (
          <h1 className="leading-none">
            <AssembleTitle text="BARRANQUILLA" className="block font-mono text-[13px] font-medium tracking-[0.52em] text-river md:text-base" />
            <span className="mt-3 block md:hidden">
              <AssembleTitle
                text="Arquitectura"
                className="block font-display text-[12vw] font-light italic leading-[0.92] text-paper"
                baseDelay={300}
              />
              <AssembleTitle
                text="del Tiempo"
                className="mt-1 block font-display text-[12vw] font-light italic leading-[0.92] text-paper"
                baseDelay={520}
              />
            </span>
            <span className="mt-3 hidden md:block">
              <AssembleTitle
                text="Arquitectura del Tiempo"
                className="font-display text-7xl font-light italic leading-[0.98] text-paper lg:text-8xl"
                baseDelay={300}
              />
            </span>
          </h1>
        )}
        {phase >= 3 && (
          <blockquote className="rise-in mt-4 max-w-xs font-display text-sm font-light italic leading-relaxed text-stone sm:mt-6 sm:max-w-xl sm:text-base md:text-lg" style={{ ["--d" as string]: "200ms" }}>
            “{PROLOGUE.quote}”
          </blockquote>
        )}
      </div>

      {/* acciones */}
      <div
        className={`absolute inset-x-0 bottom-4 flex flex-col items-center gap-2 px-4 transition-all duration-700 sm:bottom-8 sm:gap-4 md:bottom-10 ${
          phase >= 4 ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <button
            onClick={() => go("recorrido")}
            className="btn-ghost min-h-11 border border-rust bg-rust px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-paper hover:bg-ember sm:px-6 sm:text-[11px] sm:tracking-[0.2em]"
          >
            Iniciar recorrido ↓
          </button>
          <button
            onClick={() => go("mapa")}
            className="btn-ghost min-h-11 border border-line2 bg-carbon/60 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-paper hover:border-river hover:text-river sm:px-6 sm:text-[11px] sm:tracking-[0.2em]"
          >
            Explorar el mapa
          </button>
          <button
            onClick={toggleSound}
            aria-pressed={soundOn}
            className="btn-ghost hidden min-h-11 items-center gap-2 border border-line bg-transparent px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-faded hover:border-solar hover:text-solar sm:flex"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            </svg>
            {soundOn ? "Sonido activo" : "Activar sonido"}
          </button>
        </div>
        <p className="max-w-md text-center text-xs leading-relaxed text-dim">
          Documental interactivo · el mapa representa el espacio, la fragmentación representa el tiempo.
        </p>
      </div>

      {/* zócalo inferior */}
      <div className="absolute inset-x-0 bottom-0 hidden items-center justify-between border-t border-line/60 bg-carbon/70 px-8 py-2 md:flex" aria-hidden="true">
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-dim">
          Atlas cinematográfico · Centro Histórico — El Prado — Río Magdalena
        </p>
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-dim">
          Prototipo v2 · evidencia visible ◍
        </p>
      </div>
    </section>
  );
}
