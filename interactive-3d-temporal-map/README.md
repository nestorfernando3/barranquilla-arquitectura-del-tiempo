# Barranquilla: Arquitectura del Tiempo

> Una ciudad leída a través de sus edificios. **El mapa representa el espacio; la fragmentación 3D representa el tiempo.**

Documental interactivo / atlas vivo sobre la historia urbana de Barranquilla a través de su
arquitectura. Prototipo v1 — los datos históricos llevan niveles de certeza visibles
(`✓ verificado` · `◍ aproximado` · `? hipótesis`) y **no deben publicarse como definitivos**
sin la fase de curaduría documental.

## Ejecutar

```bash
npm install
npm run dev       # desarrollo
npm run build     # producción optimizada por vistas (dist/)
npm run build:single # entrega autocontenida en un solo HTML
npm run preview   # servir el build
```

Stack: React 19 + Vite + TypeScript estricto · React Three Fiber + Drei (escenas 3D procedurales) ·
GSAP ScrollTrigger (coreografía del recorrido) · Zustand (estado compartido mapa/cronología/escena) ·
Web Audio API (paisaje sonoro procedural, opcional) · SVG cartográfico autoral (sin tokens propietarios).

## Estructura

```
src/
  data/
    buildings.ts   ← datos históricos + volumetría + perfil de fragmentación (FUENTE ÚNICA)
    chapters.ts    ← capítulos del recorrido guiado (copy editorial)
  lib/
    audio.ts       ← paisaje sonoro procedural (río/brisa/resonancia)
    blueprint.ts   ← planos interpretativos generados en canvas
  three/
    Canvas3D.tsx     ← wrapper WebGL con degradación accesible sin WebGL
    FragmentModel.tsx← motor de fragmentación (capas, etiquetas, nubes de puntos, río…)
    PrologueScene.tsx / ChapterScene.tsx / FichaScene.tsx
  components/
    Shell.tsx · Prologue.tsx · GuidedTour.tsx · CityMap.tsx · BuildingFicha.tsx · Sources.tsx
  store.ts         ← Zustand + enrutamiento por hash (#/recorrido, #/mapa, #/edificio/slug, #/fuentes)
```

## Cómo agregar un edificio (sin reescribir la app)

1. Abre `src/data/buildings.ts` y añade un objeto al array `BUILDINGS` siguiendo el tipo `Building`:
   - **Datos**: `slug`, `name`, `sector`, `era` (una de las 5), `year`, `status`…
   - **Certeza**: marca cada fecha/autoría con `yearCertainty`, `architectCertainty`, etc.
   - **Madurez**: declara `productionStage`; una volumetría preliminar nunca debe marcarse `publicable`.
   - **Volumetría**: `massing.boxes` y `massing.defaultEvidence`. Cada parte puede sobrescribir
     `evidence` (`documentado / inferido / evocativo / desconocido`) y añadir `citationIds`.
   - **Perfil de fragmentación**: `massing.profile = { axis, spread, twist }` —
     `axis: "y"` estratos históricos, `axis: "x"` alas/patio, `axis: "z"` cortes/secciones.
   - **Capas**: textos para `forma / material / funcion / ciudad / memoria`.
   - **Fuentes**: usa citas recuperables (`id`, `title`, `institution`, `url`, `pages`, `supports`).
     Las referencias heredadas sin URL se mantienen como pendientes, nunca como prueba suficiente.
   - Extras opcionales: `massing.extras: ["rails"|"gardens"|"plaza"|"pointcloud"]`,
     `massing.context` (volúmenes vecinos para la capa Ciudad).
2. Listo: aparece en el mapa, en los filtros, en la línea temporal y su ficha 3D funciona
   automáticamente. Para incluirlo en el **recorrido guiado**, añade/ajusta un capítulo en
   `src/data/chapters.ts` (`scene` apunta a la escena) y, si es protagónico, en `ChapterScene.tsx`.
3. Para rutas curatoriales, regístralo en `ROUTES` (mismo archivo de buildings).

## Próxima fase editorial (los 13 modelos L1/L2 ya están construidos)

- [ ] Fotografías contemporáneas con licencia de cada edificio (sección «archivo vs presente»).
- [ ] Material de archivo legal (Banco de la República, Archivo Histórico del Atlántico, hemerotecas).
- [ ] Refinamiento L2 opcional por fachada (detalle, compresión Draco/Meshopt) sin perder el
  fallback procedural ni los límites de presupuesto.
- [ ] Testimonios orales con transcripción (especial para edificios perdidos).
- [ ] Ambientes sonoros grabados por sector (hoy: síntesis procedural).
- [ ] Textos en inglés / versión costeña accesible (lectores de pantalla ya soportados).

## Datos que requieren validación documental

La lista completa y viva está en `#/fuentes` (tabla «Datos pendientes de verificación»).
La etapa de producción y los niveles de certeza son visibles. Una fecha verificada no convierte
automáticamente en verificadas la autoría, las coordenadas o la geometría. Prioridades de curaduría:

1. Antigua Aduana — ficha BIC individual y validación geométrica (fecha 1919–1921 y
   autoría Arbouin verificadas el 2026-08-22).
2. Hotel El Prado — alcance de las transformaciones y validación geométrica (fecha y autoría verificadas).
3. Edificio García — año (c. 1939), arquitecto, nivel de protección.
4. Estación Montoya — autoría y fases de transformación (inauguración 1871 verificada).
5. Teatro Rex — fecha y lenguaje verificados; autoría resuelta (Manuel Carrerá, 2026-08-22); faltan coordenadas y estado de campo.
6. Romelio Martínez — partes originales subsistentes tras la remodelación.

**Actualización 2026-08-22:** la revisión documental resolvió estilos/autorías/fechas de
Colón, Dugand, Aduana, Montoya, Rex y Scadta (ver «Flags curatoriales» en
`../docs/MODELOS-3D-FUENTES.md`). Bellas Artes queda parcialmente abierto.

## Ética de representación

- No se generan ni presentan fotografías falsas de archivo.
- Los planos son «interpretativos» y se etiquetan siempre como tales.
- Solo lo realmente perdido y documentado puede representarse como nube de puntos / contorno.
- Lo documentado, inferido, evocativo y desconocido se codifica de forma distinta en los modelos.
- Todo el contenido histórico es accesible sin WebGL (texto completo + mapa SVG + ficha documental).

## Modelos 3D — pipeline `modelgen`

Las 13 fichas cuentan con un modelo GLB validado en `public/models/` que sustituye la masa procedural
solo en la capa Forma (`mode === "forma"`), dentro de un `Suspense` con **fallback automático**
a la volumetría procedural si el activo falla o tarda en cargar (ver `src/three/FichaScene.tsx`
y `src/three/HeritageModel.tsx`).

- **Generación**: todos los GLB (salvo el del Edificio García, preexistente de Hunyuan3D) se
  construyen con el generador del repo: escenas JSON → geometría low-poly con partes nombradas
  (ver `../tools/modelgen/MODELGEN-GUIDE.md` y las escenas en `../tools/modelgen/scenes/`).
- **Presupuesto**: ≤ 100k triángulos y ≤ 8 MB por activo (los actuales quedan entre ~27 KB y
  ~1.4 MB). La app normaliza la escala (`model3d.targetSize ≈ 4.8`): importan las proporciones,
  no los metros absolutos.
- **Evidencia**: cada entrada declara `model3d.evidence` (`documentado / inferido / evocativo`)
  y una `note` con sus limitaciones; el nivel se muestra al usuario junto a la fuente.
- **Créditos**: cada `model3d.credit` atribuye autores y licencias de las fotos de referencia
  (Wikimedia Commons: CC0 / CC BY / CC BY-SA / dominio público). Registro por edificio:
  `../docs/MODELOS-3D-FUENTES.md`.
- **Modelos recién incorporados**: `bellas-artes.glb`, `caja-agraria.glb` y
  `estadio-romelio-martinez.glb`. Caja Agraria queda marcada como `evocativo` porque las
  fuentes libres solo documentan el muro lateral y el costado de la torre; Bellas Artes
  conserva una alerta curatorial porque las fotos muestran un lenguaje neocolonial que
  contradice el brief moderno previo.

### Reconstrucción 3D asistida — Edificio García

La malla se produjo localmente con Modly 0.4.1 y Hunyuan3D 2 Mini Turbo desde la fotografía
«Barranquilla Edificio García» de Jdvillalobos (2008, dominio público, Wikimedia Commons). Se trata
como evidencia **evocativa**: la vista frontal orienta los volúmenes visibles, mientras las fachadas
ocultas y la cubierta son inferencias del modelo. El GLB solo reemplaza la capa Forma; Material,
Función, Ciudad y Memoria mantienen los diagramas explicativos. Si el activo no carga, la ficha
recupera automáticamente su masa procedural.

### Modelos 3D procedurales

Los demás edificios usan reconstrucciones procedurales L1/L2 guardadas como GLB en
`public/models/`. Las escenas fuente están en `../tools/modelgen/scenes/` y se generan
con el toolkit `../tools/modelgen/`:

```bash
cd ../tools/modelgen
node build-model.mjs scenes/<slug>.json ../../interactive-3d-temporal-map/public/models/<slug>.glb
node validate.mjs ../../interactive-3d-temporal-map/public/models/<slug>.glb
```

Cada activo se declara en `model3d` dentro de `src/data/buildings.ts`, junto a su URL,
crédito, nivel de evidencia y limitaciones. Son interpretaciones volumétricas basadas en
fotografías con licencia libre, no levantamientos. El presupuesto por activo es menor de
100k triángulos y 8 MB; si un GLB no carga, la capa Forma vuelve automáticamente al
`massing` procedural. La trazabilidad completa de fotos, licencias y discrepancias entre
brief y evidencia se mantiene en `../docs/MODELOS-3D-FUENTES.md`.

## Accesibilidad y rendimiento

WCAG 2.2 AA como piso: navegación por teclado (pines del mapa enfocables), foco visible,
contraste alto, `prefers-reduced-motion` integral, descripciones textuales de cada escena,
objetos táctiles ≥ 44 px, sin audio automático. Rendimiento: geometría procedural low-poly,
materiales reutilizados, un canvas por vista, `dpr` limitado, menos partículas en móvil,
modo degradado funcional sin WebGL.

La producción normal separa mapa, recorrido, fichas, fuentes y motor 3D. El marco inicial pesa
aproximadamente 94 KB gzip y muestra la interfaz antes de solicitar WebGL. El canvas reduce DPR y
antialias en pantallas compactas, respeta movimiento reducido y detiene el render cuando la pestaña
queda oculta. `build:single` conserva la entrega offline autocontenida cuando sea necesaria.
