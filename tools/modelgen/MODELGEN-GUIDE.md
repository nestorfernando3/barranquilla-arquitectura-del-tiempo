# MODELGEN — Guía del generador procedural L2

`tools/modelgen/` genera las trece reconstrucciones interpretativas L2 de
*Barranquilla: Arquitectura del tiempo*. No produce levantamientos, texturas ni
interiores: convierte escenas JSON auditables en GLB con geometría, normales,
materiales, orientación y evidencia semántica validadas.

## Rutas

- Escenas: `tools/modelgen/scenes/<slug>.json`
- Primer destino de producción: `interactive-3d-temporal-map/public/models/<slug>.glb`
- Segundo destino de producción: `recorrido-narrativo/models/<slug>.glb`
- Fotografías y créditos: `assets/reference-images/<slug>/photo-N.jpg` y `credits.json`
- Datos editoriales: `interactive-3d-temporal-map/src/data/buildings.ts`

Los comandos de esta guía se ejecutan desde `tools/modelgen/`.

## Comandos

```bash
npm test
npm run build:all
npm run validate:all

node build-model.mjs scenes/<slug>.json ../../interactive-3d-temporal-map/public/models/<slug>.glb
node validate.mjs ../../interactive-3d-temporal-map/public/models/<slug>.glb
node preview.mjs scenes/<slug>.json /tmp/<slug>-iso.svg --az 35 --el 22
node preview.mjs scenes/<slug>.json /tmp/<slug>-front.svg --az 90 --el 8
node preview.mjs scenes/<slug>.json /tmp/<slug>-side.svg --az 0 --el 8
qlmanage -t -s 900 -o /tmp /tmp/<slug>-front.svg
```

`npm run build:all` exige exactamente las trece escenas, construye y valida los
trece GLB en un staging temporal y reemplaza atómicamente los dos destinos sólo
si sus archivos y hashes coinciden. `npm run validate:all` no construye: exige
dos juegos completos, byte-idénticos, y valida ambos. La fachada declarada mira
hacia `+z`; por la convención orbital de `preview.mjs`, la vista frontal correcta
es `--az 90`, no `--az 0`.

## Generadores dedicados y copias web

- `generators/refine-collection.mjs` parte de `baselines/2026-09-09/` y escribe
  `scenes/`. Teatro Rex (`teatro-rex.mjs`) y Estación Montoya
  (`estacion-montoya.mjs`) se generan completos desde su propio módulo; García,
  desde `edificio-garcia.mjs`.
- `npm run build:all` termina con `optimize-web.mjs`, que escribe
  `recorrido-narrativo/models/web/<slug>.glb`: partes fusionadas por rol y
  material, vértices soldados, cuantización y `EXT_meshopt_compression`. Los GLB
  canónicos no cambian; el recorrido carga la copia web y, si falla, el canónico.
  Tras regenerar, actualizar `MODEL_VERSIONS` en `recorrido-narrativo/main.js`
  (la prueba estática compara cada valor con el SHA-256 de la copia web).
- `review.html?modelo=<slug>` (servido desde la raíz del repositorio) muestra
  frente, isométrica, lateral y posterior junto a las fotos de referencia, y
  cuenta triángulos degenerados y normales invertidas. `&src=<ruta.glb>` revisa
  un GLB de prueba; `&v=2` agranda dos vistas.
- `og-card.html` compone la imagen para compartir (`recorrido-narrativo/og.jpg`).

## Convenciones

- Metros, eje Y arriba y suelo en `y = 0`.
- Origen en el centro del lote; la fachada principal mira hacia `+z`.
- Presupuesto por GLB: máximo 100 000 triángulos y 8 MB.
- Cada parte produce un nodo de malla con nombre semántico en español.
- La app normaliza el tamaño de exhibición; se conservan las proporciones físicas.
- Material puede ser una clave de paleta o un color hexadecimal `#rrggbb`.

Paleta: `piedra` `#cfc6b2`, `ladrillo` `#b3653f`, `stucco` `#d9cfae`,
`concreto` `#9aa0a6`, `metal` `#667584`, `madera` `#8a6844`,
`vidrio` `#3f7f86`, `teja` `#4a5560` y `pasto` `#5f7350`.

## Esquema de escena

```json
{
  "slug": "ejemplo",
  "name": "Nombre del edificio",
  "frontAxis": "+z",
  "parts": [
    {
      "type": "box",
      "name": "Cuerpo principal",
      "material": "stucco",
      "role": "building",
      "evidence": "documented",
      "p": [0, 2, 0],
      "s": [8, 4, 5],
      "r": [0, 0, 0],
      "taper": 1
    }
  ]
}
```

Campos de escena:

| campo | requisito | significado |
|---|---|---|
| `slug` | obligatorio | Uno de los trece slugs canónicos y el mismo nombre base del JSON. |
| `name` | obligatorio | Nombre no vacío del edificio; se serializa en `scene.extras`. |
| `frontAxis` | obligatorio | Siempre `"+z"`; se serializa y valida en el GLB. |
| `parts` | obligatorio | Arreglo no vacío de partes declarativas. |

Campos comunes de cada parte:

| campo | requisito | significado |
|---|---|---|
| `type` | obligatorio | Una de las 17 formas admitidas. |
| `name` | obligatorio | Nombre semántico no vacío; pasa al nombre del nodo GLB. |
| `material` | obligatorio | Clave de paleta o hexadecimal. |
| `role` | obligatorio | `building` para arquitectura exhibida o `context` para suelo/plaza/contexto; pasa a `node.extras`. |
| `evidence` | obligatorio | `documented`, `inferred` o `evocative`; pasa a `node.extras`. |
| `p` | opcional | Vector `[x,y,z]` de posición; por defecto `[0,0,0]`. La tabla de formas indica si Y es centro o base. |
| `s` | opcional | Vector `[ancho,alto,profundo]`; por defecto `[1,1,1]` en formas escaladas. |
| `r` | opcional | Euler XYZ en radianes para formas escaladas; por defecto `[0,0,0]`. |

El GLB también recibe `scene.extras = { slug, name, frontAxis, level: "L2" }`.
Los extras `role` y `evidence` permiten que el recorrido calcule el encuadre con
la arquitectura (`building`) sin dejar que plazas u otro contexto distorsionen
sus límites.

## Las 17 formas

Las cinco formas base son `box`, `gable`, `cyl`, `dome` y `colonnade`. Las doce
primitivas L2 añadidas son `hipRoof`, `arch`, `arcade`, `arcWall`, `curvedSlab`,
`windowGrid`, `reliefGrid`, `lattice`, `classicalColumn`, `bleacher`,
`curvedRoof` y `wedge`.

| `type` | posición / escala | parámetros propios y uso |
|---|---|---|
| `box` | `p` al centro; usa `s`,`r` | `taper` escala la cara superior (1 por defecto). Cuerpos, podios, cornisas y aletas. |
| `gable` | `p.y` es la base; usa `s`,`r` | `axis: "x"\|"z"` orienta la cumbrera (`x` por defecto). Cubiertas a dos aguas y frontones. |
| `cyl` | `p` al centro; usa `s`,`r` | `rad:[superior,inferior]` o `radius`; `seg` (14). Cilindros, conos, postes y tambores. |
| `dome` | `p.y` es la base; `s.x/z` son diámetros | `seg` (16), `rings` (5). Media cúpula. |
| `colonnade` | `p.y` es la base | `len`, `n`, `h`, `dep`, `pw`, `archH`, `axis`. Pilares repetidos y arquitrabe. |
| `hipRoof` | `p` al centro; usa `s`,`r` | `axis`, `ridge` entre 0 y 1. Cubierta cerrada a cuatro aguas. |
| `arch` | `p` al centro; usa `s`,`r` | `arch:"pointed"` para arco apuntado (redondo por defecto), `seg` (12). Panel arqueado macizo extruido. |
| `arcade` | `p.y` es la base | `len`, `n`, `h`, `dep`, `pw`, `axis`, `arch`, `seg`. Pilares y bandas de arco con vanos abiertos. |
| `arcWall` | `p` al centro; usa `s`,`r` | `start`, `sweep` en radianes, `innerRadius` (0.76), `seg` (14). Muro anular cerrado. |
| `curvedSlab` | `p` al centro; usa `s`,`r` | Igual que `arcWall`, con `innerRadius` 0.6 por defecto para una losa curva más profunda. |
| `windowGrid` | `p` al centro | `cell:[ancho,alto,fondo]`, `count:[columnas,filas]`, `gap:[x,y]`, `axis`. Retícula de vanos/cajas. |
| `reliefGrid` | `p` al centro; usa `s`,`r` | `panel:[x,y,z]`, `count`, `gap`, `offsets:[z…]`. Campo repetido de relieves con desfase determinista. |
| `lattice` | `p` al centro; usa `s`,`r` | `count:[columnas,filas]`, `bar` en unidades de escena. Celosía contenida dentro de `s`. |
| `classicalColumn` | `p` al centro | `s:[diámetro,altura,profundidad]`, `baseRatio`, `capRatio`, `seg`. Basa, fuste, capitel y ábacos simplificados. |
| `bleacher` | `p` al centro; usa `s`,`r` | `steps` (6). Gradería cerrada escalonada. |
| `curvedRoof` | `p` al centro; usa `s`,`r` | `seg` (14), `rise` entre 0 y 1 (0.25). Cubierta cerrada de perfil parabólico extruida sobre X. |
| `wedge` | `p` al centro; usa `s`,`r` | `slopeAxis:"x"\|"z"` (`x` por defecto). Prisma triangular para pendientes y frontones bajos. |

`axis` cambia el eje longitudinal de las primitivas que lo admiten;
`slopeAxis` pertenece únicamente a `wedge`. Los arreglos de `count`, `cell`,
`gap`, `panel` y `offsets` no son vec3 y se interpretan como indica la tabla.

## Flujo por edificio

1. Leer `layers.forma`, `massing`, historia, evidencia y limitaciones en
   `buildings.ts`.
2. Abrir las fotos y `credits.json`; distinguir lo documentado de lo inferido.
3. Escribir o corregir `scenes/<slug>.json`, primero proporciones y luego rasgos.
4. Ejecutar las pruebas y una construcción individual; validar el GLB.
5. Comparar las vistas isométrica, frontal (`--az 90`) y lateral con las fotos.
6. Ejecutar `npm run build:all` para sincronizar ambos destinos y luego
   `npm run validate:all` como comprobación independiente.

## Lista de control

- [ ] Silueta, número de niveles, cubiertas y rasgos identitarios concuerdan con las vistas.
- [ ] Fachada principal hacia `+z`; base en `y = 0`; nada flota ni atraviesa el suelo.
- [ ] Cada parte tiene `name`, `role` y `evidence` correctos.
- [ ] Interiores, fachadas ocultas y remates no fotografiados permanecen neutros o inferidos.
- [ ] No se inventan detalles para convertir una reconstrucción interpretativa en una falsa precisión.
- [ ] `npm test`, `npm run build:all` y `npm run validate:all` terminan sin fallas.

## Reporte por edificio

```text
slug: <slug>
glb: <ruta> (<KB>, <triángulos>, <partes>)
fuentes: <fotos/credits.json y qué sustentan>
evidencia: <partes documented/inferred/evocative>
limitaciones: <fachadas, cubierta, interior o detalle no comprobado>
```
