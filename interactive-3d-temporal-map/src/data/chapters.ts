import type { EraId } from "./buildings";

export type SceneKey =
  | "aduana"
  | "montoya"
  | "prado"
  | "garcia"
  | "moderna"
  | "perdida"
  | "epilogo";

export type Chapter = {
  id: string;
  num: string;
  scene: SceneKey;
  era: EraId;
  title: string;
  subtitle: string;
  yearLabel: string;
  paragraphs: string[];
  dataLines: { k: string; v: string }[];
  buildingSlug?: string;
  buildingNote?: string;
  soundScene: "rio" | "ferrocarril" | "jardin" | "ciudad" | "radio" | "silencio" | "coro";
};

export const PROLOGUE = {
  coords: "10°59′14″N · 74°48′23″W",
  place: "RÍO MAGDALENA — BOCAS DE CENIZA",
  title: "Barranquilla",
  title2: "Arquitectura del Tiempo",
  quote:
    "Una ciudad no se construye una sola vez. Se levanta, se transforma, se recuerda y, algunas veces, desaparece.",
  intro:
    "Este atlas lee la ciudad a través de sus edificios. El mapa representa el espacio; la fragmentación, el tiempo. Cada volumen que se desarma aquí no es un efecto: es una capa de historia esperando ser leída.",
};

export const CHAPTERS: Chapter[] = [
  {
    id: "rio",
    num: "01",
    scene: "aduana",
    era: "republica",
    title: "Río, puerto y origen",
    subtitle: "La ciudad que llegó por el agua",
    yearLabel: "1842 — 1902",
    paragraphs: [
      "Barranquilla no nació mirando al horizonte: nació mirando la corriente. El Magdalena era su calle principal, su ferrocarril líquido, su correo. Todo lo moderno —máquinas, periódicos, migrantes, ideas— remontaba el río hasta chocar con el muelle.",
      "En ese borde se levantó la Antigua Aduana: la imagen del Estado frente al agua. Debajo de sus arcadas se pesaba el país que llegaba; encima de su torre se vigilaba el país que se iba. El puerto no era un sector de la ciudad: era su razón.",
    ],
    dataLines: [
      { k: "EJE", v: "Río Magdalena → Bocas de Ceniza" },
      { k: "FUNCIÓN", v: "Aduana · control · bodegas" },
      { k: "CONSTRUCCIÓN", v: "1921 ✓" },
    ],
    buildingSlug: "antigua-aduana",
    buildingNote: "Antigua Aduana — el umbral fiscal del puerto",
    soundScene: "rio",
  },
  {
    id: "ferrocarril",
    num: "02",
    scene: "montoya",
    era: "fluvial",
    title: "República, comercio y riel",
    subtitle: "La primera globalización",
    yearLabel: "1871 — 1929",
    paragraphs: [
      "Al río se sumó el acero. El Ferrocarril de Bolívar —de los primeros del país— cosió a Barranquilla con el mar por Sabanilla y Puerto Colombia. La estación era el rito de la velocidad: reloj, andén, silbato, equipajes con etiquetas de ultramar.",
      "La República trajo bancos, aduanas y consulados; el comercio trajo arquitectura. Ladrillo, cerchas metálicas, andenes largos: infraestructura que todavía hoy se lee como caligrafía industrial sobre el Barrio Abajo.",
    ],
    dataLines: [
      { k: "RED", v: "Río + riel + mar" },
      { k: "CARGA", v: "Café del Magdalena Grande" },
      { k: "HUELLA", v: "Arquitectura ferroviaria" },
    ],
    buildingSlug: "estacion-montoya",
    buildingNote: "Estación Montoya — el andén de la primera globalización",
    soundScene: "ferrocarril",
  },
  {
    id: "prado",
    num: "03",
    scene: "prado",
    era: "deco",
    title: "El Prado: habitar el trópico",
    subtitle: "Jardín, brisa y agua",
    yearLabel: "1920 — 1935",
    paragraphs: [
      "En los años veinte la ciudad inventó una manera nueva de vivir el Caribe: el barrio-jardín. Calles arboladas, lotes con retiro, portales sombreados. El clima dejó de ser un enemigo para volverse un material de diseño: sombra, ventilación cruzada, vegetación.",
      "Su vitrina fue el Hotel El Prado, inaugurado hacia 1930: alas bajas alrededor de una piscina legendaria, marquesinas para automóviles, salones donde la ciudad estrenaba su modernidad doméstica. El Prado desplazó el centro de gravedad urbano hacia el norte —y enseñó que el lujo tropical no es mármol: es aire.",
    ],
    dataLines: [
      { k: "MODELO", v: "Barrio-jardín" },
      { k: "CLIMA", v: "Sombra · brisa · patio" },
      { k: "HITO", v: "Hotel inaugurado en 1930 ✓" },
    ],
    buildingSlug: "hotel-el-prado",
    buildingNote: "Hotel El Prado — la piscina como corazón urbano",
    soundScene: "jardin",
  },
  {
    id: "deco",
    num: "04",
    scene: "garcia",
    era: "deco",
    title: "Art déco: la ciudad vertical",
    subtitle: "Geometría para una era de aviones",
    yearLabel: "1930 — 1949",
    paragraphs: [
      "SCADTA despegó en 1919 y Barranquilla descubrió que la distancia era negociable. La ciudad quiso edificios a la altura del vértigo: esquinas curvas como fuselajes, aletas verticales, retrocesos escalonados, marquesinas-estela. El art déco local no copiaba: traducía el optimismo del puerto.",
      "Sobre el Paseo Bolívar, el Edificio García levantó su torre esquinera hacia 1939: podio comercial, oficinas en altura, coronación geométrica. No era solo un almacén elegante; era la sección dorada de una época que creía que el futuro cabía en una esquina.",
    ],
    dataLines: [
      { k: "EJE", v: "Paseo Bolívar" },
      { k: "GRAMÁTICA", v: "Escalonado · aletas · estela" },
      { k: "HITO", v: "Ed. García c. 1939 ◍" },
    ],
    buildingSlug: "edificio-garcia",
    buildingNote: "Edificio García — la vertical del Paseo Bolívar",
    soundScene: "radio",
  },
  {
    id: "moderna",
    num: "05",
    scene: "moderna",
    era: "moderna",
    title: "Modernismo institucional",
    subtitle: "Concreto, Estado y ciudadanía",
    yearLabel: "1950 — 1984",
    paragraphs: [
      "A mitad de siglo, la ciudad decidió que la cultura y el crédito también eran infraestructura. Bellas Artes enseñó a dibujar bajo losas delgadas y pilotis que dejaban pasar la brisa; la Caja Agraria prestó dinero al campo desde una torre con quiebrasoles.",
      "El modernismo institucional creía que el Estado podía construir ciudadanía con arquitectura: concreto visto, plantas libres, protección solar como fachada. Esos edificios envejecieron entre reformas y desdenes — y hoy son la frontera siguiente del patrimonio: el siglo XX también necesita memoria.",
    ],
    dataLines: [
      { k: "MATERIAL", v: "Concreto armado" },
      { k: "RECURSO", v: "Quiebrasoles · pilotis" },
      { k: "PROGRAMA", v: "Escuela · banca · civismo" },
    ],
    buildingSlug: "bellas-artes",
    buildingNote: "Palacio de Bellas Artes — el taller cívico del norte",
    soundScene: "ciudad",
  },
  {
    id: "perdida",
    num: "06",
    scene: "perdida",
    era: "memoria",
    title: "Patrimonio, supervivencia y memoria",
    subtitle: "Permanecer también es transformarse",
    yearLabel: "1985 — HOY",
    paragraphs: [
      "Permanecer no significa quedar intacto. El Teatro Rex abrió en 1935 como una máquina art déco para el cine sonoro: refrigeración, acústica y marquesina convertían la técnica en espectáculo colectivo. El edificio sigue formando parte del paisaje patrimonial, aunque sus usos y su materia hayan cambiado.",
      "Aquí el modelo no se disuelve. Se abre y distingue: la torre-fachada está documentada; la distribución interior sigue siendo una inferencia pendiente de planos y visita de campo. La memoria deja de sustituir la evidencia y empieza a señalar lo que aún debemos investigar.",
    ],
    dataLines: [
      { k: "APERTURA", v: "7 de febrero de 1935 ✓" },
      { k: "ESTADO", v: "Existente · transformado" },
      { k: "PREGUNTA", v: "¿Cómo se conserva una vida pública?" },
    ],
    buildingSlug: "cine-rex",
    buildingNote: "Teatro Rex — supervivencia y transformación",
    soundScene: "silencio",
  },
  {
    id: "epilogo",
    num: "07",
    scene: "epilogo",
    era: "memoria",
    title: "La ciudad que seguimos construyendo",
    subtitle: "Epílogo",
    yearLabel: "AHORA",
    paragraphs: [
      "El mapa histórico vuelve a ensamblarse, pero ya no es el mismo: cada fragmento carga su tiempo. Conservar no es congelar; es negociar entre la postal y la calle viva, entre el monumento y el uso cotidiano.",
      "La experiencia termina con una pregunta —la única que importa:",
    ],
    dataLines: [
      { k: "PREGUNTA", v: "¿Qué parte de la ciudad queremos conservar para quienes aún no han llegado?" },
    ],
    soundScene: "coro",
  },
];
