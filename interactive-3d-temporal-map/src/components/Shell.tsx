import type { ReactNode } from "react";
import { useStore, type View } from "../store";
import { CHAPTERS } from "../data/chapters";
import { BUILDING_BY_SLUG, ERAS } from "../data/buildings";

const NAV: { view: View; label: string }[] = [
  { view: "recorrido", label: "Recorrido" },
  { view: "mapa", label: "Mapa" },
  { view: "fuentes", label: "Fuentes" },
];

function SoundControl() {
  const soundOn = useStore((s) => s.soundOn);
  const volume = useStore((s) => s.volume);
  const toggle = useStore((s) => s.toggleSound);
  const setVolume = useStore((s) => s.setVolume);

  return (
    <div className="group relative hidden sm:block">
      <button
        onClick={toggle}
        aria-pressed={soundOn}
        aria-label={soundOn ? "Desactivar sonido ambiental" : "Activar sonido ambiental"}
        className="btn-ghost flex h-10 min-w-11 items-center gap-2 border border-line bg-panel/70 px-2.5 text-paper hover:border-river"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
          {soundOn ? (
            <>
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              <path d="M18 6a8.5 8.5 0 0 1 0 12" />
            </>
          ) : (
            <path d="m16 9 5 6m0-6-5 6" />
          )}
        </svg>
        {soundOn && (
          <span className="flex h-4 items-end gap-[2px]" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="eq-bar w-[3px] bg-river"
                style={{ height: `${8 + i * 3}px`, ["--d" as string]: `${i * 0.18}s` }}
              />
            ))}
          </span>
        )}
      </button>
      {soundOn && (
        <div className="absolute right-0 top-12 z-50 hidden w-48 border border-line bg-panel p-3 group-focus-within:block group-hover:block">
          <label htmlFor="vol" className="font-mono text-[10px] uppercase tracking-[0.2em] text-faded">
            Volumen
          </label>
          <input
            id="vol"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="slider mt-2 w-full"
            aria-label="Volumen del paisaje sonoro"
          />
        </div>
      )}
    </div>
  );
}

export function EraReadout() {
  const view = useStore((s) => s.view);
  const p = useStore((s) => s.tourProgress);
  const year = useStore((s) => s.timelineYear);
  const slug = useStore((s) => s.buildingSlug);

  let text = "ATLAS · BQ";
  let sub = "10°59′N · 74°48′W";
  if (view === "recorrido") {
    const i = Math.min(CHAPTERS.length - 1, Math.max(0, Math.floor(p)));
    text = CHAPTERS[i].yearLabel;
    sub = `CAP. ${CHAPTERS[i].num}`;
  } else if (view === "mapa") {
    text = `LÍNEA ${year}`;
    sub = "EXPLORACIÓN LIBRE";
  } else if (view === "edificio" && slug) {
    const b = BUILDING_BY_SLUG[slug];
    if (b) {
      text = b.year ?? "S/F";
      sub = ERAS[b.era].label.toUpperCase();
    }
  } else if (view === "fuentes") {
    text = "METODOLOGÍA";
    sub = "FUENTES Y CRÉDITOS";
  }

  return (
    <div className="hidden items-center gap-3 border-l border-line pl-4 md:flex" aria-hidden="true">
      <div className="text-right">
        <p className="font-mono text-sm font-medium leading-none text-solar">{text}</p>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-dim">{sub}</p>
      </div>
      <span className="h-1.5 w-1.5 rotate-45 bg-rust" />
    </div>
  );
}

export default function Shell({ children }: { children: ReactNode }) {
  const view = useStore((s) => s.view);
  const go = useStore((s) => s.go);
  const reducedMotion = useStore((s) => s.reducedMotion);
  const soundOn = useStore((s) => s.soundOn);
  const slug = useStore((s) => s.buildingSlug);
  const tourProgress = useStore((s) => s.tourProgress);
  const timelineYear = useStore((s) => s.timelineYear);

  let currentEra = "fluvial";
  if (view === "edificio" && slug) {
    const b = BUILDING_BY_SLUG[slug];
    if (b) currentEra = b.era;
  } else if (view === "recorrido") {
    const i = Math.min(CHAPTERS.length - 1, Math.max(0, Math.floor(tourProgress)));
    const chapterSlug = CHAPTERS[i]?.buildingSlug;
    const b = chapterSlug ? BUILDING_BY_SLUG[chapterSlug] : undefined;
    if (b) currentEra = b.era;
  } else if (view === "mapa") {
    if (timelineYear < 1903) currentEra = "fluvial";
    else if (timelineYear < 1930) currentEra = "republica";
    else if (timelineYear < 1950) currentEra = "deco";
    else if (timelineYear < 1985) currentEra = "moderna";
    else currentEra = "memoria";
  }

  return (
    <div
      data-era={currentEra}
      data-sound={soundOn}
      className="grain min-h-screen bg-carbon text-paper transition-colors duration-700"
    >
      {!reducedMotion && (
        <>
          <div className="scanlines" aria-hidden="true" />
          <div className="vignette" aria-hidden="true" />
        </>
      )}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:border focus:border-solar focus:bg-carbon focus:px-4 focus:py-2 focus:font-mono focus:text-xs"
      >
        Saltar al contenido
      </a>

      <header className="fixed inset-x-0 top-0 z-40 border-b border-line/70 bg-carbon/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-1 px-3 sm:gap-4 sm:px-4 md:px-8">
          <button
            onClick={() => go("inicio")}
            className="btn-ghost flex min-h-11 items-center gap-2.5 text-left"
            aria-label="Ir al inicio — Barranquilla, Arquitectura del Tiempo"
          >
            <span className="font-mono text-[10px] font-medium tracking-[0.34em] text-river">
              BQ·ATLAS
            </span>
            <span className="hidden font-display text-base italic leading-none sm:block">
              Arquitectura <span className="text-ember">del</span> Tiempo
            </span>
          </button>

          <nav className="ml-auto flex items-center" aria-label="Secciones principales">
            {NAV.map((n) => {
              const active = view === n.view || (n.view === "mapa" && view === "edificio");
              return (
                <button
                  key={n.view}
                  onClick={() => go(n.view)}
                  aria-current={active ? "page" : undefined}
                  className={`btn-ghost relative flex min-h-11 items-center px-2 py-2 font-mono text-[9.5px] uppercase tracking-[0.12em] sm:px-3 sm:text-[11px] sm:tracking-[0.18em] ${
                    active ? "text-paper" : "text-faded hover:text-paper"
                  }`}
                >
                  {n.label}
                  <span
                    className={`absolute inset-x-3 -bottom-px h-[2px] transition-colors ${
                      active ? "bg-rust" : "bg-transparent"
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          <EraReadout />
          <SoundControl />
        </div>
      </header>

      <main id="contenido" className="pt-14">
        {children}
      </main>
    </div>
  );
}
