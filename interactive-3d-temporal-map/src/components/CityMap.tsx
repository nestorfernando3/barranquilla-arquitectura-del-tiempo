import { useEffect, useMemo, useRef, useState } from "react";
import {
  BUILDINGS,
  BUILDING_BY_ID,
  ERAS,
  ERA_ORDER,
  ROUTES,
  STATUS_META,
  type Building,
  type EraId,
} from "../data/buildings";
import { useStore } from "../store";
import { audio } from "../lib/audio";
import { MAP_META } from "../data/map";

const W = 1000;
const H = 760;

const SECTORS: { id: string; label: string; d: string; lx: number; ly: number }[] = [
  { id: "puerto", label: "LA LUZ · PUERTO", d: "M 180 280 L 302 292 L 290 462 L 208 448 Z", lx: 218, ly: 310 },
  { id: "centro", label: "CENTRO HISTÓRICO", d: "M 350 318 L 546 300 L 562 462 L 382 482 Z", lx: 388, ly: 340 },
  { id: "abajo", label: "BARRIO ABAJO", d: "M 280 470 L 380 482 L 362 572 L 262 554 Z", lx: 284, ly: 542 },
  { id: "sannicolas", label: "SAN NICOLÁS", d: "M 362 572 L 382 482 L 472 492 L 462 582 Z", lx: 388, ly: 566 },
  { id: "prado", label: "EL PRADO", d: "M 540 120 L 724 142 L 702 300 L 562 288 Z", lx: 636, ly: 162 },
  { id: "bellavista", label: "BELLAVISTA", d: "M 702 300 L 824 312 L 802 402 L 690 390 Z", lx: 726, ly: 332 },
];

const ROADS: { d: string; label: string; lx: number; ly: number; rot: number }[] = [
  { d: "M 262 462 L 646 308", label: "PASEO BOLÍVAR", lx: 420, ly: 388, rot: -21 },
  { d: "M 206 262 C 224 380 242 480 282 592", label: "VÍA 40", lx: 228, ly: 420, rot: 78 },
  { d: "M 456 240 L 482 572", label: "CRA 43", lx: 462, ly: 300, rot: 85 },
  { d: "M 332 286 L 774 224", label: "CALLE 72 · OLAYA HERRERA", lx: 560, ly: 248, rot: -8 },
  { d: "M 262 560 L 764 470", label: "CALLE MURILLO", lx: 600, ly: 492, rot: -10 },
];

function startYear(b: Building): number {
  const m = b.year?.match(/\d{4}/);
  if (m) return parseInt(m[0], 10);
  return { fluvial: 1858, republica: 1908, deco: 1932, moderna: 1952, memoria: 1988 }[b.era];
}

const ERA_BANDS: { era: EraId; from: number; to: number }[] = [
  { era: "fluvial", from: 1842, to: 1902 },
  { era: "republica", from: 1903, to: 1929 },
  { era: "deco", from: 1930, to: 1949 },
  { era: "moderna", from: 1950, to: 1984 },
  { era: "memoria", from: 1985, to: 2026 },
];

export default function CityMap() {
  const go = useStore((s) => s.go);
  const eraFilters = useStore((s) => s.eraFilters);
  const statusFilters = useStore((s) => s.statusFilters);
  const toggleEra = useStore((s) => s.toggleEra);
  const toggleStatus = useStore((s) => s.toggleStatus);
  const activeRoute = useStore((s) => s.activeRoute);
  const setRoute = useStore((s) => s.setRoute);
  const timelineYear = useStore((s) => s.timelineYear);
  const setTimelineYear = useStore((s) => s.setTimelineYear);
  const visited = useStore((s) => s.visited);
  const selectedSlug = useStore((s) => s.buildingSlug);

  const [tf, setTf] = useState({ x: 0, y: 0, k: 1 });
  const [hoverSlug, setHoverSlug] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const svgWrap = useRef<HTMLDivElement>(null);
  const drag = useRef<{ px: number; py: number; x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(0);

  useEffect(() => {
    audio.setScene("ciudad");
  }, []);

  // al llegar desde una ficha («ubicar en el mapa»), resaltar el nodo
  useEffect(() => {
    if (selectedSlug) setHoverSlug(selectedSlug);
  }, [selectedSlug]);

  // wheel no pasivo para zoom
  useEffect(() => {
    const el = svgWrap.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * W;
      const my = ((e.clientY - rect.top) / rect.height) * H;
      setTf((t) => {
        const k2 = Math.min(4.5, Math.max(0.75, t.k * Math.exp(-e.deltaY * 0.0012)));
        return {
          k: k2,
          x: mx - ((mx - t.x) * k2) / t.k,
          y: my - ((my - t.y) * k2) / t.k,
        };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const filtered = useMemo(
    () =>
      BUILDINGS.filter(
        (b) =>
          eraFilters.includes(b.era) &&
          statusFilters.includes(b.status) &&
          startYear(b) <= timelineYear
      ),
    [eraFilters, statusFilters, timelineYear]
  );

  const routePoints = useMemo(() => {
    if (!activeRoute) return null;
    const r = ROUTES.find((x) => x.id === activeRoute);
    if (!r) return null;
    return r.ids.map((id) => BUILDING_BY_ID[id].mapPos);
  }, [activeRoute]);

  const hovered = hoverSlug ? BUILDING_BY_ID[hoverSlug] : null;
  const labelSize = 10.5 / Math.sqrt(tf.k);

  const zoomBy = (f: number) =>
    setTf((t) => {
      const k2 = Math.min(4.5, Math.max(0.75, t.k * f));
      const cx = W / 2, cy = H / 2;
      return { k: k2, x: cx - ((cx - t.x) * k2) / t.k, y: cy - ((cy - t.y) * k2) / t.k };
    });

  return (
    <section className="relative h-[calc(100dvh-3.5rem)] overflow-hidden" aria-label="Mapa interactivo de Barranquilla" aria-describedby="map-disclaimer">
      {/* encabezado */}
      <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 text-center">
        <h1 className="font-display text-2xl font-light italic leading-none text-paper md:text-3xl">
          {MAP_META.title}
        </h1>
        <p className="mt-1.5 hidden font-mono text-[9px] uppercase tracking-[0.22em] text-river sm:block">
          {MAP_META.disclaimer}
        </p>
      </div>

      {/* lienzo del mapa */}
      <div
        ref={svgWrap}
        className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={(e) => {
          drag.current = { px: e.clientX, py: e.clientY, x: tf.x, y: tf.y, moved: false };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const dx = e.clientX - drag.current.px;
          const dy = e.clientY - drag.current.py;
          if (Math.hypot(dx, dy) > 10) drag.current.moved = true;
          const rect = svgWrap.current!.getBoundingClientRect();
          setTf((t) => ({
            ...t,
            x: drag.current!.x + (dx / rect.width) * W,
            y: drag.current!.y + (dy / rect.height) * H,
          }));
        }}
        onPointerUp={() => {
          if (drag.current?.moved) suppressClick.current = Date.now();
          drag.current = null;
        }}
        onPointerCancel={() => { drag.current = null; }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-full w-full select-none"
          role="group"
          aria-label="Mapa estilizado de Barranquilla con edificios patrimoniales"
        >
          <defs>
            <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1d4a50" />
              <stop offset="100%" stopColor="#122b31" />
            </linearGradient>
            <pattern id="gridp" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(233,226,208,0.035)" strokeWidth="1" />
            </pattern>
            <path id="rioPath" d="M 96 -30 C 130 90 88 210 132 320 C 176 430 128 540 172 650 C 190 700 186 740 198 800" fill="none" />
          </defs>

          <rect width={W} height={H} fill="#0b0f14" />

          <g transform={`translate(${tf.x} ${tf.y}) scale(${tf.k})`}>
            <rect width={W} height={H} fill="url(#gridp)" />

            {/* topografía */}
            <g stroke="rgba(79,163,168,0.07)" fill="none" strokeWidth="1">
              <path d="M 620 80 Q 780 40 980 90" />
              <path d="M 640 120 Q 800 84 990 130" />
              <path d="M 700 620 Q 850 580 1000 620" />
              <path d="M 720 660 Q 860 624 1010 664" />
            </g>

            {/* mar */}
            <rect x={-40} y={-40} width={W + 80} height={78} fill="#0c1520" />
            <path d="M -40 38 Q 200 26 480 38 T 1040 38" stroke="rgba(79,163,168,0.3)" fill="none" strokeWidth="1.5" />
            <text x={70} y={16} fontSize="11" fill="#4fa3a8" fontFamily="IBM Plex Mono, monospace" letterSpacing="4">
              MAR CARIBE — BOCAS DE CENIZA
            </text>

            {/* río */}
            <path
              d="M 96 -30 C 130 90 88 210 132 320 C 176 430 128 540 172 650 C 190 700 186 740 198 800 L -40 800 L -40 -30 Z"
              fill="url(#riverGrad)"
            />
            <use href="#rioPath" stroke="#4fa3a8" strokeWidth="2" strokeDasharray="2 16" className="dash-flow" opacity="0.75" />
            <text fontSize="13" fill="#7fd6dc" fontFamily="IBM Plex Mono, monospace" letterSpacing="6" opacity="0.85">
              <textPath href="#rioPath" startOffset="22%">RÍO MAGDALENA</textPath>
            </text>

            {/* ferrocarril */}
            <path
              d="M 302 518 C 220 470 132 380 70 280"
              stroke="#c1572f"
              strokeWidth="1.6"
              strokeDasharray="7 7"
              fill="none"
              className="dash-flow"
              opacity="0.85"
            />
            <text x={92} y={410} fontSize="9" fill="#c1572f" fontFamily="IBM Plex Mono, monospace" letterSpacing="2" transform="rotate(-52 92 410)">
              FC. DE BOLÍVAR → PTO. COLOMBIA
            </text>

            {/* sectores */}
            {SECTORS.map((s) => (
              <g key={s.id}>
                <path d={s.d} fill="rgba(18,26,36,0.6)" stroke="#233140" strokeWidth="1.2" strokeDasharray="5 4" />
                <text x={s.lx} y={s.ly} fontSize={labelSize * 0.85} fill="#6d7583" fontFamily="IBM Plex Mono, monospace" letterSpacing="3">
                  {s.label}
                </text>
              </g>
            ))}

            {/* calles */}
            {ROADS.map((r) => (
              <g key={r.label}>
                <path d={r.d} stroke="rgba(233,226,208,0.16)" strokeWidth="1.6" fill="none" />
                <text
                  x={r.lx} y={r.ly - 5}
                  fontSize={labelSize * 0.72}
                  fill="rgba(233,226,208,0.4)"
                  fontFamily="IBM Plex Mono, monospace"
                  letterSpacing="2.5"
                  transform={`rotate(${r.rot} ${r.lx} ${r.ly})`}
                >
                  {r.label}
                </text>
              </g>
            ))}

            {/* ruta curatorial */}
            {routePoints && (
              <polyline
                points={routePoints.map((p) => p.join(",")).join(" ")}
                fill="none"
                stroke="#e3b23c"
                strokeWidth={2.4 / Math.sqrt(tf.k)}
                strokeDasharray="1 11"
                strokeLinecap="round"
                className="dash-flow-fast"
                opacity="0.95"
              />
            )}

            {/* pines */}
            {filtered.map((b, idx) => {
              const era = ERAS[b.era];
              const lost = b.status === "perdido";
              const isHover = hoverSlug === b.slug || selectedSlug === b.slug;
              const r = 9 / Math.sqrt(tf.k);
              return (
                <g
                  key={b.id}
                  transform={`translate(${b.mapPos[0]} ${b.mapPos[1]})`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${b.name}. ${b.year ?? "Fecha por verificar"}. Sector ${b.sector}. ${STATUS_META[b.status].label}. Enter para abrir la ficha.`}
                  className="cursor-pointer outline-none"
                  onClick={(e) => {
                    if (Date.now() - suppressClick.current < 80) return;
                    e.stopPropagation();
                    go("edificio", b.slug);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      go("edificio", b.slug);
                    }
                  }}
                  onPointerEnter={() => setHoverSlug(b.slug)}
                  onPointerLeave={() => setHoverSlug(null)}
                  onFocus={() => setHoverSlug(b.slug)}
                  onBlur={() => setHoverSlug(null)}
                >
                  {/* Invisible hit area for easy tapping */}
                  <circle r={Math.max(r * 2.8, 22)} fill="transparent" />
                  {!lost && (
                    <circle
                      r={r * 1.9}
                      fill="none"
                      stroke={era.color}
                      strokeWidth="1.4"
                      className="pin-ring"
                      style={{ ["--d" as string]: `${(idx % 5) * 0.4}s` }}
                    />
                  )}
                  {isHover && (
                    <g stroke="#e9e2d0" strokeWidth={1.2 / Math.sqrt(tf.k)} opacity="0.9">
                      <line x1={-r * 2.4} x2={-r * 1.2} y1="0" y2="0" />
                      <line x1={r * 1.2} x2={r * 2.4} y1="0" y2="0" />
                      <line y1={-r * 2.4} y2={-r * 1.2} x1="0" x2="0" />
                      <line y1={r * 1.2} y2={r * 2.4} x1="0" x2="0" />
                    </g>
                  )}
                  {lost ? (
                    <circle
                      r={r}
                      fill="rgba(193,87,47,0.12)"
                      stroke={era.color}
                      strokeWidth="1.6"
                      strokeDasharray="3 3"
                      vectorEffect="non-scaling-stroke"
                    />
                  ) : (
                    <>
                      <circle
                        r={r}
                        fill={visited.includes(b.slug) ? "#1f3a44" : "#0e141c"}
                        stroke={visited.includes(b.slug) ? "#4fa3a8" : era.color}
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                      <circle r={r * 0.34} fill={visited.includes(b.slug) ? "#7fd6dc" : era.color} />
                    </>
                  )}
                  <text
                    y={r + labelSize + 3}
                    textAnchor="middle"
                    fontSize={labelSize}
                    fill={isHover ? "#e9e2d0" : "rgba(233,226,208,0.72)"}
                    fontFamily="IBM Plex Mono, monospace"
                    letterSpacing="1"
                    stroke="#0b0f14"
                    strokeWidth="3"
                    paintOrder="stroke"
                    className={isHover ? "block" : "hidden sm:block"}
                  >
                    {b.name.toUpperCase()}
                  </text>
                </g>
              );
            })}

            {/* brújula */}
            <g transform={`translate(${W - 64} 108)`} opacity="0.9">
              <circle r="26" fill="none" stroke="#2f4154" strokeWidth="1" />
              <circle r="3" fill="#c1572f" />
              <path d="M 0 -20 L 5 4 L 0 0 L -5 4 Z" fill="#e9e2d0" />
              <text y="-32" textAnchor="middle" fontSize="12" fill="#e9e2d0" fontFamily="IBM Plex Mono, monospace">N</text>
            </g>

            {/* ticks de coordenadas */}
            <g fill="#6d7583" fontFamily="IBM Plex Mono, monospace" fontSize="8.5" letterSpacing="1">
              {[200, 400, 600, 800].map((x, i) => (
                <text key={x} x={x} y={H - 12}>{`74°${53 - i}′W`}</text>
              ))}
              {[180, 380, 580].map((y, i) => (
                <text key={y} x={W - 62} y={y}>{`11°0${i}′N`}</text>
              ))}
            </g>

          </g>
        </svg>
      </div>

      <p id="map-disclaimer" className={`pointer-events-none absolute left-4 top-[7.8rem] z-20 max-w-[16rem] border border-line bg-carbon/90 px-2.5 py-2 font-mono text-[9px] uppercase leading-relaxed tracking-wider text-stone sm:sr-only ${mobileFiltersOpen ? "hidden" : ""}`}>
        {MAP_META.disclaimer}
      </p>

      {/* panel de filtros (escritorio) */}
      <aside className="absolute left-4 top-20 z-20 hidden w-64 border border-line bg-carbon/85 p-4 backdrop-blur-sm md:block" aria-label="Filtros del mapa">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-faded">Filtros · época</p>
        <div className="mt-2.5 space-y-1.5">
          {ERA_ORDER.map((e) => {
            const on = eraFilters.includes(e);
            return (
              <button
                key={e}
                onClick={() => toggleEra(e)}
                aria-pressed={on}
                className={`btn-ghost flex w-full items-center gap-2.5 border px-2.5 py-2 text-left ${
                  on ? "border-line bg-panel" : "border-transparent opacity-40"
                }`}
              >
                <span className="h-2.5 w-2.5 rotate-45" style={{ background: ERAS[e].color }} aria-hidden="true" />
                <span className="flex-1">
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-paper">{ERAS[e].label}</span>
                  <span className="block font-mono text-[9px] text-dim">{ERAS[e].range}</span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-faded">Estado</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(Object.keys(STATUS_META) as (keyof typeof STATUS_META)[]).map((s) => {
            const on = statusFilters.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleStatus(s)}
                aria-pressed={on}
                className={`btn-ghost border px-2 py-1.5 font-mono text-[9px] uppercase tracking-wider ${
                  on ? "border-line2 text-paper" : "border-line text-dim opacity-50"
                }`}
              >
                {STATUS_META[s].label}
              </button>
            );
          })}
        </div>

        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-faded">Rutas curatoriales</p>
        <div className="mt-2 space-y-1.5">
          {ROUTES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRoute(activeRoute === r.id ? null : r.id)}
              aria-pressed={activeRoute === r.id}
              className={`btn-ghost w-full border px-2.5 py-2 text-left ${
                activeRoute === r.id ? "border-solar bg-panel" : "border-line hover:border-line2"
              }`}
            >
              <span className="block font-mono text-[10px] uppercase tracking-wider text-paper">◈ {r.label}</span>
              <span className="mt-0.5 block text-[10.5px] leading-snug text-dim">{r.description}</span>
            </button>
          ))}
        </div>

        <p className="mt-4 border-t border-line pt-3 font-mono text-[10px] uppercase tracking-wider text-river">
          Volumetrías ({filtered.length} / {BUILDINGS.length})
        </p>
        <div className="mt-2 max-h-48 overflow-y-auto space-y-1 pr-1">
          {filtered.map((b) => (
            <button
              key={b.id}
              onClick={() => go("edificio", b.slug)}
              className="btn-ghost flex w-full items-center justify-between border border-line/60 bg-carbon/50 px-2 py-1.5 text-left hover:border-river hover:text-paper"
            >
              <span className="truncate font-mono text-[9.5px] uppercase tracking-wider text-stone">
                {b.name}
              </span>
              <span className="shrink-0 border border-river/50 px-1 py-px font-mono text-[8px] uppercase tracking-widest text-river">
                {b.productionStage.replace("modelo_", "L")}
              </span>
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="mt-2 text-[11px] leading-snug text-ember">
            Sin resultados con los filtros actuales — amplía la línea temporal o reactiva épocas.
          </p>
        )}
      </aside>

      {/* filtros móviles */}
      <div className="absolute left-4 top-[4.6rem] z-30 md:hidden">
        <button
          onClick={() => setMobileFiltersOpen((open) => !open)}
          aria-expanded={mobileFiltersOpen}
          aria-controls="mobile-map-filters"
          className="btn-ghost flex min-h-11 items-center gap-2 border border-line bg-carbon/90 px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-paper"
        >
          <span aria-hidden="true">{mobileFiltersOpen ? "×" : "☷"}</span>
          Filtros
          <span className="text-river">{eraFilters.length}/5</span>
        </button>
        {mobileFiltersOpen && (
          <div id="mobile-map-filters" className="mt-2 max-h-[55vh] w-[min(21rem,calc(100vw-2rem))] overflow-y-auto border border-line bg-carbon/95 p-3 shadow-2xl">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-faded">Periodos</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {ERA_ORDER.map((e) => {
                const on = eraFilters.includes(e);
                return (
                  <button
                    key={e}
                    onClick={() => toggleEra(e)}
                    aria-pressed={on}
                    className={`btn-ghost flex min-h-11 items-center gap-2 border px-2 text-left font-mono text-[9px] uppercase tracking-wider ${on ? "border-line2 bg-panel text-paper" : "border-line text-dim opacity-55"}`}
                  >
                    <span className="h-2 w-2 shrink-0 rotate-45" style={{ background: ERAS[e].color }} aria-hidden="true" />
                    {ERAS[e].range}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.2em] text-faded">Rutas</p>
            <div className="mt-2 space-y-2">
              {ROUTES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRoute(activeRoute === r.id ? null : r.id)}
                  aria-pressed={activeRoute === r.id}
                  className={`btn-ghost min-h-11 w-full border px-3 text-left font-mono text-[9px] uppercase tracking-wider ${activeRoute === r.id ? "border-solar text-solar" : "border-line text-faded"}`}
                >
                  ◈ {r.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* zoom */}
      <div className="absolute right-4 top-[4.6rem] z-20 flex flex-col border border-line bg-carbon/85 md:top-24">
        <button onClick={() => zoomBy(1.45)} aria-label="Acercar mapa" className="btn-ghost h-11 w-11 border-b border-line font-mono text-lg text-paper hover:text-river">+</button>
        <button onClick={() => zoomBy(1 / 1.45)} aria-label="Alejar mapa" className="btn-ghost h-11 w-11 border-b border-line font-mono text-lg text-paper hover:text-river">−</button>
        <button onClick={() => setTf({ x: 0, y: 0, k: 1 })} aria-label="Restablecer vista del mapa" className="btn-ghost flex h-11 w-11 items-center justify-center font-mono text-[10px] text-faded hover:text-river">⌂</button>
      </div>

      {/* leyenda */}
      <div className="absolute bottom-24 right-4 z-20 hidden border border-line bg-carbon/85 p-3 lg:block" aria-label="Leyenda del mapa">
        <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-faded">Leyenda</p>
        <ul className="mt-2 space-y-1.5 font-mono text-[9.5px] text-dim">
          <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rotate-45 border-2 border-river bg-ink" /> En pie / transformado</li>
          <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full border border-dashed border-ember" /> Perdido (contorno)</li>
          <li className="flex items-center gap-2"><span className="h-px w-4 bg-solar" /> Ruta curatorial</li>
          <li className="flex items-center gap-2"><span className="h-px w-4 border-t border-dashed border-rust" /> Ferrocarril histórico</li>
        </ul>
      </div>

      {/* línea temporal */}
      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-line bg-carbon/88 px-4 py-3 backdrop-blur-sm md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.24em]">
            <span className="text-faded">Línea temporal</span>
            <span className="text-base font-medium tracking-[0.14em] text-solar">{timelineYear}</span>
          </div>
          <input
            type="range"
            min={1840}
            max={2026}
            step={1}
            value={timelineYear}
            onChange={(e) => setTimelineYear(parseInt(e.target.value, 10))}
            className="slider mt-1 w-full py-4"
            aria-label={`Línea temporal, año ${timelineYear}. Filtra los edificios existentes en ese año.`}
            aria-valuetext={`Año ${timelineYear}`}
          />
          <div className="mt-2 flex h-1.5 w-full overflow-hidden" aria-hidden="true">
            {ERA_BANDS.map((b) => (
              <span
                key={b.era}
                style={{
                  width: `${((b.to - b.from + 1) / (2026 - 1840 + 1)) * 100}%`,
                  background: timelineYear >= b.from ? ERAS[b.era].color : "#233140",
                  opacity: timelineYear >= b.from ? 0.85 : 0.5,
                }}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between font-mono text-[8.5px] tracking-widest text-dim" aria-hidden="true">
            <span>1840</span><span>1900</span><span>1950</span><span>2026</span>
          </div>
        </div>
      </div>

      {/* barra de hover */}
      <div
        className={`absolute bottom-28 left-1/2 z-20 -translate-x-1/2 transition-all duration-300 md:bottom-32 ${
          hovered ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-2 opacity-0 pointer-events-none"
        }`}
        aria-hidden={!hovered}
      >
        {hovered && (
          <button
            onClick={() => go("edificio", hovered.slug)}
            className="btn-ghost max-w-md border border-line bg-carbon/92 px-4 py-3 text-center backdrop-blur-sm shadow-xl hover:border-solar transition-colors block text-left"
          >
            <p className="font-display text-base italic leading-none text-paper">{hovered.name}</p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-river">
              {hovered.year ?? "S/F"} · {hovered.sector} · {STATUS_META[hovered.status].label}
            </p>
            <p className="mt-1.5 text-xs text-faded leading-snug line-clamp-2">{hovered.summary}</p>
            <p className="mt-2 font-mono text-[8.5px] uppercase tracking-[0.2em] text-solar flex items-center justify-center gap-1">
              <span>Abrir ficha y modelo 3D</span>
              <span>→</span>
            </p>
          </button>
        )}
      </div>

      {/* listado accesible */}
      <ul className="sr-only">
        {filtered.map((b) => (
          <li key={b.id}>
            <button onClick={() => go("edificio", b.slug)}>
              Abrir ficha de {b.name}, {b.year ?? "fecha por verificar"}, sector {b.sector}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
