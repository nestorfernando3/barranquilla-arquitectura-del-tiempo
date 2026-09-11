/**
 * Capa de datos históricos y volumétricos.
 * Cada afirmación lleva un nivel de certeza:
 *  - verificado:  documentado en fuentes citadas
 *  - aproximado:  coherente con bibliografía general, pendiente de verificación puntual
 *  - hipotesis:   hipótesis de trabajo, requiere fuente primaria
 * Ver `src/components/Sources.tsx` y README.md para la lista de pendientes.
 */

export type EraId = "fluvial" | "republica" | "deco" | "moderna" | "memoria";

export const ERAS: Record<EraId, { label: string; range: string; color: string }> = {
  fluvial: { label: "Origen fluvial y ferroviario", range: "1842–1902", color: "#4fa3a8" },
  republica: { label: "República, comercio y puerto", range: "1903–1929", color: "#c1572f" },
  deco: { label: "Art déco, aviación y Prado", range: "1930–1949", color: "#e3b23c" },
  moderna: { label: "Modernismo y ciudad institucional", range: "1950–1984", color: "#8ea3b8" },
  memoria: { label: "Memoria y transformación", range: "1985–hoy", color: "#d8d0bd" },
};

export const ERA_ORDER: EraId[] = ["fluvial", "republica", "deco", "moderna", "memoria"];

export type Certainty = "verificado" | "aproximado" | "hipotesis";

export type EvidenceLevel = "documentado" | "inferido" | "evocativo" | "desconocido";

export const EVIDENCE_META: Record<EvidenceLevel, { label: string; description: string }> = {
  documentado: { label: "Documentado", description: "Respaldado por plano, levantamiento o fotografía verificable." },
  inferido: { label: "Inferido", description: "Reconstruido por tipología o fuentes parciales; no es una medición." },
  evocativo: { label: "Evocativo", description: "Recurso editorial que expresa memoria sin afirmar geometría." },
  desconocido: { label: "Desconocido", description: "No hay evidencia suficiente y la forma se mantiene ausente." },
};

export const PRODUCTION_STAGES = [
  "inventario",
  "fuentes",
  "campo",
  "massing",
  "modelo_l1",
  "modelo_l2",
  "revisado",
  "publicable",
] as const;

export type ProductionStage = (typeof PRODUCTION_STAGES)[number];

export const CERTAINTY_META: Record<Certainty, { icon: string; label: string }> = {
  verificado: { icon: "✓", label: "Dato verificado en fuentes citadas" },
  aproximado: { icon: "◍", label: "Dato aproximado — en proceso de verificación documental" },
  hipotesis: { icon: "?", label: "Hipótesis de trabajo — requiere fuente primaria" },
};

export type MaterialKind =
  | "piedra"
  | "ladrillo"
  | "stucco"
  | "concreto"
  | "metal"
  | "madera"
  | "vidrio"
  | "teja"
  | "pasto";

export const MATERIAL_COLORS: Record<MaterialKind, string> = {
  piedra: "#cfc6b2",
  ladrillo: "#b3653f",
  stucco: "#d9cfae",
  concreto: "#9aa0a6",
  metal: "#667584",
  madera: "#8a6844",
  vidrio: "#3f7f86",
  teja: "#4a5560",
  pasto: "#5f7350",
};

export const MATERIAL_LABEL: Record<MaterialKind, string> = {
  piedra: "Piedra / mampostería",
  ladrillo: "Ladrillo",
  stucco: "Estuco / pañete",
  concreto: "Concreto armado",
  metal: "Metal",
  madera: "Madera",
  vidrio: "Vidrio / agua",
  teja: "Cubierta",
  pasto: "Jardín",
};

export type Zone = "acceso" | "social" | "servicio" | "circulacion" | "intimo";

export const ZONE_COLORS: Record<Zone, string> = {
  acceso: "#e3b23c",
  social: "#4fa3a8",
  servicio: "#8ea3b8",
  circulacion: "#cfc6b2",
  intimo: "#d96b43",
};

export const ZONE_LABEL: Record<Zone, string> = {
  acceso: "Acceso y umbral",
  social: "Vida pública / social",
  servicio: "Servicio y estructura",
  circulacion: "Circulación",
  intimo: "Ámbito privado",
};

export type BoxSpec = {
  /** centro */
  p: [number, number, number];
  /** tamaño */
  s: [number, number, number];
  m: MaterialKind;
  label?: string;
  zone?: Zone;
  r?: [number, number, number];
  /** Procedencia de la forma; hereda el valor del edificio si se omite. */
  evidence?: EvidenceLevel;
  citationIds?: string[];
};

export type FragmentProfile = {
  axis: "x" | "y" | "z";
  spread: number;
  twist?: number;
};

export type Source = {
  id?: string;
  title?: string;
  /** Campo heredado mientras se completa la migración bibliográfica. */
  label?: string;
  institution?: string;
  author?: string;
  date?: string;
  url?: string;
  pages?: string;
  accessedAt?: string;
  license?: string;
  kind: string;
  supports?: string[];
  note?: string;
};

export type BuildingStatus = "en-pie" | "transformado" | "perdido";

export type Model3DAsset = {
  url: string;
  evidence: EvidenceLevel;
  credit: string;
  note: string;
  rotation?: [number, number, number];
  targetSize?: number;
};

export const STATUS_META: Record<BuildingStatus, { label: string; color: string }> = {
  "en-pie": { label: "En pie", color: "#4fa3a8" },
  transformado: { label: "Transformado", color: "#e3b23c" },
  perdido: { label: "Perdido / desaparecido", color: "#c1572f" },
};

export type Building = {
  id: string;
  slug: string;
  name: string;
  historicalNames?: string[];
  lat: number;
  lon: number;
  latlonCertainty: Certainty;
  mapPos: [number, number];
  sector: string;
  era: EraId;
  year?: string;
  yearCertainty?: Certainty;
  architect?: string;
  architectCertainty?: Certainty;
  architecturalStyle?: string;
  originalUse?: string;
  currentUse?: string;
  status: BuildingStatus;
  statusNote?: string;
  summary: string;
  narrative: string;
  themes: string[];
  related: string[];
  sources: Source[];
  model3d?: Model3DAsset;
  fragmentStory: string;
  layers: { forma: string; material: string; funcion: string; ciudad: string; memoria: string };
  massing: {
    defaultEvidence: EvidenceLevel;
    boxes: BoxSpec[];
    profile: FragmentProfile;
    extras?: string[];
    context?: BoxSpec[];
  };
  productionStage: ProductionStage;
};

/* ============================================================
 * EDIFICIOS — inventario vivo con madurez y evidencia explícitas
 * ============================================================ */

export const BUILDINGS: Building[] = [
  {
    id: "aduana",
    slug: "antigua-aduana",
    name: "Antigua Aduana",
    historicalNames: ["Aduana Nacional de Barranquilla", "Edificio de la Aduana"],
    lat: 10.9921,
    lon: -74.7969,
    latlonCertainty: "aproximado",
    mapPos: [252, 428],
    sector: "Centro Histórico · frente fluvial",
    era: "republica",
    year: "Construida entre 1919 y 1921",
    yearCertainty: "verificado",
    architect: "Leslie O. Arbouin (planos y dirección técnica)",
    architectCertainty: "verificado",
    architecturalStyle: "Neoclásico republicano",
    originalUse: "Aduana nacional y control portuario",
    currentUse: "Equipamiento cultural y administrativo (tras restauración)",
    status: "transformado",
    statusNote: "Restaurada en las últimas décadas; cambió su función portuaria por usos culturales.",
    summary:
      "La puerta fiscal del río: por aquí entraron —y se registraron— las mercancías y las migraciones que hicieron moderna a Barranquilla.",
    narrative:
      "Antes de los contenedores y los muelles de aguas profundas, Barranquilla era un mostrador sobre el Magdalena. La Antigua Aduana ordenaba ese caos fértil: allí se pesaba, se sellaba y se tasaba todo lo que llegaba río arriba desde Bocas de Ceniza. Su fachada neoclásica —arcadas, simetría, pórtico con frontón— no era vanidad: era la imagen del Estado nacional plantada frente al agua, una promesa de orden sobre el bullicio del puerto. Alrededor suyo creció una ciudad de agentes, estibadores, comerciantes e intérpretes. Cuando el puerto perdió su centralidad, el edificio pudo desaparecer; en cambio se restauró y cambió de oficio. Hoy es equipamiento cultural: la misma fachada que vigilaba mercancías ahora recibe visitantes. Cambió el sello, no la función de umbral.",
    themes: ["río", "puerto", "Estado", "migración", "restauración"],
    related: ["intendencia-fluvial", "estacion-montoya"],
    sources: [
      {
        id: "banrep-paisaje-aereo-aduana",
        title: "Reseña de Barranquilla. Paisaje aéreo. Memoria recuperada de una ciudad pionera",
        institution: "Banco de la República",
        date: "2026",
        url: "https://publicaciones.banrepcultural.org/index.php/boletin_cultural/article/download/21417/21629/42471",
        accessedAt: "2026-07-29",
        kind: "académico",
        supports: ["fecha", "declaratoria patrimonial", "contexto urbano"],
      },
      {
        id: "wikipedia-complejo-aduana",
        title: "Complejo Cultural de la Antigua Aduana",
        institution: "Wikipedia (es)",
        url: "https://es.wikipedia.org/wiki/Complejo_Cultural_de_la_Antigua_Aduana",
        accessedAt: "2026-08-22",
        license: "CC BY-SA 4.0",
        kind: "enciclopédico",
        supports: ["construcción 1919–1921", "planos y dirección técnica de Leslie O. Arbouin", "monumento nacional 1984", "restauración 1993–1994"],
      },
      { label: "Ministerio de Cultura — registros de bienes de interés cultural", kind: "institucional", note: "Completar resolución y ficha individual" },
      { label: "Archivo Histórico del Atlántico — planos y fotografías", kind: "archivo", note: "Pendiente de consulta para validar geometría" },
    ],
    model3d: {
      url: "/models/antigua-aduana.glb",
      evidence: "inferido",
      credit: "Modelo procedural L2 (modelgen); fotos de referencia de Felipe Restrepo Acosta y Jdvillalobos (CC BY-SA 4.0), Wikimedia Commons.",
      note: "Reconstrucción interpretativa desde fotografía pública; cuerpo largo, pórtico con frontón y pabellón de cúpula documentados visualmente. Interior y fachada al río inferidos.",
      targetSize: 4.8,
    },
    fragmentStory:
      "Fragmentación horizontal en estratos: la arcada se separa del cuerpo noble y la torre para mostrar que la Aduana era, ante todo, una máquina de flujo: muelle abajo, representación arriba.",
    layers: {
      forma: "Volumen alargado paralelo al río, con pórtico columnado y frontón triangular, y un pabellón esquinero cupulado como hito visual. La simetría neoclásica comunica autoridad.",
      material: "Mampostería pañetada y pintada; carpinterías de madera en puertas y ventanas altas; cubiertas de estructura metálica en las crujías de depósito.",
      funcion: "Planta baja: registro, bodegas y paso de mercancías. Planta alta: oficinas fiscales. El cuerpo noble concentraba la representación institucional.",
      ciudad: "Marca el borde entre el río y la ciudad: con la Intendencia Fluvial y los muelles formaba el sistema portuario del que dependía toda la economía regional.",
      memoria: "Es uno de los símbolos de la recuperación del frente fluvial: su restauración la convirtió en ancla de la memoria portuaria de Barranquilla.",
    },
    massing: {
      defaultEvidence: "inferido",
      boxes: [
        { p: [0, 0.3, 0.95], s: [4.6, 0.6, 0.45], m: "piedra", label: "Arcada del muelle", zone: "servicio" },
        { p: [-1.65, 0.85, 0], s: [1.3, 0.5, 1.5], m: "stucco", label: "Ala oeste · bodegas", zone: "servicio" },
        { p: [1.65, 0.85, 0], s: [1.3, 0.5, 1.5], m: "stucco", label: "Ala este · bodegas", zone: "servicio" },
        { p: [0, 0.85, 0], s: [2.1, 0.7, 1.5], m: "piedra", label: "Cuerpo noble", zone: "social" },
        { p: [0, 1.35, 0], s: [1.15, 1.5, 1.15], m: "piedra", label: "Cuerpo central elevado", zone: "acceso" },
        { p: [0, 2.25, 0], s: [0.55, 0.4, 0.55], m: "metal", label: "Templete cupulado y veleta", zone: "circulacion" },
        { p: [0, 1.28, 0], s: [4.75, 0.14, 1.65], m: "teja", zone: "servicio" },
        { p: [0, 1.02, 0.82], s: [1.7, 0.42, 0.14], m: "piedra", label: "Frontón", zone: "acceso" },
      ],
      profile: { axis: "y", spread: 1.5 },
      extras: ["plaza"],
      context: [
        { p: [-3.4, 0.35, 1.4], s: [1.6, 0.7, 0.9], m: "concreto" },
        { p: [3.3, 0.3, 1.6], s: [1.8, 0.6, 0.8], m: "concreto" },
        { p: [0.5, 0.2, 2.6], s: [3.4, 0.4, 0.6], m: "madera" },
      ],
    },
    productionStage: "modelo_l2",
  },

  {
    id: "prado",
    slug: "hotel-el-prado",
    name: "Hotel El Prado",
    historicalNames: ["Hotel Prado"],
    lat: 11.005,
    lon: -74.808,
    latlonCertainty: "aproximado",
    mapPos: [592, 186],
    sector: "El Prado",
    era: "deco",
    year: "Inaugurado en 1930",
    yearCertainty: "verificado",
    architect: "Burdette Higgins",
    architectCertainty: "verificado",
    architecturalStyle: "Eclecticismo tardío con rasgos neocoloniales y modernos",
    originalUse: "Hotel de lujo y club social",
    currentUse: "Hotel (tras ampliaciones y transformaciones)",
    status: "transformado",
    statusNote: "Ha tenido ampliaciones sucesivas; el núcleo original de 1930 subsiste transformado.",
    summary:
      "El hotel que inventó una forma de habitar el trópico: piscinas, jardines, ventilación cruzada y vida social bajo el sol de Barranquilla.",
    narrative:
      "El Prado no fue solo un barrio: fue una idea importada y aclimatada. Urbanizado desde los años veinte alrededor de avenidas arboladas y lotes amplios, propuso vivir el trópico de otra manera —jardín delantero, portal sombreado, patio que respira—. Su hotel, inaugurado en 1930, fue la vitrina de esa idea: un edificio de alas extendidas alrededor de una piscina que se volvió leyenda urbana. Allí no solo dormían viajeros; allí se negociaba, se celebraba y se estrenaba la modernidad doméstica de la ciudad: agua corriente, hielo, ventilación cruzada, automóviles bajo la marquesina. El Prado enseñó que el clima no se combate con muros gruesos sino con sombra, aire y agua. Esa lección —patio, brisa, jardín— sigue siendo la arquitectura más sensata del Caribe.",
    themes: ["urbanización", "vivienda", "clima", "vida social", "modernización doméstica"],
    related: ["estadio-romelio-martinez", "bellas-artes"],
    sources: [
      {
        id: "banrep-urbanizacion-el-prado",
        title: "Urbanización El Prado en Barranquilla: Karl Parrish",
        author: "Carlos Arturo Bell Lemus",
        institution: "Banco de la República",
        url: "https://www.banrepcultural.org/biblioteca-virtual/credencial-historia/numero-114/urbanizacion-el-prado-en-barranquilla-karl-parrish",
        accessedAt: "2026-07-29",
        kind: "académico",
        supports: ["urbanización", "periodo", "contexto urbano"],
      },
      {
        id: "banrep-fabrica-obregon-hotel-prado",
        title: "La Fábrica de Tejidos Obregón de Barranquilla",
        institution: "Banco de la República",
        url: "https://repositorio.banrep.gov.co/bitstream/handle/20.500.12134/6599/CL_7.pdf",
        accessedAt: "2026-07-29",
        kind: "académico",
        supports: ["autoría", "fecha", "promotores"],
      },
      { label: "Hemeroteca El Heraldo — avisos y crónicas de la inauguración", kind: "hemerográfico", note: "Pendiente de consulta puntual" },
    ],
    model3d: {
      url: "/models/hotel-el-prado.glb",
      evidence: "inferido",
      credit:
        "Modelo procedural L2 (modelgen); fotos de referencia de Jdvillalobos (CC BY-SA 4.0; una foto en dominio público), Wikimedia Commons.",
      note: "Reconstrucción interpretativa desde fotografía pública y volumetría curatorial; torre central, alas en U con arquerías hacia el patio y piscina documentados visualmente. Interiores, ampliaciones posteriores y remates decorativos inferidos.",
      targetSize: 4.8,
    },
    fragmentStory:
      "Fragmentación en planta: las alas se deslizan hacia afuera como piezas de un mueble, revelando el vacío central —la piscina y el jardín— que es el verdadero corazón del proyecto.",
    layers: {
      forma: "Composición en U/H de alas bajas alrededor de un vacío central. La horizontalidad manda: el edificio se extiende en el terreno en lugar de imponerse.",
      material: "Muros pañetados y pintados, carpintería de madera, teja y losa; la piscina introduce el agua como material de confort y de espectáculo.",
      funcion: "Habitaciones en las alas, salones y servicios en el cuerpo central, piscina y jardines como sala al aire libre. El umbral —marquesina, portal— media entre calle e intimidad.",
      ciudad: "Corona el barrio-jardín que redefinió el norte de la ciudad: calles arboladas, retiros, vegetación. El Prado desplazó el centro de gravedad urbano hacia el norte.",
      memoria: "La piscina del Prado es memoria afectiva colectiva: generaciones enteras aprendieron allí a nadar y a veranear sin salir de la ciudad.",
    },
    massing: {
      defaultEvidence: "inferido",
      boxes: [
        { p: [0, 0.9, 0], s: [3.2, 1.8, 1.1], m: "stucco", label: "Cuerpo central · salones", zone: "social" },
        { p: [-2.1, 0.75, 0.5], s: [1.1, 1.5, 2.3], m: "stucco", label: "Ala norte · habitaciones", zone: "intimo" },
        { p: [2.1, 0.75, 0.5], s: [1.1, 1.5, 2.3], m: "stucco", label: "Ala sur · habitaciones", zone: "intimo" },
        { p: [0, 0.75, 1.85], s: [3.2, 1.5, 0.85], m: "stucco", label: "Ala posterior", zone: "intimo" },
        { p: [0, 0.07, 0.35], s: [1.9, 0.14, 0.8], m: "vidrio", label: "Piscina — corazón social", zone: "social" },
        { p: [0, 0.5, -0.78], s: [1.5, 0.1, 0.55], m: "metal", label: "Marquesina de acceso", zone: "acceso" },
        { p: [0, 1.95, 0], s: [1.4, 0.35, 0.8], m: "stucco", label: "Remate central", zone: "circulacion" },
      ],
      profile: { axis: "x", spread: 1.7 },
      extras: ["gardens", "plaza"],
      context: [
        { p: [-3.4, 0.35, -0.6], s: [0.9, 0.7, 0.9], m: "stucco" },
        { p: [3.5, 0.35, -0.5], s: [0.9, 0.7, 0.9], m: "stucco" },
        { p: [0, 0.3, -1.9], s: [1.1, 0.6, 0.8], m: "stucco" },
      ],
    },
    productionStage: "modelo_l2",
  },

  {
    id: "garcia",
    slug: "edificio-garcia",
    name: "Edificio García",
    historicalNames: ["Almacén García"],
    lat: 10.9976,
    lon: -74.7913,
    latlonCertainty: "aproximado",
    mapPos: [472, 360],
    sector: "Centro · Paseo Bolívar",
    era: "deco",
    year: "c. 1939",
    yearCertainty: "aproximado",
    architect: "Atribución por verificar",
    architectCertainty: "hipotesis",
    architecturalStyle: "Art déco",
    originalUse: "Comercio y oficinas",
    currentUse: "Comercio y oficinas",
    status: "en-pie",
    statusNote: "Conserva su volumetría; intervenido en fachada y bajos comerciales a lo largo del tiempo.",
    summary:
      "La vertical del Paseo Bolívar: un almacén que quiso ser rascacielos y se volvió el ícono déco de la ciudad.",
    narrative:
      "Cuando Barranquilla se descubrió moderna —aviones sobre el río, radio en las esquinas, vitrinas encendidas— quiso edificios a la altura del vértigo. El García respondió con geometría: una torre esquinera escalonada, aletas verticales que aceleran la mirada hacia arriba, una marquesina que anuncia el comercio como espectáculo. El art déco local no copiaba a Miami: traducía el optimismo de una ciudad-puerto que se sabía conectada con el mundo. En sus bajos se compraba lo último; en sus oficinas se firmaba lo próximo. Con el tiempo el Paseo Bolívar cambió de ritmo y el edificio envejeció entre avisos y capas de pintura, pero su silueta siguió siendo el punto de referencia del centro. Restaurar el García no es devolverlo a 1939: es negociar entre la postal y la calle viva que nunca dejó de trabajar.",
    themes: ["art déco", "comercio", "verticalidad", "modernidad", "centro histórico"],
    related: ["edificio-scadta", "teatro-colon", "banco-dugand"],
    sources: [
      {
        id: "alcaldia-ruta-arquitectonica-garcia",
        title: "Ruta Arquitectónica — Edificio García",
        institution: "Alcaldía de Barranquilla",
        url: "https://aotronivel.barranquilla.gov.co/lugares/rutas-patrimoniales/ruta-arquitectonica",
        accessedAt: "2026-07-29",
        kind: "institucional",
        supports: ["existencia", "ubicación", "valor histórico"],
      },
      {
        id: "wikimedia-garcia-2008",
        title: "Barranquilla Edificio García",
        institution: "Wikimedia Commons",
        author: "Jdvillalobos",
        date: "2008-06-17",
        url: "https://commons.wikimedia.org/wiki/File:Barranquilla_Edificio_Garc%C3%ADa.jpg",
        accessedAt: "2026-07-29",
        license: "Dominio público",
        kind: "fotográfico",
        supports: [
          "volumetría visible",
          "fachadas visibles",
          "balcones",
          "esquina curva",
          "referencia para reconstrucción 3D",
        ],
        note: "Las fachadas ocultas y la cubierta no quedan documentadas por esta única vista.",
      },
      { label: "Ministerio de Cultura — inventarios de patrimonio del Centro Histórico", kind: "institucional", note: "Verificar nivel de protección" },
      { label: "Hemeroteca El Heraldo — crónicas comerciales del Paseo Bolívar", kind: "hemerográfico", note: "Pendiente de consulta puntual" },
    ],
    model3d: {
      url: "/models/edificio-garcia.glb",
      evidence: "evocativo",
      credit: "Modelo procedural L2 (modelgen); referencias de Jdvillalobos en dominio público, Wikimedia Commons.",
      note: "Reconstrucción procedural interpretativa desde dos fotografías públicas; las fachadas ocultas, la cubierta y los interiores permanecen inferidos. La malla Hunyuan3D anterior se conserva únicamente como archivo y no se muestra.",
      targetSize: 4.8,
    },
    fragmentStory:
      "Fragmentación vertical: los cuerpos se apilan y separan como cajas de una torre de embalaje, revelando la estrategia déco —podio comercial, cuerpo medio, torre esquinera, coronación—.",
    layers: {
      forma: "Volumetría escalonada con torre en la esquina del Paseo Bolívar. Las aletas verticales ritman la fachada y dirigen la mirada al cielo: verticalidad como programa.",
      material: "Concreto armado y pañete liso; carpinterías metálicas; la decoración es geométrica y está dibujada en el propio muro, no aplicada.",
      funcion: "Bajos comerciales hacia el paseo —la vitrina—, oficinas en altura, circulaciones verticales en el núcleo. El comercio financia la torre.",
      ciudad: "Ancla del eje comercial del Paseo Bolívar, junto a teatros, bancos y almacenes que hicieron del centro un salón urbano de aceras llenas.",
      memoria: "Generaciones citan su esquina como punto de encuentro. El García es de los pocos edificios que la memoria colectiva dibuja de silueta, sin necesidad de fotografía.",
    },
    massing: {
      defaultEvidence: "inferido",
      boxes: [
        { p: [0, 0.45, 0], s: [2.3, 0.9, 1.8], m: "concreto", label: "Podio comercial", zone: "social" },
        { p: [0, 1.3, 0], s: [1.85, 0.85, 1.5], m: "concreto", label: "Cuerpo de oficinas", zone: "social" },
        { p: [-0.55, 2.15, 0], s: [0.95, 1.35, 1.05], m: "concreto", label: "Torre esquinera", zone: "circulacion" },
        { p: [-0.55, 3.0, 0], s: [0.6, 0.45, 0.62], m: "concreto", label: "Retroceso escalonado", zone: "circulacion" },
        { p: [-0.55, 3.42, 0], s: [0.32, 0.4, 0.34], m: "metal", label: "Coronación", zone: "acceso" },
        { p: [-1.0, 1.75, -0.78], s: [0.1, 2.6, 0.1], m: "metal", label: "Aleta vertical", zone: "servicio" },
        { p: [-0.55, 1.75, -0.95], s: [0.1, 2.6, 0.1], m: "metal", zone: "servicio" },
        { p: [-0.1, 1.75, -0.78], s: [0.1, 2.6, 0.1], m: "metal", zone: "servicio" },
        { p: [0.7, 0.14, -1.0], s: [1.3, 0.08, 0.4], m: "metal", label: "Marquesina sobre el Paseo", zone: "acceso" },
      ],
      profile: { axis: "y", spread: 1.25, twist: 0.12 },
      extras: ["plaza"],
      context: [
        { p: [2.2, 0.5, 0.3], s: [1.2, 1.0, 1.4], m: "stucco" },
        { p: [-2.3, 0.45, 0.2], s: [1.1, 0.9, 1.3], m: "stucco" },
        { p: [0.4, 0.55, 2.0], s: [1.6, 1.1, 1.0], m: "concreto" },
      ],
    },
    productionStage: "modelo_l2",
  },

  /* ---------------- preparados (masa + datos, ficha simplificada) ---------------- */

  {
    id: "montoya",
    slug: "estacion-montoya",
    name: "Estación Montoya",
    historicalNames: ["Estación del Ferrocarril de Bolívar", "Estación Ferroviaria Francisco Montoya Zapata"],
    lat: 10.9875,
    lon: -74.801,
    latlonCertainty: "aproximado",
    mapPos: [302, 518],
    sector: "Barrio Abajo · borde fluvial",
    era: "fluvial",
    year: "Inaugurada en 1871",
    yearCertainty: "verificado",
    architect: "Por documentar",
    architectCertainty: "hipotesis",
    architecturalStyle: "Arquitectura ferroviaria industrial",
    originalUse: "Estación de pasajeros y carga del ferrocarril",
    currentUse: "Equipamiento cultural",
    status: "transformado",
    statusNote: "Servicio ferroviario suspendido en 1940; monumento nacional (1984 y 1996); restaurada en 1999 dentro del complejo cultural de la Antigua Aduana.",
    summary:
      "El andén donde Barranquilla aprendió la velocidad: el tren traía el café del interior y se llevaba las noticias del mundo.",
    narrative:
      "Antes del avión existió el riel. El Ferrocarril de Bolívar, entre los primeros del país, ató a Barranquilla con el puerto de Sabanilla y luego con Puerto Colombia: un cordón de acero por donde entraron máquinas, tipografías, modas y migrantes, y salió el café del Magdalena Grande. La estación era el rito del viaje: reloj, andén, silbato, equipajes con etiquetas de ultramar. Cuando el tren calló, el edificio quedó como un animal varado junto al río. Su rescate para la cultura reconoció lo que siempre fue: una infraestructura de conexión. Leer la estación es leer la primera globalización de la ciudad —más lenta que un avión, más profunda que un correo.",
    themes: ["ferrocarril", "infraestructura", "comercio exterior", "Barrio Abajo"],
    related: ["antigua-aduana", "intendencia-fluvial"],
    sources: [
      {
        id: "colombia-travel-estacion-montoya",
        title: "Descubre la Estación Montoya",
        institution: "Colombia Travel — ProColombia",
        url: "https://colombia.travel/es/barranquilla/descubre-la-estacion-montoya",
        accessedAt: "2026-07-29",
        kind: "institucional",
        supports: ["fecha", "función histórica", "contexto ferroviario"],
      },
      {
        id: "wikipedia-estacion-montoya",
        title: "Estación Montoya",
        institution: "Wikipedia (es)",
        url: "https://es.wikipedia.org/wiki/Estaci%C3%B3n_Montoya",
        accessedAt: "2026-08-22",
        license: "CC BY-SA 4.0",
        kind: "enciclopédico",
        supports: ["inauguración 20-sep-1871", "construcción por Railway & Pier Company", "materialidad (ladrillo blanco, hierro forjado inglés, frontón triangular)", "monumento nacional 1984/1996", "restauración 1999"],
      },
      { label: "Alcaldía de Barranquilla — equipamientos culturales", kind: "institucional" },
    ],
    model3d: {
      url: "/models/estacion-montoya.glb",
      evidence: "inferido",
      credit: "Modelo procedural L2 (modelgen); foto de referencia de Jdvillalobos (CC BY 3.0, Wikimedia Commons).",
      note: "Reconstrucción interpretativa desde fotografía pública y volumetría curatorial; interiores, fachada posterior y cubierta interior inferidos.",
      targetSize: 4.8,
    },
    fragmentStory: "Capas en sección: cubierta, nave y andén se separan como un corte técnico del ferrocarril.",
    layers: {
      forma: "Volumen compacto de dos plantas con esquinas ochavadas y balaustrada superior: arquitectura ferroviaria de raíz antillana, pensada para el flujo del andén.",
      material: "Mampostería y bloques de argamasa de ladrillo claro con sillería en esquinas; carpinterías verdes; balcones y barandas de hierro forjado inglés; cubierta de teja sobre estructura de madera.",
      funcion: "Sala de pasajeros, oficinas de telégrafo y despacho, bodegas de carga hacia los patios.",
      ciudad: "Nodo del sistema intermodal río–riel–mar que hizo de Barranquilla la puerta de Colombia.",
      memoria: "El silbato del tren sigue siendo sonido de archivo en la memoria del Barrio Abajo.",
    },
    massing: {
      defaultEvidence: "inferido",
      boxes: [
        { p: [0, 0.55, 0], s: [3.4, 1.1, 1.2], m: "ladrillo", label: "Nave de pasajeros", zone: "social" },
        { p: [0, 1.22, -0.3], s: [3.6, 0.08, 0.9], m: "metal", r: [-0.5, 0, 0], zone: "servicio" },
        { p: [0, 1.22, 0.3], s: [3.6, 0.08, 0.9], m: "metal", r: [0.5, 0, 0], zone: "servicio" },
        { p: [0, 1.46, 0], s: [3.6, 0.07, 0.07], m: "metal", zone: "servicio" },
        { p: [0, 0.14, 1.15], s: [3.8, 0.28, 0.75], m: "madera", label: "Andén", zone: "circulacion" },
        { p: [-1.15, 0.72, -0.25], s: [0.95, 1.45, 0.8], m: "ladrillo", label: "Telégrafo y oficinas", zone: "servicio" },
      ],
      profile: { axis: "z", spread: 1.2 },
      extras: ["rails"],
      context: [{ p: [2.8, 0.35, -1.4], s: [1.4, 0.7, 1.0], m: "ladrillo" }],
    },
    productionStage: "modelo_l2",
  },

  {
    id: "intendencia-fluvial",
    slug: "intendencia-fluvial",
    name: "Intendencia Fluvial",
    historicalNames: ["Edificio de la Intendencia Fluvial"],
    lat: 10.9945,
    lon: -74.7985,
    latlonCertainty: "aproximado",
    mapPos: [238, 332],
    sector: "Centro Histórico · frente fluvial",
    era: "republica",
    year: "Inaugurada en 1935",
    yearCertainty: "verificado",
    architect: "Por documentar",
    architectCertainty: "hipotesis",
    architecturalStyle: "Republicano con galerías",
    originalUse: "Administración y control de la navegación fluvial",
    currentUse: "Sede de la Secretaría de Cultura, Patrimonio y Turismo",
    status: "transformado",
    summary:
      "La oficina del río: desde sus galerías se vigilaban vapores, mareas de carga y el pulso del Magdalena.",
    narrative:
      "Si la Aduana era la caja del puerto, la Intendencia Fluvial era su cerebro operativo: allí se registraban embarcaciones, se ordenaban atraques, se medía el río como se mide un socio impredecible. Su arquitectura era la de un trabajo continuo: galerías sombreadas para mirar el agua sin quemarse, oficinas frescas, una torre para ver más lejos que los demás. El edificio pertenece a la familia de instituciones que hicieron del Magdalena una carretera nacional. Cuando la navegación decayó, estas paredes guardaron el silencio de los muelles vacíos. Su futuro, como el del río, sigue en discusión: museo, oficina, ruina restaurada. Toda opción es también una respuesta a la pregunta por el frente fluvial.",
    themes: ["río", "navegación", "instituciones", "frente fluvial"],
    related: ["antigua-aduana", "estacion-montoya"],
    sources: [
      {
        id: "alcaldia-intendencia-81-anos",
        title: "En sus 81 años, la Intendencia Fluvial vive la cultura",
        institution: "Alcaldía de Barranquilla",
        date: "2016-06-15",
        url: "https://barranquilla.gov.co/cultura/en-sus-81-anos-la-intendencia-fluvial-vive-la-cultura",
        accessedAt: "2026-07-29",
        kind: "institucional",
        supports: ["fecha", "uso actual", "restauración", "valor patrimonial"],
      },
      { label: "Archivo Histórico del Atlántico", kind: "archivo", note: "Pendiente de consulta" },
    ],
    model3d: {
      url: "/models/intendencia-fluvial.glb",
      evidence: "inferido",
      credit: "Modelo procedural L2 (modelgen); fotos de referencia de Felipe Restrepo Acosta y Jdvillalobos (CC BY-SA 4.0) y Fvengoechea (CC BY-SA 3.0), Wikimedia Commons.",
      note: "Reconstrucción interpretativa desde fotografía pública y volumetría curatorial; la torre de control del massing original no aparece en las fuentes visuales actuales.",
      targetSize: 4.8,
    },
    fragmentStory: "Estratos horizontales: galería, cuerpo y torre se apilan mostrando la jerarquía entre mirar el río y administrarlo.",
    layers: {
      forma: "Cuerpo alargado con galería hacia el río y torre de vigilancia: ver y registrar eran la misma arquitectura.",
      material: "Mampostería pañetada, madera en galerías y entrepisos, cubierta metálica ligera.",
      funcion: "Oficinas de registro fluvial, sala de capitanes, torre de control visual del tráfico.",
      ciudad: "Pieza del sistema portuario junto a la Aduana y los muelles: el Estado frente al agua.",
      memoria: "Testigo del auge y la decadencia de la navegación por el Magdalena.",
    },
    massing: {
      defaultEvidence: "inferido",
      boxes: [
        { p: [0, 0.5, 0], s: [3.0, 1.0, 1.1], m: "stucco", label: "Cuerpo de oficinas", zone: "social" },
        { p: [0, 0.32, 0.78], s: [3.0, 0.64, 0.38], m: "madera", label: "Galería al río", zone: "circulacion" },
        { p: [1.1, 1.25, 0], s: [0.72, 1.5, 0.8], m: "stucco", label: "Torre de control", zone: "servicio" },
        { p: [0, 1.06, 0], s: [3.1, 0.1, 1.25], m: "metal", zone: "servicio" },
      ],
      profile: { axis: "y", spread: 1.0 },
      extras: ["plaza"],
    },
    productionStage: "modelo_l2",
  },

  {
    id: "scadta",
    slug: "edificio-scadta",
    name: "Edificio Scadta",
    historicalNames: ["Edificio de la Sociedad Colombo-Alemana de Transporte Aéreo"],
    lat: 10.996,
    lon: -74.7895,
    latlonCertainty: "aproximado",
    mapPos: [524, 330],
    sector: "Centro",
    era: "deco",
    year: "Construido en 1935",
    yearCertainty: "verificado",
    architect: "Manuel Carrerá",
    architectCertainty: "verificado",
    architecturalStyle: "Art déco streamline",
    originalUse: "Oficinas de la aerolínea",
    currentUse: "Por verificar",
    status: "en-pie",
    summary:
      "La sede de la aviación pionera: donde SCADTA convirtió a Barranquilla en la primera ciudad aerocomercial de América.",
    narrative:
      "En 1919 Barranquilla vio despegar algo más que aviones: vio una idea —que la distancia era negociable. SCADTA, la sociedad colombo-alemana de transporte aéreo, hizo del río una pista y de la ciudad su base continental. Su edificio debía parecerse a esa promesa: esquinas curvas como fuselajes, bandas horizontales como estelas, una torre para mirar el cielo. El streamline no era moda aquí: era retrato de una empresa que llevaba correo al interior del país antes de que existieran las carreteras. La ciudad que hablaba alemán en sus talleres y costeño en sus hangares aprendió a pensarse como nodo de un mapa más grande. El edificio quedó como firma de esa ambición.",
    themes: ["aviación", "SCADTA", "art déco", "modernidad"],
    related: ["edificio-garcia", "estadio-romelio-martinez"],
    sources: [
      {
        id: "alcaldia-restitucion-scadta",
        title: "Ministerio de Cultura solicita restituir edificio Avianca",
        institution: "Alcaldía de Barranquilla",
        url: "https://barranquilla.gov.co/cultura/ministerio-cultura-solicita-restituir-edificio-avianca",
        accessedAt: "2026-07-29",
        kind: "institucional",
        supports: ["década", "autoría", "estilo", "ubicación", "protección patrimonial"],
      },
      { label: "Historiografía de SCADTA / aviación colombiana", kind: "académico", note: "Verificar atribución y fechas del edificio" },
    ],
    model3d: {
      url: "/models/edificio-scadta.glb",
      evidence: "inferido",
      credit: "Modelo procedural L2 (modelgen); fotos de referencia de Jdvillalobos (CC BY-SA 4.0; foto 2007 en dominio público), Wikimedia Commons.",
      note: "Reconstrucción interpretativa desde fotografía pública y volumetría curatorial; esquina curva, bandas de piso y basamento comercial documentados visualmente. Cubierta, zaga e interiores inferidos.",
      targetSize: 4.8,
    },
    fragmentStory: "Fragmentación longitudinal: el cuerpo streamlined se abre en bandas horizontales, como cortes de un plano aerodinámico.",
    layers: {
      forma: "Volumen aerodinámico con esquina redondeada y remate en torre: la máquina como lenguaje.",
      material: "Concreto y pañete liso; bandas-sombra horizontales; carpinterías metálicas.",
      funcion: "Mostradores de pasajeros y correo, oficinas operativas, torre de despacho.",
      ciudad: "Símbolo del salto aéreo de la ciudad, junto a los hangares y campos de vuelo de la época.",
      memoria: "Memoria de la era pionera de la aviación comercial colombiana.",
    },
    massing: {
      defaultEvidence: "inferido",
      boxes: [
        { p: [0, 0.6, 0], s: [2.0, 1.2, 1.3], m: "concreto", label: "Cuerpo streamline", zone: "social" },
        { p: [0.85, 0.6, -0.42], s: [0.55, 1.2, 0.55], m: "concreto", label: "Esquina curva", zone: "acceso" },
        { p: [-0.6, 1.5, 0.1], s: [0.75, 0.7, 0.75], m: "concreto", label: "Torre de operaciones", zone: "servicio" },
        { p: [0, 0.98, -0.68], s: [2.05, 0.09, 0.06], m: "metal", label: "Banda horizontal", zone: "circulacion" },
        { p: [0, 0.62, -0.68], s: [2.05, 0.09, 0.06], m: "metal", zone: "circulacion" },
        { p: [0, 1.26, 0], s: [2.15, 0.08, 1.4], m: "teja", zone: "servicio" },
      ],
      profile: { axis: "y", spread: 0.95 },
      extras: ["plaza"],
    },
    productionStage: "modelo_l2",
  },

  {
    id: "teatro-colon",
    slug: "teatro-colon",
    name: "Teatro Colón",
    lat: 10.9962,
    lon: -74.7908,
    latlonCertainty: "aproximado",
    mapPos: [432, 402],
    sector: "Centro · Paseo Bolívar",
    era: "deco",
    year: "Diseñado en 1937 (construido c. 1942)",
    yearCertainty: "verificado",
    architect: "Manuel Carrerá",
    architectCertainty: "verificado",
    architecturalStyle: "Art déco teatral",
    originalUse: "Teatro y sala de cine",
    currentUse: "Por verificar",
    status: "transformado",
    summary:
      "La sala donde la ciudad se miró actuar: ópera, cine mudo y estrenos sobre el Paseo Bolívar.",
    narrative:
      "Los teatros del centro fueron las primeras pantallas grandes de Barranquilla. En el Colón la ciudad ensayó su cosmopolitismo: compañías de ópera que llegaban en vapor, cine mudo con pianista, galas donde se estrenaba vestido y opinión. La sala ordenaba la sociedad en plateas y palcos, pero la calle la democratizaba: a la salida, todo el mundo comentaba la misma función bajo los faroles del Paseo. Cuando el cine cambió de formato y el centro cambió de público, el edificio se transformó —como casi todo lo que sobrevive. Su historia es la de una pregunta recurrente: qué hacemos con las salas que nos hicieron, cuando ya no cabemos en sus butacas.",
    themes: ["teatro", "cine", "vida urbana", "Paseo Bolívar"],
    related: ["edificio-garcia", "banco-dugand"],
    sources: [
      {
        id: "alcaldia-ruta-art-deco",
        title: "Recorrido Art Déco",
        institution: "Alcaldía de Barranquilla",
        url: "https://barranquilla.gov.co/descubre/recorridos-por-barranquilla/art-deco",
        accessedAt: "2026-07-29",
        kind: "institucional",
        supports: ["existencia", "ubicación", "inclusión en la ruta art déco"],
      },
      {
        id: "wikipedia-teatro-colon-baq",
        title: "Teatro Colón (Barranquilla)",
        institution: "Wikipedia (es)",
        url: "https://es.wikipedia.org/wiki/Teatro_Col%C3%B3n_(Barranquilla)",
        accessedAt: "2026-08-22",
        license: "CC BY-SA 4.0",
        kind: "enciclopédico",
        supports: ["autoría (Manuel Carrerá)", "diseño en 1937", "estilo art déco", "evocación de carabelas"],
      },
      {
        id: "wikipedia-manuel-carrera",
        title: "Manuel Carrerá",
        institution: "Wikipedia (es)",
        url: "https://es.wikipedia.org/wiki/Manuel_Carrer%C3%A1",
        accessedAt: "2026-08-22",
        license: "CC BY-SA 4.0",
        kind: "enciclopédico",
        supports: ["catálogo de obras de Carrerá en Barranquilla", "Teatro Colón 1942", "Teatro Rex 1935", "Edificio Scadta 1935"],
      },
      { label: "Hemeroteca local — carteleras y crónicas", kind: "hemerográfico", note: "Pendiente de consulta puntual" },
    ],
    model3d: {
      url: "/models/teatro-colon.glb",
      evidence: "inferido",
      credit: "Modelo procedural L2 (modelgen); fotos de referencia de Felipe Restrepo Acosta (CC BY-SA 4.0) y José David Villalobos (CC BY 3.0), Wikimedia Commons.",
      note: "Reconstrucción interpretativa desde fotografía pública y volumetría curatorial; torre lateral, marquesina y muro de bloques de vidrio documentados visualmente. Sala interior y cubierta inferidas.",
      targetSize: 4.8,
    },
    fragmentStory: "Sección teatral: fachada de planos carabelados, sala longitudinal y torre-lámpara se separan como un corte escenográfico.",
    layers: {
      forma: "Fachada-telón sobre el paseo, sala longitudinal profunda y remate superior: el rito del espectáculo dibujado en planta.",
      material: "Mampostería y estructura mixta; yeserías y carpinterías finas en la sala.",
      funcion: "Foyer y boletería al paseo, sala con palcos, escenario y tramoya al fondo.",
      ciudad: "Parte del corredor cultural y comercial que dio vida nocturna al centro.",
      memoria: "Carteleras, estrenos y galas: la memoria afectiva del entretenimiento moderno.",
    },
    massing: {
      defaultEvidence: "inferido",
      boxes: [
        { p: [0, 0.62, 0.1], s: [1.8, 1.24, 2.0], m: "ladrillo", label: "Sala", zone: "social" },
        { p: [0, 0.72, -1.18], s: [2.0, 1.44, 0.35], m: "stucco", label: "Fachada-telón", zone: "acceso" },
        { p: [0, 1.3, -1.42], s: [1.6, 0.12, 0.4], m: "metal", label: "Marquesina", zone: "acceso" },
        { p: [-0.95, 1.15, -1.3], s: [0.5, 2.3, 0.5], m: "stucco", label: "Torre-lámpara lateral", zone: "acceso" },
      ],
      profile: { axis: "z", spread: 1.1 },
    },
    productionStage: "modelo_l2",
  },

  {
    id: "san-nicolas",
    slug: "iglesia-san-nicolas",
    name: "Iglesia de San Nicolás",
    historicalNames: ["Parroquia de San Nicolás de Tolentino"],
    lat: 10.9918,
    lon: -74.7935,
    latlonCertainty: "aproximado",
    mapPos: [398, 496],
    sector: "San Nicolás",
    era: "fluvial",
    year: "Imagen neogótica actual: finales del siglo XIX",
    yearCertainty: "verificado",
    architect: "Por documentar",
    architectCertainty: "hipotesis",
    architecturalStyle: "Neogótico",
    originalUse: "Templo parroquial",
    currentUse: "Culto",
    status: "en-pie",
    summary:
      "La parroquia que le dio nombre y compás a uno de los barrios más vivos de la ciudad.",
    narrative:
      "Antes de los planos de urbanización, los barrios de Barranquilla se ordenaban alrededor de una plaza y una parroquia. San Nicolás es de esas geografías: un campanario que organiza calles, procesiones que marcan el calendario, una feligresía que es también vecindario. Su arquitectura es la de los templos costeños del novecientos: nave única, muros gruesos contra el sol, torre para que el ángel del mediodía suene en todo el barrio. Alrededor creció un San Nicolás de talleres, tiendas y música —cuna de historias del Carnaval y del comercio popular. Leer la iglesia sin su barrio sería leer solo la portada del libro: aquí la arquitectura es capítulo, pero la vida comunitaria es el texto completo.",
    themes: ["religiosidad", "barrio", "vida comunitaria", "Carnaval"],
    related: ["estacion-montoya"],
    sources: [
      {
        id: "mincultura-resolucion-san-nicolas",
        title: "Resolución 1166 de 2005",
        institution: "Ministerio de Cultura",
        date: "2005-07-25",
        url: "https://normograma.mincultura.gov.co/mincultura/compilacion/docs/resolucion_mincultura_1166_2005.htm",
        accessedAt: "2026-07-29",
        kind: "primaria",
        supports: ["cronología de la imagen actual", "estilo", "ubicación", "declaratoria BIC"],
      },
      { label: "Archivos parroquiales y diocesanos", kind: "archivo", note: "Pendiente de consulta para cronología" },
    ],
    model3d: {
      url: "/models/iglesia-san-nicolas.glb",
      evidence: "inferido",
      credit: "Modelo procedural L2 (modelgen); fotos de referencia de Tecsie (CC BY-SA 3.0) y Felipe Restrepo Acosta (CC BY-SA 4.0), Wikimedia Commons.",
      note: "Reconstrucción interpretativa desde fotografía pública; las dos torres de reloj documentadas corrigen el massing previo de torre única. Ornamento gótico simplificado.",
      targetSize: 4.8,
    },
    fragmentStory: "Estratos verticales: nave, torre y remate se elevan en secuencia, como el orden de la procesión.",
    layers: {
      forma: "Nave longitudinal con torre-campanario al frente: la verticalidad del campanario como referencia urbana.",
      material: "Mampostería de cal y canto, cubierta de estructura ligera, carpinterías de madera.",
      funcion: "Nave para el culto, sacristía, torre para campanas y reloj parroquial.",
      ciudad: "Centro simbólico del barrio: la plaza-iglesia como primer urbanismo.",
      memoria: "Bautizos, procesiones y Carnavales: la memoria ritual de San Nicolás.",
    },
    massing: {
      defaultEvidence: "inferido",
      boxes: [
        { p: [0, 0.65, 0.1], s: [1.3, 1.3, 2.3], m: "piedra", label: "Nave", zone: "social" },
        { p: [0, 1.0, -1.28], s: [0.75, 2.0, 0.75], m: "piedra", label: "Torre-campanario", zone: "acceso" },
        { p: [0, 2.15, -1.28], s: [0.55, 0.35, 0.55], m: "piedra", zone: "circulacion" },
        { p: [0, 2.45, -1.28], s: [0.08, 0.5, 0.08], m: "metal", zone: "servicio" },
        { p: [0, 1.42, 0.1], s: [1.45, 0.1, 2.45], m: "teja", zone: "servicio" },
      ],
      profile: { axis: "y", spread: 1.1 },
    },
    productionStage: "modelo_l2",
  },

  {
    id: "bellas-artes",
    slug: "bellas-artes",
    name: "Palacio de Bellas Artes",
    lat: 11.0,
    lon: -74.794,
    latlonCertainty: "aproximado",
    mapPos: [502, 392],
    sector: "Centro norte",
    era: "moderna",
    year: "Mediados del siglo XX",
    yearCertainty: "aproximado",
    architect: "Por documentar",
    architectCertainty: "hipotesis",
    architecturalStyle: "Neocolonial revival (contexto El Prado)",
    originalUse: "Escuela y equipamiento cultural",
    currentUse: "Equipamiento cultural",
    status: "en-pie",
    summary:
      "La escuela donde la ciudad aprendió a dibujarse a sí misma: arte, música y oficios bajo arcadas y cubiertas de teja.",
    narrative:
      "A mitad del siglo veinte, Barranquilla decidió que la cultura también era infraestructura. Bellas Artes materializó esa apuesta con el lenguaje académico del barrio que la acoge: frente simétrico de dos plantas, pórtico columnado, arquerías que filtran la luz y cubiertas de teja contra el sol —la tradición neocolonial que El Prado hizo norma—. No era un templo del arte elevado sobre la calle: era un taller abierto, con patios donde se secaban lienzos y pasillos donde sonaban escalas. Generaciones de artistas costeños se formaron bajo sus arcadas. Su restauración reciente devuelve a la ciudad una pieza clave de esa idea: enseñar arte también es construir ciudad.",
    themes: ["modernismo", "educación artística", "instituciones", "concreto"],
    related: ["hotel-el-prado", "caja-agraria"],
    sources: [
      {
        id: "mincultura-bellas-artes-dotacion",
        title: "El Ministerio de las Culturas apoyará la dotación de la Facultad de Bellas Artes",
        institution: "Ministerio de las Culturas, las Artes y los Saberes",
        url: "https://www.mincultura.gov.co/noticias/Paginas/el-ministerio-de-las-culturas-apoyara-la-dotacion-de-la-facultad-de-bellas-artes-de-la-universidad-del-atlantico.aspx",
        accessedAt: "2026-07-29",
        kind: "institucional",
        supports: ["existencia", "uso", "declaratoria BIC nacional"],
      },
      {
        id: "wikipedia-el-prado",
        title: "El Prado (Barranquilla)",
        institution: "Wikipedia (es)",
        url: "https://es.wikipedia.org/wiki/El_Prado_(Barranquilla)",
        accessedAt: "2026-08-22",
        license: "CC BY-SA 4.0",
        kind: "enciclopédico",
        supports: ["ubicación de la Facultad de Bellas Artes de la U. del Atlántico en El Prado", "estilos originales del barrio (neoclásico, neomediterráneo, neomudéjar)", "BIC del barrio (Resolución 87 de 2005)"],
      },
      { label: "Alcaldía de Barranquilla — equipamientos culturales", kind: "institucional" },
    ],
    model3d: {
      url: "/models/bellas-artes.glb",
      evidence: "inferido",
      credit:
        "Modelo procedural L2 (modelgen); fotos de referencia de Jdvillalobos (CC BY-SA 4.0) y José David Villalobos (CC BY 3.0), Wikimedia Commons.",
      note:
        "Reconstrucción interpretativa desde fotografía pública; pórtico, balconada y cubierta de teja documentados visualmente. El lenguaje neocolonial del edificio —coherente con los estilos originales de El Prado— sustituyó al brief modernista previo tras revisión documental (2026-08-22). Laterales, fondo e interiores inferidos.",
      targetSize: 4.8,
    },
    fragmentStory: "Estratos académicos: portada, arquerías y cubiertas se separan mostrando la gramática neocolonial del proyecto.",
    layers: {
      forma: "Frente simétrico de dos plantas: pórtico columnado central, loggia de arcos y cubiertas de teja a cuatro aguas.",
      material: "Muros pañetados; carpinterías de madera; teja de barro; balaustradas.",
      funcion: "Aulas y talleres, auditorio, patios de trabajo: enseñar era el programa.",
      ciudad: "Pieza del equipamiento cultural que modernizó el norte del centro.",
      memoria: "Generaciones de artistas formadas aquí: memoria viva de la pedagogía del arte.",
    },
    massing: {
      defaultEvidence: "inferido",
      boxes: [
        { p: [0, 1.0, 0], s: [3.0, 2.0, 1.2], m: "stucco", label: "Cuerpo principal de dos plantas", zone: "social" },
        { p: [0, 0.55, -0.62], s: [1.1, 1.1, 0.12], m: "piedra", label: "Pórtico columnado", zone: "acceso" },
        { p: [0, 2.45, -0.2], s: [3.1, 0.9, 1.3], m: "teja", label: "Cubierta a cuatro aguas", zone: "servicio" },
        { p: [-1.75, 1.0, 0.3], s: [0.9, 2.0, 1.0], m: "stucco", label: "Ala occidental · loggia", zone: "circulacion" },
        { p: [1.75, 1.0, 0.3], s: [0.9, 2.0, 1.0], m: "stucco", label: "Ala oriental · loggia", zone: "circulacion" },
        { p: [0, 2.98, -0.2], s: [0.5, 0.14, 0.5], m: "stucco", label: "Crestería", zone: "circulacion" },
        { p: [1.05, 0.5, 1.05], s: [1.05, 1.0, 1.05], m: "ladrillo", label: "Auditorio", zone: "social" },
      ],
      profile: { axis: "y", spread: 1.35 },
    },
    productionStage: "modelo_l2",
  },

  {
    id: "caja-agraria",
    slug: "caja-agraria",
    name: "Edificio de la Caja Agraria",
    lat: 11.0005,
    lon: -74.793,
    latlonCertainty: "aproximado",
    mapPos: [544, 380],
    sector: "Centro",
    era: "moderna",
    year: "Proyecto premiado en 1961",
    yearCertainty: "verificado",
    architect: "Fernando Martínez Sanabria",
    architectCertainty: "verificado",
    architecturalStyle: "Modernismo corporativo",
    originalUse: "Sede bancaria",
    currentUse: "Por verificar",
    status: "en-pie",
    summary:
      "La torre del crédito agrícola: el modernismo al servicio del campo que alimentaba al puerto.",
    narrative:
      "La ciudad-puerto también era la ciudad que prestaba dinero al campo. La Caja Agraria puso rostro financiero al Magdalena Grande rural, y su sede urbana lo dijo en vertical: zócalo público de ventanillas, torre de oficinas, quiebrasoles que filtran el sol de la tarde como persianas de un banco. El modernismo corporativo de mitad de siglo creía en la solidez: concreto que promete estabilidad a quien trae la cosecha. Con la banca estatal llegaron las crisis y las reinvenciones, y los edificios bancarios del centro cambiaron de manos y de nombre varias veces. Queda la lección material: la confianza también se construye con losas.",
    themes: ["banca", "modernismo", "economía regional", "centro"],
    related: ["bellas-artes", "banco-dugand"],
    sources: [
      {
        id: "banrep-fernando-martinez-sanabria",
        title: "Fernando Martínez Sanabria",
        institution: "Banco de la República — Banrepcultural",
        url: "https://enciclopedia.banrepcultural.org/Fernando_Mart%C3%ADnez_Sanabria",
        accessedAt: "2026-07-29",
        kind: "institucional",
        supports: ["autoría", "premio del concurso en 1961", "materialidad"],
      },
    ],
    model3d: {
      url: "/models/caja-agraria.glb",
      evidence: "evocativo",
      credit:
        "Modelo procedural L2 (modelgen); fotos de referencia de Jdvillalobos (dominio público), Wikimedia Commons.",
      note:
        "Reconstrucción evocativa desde la pared ciega con relieve abstracto y el costado nervado documentados visualmente. No hay fotografía libre de la fachada principal ni del acceso; esos elementos permanecen sin modelar.",
      targetSize: 4.8,
    },
    fragmentStory: "Crecimiento vertical: zócalo, torre y celosía se separan como capas de una sección bancaria.",
    layers: {
      forma: "Torre sobre zócalo público: la dualidad entre calle bancaria y oficina en altura.",
      material: "Concreto armado, quiebrasoles, carpintería metálica; piedra en el zócalo.",
      funcion: "Salón de ventanillas, bóvedas, oficinas administrativas en la torre.",
      ciudad: "Parte del anillo financiero que se consolidó en el centro a mitad de siglo.",
      memoria: "Memoria del crédito rural y de la banca estatal colombiana.",
    },
    massing: {
      defaultEvidence: "inferido",
      boxes: [
        { p: [0, 0.38, 0], s: [2.2, 0.76, 1.6], m: "piedra", label: "Zócalo de ventanillas", zone: "social" },
        { p: [0, 1.55, 0], s: [1.4, 1.7, 1.2], m: "concreto", label: "Torre de oficinas", zone: "intimo" },
        { p: [0, 1.55, -0.68], s: [1.45, 1.7, 0.1], m: "metal", label: "Quiebrasoles", zone: "servicio" },
        { p: [0.95, 0.9, 0.3], s: [1.3, 1.05, 0.9], m: "concreto", label: "Anexo", zone: "circulacion" },
      ],
      profile: { axis: "y", spread: 1.15 },
    },
    productionStage: "modelo_l2",
  },

  {
    id: "romelio",
    slug: "estadio-romelio-martinez",
    name: "Estadio Romelio Martínez",
    lat: 11.001,
    lon: -74.7995,
    latlonCertainty: "aproximado",
    mapPos: [560, 252],
    sector: "Centro norte",
    era: "deco",
    year: "Inaugurado en 1934",
    yearCertainty: "aproximado",
    architect: "Por documentar",
    architectCertainty: "hipotesis",
    architecturalStyle: "Art déco deportivo",
    originalUse: "Estadio municipal",
    currentUse: "Estadio (tras remodelaciones)",
    status: "transformado",
    statusNote: "Remodelado en la década de 2010; de la obra original subsisten partes, entre ellas elementos de fachada.",
    summary:
      "El coliseo déco del fútbol costeño: gradas, torres de acceso y una ciudad que aprendió a gritar junta.",
    narrative:
      "En 1934 Barranquilla se dio un escenario para su nueva religión laica: el fútbol. El Romelio Martínez no era solo graderías; era arquitectura cívica con aletas déco, torres de acceso como proas y un nombre propio para la épica barrial. Allí la ciudad ensayó la multitud moderna: tribunas que separaban y reunían, radios que narraban, domingos que se volvían calendario. Las remodelaciones posteriores cambiaron su piel —y abrieron el debate de siempre: cuánto puede cambiar un estadio sin dejar de ser el mismo recuerdo. La respuesta, como en toda arquitectura de la memoria, no está en el concreto sino en los gritos que conserva.",
    themes: ["deporte", "art déco", "multitud", "remodelación"],
    related: ["hotel-el-prado", "edificio-scadta"],
    sources: [
      {
        id: "alcaldia-ruta-art-deco",
        title: "Recorrido Art Déco",
        institution: "Alcaldía de Barranquilla",
        url: "https://barranquilla.gov.co/descubre/recorridos-por-barranquilla/art-deco",
        accessedAt: "2026-07-29",
        kind: "institucional",
        supports: ["existencia", "ubicación", "estilo art déco"],
      },
      { label: "Hemeroteca El Heraldo — crónicas deportivas", kind: "hemerográfico", note: "Pendiente de consulta puntual" },
    ],
    model3d: {
      url: "/models/estadio-romelio-martinez.glb",
      evidence: "inferido",
      credit:
        "Modelo procedural L2 (modelgen); fotos de referencia de José David Villalobos (dominio público), Jdvillalobos (CC BY 3.0) y Hdedea (CC BY-SA 3.0), Wikimedia Commons.",
      note:
        "Reconstrucción interpretativa desde fotografía pública; torre de acceso, celosías, franja ocre y cubierta curva de tribuna documentadas visualmente. La geometría completa del estadio y las remodelaciones recientes son inferidas.",
      targetSize: 4.8,
    },
    fragmentStory: "Anillo y proas: tribunas y torres se separan revelando el estadio como máquina de multitud.",
    layers: {
      forma: "Anillo de tribunas con torres de acceso escalonadas: el rito de entrar dibujado en hormigón.",
      material: "Concreto armado; decoración geométrica déco en torres y barandas.",
      funcion: "Graderías, cancha, accesos monumentales, palcos y servicios bajo tribuna.",
      ciudad: "Equipamiento que consolidó el centro-norte como distrito cívico-deportivo.",
      memoria: "Goles, carnavales y conciertos: la memoria sonora de la ciudad.",
    },
    massing: {
      defaultEvidence: "inferido",
      boxes: [
        { p: [0, 0.45, -1.0], s: [3.2, 0.9, 0.65], m: "concreto", label: "Tribuna norte", zone: "social" },
        { p: [0, 0.45, 1.0], s: [3.2, 0.9, 0.65], m: "concreto", label: "Tribuna sur", zone: "social" },
        { p: [-1.68, 0.45, 0], s: [0.6, 0.9, 1.4], m: "concreto", label: "Tribuna oeste", zone: "social" },
        { p: [1.68, 0.45, 0], s: [0.6, 0.9, 1.4], m: "concreto", label: "Tribuna este", zone: "social" },
        { p: [0, 0.95, -1.42], s: [0.9, 1.9, 0.5], m: "concreto", label: "Torre de acceso déco", zone: "acceso" },
        { p: [0, 1.75, -1.42], s: [0.5, 0.5, 0.3], m: "concreto", zone: "circulacion" },
        { p: [0, 0.05, 0], s: [2.4, 0.1, 1.1], m: "pasto", label: "Cancha", zone: "social" },
      ],
      profile: { axis: "y", spread: 0.95 },
    },
    productionStage: "modelo_l2",
  },

  {
    id: "banco-dugand",
    slug: "banco-dugand",
    name: "Edificio Banco Dugand",
    lat: 10.9952,
    lon: -74.7925,
    latlonCertainty: "aproximado",
    mapPos: [446, 432],
    sector: "Centro Histórico",
    era: "republica",
    year: "Construido entre 1920 y 1922",
    yearCertainty: "verificado",
    architect: "Leslie Arbouin",
    architectCertainty: "verificado",
    architecturalStyle: "Neoclásico bancario",
    originalUse: "Sede del Banco Dugand",
    currentUse: "Desocupado (restaurado entre 2016 y 2020)",
    status: "transformado",
    statusNote:
      "Sede de Telecom tras la liquidación del banco (1925); monumento nacional por el decreto 2000 de 1996; restaurado entre 2016 y 2020 bajo proyecto de Ignacio Consuegra.",
    summary:
      "El templo neoclásico del crédito: una columnata monumental que le dio rostro de banca al comercio del puerto.",
    narrative:
      "Los bancos de la primera mitad del siglo querían parecer indestructibles, y el Dugand lo dijo en lenguaje neoclásico: dos plantas sobrias coronadas por una columnata monumental que aún sostiene su frontis sobre la calle. Lo diseñó el arquitecto jamaicano Leslie Arbouin —el mismo trazo de la Antigua Aduana— y funcionó poco tiempo como banco: liquidada la casa Dugand en 1925, el edificio pasó a Telecom, quedó décadas invisibilizado por el comercio informal y fue declarado monumento nacional en 1996. Restaurado entre 2016 y 2020, hoy espera un uso a su altura. Su lección material: la confianza bancaria también se construye con órdenes clásicos.",
    themes: ["banca", "neoclásico", "centro histórico", "restauración"],
    related: ["teatro-colon", "edificio-garcia"],
    sources: [
      {
        id: "mincultura-lista-bic-2018",
        title: "Bienes de interés cultural del ámbito nacional — abril de 2018",
        institution: "Ministerio de Cultura",
        url: "https://mng.mincultura.gov.co/prensa/noticias/Documents/Patrimonio/BIENES%20DE%20INTER%C3%89S%20CULTURAL%20DEL%20%C3%81MBITO%20NACIONAL_%20abril%202018.pdf",
        accessedAt: "2026-07-29",
        kind: "institucional",
        supports: ["nombre alterno", "ubicación", "declaratoria BIC"],
      },
      {
        id: "wikipedia-edificio-banco-dugand",
        title: "Edificio Banco Dugand",
        institution: "Wikipedia (es)",
        url: "https://es.wikipedia.org/wiki/Edificio_Banco_Dugand",
        accessedAt: "2026-08-22",
        license: "CC BY-SA 4.0",
        kind: "enciclopédico",
        supports: ["autoría (Leslie Arbouin)", "construcción 1920–1922", "estilo neoclásico", "sede Telecom", "monumento nacional 1996", "restauración 2016–2020"],
      },
      {
        id: "banrep-banca-barranquilla",
        title: "Bancos y banqueros de Barranquilla, 1873-1925",
        institution: "Banco de la República — Boletín Cultural y Bibliográfico",
        author: "Adolfo Meisel Roca y Eduardo Posada Carbó",
        url: "https://publicaciones.banrepcultural.org/index.php/boletin_cultural/article/view/2754/0",
        accessedAt: "2026-07-29",
        kind: "académico",
        supports: ["historia bancaria regional", "contexto del Banco Dugand"],
      },
    ],
    model3d: {
      url: "/models/banco-dugand.glb",
      evidence: "inferido",
      credit: "Modelo procedural L2 (modelgen); fotos de referencia de Jdvillalobos (CC BY-SA 4.0), Wikimedia Commons.",
      note: "Reconstrucción interpretativa desde fotografía pública; columnata clásica monumental (capiteles corintios según la foto) y entablamento documentados visualmente. Fachadas laterales, cubierta e interiores inferidos.",
      targetSize: 4.8,
    },
    fragmentStory: "Estratos clásicos: basamento bancario, gran orden columnado y frontis se separan mostrando la arquitectura como garantía.",
    layers: {
      forma: "Frontis simétrico de dos plantas con columnata clásica monumental pareada y entablamento: el templo laico del crédito.",
      material: "Mampostería pañetada e impostas pétreas; carpinterías metálicas; capiteles corintios documentados fotográficamente.",
      funcion: "Salón bancario en planta baja; archivo y administración arriba; hoy desocupado tras su restauración.",
      ciudad: "Parte del anillo financiero-comercial del centro de la época republicana.",
      memoria: "Memoria de las familias-comercio que capitalizaron el puerto.",
    },
    massing: {
      defaultEvidence: "inferido",
      boxes: [
        { p: [0, 0.55, 0], s: [1.7, 1.1, 1.25], m: "piedra", label: "Cuerpo bancario de dos plantas", zone: "social" },
        { p: [0, 0.55, -0.66], s: [1.4, 1.05, 0.12], m: "piedra", label: "Columnata monumental del frontis", zone: "acceso" },
        { p: [0, 1.22, -0.66], s: [1.55, 0.28, 0.16], m: "piedra", label: "Entablamento y frontón", zone: "acceso" },
        { p: [0, 1.16, 0], s: [1.82, 0.1, 1.36], m: "metal", label: "Cornisa", zone: "servicio" },
      ],
      profile: { axis: "y", spread: 1.05 },
    },
    productionStage: "modelo_l2",
  },

  {
    id: "cine-rex",
    slug: "cine-rex",
    name: "Teatro Rex",
    historicalNames: ["Cine Rex", "Antiguo Teatro Rex"],
    lat: 10.9968,
    lon: -74.792,
    latlonCertainty: "hipotesis",
    mapPos: [452, 376],
    sector: "Centro Histórico · calle 37 con carrera 45",
    era: "deco",
    year: "Inaugurado el 7 de febrero de 1935",
    yearCertainty: "verificado",
    architect: "Manuel Carrerá",
    architectCertainty: "verificado",
    architecturalStyle: "Art déco",
    originalUse: "Teatro y sala de cine",
    currentUse: "Edificación existente con uso y estado actual por verificar en campo",
    status: "transformado",
    statusNote:
      "La edificación aparece en registros patrimoniales contemporáneos. Su estado material, ocupación y transformaciones requieren visita de campo.",
    summary:
      "Una sala art déco que convirtió refrigeración, acústica y cine sonoro en espectáculo de modernidad urbana.",
    narrative:
      "El Rex no es una ausencia: es una supervivencia discutida. Inaugurado en 1935, llevó al centro una experiencia técnica y colectiva hecha de refrigeración, acústica, cine sonoro y arquitectura art déco. Su permanencia no equivale a conservación intacta: los usos, la materia y la relación con la calle cambian. Por eso este modelo no se disuelve ni finge una ruina. Se abre para distinguir lo que las fuentes documentan de lo que aún exige planos y visita de campo. La pregunta cambia con la evidencia: ¿qué significa que un edificio permanezca cuando su vida pública se transforma?",
    themes: ["cine", "art déco", "transformación", "supervivencia"],
    related: ["teatro-colon", "edificio-garcia"],
    sources: [
      {
        id: "mincultura-pemp-amira-diagnostico",
        title: "Plan Especial de Manejo y Protección Teatro Amira de la Rosa — Fase I: Diagnóstico",
        institution: "Ministerio de las Culturas, las Artes y los Saberes",
        url: "https://mng.mincultura.gov.co/ministerio/transparencia-y-acceso-a-informacion-publica/publicidad%20de%20proyectos%20de%20especificos%20de%20regulacion/Documents/DIAGN%C3%93STICO%20TAR%20AMIRA%20DE%20LA%20ROSA%20BARRANQUILLA.pdf",
        pages: "21",
        accessedAt: "2026-07-29",
        kind: "institucional",
        supports: ["fecha", "ubicación", "estilo", "programa"],
      },
      {
        id: "banrep-paisaje-aereo-resena",
        title: "Reseña de Barranquilla. Paisaje aéreo. Memoria recuperada de una ciudad pionera",
        institution: "Banco de la República",
        date: "2026",
        url: "https://publicaciones.banrepcultural.org/index.php/boletin_cultural/article/download/21417/21629/42471",
        accessedAt: "2026-07-29",
        kind: "académico",
        supports: ["fecha", "estilo"],
      },
      {
        id: "alcaldia-mes-patrimonio-2023",
        title: "Con historia, en Barranquilla conmemoramos el Mes del Patrimonio",
        institution: "Alcaldía de Barranquilla",
        date: "2023-09-28",
        url: "https://barranquilla.gov.co/funcionarios/con-historia-en-barranquilla-conmemoramos-el-mes-del-patrimonio",
        accessedAt: "2026-07-29",
        kind: "institucional",
        supports: ["existencia", "valor patrimonial"],
      },
      {
        id: "wikipedia-manuel-carrera",
        title: "Manuel Carrerá",
        institution: "Wikipedia (es)",
        url: "https://es.wikipedia.org/wiki/Manuel_Carrer%C3%A1",
        accessedAt: "2026-08-22",
        license: "CC BY-SA 4.0",
        kind: "enciclopédico",
        supports: ["autoría del Teatro Rex (1935, cra. 45 con calle 37)"],
      },
    ],
    model3d: {
      url: "/models/cine-rex.glb",
      evidence: "inferido",
      credit: "Modelo procedural L2 (modelgen); fotos de referencia de Felipe Restrepo Acosta (CC BY-SA 4.0), Jdvillalobos (dominio público) y LuisCG11 (CC BY-SA 4.0), Wikimedia Commons.",
      note: "Reconstrucción interpretativa desde fotografía pública y volumetría curatorial; mirador curvo esquinero con emblema, pilonos déco y bandas turquesa documentados visualmente. Sala y distribución interior inferidas.",
      targetSize: 4.8,
    },
    fragmentStory:
      "Apertura reversible: la sala, el foyer, la torre-fachada y la marquesina se separan para mostrar qué rasgos están documentados y qué distribución interior permanece inferida.",
    layers: {
      forma: "Sala longitudinal con torre-fachada de aletas verticales: tipología de las grandes salas de estreno.",
      material: "La fuente institucional documenta el lenguaje art déco; materiales, colores y estado de conservación requieren levantamiento de campo.",
      funcion: "La sala de cine, la refrigeración y la acústica están documentadas; la distribución interior del prototipo es inferida.",
      ciudad: "Parte del corredor de espectáculos que dio vida nocturna al Paseo Bolívar.",
      memoria: "El caso permite estudiar cómo un edificio puede sobrevivir físicamente mientras su vida pública y sus usos se transforman.",
    },
    massing: {
      defaultEvidence: "inferido",
      boxes: [
        { p: [0, 0.7, 0.1], s: [1.7, 1.4, 1.9], m: "concreto", label: "Sala · inferida", zone: "social" },
        { p: [0, 1.15, -1.05], s: [1.55, 2.3, 0.35], m: "concreto", label: "Torre-fachada", zone: "acceso", evidence: "documentado", citationIds: ["mincultura-pemp-amira-diagnostico"] },
        { p: [0, 1.2, -1.28], s: [1.2, 0.1, 0.35], m: "metal", label: "Marquesina · inferida", zone: "acceso" },
        { p: [-0.55, 1.5, -1.05], s: [0.09, 2.9, 0.09], m: "metal", zone: "servicio" },
        { p: [0, 1.5, -1.05], s: [0.09, 2.9, 0.09], m: "metal", zone: "servicio" },
        { p: [0.55, 1.5, -1.05], s: [0.09, 2.9, 0.09], m: "metal", zone: "servicio" },
      ],
      profile: { axis: "y", spread: 1.6, twist: 0.2 },
    },
    productionStage: "modelo_l2",
  },
];

export const BUILDING_BY_SLUG: Record<string, Building> = Object.fromEntries(
  BUILDINGS.map((b) => [b.slug, b])
);

export const BUILDING_BY_ID: Record<string, Building> = Object.fromEntries(
  BUILDINGS.map((b) => [b.id, b])
);

/** Rutas curatoriales sobre el mapa (ids de edificios en orden) */
export const ROUTES: { id: string; label: string; description: string; ids: string[] }[] = [
  {
    id: "rio",
    label: "Ruta del río y el riel",
    description: "El sistema portuario y ferroviario que fundó la ciudad moderna.",
    ids: ["aduana", "intendencia-fluvial", "estacion-montoya"],
  },
  {
    id: "deco",
    label: "Ruta déco",
    description: "La modernidad geométrica del Paseo Bolívar y la aviación.",
    ids: ["edificio-garcia", "edificio-scadta", "teatro-colon", "estadio-romelio-martinez"],
  },
  {
    id: "norte",
    label: "Ruta del norte cívico",
    description: "Del barrio-jardín al equipamiento moderno: la ciudad que se expandió.",
    ids: ["hotel-el-prado", "estadio-romelio-martinez", "bellas-artes", "caja-agraria"],
  },
];
