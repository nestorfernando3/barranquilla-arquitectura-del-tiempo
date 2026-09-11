import { lazy, Suspense, useEffect } from "react";
import Shell from "./components/Shell";
import { useStore } from "./store";
import { BUILDING_BY_SLUG } from "./data/buildings";

const Prologue = lazy(() => import("./components/Prologue"));
const GuidedTour = lazy(() => import("./components/GuidedTour"));
const CityMap = lazy(() => import("./components/CityMap"));
const BuildingFicha = lazy(() => import("./components/BuildingFicha"));
const Sources = lazy(() => import("./components/Sources"));

function ViewLoading() {
  return (
    <div className="grid h-[calc(100dvh-3.5rem)] place-items-center bg-carbon" role="status">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-river">Preparando la escena…</p>
    </div>
  );
}

const TITLES: Record<string, string> = {
  inicio: "Barranquilla: Arquitectura del Tiempo",
  recorrido: "Recorrido — Barranquilla: Arquitectura del Tiempo",
  mapa: "Cartografía del tiempo — Barranquilla",
  edificio: "Ficha — Barranquilla: Arquitectura del Tiempo",
  fuentes: "Fuentes y metodología — Barranquilla: Arquitectura del Tiempo",
};

export default function App() {
  const view = useStore((s) => s.view);
  const slug = useStore((s) => s.buildingSlug);
  const applyHash = useStore((s) => s.applyHash);

  useEffect(() => {
    applyHash();
    const onHash = () => applyHash();
    window.addEventListener("hashchange", onHash);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => useStore.setState({ reducedMotion: mq.matches });
    mq.addEventListener("change", onMq);

    return () => {
      window.removeEventListener("hashchange", onHash);
      mq.removeEventListener("change", onMq);
    };
  }, [applyHash]);

  useEffect(() => {
    const b = slug ? BUILDING_BY_SLUG[slug] : null;
    document.title = view === "edificio" && b ? `${b.name} — Arquitectura del Tiempo` : TITLES[view] ?? TITLES.inicio;
  }, [view, slug]);

  return (
    <Shell>
      <Suspense fallback={<ViewLoading />}>
        {view === "inicio" && <Prologue />}
        {view === "recorrido" && <GuidedTour />}
        {view === "mapa" && <CityMap />}
        {view === "edificio" && slug && <BuildingFicha key={slug} slug={slug} />}
        {view === "fuentes" && <Sources />}
      </Suspense>
    </Shell>
  );
}
