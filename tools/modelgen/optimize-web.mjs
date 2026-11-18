/**
 * Copias web de los GLB validados: recorrido-narrativo/models/web/<slug>.glb
 *
 * Los GLB canónicos (una malla por parte semántica) no se modifican. Para la
 * entrega web se fusionan las partes por rol (building/context) y material, se
 * sueldan vértices idénticos y se comprime con EXT_meshopt_compression. El
 * recorrido conserva el rol en node.extras, que es lo único que usa para
 * encuadrar; los nombres semánticos y la evidencia por parte quedan en el
 * canónico. Uso: node optimize-web.mjs
 */
import { mkdir, readdir, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Document, NodeIO, Logger } from "@gltf-transform/core";
import { EXTMeshoptCompression, KHRMeshQuantization } from "@gltf-transform/extensions";
import { weld, reorder, quantize, meshopt, prune, dedup } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const sourceDir = join(root, "recorrido-narrativo/models");
const outDir = join(sourceDir, "web");

await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions([EXTMeshoptCompression, KHRMeshQuantization])
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder, "meshopt.decoder": MeshoptDecoder });

/** Fusiona todas las primitivas por (rol, material) en un documento nuevo. */
function mergeByRoleAndMaterial(source) {
  const doc = new Document().setLogger(new Logger(Logger.Verbosity.WARN));
  const srcScene = source.getRoot().getDefaultScene() ?? source.getRoot().listScenes()[0];
  const scene = doc.createScene(srcScene.getName()).setExtras({ ...srcScene.getExtras(), web: true });
  const buffer = doc.createBuffer();
  const groups = new Map();
  const materials = new Map();
  srcScene.traverse((node) => {
    const mesh = node.getMesh();
    if (!mesh) return;
    const { role = "building", evidence } = node.getExtras();
    for (const prim of mesh.listPrimitives()) {
      const mat = prim.getMaterial();
      const key = `${role}|${mat.getName()}`;
      if (!materials.has(mat.getName())) {
        materials.set(mat.getName(), doc.createMaterial(mat.getName())
          .setBaseColorFactor(mat.getBaseColorFactor())
          .setRoughnessFactor(mat.getRoughnessFactor())
          .setMetallicFactor(mat.getMetallicFactor())
          .setDoubleSided(mat.getDoubleSided()));
      }
      const g = groups.get(key) ?? { role, material: mat.getName(), pos: [], nrm: [], evidence: new Set() };
      if (evidence) g.evidence.add(evidence);
      const m = node.getWorldMatrix();
      const identity = m.every((v, i) => Math.abs(v - (i % 5 === 0 ? 1 : 0)) < 1e-9);
      if (!identity) throw new Error(`Nodo con transformación no plana: ${node.getName()}`);
      const p = prim.getAttribute("POSITION").getArray();
      const n = prim.getAttribute("NORMAL").getArray();
      const idx = prim.getIndices()?.getArray();
      const count = idx ? idx.length : p.length / 3;
      for (let i = 0; i < count; i++) {
        const v = idx ? idx[i] : i;
        g.pos.push(p[v * 3], p[v * 3 + 1], p[v * 3 + 2]);
        g.nrm.push(n[v * 3], n[v * 3 + 1], n[v * 3 + 2]);
      }
      groups.set(key, g);
    }
  });
  for (const g of groups.values()) {
    const positions = new Float32Array(g.pos);
    const prim = doc.createPrimitive()
      .setMaterial(materials.get(g.material))
      .setAttribute("POSITION", doc.createAccessor().setType("VEC3").setArray(positions).setBuffer(buffer))
      .setAttribute("NORMAL", doc.createAccessor().setType("VEC3").setArray(new Float32Array(g.nrm)).setBuffer(buffer));
    const label = g.role === "context" ? "contexto" : "edificio";
    const node = doc.createNode(`${label} · ${g.material}`)
      .setExtras({ role: g.role, evidence: [...g.evidence].sort() })
      .setMesh(doc.createMesh(`${label} · ${g.material}`).addPrimitive(prim));
    scene.addChild(node);
  }
  doc.getRoot().setDefaultScene(scene);
  doc.getRoot().getAsset().generator = "bq-modelgen procedural L2 · web";
  return doc;
}

await mkdir(outDir, { recursive: true });
const files = (await readdir(sourceDir)).filter((f) => f.endsWith(".glb")).sort();
let before = 0, after = 0;
for (const file of files) {
  const source = await io.read(join(sourceDir, file));
  const doc = mergeByRoleAndMaterial(source);
  await doc.transform(
    weld(),
    dedup(),
    prune(),
    reorder({ encoder: MeshoptEncoder }),
    quantize({ quantizePosition: 14, quantizeNormal: 8 }),
    meshopt({ encoder: MeshoptEncoder, level: "high" }),
  );
  const out = join(outDir, file);
  await io.write(out, doc);
  const a = (await stat(join(sourceDir, file))).size, b = (await stat(out)).size;
  before += a; after += b;
  const nodes = doc.getRoot().listNodes().length;
  console.log(`${file.padEnd(32)} ${(a / 1024).toFixed(0).padStart(6)} KB → ${(b / 1024).toFixed(0).padStart(5)} KB · ${nodes} mallas`);
}
console.log(`TOTAL ${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(2)} MB`);
