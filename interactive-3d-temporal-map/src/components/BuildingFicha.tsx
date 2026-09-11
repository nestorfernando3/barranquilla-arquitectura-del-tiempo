import { useEffect, useMemo, useRef, useState } from "react";
import Canvas3D from "../three/Canvas3D";
import FichaScene from "../three/FichaScene";
import {
  BUILDINGS,
  BUILDING_BY_SLUG,
  BUILDING_BY_ID,
  CERTAINTY_META,
  EVIDENCE_META,
  ERAS,
  STATUS_META,
  ZONE_COLORS,
  ZONE_LABEL,
  type Certainty,
} from "../data/buildings";
import { useStore } from "../store";
import { audio } from "../lib/audio";
import { makeBlueprintCanvas } from "../lib/blueprint";
import type { LayerMode } from "../three/FragmentModel";
import { TypewriterText } from "./TypewriterText";

const MODES: { id: LayerMode; label: string; glyph: string; hint: string }[] = [
  { id: "forma", label: "Forma", glyph: "▣", hint: "Volumetría esencial" },
  { id: "material", label: "Material", glyph: "▤", hint: "Materia constructiva" },
  { id: "funcion", label: "Función", glyph: "◧", hint: "Zonas de uso" },
  { id: "ciudad", label: "Ciudad", glyph: "◫", hint: "Contexto urbano" },
  { id: "memoria", label: "Memoria", glyph: "∴", hint: "Archivo e interpretación" },
];

const ERA_SCENE = {
  fluvial: "ferrocarril",
  republica: "rio",
  deco: "radio",
  moderna: "ciudad",
  memoria: "silencio",
} as const;

function useDesktop() {
  const [d, setD] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setD(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return d;
}

function CertBadge({ c, label }: { c: Certainty; label?: string }) {
  const meta = CERTAINTY_META[c];
  return (
    <span
      title={meta.label}
      className={`ml-1.5 inline-flex items-center gap-1 border px-1 py-px font-mono text-[8.5px] uppercase tracking-wider ${
        c === "verificado" ? "border-river text-river" : c === "aproximado" ? "border-solar text-solar" : "border-ember text-ember"
      }`}
    >
      {meta.icon} {label ?? c}
    </span>
  );
}

function DataRow({ k, v, cert }: { k: string; v?: string; cert?: Certainty }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-line/60 py-2">
      <dt className="w-28 shrink-0 font-mono text-[9.5px] uppercase tracking-[0.2em] text-dim">{k}</dt>
      <dd className="font-mono text-[11px] leading-relaxed text-stone">
        {v ?? <span className="text-ember">Por documentar</span>}
        {cert && cert !== "verificado" ? <CertBadge c={cert} /> : null}
      </dd>
    </div>
  );
}

export default function BuildingFicha({ slug }: { slug: string }) {
  const building = BUILDING_BY_SLUG[slug];
  const go = useStore((s) => s.go);
  const reduced = useStore((s) => s.reducedMotion);
  const markVisited = useStore((s) => s.markVisited);
  const tab = useStore((s) => s.mobileSceneTab);
  const setTab = useStore((s) => s.setMobileSceneTab);

  const [mode, setMode] = useState<LayerMode>("forma");
  const [explode, setExplode] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const bpRef = useRef<HTMLCanvasElement>(null);
  const isDesktop = useDesktop();

  useEffect(() => {
    if (building) markVisited(building.slug);
  }, [building, markVisited]);

  useEffect(() => {
    if (building) audio.setScene(ERA_SCENE[building.era]);
  }, [building]);

  // coreografía de ensamblaje inicial
  useEffect(() => {
    if (!building) return;
    if (reduced) {
      setExplode(0.12);
      return;
    }
    let raf = 0;
    const start = performance.now();
    setExplode(1);
    const loop = (now: number) => {
      const t = Math.min(1, (now - start) / 1700);
      const e = 1 - t * t * (3 - 2 * t);
      setExplode(0.12 + e * 0.88);
      if (t < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [building, reduced]);

  useEffect(() => {
    const c = bpRef.current;
    if (!c || !building) return;
    const src = makeBlueprintCanvas(building);
    c.width = src.width;
    c.height = src.height;
    c.getContext("2d")?.drawImage(src, 0, 0);
  }, [building, mode]);

  const next = useMemo(() => {
    if (!building) return null;
    const i = BUILDINGS.findIndex((b) => b.slug === building.slug);
    return BUILDINGS[(i + 1) % BUILDINGS.length];
  }, [building]);

  if (!building) {
    return (
      <section className="flex h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ember">Nodo no encontrado</p>
        <p className="max-w-sm text-sm text-faded">El identificador «{slug}» no existe en el atlas.</p>
        <button onClick={() => go("mapa")} className="btn-ghost border border-river px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-river hover:bg-riverdeep/30">
          ← Volver al mapa
        </button>
      </section>
    );
  }

  const era = ERAS[building.era];
  const status = STATUS_META[building.status];

  const sceneBlock = (
    <div className="relative h-[52vh] lg:h-[calc(100vh-3.5rem)]">
      <div className="absolute inset-0 topo-bg" aria-hidden="true" />
      <div className="absolute inset-0">
        <Canvas3D camera={{ position: [5.2, 3, 8.2], fov: 40 }} fallbackNote={`Ficha de ${building.name}`}>
          <FichaScene building={building} mode={mode} explode={explode} autoRotate={autoRotate} />
        </Canvas3D>
      </div>

      {/* etiqueta de prototipo */}
      <div className="pointer-events-none absolute left-4 top-4 z-10">
        <p className="stamp border-solar/70 text-[8.5px] text-solar">Etapa · {building.productionStage.replace("_", " ")}</p>
        <p className="mt-1.5 max-w-[220px] font-mono text-[8.5px] uppercase leading-relaxed tracking-wider text-dim">
          {mode === "forma" && building.model3d
            ? building.model3d.note
            : `Geometría base: ${EVIDENCE_META[building.massing.defaultEvidence].label}. No es un levantamiento arquitectónico.`}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[8px] uppercase tracking-wider">
          <span className="text-paper">━ documentado</span>
          <span className="text-solar">━ inferido</span>
          <span className="text-river">· evocativo</span>
        </div>
      </div>

      {/* leyenda de función */}
      {mode === "funcion" && (
        <div className="absolute right-4 top-20 z-10 border border-line bg-carbon/85 p-3 lg:right-auto lg:left-52 lg:top-1/2 lg:-translate-y-1/2">
          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-faded">Zonas de uso</p>
          <ul className="mt-2 space-y-1.5">
            {(Object.keys(ZONE_LABEL) as (keyof typeof ZONE_LABEL)[]).map((z) => (
              <li key={z} className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-stone">
                <span className="h-2 w-2" style={{ background: ZONE_COLORS[z] }} aria-hidden="true" />
                {ZONE_LABEL[z]}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* controles de capa */}
      <div className="absolute inset-x-4 bottom-4 z-10 lg:inset-x-auto lg:left-4 lg:top-1/2 lg:bottom-auto lg:w-44 lg:-translate-y-1/2">
        <div className="flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible" role="tablist" aria-label="Capas del edificio">
          {MODES.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => setMode(m.id)}
              className={`btn-ghost flex shrink-0 items-center gap-2.5 border px-3 py-2.5 lg:w-full ${
                mode === m.id ? "border-river bg-riverdeep/25 text-paper" : "border-line bg-carbon/70 text-faded hover:text-paper"
              }`}
            >
              <span className="text-base leading-none text-river" aria-hidden="true">{m.glyph}</span>
              <span className="text-left">
                <span className="block font-mono text-[10px] uppercase tracking-[0.18em]">{m.label}</span>
                <span className="hidden text-[9px] text-dim lg:block">{m.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* desensamblar */}
      <div className="absolute bottom-4 right-4 z-10 hidden w-64 border border-line bg-carbon/85 p-3 lg:block">
        <div className="flex items-baseline justify-between">
          <label htmlFor="explode" className="font-mono text-[9px] uppercase tracking-[0.22em] text-faded">
            Fragmentar el tiempo
          </label>
          <span className="font-mono text-[10px] text-solar">{Math.round(explode * 100)}%</span>
        </div>
        <input
          id="explode"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={explode}
          onChange={(e) => setExplode(parseFloat(e.target.value))}
          className="slider mt-2 w-full"
          aria-label="Nivel de fragmentación del modelo"
        />
        <div className="mt-1 flex justify-between font-mono text-[8px] uppercase tracking-widest text-dim" aria-hidden="true">
          <span>Ensamblado</span><span>Disuelto</span>
        </div>
        <div className="mt-2.5 flex gap-1.5">
          <button
            onClick={() => setAutoRotate((v) => !v)}
            aria-pressed={autoRotate}
            className={`btn-ghost flex-1 border px-2 py-1.5 font-mono text-[9px] uppercase tracking-wider ${autoRotate ? "border-river text-river" : "border-line text-dim"}`}
          >
            ◉ Órbita {autoRotate ? "on" : "off"}
          </button>
          <button
            onClick={() => {
              if (reduced) { setExplode(0.12); return; }
              const start = performance.now();
              const from = explode;
              const loop = (now: number) => {
                const t = Math.min(1, (now - start) / 900);
                setExplode(from + (0.12 - from) * t);
                if (t < 1) requestAnimationFrame(loop);
              };
              requestAnimationFrame(loop);
            }}
            className="btn-ghost flex-1 border border-line px-2 py-1.5 font-mono text-[9px] uppercase tracking-wider text-faded hover:border-rust hover:text-ember"
          >
            ↺ Reensamblar
          </button>
        </div>
      </div>

      {/* slider móvil */}
      <div className="absolute inset-x-4 bottom-20 z-10 border border-line bg-carbon/85 p-2.5 lg:hidden">
        <div className="flex items-center gap-3">
          <label htmlFor="explode-m" className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-faded">Fragmentar</label>
          <input
            id="explode-m"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={explode}
            onChange={(e) => setExplode(parseFloat(e.target.value))}
            className="slider w-full"
            aria-label="Nivel de fragmentación del modelo"
          />
        </div>
      </div>
    </div>
  );

  const contentBlock = (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-8 md:py-12">
      {/* encabezado */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-2 border border-line px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-paper">
          <span className="h-2 w-2 rotate-45" style={{ background: era.color }} aria-hidden="true" />
          {era.label} · {era.range}
        </span>
        <span className="border border-line px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-faded">
          {building.sector}
        </span>
        <span className="border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em]" style={{ borderColor: status.color, color: status.color }}>
          {status.label}
        </span>
      </div>

      <h1 className="mt-5 font-display text-4xl font-light italic leading-[1.02] text-paper md:text-5xl">
        {building.name}
      </h1>
      {building.historicalNames && (
        <p className="mt-2 font-display text-sm italic text-faded">
          Antes: {building.historicalNames.join(" · ")}
        </p>
      )}
      <p className="drop-cap mt-5 border-l-2 border-rust pl-4 font-display text-lg font-light italic leading-relaxed text-stone md:text-xl">
        <TypewriterText text={building.summary} speed={12} delay={150} />
      </p>

      <p className="mt-6 text-[14.5px] leading-[1.75] text-paper/90">{building.narrative}</p>

      {/* perfil de fragmentación */}
      <div className="blueprint-card mt-8 p-5">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.28em] text-river">
          Perfil de fragmentación — eje «{building.massing.profile.axis.toUpperCase()}»
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-faded">{building.fragmentStory}</p>
        <p className="mt-3 font-mono text-[9px] uppercase tracking-wider text-dim">
          Desarma el modelo con el control «Fragmentar el tiempo» en la escena.
        </p>
      </div>

      {/* capa activa */}
      <div className="blueprint-card mt-8 p-5">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.28em] text-faded">
          Capa activa — <span className="text-river">{MODES.find((m) => m.id === mode)?.label}</span>
        </p>
        <p className="mt-2.5 text-[13.5px] leading-[1.75] text-stone">
          {building.layers[mode]}
        </p>
      </div>

      {/* datos */}
      <div className="mt-9">
        <h2 className="font-display text-xl italic text-paper">Ficha documental</h2>
        <dl className="mt-3">
          <DataRow k="Periodo" v={building.year} cert={building.yearCertainty} />
          <DataRow k="Arquitecto" v={building.architect} cert={building.architectCertainty} />
          <DataRow k="Estilo" v={building.architecturalStyle} />
          <DataRow k="Uso original" v={building.originalUse} />
          <DataRow k="Uso actual" v={building.currentUse} />
          <DataRow k="Estado" v={`${status.label}${building.statusNote ? ` — ${building.statusNote}` : ""}`} />
          <DataRow k="Coordenadas" v={`${building.lat.toFixed(4)} N · ${Math.abs(building.lon).toFixed(4)} W`} cert={building.latlonCertainty} />
        </dl>
        {building.statusNote && building.status === "perdido" && (
          <p className="mt-3 border border-ember/50 bg-ember/10 p-3 font-mono text-[10px] leading-relaxed text-ember">
            ⚠ {building.statusNote}
          </p>
        )}
      </div>

      {/* archivo vs presente */}
      <div className="mt-9">
        <h2 className="font-display text-xl italic text-paper">Plano y volumen</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <figure className="border border-line bg-panel/50">
            <canvas ref={bpRef} className="block h-auto w-full" role="img" aria-label={`Plano interpretativo generado de ${building.name}: alzado frontal y planta esquemáticos`} />
            <figcaption className="border-t border-line px-3 py-2.5 font-mono text-[8.5px] uppercase leading-relaxed tracking-wider text-dim">
              Plano interpretativo generado · prototipo — no es documento histórico
            </figcaption>
          </figure>
          <figure className="flex flex-col border border-line bg-panel/50">
            <div className="flex flex-1 items-center justify-center p-8" aria-hidden="true">
              <svg viewBox="0 0 120 120" className="h-40 w-40">
                <g fill="none" stroke="#4fa3a8" strokeWidth="1.4">
                  <path d="M60 18 L98 38 L98 82 L60 102 L22 82 L22 38 Z" />
                  <path d="M60 18 L60 102 M22 38 L60 58 L98 38 M60 58 L60 102" opacity="0.6" />
                  <path d="M22 82 L60 58 L98 82" opacity="0.35" />
                </g>
                <g fill="#e3b23c">
                  <circle cx="60" cy="18" r="2.6" /><circle cx="98" cy="38" r="2.6" /><circle cx="22" cy="38" r="2.6" />
                  <circle cx="98" cy="82" r="2.6" /><circle cx="22" cy="82" r="2.6" /><circle cx="60" cy="102" r="2.6" />
                </g>
              </svg>
            </div>
            <figcaption className="border-t border-line px-3 py-2.5 font-mono text-[8.5px] uppercase leading-relaxed tracking-wider text-dim">
              Volumetría 3D interactiva · prototipo — gira, fragmenta y explora las capas
            </figcaption>
          </figure>
        </div>
      </div>

      {/* temas y relaciones */}
      <div className="mt-9">
        <h2 className="font-display text-xl italic text-paper">Constelación</h2>
        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.24em] text-dim">Temas</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {building.themes.map((t) => (
            <span key={t} className="border border-line px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-wider text-faded">
              #{t}
            </span>
          ))}
        </div>
        <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.24em] text-dim">Edificios relacionados</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {building.related.map((id) => {
            const rel = BUILDING_BY_ID[id];
            if (!rel) return null;
            return (
              <button
                key={id}
                onClick={() => go("edificio", rel.slug)}
                className="btn-ghost flex items-center gap-2 border border-line bg-panel/60 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-stone hover:border-river hover:text-river"
              >
                <span className="h-2 w-2 rotate-45" style={{ background: ERAS[rel.era].color }} aria-hidden="true" />
                {rel.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* fuentes */}
      <div className="mt-9">
        <h2 className="font-display text-xl italic text-paper">Fuentes consultadas</h2>
        <ul className="mt-3 space-y-2">
          {building.sources.map((s, i) => (
            <li key={s.id ?? `${building.slug}-${i}`} className="flex gap-3 border-b border-line/60 pb-2">
              <span className="font-mono text-[9px] uppercase tracking-wider text-rust">[{s.kind}]</span>
              <span className="font-mono text-[10.5px] leading-relaxed text-faded">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-stone underline decoration-line2 underline-offset-2 hover:text-river">
                    {s.title ?? s.label}
                  </a>
                ) : (s.title ?? s.label)}
                {s.institution ? <span className="block text-dim">{s.institution}{s.pages ? ` · p. ${s.pages}` : ""}</span> : null}
                {s.note ? <em className="text-dim"> — {s.note}</em> : null}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] leading-relaxed text-dim">
          Los datos marcados <CertBadge c="aproximado" /> o <CertBadge c="hipotesis" /> están en proceso de
          verificación documental. Consulta la{" "}
          <button onClick={() => go("fuentes")} className="text-river underline underline-offset-2 hover:text-paper">
            página de fuentes y metodología
          </button>.
        </p>
      </div>

      {/* navegación */}
      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <button onClick={() => go("mapa")} className="btn-ghost border border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-faded hover:border-river hover:text-river">
          ← Volver al mapa
        </button>
        <button onClick={() => go("mapa", building.slug)} className="btn-ghost border border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-faded hover:border-river hover:text-river">
          ◎ Ubicar en el mapa
        </button>
        {next && (
          <button onClick={() => go("edificio", next.slug)} className="btn-ghost ml-auto border border-rust px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ember hover:bg-rust hover:text-paper">
            Siguiente nodo · {next.name} ▸
          </button>
        )}
      </div>

      {/* descripción accesible del modelo */}
      <p className="sr-only">
        Descripción del modelo tridimensional de {building.name}: representación volumétrica aproximada compuesta por{" "}
        {building.massing.boxes.length} volúmenes prismáticos organizados según su perfil de fragmentación.{" "}
        {building.fragmentStory}
      </p>
    </div>
  );

  return (
    <section aria-label={`Ficha de ${building.name}`} className="relative">
      {isDesktop ? (
        /* escritorio: escena fija + columna de lectura */
        <div className="grid grid-cols-[1.05fr_1fr]">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)]">{sceneBlock}</div>
          <div className="h-[calc(100vh-3.5rem)] overflow-y-auto border-l border-line">{contentBlock}</div>
        </div>
      ) : (
        /* móvil: pestañas */
        <div>
          <div className="sticky top-14 z-30 flex border-b border-line bg-carbon/90 backdrop-blur-sm" role="tablist" aria-label="Vistas de la ficha">
            <button
              role="tab"
              aria-selected={tab === "modelo"}
              onClick={() => setTab("modelo")}
              className={`flex-1 py-3 font-mono text-[10px] uppercase tracking-[0.22em] ${tab === "modelo" ? "border-b-2 border-rust text-paper" : "text-dim"}`}
            >
              Modelo 3D
            </button>
            <button
              role="tab"
              aria-selected={tab === "historia"}
              onClick={() => setTab("historia")}
              className={`flex-1 py-3 font-mono text-[10px] uppercase tracking-[0.22em] ${tab === "historia" ? "border-b-2 border-rust text-paper" : "text-dim"}`}
            >
              Historia y datos
            </button>
          </div>
          {tab === "modelo" ? <div>{sceneBlock}</div> : <div className="border-t border-line">{contentBlock}</div>}
        </div>
      )}
    </section>
  );
}
