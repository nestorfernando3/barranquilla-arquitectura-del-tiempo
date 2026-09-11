# Barranquilla · Arquitectura del tiempo

Recorrido narrativo y 3D por la memoria arquitectónica de Barranquilla: trece
edificios, cuatro actos y una sola orilla.

## Experiencia

- [Abrir el recorrido en GitHub Pages](./recorrido-narrativo/)
- [Ver el código del recorrido](./recorrido-narrativo/)
- [Explorar el atlas React](./interactive-3d-temporal-map/)
- [Consultar fuentes y procedencia de los modelos](./docs/MODELOS-3D-FUENTES.md)

La entrada raíz redirige al recorrido narrativo y conserva rutas como
`#/recorrido` y `#parada=cine-rex`.

## Ejecutar localmente

El recorrido narrativo es estático y necesita un servidor HTTP para cargar los
modelos GLB:

```bash
python3 -m http.server 4175
```

Abra `http://127.0.0.1:4175/recorrido-narrativo/`.

El atlas React se desarrolla desde `interactive-3d-temporal-map/`:

```bash
npm install
npm run dev
```

## Modelos y método

Los modelos 3D son reconstrucciones interpretativas procedurales informadas por
fotografías con licencia libre o de dominio público. No son levantamientos
arquitectónicos ni afirman precisión métrica. Cada parada conserva su relato,
fuentes y nivel de evidencia; si WebGL o un modelo no está disponible, el texto
permanece accesible.

## Licencia y atribuciones

Las fotografías de referencia y sus licencias están registradas en
`assets/reference-images/`. Las atribuciones de cada edificio se detallan en
`docs/MODELOS-3D-FUENTES.md`.
