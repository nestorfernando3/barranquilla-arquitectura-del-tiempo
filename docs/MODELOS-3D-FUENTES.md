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

## Inventario validado — 2026-08-23

Cifras de `npm run validate:all`; KB = bytes / 1024 con una decimal. `partes` es
el número de nodos de malla semánticos. En Teatro Colón hay cuatro archivos
locales pero `photo-4.jpg` es una copia byte-idéntica y acreditada de
`photo-3.jpg`, por lo que representan tres registros fotográficos distintos.

| slug | fotos locales | nivel / generador | partes | triángulos | tamaño |
|---|---:|---|---:|---:|---:|
| antigua-aduana | 4 | L2 · modelgen | 31 | 2 164 | 189.1 KB |
| banco-dugand | 2 | L2 · modelgen | 21 | 2 500 | 207.5 KB |
| bellas-artes | 2 | L2 · modelgen | 24 | 2 744 | 227.6 KB |
| caja-agraria | 2 | L2 · modelgen | 17 | 10 032 | 778.2 KB |
| cine-rex | 3 | L2 · modelgen | 35 | 2 796 | 241.1 KB |
| edificio-garcia | 2 | L2 · modelgen | 30 | 2 332 | 202.1 KB |
| edificio-scadta | 2 | L2 · modelgen | 33 | 2 836 | 242.1 KB |
| estacion-montoya | 2 | L2 · modelgen | 13 | 368 | 38.9 KB |
| estadio-romelio-martinez | 4 | L2 · modelgen | 20 | 960 | 91.1 KB |
| hotel-el-prado | 4 | L2 · modelgen | 15 | 3 572 | 284.0 KB |
| iglesia-san-nicolas | 2 | L2 · modelgen | 29 | 2 416 | 207.7 KB |
| intendencia-fluvial | 3 | L2 · modelgen | 19 | 1 256 | 111.0 KB |
| teatro-colon | 4 (3 fuentes) | L2 · modelgen | 26 | 2 432 | 206.2 KB |

Todos quedan bajo el límite de 100 000 triángulos y 8 MB por activo.

## Alcance y limitaciones por edificio

### antigua-aduana — 31 partes

- Fuentes: cuatro vistas CC BY-SA 4.0.
- Modelo: cuerpo amarillo de dos plantas, vanos y balconcillos, pórtico central de
  seis columnas con frontón, parapeto y pabellón esquinero cupulado.
- Corrección: no contiene la torre de reloj central de la lectura anterior, no
  documentada por la fotografía.
- Limitaciones: zaga, interiores, carpinterías finas y detalles del relieve.

### banco-dugand — 21 partes

- Fuentes: dos vistas CC BY-SA 4.0.
- Modelo: escalinata, ocho columnas clásicas gigantes, huecos profundos,
  entablamento con dentículos, frontón y ático.
- Corrección: representa un frente monumental de templo, no la antigua
  interpretación de esquina residencial/comercial de vanos repetidos.
- Limitaciones: interiores, costados no visibles y detalle exacto de capiteles.

### bellas-artes — 24 partes

- Fuentes: dos vistas CC BY-SA 4.0 / CC BY 3.0.
- Modelo: sede neocolonial de dos plantas con pórtico, balconada, arcos, loggias
  laterales, teja y jardín de contexto.
- Limitaciones: año y autoría siguen abiertos; laterales, fondo e interiores se
  resuelven sin detalle histórico no comprobado.

### caja-agraria — 17 partes

- Fuentes: dos vistas de dominio público del muro-relieve y costado nervado.
- Modelo: torre neutra, paño ciego modular, campo de placas en relieve, bandas de
  losa, remate técnico, antenas y plaza.
- Limitaciones: reconstrucción evocativa; no hay foto libre de la fachada
  principal ni del acceso y el modelo no los inventa.

### cine-rex — 35 partes

- Fuentes: tres vistas CC BY-SA 4.0 / dominio público.
- Modelo: dos brazos de dos niveles, esquina redondeada, bandas curvas, persianas,
  ventanales, paneles perforados, pilonos y emblema concéntrico RX.
- Corrección: conserva el carácter comercial-streamline fotografiado, no una
  fachada genérica de cine con marquesina inventada.
- Limitaciones: sala, platea, cubierta posterior e interiores.

### edificio-garcia — 30 partes

- Fuentes: dos vistas de Jdvillalobos / José David Villalobos, dominio público
  (PD-self), registradas en `assets/reference-images/edificio-garcia/credits.json`.
- Modelo de producción: basamento comercial, dos bandas de balcón curvo, ventanas
  corridas, bloques de vidrio, cuerpos retranqueados y torre posterior; L2 procedural.
- Archivo de proceso: la malla Hunyuan3D anterior se conserva fuera de producción
  en `assets/model-archive/edificio-garcia-hunyuan3d.glb` para auditoría histórica.
- Limitaciones: masa posterior, fachadas ocultas, cubierta e interiores son neutros
  o inferidos desde las dos tomas.

### edificio-scadta — 33 partes

- Fuentes: dos vistas CC BY-SA 4.0 / dominio público.
- Modelo: basamento comercial, tres niveles, esquina redondeada, dos balcones
  curvos apilados, bandas blancas, retículas de ventanas y parapeto bajo.
- Limitaciones: zaga, interiores y equipos de cubierta; no se afirma un mirador
  independiente de azotea.

### estacion-montoya — 13 partes

- Fuentes: dos vistas CC BY 3.0.
- Modelo: volumen compacto de ladrillo, hastial, mirador octogonal, cubiertas,
  quicios claros, carpinterías verdes, marquesinas, balcones y plataforma.
- Limitaciones: interiores, costado ferroviario completo y detalle de herrería.

### estadio-romelio-martinez — 20 partes

- Fuentes: cuatro vistas de dominio público, CC BY 3.0 y CC BY-SA 3.0.
- Modelo: gradería histórica, estructura repetida, cubierta curva, pabellón de
  acceso déco, torre, aletas, balcón, celosías y cancha de contexto abreviada.
- Limitaciones: anillo completo y estado posterior a remodelaciones; los murales
  son información pictórica, no relieve modelado.

### hotel-el-prado — 15 partes

- Fuentes: cuatro vistas CC BY-SA 4.0 / dominio público.
- Modelo: tres alas bajas en U, loggias, cubiertas de teja, torre central una
  planta más alta, portal y piscina de contexto.
- Limitaciones: interiores, ampliaciones, escudos, toldos y detalle de jardín.

### iglesia-san-nicolas — 29 partes

- Fuentes: dos vistas CC BY-SA 3.0 / CC BY-SA 4.0.
- Modelo: nave, cubierta, dos torres, paños y portales apuntados, dos rosetones con
  tracería, campanarios, cupulines, pináculos y contrafuertes.
- Limitaciones: retablos, vitrales, interiores y laterales no fotografiados.

### intendencia-fluvial — 19 partes

- Fuentes: tres vistas CC BY-SA 4.0 / CC BY-SA 3.0.
- Modelo: bloque azul de dos plantas, cubierta oculta, esquineros y recercos
  blancos, ventanas, pórtico, dos balcones, cornisa y parapeto escalonado.
- Limitaciones: zaga, interiores y cubierta detrás del parapeto; no contiene una
  torre-campanario inventada.

### teatro-colon — 26 partes

- Fuentes: cuatro archivos locales acreditados (tres registros distintos), CC
  BY-SA 4.0 / CC BY 3.0.
- Modelo: fachada art déco amarilla/turquesa asimétrica, torre lateral, planos que
  evocan carabelas, muro reticulado de vidrio, ventana corrida y marquesina curva.
- Limitaciones: masa de sala y zaga es neutra/inferida; no se inventan interiores,
  cúpula ni una composición posterior simétrica.

## Reproducibilidad

```bash
cd tools/modelgen
npm test
npm run build:all
npm run validate:all
node preview.mjs scenes/<slug>.json /tmp/<slug>-front.svg --az 90 --el 8
```

Las escenas JSON son la fuente geométrica reproducible. Un refinamiento debe
partir de ellas, mantener la trazabilidad fotográfica y volver a sincronizar los
dos destinos mediante `build:all`; no se reemplazan GLB individuales a mano.
