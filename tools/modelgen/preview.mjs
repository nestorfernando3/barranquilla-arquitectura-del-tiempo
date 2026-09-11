#!/usr/bin/env node
/**
 * preview.mjs — vista previa SVG ortográfica de una escena JSON, sin WebGL.
 *
 * Uso: node preview.mjs scenes/<slug>.json out.svg [--az 35] [--el 22]
 *
 * Pinta los triángulos con sombreado Lambert y orden del pintor: suficiente
 * para comparar silueta y masas contra fotografías de referencia.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { buildScene } from "./lib.mjs";

const args = process.argv.slice(2);
const scenePath = args[0];
const outPath = args[1] ?? "preview.svg";
let az = 35, el = 22;
for (let i = 2; i < args.length; i++) {
  if (args[i] === "--az") az = +args[i + 1];
  if (args[i] === "--el") el = +args[i + 1];
}
if (!scenePath) { console.error("Uso: node preview.mjs scenes/<slug>.json out.svg [--az 35] [--el 22]"); process.exit(2); }

const scene = JSON.parse(readFileSync(scenePath, "utf8"));
const groups = buildScene(scene);

// Cámara orbital alrededor del centroide
let cx = 0, cy = 0, cz = 0, n = 0;
let maxR = 0;
const allTris = [];
for (const g of groups) {
  const P = g.positions;
  for (let i = 0; i < P.length; i += 9) {
    for (let k = 0; k < 9; k += 3) {
      cx += P[i + k]; cy += P[i + k + 1]; cz += P[i + k + 2]; n++;
    }
    allTris.push({ g, o: i });
  }
}
cx /= n; cy /= n; cz /= n;
for (const g of groups) for (let i = 0; i < g.positions.length; i += 3) {
  const dx = g.positions[i] - cx, dy = g.positions[i + 1] - cy, dz = g.positions[i + 2] - cz;
  maxR = Math.max(maxR, Math.hypot(dx, dy, dz));
}

const azR = (az * Math.PI) / 180, elR = (el * Math.PI) / 180;
const cosA = Math.cos(azR), sinA = Math.sin(azR), cosE = Math.cos(elR), sinE = Math.sin(elR);
// Base de cámara ortonormal: fwd hacia el origen; up = fwd × right
const fwd = [-cosE * cosA, -sinE, -cosE * sinA];
const right = [-sinA, 0, cosA];
const up = [
  -sinE * cosA,
  cosE,
  -sinE * sinA,
];

function project(p) {
  const d = [p[0] - cx, p[1] - cy, p[2] - cz];
  return [
    d[0] * right[0] + d[1] * right[1] + d[2] * right[2],
    -(d[0] * up[0] + d[1] * up[1] + d[2] * up[2]),
    d[0] * fwd[0] + d[1] * fwd[1] + d[2] * fwd[2],
  ];
}

const SIZE = 900, PAD = 60, SCALE = (SIZE - 2 * PAD) / (2.15 * maxR);
const polys = [];
for (const t of allTris) {
  const P = t.g.positions;
  const vs = [];
  let depth = 0;
  for (let k = 0; k < 9; k += 3) {
    const pr = project([P[t.o + k], P[t.o + k + 1], P[t.o + k + 2]]);
    vs.push([(SIZE / 2 + pr[0] * SCALE).toFixed(1), (SIZE / 2 + pr[1] * SCALE).toFixed(1)]);
    depth += pr[2];
  }
  // Lambert con luz desde la cámara arriba-izquierda
  const nx = t.g.normals[t.o], ny = t.g.normals[t.o + 1], nz = t.g.normals[t.o + 2];
  const lam = Math.max(0, nx * -fwd[0] + ny * -fwd[1] + nz * -fwd[2]);
  const shade = 0.45 + 0.55 * lam;
  const h = t.g.color.replace("#", "");
  const r = Math.round(parseInt(h.slice(0, 2), 16) * shade);
  const g = Math.round(parseInt(h.slice(2, 4), 16) * shade);
  const b = Math.round(parseInt(h.slice(4, 6), 16) * shade);
  polys.push({ depth: depth / 3, points: vs, fill: `rgb(${r},${g},${b})` });
}
polys.sort((a, b2) => b2.depth - a.depth);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
<rect width="${SIZE}" height="${SIZE}" fill="#14161a"/>
<text x="14" y="26" fill="#8a93a3" font-family="monospace" font-size="15">${scene.slug ?? ""} · az ${az}° el ${el}°</text>
<g stroke="#00000022" stroke-width="0.5">
${polys.map((p) => `<polygon points="${p.points.map((v) => v.join(",")).join(" ")}" fill="${p.fill}"/>`).join("\n")}
</g>
</svg>`;
writeFileSync(outPath, svg);
console.log(`OK ${outPath} — ${polys.length} triángulos dibujados`);
