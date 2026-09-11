import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Canvas3D from "../three/Canvas3D";
import ChapterScene from "../three/ChapterScene";
import { CHAPTERS, PROLOGUE } from "../data/chapters";
import { BUILDING_BY_SLUG } from "../data/buildings";
import { useStore } from "../store";
import { audio } from "../lib/audio";

gsap.registerPlugin(ScrollTrigger);

const vh = 285; // alto por capítulo
const TOTAL = CHAPTERS.length;

const smooth = (t: number, a: number, b: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

function ChapterPanels() {
  const p = useStore((s) => Math.round(s.tourProgress * 240) / 240);
  const go = useStore((s) => s.go);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0] + "#/recorrido");
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      {CHAPTERS.map((ch, i) => {
        const local = p - i;
        if (local < -0.05 || local > 1.05) return null;
        const op = smooth(local, 0.06, 0.24) * (1 - smooth(local, 0.8, 0.96));
        if (op < 0.02) return null;
        const shift = (0.5 - local) * 26;
        const building = ch.buildingSlug ? BUILDING_BY_SLUG[ch.buildingSlug] : undefined;
        const isEpilogue = ch.id === "epilogo";

        return (
          <section
            key={ch.id}
            aria-label={`Capítulo ${ch.num}: ${ch.title}`}
            className={`pointer-events-none absolute inset-x-4 bottom-6 z-10 md:inset-x-auto md:bottom-auto md:left-12 md:top-1/2 md:w-[min(40vw,460px)] md:-translate-y-1/2 ${
              isEpilogue ? "md:left-1/2 md:w-[min(88vw,620px)] md:-translate-x-1/2 md:text-center" : ""
            }`}
            style={{ opacity: op, transform: `translateY(${shift}px)` }}
          >
            <div
              className={`pointer-events-auto max-h-[44vh] overflow-y-auto border border-line bg-carbon/82 p-5 backdrop-blur-sm md:max-h-[76vh] md:p-8 ${
                isEpilogue ? "text-center" : ""
              }`}
            >
              <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-river">
                <span className="inline-block h-px w-8 bg-rust" aria-hidden="true" />
                {isEpilogue ? "Epílogo" : `Capítulo ${ch.num}`} · {ch.yearLabel}
              </p>
              <h2 className="mt-3 font-display text-3xl font-light italic leading-[1.04] text-paper md:text-[2.6rem]">
                {ch.title}
              </h2>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-ember">
                {ch.subtitle}
              </p>
              <div className={`mt-4 space-y-3 text-[13.5px] leading-relaxed text-stone md:text-sm ${isEpilogue ? "mx-auto max-w-lg" : ""}`}>
                {ch.paragraphs.map((par, j) => (
                  <p key={j}>{par}</p>
                ))}
              </div>

              {!isEpilogue && (
                <dl className="mt-5 space-y-1.5 border-t border-line pt-4">
                  {ch.dataLines.map((d) => (
                    <div key={d.k} className="flex gap-3 font-mono text-[10.5px] uppercase tracking-wider">
                      <dt className="w-20 shrink-0 text-dim">{d.k}</dt>
                      <dd className="text-faded">{d.v}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {isEpilogue ? (
                <>
                  <p className="mx-auto mt-6 max-w-lg font-display text-xl italic leading-snug text-solar md:text-2xl">
                    {ch.dataLines[0]?.v}
                  </p>
                  <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => go("mapa")}
                      className="btn-ghost border border-rust bg-rust px-5 py-3 font-mono text-[10.5px] uppercase tracking-[0.2em] text-paper hover:bg-ember"
                    >
                      Explorar el mapa
                    </button>
                    <button
                      onClick={share}
                      className="btn-ghost border border-line2 px-5 py-3 font-mono text-[10.5px] uppercase tracking-[0.2em] text-paper hover:border-solar hover:text-solar"
                    >
                      {copied ? "Ruta copiada ✓" : "Compartir ruta"}
                    </button>
                    <button
                      onClick={() => go("fuentes")}
                      className="btn-ghost border border-line px-5 py-3 font-mono text-[10.5px] uppercase tracking-[0.2em] text-faded hover:border-river hover:text-river"
                    >
                      Fuentes y créditos
                    </button>
                  </div>
                  <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-dim">
                    “{PROLOGUE.quote}”
                  </p>
                </>
              ) : (
                building && (
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => go("edificio", building.slug)}
                      className="btn-ghost border border-river bg-riverdeep/25 px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-river hover:bg-riverdeep/45"
                    >
                      Abrir ficha · {building.name} ⤢
                    </button>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-dim">
                      {ch.buildingNote}
                    </span>
                  </div>
                )
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}

function ChapterRail() {
  const p = useStore((s) => Math.round(s.tourProgress * 24) / 24);
  const reduced = useStore((s) => s.reducedMotion);
  const active = Math.min(TOTAL - 1, Math.max(0, Math.floor(p)));

  const jump = (i: number) => {
    const el = document.getElementById("tour-container");
    if (!el) return;
    const target = el.offsetTop + (i / TOTAL) * (el.offsetHeight - window.innerHeight);
    window.scrollTo({ top: target, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <nav
      className="absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
      aria-label="Capítulos del recorrido"
    >
      {CHAPTERS.map((ch, i) => (
        <button
          key={ch.id}
          onClick={() => jump(i)}
          className="btn-ghost group flex items-center gap-3"
          aria-current={active === i ? "step" : undefined}
          aria-label={`Ir al capítulo ${ch.num}: ${ch.title}`}
        >
          <span
            className={`font-mono text-[9px] uppercase tracking-[0.2em] transition-opacity ${
              active === i ? "text-solar opacity-100" : "text-faded opacity-0 group-hover:opacity-100"
            }`}
          >
            {ch.num} · {ch.title}
          </span>
          <span
            className={`block rotate-45 border transition-all ${
              active === i ? "h-3 w-3 border-solar bg-solar" : "h-2 w-2 border-line2 bg-transparent group-hover:border-faded"
            }`}
          />
        </button>
      ))}
    </nav>
  );
}

export default function GuidedTour() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useStore((s) => s.reducedMotion);
  const p = useStore((s) => Math.round(s.tourProgress * 240) / 240);
  const active = Math.min(TOTAL - 1, Math.max(0, Math.floor(p)));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: reduced ? true : 0.55,
      onUpdate: (self) => {
        useStore.getState().setTourProgress(self.progress * TOTAL);
      },
    });
    return () => st.kill();
  }, [reduced]);

  useEffect(() => {
    audio.setScene(CHAPTERS[active].soundScene);
  }, [active]);

  return (
    <div ref={containerRef} id="tour-container" className="relative" style={{ height: `${vh * TOTAL}vh` }}>
      {/* barra de progreso */}
      <div className="fixed left-0 top-14 z-30 h-[2px] w-full bg-line/50" aria-hidden="true">
        <div
          className="h-full bg-rust"
          style={{ width: `${Math.min(100, (p / TOTAL) * 100)}%` }}
        />
      </div>

      <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-hidden">
        <div className="absolute inset-0 topo-bg" aria-hidden="true" />
        <div className="absolute inset-0">
          <Canvas3D camera={{ position: [-5.6, 1.7, 7.9], fov: 42 }}>
            <ChapterScene />
          </Canvas3D>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-carbon/70 via-transparent to-carbon/40" aria-hidden="true" />

        <ChapterPanels />
        <ChapterRail />

        {/* HUD inferior */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-line/60 bg-carbon/70 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.26em] text-dim md:px-8">
          <span>
            {String(active + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")} —{" "}
            {CHAPTERS[active].title}
          </span>
          <span className="hidden md:inline">Desliza para atravesar el tiempo · la cámara tiene peso</span>
          <span className="text-river">10°59′N · 74°48′W</span>
        </div>
      </div>
    </div>
  );
}
