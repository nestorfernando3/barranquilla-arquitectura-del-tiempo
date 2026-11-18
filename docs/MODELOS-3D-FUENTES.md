# Modelos 3D — fuentes, alcance y procedencia

Este registro describe los activos que se exhiben en
`interactive-3d-temporal-map/public/models/` y `recorrido-narrativo/models/`.
Los dos directorios contienen el mismo juego byte-idéntico de trece GLB.

## Método y alcance

Los 13/13 modelos de producción son reconstrucciones procedurales
interpretativas L2, informadas por fotografías de Wikimedia Commons con
licencias CC BY, CC BY-SA o de dominio público. Cada escena declara fachada
`+z`, nivel L2, nombres semánticos, el rol de cada parte (`building` o
`context`) y su evidencia (`documented`, `inferred` o `evocative`). El
validador comprueba esos metadatos además de geometría, normales, materiales,
límites, presupuesto y coincidencia de ambos destinos.

No son levantamientos arquitectónicos ni afirman precisión métrica. Las
fachadas ocultas, interiores, cubiertas no fotografiadas y detalles finos se
mantienen simplificados, inferidos o neutros. Los créditos por archivo viven en
`assets/reference-images/<slug>/credits.json`; los enlaces `sourceUrl` llevan a
la ficha de Commons donde consta la licencia.

El activo Hunyuan3D anterior de García se preserva únicamente como archivo de
proceso en `assets/model-archive/edificio-garcia-hunyuan3d.glb`. Aquella malla
histórica de 80 000 triángulos fue reemplazada y no se muestra en el atlas ni en
el recorrido; el García de producción es la escena procedural L2 actual.

## Inventario validado — 2026-11-17

Cifras de `npm run validate:all` sobre los GLB canónicos; KB = bytes / 1024 con
una decimal. `partes` es el número de nodos de malla semánticos. La columna
`web` es la copia que carga el recorrido (`recorrido-narrativo/models/web/`):
mallas fusionadas por rol y material, vértices soldados y compresión
`EXT_meshopt_compression`. En Teatro Colón hay cuatro archivos locales pero
`photo-4.jpg` es una copia byte-idéntica y acreditada de `photo-3.jpg`.

| slug | fotos locales | partes | triángulos | canónico | web |
|---|---:|---:|---:|---:|---:|
| antigua-aduana | 4 | 450 | 9 536 | 1075.6 KB | 105.1 KB |
| banco-dugand | 2 | 263 | 8 792 | 866.7 KB | 99.0 KB |
| bellas-artes | 2 | 216 | 7 352 | 724.0 KB | 83.3 KB |
| caja-agraria | 2 | 79 | 10 776 | 880.8 KB | 101.3 KB |
| cine-rex | 3 | 1 023 | 28 228 | 2921.1 KB | 306.9 KB |
| edificio-garcia | 2 | 1 106 | 19 188 | 2290.0 KB | 221.4 KB |
| edificio-scadta | 2 | 634 | 12 240 | 1441.7 KB | 141.0 KB |
| estacion-montoya | 2 | 508 | 6 244 | 858.0 KB | 85.0 KB |
| estadio-romelio-martinez | 4 | 202 | 5 796 | 602.6 KB | 76.3 KB |
| hotel-el-prado | 4 | 431 | 13 332 | 1346.3 KB | 148.4 KB |
| iglesia-san-nicolas | 2 | 124 | 8 072 | 710.1 KB | 99.6 KB |
| intendencia-fluvial | 3 | 232 | 3 812 | 473.0 KB | 53.8 KB |
| teatro-colon | 4 (3 fuentes) | 365 | 6 532 | 782.1 KB | 78.2 KB |

Todos quedan bajo el límite de 100 000 triángulos y 8 MB por activo.

## Alcance y limitaciones por edificio

### antigua-aduana

- Fuentes: cuatro vistas CC BY-SA 4.0.
- Modelo: cuerpo amarillo ocre de dos plantas con recercos blancos, vanos y
  balconcillos, guardapolvos oscuros sobre las ventanas altas, pórtico central de
  seis columnas con frontón, parapeto y pabellón esquinero cupulado.
- Revisión 2026-11-17: pilastrillas y guardapolvos alineados con los ejes reales
  de las ventanas (estaban desplazados 1,2 m y algunas pilastras cruzaban vanos);
  guardapolvos oscuros e inclinados como en las cuatro fotos.
- Corrección: no contiene la torre de reloj central de la lectura anterior, no
  documentada por la fotografía.
- Limitaciones: zaga, interiores, carpinterías finas y detalles del relieve.

### banco-dugand

- Fuentes: dos vistas CC BY-SA 4.0.
- Modelo: escalinata, ocho columnas clásicas gigantes, huecos profundos,
  entablamento con dentículos, frontón y ático.
- Corrección: representa un frente monumental de templo, no la antigua
  interpretación de esquina residencial/comercial de vanos repetidos.
- Limitaciones: interiores, costados no visibles y detalle exacto de capiteles.

### bellas-artes

- Fuentes: dos vistas CC BY-SA 4.0 / CC BY 3.0.
- Modelo: sede neocolonial de dos plantas con pórtico, balconada, arcos, loggias
  laterales, teja y jardín de contexto.
- Limitaciones: año y autoría siguen abiertos; laterales, fondo e interiores se
  resuelven sin detalle histórico no comprobado.

### caja-agraria

- Fuentes: dos vistas de dominio público del muro-relieve y costado nervado.
- Modelo: torre neutra, paño ciego modular, campo de placas en relieve, bandas de
  losa, remate técnico, antenas y plaza.
- Limitaciones: reconstrucción evocativa; no hay foto libre de la fachada
  principal ni del acceso y el modelo no los inventa.

### cine-rex

- Fuentes: tres vistas CC BY-SA 4.0 / dominio público.
- Modelo: dos brazos de dos niveles, esquina redondeada, bandas curvas, persianas,
  ventanales, paneles perforados, pilonos y emblema concéntrico RX.
- Corrección: conserva el carácter comercial-streamline fotografiado, no una
  fachada genérica de cine con marquesina inventada.
- Limitaciones: sala, platea, cubierta posterior e interiores.

### edificio-garcia

- Fuentes: dos vistas de Jdvillalobos / José David Villalobos, dominio público
  (PD-self), registradas en `assets/reference-images/edificio-garcia/credits.json`.
- Modelo de producción: basamento comercial, dos bandas de balcón curvo, ventanas
  corridas, bloques de vidrio, cuerpos retranqueados y torre posterior; L2 procedural.
- Archivo de proceso: la malla Hunyuan3D anterior se conserva fuera de producción
  en `assets/model-archive/edificio-garcia-hunyuan3d.glb` para auditoría histórica.
- Limitaciones: masa posterior, fachadas ocultas, cubierta e interiores son neutros
  o inferidos desde las dos tomas.

### edificio-scadta

- Fuentes: dos vistas CC BY-SA 4.0 / dominio público.
- Modelo: basamento comercial, tres niveles, esquina redondeada, dos balcones
  curvos apilados, bandas blancas, retículas de ventanas y parapeto bajo.
- Limitaciones: zaga, interiores y equipos de cubierta; no se afirma un mirador
  independiente de azotea.

### estacion-montoya

- Fuentes: dos vistas CC BY 3.0. `photo-1` documenta el costado corto y la
  esquina ochavada; `photo-2`, la fachada larga con rótulo, balcón corrido y
  hastial con puerta y balconcillo.
- Modelo (generador `generators/estacion-montoya.mjs`): dos plantas de ladrillo
  con esquina ochavada integrada, sillares claros alternados, cubierta a cuatro
  aguas con alero oscuro y baranda de cumbrera, hastial frontal con mirador,
  puertas-ventana verdes, marquesinas rojas sobre ménsulas, balcones de hierro,
  rótulo y plaza de ladrillo de contexto.
- Revisión 2026-11-17: se retiró la torre octogonal con cubierta cónica, que no
  aparece en ninguna de las fotos; la faceta fotografiada es una esquina ochavada
  bajo la cubierta principal. Se restituyó el hastial frontal visible en `photo-2`.
- Limitaciones: las letras del rótulo son bloques evocativos, no texto; las
  fachadas -x y -z no tienen vista y quedan lisas, con esquinas y alero.

### estadio-romelio-martinez

- Fuentes: cuatro vistas de dominio público, CC BY 3.0 y CC BY-SA 3.0.
- Modelo: gradería histórica, estructura repetida, cubierta curva, pabellón de
  acceso déco, torre, aletas, balcón, celosías y cancha de contexto abreviada.
- Limitaciones: anillo completo y estado posterior a remodelaciones; los murales
  son información pictórica, no relieve modelado.

### hotel-el-prado

- Fuentes: cuatro vistas CC BY-SA 4.0 / dominio público.
- Modelo: tres alas bajas en U, loggias, cubiertas de teja, torre central una
  planta más alta, portal y piscina de contexto.
- Limitaciones: interiores, ampliaciones, escudos, toldos y detalle de jardín.

### iglesia-san-nicolas

- Fuentes: dos vistas CC BY-SA 3.0 / CC BY-SA 4.0.
- Modelo: nave, cubierta, dos torres, paños y portales apuntados, dos rosetones con
  tracería, campanarios, cupulines, pináculos y contrafuertes.
- Revisión 2026-11-17: bajo la cornisa principal las torres son parte de la
  fachada blanca con pilastras salmón (`photo-2`); el salmón queda en los cuerpos
  altos. Cupulines más esbeltos sobre tambor octogonal y pináculos en las
  esquinas de cada torre.
- Limitaciones: retablos, vitrales, interiores y laterales no fotografiados.

### intendencia-fluvial

- Fuentes: tres vistas CC BY-SA 4.0 / CC BY-SA 3.0.
- Modelo: bloque azul de dos plantas, cubierta de teja a cuatro aguas, esquineros
  y recercos blancos, ventanas, pórtico, dos balcones, cornisa y parapeto escalonado.
- Revisión 2026-11-17: la cubierta de teja asoma sobre el parapeto como en
  `photo-3`; antes quedaba oculta.
- Limitaciones: zaga e interiores; no contiene una torre-campanario inventada.

### teatro-colon

- Fuentes: cuatro archivos locales acreditados (tres registros distintos), CC
  BY-SA 4.0 / CC BY 3.0.
- Modelo: fachada art déco amarilla/turquesa asimétrica, torre lateral, planos que
  evocan carabelas, muro reticulado de vidrio, ventana corrida y marquesina curva.
- Limitaciones: masa de sala y zaga es neutra/inferida; no se inventan interiores,
  cúpula ni una composición posterior simétrica.

## Reproducibilidad

```bash
cd tools/modelgen
node generators/refine-collection.mjs
npm test
npm run build:all        # construye, valida, sincroniza y genera las copias web
npm run validate:all
```

Revisión visual: con un servidor estático en la raíz del repositorio, abrir
`tools/modelgen/review.html?modelo=<slug>`. Muestra cuatro vistas, las fotos de
referencia y un conteo de triángulos degenerados y normales invertidas.

Las escenas JSON son la fuente geométrica reproducible. Un refinamiento debe
partir de ellas, mantener la trazabilidad fotográfica y volver a sincronizar los
dos destinos mediante `build:all`; no se reemplazan GLB individuales a mano.
