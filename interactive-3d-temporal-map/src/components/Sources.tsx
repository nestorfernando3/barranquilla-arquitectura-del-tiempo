import {
  BUILDINGS,
  CERTAINTY_META,
  ERAS,
  ERA_ORDER,
  STATUS_META,
  type Certainty,
} from "../data/buildings";
import { useStore } from "../store";

const PALETTE: { name: string; hex: string; use: string }[] = [
  { name: "Carbón", hex: "#0b0f14", use: "Base / noche urbana" },
  { name: "Tinta azul", hex: "#0e141c", use: "Paneles y profundidad" },
  { name: "Papel envejecido", hex: "#e9e2d0", use: "Texto y volumetría esencial" },
  { name: "Óxido", hex: "#c1572f", use: "Memoria, industria, transición" },
  { name: "Azul verdoso", hex: "#4fa3a8", use: "Río, navegación, cartografía" },
  { name: "Amarillo solar", hex: "#e3b23c", use: "Énfasis puntual y rutas" },
  { name: "Grafito acerado", hex: "#8ea3b8", use: "Modernismo e instituciones" },
];

const MOTION_PRINCIPLES = [
  { k: "Ensamblaje", v: "Construir o recuperar: los fragmentos vuelven a su lugar con peso y desaceleración." },
  { k: "Fragmentación", v: "Revelar conocimiento: cada separación expone una capa (forma, material, función, ciudad, memoria)." },
  { k: "Cámara con peso", v: "Los movimientos son deliberados, con inercia amortiguada; nada salta ni marea." },
  { k: "Ausencia explícita", v: "Solo un edificio realmente perdido y documentado puede representarse como contorno o nube de puntos." },
  { k: "Interrupción segura", v: "Toda animación puede detenerse o saltarse sin romper la interfaz; prefers-reduced-motion completo." },
];

function certaintyList(c: Certainty) {
  return BUILDINGS.filter((b) => {
    if (c === "hipotesis") {
      return b.yearCertainty === "hipotesis" || b.architectCertainty === "hipotesis" || b.latlonCertainty === "hipotesis";
    }
    if (c === "aproximado") {
      return (
        (b.yearCertainty === "aproximado" || b.architectCertainty === "aproximado" || b.latlonCertainty === "aproximado") &&
        b.yearCertainty !== "hipotesis" && b.architectCertainty !== "hipotesis" && b.latlonCertainty !== "hipotesis"
      );
    }
    return false;
  });
}

export default function Sources() {
  const go = useStore((s) => s.go);
  const approx = certaintyList("aproximado");
  const hypo = certaintyList("hipotesis");
  const recoverableSources = Array.from(
    new Map(
      BUILDINGS.flatMap((building) => building.sources)
        .filter((source) => source.url)
        .map((source) => [source.id ?? source.url!, source])
    ).values()
  );

  return (
    <section className="relative" aria-label="Fuentes, metodología y créditos">
      <div className="topo-bg">
        <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-river">
            Documento de rigor · Prototipo v2
          </p>
          <h1 className="mt-3 font-display text-4xl font-light italic leading-tight text-paper md:text-5xl">
            Fuentes, metodología <span className="text-ember">y</span> créditos
          </h1>
          <p className="mt-5 max-w-xl text-[14.5px] leading-[1.75] text-faded">
            Este atlas es un prototipo de investigación-creación. Ninguna afirmación histórica se
            presenta como definitiva si no cuenta con verificación documental; cada dato lleva
            visible su nivel de certeza.
          </p>

          {/* niveles de certeza */}
          <h2 className="mt-12 font-display text-2xl italic text-paper">Niveles de certeza</h2>
          <div className="mt-4 space-y-3">
            {(Object.keys(CERTAINTY_META) as (keyof typeof CERTAINTY_META)[]).map((c) => (
              <div key={c} className="flex items-start gap-4 border border-line bg-panel/50 p-4">
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border font-mono text-sm ${
                  c === "verificado" ? "border-river text-river" : c === "aproximado" ? "border-solar text-solar" : "border-ember text-ember"
                }`}>
                  {CERTAINTY_META[c].icon}
                </span>
                <div>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-paper">{c}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-faded">{CERTAINTY_META[c].label}.</p>
                </div>
              </div>
            ))}
          </div>

          {/* tipos de representación */}
          <h2 className="mt-12 font-display text-2xl italic text-paper">Qué es cada imagen</h2>
          <ul className="mt-4 space-y-2 text-[13.5px] leading-relaxed text-faded">
            <li className="border-l-2 border-river pl-4"><strong className="text-paper">Volumetría 3D:</strong> prototipo procedural generado a partir de datos del atlas. No es un levantamiento ni una reconstrucción fiel.</li>
            <li className="border-l-2 border-river pl-4"><strong className="text-paper">Planos interpretativos:</strong> generados en el navegador a partir de la misma volumetría. Etiquetados siempre como «no es documento histórico».</li>
            <li className="border-l-2 border-river pl-4"><strong className="text-paper">Nubes de puntos:</strong> representan edificios perdidos o no documentados; la ausencia es parte del lenguaje, no un relleno.</li>
            <li className="border-l-2 border-ember pl-4"><strong className="text-paper">Fotografía de archivo:</strong> este prototipo <em>no incluye</em> fotografías reales ni generadas presentadas como archivo. La integración de documentos fotográficos legales es un activo pendiente.</li>
          </ul>

          {/* pendientes */}
          <h2 className="mt-12 font-display text-2xl italic text-paper">Datos pendientes de verificación</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-faded">
            Lista explícita para la fase de curaduría. La etapa de producción impide presentar una
            volumetría preliminar como modelo revisado o publicable.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse font-mono text-[10.5px]">
              <thead>
                <tr className="border-b border-line2 text-left text-dim">
                  <th className="py-2 pr-4 font-medium uppercase tracking-wider">Edificio</th>
                  <th className="py-2 pr-4 font-medium uppercase tracking-wider">Periodo</th>
                  <th className="py-2 pr-4 font-medium uppercase tracking-wider">Autoría</th>
                  <th className="py-2 pr-4 font-medium uppercase tracking-wider">Etapa</th>
                  <th className="py-2 font-medium uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody>
                {BUILDINGS.map((b) => (
                  <tr key={b.id} className="border-b border-line/60">
                    <td className="py-2.5 pr-4 text-paper">
                      <button onClick={() => go("edificio", b.slug)} className="underline-offset-2 hover:text-river hover:underline">
                        {b.name}
                      </button>
                    </td>
                    <td className={`py-2.5 pr-4 ${b.yearCertainty === "hipotesis" ? "text-ember" : "text-solar"}`}>
                      {b.year} {CERTAINTY_META[b.yearCertainty ?? "aproximado"].icon}
                    </td>
                    <td className="py-2.5 pr-4 text-faded">{b.architect}</td>
                    <td className="py-2.5 pr-4 uppercase text-river">{b.productionStage.replace("_", " ")}</td>
                    <td className="py-2.5" style={{ color: STATUS_META[b.status].color }}>{STATUS_META[b.status].label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 font-mono text-[10px] leading-relaxed text-dim">
            {approx.length} nodos con datos aproximados · {hypo.length} nodos con hipótesis activas.
            ◍ = aproximado · ? = hipótesis.
          </p>

          {/* fuentes de referencia */}
          <h2 className="mt-12 font-display text-2xl italic text-paper">Fuentes recuperables integradas</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-faded">
            Estas citas tienen enlace directo. Las referencias sin URL siguen visibles en cada ficha como pendientes de migración bibliográfica.
          </p>
          <ul className="mt-4 space-y-2.5">
            {recoverableSources.map((source) => (
              <li key={source.id ?? source.url} className="flex gap-3 border-b border-line/60 pb-2">
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-rust">[{source.kind}]</span>
                <span className="font-mono text-[10.5px] leading-relaxed text-faded">
                  <a href={source.url} target="_blank" rel="noreferrer" className="text-stone underline decoration-line2 underline-offset-2 hover:text-river">
                    {source.title ?? source.label}
                  </a>
                  {source.institution ? <span className="block text-dim">{source.institution}{source.pages ? ` · p. ${source.pages}` : ""}</span> : null}
                </span>
              </li>
            ))}
          </ul>

          {/* sistema visual */}
          <h2 className="mt-12 font-display text-2xl italic text-paper">Sistema visual y de movimiento</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PALETTE.map((p) => (
              <div key={p.hex} className="border border-line bg-panel/50">
                <div className="h-12" style={{ background: p.hex }} aria-hidden="true" />
                <div className="p-2.5">
                  <p className="font-mono text-[9.5px] uppercase tracking-wider text-paper">{p.name}</p>
                  <p className="font-mono text-[8.5px] text-dim">{p.hex} · {p.use}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 border border-line bg-panel/50 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-faded">Tipografía — tres registros</p>
            <p className="mt-3 font-display text-2xl italic text-paper">Fraunces — relato histórico y títulos</p>
            <p className="mt-2 text-[15px] text-stone">Archivo — lectura continua, navegación e interfaz.</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-river">IBM Plex Mono — coordenadas, fechas, fuentes, cartografía</p>
          </div>
          <dl className="mt-4 space-y-2">
            {MOTION_PRINCIPLES.map((m) => (
              <div key={m.k} className="flex gap-3 border-b border-line/60 pb-2">
                <dt className="w-40 shrink-0 font-mono text-[9.5px] uppercase tracking-wider text-solar">{m.k}</dt>
                <dd className="text-[12.5px] leading-relaxed text-faded">{m.v}</dd>
              </div>
            ))}
          </dl>

          {/* épocas */}
          <h2 className="mt-12 font-display text-2xl italic text-paper">Periodización (hipótesis de trabajo)</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {ERA_ORDER.map((e) => (
              <span key={e} className="flex items-center gap-2 border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-stone">
                <span className="h-2.5 w-2.5 rotate-45" style={{ background: ERAS[e].color }} aria-hidden="true" />
                {ERAS[e].label} · {ERAS[e].range}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[12.5px] leading-relaxed text-dim">
            La periodización es una hipótesis narrativa y debe validarse con historiografía local antes de publicar datos definitivos.
          </p>

          {/* créditos y agregar edificios */}
          <h2 className="mt-12 font-display text-2xl italic text-paper">Créditos y extensión</h2>
          <p className="mt-3 text-[13.5px] leading-[1.75] text-faded">
            Prototipo de investigación-creación: dirección creativa, diseño de experiencia, arquitectura de
            información, arte técnico 3D y desarrollo frontend integrados en una sola pieza. Las fotografías,
            planos originales, testimonios orales y modelos definitivos son <strong className="text-paper">activos
            pendientes</strong> documentados en el README del proyecto.
          </p>
          <p className="mt-3 text-[13.5px] leading-[1.75] text-faded">
            Agregar un edificio no requiere reescribir la aplicación: basta con añadir un registro al archivo{" "}
            <code className="border border-line bg-panel px-1.5 py-0.5 font-mono text-[11px] text-river">src/data/buildings.ts</code>{" "}
            siguiendo el esquema tipado (datos + volumetría + perfil de fragmentación + fuentes). Instrucciones
            completas en el README.
          </p>

          <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-6">
            <button onClick={() => go("mapa")} className="btn-ghost border border-river px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-river hover:bg-riverdeep/30">
              Explorar el mapa
            </button>
            <button onClick={() => go("recorrido")} className="btn-ghost border border-line px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-faded hover:border-rust hover:text-ember">
              Repetir el recorrido
            </button>
            <button onClick={() => go("inicio")} className="btn-ghost border border-line px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-faded hover:text-paper">
              Volver al prólogo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
