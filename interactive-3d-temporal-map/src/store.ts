import { create } from "zustand";
import { ERA_ORDER, type EraId } from "./data/buildings";
import { audio } from "./lib/audio";

export type View = "inicio" | "recorrido" | "mapa" | "edificio" | "fuentes";

export function parseHash(): { view: View; buildingSlug: string | null } {
  const h = typeof window === "undefined" ? "" : window.location.hash.replace(/^#\/?/, "");
  const parts = h.split("/").filter(Boolean);
  if (parts[0] === "recorrido") return { view: "recorrido", buildingSlug: null };
  if (parts[0] === "mapa") return { view: "mapa", buildingSlug: parts[1] ?? null };
  if (parts[0] === "edificio") return { view: "edificio", buildingSlug: parts[1] ?? null };
  if (parts[0] === "fuentes") return { view: "fuentes", buildingSlug: null };
  return { view: "inicio", buildingSlug: null };
}

type Store = {
  view: View;
  buildingSlug: string | null;
  tourProgress: number;
  soundOn: boolean;
  volume: number;
  reducedMotion: boolean;
  prologueSkipped: boolean;
  timelineYear: number;
  eraFilters: EraId[];
  statusFilters: string[];
  activeRoute: string | null;
  visited: string[];
  webglOK: boolean;
  mobileSceneTab: "modelo" | "historia";

  go: (view: View, slug?: string) => void;
  applyHash: () => void;
  setTourProgress: (p: number) => void;
  toggleSound: () => void;
  setVolume: (v: number) => void;
  skipPrologue: () => void;
  setTimelineYear: (y: number) => void;
  toggleEra: (e: EraId) => void;
  toggleStatus: (s: string) => void;
  setRoute: (r: string | null) => void;
  markVisited: (slug: string) => void;
  setWebgl: (ok: boolean) => void;
  setMobileSceneTab: (t: "modelo" | "historia") => void;
};

function hashFor(view: View, slug?: string): string {
  if (view === "recorrido") return "#/recorrido";
  if (view === "mapa") return slug ? `#/mapa/${slug}` : "#/mapa";
  if (view === "edificio") return `#/edificio/${slug}`;
  if (view === "fuentes") return "#/fuentes";
  return "#/";
}

export const useStore = create<Store>((set, get) => ({
  view: "inicio",
  buildingSlug: null,
  tourProgress: 0,
  soundOn: false,
  volume: 0.6,
  reducedMotion:
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  prologueSkipped: false,
  timelineYear: 2026,
  eraFilters: [...ERA_ORDER],
  statusFilters: ["en-pie", "transformado", "perdido"],
  activeRoute: null,
  visited: [],
  webglOK: true,
  mobileSceneTab: "modelo",

  go: (view, slug) => {
    const h = hashFor(view, slug);
    if (window.location.hash !== h) window.location.hash = h;
    set({ view, buildingSlug: slug ?? null });
    window.scrollTo({ top: 0, behavior: "auto" });
  },

  applyHash: () => {
    const { view, buildingSlug } = parseHash();
    set({ view, buildingSlug });
    window.scrollTo({ top: 0, behavior: "auto" });
  },

  setTourProgress: (p) => set({ tourProgress: p }),
  toggleSound: () => {
    const on = !get().soundOn;
    audio.setEnabled(on);
    set({ soundOn: on });
  },
  setVolume: (v) => {
    audio.setVolume(v);
    set({ volume: v });
  },
  skipPrologue: () => set({ prologueSkipped: true }),
  setTimelineYear: (y) => set({ timelineYear: y }),
  toggleEra: (e) =>
    set((s) => ({
      eraFilters: s.eraFilters.includes(e)
        ? s.eraFilters.filter((x) => x !== e)
        : [...s.eraFilters, e],
    })),
  toggleStatus: (st) =>
    set((s) => ({
      statusFilters: s.statusFilters.includes(st)
        ? s.statusFilters.filter((x) => x !== st)
        : [...s.statusFilters, st],
    })),
  setRoute: (r) => set({ activeRoute: r }),
  markVisited: (slug) =>
    set((s) => (s.visited.includes(slug) ? s : { visited: [...s.visited, slug] })),
  setWebgl: (ok) => set({ webglOK: ok }),
  setMobileSceneTab: (t) => set({ mobileSceneTab: t }),
}));
