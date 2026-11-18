/* ============================================================
   Barranquilla · Arquitectura del tiempo — El recorrido
   Recorrido narrativo guiado · Three.js vía CDN · sin build
   ============================================================ */

/* Módulos Three.js se cargan dinámicamente (ver bootstrap al final):
   si el CDN falla, la parte narrativa sigue funcionando sin escena. */
let THREE = null;
let GLTFLoaderClass = null;
let OrbitControlsClass = null;
let MeshoptDecoderLib = null;     // descompresión de las copias web
let RoomEnvironmentClass = null;  // luz ambiental suave (opcional)

/* ------------------------------------------------------------
   DATOS — 13 paradas en orden cronológico
   ------------------------------------------------------------ */

const ACTS = {
  rio: "Acto I · El río y el riel",
  estado: "Acto II · La puerta del Estado",
  deco: "Acto III · Vértigo déco",
  institucional: "Acto IV · La ciudad institucional",
};

const STOPS = [
  {
    slug: "estacion-montoya",
    name: "Estación Montoya",
    act: ACTS.rio,
    year: "1871",
    short: "1871",
    chips: ["Ladrillo claro", "Hierro forjado inglés", "Restaurada en 1999"],
    paras: [
      "Antes del avión existió el riel. El Ferrocarril de Bolívar —de los primeros del país— ató a Barranquilla con el mar, y esta estación fue el rito del viaje: reloj, andén, silbato, equipajes con etiquetas de ultramar.",
      "Por sus puertas entraron máquinas, tipografías y modas; por ellas salió el café del Magdalena Grande. Cuando el tren calló, en 1940, el edificio quedó como un animal varado junto al río. Hoy es casa de la cultura: todavía conecta, solo que con recuerdos.",
    ],
  },
  {
    slug: "iglesia-san-nicolas",
    name: "Iglesia de San Nicolás",
    act: ACTS.rio,
    year: "Finales del siglo XIX",
    short: "s. XIX",
    chips: ["Nave única", "Dos torres de reloj", "Barrio San Nicolás"],
    paras: [
      "Antes de los planos de urbanización, los barrios se ordenaban alrededor de una plaza y una parroquia. San Nicolás es esa geografía hecha piedra: un campanario que organiza calles, procesiones que marcan el calendario.",
      "Su imagen neogótica —nave única, muros gruesos contra el sol, torres de reloj— preside uno de los barrios más vivos de la ciudad, cuna de talleres, tiendas y Carnaval. Leer la iglesia sin su barrio sería leer solo la portada del libro.",
    ],
  },
  {
    slug: "antigua-aduana",
    name: "Antigua Aduana",
    act: ACTS.estado,
    year: "1919 – 1921",
    short: "1919",
    chips: ["Leslie O. Arbouin", "Monumento nacional 1984"],
    paras: [
      "Barranquilla era un mostrador sobre el Magdalena, y la Aduana ordenaba ese caos fértil: aquí se pesaba, se sellaba y se tasaba todo lo que subía desde Bocas de Ceniza.",
      "Su fachada neoclásica —arcadas, simetría, frontón— no era vanidad: era el Estado plantado frente al agua. Restaurada hace décadas, cambió de oficio sin cambiar de vocación: la misma puerta que registraba mercancías hoy recibe visitantes. Cambió el sello, no la función de umbral.",
    ],
  },
  {
    slug: "banco-dugand",
    name: "Edificio Banco Dugand",
    act: ACTS.estado,
    year: "1920 – 1922",
    short: "1920",
    chips: ["Leslie Arbouin", "Monumento nacional 1996", "Restaurado 2016–2020"],
    paras: [
      "Los bancos de entonces querían parecer indestructibles, y el Dugand lo dijo en lenguaje clásico: una columnata monumental de capiteles corintios que aún sostiene su frontis sobre la calle.",
      "Lo dibujó Leslie Arbouin —el mismo trazo de la Aduana— y duró poco como banco: liquidada la casa en 1925, pasó a Telecom y quedó décadas escondido tras el comercio informal. Restaurado entre 2016 y 2020, espera un uso a su altura. Su lección material: la confianza también se construye con órdenes clásicos.",
    ],
  },
  {
    slug: "hotel-el-prado",
    name: "Hotel El Prado",
    act: ACTS.deco,
    year: "1930",
    short: "1930",
    chips: ["Burdette Higgins", "Barrio-jardín El Prado"],
    paras: [
      "El Prado no fue solo un barrio: fue una idea importada y aclimatada. Su hotel fue la vitrina de esa idea: alas extendidas alrededor de una piscina que se volvió leyenda urbana.",
      "Allí se negociaba, se celebraba y se estrenaba la modernidad doméstica: hielo, ventilación cruzada, automóviles bajo la marquesina. Enseñó que el clima no se combate con muros gruesos sino con sombra, aire y agua. Esa lección sigue siendo la arquitectura más sensata del Caribe.",
    ],
  },
  {
    slug: "estadio-romelio-martinez",
    name: "Estadio Romelio Martínez",
    act: ACTS.deco,
    year: "1934",
    short: "1934",
    chips: ["Art déco deportivo", "Remodelado en la década de 2010"],
    paras: [
      "En 1934 la ciudad se dio un escenario para su nueva religión laica: el fútbol. No eran solo graderías: era arquitectura cívica con aletas déco y torres de acceso como proas.",
      "Aquí Barranquilla ensayó la multitud moderna: tribunas que separaban y reunían, radios que narraban, domingos que se volvían calendario. Las remodelaciones cambiaron su piel. Los gritos, no.",
    ],
  },
  {
    slug: "cine-rex",
    name: "Teatro Rex",
    act: ACTS.deco,
    year: "7 de febrero de 1935",
    short: "1935",
    chips: ["Manuel Carrerá", "Mirador curvo esquinero"],
    paras: [
      "El Rex llevó al centro una experiencia técnica y colectiva: refrigeración, acústica, cine sonoro. Ir al cine era una manera de tocar el futuro con las manos.",
      "Su torre-fachada de aletas verticales sigue en pie, discutida como toda supervivencia. Su pregunta sigue abierta: ¿qué significa que un edificio permanezca cuando su vida pública ya se transformó?",
    ],
  },
  {
    slug: "edificio-scadta",
    name: "Edificio Scadta",
    act: ACTS.deco,
    year: "1935",
    short: "1935",
    chips: ["Manuel Carrerá", "Streamline déco"],
    paras: [
      "En 1919 Barranquilla vio despegar algo más que aviones: vio una idea —que la distancia era negociable. SCADTA hizo del río una pista y de la ciudad la primera capital aerocomercial de América.",
      "Su sede debía parecerse a esa promesa: esquinas curvas como fuselajes, bandas horizontales como estelas. El streamline no era moda aquí: era retrato de una empresa que llevaba correo al interior del país antes de que existieran las carreteras.",
    ],
  },
  {
    slug: "intendencia-fluvial",
    name: "Intendencia Fluvial",
    act: ACTS.deco,
    year: "1935",
    short: "1935",
    chips: ["Galerías al río", "Sede de Cultura, Patrimonio y Turismo"],
    paras: [
      "Si la Aduana era la caja del puerto, la Intendencia era su cerebro operativo: allí se registraban embarcaciones, se ordenaban atraques, se medía el río como se mide a un socio impredecible.",
      "Su arquitectura era la de un trabajo continuo: galerías sombreadas para mirar el agua sin quemarse. Hoy administra otra cosa: es sede de la Secretaría de Cultura. El edificio sigue vigilando el río, solo que ahora vigila memoria.",
    ],
  },
  {
    slug: "teatro-colon",
    name: "Teatro Colón",
    act: ACTS.deco,
    year: "Diseñado en 1937 · construido hacia 1942",
    short: "1937",
    chips: ["Manuel Carrerá", "Fachada que evoca carabelas"],
    paras: [
      "Los teatros fueron las primeras pantallas grandes de la ciudad. En el Colón, Barranquilla ensayó su cosmopolitismo: ópera llegada en vapor, cine mudo con pianista, galas donde se estrenaba vestido y opinión.",
      "Manuel Carrerá dibujó una fachada de planos angulosos que evoca carabelas, con torre-lámpara lateral. La sala ordenaba la sociedad en plateas y palcos; la calle la democratizaba: a la salida, todos comentaban la misma función bajo los faroles del Paseo.",
    ],
  },
  {
    slug: "edificio-garcia",
    name: "Edificio García",
    act: ACTS.deco,
    year: "c. 1939",
    short: "c.39",
    chips: ["Ícono del Paseo Bolívar", "Reconstrucción procedural L2"],
    paras: [
      "Cuando la ciudad se descubrió moderna quiso edificios a la altura del vértigo. El García respondió con geometría: torre esquinera escalonada, aletas que aceleran la mirada hacia arriba, marquesina que anuncia el comercio como espectáculo.",
      "El déco local no copiaba a Miami: traducía el optimismo de un puerto que se sabía conectado con el mundo. Es de los pocos edificios que la memoria colectiva dibuja de silueta, sin necesidad de fotografía.",
    ],
  },
  {
    slug: "bellas-artes",
    name: "Palacio de Bellas Artes",
    act: ACTS.institucional,
    year: "Mediados del siglo XX",
    short: "s. XX",
    chips: ["Neocolonial revival", "Registro parcialmente abierto"],
    paras: [
      "A mitad de siglo, Barranquilla decidió que la cultura también era infraestructura. Bellas Artes materializó la apuesta con el lenguaje académico de El Prado: pórtico columnado, arquerías que filtran la luz, teja contra el sol.",
      "No era un templo del arte elevado sobre la calle: era un taller abierto, con patios donde se secaban lienzos y pasillos donde sonaban escalas. Generaciones de artistas costeños se formaron bajo sus arcadas.",
    ],
  },
  {
    slug: "caja-agraria",
    name: "Edificio de la Caja Agraria",
    act: ACTS.institucional,
    year: "Concurso premiado en 1961",
    short: "1961",
    chips: ["Fernando Martínez Sanabria", "Reconstrucción evocativa"],
    paras: [
      "La ciudad-puerto también prestaba dinero al campo. La Caja Agraria puso rostro financiero al Magdalena rural, y lo dijo en vertical: zócalo público de ventanillas, torre de oficinas, quiebrasoles que filtran el sol de la tarde como persianas.",
      "El modernismo creía en la solidez: concreto que promete estabilidad a quien trae la cosecha. Con las crisis, el edificio cambió de manos y de nombre varias veces. Queda la lección material: la confianza también se construye con losas.",
    ],
  },
];

const AUTOPLAY_MS = 14000;
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------
   ESTADO DE NAVEGACIÓN
   ------------------------------------------------------------ */

let index = -1;            // parada actual
let transitioning = false; // bloquea navegación durante transición
let playTimer = null;

const $ = (id) => document.getElementById(id);
const panel = $("panel");
const intro = $("intro");
const endcard = $("endcard");
const ui = $("ui");

// La portada es modal: la interfaz narrativa no participa del foco hasta entrar.
ui.inert = true;
$("btn-start").focus();

/* ------------------------------------------------------------
   UI — render de parada, timeline, contadores
   ------------------------------------------------------------ */

function renderStop(i) {
  const s = STOPS[i];
  $("stop-act").textContent = s.act;
  $("stop-counter").textContent =
    String(i + 1).padStart(2, "0") + " / " + String(STOPS.length).padStart(2, "0");
  $("stop-year").textContent = s.year;
  $("stop-name").textContent = s.name;
  $("stop-body").innerHTML = s.paras.map((p) => `<p>${p}</p>`).join("");
  $("stop-chips").innerHTML = s.chips.map((c) => `<span>${c}</span>`).join("");
  $("btn-prev").disabled = i === 0;
  // En la última parada, la flecha siguiente conduce al epílogo
  const nxt = $("btn-next");
  nxt.disabled = false;
  const esUltima = i === STOPS.length - 1;
  nxt.classList.toggle("final", esUltima);
  nxt.setAttribute("aria-label", esUltima ? "Terminar y ver el epílogo" : "Parada siguiente");
}

function setMobileMode(mode) {
  const modelMode = mode === "model";
  document.body.dataset.mobileMode = modelMode ? "model" : "story";
  $("btn-mobile-mode").setAttribute("aria-pressed", String(modelMode));
  $("btn-mobile-mode").textContent = modelMode ? "Leer historia" : "Ver modelo";
}

function buildTimeline() {
  const tl = $("timeline");
  tl.innerHTML = "";
  STOPS.forEach((s, i) => {
    const b = document.createElement("button");
    b.className = "tl-dot";
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", `${i + 1}. ${s.name}, ${s.year}`);
    if (i > 0 && STOPS[i - 1].act !== s.act) b.classList.add("act-start");
    b.innerHTML =
      `<span class="tl-year">${s.short}</span>` +
      `<span class="tl-tip" aria-hidden="true"><b>${s.short}</b> ${s.name}</span>`;
    b.addEventListener("click", () => go(i));
    tl.appendChild(b);
  });
}

function syncTimeline() {
  [...$("timeline").children].forEach((d, i) => {
    d.classList.toggle("active", i === index);
    d.classList.toggle("done", i < index);
    d.setAttribute("aria-selected", i === index ? "true" : "false");
  });
}

/* ------------------------------------------------------------
   NAVEGACIÓN
   ------------------------------------------------------------ */

function go(i, opts = {}) {
  if (transitioning || i === index) return;
  i = Math.max(0, Math.min(STOPS.length - 1, i));
  const from = index;
  index = i;

  stopPlay();
  hideEndcard();
  setMobileMode("story");

  // Panel: salida → contenido → entrada
  const swap = () => {
    renderStop(i);
    syncTimeline();
    panel.classList.remove("leaving");
    panel.classList.add("entering");
    requestAnimationFrame(() =>
      requestAnimationFrame(() => panel.classList.remove("entering"))
    );
  };
  if (from === -1 || REDUCED) {
    swap();
  } else {
    transitioning = true;
    panel.classList.add("leaving");
    setTimeout(() => {
      swap();
      transitioning = false;
    }, 420);
  }

  history.replaceState(null, "", "#parada=" + encodeURIComponent(STOPS[i].slug));
  showModel(STOPS[i].slug).then(() => preloadNeighbors(i));
}

/** Precarga la parada siguiente (y la anterior) cuando la actual ya está en pantalla. */
function preloadNeighbors(i) {
  if (!webglOK || !GLTFLoaderClass) return;
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 400));
  idle(() => {
    for (const j of [i + 1, i - 1]) {
      if (STOPS[j]) loadModel(STOPS[j].slug).catch(() => {});
    }
  });
}

const next = () => {
  if (index >= STOPS.length - 1) { showEndcard(); return; }
  go(index + 1);
};
const prev = () => go(index - 1);

/* ---------- Recorrido automático ---------- */
function startPlay() {
  if (playTimer) return;
  $("btn-play").setAttribute("aria-pressed", "true");
  $("play-icon").textContent = "❚❚";
  $("play-label").textContent = "Pausar";
  playTimer = setInterval(() => {
    if (!transitioning && !document.hidden) next();
  }, AUTOPLAY_MS);
}
function stopPlay() {
  if (!playTimer) return;
  clearInterval(playTimer);
  playTimer = null;
  $("btn-play").setAttribute("aria-pressed", "false");
  $("play-icon").textContent = "▶";
  $("play-label").textContent = "Recorrido automático";
}
function togglePlay() {
  if (playTimer) { stopPlay(); } else { hideEndcard(); startPlay(); }
}

/* ---------- Tarjeta final ---------- */
function showEndcard() {
  stopPlay();
  endcard.hidden = false;
}
function hideEndcard() {
  endcard.hidden = true;
}

/* ------------------------------------------------------------
   EVENTOS UI
   ------------------------------------------------------------ */

buildTimeline();

$("btn-prev").addEventListener("click", prev);
$("btn-next").addEventListener("click", next);
$("btn-play").addEventListener("click", togglePlay);
$("btn-mobile-mode").addEventListener("click", () => {
  setMobileMode(document.body.dataset.mobileMode === "model" ? "story" : "model");
});
$("btn-start").addEventListener("click", () => {
  intro.classList.add("gone");
  ui.inert = false;
  go(0);
});
$("brand-home").addEventListener("click", (e) => {
  e.preventDefault();
  hideEndcard();
  go(0);
});
$("btn-restart").addEventListener("click", () => {
  hideEndcard();
  go(0);
});
$("btn-about-end").addEventListener("click", () => $("about").showModal());
$("btn-about").addEventListener("click", () => $("about").showModal());

// Enlaces #parada=<slug> abiertos con la página ya cargada (p. ej. desde otra parada).
window.addEventListener("hashchange", () => {
  const slug = decodeURIComponent((location.hash.match(/parada=([^&]+)/) || [])[1] || "");
  const target = STOPS.findIndex((s) => s.slug === slug);
  if (target < 0 || target === index) return;
  intro.classList.add("gone");
  ui.inert = false;
  go(target);
});

document.addEventListener("keydown", (e) => {
  if ($("about").open) return;
  if (e.key === "ArrowRight") { next(); }
  else if (e.key === "ArrowLeft") { prev(); }
  else if (e.key === " ") {
    if (intro.classList.contains("gone")) { e.preventDefault(); togglePlay(); }
  }
});

/* ------------------------------------------------------------
   ESCENA 3D
   ------------------------------------------------------------ */

const TARGET_SIZE = 3.2;          // dimensión máxima normalizada del modelo
const BG = 0x10151c;
// Versionado por contenido de las copias web (models/web/). La prueba estática
// recalcula los hashes, así que este mapa no puede quedar desfasado.
const MODEL_VERSIONS = Object.freeze({
  "antigua-aduana": "41873ca9",
  "banco-dugand": "980a86b4",
  "bellas-artes": "ed8eb09f",
  "caja-agraria": "269d58ab",
  "cine-rex": "7582bac4",
  "edificio-garcia": "5f287ace",
  "edificio-scadta": "6aa38838",
  "estacion-montoya": "567c00e6",
  "estadio-romelio-martinez": "637353a5",
  "hotel-el-prado": "e1081efb",
  "iglesia-san-nicolas": "b104dca9",
  "intendencia-fluvial": "b02729e6",
  "teatro-colon": "33a69ad1",
});

let renderer = null;
let scene, camera, controls;
let keyLight, hemi;
let clock = null;
let webglOK = true;
const preparedBounds = new WeakMap(); // objeto preparado -> límites normalizados
const loadPromises = new Map();   // slug -> Promise
let modelRequestId = 0;           // evita que una carga vieja cambie el loader actual

let currentHolder = null;         // grupo visible actualmente
let fadeState = null;             // animación de fundido {holder, phase, t, onDone}
let lastModelH = 1.4;             // altura escalada del modelo actual

// cámara: distancia y objetivo con llegada suave
const camGoal = { dist: 7, targetY: 1.1 };
let userInteracting = false;
let resumeTimer = null;

/** Distancia de encuadre según pantalla: en retrato cabe por ancho, no por alto. */
function applyFraming() {
  const h = lastModelH;
  camGoal.targetY = Math.max(0.7, h * 0.42);
  let dist = TARGET_SIZE * 2.1 + h * 0.25;
  if (camera && camera.aspect < 1) {
    // pantallas verticales: garantizar que el ancho del modelo quepa
    const halfHFov = Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
    dist = Math.max(dist, (TARGET_SIZE * 0.72) / Math.tan(halfHFov));
  }
  const area = camera && freeArea();
  if (area) {
    // escritorio: el modelo (≈ 1,2 × TARGET_SIZE de ancho aparente) cabe en la franja libre
    const halfHFov = Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
    const fraction = area.width / window.innerWidth;
    dist = Math.max(dist, (TARGET_SIZE * 0.6) / (fraction * Math.tan(halfHFov)));
  }
  camGoal.dist = Math.max(4.6, Math.min(18, dist));
  // la niebla sólo debe disolver el suelo lejano, nunca el edificio
  if (scene && scene.fog) {
    scene.fog.near = camGoal.dist + 4;
    scene.fog.far = camGoal.dist + 19;
  }
}

function resetView() {
  if (!camera || !controls) return;
  clearTimeout(resumeTimer);
  controls.autoRotate = false;
  controls.enableDamping = false;
  controls.update();

  const offset = new THREE.Vector3(5.4, 3.4, 7)
    .normalize()
    .multiplyScalar(camGoal.dist);
  controls.target.set(0, camGoal.targetY, 0);
  camera.position.copy(controls.target).add(offset);
  controls.update();

  controls.enableDamping = !REDUCED;
  controls.autoRotate = !REDUCED;
}

const gltfLoader = () => {
  const loader = new GLTFLoaderClass();
  if (MeshoptDecoderLib) loader.setMeshoptDecoder(MeshoptDecoderLib);
  return loader;
};

/** Copia web comprimida; si falla (decodificador o red), el GLB canónico. */
function modelUrls(slug) {
  const version = MODEL_VERSIONS[slug];
  const web = `./models/web/${slug}.glb${version ? `?v=${version}` : ""}`;
  const canonical = `./models/${slug}.glb${version ? `?v=${version}` : ""}`;
  return MeshoptDecoderLib ? [web, canonical] : [canonical];
}

/**
 * Franja libre a la derecha del panel narrativo (sólo escritorio). El modelo se
 * centra en ella y la cámara se aleja lo necesario para que quepa sin pisar el texto.
 */
function freeArea() {
  const w = window.innerWidth;
  if (w <= 720) return null;
  const left = $("panel").offsetLeft + $("panel").offsetWidth + 24;
  const arrows = document.querySelector(".arrows");
  const right = (arrows ? arrows.getBoundingClientRect().left : w) - 16;
  if (right - left < w * 0.3) return { center: w * 0.62, width: w * 0.3 };
  return { center: (left + right) / 2, width: right - left };
}

/** Desplaza el centro óptico hacia la franja libre cuando el panel ocupa la izquierda. */
function updateViewOffset() {
  if (!camera) return;
  const w = window.innerWidth, h = window.innerHeight;
  const area = freeArea();
  if (area) camera.setViewOffset(w, h, w / 2 - area.center, 0, w, h);
  else camera.clearViewOffset();
}

function initScene() {
  const canvas = $("stage");
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  } catch (err) {
    webglOK = false;
    canvas.style.display = "none";
    console.warn("WebGL no disponible:", err);
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Neutral conserva el tono de las fachadas (ACES las lavaba hacia el beige).
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 11, 26);
  if (RoomEnvironmentClass) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironmentClass(), 0.04).texture;
    scene.environmentIntensity = 0.32;
    pmrem.dispose();
  }

  camera = new THREE.PerspectiveCamera(
    38,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(5.4, 3.4, 7);
  updateViewOffset();

  controls = new OrbitControlsClass(camera, canvas);
  controls.enableDamping = !REDUCED;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 1.1, 0);
  controls.minDistance = 3.2;
  controls.maxDistance = 13;
  controls.maxPolarAngle = Math.PI * 0.52;
  controls.autoRotateSpeed = REDUCED ? 0 : 0.6;
  controls.enablePan = false;

  controls.addEventListener("start", () => {
    userInteracting = true;
    controls.autoRotate = false;
    clearTimeout(resumeTimer);
  });
  controls.addEventListener("end", () => {
    userInteracting = false;
    clearTimeout(resumeTimer);
    if (REDUCED) {
      controls.autoRotate = false;
      return;
    }
    resumeTimer = setTimeout(() => {
      controls.autoRotate = true;
    }, 3500);
  });

  // Luces
  hemi = new THREE.HemisphereLight(0xbfd0dd, 0x2a2320, 0.65);
  scene.add(hemi);

  keyLight = new THREE.DirectionalLight(0xfff0da, 2.6);
  keyLight.position.set(5, 9, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.left = -5;
  keyLight.shadow.camera.right = 5;
  keyLight.shadow.camera.top = 6;
  keyLight.shadow.camera.bottom = -4;
  keyLight.shadow.bias = -0.0004;
  keyLight.shadow.normalBias = 0.025; // evita el acné de sombra en cubiertas inclinadas
  scene.add(keyLight);

  const rim = new THREE.DirectionalLight(0xffb27a, 1.1);
  rim.position.set(-6, 4, -6);
  scene.add(rim);

  const fill = new THREE.DirectionalLight(0x8fa8bf, 0.45);
  fill.position.set(-3, 2, 6);
  scene.add(fill);

  // Suelo
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(18, 64),
    new THREE.MeshStandardMaterial({ color: 0x161d26, roughness: 0.96, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x334052,
    transparent: true,
    opacity: 0.85,
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(2.42, 2.47, 128), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.005;
  scene.add(ring);

  const ring2 = new THREE.Mesh(
    new THREE.RingGeometry(3.55, 3.58, 128),
    new THREE.MeshBasicMaterial({ color: 0x232d3a, transparent: true, opacity: 0.7 })
  );
  ring2.rotation.x = -Math.PI / 2;
  ring2.position.y = 0.005;
  scene.add(ring2);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    updateViewOffset();
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    applyFraming(); // reencuadrar al girar el teléfono
    if (REDUCED && !userInteracting) resetView();
  });

  clock = new THREE.Clock();
}

/* ---------- Carga y preparación de modelos ---------- */

function getBuildingBounds(obj) {
  const box = new THREE.Box3();
  obj.updateMatrixWorld(true);
  obj.traverse((node) => {
    if (node.isMesh && node.userData.role !== "context") {
      const nodeBox = new THREE.Box3().setFromObject(node);
      box.union(nodeBox);
    }
  });
  return box.isEmpty() ? new THREE.Box3().setFromObject(obj) : box;
}

function prepare(gltfScene) {
  const obj = gltfScene.clone(true);

  // materiales listos para sombras
  obj.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  // Normalizar por edificio. El contexto recibe la misma transformación para
  // conservar su relación espacial, pero no altera escala, centro ni altura.
  const buildingBox = getBuildingBounds(obj);
  const unscaledSize = buildingBox.getSize(new THREE.Vector3());
  const maxDim = Math.max(unscaledSize.x, unscaledSize.y, unscaledSize.z) || 1;
  const scale = TARGET_SIZE / maxDim;
  obj.scale.setScalar(scale);

  if (!buildingBox.isEmpty()) {
    const scaledBuildingBox = getBuildingBounds(obj);
    const center = scaledBuildingBox.getCenter(new THREE.Vector3());
    obj.position.x -= center.x;
    obj.position.z -= center.z;
    obj.position.y -= scaledBuildingBox.min.y;
  }

  obj.updateMatrixWorld(true);
  const normalizedBuildingBounds = getBuildingBounds(obj);
  const normalizedFullBounds = new THREE.Box3().setFromObject(obj);
  const modelSize = normalizedBuildingBounds.getSize(new THREE.Vector3());
  const scaledHeight = modelSize.y;
  preparedBounds.set(obj, {
    buildingBounds: normalizedBuildingBounds,
    fullBounds: normalizedFullBounds,
  });

  return { obj, scaledHeight, modelSize };
}

function loadModel(slug) {
  if (loadPromises.has(slug)) return loadPromises.get(slug);
  const p = (async () => {
    let lastError;
    for (const url of modelUrls(slug)) {
      try {
        const gltf = await gltfLoader().loadAsync(url);
        return prepare(gltf.scene);
      } catch (err) {
        lastError = err;
        console.warn("Fallo al cargar", url, err);
      }
    }
    throw lastError;
  })();
  loadPromises.set(slug, p);
  p.catch(() => {
    if (loadPromises.get(slug) === p) loadPromises.delete(slug);
  });
  return p;
}

function setOpacity(group, v) {
  group.traverse((node) => {
    if (node.isMesh) {
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      for (const m of mats) m.opacity = v;
    }
  });
}

/** Activa/desactiva transparencia para fundidos sin artefactos de orden. */
function setBlending(group, transparent) {
  group.traverse((node) => {
    if (node.isMesh) {
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      for (const m of mats) {
        m.transparent = transparent;
        m.depthWrite = !transparent || m.opacity < 0.99;
        m.needsUpdate = true;
      }
    }
  });
}

async function showModel(slug) {
  if (!webglOK) return;
  const loaderChip = $("loader");
  const requestId = ++modelRequestId;

  let prepared;
  try {
    loaderChip.textContent = "Cargando modelo…";
    loaderChip.hidden = false;
    prepared = await loadModel(slug);
  } catch (err) {
    console.error("No se pudo cargar el modelo", slug, err);
    if (requestId === modelRequestId && STOPS[index] && STOPS[index].slug === slug) {
      loaderChip.textContent = "Modelo no disponible";
      loaderChip.hidden = false;
    }
    return;
  }

  // Si mientras cargaba se cambió de parada, descartar
  if (requestId !== modelRequestId || !STOPS[index] || STOPS[index].slug !== slug) return;
  loaderChip.hidden = true;

  // Encolar salida del modelo anterior
  if (fadeState) {
    scene.remove(fadeState.holder);
    fadeState = null;
  }
  if (currentHolder) {
    const old = currentHolder;
    const outDur = REDUCED ? 0.06 : 0.42; // segundos
    setBlending(old, true);
    fadeState = { holder: old, phase: "out", t: 0, dur: outDur };
    currentHolder = null;
  }

  const holder = new THREE.Group();
  holder.add(prepared.obj);
  holder.scale.setScalar(0.001); // crece durante la entrada
  setBlending(holder, true);
  scene.add(holder);
  currentHolder = holder;

  // Encuadre según altura real del modelo
  lastModelH = prepared.scaledHeight;
  applyFraming();
  controls.minDistance = 2.6;
  controls.maxDistance = 18;
  if (!userInteracting) resetView();

  // entrada del nuevo
  const inDur = REDUCED ? 0.06 : 0.65; // segundos
  fadeIn = { holder, t: 0, dur: inDur };

  const serializeBounds = (box) => ({
    min: box.min.toArray().map((v) => Number.isFinite(v) ? v : null),
    max: box.max.toArray().map((v) => Number.isFinite(v) ? v : null),
  });
  const normalizedBounds = preparedBounds.get(prepared.obj);
  const buildingBounds = serializeBounds(normalizedBounds.buildingBounds);
  const fullBounds = serializeBounds(normalizedBounds.fullBounds);
  let meshes = 0;
  prepared.obj.traverse((node) => { if (node.isMesh) meshes++; });

  // Gancho de diagnóstico (invisible; usado por pruebas automatizadas)
  window.__recorridoDebug = () => ({
    slug,
    meshes,
    buildingBounds,
    fullBounds,
    mobileMode: document.body.dataset.mobileMode || "story",
    opacity: (() => {
      let o = null;
      holder.traverse((n) => {
        if (o === null && n.isMesh) {
          const m = Array.isArray(n.material) ? n.material[0] : n.material;
          o = m.opacity;
        }
      });
      return o;
    })(),
    camDist: camera.position.distanceTo(controls.target),
  });
}

let fadeIn = null;

// Diagnóstico del bucle
const __anim = { ticks: 0, sumDt: 0, lastDt: 0 };

/* ---------- Bucle ---------- */

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

function animate() {
  requestAnimationFrame(animate);
  if (!webglOK) return;
  const dt = Math.min(clock.getDelta(), 0.1);

  // Estadísticas de diagnóstico (sin costo apreciable)
  __anim.ticks++;
  __anim.sumDt += dt;
  __anim.lastDt = dt;

  // salida del modelo anterior
  if (fadeState) {
    fadeState.t += dt;
    const k = Math.min(fadeState.t / fadeState.dur, 1);
    const e = easeOutCubic(k);
    if (fadeState.phase === "out") {
      setOpacity(fadeState.holder, 1 - e);
      fadeState.holder.position.y = -0.35 * e;
      if (k >= 1) {
        scene.remove(fadeState.holder);
        fadeState = null;
      }
    }
  }

  // entrada del modelo nuevo
  if (fadeIn) {
    fadeIn.t += dt;
    const k = Math.min(fadeIn.t / fadeIn.dur, 1);
    const e = easeOutCubic(k);
    setOpacity(fadeIn.holder, e);
    fadeIn.holder.scale.setScalar(Math.max(e, 0.001));
    if (k >= 1) {
      setOpacity(fadeIn.holder, 1);
      fadeIn.holder.scale.setScalar(1);
      setBlending(fadeIn.holder, false); // sólido de nuevo: sin artefactos
      fadeIn = null;
    }
  }

  // Llegada suave de cámara. Con movimiento reducido, resetView aplica la pose
  // final de forma inmediata y este interpolador queda deshabilitado.
  if (!REDUCED && !userInteracting) {
    const offset = camera.position.clone().sub(controls.target);
    const len = offset.length();
    const goalLen = camGoal.dist;
    const newLen = len + (goalLen - len) * (1 - Math.exp(-dt * 2.2));
    if (Math.abs(goalLen - newLen) > 0.005) {
      offset.multiplyScalar(newLen / len);
      camera.position.copy(controls.target).add(offset);
    }

    const ty = controls.target.y;
    const ny = ty + (camGoal.targetY - ty) * (1 - Math.exp(-dt * 2.2));
    if (Math.abs(camGoal.targetY - ny) > 0.002) {
      controls.target.y = ny;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

/* ------------------------------------------------------------
   ARRANQUE — carga dinámica de Three.js con degradación elegante
   ------------------------------------------------------------ */

(async function bootstrap() {
  try {
    THREE = await import("three");
    const [orbit, gltf, ...optional] = await Promise.allSettled([
      import("three/addons/controls/OrbitControls.js"),
      import("three/addons/loaders/GLTFLoader.js"),
      import("three/addons/libs/meshopt_decoder.module.js"),
      import("three/addons/environments/RoomEnvironment.js"),
    ]);
    if (orbit.status === "rejected") throw orbit.reason;
    if (gltf.status === "rejected") throw gltf.reason;
    OrbitControlsClass = orbit.value.OrbitControls;
    GLTFLoaderClass = gltf.value.GLTFLoader;
    // Opcionales: sin ellos se usan los GLB canónicos y la luz directa.
    const [meshopt, room] = optional;
    if (meshopt.status === "fulfilled") {
      try {
        await meshopt.value.MeshoptDecoder.ready;
        MeshoptDecoderLib = meshopt.value.MeshoptDecoder;
      } catch (err) {
        console.warn("Decodificador meshopt no disponible:", err);
      }
    }
    if (room.status === "fulfilled") RoomEnvironmentClass = room.value.RoomEnvironment;
    initScene();
  } catch (err) {
    webglOK = false;
    $("stage").style.display = "none";
    console.warn("Escena 3D no disponible (¿sin red o sin WebGL?):", err);
  }
  animate();

  // ¿deep-link? #parada=edificio-garcia
  const hashSlug = decodeURIComponent(
    (location.hash.match(/parada=([^&]+)/) || [])[1] || ""
  );
  const startIndex = STOPS.findIndex((s) => s.slug === hashSlug);
  // Compatibilidad con el enlace del atlas anterior: el slug permanente ahora
  // sirve este recorrido narrativo, así que #/recorrido debe abrir su primera
  // parada en lugar de dejar la portada sin una ruta reconocida.
  const legacyRoute = location.hash === "#/recorrido";

  if (legacyRoute || startIndex > 0) {
    intro.classList.add("gone"); // salta la portada
    ui.inert = false;
    go(legacyRoute ? 0 : startIndex);
  } else if (startIndex === 0) {
    intro.classList.add("gone");
    ui.inert = false;
    go(0);
  } else if (webglOK) {
    // Precarga de la primera parada detrás de la portada
    loadModel(STOPS[0].slug).catch(() => {});
  }
})();
